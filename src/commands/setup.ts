import { Client } from "eris";
import Command from "../Command";
import Config from "../Config";
import Guild from "../database/Guild";
import { EmbedColors } from "../EmbedColors";
import { Message } from "../Message";

export default class SetupCommand extends Command {
  name = "setup";
  description = "Set up your server for use with the bot.";
  args = [{ name: "force", type: "string" as const }];

  async run(
    message: Message,
    bot: Client,
    args: { force?: string }
  ): Promise<void> {
    const document = await Guild.findOne({ guildId: message.guildID });
    if (document && args.force != "force") {
      bot.createMessage(message.channel.id, {
        embed: {
          title: "⚠️ It looks like you've already set up DAuth.",
          color: EmbedColors.Error,
          description: `To force setup to run again, do \`${
            Config.config.service.discord.prefix.toLowerCase() || "a!"
          }setup force\``,
        },
      });
      return;
    } else if (document && args.force == "force") {
      const existingRole = message.member?.guild.roles.get(document.roleId);
      const existingChannel = message.member?.guild.channels.get(
        document.channelId
      );
      if (existingRole)
        existingRole.delete("Old role deleted by setup command");
      if (existingChannel)
        existingChannel.delete("Old channel deleted by setup command");
    }
    const role = await message.member?.guild.createRole(
      { name: "Authorised", permissions: 4399156800 },
      "Role created by setup command"
    );
    message.member?.guild.editRole(message.guildID || "", { permissions: 0 });

    // check if channel already exists
    const channel = await message.member?.guild.createChannel("authorise", 0, {
      reason: "Channel created by setup command",
      permissionOverwrites: [
        { allow: 66560, deny: 0, id: message.guildID || "", type: "role" },
        { allow: 0, deny: 1024, id: role?.id || "", type: "role" },
        { allow: 3072, deny: 0, id: bot.user.id, type: "member" },
      ],
    });

    channel?.createMessage({
      embed: {
        title: "🛡️ Click me to enter the server",
        url: "https://app.dauth.xyz/123456789123",
        color: EmbedColors.Info,
      },
    });

    await Guild.upsert(
      { guildId: message.guildID },
      { $set: { channelId: channel?.id, roleId: role?.id } }
    );

    bot.createMessage(message.channel.id, {
      embed: {
        title: "✅ DAuth is now set up!",
        color: EmbedColors.Success,
        description: `I have created the role \`Authorised\`. Please treat this like your \`@everyone\` role, giving it permissions that you want everyone in the server to have. **DO NOT** edit the \`@everyone\` role, as it could allow unauthorised access to your server.\n\nNext, you should allow people to enter the server using \`${
          Config.config.service.discord.prefix.toLowerCase() || "a!"
        }allow\`.`,
      },
    });
  }
}
