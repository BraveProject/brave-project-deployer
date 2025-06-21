import { Command, Option } from '@vortecx/cli-forger'
import { Extensions } from '../extensions'

const listVersionsCommand = Command.create<
  { folder: 'all' | 'temp' | 'staging' | 'prod' | 'backup' },
  Extensions
>({
  name: 'List versions',
  description: 'List all versions',
  aliases: ['lv'],
  options: [
    Option.create({
      name: 'Folder',
      description:
        'Define a folder to list versions: Possible values all | temp | staging | prod | backup',
      long: 'folder',
      short: 'f',
      defaultValue: 'all',
    }),
  ],
})

listVersionsCommand.addHandler(async ({ args, workers }) => {
  const { listVersions } = workers.extensions
  const { folder } = args

  const acceptedFolders = ['temp', 'staging', 'prod', 'backup', 'all']

  if (!acceptedFolders.includes(folder)) {
    return workers.logger.exit.error(
      '[X] Define a valid folder to find new version ->  "all" | "temp" | "staging" | "prod" | "backup"',
    )
  }

  const versions = await listVersions()
  const versionsToList = versions[folder]

  workers.logger.info(`[V] List ${folder} versions`)

  if (versionsToList.length === 0) {
    workers.logger.info(`[!] No version to list`)
  }

  versionsToList.forEach((v) => {
    workers.logger.info(`[*] Version ~> ${v.version} ~> ${v.in}`)
  })
})

export { listVersionsCommand }
