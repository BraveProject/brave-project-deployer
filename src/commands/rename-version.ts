import { Command, Option } from '@vortecx/cli-forger'
import { Extensions } from '../extensions'

const renameVersionCommand = Command.create<
  { appversion: string; newversion: string; folder: 'backup' | 'temp' },
  Extensions
>({
  name: 'Rename version',
  description: 'Rename a version existent on system',
  aliases: ['rv'],
  options: [
    Option.create({
      name: 'version',
      description: 'Define a version to be renamed',
      required: true,
      long: 'appversion',
      short: 'av',
    }),
    Option.create({
      name: 'new version',
      description: 'Define a new version to be renamed',
      required: true,
      long: 'newversion',
      short: 'nv',
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

renameVersionCommand.addHandler(async ({ args, workers }) => {
  const { appversion, newversion, folder } = args
  const { getBackupFolder, getTempFolder, listVersions } = workers.extensions

  const accepetdFolders = ['temp', 'backup']

  if (!appversion) {
    return workers.logger.exit.error('[X] Define a version to be renamed')
  }

  if (!newversion) {
    return workers.logger.exit.error('[X] Define a new version to be renamed')
  }

  if (appversion === newversion) {
    return workers.logger.exit.error(
      '[X] Define a diferents versions to be renamed',
    )
  }

  if (!accepetdFolders.includes(folder)) {
    return workers.logger.exit.error(
      '[X] Define a valid folder to find new version ->  "temp" | "backup"',
    )
  }

  const backupFolder = getBackupFolder()
  const tempFolder = getTempFolder()

  const versionExists = await workers.folders.exists([
    folder === 'temp' ? tempFolder : backupFolder,
    appversion,
  ])

  const versions = await listVersions()
  const allVersionsExistent = versions.all.map((v) => v.version)

  if (!versionExists) {
    return workers.logger.exit.error(
      `[X] Cant be find version ${appversion} in ${folder} folder`,
    )
  }

  if (allVersionsExistent.includes(newversion)) {
    return workers.logger.exit.error(`[X] Already exists version ${newversion}`)
  }

  workers.logger.info(
    `[*] Finded version ${appversion} in ${folder}. Preparing to rename`,
  )

  workers.logger.info(
    `[*] Move version ${appversion} in ${folder} to ${newversion} in ${folder}`,
  )
  workers.prompt.executeInFolder(
    folder === 'temp' ? tempFolder : backupFolder,
    `mv ${appversion} ${newversion}`,
    false,
  )

  workers.logger.info(`[*] Updating version package.json to ${newversion}`)
  const packageJSON = await workers.files.read([
    folder === 'temp' ? tempFolder : backupFolder,
    newversion,
    'dist',
    'package.json',
  ])

  packageJSON.set(newversion, 'version')

  workers.logger.info(`[*] Saving package.json`)
  await packageJSON.save()
  workers.logger.info(`[V] Finish!`)
})

export { renameVersionCommand }
