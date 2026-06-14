import { describe, test, expect } from "vitest";

// ── Helpers mirroring StrategyTab logic ───────────────────────

const getAssignedIds = (assignments) =>
  assignments.map((a) => a.strategy?._id ?? a.strategy);

const getAvailableStrategies = (strategies, assignedIds) =>
  strategies.filter((s) => !assignedIds.includes(s._id));

const getEmptyStateText = (accountType) => {
  if (accountType === "prop")
    return "No strategy assigned. Risk and RR compliance based on strategy rules won't apply, and discipline scoring will be unavailable until you assign one.";
  if (accountType === "normal")
    return "No strategy assigned. Trades will use your Strategy Risk Fallback (below) for risk compliance. Minimum RR and discipline scoring require an assigned strategy.";
  return "No strategy assigned. Discipline scoring requires an assigned strategy.";
};

const makeStrategy = (overrides = {}) => ({
  _id:      "strat-1",
  name:     "ICT Kill Zone",
  category: "ict",
  riskRules: { maxRiskPerTrade: 1, minRR: 2 },
  setupCriteria: [],
  ...overrides,
});

const makeAssignment = (overrides = {}) => ({
  _id:       "assign-1",
  strategy:  makeStrategy(),
  isDefault: false,
  ...overrides,
});

// ── Tests ─────────────────────────────────────────────────────

describe("StrategyAssignment — assigned IDs extraction", () => {
  test("extracts _id from populated strategy object", () => {
    const assignments = [makeAssignment()];
    const ids = getAssignedIds(assignments);
    expect(ids).toEqual(["strat-1"]);
  });

  test("extracts string ID when strategy is not populated", () => {
    const assignments = [{ _id: "assign-2", strategy: "strat-raw-id", isDefault: false }];
    const ids = getAssignedIds(assignments);
    expect(ids).toEqual(["strat-raw-id"]);
  });
});

describe("StrategyAssignment — available strategies filter", () => {
  test("excludes already-assigned strategies from dropdown", () => {
    const strategies = [makeStrategy({ _id: "s1" }), makeStrategy({ _id: "s2" })];
    const assignedIds = ["s1"];
    const available = getAvailableStrategies(strategies, assignedIds);
    expect(available).toHaveLength(1);
    expect(available[0]._id).toBe("s2");
  });

  test("all strategies available when none assigned", () => {
    const strategies = [makeStrategy({ _id: "s1" }), makeStrategy({ _id: "s2" })];
    const available = getAvailableStrategies(strategies, []);
    expect(available).toHaveLength(2);
  });
});

describe("StrategyAssignment — empty state text by account type", () => {
  test("prop account shows compliance-specific text", () => {
    const text = getEmptyStateText("prop");
    expect(text).toContain("discipline scoring will be unavailable");
  });

  test("normal account mentions risk fallback", () => {
    const text = getEmptyStateText("normal");
    expect(text).toContain("Strategy Risk Fallback");
  });

  test("war account shows minimal text", () => {
    const text = getEmptyStateText("war");
    expect(text).toContain("Discipline scoring");
    expect(text).not.toContain("Risk Fallback");
  });
});
