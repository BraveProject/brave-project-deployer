import { Workers } from '@vortecx/cli-forger'
import { Extensions } from '.'

export function getCurrentWaitFolder(workers: Workers<Extensions>) {
  const deployFolder = workers.extensions.getDeployFolder()

  const currentWaitFolder = workers.path.getPath([
    deployFolder,
    'current',
    'wait',
  ])

  return currentWaitFolder
}
