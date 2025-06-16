import { Command } from '@vortecx/cli-forger'
import { Extensions } from '../extensions'
import { basename } from 'path'
import * as semver from 'semver'

const listTempVersionsCommand = Command.create<unknown, Extensions>({
  name: 'List temp versions',
  description: 'List versions in temp folder',
  aliases: ['lt'],
})

listTempVersionsCommand.addHandler(async ({ workers }) => {
  const { getTempFolder } = workers.extensions

  const tempFolder = getTempFolder()
  const versionsAvailablesPaths =
    await workers.folders.getDirectories(tempFolder)

  if (versionsAvailablesPaths.length === 0) {
    return workers.logger.info('[V] No versions in temp folder')
  }

  const versionsAvailable = versionsAvailablesPaths.map((version) =>
    basename(version),
  )

  workers.logger.info('[V] Versions in temp folder')
  versionsAvailable.sort(semver.compare).forEach((version) => {
    workers.logger.info(`[V] ${version}`)
  })
})

export { listTempVersionsCommand }
