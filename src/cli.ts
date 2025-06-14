import { Command, Option, CliForger } from "@vortecx/cli-forger";
import { version } from "../package.json";

const cli = new CliForger({
  name: "brave-project-deployer",
  version: version,
  description: "A description",
});

const sayHelloCommand = Command.create<{ for: string }>({
  name: "Say hello",
  description: "Say hello for world or anyone",
  aliases: ["sh"],
  options: [
    Option.create({
      name: "For anyone",
      description: "Define woo receive hello",
      required: false,
      long: "for",
      short: "f",
    }),
  ],
});

sayHelloCommand.addHandler(({ args, workers }) => {
  const { for: forAnyone } = args;

  if (forAnyone) {
    workers.logger.info(`Hello ${forAnyone}!`);
    return;
  }

  workers.logger.info("Hello world!");
});

cli.addDefaultCommand(sayHelloCommand);

export default cli;