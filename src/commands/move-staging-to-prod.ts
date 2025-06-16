import { Command, Option } from '@vortecx/cli-forger'
import { Extensions } from '../extensions'

const moveStagingToProdCommand = Command.create<
  { appversion: string },
  Extensions
>({
  name: 'Staging to prod',
  description: 'Move a staging version to production folder',
  aliases: ['stp'],
  options: [
    Option.create({
      name: 'version',
      description: 'Define a version to be moved',
      required: true,
      long: 'appversion',
      short: 'av',
    }),
  ],
})

moveStagingToProdCommand.addHandler(async ({ args, workers }) => {
  const { appversion } = args
  const { getCurrentStagingFolder, getCurrentProdFolder } = workers.extensions

  if (!appversion) {
    return workers.logger.exit.error('[X] Define a version to be moved')
  }

  const currentStagingFolder = getCurrentStagingFolder()
  const currentProdFolder = getCurrentProdFolder()

  const versionsInProdFolder =
    await workers.folders.getDirectories(currentProdFolder)
  if (versionsInProdFolder.length !== 0) {
    return workers.logger.exit.error(
      '[X] Already exists one version in production! Move this version first to add other',
    )
  }

  const versionInStagingFolder = workers.path.getPath([
    currentStagingFolder,
    appversion,
  ])
  const versionInStagingFolderExists = await workers.folders.exists(
    versionInStagingFolder,
  )

  if (!versionInStagingFolderExists) {
    return workers.logger.exit.error(
      '[X] Not found version to be moved in staging folder',
    )
  }

  workers.logger.info(`[*] Moving ${appversion} to production fodler`)
  workers.prompt.executeInFolder(
    currentStagingFolder,
    `mv ${versionInStagingFolder} ${currentProdFolder}`,
    false,
  )

  workers.logger.info(`[V] Moved ${appversion} to production fodler`)
})

export { moveStagingToProdCommand }
