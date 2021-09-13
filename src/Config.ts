import { parse } from "@cdktf/hcl2json";
import fs from "fs";
import path from "path";

type ConfigType = Record<string, Record<string, Record<string, string>>>;

export default new (class Config {
  async parse(): Promise<ConfigType> {
    const file = fs
      .readFileSync(path.join(__dirname + "/../config.hcl"))
      .toString();
    const hcl = await parse("config.hcl", file);
    const config: ConfigType = { service: {}, resource: {} };
    Object.keys(hcl).forEach((k) => {
      Object.keys(hcl[k]).forEach((n) => {
        if (!config[k]) config[k] = {};
        config[k][n] = hcl[k][n][0];
      });
    });
    this.config = config;
    return this.config;
  }

  config!: ConfigType;
})();
