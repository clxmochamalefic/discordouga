import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { config } from "./config.ts";
import { authRoutes } from "./routes/auth.ts";
import { userRoutes } from "./routes/users.ts";

const app = new Hono();

app.use("*", logger());
app.use(
  "*",
  cors({
    origin: config.frontend.url,
    credentials: true,
    allowMethods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowHeaders: ["Content-Type", "Authorization"],
  }),
);

app.get("/health", (c) => c.json({ ok: true }));

app.route("/auth", authRoutes);
app.route("/api", userRoutes);

app.onError((err, c) => {
  console.error(err);
  return c.json({ error: "Internal Server Error" }, 500);
});

console.log(`→ Backend listening on http://localhost:${config.port}`);

export default {
  port: config.port,
  fetch: app.fetch,
};
