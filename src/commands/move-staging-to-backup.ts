import { Command, Option } from '@vortecx/cli-forger'
import { Extensions } from '../extensions'

const moveStagingToBackupCommand = Command.create<
  { appversion: string },
  Extensions
>({
  name: 'Staging to backup',
  description: 'Move a staging version to backup folder',
  aliases: ['stb'],
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

moveStagingToBackupCommand.addHandler(async ({ args, workers }) => {
  const { appversion } = args
  const { getCurrentStagingFolder, getBackupFolder } = workers.extensions

  if (!appversion) {
    return workers.logger.exit.error('[X] Define a version to be moved')
  }

  const currentStagingFolder = getCurrentStagingFolder()
  const backupFolder = getBackupFolder()

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

  workers.logger.info(`[*] Moving ${appversion} to backup fodler`)
  workers.prompt.executeInFolder(
    currentStagingFolder,
    `mv ${versionInStagingFolder} ${backupFolder}`,
    false,
  )

  workers.logger.info(`[V] Moved ${appversion} to backup fodler`)
})

export { moveStagingToBackupCommand }
