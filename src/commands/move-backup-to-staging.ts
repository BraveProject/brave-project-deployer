import { Command, Option } from '@vortecx/cli-forger'
import { Extensions } from '../extensions'

const moveBackupToStagingCommand = Command.create<
  { appversion: string },
  Extensions
>({
  name: 'Bakcup to staging',
  description: 'Move a backup version to staging folder',
  aliases: ['bts'],
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

moveBackupToStagingCommand.addHandler(async ({ args, workers }) => {
  const { appversion } = args
  const { getBackupFolder, getCurrentStagingFolder } = workers.extensions

  if (!appversion) {
    return workers.logger.exit.error('[X] Define a version to be moved')
  }

  const backupFolder = getBackupFolder()
  const currentStagingFolder = getCurrentStagingFolder()

  const versionsInStagingFolder =
    await workers.folders.getDirectories(currentStagingFolder)
  if (versionsInStagingFolder.length !== 0) {
    return workers.logger.exit.error(
      '[X] Already exists one version in staging! Move this version first to add other',
    )
  }

  const versionInBackupFolder = workers.path.getPath([backupFolder, appversion])
  const versionInBackupFolderExists = await workers.folders.exists(
    versionInBackupFolder,
  )

  if (!versionInBackupFolderExists) {
    return workers.logger.exit.error(
      '[X] Not found version to be moved in backup folder',
    )
  }

  workers.logger.info(`[*] Moving ${appversion} to staging fodler`)
  workers.prompt.executeInFolder(
    backupFolder,
    `mv ${versionInBackupFolder} ${currentStagingFolder}`,
    false,
  )

  workers.logger.info(`[V] Moved ${appversion} to staging fodler`)
})

export { moveBackupToStagingCommand }
