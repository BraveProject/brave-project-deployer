import { CliForger } from '@vortecx/cli-forger'
import { version } from '../package.json'
import { extensions, Extensions } from './extensions'
import { moveBackupToProdCommand } from './commands/move-backup-to-prod'
import { moveStagingToProdCommand } from './commands/move-staging-to-prod'
import { moveTempToProdCommand } from './commands/move-temp-to-prod'
import { listVersionsCommand } from './commands/list-versions'
import { moveStagingToBackupCommand } from './commands/move-staging-to-backup'
import { moveProdToBackupCommand } from './commands/move-prod-to-backup'
import { deployProductionCommand } from './commands/deploy-production'
import { moveBackupToStagingCommand } from './commands/move-backup-to-staging'
import { moveTempToStagingCommand } from './commands/move-temp-to-staging'
import { deployStagingCommand } from './commands/deploy-staging'
import { renameVersionCommand } from './commands/rename-version'
import { redeployStagingCommand } from './commands/redeploy-staging'
import { redeployProdCommand } from './commands/redeploy-prod'

const cli = new CliForger<Extensions>({
  name: 'brave',
  version,
  description: 'Application to deploy brave projetct',
})

cli.addExtensions(extensions)

cli.addCommand(listVersionsCommand)
cli.addCommand(moveBackupToProdCommand)
cli.addCommand(moveStagingToProdCommand)
cli.addCommand(moveTempToProdCommand)
cli.addCommand(moveStagingToBackupCommand)
cli.addCommand(moveProdToBackupCommand)
cli.addCommand(moveBackupToStagingCommand)
cli.addCommand(moveTempToStagingCommand)
cli.addCommand(renameVersionCommand)
cli.addCommand(redeployStagingCommand)
cli.addCommand(redeployProdCommand)

cli.addCommand(deployProductionCommand)
cli.addCommand(deployStagingCommand)

export default cli
