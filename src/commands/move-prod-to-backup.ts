import { Command, Option } from '@vortecx/cli-forger'
import { Extensions } from '../extensions'

const moveProdToBackupCommand = Command.create<
  { appversion: string },
  Extensions
>({
  name: 'Prod to backup',
  description: 'Move a production version to backup folder',
  aliases: ['ptb'],
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

moveProdToBackupCommand.addHandler(async ({ args, workers }) => {
  const { appversion } = args
  const { getCurrentProdFolder, getBackupFolder } = workers.extensions

  if (!appversion) {
    return workers.logger.exit.error('[X] Define a version to be moved')
  }

  const currentProdFolder = getCurrentProdFolder()
  const backupFolder = getBackupFolder()

  const versionInProdFolder = workers.path.getPath([
    currentProdFolder,
    appversion,
  ])
  const versionInProdFolderExists =
    await workers.folders.exists(versionInProdFolder)

  if (!versionInProdFolderExists) {
    return workers.logger.exit.error(
      '[X] Not found version to be moved in production folder',
    )
  }

  workers.logger.info(`[*] Moving ${appversion} to backup fodler`)
  workers.prompt.executeInFolder(
    currentProdFolder,
    `mv ${versionInProdFolder} ${backupFolder}`,
    false,
  )

  workers.logger.info(`[V] Moved ${appversion} to backup fodler`)
})

export { moveProdToBackupCommand }
