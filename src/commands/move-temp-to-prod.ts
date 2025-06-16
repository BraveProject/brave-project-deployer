import { Command, Option } from '@vortecx/cli-forger'
import { Extensions } from '../extensions'

const moveTempToProdCommand = Command.create<
  { appversion: string },
  Extensions
>({
  name: 'Temp to prod',
  description: 'Move a temp version to production folder',
  aliases: ['ttp'],
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

moveTempToProdCommand.addHandler(async ({ args, workers }) => {
  const { appversion } = args
  const { getTempFolder, getCurrentProdFolder } = workers.extensions

  if (!appversion) {
    return workers.logger.exit.error('[X] Define a version to be moved')
  }

  const tempFolder = getTempFolder()
  const currentProdFolder = getCurrentProdFolder()

  const versionsInProdFolder =
    await workers.folders.getDirectories(currentProdFolder)
  if (versionsInProdFolder.length !== 0) {
    return workers.logger.exit.error(
      '[X] Already exists one version in production! Move this version first to add other',
    )
  }

  const versionInTempFolder = workers.path.getPath([tempFolder, appversion])
  const versionInTempFolderExistse =
    await workers.folders.exists(versionInTempFolder)

  if (!versionInTempFolderExistse) {
    return workers.logger.exit.error(
      '[X] Not found version to be moved in temp folder',
    )
  }

  workers.logger.info(`[*] Moving ${appversion} to production fodler`)
  workers.prompt.executeInFolder(
    tempFolder,
    `mv ${versionInTempFolder} ${currentProdFolder}`,
    false,
  )

  workers.logger.info(`[V] Moved ${appversion} to production fodler`)
})

export { moveTempToProdCommand }
