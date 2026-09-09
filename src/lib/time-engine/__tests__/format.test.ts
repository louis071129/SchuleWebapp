import { describe, expect, it } from "vitest";
import { formatExactRemaining, formatPercent, formatRemaining, roundToStep } from "../format";

describe("roundToStep", () => {
  it("rundet auf 5%-Schritte", () => {
    expect(roundToStep(0.0)).toBe(0);
    expect(roundToStep(0.01)).toBe(0);
    expect(roundToStep(0.024)).toBe(0);
    expect(roundToStep(0.026)).toBe(5);
    expect(roundToStep(0.5)).toBe(50);
    expect(roundToStep(0.999)).toBe(100);
    expect(roundToStep(1)).toBe(100);
  });

  it("kappt außerhalb von [0,1]", () => {
    expect(roundToStep(-0.5)).toBe(0);
    expect(roundToStep(1.5)).toBe(100);
  });
});

describe("formatRemaining", () => {
  it("zeigt 'gleich' unter 5 Minuten", () => {
    expect(formatRemaining(0)).toBe("gleich");
    expect(formatRemaining(60_000)).toBe("gleich");
    expect(formatRemaining(4 * 60_000 + 59_000)).toBe("gleich");
  });

  it("zeigt 'gleich' auch bei negativer/abgelaufener Zeit", () => {
    expect(formatRemaining(-1000)).toBe("gleich");
  });

  it("rundet auf 5-Minuten-Schritte", () => {
    expect(formatRemaining(20 * 60_000 + 90_000)).toBe("noch etwa 20 Minuten");
    expect(formatRemaining(22 * 60_000)).toBe("noch etwa 20 Minuten");
    expect(formatRemaining(23 * 60_000)).toBe("noch etwa 25 Minuten");
  });

  it("formatiert Stunden ab 60 Minuten", () => {
    expect(formatRemaining(65 * 60_000)).toBe("noch etwa 1 Stunde 5 Minuten");
    expect(formatRemaining(120 * 60_000)).toBe("noch etwa 2 Stunden");
  });
});

describe("formatExactRemaining", () => {
  it("formatiert Minuten:Sekunden", () => {
    expect(formatExactRemaining(65_000)).toBe("1:05");
    expect(formatExactRemaining(5_000)).toBe("0:05");
    expect(formatExactRemaining(0)).toBe("0:00");
  });

  it("formatiert Stunden:Minuten:Sekunden ab einer Stunde", () => {
    expect(formatExactRemaining(3_665_000)).toBe("1:01:05");
  });
});

describe("formatPercent", () => {
  it("rundet auf ganze Prozent", () => {
    expect(formatPercent(0.5)).toBe("50");
    expect(formatPercent(0.505)).toBe("51");
    expect(formatPercent(1)).toBe("100");
  });
});
