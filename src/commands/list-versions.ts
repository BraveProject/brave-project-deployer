import { Command } from '@vortecx/cli-forger'
import { Extensions } from '../extensions'

const listVersionsCommand = Command.create<unknown, Extensions>({
  name: 'List versions',
  description: 'List all versions',
  aliases: ['lv'],
})

listVersionsCommand.addHandler(async ({ workers }) => {
  const actualFolder = workers.path.getCurrentPath()

  workers.prompt.executeInFolder(actualFolder, 'brave lb')
  workers.prompt.executeInFolder(actualFolder, 'brave lp')
  workers.prompt.executeInFolder(actualFolder, 'brave ls')
  workers.prompt.executeInFolder(actualFolder, 'brave lt')
})

export { listVersionsCommand }
