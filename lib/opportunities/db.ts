import "server-only";
import { createClient, type Client } from "@libsql/client";
import { mkdirSync } from "node:fs";
import path from "node:path";
let client: Client | undefined;
let initialization: Promise<void> | undefined;
export function database() {
  if (!client) {
    const url = process.env.DATABASE_URL || "file:./data/hire.db";
    if (url.startsWith("file:"))
      mkdirSync(path.dirname(url.slice(5)), { recursive: true });
    client = createClient({ url, authToken: process.env.DATABASE_AUTH_TOKEN });
  }
  return client;
}
export async function initDatabase() {
  if (!initialization)
    initialization = (async () => {
      await database().batch(
        [
          `CREATE TABLE IF NOT EXISTS opportunities(id TEXT PRIMARY KEY, fingerprint TEXT UNIQUE NOT NULL, source_id TEXT NOT NULL, title TEXT NOT NULL, organization TEXT NOT NULL, type TEXT NOT NULL, category TEXT NOT NULL, city TEXT NOT NULL, location TEXT NOT NULL, remote INTEGER NOT NULL, paid TEXT NOT NULL, commitment TEXT NOT NULL, status TEXT NOT NULL, deadline TEXT, first_seen_at TEXT NOT NULL, last_seen_at TEXT NOT NULL, last_verified_at TEXT, search_text TEXT NOT NULL, data TEXT NOT NULL)`,
          `CREATE INDEX IF NOT EXISTS idx_public_catalog ON opportunities(status,type,city,first_seen_at)`,
          `CREATE INDEX IF NOT EXISTS idx_deadlines ON opportunities(status,deadline)`,
          `CREATE TABLE IF NOT EXISTS opportunity_sources(opportunity_id TEXT NOT NULL, source_id TEXT NOT NULL, last_seen_at TEXT NOT NULL, missing_count INTEGER NOT NULL DEFAULT 0, PRIMARY KEY(opportunity_id,source_id))`,
          `CREATE TABLE IF NOT EXISTS source_health(source TEXT PRIMARY KEY, data TEXT NOT NULL)`,
          `CREATE TABLE IF NOT EXISTS locks(name TEXT PRIMARY KEY, expires_at INTEGER NOT NULL)`,
          `CREATE TABLE IF NOT EXISTS rate_limits(key TEXT PRIMARY KEY, count INTEGER NOT NULL, reset_at INTEGER NOT NULL)`,
          `CREATE TABLE IF NOT EXISTS deletion_queue(file_id TEXT PRIMARY KEY, created_at TEXT NOT NULL, attempts INTEGER NOT NULL DEFAULT 0)`,
        ],
        "write",
      );
    })().catch((e) => {
      initialization = undefined;
      throw e;
    });
  await initialization;
}
export async function closeDatabase() {
  client?.close();
  client = undefined;
  initialization = undefined;
}
