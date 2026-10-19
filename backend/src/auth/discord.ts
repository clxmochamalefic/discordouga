import { config } from "../config.ts";

export type DiscordUser = {
  id: string;
  username: string;
  global_name: string | null;
  email: string | null;
  avatar: string | null;
};

export const buildAuthorizeUrl = (state: string): string => {
  const url = new URL("https://discord.com/api/oauth2/authorize");
  url.searchParams.set("client_id", config.discord.clientId);
  url.searchParams.set("redirect_uri", config.discord.redirectUri);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("scope", config.discord.scope);
  url.searchParams.set("state", state);
  url.searchParams.set("prompt", "consent");
  return url.toString();
};

export const exchangeCode = async (
  code: string,
): Promise<{ access_token: string }> => {
  const body = new URLSearchParams({
    client_id: config.discord.clientId,
    client_secret: config.discord.clientSecret,
    grant_type: "authorization_code",
    code,
    redirect_uri: config.discord.redirectUri,
  });

  const res = await fetch("https://discord.com/api/oauth2/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Discord token exchange failed: ${res.status} ${text}`);
  }

  return (await res.json()) as { access_token: string };
};

export const fetchDiscordUser = async (
  accessToken: string,
): Promise<DiscordUser> => {
  const res = await fetch("https://discord.com/api/users/@me", {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Discord user fetch failed: ${res.status} ${text}`);
  }
  return (await res.json()) as DiscordUser;
};
