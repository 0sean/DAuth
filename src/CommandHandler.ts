import { Client, Member } from "eris";
import { Message } from "./Message";
import Command from "./Command";
import Config from "./Config";

export default function CommandHandler(
  message: Message,
  bot: Client,
  commands: Record<string, Command>
): void {
  const split = message.content
      .substring(Config.config.service.discord.prefix.length || 2)
      .split(" "),
    commandName = split[0].toLowerCase(),
    unparsedArgs = split.slice(1);

  if (
    !Object.values(commands)
      .map((c) => c.name.toLowerCase())
      .includes(commandName)
  )
    return;

  const command = Object.values(commands).find((c) => c.name == commandName);

  if (message.member?.guild.ownerID != message.member?.id) {
    bot.createMessage(message.channel.id, {
      embed: { title: "❌ You are not the guild owner." },
      messageReference: { messageID: message.id },
    });
    return;
  }

  const args: Record<string, string | Member> = {};
  const error = command?.args.some((a, i) => {
    if (a.type == "string") {
      if (i == command.args.length - 1) {
        args[a.name] = unparsedArgs.slice(command.args.length - 1).join(" ");
      } else {
        args[a.name] = unparsedArgs[i];
      }
    } else if (a.type == "member") {
      if (!unparsedArgs[i].startsWith("<@") && !unparsedArgs[i].endsWith(">")) {
        bot.createMessage(message.channel.id, {
          embed: { title: "❌ Error: Invalid mention." },
          messageReference: { messageID: message.id },
        });
        return true;
      }

      if (unparsedArgs[i].startsWith("<@!")) {
        const member = message.member?.guild.members.get(
          unparsedArgs[i].slice(3, -1)
        );
        if (!member) {
          bot.createMessage(message.channel.id, {
            embed: { title: "❌ Error: Invalid mention." },
            messageReference: { messageID: message.id },
          });
          return true;
        }
        args[a.name] = member;
      } else {
        const member = message.member?.guild.members.get(
          unparsedArgs[i].slice(2, -1)
        );
        if (!member) {
          bot.createMessage(message.channel.id, {
            embed: { title: "❌ Error: Invalid mention." },
            messageReference: { messageID: message.id },
          });
          return true;
        }
        args[a.name] = member;
      }
    }
  });
  if (error) return;

  command?.run(message, bot, args, commands);
}
