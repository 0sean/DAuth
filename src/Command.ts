import { Member, Client } from "eris";
import { Message } from "./Message";

export default abstract class Command {
  abstract name: string;
  abstract description: string;
  args: Arg[] = [];
  abstract run(
    message: Message,
    bot: Client,
    args: Record<string, string | Member>,
    commands: Record<string, Command>
  ): void;
}

export interface Arg {
  name: string;
  type: "string" | "member";
}
