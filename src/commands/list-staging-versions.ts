import { Command } from '@vortecx/cli-forger'
import { Extensions } from '../extensions'
import { basename } from 'path'
import * as semver from 'semver'

const listStagingVersionsCommand = Command.create<unknown, Extensions>({
  name: 'List stgn versions',
  description: 'List versions in staging',
  aliases: ['ls'],
})

listStagingVersionsCommand.addHandler(async ({ workers }) => {
  const { getCurrentStagingFolder } = workers.extensions

  const stagingFolder = getCurrentStagingFolder()
  const versionsAvailablesPaths =
    await workers.folders.getDirectories(stagingFolder)

  if (versionsAvailablesPaths.length === 0) {
    return workers.logger.warn('[!] No versions in staging')
  }

  const versionsAvailable = versionsAvailablesPaths.map((version) =>
    basename(version),
  )

  workers.logger.info('[V] Versions in staging')
  versionsAvailable.sort(semver.compare).forEach((version) => {
    workers.logger.info(`[V] ${version}`)
  })
})

export { listStagingVersionsCommand }
