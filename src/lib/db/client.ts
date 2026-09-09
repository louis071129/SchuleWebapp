import { openDB, type IDBPDatabase } from "idb";
import { CONFIG_KEY, DB_NAME, DB_VERSION, type NochDBSchema } from "./schema";

let dbPromise: Promise<IDBPDatabase<NochDBSchema>> | null = null;

function getDb(): Promise<IDBPDatabase<NochDBSchema>> {
  if (typeof indexedDB === "undefined") {
    return Promise.reject(new Error("IndexedDB ist in dieser Umgebung nicht verfügbar."));
  }
  if (!dbPromise) {
    dbPromise = openDB<NochDBSchema>(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains("config")) {
          db.createObjectStore("config");
        }
        if (!db.objectStoreNames.contains("markers")) {
          const store = db.createObjectStore("markers", {
            keyPath: "id",
            autoIncrement: true,
          });
          store.createIndex("by-dateKey", "dateKey");
          store.createIndex("by-timestamp", "timestamp");
        }
      },
    });
  }
  return dbPromise;
}

/** Nur für Tests: schließt die aktuelle Verbindung und erzwingt eine neue. */
export async function resetDbConnectionForTests(): Promise<void> {
  if (dbPromise) {
    const db = await dbPromise.catch(() => null);
    db?.close();
  }
  dbPromise = null;
}

export { getDb, CONFIG_KEY };
