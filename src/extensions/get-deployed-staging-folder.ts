import { Workers } from '@vortecx/cli-forger'
import { Extensions } from '.'

export async function getDeployedStagingFolder(workers: Workers<Extensions>) {
  const currentStagingFolder = workers.extensions.getCurrentStagingFolder()

  const deployedVersions =
    await workers.folders.getDirectories(currentStagingFolder)

  if (deployedVersions.length !== 0) {
    return deployedVersions[0]
  }

  return ''
}
