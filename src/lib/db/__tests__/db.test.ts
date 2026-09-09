import "fake-indexeddb/auto";
import { beforeEach, describe, expect, it } from "vitest";
import { resetDbConnectionForTests } from "../client";
import { clearConfig, getConfig, saveConfig } from "../config-repo";
import {
  addMarker,
  countMarkersForDate,
  deleteMarker,
  getAllMarkers,
  getMarkersForDate,
  getMarkersInDateRange,
} from "../markers-repo";
import { DB_NAME } from "../schema";
import type { ScheduleConfig } from "@/lib/time-engine/types";

const sampleSchedule: ScheduleConfig = {
  startMinutes: 480,
  lessonMinutes: 45,
  lessonsPerDay: 6,
  breaks: [{ afterLesson: 2, minutes: 20 }],
  bundesland: "NW",
};

beforeEach(async () => {
  await resetDbConnectionForTests();
  await new Promise<void>((resolve, reject) => {
    const req = indexedDB.deleteDatabase(DB_NAME);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
    req.onblocked = () => resolve();
  });
});

describe("config-repo", () => {
  it("liefert undefined, wenn keine Konfiguration gespeichert ist", async () => {
    expect(await getConfig()).toBeUndefined();
  });

  it("speichert und liest die Konfiguration", async () => {
    await saveConfig({ schedule: sampleSchedule, setupComplete: true });
    const loaded = await getConfig();
    expect(loaded?.setupComplete).toBe(true);
    expect(loaded?.schedule.bundesland).toBe("NW");
  });

  it("überschreibt eine vorhandene Konfiguration", async () => {
    await saveConfig({ schedule: sampleSchedule, setupComplete: false });
    await saveConfig({ schedule: sampleSchedule, setupComplete: true });
    const loaded = await getConfig();
    expect(loaded?.setupComplete).toBe(true);
  });

  it("löscht die Konfiguration", async () => {
    await saveConfig({ schedule: sampleSchedule, setupComplete: true });
    await clearConfig();
    expect(await getConfig()).toBeUndefined();
  });
});

describe("markers-repo", () => {
  it("legt einen Marker an und vergibt eine ID", async () => {
    const id = await addMarker({
      timestamp: Date.now(),
      dateKey: "2026-09-14",
      weekday: 1,
      blockType: "lesson",
      lessonIndex: 3,
      subject: "Mathe",
    });
    expect(typeof id).toBe("number");
  });

  it("findet Marker eines bestimmten Tages", async () => {
    await addMarker({ timestamp: 1, dateKey: "2026-09-14", weekday: 1, blockType: "lesson" });
    await addMarker({ timestamp: 2, dateKey: "2026-09-15", weekday: 2, blockType: "lesson" });

    const markers = await getMarkersForDate("2026-09-14");
    expect(markers).toHaveLength(1);
    expect(markers[0].dateKey).toBe("2026-09-14");
  });

  it("zählt Marker eines Tages", async () => {
    await addMarker({ timestamp: 1, dateKey: "2026-09-14", weekday: 1, blockType: "lesson" });
    await addMarker({ timestamp: 2, dateKey: "2026-09-14", weekday: 1, blockType: "break" });
    expect(await countMarkersForDate("2026-09-14")).toBe(2);
    expect(await countMarkersForDate("2026-09-15")).toBe(0);
  });

  it("liefert alle Marker im Zeitraum", async () => {
    await addMarker({ timestamp: 1, dateKey: "2026-09-14", weekday: 1, blockType: "lesson" });
    await addMarker({ timestamp: 2, dateKey: "2026-09-16", weekday: 3, blockType: "lesson" });
    await addMarker({ timestamp: 3, dateKey: "2026-09-20", weekday: 1, blockType: "lesson" });

    const inRange = await getMarkersInDateRange("2026-09-14", "2026-09-16");
    expect(inRange).toHaveLength(2);
  });

  it("löscht einen Marker", async () => {
    const id = await addMarker({ timestamp: 1, dateKey: "2026-09-14", weekday: 1, blockType: "lesson" });
    await deleteMarker(id);
    expect(await getAllMarkers()).toHaveLength(0);
  });
});
