import { CliForger } from '@vortecx/cli-forger'
import { version } from '../package.json'
import { extensions, Extensions } from './extensions'
import { moveBackupToProdCommand } from './commands/move-backup-to-prod'
import { moveStagingToProdCommand } from './commands/move-staging-to-prod'
import { moveTempToProdCommand } from './commands/move-temp-to-prod'
import { listBackupVersionsCommand } from './commands/list-backup-versions'
import { listProdVersionsCommand } from './commands/list-prod-versions'
import { listStagingVersionsCommand } from './commands/list-staging-versions'
import { listTempVersionsCommand } from './commands/list-temp-versions'
import { listVersionsCommand } from './commands/list-versions'
import { moveStagingToBackupCommand } from './commands/move-staging-to-backup'
import { moveProdToBackupCommand } from './commands/move-prod-to-backup'
import { deployProductionCommand } from './commands/deploy-production'
import { moveBackupToStagingCommand } from './commands/move-backup-to-staging'
import { moveTempToStagingCommand } from './commands/move-temp-to-staging'
import { deployStagingCommand } from './commands/deploy-staging'

const cli = new CliForger<Extensions>({
  name: 'brave',
  version,
  description: 'Application to deploy brave projetct',
})

cli.addExtensions(extensions)

cli.addCommand(listBackupVersionsCommand)
cli.addCommand(listProdVersionsCommand)
cli.addCommand(listStagingVersionsCommand)
cli.addCommand(listTempVersionsCommand)
cli.addCommand(listVersionsCommand)
cli.addCommand(moveBackupToProdCommand)
cli.addCommand(moveStagingToProdCommand)
cli.addCommand(moveTempToProdCommand)
cli.addCommand(moveStagingToBackupCommand)
cli.addCommand(moveProdToBackupCommand)
cli.addCommand(moveBackupToStagingCommand)
cli.addCommand(moveTempToStagingCommand)

cli.addCommand(deployProductionCommand)
cli.addCommand(deployStagingCommand)

export default cli
