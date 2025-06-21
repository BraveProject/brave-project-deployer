import { Workers } from '@vortecx/cli-forger'
import { Extensions } from '.'
import * as semver from 'semver'
import { basename } from 'path'

export interface Version {
  version: string
  in: 'staging' | 'temp' | 'backup' | 'prod'
}

export interface ExistentVeriosns {
  temp: Version[]
  backup: Version[]
  prod: Version[]
  staging: Version[]
  all: Version[]
}

export async function listVersions(
  workers: Workers<Extensions>,
): Promise<ExistentVeriosns> {
  const {
    getTempFolder,
    getBackupFolder,
    getCurrentProdFolder,
    getCurrentStagingFolder,
  } = workers.extensions

  const tempFolder = getTempFolder()
  const backupFolder = getBackupFolder()
  const prodFolder = getCurrentProdFolder()
  const stagingFolder = getCurrentStagingFolder()

  const tempVersiosn = await workers.folders.getDirectories(tempFolder)
  const backupVersions = await workers.folders.getDirectories(backupFolder)
  const prodVersions = await workers.folders.getDirectories(prodFolder)
  const stagingVersions = await workers.folders.getDirectories(stagingFolder)

  const tempSortedVersions = tempVersiosn
    .map((v) => basename(v))
    .sort(semver.compare)
    .map((v): Version => ({ version: v, in: 'temp' }))
  const backupSortedVersions = backupVersions
    .map((v) => basename(v))
    .sort(semver.compare)
    .map((v): Version => ({ version: v, in: 'backup' }))
  const prodSortedVersions = prodVersions
    .map((v) => basename(v))
    .sort(semver.compare)
    .map((v): Version => ({ version: v, in: 'prod' }))
  const stagingSortedVersions = stagingVersions
    .map((v) => basename(v))
    .sort(semver.compare)
    .map((v): Version => ({ version: v, in: 'staging' }))

  const allVersions: Version[] = [
    ...tempSortedVersions,
    ...backupSortedVersions,
    ...prodSortedVersions,
    ...stagingSortedVersions,
  ]

  const allSortedVersions = allVersions.sort((a, b) =>
    semver.compare(a.version, b.version),
  )

  return {
    temp: tempSortedVersions,
    backup: backupSortedVersions,
    prod: prodSortedVersions,
    staging: stagingSortedVersions,
    all: allSortedVersions,
  }
}
