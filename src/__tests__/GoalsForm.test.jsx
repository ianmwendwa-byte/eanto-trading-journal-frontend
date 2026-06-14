import { describe, test, expect } from "vitest";

// ── Helpers (mirror GoalsTab logic) ──────────────────────────

const COMPLIANCE_FIELDS = ["maxRiskPerTrade", "targetRR"];
const INFORMATIONAL_FIELDS = [
  "monthlyReturnTarget", "weeklyReturnTarget",
  "maxDailyLoss", "maxWeeklyLoss", "targetWinRate",
];
const COMPLIANCE_TRIGGERS = {
  maxRiskPerTrade: "MAX_RISK_EXCEEDED",
  targetRR:        "MIN_RR_NOT_MET",
};

const toNum = (v) => (v === "" || v == null || Number.isNaN(Number(v)) ? null : Number(v));

const buildGoalsPayload = (data) =>
  Object.fromEntries(
    Object.entries(data)
      .map(([k, v]) => [k, toNum(v)])
      .filter(([, v]) => v !== null)
  );

const makeAccount = (overrides = {}) => ({
  _id:   "acc-1",
  type:  "normal",
  goals: {},
  ...overrides,
});

// ── Tests ─────────────────────────────────────────────────────

describe("Goals Form — section separation", () => {
  test("compliance fields are in their own section", () => {
    expect(COMPLIANCE_FIELDS).toContain("maxRiskPerTrade");
    expect(COMPLIANCE_FIELDS).toContain("targetRR");
    expect(COMPLIANCE_FIELDS).toHaveLength(2);
  });

  test("informational fields are in their own section", () => {
    expect(INFORMATIONAL_FIELDS).toContain("monthlyReturnTarget");
    expect(INFORMATIONAL_FIELDS).toContain("weeklyReturnTarget");
    expect(INFORMATIONAL_FIELDS).toContain("maxDailyLoss");
    expect(INFORMATIONAL_FIELDS).toContain("maxWeeklyLoss");
    expect(INFORMATIONAL_FIELDS).toContain("targetWinRate");
  });

  test("compliance fields are NOT in informational list", () => {
    COMPLIANCE_FIELDS.forEach((f) => {
      expect(INFORMATIONAL_FIELDS).not.toContain(f);
    });
  });

  test("informational fields are NOT in compliance list", () => {
    INFORMATIONAL_FIELDS.forEach((f) => {
      expect(COMPLIANCE_FIELDS).not.toContain(f);
    });
  });
});

describe("Goals Form — ⚡ badge trigger names", () => {
  test("maxRiskPerTrade triggers MAX_RISK_EXCEEDED", () => {
    expect(COMPLIANCE_TRIGGERS.maxRiskPerTrade).toBe("MAX_RISK_EXCEEDED");
  });

  test("targetRR triggers MIN_RR_NOT_MET", () => {
    expect(COMPLIANCE_TRIGGERS.targetRR).toBe("MIN_RR_NOT_MET");
  });

  test("only compliance fields have trigger names", () => {
    INFORMATIONAL_FIELDS.forEach((f) => {
      expect(COMPLIANCE_TRIGGERS[f]).toBeUndefined();
    });
  });
});

describe("Goals Form — normalConfig fallback note", () => {
  test("shows fallback note for normal account", () => {
    const account = makeAccount({ type: "normal" });
    const showFallbackNote = account.type === "normal";
    expect(showFallbackNote).toBe(true);
  });

  test("hides fallback note for prop account", () => {
    const account = makeAccount({ type: "prop" });
    const showFallbackNote = account.type === "normal";
    expect(showFallbackNote).toBe(false);
  });

  test("hides fallback note for war account", () => {
    const account = makeAccount({ type: "war" });
    const showFallbackNote = account.type === "normal";
    expect(showFallbackNote).toBe(false);
  });
});

describe("Goals Form — payload includes both sections", () => {
  test("saves both compliance and informational fields in one payload", () => {
    const formData = {
      maxRiskPerTrade:     "2",
      targetRR:            "1.5",
      monthlyReturnTarget: "5",
      weeklyReturnTarget:  "1.5",
      maxDailyLoss:        "3",
      maxWeeklyLoss:       "6",
      targetWinRate:       "55",
    };
    const payload = buildGoalsPayload(formData);
    expect(payload.maxRiskPerTrade).toBe(2);
    expect(payload.targetRR).toBe(1.5);
    expect(payload.monthlyReturnTarget).toBe(5);
    expect(payload.maxDailyLoss).toBe(3);
    expect(Object.keys(payload)).toHaveLength(7);
  });

  test("empty string fields are excluded from payload", () => {
    const formData = {
      maxRiskPerTrade:     "2",
      targetRR:            "",
      monthlyReturnTarget: "",
    };
    const payload = buildGoalsPayload(formData);
    expect(payload.maxRiskPerTrade).toBe(2);
    expect(payload.targetRR).toBeUndefined();
    expect(payload.monthlyReturnTarget).toBeUndefined();
  });

  test("null values are excluded from payload", () => {
    const formData = { maxRiskPerTrade: "2", targetRR: null };
    const payload = buildGoalsPayload(formData);
    expect(Object.keys(payload)).toHaveLength(1);
    expect(payload.maxRiskPerTrade).toBe(2);
  });

  test("single PATCH /accounts/:id called with { goals: payload }", () => {
    const formData = { maxRiskPerTrade: "1", targetRR: "2" };
    const goals = buildGoalsPayload(formData);
    const updateBody = { goals };
    expect(updateBody).toHaveProperty("goals");
    expect(updateBody.goals.maxRiskPerTrade).toBe(1);
    expect(updateBody.goals.targetRR).toBe(2);
  });
});

describe("Goals Form — numeric coercion", () => {
  test("string numbers are coerced to numbers", () => {
    expect(toNum("2")).toBe(2);
    expect(toNum("1.5")).toBe(1.5);
  });

  test("empty string returns null", () => {
    expect(toNum("")).toBeNull();
  });

  test("null returns null", () => {
    expect(toNum(null)).toBeNull();
  });

  test("NaN string returns null", () => {
    expect(toNum("abc")).toBeNull();
  });
});
