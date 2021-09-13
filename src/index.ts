import { Client } from "eris";
import signale from "signale";
import requireAll from "require-all";
import Command from "./Command";
import CommandHandler from "./CommandHandler";
import WebServer from "./WebServer";
import { connect } from "./database";
import Config from "./Config";
import path from "path";

Config.parse().then(() => {
  const bot = new Client(Config.config.service.discord.token);

  const commands: Record<string, Command> = requireAll({
    dirname: path.join(__dirname, "/commands"),
    resolve: (cmd) => {
      return new cmd.default();
    },
  });

  bot.on("ready", () => {
    signale.success("Logged into Discord.");
    connect();
    WebServer(bot);
  });

  bot.on("messageCreate", (message) => {
    if (
      message.content
        .toLowerCase()
        .startsWith(Config.config.service.discord.prefix.toLowerCase() || "a!")
    ) {
      CommandHandler(message, bot, commands);
    }
  });

  bot.connect();
});
