import { Command, Option } from '@vortecx/cli-forger'
import { Extensions } from '../extensions'

const moveTempToStagingCommand = Command.create<
  { appversion: string },
  Extensions
>({
  name: 'Temp to staging',
  description: 'Move a temp version to staging folder',
  aliases: ['tts'],
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

moveTempToStagingCommand.addHandler(async ({ args, workers }) => {
  const { appversion } = args
  const { getTempFolder, getCurrentStagingFolder } = workers.extensions

  if (!appversion) {
    return workers.logger.exit.error('[X] Define a version to be moved')
  }

  const tempFolder = getTempFolder()
  const currentStagingFolder = getCurrentStagingFolder()

  const versionsInStagingFolder =
    await workers.folders.getDirectories(currentStagingFolder)
  if (versionsInStagingFolder.length !== 0) {
    return workers.logger.exit.error(
      '[X] Already exists one version in staging! Move this version first to add other',
    )
  }

  const versionInTempFolder = workers.path.getPath([tempFolder, appversion])
  const versionIntempFolderExists =
    await workers.folders.exists(versionInTempFolder)

  if (!versionIntempFolderExists) {
    return workers.logger.exit.error(
      '[X] Not found version to be moved in temp folder',
    )
  }

  workers.logger.info(`[*] Moving ${appversion} to staging fodler`)
  workers.prompt.executeInFolder(
    tempFolder,
    `mv ${versionInTempFolder} ${currentStagingFolder}`,
    false,
  )

  workers.logger.info(`[V] Moved ${appversion} to staging fodler`)
})

export { moveTempToStagingCommand }
