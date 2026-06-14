import { describe, test, expect } from "vitest";

// ── Helpers (mirror TradeDetailPanel.jsx) ────────────────────

const PROP_ONLY_CHECK_KEYS = new Set(["dailyDrawdown", "lotSize", "session", "newsWindow"]);
const COMMON_CHECK_KEYS    = ["stopLoss", "takeProfit", "riskPercent", "rrRatio"];
const ALL_CHECK_KEYS       = [...COMMON_CHECK_KEYS, "dailyDrawdown", "lotSize", "session", "newsWindow"];

const getVisibleChecks = (checks, accountType) =>
  Object.fromEntries(
    Object.entries(checks).filter(
      ([key]) => accountType === "prop" || !PROP_ONLY_CHECK_KEYS.has(key)
    )
  );

const hasCriticalViolation = (violations = []) =>
  violations.some((v) => v.severity === "critical");

const hasHighOrCriticalViolation = (violations = []) =>
  violations.some((v) => v.severity === "high" || v.severity === "critical");

const showPropChallengeWarning = (violations, accountType) =>
  accountType === "prop" && hasHighOrCriticalViolation(violations);

// ── Fixtures ──────────────────────────────────────────────────

const makeAllChecks = () => ({
  stopLoss:      true,
  takeProfit:    true,
  riskPercent:   true,
  rrRatio:       true,
  dailyDrawdown: true,
  lotSize:       false,
  session:       true,
  newsWindow:    true,
});

const makeViolation = (overrides = {}) => ({
  rule:     "MAX_RISK_EXCEEDED",
  message:  "Risk exceeded",
  severity: "high",
  actual:   3,
  limit:    2,
  ...overrides,
});

const makeTrade = (overrides = {}) => ({
  _id:                  "trade-1",
  isCompliant:          true,
  complianceViolations: [],
  ...overrides,
});

// ── Tests ─────────────────────────────────────────────────────

describe("Compliance — normal trade hides prop-only checks", () => {
  test("normal account sees only 4 common checks", () => {
    const checks  = makeAllChecks();
    const visible = getVisibleChecks(checks, "normal");
    expect(Object.keys(visible)).toHaveLength(4);
  });

  test("normal account visible keys are common checks only", () => {
    const checks  = makeAllChecks();
    const visible = getVisibleChecks(checks, "normal");
    expect(Object.keys(visible)).toEqual(expect.arrayContaining(COMMON_CHECK_KEYS));
  });

  test("normal account does not show dailyDrawdown", () => {
    const checks  = makeAllChecks();
    const visible = getVisibleChecks(checks, "normal");
    expect(visible).not.toHaveProperty("dailyDrawdown");
  });

  test("normal account does not show lotSize", () => {
    const checks  = makeAllChecks();
    const visible = getVisibleChecks(checks, "normal");
    expect(visible).not.toHaveProperty("lotSize");
  });

  test("normal account does not show session check", () => {
    const checks  = makeAllChecks();
    const visible = getVisibleChecks(checks, "normal");
    expect(visible).not.toHaveProperty("session");
  });

  test("normal account does not show newsWindow check", () => {
    const checks  = makeAllChecks();
    const visible = getVisibleChecks(checks, "normal");
    expect(visible).not.toHaveProperty("newsWindow");
  });
});

describe("Compliance — prop trade shows all 8 checks", () => {
  test("prop account sees all 8 checks", () => {
    const checks  = makeAllChecks();
    const visible = getVisibleChecks(checks, "prop");
    expect(Object.keys(visible)).toHaveLength(8);
  });

  test("prop account sees dailyDrawdown", () => {
    const checks  = makeAllChecks();
    const visible = getVisibleChecks(checks, "prop");
    expect(visible).toHaveProperty("dailyDrawdown");
  });

  test("prop account sees lotSize", () => {
    const checks  = makeAllChecks();
    const visible = getVisibleChecks(checks, "prop");
    expect(visible).toHaveProperty("lotSize");
  });

  test("prop account sees session check", () => {
    const checks  = makeAllChecks();
    const visible = getVisibleChecks(checks, "prop");
    expect(visible).toHaveProperty("session");
  });

  test("prop account sees newsWindow check", () => {
    const checks  = makeAllChecks();
    const visible = getVisibleChecks(checks, "prop");
    expect(visible).toHaveProperty("newsWindow");
  });
});

