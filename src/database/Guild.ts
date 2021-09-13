import { types, schema } from "papr";
import papr from "./";

const guildSchema = schema({
  guildId: types.string({ required: true }),
  channelId: types.string({ required: true }),
  roleId: types.string({ required: true }),
});

export type GuildDocument = typeof guildSchema[0];

const Guild = papr.model("guilds", guildSchema);

export default Guild;
