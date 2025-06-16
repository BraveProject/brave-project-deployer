import { Command, Option } from '@vortecx/cli-forger'
import { Extensions } from '../extensions'
import { basename } from 'path'

const deployProductionCommand = Command.create<
  { appversion: string; folder: 'backup' | 'staging' | 'temp' },
  Extensions
>({
  name: 'Deploy production',
  description: 'Deploy a new version to production',
  aliases: ['dp'],
  options: [
    Option.create({
      name: 'version',
      description: 'Define a version to be deployed to staging',
      required: true,
      long: 'appversion',
      short: 'av',
    }),
    Option.create({
      name: 'folder',
      description:
        'Define a folder whare version is located. Default: "staging", Valid: "staging" | "temp" | "backup"',
      required: false,
      long: 'folder',
      short: 'f',
      defaultValue: 'staging',
    }),
  ],
})

deployProductionCommand.addHandler(async ({ args, workers }) => {
  const { appversion, folder } = args
  const {
    getDeployFolder,
    getDeployedProdFolder,
    getCurrentProdFolder,
    getCurrentWaitFolder,
    getCurrentStagingFolder,
    getBackupFolder,
    getTempFolder,
  } = workers.extensions

  const accepetdFolders = ['temp', 'backup', 'staging']

  if (!appversion) {
    return workers.logger.exit.error('[X] Define a version to be deployed')
  }

  if (!accepetdFolders.includes(folder)) {
    return workers.logger.exit.error(
      '[X] Define a valid folder to find new version -> "staging" | "temp" | "backup"',
    )
  }

  const deployFolder = getDeployFolder()
  const currentProdFolder = getCurrentProdFolder()
  const currentWaitFolder = getCurrentWaitFolder()
  const currentStagingFolder = getCurrentStagingFolder()
  const backupFolder = getBackupFolder()
  const tempFolder = getTempFolder()

  const versionExists = await workers.folders.exists([
    folder === 'staging'
      ? currentStagingFolder
      : folder === 'backup'
        ? backupFolder
        : tempFolder,
    appversion,
  ])

  if (!versionExists) {
    return workers.logger.exit.error(
      `[X] Cant be find version ${appversion} in ${folder} folder`,
    )
  }

  workers.logger.info(
    `[*] Finded version ${appversion} in ${folder}. Preparing to deploy`,
  )

  const newDeployedProdFolder = workers.path.getPath([
    currentProdFolder,
    appversion,
  ])

  const deployedProdFolder = await getDeployedProdFolder()
  let deployedProdVersion = ''

  if (deployedProdFolder) {
    deployedProdVersion = basename(deployedProdFolder)

    workers.logger.warn(
      `[!] Identified version ${deployedProdVersion} running in produciton`,
    )

    workers.logger.warn(`[!] Moving to wait folder to wait new deploy`)
    workers.prompt.executeInFolder(
      currentProdFolder,
      `mv ${currentProdFolder}/${deployedProdVersion} ${currentWaitFolder}`,
      false,
    )

    workers.logger.warn(
      `[!] Version ${deployedProdVersion} moved to wait folder and after new deploy are be moved for backup folder`,
    )
    workers.logger.warn(`[!] In faliure case are be moved to production folder`)
  }

  const commandMapper = {
    staging: {
      tp: 'stp',
      back: currentStagingFolder,
    },
    backup: {
      tp: 'btp',
      back: backupFolder,
    },
    temp: {
      tp: 'ttp',
      back: tempFolder,
    },
  }

  workers.logger.info(
    `[*] Moving version ${appversion} in ${folder} to production folder`,
  )

  workers.prompt.executeInFolder(
    currentProdFolder,
    `brave ${commandMapper[folder].tp} -av ${appversion}`,
    false,
  )

  workers.logger.info(`[*] Coping .env to environment`)
  workers.prompt.executeInFolder(
    deployFolder,
    `cp .env ${newDeployedProdFolder}/dist`,
    false,
  )

  workers.logger.info(`[*] Starting docker deploy of version ${appversion}`)

  try {
    workers.prompt.executeInFolder(
      newDeployedProdFolder,
      'docker compose --project-name brave-production -f ./dist/docker-compose.yml up -d --build --force-recreate',
      false,
    )

    if (deployedProdVersion) {
      workers.logger.info(`[*] Moving old version to backup`)
      workers.prompt.executeInFolder(
        currentWaitFolder,
        `mv ./${deployedProdVersion} ${backupFolder}`,
        false,
      )
    }

    workers.logger.info(`[*] Excluding inutils docker files`)
    workers.prompt.executeInFolder(
      currentWaitFolder,
      'docker system prune -a -f',
    )

    workers.logger.info(`[V] Deploy succesfuly > v-${appversion}`)
    workers.logger.info(`[V] Finish!`)
  } catch (err) {
    workers.logger.error(`[X] Deploy failed. Rollback changes initialized`)

    workers.logger.info(
      `[*] Moving version ${appversion} back to ${folder} folder`,
    )
    workers.prompt.executeInFolder(
      currentProdFolder,
      `mv ${currentProdFolder}/${appversion} ${commandMapper[folder].back}`,
      false,
    )

    if (!deployedProdVersion) {
      workers.logger.warn(`[X] No Rollback found`)
      workers.logger.error(`[X] New deploy failed > v-${appversion}`)
      workers.logger.error(`[X] Finish!`)
      workers.logger.exit.error(err)
      return
    }

    if (deployedProdVersion) {
      workers.logger.info(
        `[*] Moving version ${deployedProdVersion} back to production`,
      )
      workers.prompt.executeInFolder(
        currentWaitFolder,
        `mv ${currentWaitFolder}/${deployedProdVersion} ${currentProdFolder}`,
        false,
      )

      workers.logger.info(
        `[*] Start deploy of recovery version ${deployedProdVersion}`,
      )

      try {
        workers.prompt.executeInFolder(
          deployedProdFolder,
          'docker compose --project-name brave-production -f ./dist/docker-compose.yml up -d --build --force-recreate',
          false,
        )

        workers.logger.info(`[*] Excluding inutils docker files`)
        workers.prompt.executeInFolder(
          currentWaitFolder,
          'docker system prune -a -f',
        )

        workers.logger.info(
          `[V] Deploy rollback succesfuly > v-${deployedProdVersion}`,
        )
        workers.logger.error(`[X] New deploy failed > v-${appversion}`)
        workers.logger.error(`[X] Finish!`)

        workers.logger.exit.error(err)
      } catch (error) {
        workers.logger.error(
          `[X] Deploy of rollback failed > v-${deployedProdVersion}`,
        )
        workers.logger.error(`[X] New deploy failed > v-${appversion}`)
        workers.logger.error(`[X] Finish!`)
        workers.logger.exit.error(error)
      }
    }
  }
})

export { deployProductionCommand }
