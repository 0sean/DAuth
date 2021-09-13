import { AnyStrategy } from "fastify-passport/dist/strategies";
import Config from "./Config";
import requireAll from "require-all";
import path from "path";
import signale from "signale";

export default abstract class Service {
  abstract name: string;
  abstract strategy(): AnyStrategy;
  abstract config: string[];
  color?: string;
  icon?: string;
  callbackURL(): string {
    // fix broken callback url generator
    return `${Config.config.resource.http.base_url}/auth/${this.name}`;
  }
}

// Change to array?
export function ServiceLoader(): Service[] {
  const enabled = Object.keys(Config.config.service).filter(
    (k) => k != "discord"
  );
  const services: Record<string, Service> = requireAll({
    dirname: path.join(__dirname, "/services"),
    resolve: (service) => {
      return new service.default();
    },
  });
  const s = Object.values(
    Object.keys(services)
      .filter((key) => enabled.includes(services[key].name))
      .filter((key) => {
        const value = services[key].config.every((c) =>
          Object.keys(Config.config.service[services[key].name]).includes(c)
        );
        if (!value) {
          signale.error(
            `Some configuration values for service "${services[key].name}" were not provided. It was temporarily disabled.`
          );
        }
        return value;
      })
      .reduce(
        (res, key) => ((res[key] = services[key]), res),
        {} as Record<string, Service>
      )
  );
  Services = s;
  return s;
}

export let Services: Service[];
