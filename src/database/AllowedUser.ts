import { types, schema } from "papr";
import papr from "./";

const allowedUserSchema = schema({
  guildId: types.string({ required: true }),
  service: types.string({ required: true }),
  username: types.string({ required: true }),
});

export type AllowedUserDocument = typeof allowedUserSchema[0];

const AllowedUser = papr.model("allowedUsers", allowedUserSchema);

export default AllowedUser;
