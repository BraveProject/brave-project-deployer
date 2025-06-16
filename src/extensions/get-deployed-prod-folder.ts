import { Workers } from '@vortecx/cli-forger'
import { Extensions } from '.'

export async function getDeployedProdFolder(workers: Workers<Extensions>) {
  const currentProdFolder = workers.extensions.getCurrentProdFolder()

  const deployedVersions =
    await workers.folders.getDirectories(currentProdFolder)

  if (deployedVersions.length !== 0) {
    return deployedVersions[0]
  }

  return ''
}
