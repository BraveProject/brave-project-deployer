import { Command, Option } from '@vortecx/cli-forger'
import { Extensions } from '../extensions'
import { basename } from 'path'

const deployStagingCommand = Command.create<
  { appversion: string; folder: 'backup' | 'temp' },
  Extensions
>({
  name: 'Deploy staging',
  description: 'Deploy a new version to staging',
  aliases: ['ds'],
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
        'Define a folder whare version is located. Default: "temp", Valid: "temp" | "backup"',
      required: false,
      long: 'folder',
      short: 'f',
      defaultValue: 'temp',
    }),
  ],
})

deployStagingCommand.addHandler(async ({ args, workers }) => {
  const { appversion, folder } = args
  const {
    getDeployFolder,
    getDeployedStagingFolder,
    getCurrentWaitFolder,
    getCurrentStagingFolder,
    getBackupFolder,
    getTempFolder,
  } = workers.extensions

  const accepetdFolders = ['temp', 'backup']

  if (!appversion) {
    return workers.logger.exit.error('[X] Define a version to be deployed')
  }

  if (!accepetdFolders.includes(folder)) {
    return workers.logger.exit.error(
      '[X] Define a valid folder to find new version ->  "temp" | "backup"',
    )
  }

  const deployFolder = getDeployFolder()
  const currentWaitFolder = getCurrentWaitFolder()
  const currentStagingFolder = getCurrentStagingFolder()
  const backupFolder = getBackupFolder()
  const tempFolder = getTempFolder()

  const versionExists = await workers.folders.exists([
    folder === 'temp' ? tempFolder : backupFolder,
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

  const newDeployedStagingFolder = workers.path.getPath([
    currentStagingFolder,
    appversion,
  ])

  const deployedStagingFolder = await getDeployedStagingFolder()
  let deployedStagingVersion = ''

  if (deployedStagingFolder) {
    deployedStagingVersion = basename(deployedStagingFolder)

    workers.logger.warn(
      `[!] Identified version ${deployedStagingVersion} running in staging`,
    )

    workers.logger.warn(`[!] Moving to wait folder to wait new deploy`)
    workers.prompt.executeInFolder(
      currentStagingFolder,
      `mv ${currentStagingFolder}/${deployedStagingVersion} ${currentWaitFolder}`,
      false,
    )

    workers.logger.warn(
      `[!] Version ${deployedStagingVersion} moved to wait folder and after new deploy are be moved for backup folder`,
    )
    workers.logger.warn(`[!] In faliure case are be moved to staging folder`)
  }

  const commandMapper = {
    backup: {
      tp: 'bts',
      back: backupFolder,
    },
    temp: {
      tp: 'tts',
      back: tempFolder,
    },
  }

  workers.logger.info(
    `[*] Moving version ${appversion} in ${folder} to staging folder`,
  )

  workers.prompt.executeInFolder(
    currentStagingFolder,
    `brave ${commandMapper[folder].tp} -av ${appversion}`,
    false,
  )

  workers.logger.info(`[*] Coping .env.staging to environment`)
  workers.prompt.executeInFolder(
    deployFolder,
    `cp .env.staging ${newDeployedStagingFolder}/dist`,
    false,
  )

  workers.logger.info(`[*] Starting docker deploy of version ${appversion}`)

  try {
    workers.prompt.executeInFolder(
      newDeployedStagingFolder,
      'docker compose --project-name brave-staging -f ./dist/docker-compose.staging.yml up -d --build --force-recreate',
      false,
    )

    if (deployedStagingVersion) {
      workers.logger.info(`[*] Moving old version to backup`)
      workers.prompt.executeInFolder(
        currentWaitFolder,
        `mv ./${deployedStagingVersion} ${backupFolder}`,
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
      currentStagingFolder,
      `mv ${currentStagingFolder}/${appversion} ${commandMapper[folder].back}`,
      false,
    )

    if (!deployedStagingVersion) {
      workers.logger.warn(`[X] No Rollback found`)
      workers.logger.error(`[X] New deploy failed > v-${appversion}`)
      workers.logger.error(`[X] Finish!`)
      workers.logger.exit.error(err)
      return
    }

    if (deployedStagingVersion) {
      workers.logger.info(
        `[*] Moving version ${deployedStagingVersion} back to staging`,
      )
      workers.prompt.executeInFolder(
        currentWaitFolder,
        `mv ${currentWaitFolder}/${deployedStagingVersion} ${currentStagingFolder}`,
        false,
      )

      workers.logger.info(
        `[*] Start deploy of recovery version ${deployedStagingVersion}`,
      )

      try {
        workers.prompt.executeInFolder(
          deployedStagingFolder,
          'docker compose --project-name brave-staging -f ./dist/docker-compose.staging.yml up -d --build --force-recreate',
          false,
        )

        workers.logger.info(`[*] Excluding inutils docker files`)
        workers.prompt.executeInFolder(
          currentWaitFolder,
          'docker system prune -a -f',
        )

        workers.logger.info(
          `[V] Deploy rollback succesfuly > v-${deployedStagingVersion}`,
        )
        workers.logger.error(`[X] New deploy failed > v-${appversion}`)
        workers.logger.error(`[X] Finish!`)

        workers.logger.exit.error(err)
      } catch (error) {
        workers.logger.error(
          `[X] Deploy of rollback failed > v-${deployedStagingVersion}`,
        )
        workers.logger.error(`[X] New deploy failed > v-${appversion}`)
        workers.logger.error(`[X] Finish!`)
        workers.logger.exit.error(error)
      }
    }
  }
})

export { deployStagingCommand }
