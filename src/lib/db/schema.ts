import type { DBSchema } from "idb";
import type { ScheduleConfig, Weekday } from "@/lib/time-engine/types";

export interface AppConfigRecord {
  schedule: ScheduleConfig;
  setupComplete: boolean;
}

export type BlockType = "lesson" | "break";

export interface Marker {
  id: number;
  /** Unix-Zeitstempel in Millisekunden. */
  timestamp: number;
  /** Lokaler Datumsschlüssel "YYYY-MM-DD", für Tagesabfragen. */
  dateKey: string;
  weekday: Weekday;
  blockType: BlockType;
  lessonIndex?: number;
  subject?: string;
}

export type NewMarker = Omit<Marker, "id">;

export interface NochDBSchema extends DBSchema {
  config: {
    key: string;
    value: AppConfigRecord;
  };
  markers: {
    key: number;
    value: Marker;
    indexes: { "by-dateKey": string; "by-timestamp": number };
  };
}

export const CONFIG_KEY = "app";
export const DB_NAME = "noch-db";
export const DB_VERSION = 1;
