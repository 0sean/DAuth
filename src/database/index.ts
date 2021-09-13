import { MongoClient } from "mongodb";
import Papr from "papr";
import signale from "signale";
import Config from "../Config";

export let client: MongoClient;
const papr = new Papr();

export async function connect(): Promise<void> {
  client = await MongoClient.connect(Config.config.resource.mongodb.uri);

  // get from url or give settings
  papr.initialize(client.db("dauth"));

  await papr.updateSchemas();

  signale.success("Connected to database.");
}

export async function disconnect(): Promise<void> {
  await client.close();
}

export default papr;
