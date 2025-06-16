import { Workers } from '@vortecx/cli-forger'
import { Extensions } from '.'

export function getBackupFolder(workers: Workers<Extensions>) {
  const deployFolder = workers.extensions.getDeployFolder()
  const backupFolder = workers.path.getPath([deployFolder, 'backup'])
  return backupFolder
}
