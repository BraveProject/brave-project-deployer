import { Workers } from '@vortecx/cli-forger'
import { Extensions } from '.'

export function getCurrentProdFolder(workers: Workers<Extensions>) {
  const deployFolder = workers.extensions.getDeployFolder()

  const currentProdFolder = workers.path.getPath([
    deployFolder,
    'current',
    'prod',
  ])

  return currentProdFolder
}
