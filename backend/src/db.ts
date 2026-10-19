import { Database } from "bun:sqlite";
import { config } from "./config.ts";

export const db = new Database(config.db.path, { create: true });
db.exec("PRAGMA journal_mode = WAL;");
db.exec("PRAGMA foreign_keys = ON;");
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    discord_id TEXT UNIQUE NOT NULL,
    username TEXT NOT NULL,
    global_name TEXT,
    email TEXT,
    avatar TEXT,
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL
  );
`);

export type UserRow = {
  id: string;
  discord_id: string;
  username: string;
  global_name: string | null;
  email: string | null;
  avatar: string | null;
  created_at: number;
  updated_at: number;
};

export type UpsertUserInput = {
  discordId: string;
  username: string;
  globalName: string | null;
  email: string | null;
  avatar: string | null;
};

const selectByDiscordId = db.query<UserRow, [string]>(
  "SELECT * FROM users WHERE discord_id = ?",
);
const selectById = db.query<UserRow, [string]>(
  "SELECT * FROM users WHERE id = ?",
);
const insertUser = db.query(
  `INSERT INTO users (id, discord_id, username, global_name, email, avatar, created_at, updated_at)
   VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
);
const updateUser = db.query(
  `UPDATE users
   SET username = ?, global_name = ?, email = ?, avatar = ?, updated_at = ?
   WHERE discord_id = ?`,
);

export const upsertUser = (u: UpsertUserInput): UserRow => {
  const now = Date.now();
  const existing = selectByDiscordId.get(u.discordId);

  if (existing) {
    updateUser.run(
      u.username,
      u.globalName,
      u.email,
      u.avatar,
      now,
      u.discordId,
    );
    return {
      ...existing,
      username: u.username,
      global_name: u.globalName,
      email: u.email,
      avatar: u.avatar,
      updated_at: now,
    };
  }

  const id = crypto.randomUUID();
  insertUser.run(
    id,
    u.discordId,
    u.username,
    u.globalName,
    u.email,
    u.avatar,
    now,
    now,
  );
  return {
    id,
    discord_id: u.discordId,
    username: u.username,
    global_name: u.globalName,
    email: u.email,
    avatar: u.avatar,
    created_at: now,
    updated_at: now,
  };
};

export const findUserById = (id: string): UserRow | null => {
  return selectById.get(id) ?? null;
};
