import { Command } from '@vortecx/cli-forger'
import { Extensions } from '../extensions'
import { basename } from 'path'
import * as semver from 'semver'

const listProdVersionsCommand = Command.create<unknown, Extensions>({
  name: 'List prod versions',
  description: 'List versions in production',
  aliases: ['lp'],
})

listProdVersionsCommand.addHandler(async ({ workers }) => {
  const { getCurrentProdFolder } = workers.extensions

  const prodFolder = getCurrentProdFolder()
  const versionsAvailablesPaths =
    await workers.folders.getDirectories(prodFolder)

  if (versionsAvailablesPaths.length === 0) {
    return workers.logger.warn('[!] No versions in production')
  }

  const versionsAvailable = versionsAvailablesPaths.map((version) =>
    basename(version),
  )

  workers.logger.info('[V] Versions in production')
  versionsAvailable.sort(semver.compare).forEach((version) => {
    workers.logger.info(`[V] ${version}`)
  })
})

export { listProdVersionsCommand }
