import { CONFIG_KEY, getDb } from "./client";
import type { AppConfigRecord } from "./schema";

export async function getConfig(): Promise<AppConfigRecord | undefined> {
  const db = await getDb();
  return db.get("config", CONFIG_KEY);
}

export async function saveConfig(config: AppConfigRecord): Promise<void> {
  const db = await getDb();
  await db.put("config", config, CONFIG_KEY);
}

export async function clearConfig(): Promise<void> {
  const db = await getDb();
  await db.delete("config", CONFIG_KEY);
}
