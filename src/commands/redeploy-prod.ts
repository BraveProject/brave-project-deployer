import { Command, Option } from '@vortecx/cli-forger'
import { Extensions } from '../extensions'

const redeployProdCommand = Command.create<{ appversion: string }, Extensions>({
  name: 'Redeploy production',
  description: 'Redeploy a version in production',
  aliases: ['rdp'],
  options: [
    Option.create({
      name: 'version',
      description: 'Define a version to be redeployed in production',
      required: true,
      long: 'appversion',
      short: 'av',
    }),
  ],
})

redeployProdCommand.addHandler(async ({ args, workers }) => {
  const { appversion } = args
  const { getDeployFolder, getCurrentProdFolder } = workers.extensions

  if (!appversion) {
    return workers.logger.exit.error('[X] Define a version to be redeployed')
  }

  const deployFolder = getDeployFolder()
  const currentProdFolder = getCurrentProdFolder()

  const versionExists = await workers.folders.exists([
    currentProdFolder,
    appversion,
  ])

  if (!versionExists) {
    return workers.logger.exit.error(
      `[X] Cant be find version ${appversion} in prod folder`,
    )
  }

  workers.logger.info(
    `[*] Finded version ${appversion} in prod. Preparing to redeploy`,
  )

  const versionToRedeployFolder = workers.path.getPath([
    currentProdFolder,
    appversion,
  ])

  workers.logger.info(`[*] Updating .env in environment`)
  workers.prompt.executeInFolder(
    versionToRedeployFolder,
    `rm ./dist/.env`,
    false,
  )

  workers.prompt.executeInFolder(
    deployFolder,
    `cp .env ${versionToRedeployFolder}/dist`,
    false,
  )

  workers.logger.info(`[*] Starting docker deploy of version ${appversion}`)

  try {
    workers.prompt.executeInFolder(
      versionToRedeployFolder,
      'docker compose --project-name brave-staging -f ./dist/docker-compose.yml up -d --build --force-recreate',
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

export { redeployProdCommand }
