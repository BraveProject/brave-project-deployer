import { Workers } from '@vortecx/cli-forger'
import { Extensions } from '.'

export function getCurrentStagingFolder(workers: Workers<Extensions>) {
  const deployFolder = workers.extensions.getDeployFolder()

  const currentStagingFolder = workers.path.getPath([
    deployFolder,
    'current',
    'staging',
  ])

  return currentStagingFolder
}
