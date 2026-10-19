const required = (name: string): string => {
  const v = Bun.env[name];
  if (!v) throw new Error(`Missing environment variable: ${name}`);
  return v;
};

export const config = {
  port: Number(Bun.env.PORT ?? 3000),
  nodeEnv: Bun.env.NODE_ENV ?? "development",
  discord: {
    clientId: required("DISCORD_CLIENT_ID"),
    clientSecret: required("DISCORD_CLIENT_SECRET"),
    redirectUri: required("DISCORD_REDIRECT_URI"),
    scope: "identify email",
  },
  jwt: {
    secret: required("JWT_SECRET"),
    issuer: "discordauth",
    audience: "discordauth",
    expiresInSec: 60 * 60 * 24 * 7,
  },
  frontend: {
    url: required("FRONTEND_URL"),
  },
  cookie: {
    name: "auth_token",
    stateName: "oauth_state",
    domain: Bun.env.COOKIE_DOMAIN || undefined,
    secure: Bun.env.COOKIE_SECURE === "true",
  },
  db: {
    path: Bun.env.DB_PATH ?? "./data.sqlite",
  },
} as const;
