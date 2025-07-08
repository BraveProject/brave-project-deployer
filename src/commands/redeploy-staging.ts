import { Command, Option } from '@vortecx/cli-forger'
import { Extensions } from '../extensions'

const redeployStagingCommand = Command.create<
  { appversion: string },
  Extensions
>({
  name: 'Redeploy staging',
  description: 'Redeploy a version in staging',
  aliases: ['rds'],
  options: [
    Option.create({
      name: 'version',
      description: 'Define a version to be redeployed in staging',
      required: true,
      long: 'appversion',
      short: 'av',
    }),
  ],
})

redeployStagingCommand.addHandler(async ({ args, workers }) => {
  const { appversion } = args
  const { getDeployFolder, getCurrentStagingFolder } = workers.extensions

  if (!appversion) {
    return workers.logger.exit.error('[X] Define a version to be deployed')
  }

  const deployFolder = getDeployFolder()
  const currentStagingFolder = getCurrentStagingFolder()

  const versionExists = await workers.folders.exists([
    currentStagingFolder,
    appversion,
  ])

  if (!versionExists) {
    return workers.logger.exit.error(
      `[X] Cant be find version ${appversion} in staging folder`,
    )
  }

  workers.logger.info(
    `[*] Finded version ${appversion} in staging. Preparing to reredeploy`,
  )

  const versionToRedeployFolder = workers.path.getPath([
    currentStagingFolder,
    appversion,
  ])

  workers.logger.info(`[*] Updating .env.staging in environment`)
  workers.prompt.executeInFolder(
    versionToRedeployFolder,
    `rm ./dist/.env.staging`,
    false,
  )

  workers.prompt.executeInFolder(
    deployFolder,
    `cp .env.staging ${versionToRedeployFolder}/dist`,
    false,
  )

  workers.logger.info(`[*] Starting docker deploy of version ${appversion}`)

  try {
    workers.prompt.executeInFolder(
      versionToRedeployFolder,
      'docker compose --project-name brave-staging -f ./dist/docker-compose.staging.yml up -d --build --force-recreate',
      false,
    )

    workers.logger.info(`[*] Excluding inutils docker files`)
    workers.prompt.executeInFolder(
      versionToRedeployFolder,
      'docker system prune -a -f',
    )

    workers.logger.info(`[V] Redeploy succesfuly > v-${appversion}`)
    workers.logger.info(`[V] Finish!`)
  } catch (err) {
    workers.logger.error(`[X] Deploy failed.`)
  }
})

export { redeployStagingCommand }