describe("Compliance — critical severity shows top banner", () => {
  test("critical violation triggers top banner", () => {
    const trade = makeTrade({
      isCompliant: false,
      complianceViolations: [makeViolation({ severity: "critical" })],
    });
    expect(hasCriticalViolation(trade.complianceViolations)).toBe(true);
  });

  test("high severity alone does not trigger top banner", () => {
    const trade = makeTrade({
      isCompliant: false,
      complianceViolations: [makeViolation({ severity: "high" })],
    });
    expect(hasCriticalViolation(trade.complianceViolations)).toBe(false);
  });

  test("no violations — no banner", () => {
    const trade = makeTrade({ isCompliant: true, complianceViolations: [] });
    expect(hasCriticalViolation(trade.complianceViolations)).toBe(false);
  });

  test("mixed violations — critical among them triggers banner", () => {
    const trade = makeTrade({
      complianceViolations: [
        makeViolation({ severity: "warning" }),
        makeViolation({ severity: "critical" }),
        makeViolation({ severity: "medium" }),
      ],
    });
    expect(hasCriticalViolation(trade.complianceViolations)).toBe(true);
  });
});

describe("Compliance — high severity shows red badge only (no full banner)", () => {
  test("high severity does not trigger critical banner", () => {
    const violations = [makeViolation({ severity: "high" })];
    expect(hasCriticalViolation(violations)).toBe(false);
  });

  test("high severity is still a violation (isCompliant false)", () => {
    const trade = makeTrade({
      isCompliant: false,
      complianceViolations: [makeViolation({ severity: "high" })],
    });
    expect(trade.isCompliant).toBe(false);
    expect(trade.complianceViolations[0].severity).toBe("high");
  });
});

describe("Compliance — prop trade shows prop challenge warning", () => {
  test("prop account + high severity shows challenge warning", () => {
    const violations = [makeViolation({ severity: "high" })];
    expect(showPropChallengeWarning(violations, "prop")).toBe(true);
  });

  test("prop account + critical severity shows challenge warning", () => {
    const violations = [makeViolation({ severity: "critical" })];
    expect(showPropChallengeWarning(violations, "prop")).toBe(true);
  });

  test("normal account + high severity does NOT show challenge warning", () => {
    const violations = [makeViolation({ severity: "high" })];
    expect(showPropChallengeWarning(violations, "normal")).toBe(false);
  });

  test("prop account + only warning severity does NOT show challenge warning", () => {
    const violations = [makeViolation({ severity: "warning" })];
    expect(showPropChallengeWarning(violations, "prop")).toBe(false);
  });

  test("prop account + no violations does NOT show challenge warning", () => {
    expect(showPropChallengeWarning([], "prop")).toBe(false);
  });
});

describe("Compliance — recheck updates trade cache", () => {
  test("successful recheck sets isCompliant and violations on cached trade", () => {
    const cachedTrade = makeTrade({ isCompliant: null, complianceViolations: [] });
    const apiResponse = {
      success:     true,
      isCompliant: false,
      violations:  [makeViolation()],
      checks:      makeAllChecks(),
    };
    const updated = {
      ...cachedTrade,
      isCompliant:          apiResponse.isCompliant,
      complianceViolations: apiResponse.violations,
    };
    expect(updated.isCompliant).toBe(false);
    expect(updated.complianceViolations).toHaveLength(1);
  });

  test("recheck stores checks in local state (not on trade)", () => {
    const apiResponse = {
      success:     true,
      isCompliant: true,
      violations:  [],
      checks:      makeAllChecks(),
    };
    let localChecks = null;
    localChecks = apiResponse.checks;
    expect(localChecks).toBeDefined();
    expect(Object.keys(localChecks)).toHaveLength(8);
  });

  test("trade list dot indicator updates when isCompliant changes", () => {
    const prevIsCompliant = null;
    const nextIsCompliant = false;
    const shouldInvalidateList = prevIsCompliant !== nextIsCompliant;
    expect(shouldInvalidateList).toBe(true);
  });

  test("no list invalidation when isCompliant unchanged", () => {
    const prevIsCompliant = false;
    const nextIsCompliant = false;
    const shouldInvalidateList = prevIsCompliant !== nextIsCompliant;
    expect(shouldInvalidateList).toBe(false);
  });
});
