import { Client } from "eris";
import Command from "../Command";
import { EmbedColors } from "../EmbedColors";
import { Message } from "../Message";
import Config from "../Config";

export default class PingCommand extends Command {
  name = "ping";
  description = "Checks the bot's ping to Discord.";

  run(message: Message, bot: Client): void {
    bot.createMessage(message.channel.id, {
      embed: {
        title: "🏓 Pong!",
        description: `Ping: \`${
          message.member?.guild.shard.latency
        }ms\`. ${Config.config.service.discord.toString()}`,
        color: EmbedColors.Info,
      },
      messageReference: { messageID: message.id },
    });
  }
}
