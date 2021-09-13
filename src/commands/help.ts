import { Client, Member } from "eris";
import Command from "../Command";
import Config from "../Config";
import { EmbedColors } from "../EmbedColors";
import { Message } from "../Message";

export default class HelpCommand extends Command {
  name = "help";
  description = "Lists all commands.";

  run(
    message: Message,
    bot: Client,
    args: Record<string, string | Member>,
    commands: Record<string, Command>
  ): void {
    const fields = Object.values(commands).map((c) => {
      const args = c.args
        .map((a) => `<${a.type == "member" ? "@mention" : a.name}>`)
        .join(" ");
      return {
        name: `**${c.name}**`,
        value: `${c.description}${
          args[0]
            ? `\nUsage: \`${
                Config.config.service.discord.prefix.toLowerCase() || "a!"
              }${c.name} ${args}\``
            : ""
        }`,
        inline: true,
      };
    });
    bot.createMessage(message.channel.id, {
      embed: {
        title: "❓ Help",
        description: `Prefix: \`${
          Config.config.service.discord.prefix.toLowerCase() || "a!"
        }\``,
        color: EmbedColors.Info,
        fields,
      },
      messageReference: { messageID: message.id },
    });
  }
}
