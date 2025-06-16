import { Command, Option } from '@vortecx/cli-forger'
import { Extensions } from '../extensions'

const moveBackupToProdCommand = Command.create<
  { appversion: string },
  Extensions
>({
  name: 'Bakcup to prod',
  description: 'Move a backup version to production folder',
  aliases: ['btp'],
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

moveBackupToProdCommand.addHandler(async ({ args, workers }) => {
  const { appversion } = args
  const { getBackupFolder, getCurrentProdFolder } = workers.extensions

  if (!appversion) {
    return workers.logger.exit.error('[X] Define a version to be moved')
  }

  const backupFolder = getBackupFolder()
  const currentProdFolder = getCurrentProdFolder()

  const versionsInProdFolder =
    await workers.folders.getDirectories(currentProdFolder)
  if (versionsInProdFolder.length !== 0) {
    return workers.logger.exit.error(
      '[X] Already exists one version in production! Move this version first to add other',
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

  workers.logger.info(`[*] Moving ${appversion} to production fodler`)
  workers.prompt.executeInFolder(
    backupFolder,
    `mv ${versionInBackupFolder} ${currentProdFolder}`,
    false,
  )

  workers.logger.info(`[V] Moved ${appversion} to production fodler`)
})

export { moveBackupToProdCommand }
