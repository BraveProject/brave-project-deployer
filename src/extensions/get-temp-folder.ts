import { Workers } from '@vortecx/cli-forger'
import { Extensions } from '.'

export function getTempFolder(workers: Workers<Extensions>) {
  const deployFolder = workers.extensions.getDeployFolder()
  const tempFolder = workers.path.getPath([deployFolder, 'temp'])
  return tempFolder
}
