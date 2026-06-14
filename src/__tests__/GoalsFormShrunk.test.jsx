import { describe, test, expect } from "vitest";

// ── GoalsTab now has only 3 fields ───────────────────────────

const GOALS_FIELDS = ["monthlyReturnTarget", "weeklyReturnTarget", "targetWinRate"];

const REMOVED_FIELDS = [
  "maxRiskPerTrade",
  "maxDailyLoss",
  "maxWeeklyLoss",
  "targetRR",
];

const buildGoalsPayload = ({ monthlyReturnTarget = "", weeklyReturnTarget = "", targetWinRate = "" } = {}) => {
  const parse = (v) => { const n = parseFloat(v); return Number.isNaN(n) ? null : n; };
  return {
    monthlyReturnTarget: parse(monthlyReturnTarget),
    weeklyReturnTarget:  parse(weeklyReturnTarget),
    targetWinRate:       parse(targetWinRate),
  };
};

// ── Tests ─────────────────────────────────────────────────────

describe("GoalsTab — field set reduced to 3", () => {
  test("current field set has exactly 3 fields", () => {
    expect(GOALS_FIELDS).toHaveLength(3);
  });

  test("removed fields are no longer in the form", () => {
    REMOVED_FIELDS.forEach((field) => {
      expect(GOALS_FIELDS).not.toContain(field);
    });
  });

  test("payload includes only the 3 allowed fields", () => {
    const payload = buildGoalsPayload({ monthlyReturnTarget: "5", weeklyReturnTarget: "1.5", targetWinRate: "55" });
    const keys = Object.keys(payload);
    expect(keys).toEqual(["monthlyReturnTarget", "weeklyReturnTarget", "targetWinRate"]);
  });

  test("empty values serialize to null", () => {
    const payload = buildGoalsPayload({});
    expect(payload.monthlyReturnTarget).toBeNull();
    expect(payload.weeklyReturnTarget).toBeNull();
    expect(payload.targetWinRate).toBeNull();
  });
});
