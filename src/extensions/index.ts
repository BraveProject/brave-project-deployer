import { WorkersExtensions } from '@vortecx/cli-forger'
import { getDeployFolder } from './get-deploy-folder'
import { getTempFolder } from './get-temp-folder'
import { getBackupFolder } from './get-backup-folder'
import { getCurrentStagingFolder } from './get-current-staging-folder'
import { getCurrentProdFolder } from './get-current-prod-folder'
import { getDeployedProdFolder } from './get-deployed-prod-folder'
import { getCurrentWaitFolder } from './get-current-wait-folder'
import { getDeployedStagingFolder } from './get-deployed-staging-folder'
import { listVersions } from './list-versions'

export const extensions = {
  getDeployFolder,
  getTempFolder,
  getBackupFolder,
  getCurrentStagingFolder,
  getDeployedStagingFolder,
  getCurrentProdFolder,
  getDeployedProdFolder,
  getCurrentWaitFolder,
  listVersions,
}

export type Extensions = WorkersExtensions<typeof extensions>
