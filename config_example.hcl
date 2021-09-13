# use service blocks for services (incl. discord and some bot related values), use resource for values related to parts of the bot (http, mongodb, etc.)
# check each service class for what values it requires (value names should be self-explanatory and use the same terminology as their own documentation)
# to disable a service, remove its configuration from here (or comment it out)

service "discord" { # discord.com/developers
  token = ""
  client_secret = ""
  prefix = "a!" # defaults to a!
}

resource "mongodb" {
  uri = ""
}

resource "http" {
  port = "8080" # defaults to 8080
  base_uri = "" # without trailing slash
}