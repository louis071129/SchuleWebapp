import { getDb } from "./client";
import type { Marker, NewMarker } from "./schema";

export async function addMarker(marker: NewMarker): Promise<number> {
  const db = await getDb();
  return db.add("markers", marker as Marker);
}

export async function getMarkersForDate(dateKey: string): Promise<Marker[]> {
  const db = await getDb();
  return db.getAllFromIndex("markers", "by-dateKey", dateKey);
}

export async function getAllMarkers(): Promise<Marker[]> {
  const db = await getDb();
  return db.getAll("markers");
}

/** Marker im Zeitraum [startKey, endKey], jeweils inklusive (Datumsschlüssel-Vergleich). */
export async function getMarkersInDateRange(startKey: string, endKey: string): Promise<Marker[]> {
  const db = await getDb();
  const range = IDBKeyRange.bound(startKey, endKey);
  return db.getAllFromIndex("markers", "by-dateKey", range);
}

export async function deleteMarker(id: number): Promise<void> {
  const db = await getDb();
  await db.delete("markers", id);
}

export async function countMarkersForDate(dateKey: string): Promise<number> {
  const db = await getDb();
  return db.countFromIndex("markers", "by-dateKey", dateKey);
}
