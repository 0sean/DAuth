import Service from "../Service";
import { Strategy } from "passport-twitter";
import Config from "../Config";

export default class TwitterService extends Service {
  name = "twitter";
  config = ["consumer_key", "consumer_secret"];
  strategy(): Strategy {
    return new Strategy(
      {
        consumerKey: Config.config.service.twitter.consumer_key,
        consumerSecret: Config.config.service.twitter.consumer_secret,
        callbackURL: this.callbackURL(),
      },
      (token, tokenSecret, profile, cb) => {
        return cb(null, profile);
      }
    );
  }
}
