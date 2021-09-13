import { Client } from "eris";
import Command from "../Command";
import AllowedUser from "../database/AllowedUser";
import { EmbedColors } from "../EmbedColors";
import { Message } from "../Message";

export default class AllowCommand extends Command {
  name = "allow";
  // change this
  description = "Checks the bot's ping to Discord.";
  args = [
    { name: "service", type: "string" as const },
    { name: "username", type: "string" as const },
  ];

  async run(
    message: Message,
    bot: Client,
    args: { service?: string; username?: string }
  ): Promise<void> {
    if (!args.service) {
      bot.createMessage(message.channel.id, {
        embed: {
          title: "❌ Service not specified",
          color: EmbedColors.Error,
        },
      });
      return;
    }
    if (!args.username) {
      bot.createMessage(message.channel.id, {
        embed: {
          title: "❌ Username not specified",
          color: EmbedColors.Error,
        },
      });
      return;
    }
    const service = args.service.toLowerCase(),
      username = args.username.toLowerCase();
    // check service exists
    // check username exists on service ? (for security measures, someone allowing uncreated account, it can be created later)
    // check if already in db
    const document = await AllowedUser.findOne({
      guildId: message.guildID,
      service,
      username,
    });
    if (document) {
      bot.createMessage(message.channel.id, {
        embed: {
          title: "❌ User is already allowed.",
          color: EmbedColors.Error,
        },
      });
      return;
    }
    // add to db
    await AllowedUser.insertOne({
      guildId: message.guildID,
      service,
      username,
    });
    // if service is discord and the user is in the guild, authorise them automatically
    // embed reply
    bot.createMessage(message.channel.id, {
      embed: {
        title: `✅ User \`${service}/${username}\` allowed.`,
        color: EmbedColors.Success,
      },
    });
  }
}
