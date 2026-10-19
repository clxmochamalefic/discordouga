import { Hono } from "hono";
import { requireAuth, type AuthEnv } from "../auth/middleware.ts";
import { findUserById } from "../db.ts";

export const userRoutes = new Hono<AuthEnv>();

userRoutes.get("/me", requireAuth, (c) => {
  const userId = c.get("userId");
  const user = findUserById(userId);
  if (!user) return c.json({ error: "Not found" }, 404);

  return c.json({
    id: user.id,
    discordId: user.discord_id,
    username: user.username,
    globalName: user.global_name,
    email: user.email,
    avatar: user.avatar,
    avatarUrl: user.avatar
      ? `https://cdn.discordapp.com/avatars/${user.discord_id}/${user.avatar}.png`
      : null,
    createdAt: user.created_at,
    updatedAt: user.updated_at,
  });
});
