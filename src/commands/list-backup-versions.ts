import { Command } from '@vortecx/cli-forger'
import { Extensions } from '../extensions'
import { basename } from 'path'
import * as semver from 'semver'

const listBackupVersionsCommand = Command.create<unknown, Extensions>({
  name: 'List bkp versions',
  description: 'List availables backup versions',
  aliases: ['lb'],
})

listBackupVersionsCommand.addHandler(async ({ workers }) => {
  const { getBackupFolder } = workers.extensions

  const backupFolder = getBackupFolder()
  const versionsAvailablesPaths =
    await workers.folders.getDirectories(backupFolder)

  if (versionsAvailablesPaths.length === 0) {
    return workers.logger.warn('[!] No backup versions available')
  }

  const versionsAvailable = versionsAvailablesPaths.map((version) =>
    basename(version),
  )

  workers.logger.info('[V] Backup versions available')
  versionsAvailable.sort(semver.compare).forEach((version) => {
    workers.logger.info(`[V] ${version}`)
  })
})

export { listBackupVersionsCommand }
