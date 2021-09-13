import { Client } from "eris";
import * as Eta from "eta";
import path from "path";
import fastify from "fastify";
import fastifyStatic from "fastify-static";
import fastifyPassport from "fastify-passport";
import fastifySecureSession from "fastify-secure-session";
import passportDiscord from "passport-discord";
import signale from "signale";
import fs from "fs";
import Guild from "./database/Guild";
import Config from "./Config";
import { ServiceLoader, Services } from "./Service";
import AllowedUser from "./database/AllowedUser";

export default function WebServer(bot: Client): void {
  const server = fastify();
  const port = Number(Config.config.resource.http.port);

  // make sure that the user is using https or reccomend it

  Eta.configure({ views: path.join(__dirname, "../views") });
  server.register(fastifyStatic, {
    root: path.join(__dirname, "../assets"),
    prefix: "/assets/",
  });

  if (!fs.existsSync(path.join(__dirname, "../secret-key"))) {
    throw new Error(
      'No secret key found. Generate one with "yarn run gen-key".'
    );
  }
  server.register(fastifySecureSession, {
    key: fs.readFileSync(path.join(__dirname, "../secret-key")),
    cookie: { path: "/", secure: true },
  });
  server.register(fastifyPassport.initialize());
  server.register(fastifyPassport.secureSession());

  // check discord details
  fastifyPassport.use(
    new passportDiscord.Strategy(
      {
        clientID: bot.user.id,
        clientSecret: Config.config.service.discord.client_secret, // get from env.
        // fix the broken callback url thing
        callbackURL: `${Config.config.resource.http.base_url}/auth/discord`,
        scope: ["identify"],
      },
      (accessToken, refreshToken, profile, done) => {
        return done(null, profile);
      }
    )
  );

  const services = ServiceLoader();
  services.forEach((service) => {
    fastifyPassport.use(service.strategy());
    server.get(
      `/auth/${service.name}`,
      {
        preValidation: fastifyPassport.authorize(service.name, {
          authInfo: false,
        }),
      },
      async (request, reply) => {
        if (!request.cookies["DAuth-GuildId"]) {
          reply.status(400);
          return reply.send("No DAuth-GuildId cookie found.");
        }
        request.login(request.user);
        // make sure that this is actually a guild id or at least the correct format
        // see if this could be exploited
        // maybe use smth like local storage instead
        return reply.redirect(301, `/${request.cookies["DAuth-GuildId"]}`);
      }
    );
  });

  // use db/cache serializer?
  fastifyPassport.registerUserSerializer(async (user) => JSON.stringify(user));
  fastifyPassport.registerUserDeserializer(async (serialized: string) =>
    JSON.parse(serialized)
  );

  server.get(
    "/auth/discord",
    {
      preValidation: fastifyPassport.authenticate("discord", {
        authInfo: false,
      }),
    },
    async (request, reply) => {
      if (!request.cookies["DAuth-GuildId"]) {
        reply.status(400);
        return reply.send("No DAuth-GuildId cookie found.");
      }
      request.login(request.user);
      // make sure that this is actually a guild id or at least the correct format
      // see if this could be exploited
      // maybe use smth like local storage instead
      return reply.redirect(301, `/${request.cookies["DAuth-GuildId"]}`);
    }
  );

  server.get("/:guildId", async (request, reply) => {
    reply.header("Content-Type", "text/html");
    const guild = bot.guilds.get(
      (request.params as { guildId?: string }).guildId || ""
    );
    if (!guild) {
      reply.status(404);
      return Eta.renderFile("pages/404", {});
    } else {
      const document = await Guild.findOne({ guildId: guild.id });
      if (!document) {
        reply.status(404);
        return Eta.renderFile("pages/404", {});
      }
    }
    if (request.user) {
      const enabled = [
        ...new Set(
          await (await AllowedUser.find({ guildId: "739456910725742667" }))
            .filter((e) => services.map((s) => s.name).includes(e.service))
            .map((e) => services.find((s) => s.name == e.service))
        ),
      ];
      return Eta.renderFile("pages/authenticate/services", {
        name: guild.name,
        enabled,
      });
    } else {
      reply.setCookie("DAuth-GuildId", guild.id);
      return Eta.renderFile("pages/authenticate/steps", {
        name: guild.name,
      });
    }
  });

  server.get("*", async (request, reply) => {
    reply.header("Content-Type", "text/html");
    reply.status(404);
    return Eta.renderFile("pages/404", {});
  });

  server.listen(isNaN(port) ? 8080 : port, () => {
    signale.success(
      `Web server running on port ${Config.config.resource.http.port || 8080}.`
    );
  });
}
