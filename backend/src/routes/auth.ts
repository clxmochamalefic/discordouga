import { Hono } from "hono";
import { deleteCookie, getCookie, setCookie } from "hono/cookie";
import { config } from "../config.ts";
import {
  buildAuthorizeUrl,
  exchangeCode,
  fetchDiscordUser,
} from "../auth/discord.ts";
import { signJwt } from "../auth/jwt.ts";
import { upsertUser } from "../db.ts";

export const authRoutes = new Hono();

authRoutes.get("/discord/login", (c) => {
  const state = crypto.randomUUID();
  setCookie(c, config.cookie.stateName, state, {
    httpOnly: true,
    secure: config.cookie.secure,
    sameSite: "Lax",
    path: "/",
    maxAge: 60 * 10,
    domain: config.cookie.domain,
  });
  return c.redirect(buildAuthorizeUrl(state));
});

authRoutes.get("/discord/callback", async (c) => {
  const code = c.req.query("code");
  const state = c.req.query("state");
  const cookieState = getCookie(c, config.cookie.stateName);

  deleteCookie(c, config.cookie.stateName, {
    path: "/",
    domain: config.cookie.domain,
  });

  if (!code || !state || !cookieState || state !== cookieState) {
    return c.redirect(`${config.frontend.url}/?error=invalid_state`);
  }

  try {
    const { access_token } = await exchangeCode(code);
    const d = await fetchDiscordUser(access_token);
    const user = upsertUser({
      discordId: d.id,
      username: d.username,
      globalName: d.global_name,
      email: d.email,
      avatar: d.avatar,
    });

    const token = await signJwt({ sub: user.id });
    setCookie(c, config.cookie.name, token, {
      httpOnly: true,
      secure: config.cookie.secure,
      sameSite: "Lax",
      path: "/",
      maxAge: config.jwt.expiresInSec,
      domain: config.cookie.domain,
    });

    return c.redirect(`${config.frontend.url}/dashboard`);
  } catch (e) {
    console.error("OAuth callback error:", e);
    return c.redirect(`${config.frontend.url}/?error=oauth_failed`);
  }
});

authRoutes.post("/logout", (c) => {
  deleteCookie(c, config.cookie.name, {
    path: "/",
    domain: config.cookie.domain,
  });
  return c.json({ ok: true });
});
