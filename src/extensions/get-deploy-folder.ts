import { Workers } from '@vortecx/cli-forger'
import { Extensions } from '.'

export function getDeployFolder(workers: Workers<Extensions>) {
  const deployFolder = workers.path.getPath([
    '/home/nucleo/application/deploy/',
    // '/home/joao/Projects/brave-project-deployer/test/deploy/',
  ])

  return deployFolder
}
