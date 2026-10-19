import type { MiddlewareHandler } from "hono";
import { getCookie } from "hono/cookie";
import { config } from "../config.ts";
import { verifyJwt } from "./jwt.ts";
import { findUserById } from "../db.ts";

export type AuthEnv = {
  Variables: {
    userId: string;
  };
};

export const requireAuth: MiddlewareHandler<AuthEnv> = async (c, next) => {
  const token = getCookie(c, config.cookie.name);
  if (!token) return c.json({ error: "Unauthorized" }, 401);

  const payload = await verifyJwt(token);
  if (!payload) return c.json({ error: "Unauthorized" }, 401);

  const user = findUserById(payload.sub);
  if (!user) return c.json({ error: "Unauthorized" }, 401);

  c.set("userId", payload.sub);
  await next();
};
