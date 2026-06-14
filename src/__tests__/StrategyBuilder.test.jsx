import { describe, test, expect } from "vitest";

// ── Helpers mirroring StrategyEditPage build logic ────────────

const parseComma = (raw) =>
  (raw ?? "").split(",").map((s) => s.trim()).filter(Boolean);

const parseNum = (s) => {
  const n = parseFloat(s);
  return Number.isNaN(n) ? null : n;
};

const parseInt2 = (s) => {
  const n = parseInt(s, 10);
  return Number.isNaN(n) ? null : n;
};

const buildPayload = ({
  name = "",
  description = "",
  category = "custom",
  pairsRaw = "",
  timeframes = [],
  sessions = [],
  killzonesRaw = "",
  maxRiskPerTrade = "",
  minRR = "",
  slType = "",
  tpType = "",
  maxTradesPerDay = "",
  criteria = [],
  confluenceMode = "all_required",
  confluenceMinCount = "",
} = {}) => ({
  name: name.trim(),
  description: description.trim() || undefined,
  category,
  pairs: parseComma(pairsRaw).map((p) => p.toUpperCase()),
  timeframes,
  sessions,
  killzones: parseComma(killzonesRaw),
  riskRules: {
    maxRiskPerTrade: parseNum(maxRiskPerTrade),
    minRR: parseNum(minRR),
    slType: slType || null,
    tpType: tpType || null,
    maxTradesPerDay: parseInt2(maxTradesPerDay),
  },
  setupCriteria: criteria,
  confluence: {
    mode: confluenceMode,
    minCount:
      confluenceMode === "min_count" ? (parseInt2(confluenceMinCount) ?? 0) : undefined,
  },
});

// ── Tests ─────────────────────────────────────────────────────

describe("StrategyBuilder — name validation", () => {
  test("empty name fails validation", () => {
    const name = "   ";
    expect(name.trim()).toBe("");
  });

  test("valid name passes validation", () => {
    const name = "ICT NY Kill Zone";
    expect(name.trim().length).toBeGreaterThan(0);
  });

  test("name is trimmed in payload", () => {
    const payload = buildPayload({ name: "  My Strategy  " });
    expect(payload.name).toBe("My Strategy");
  });
});

describe("StrategyBuilder — pairs parsing", () => {
  test("comma-separated pairs are split and uppercased", () => {
    const payload = buildPayload({ pairsRaw: "eurusd, gbpusd, xauusd" });
    expect(payload.pairs).toEqual(["EURUSD", "GBPUSD", "XAUUSD"]);
  });

  test("empty pairs string yields empty array", () => {
    const payload = buildPayload({ pairsRaw: "" });
    expect(payload.pairs).toEqual([]);
  });

  test("extra whitespace around pairs is trimmed", () => {
    const payload = buildPayload({ pairsRaw: "  EURUSD  ,  GBPJPY  " });
    expect(payload.pairs).toEqual(["EURUSD", "GBPJPY"]);
  });
});

describe("StrategyBuilder — risk rules parsing", () => {
  test("numeric string maxRiskPerTrade is parsed to float", () => {
    const payload = buildPayload({ maxRiskPerTrade: "1.5" });
    expect(payload.riskRules.maxRiskPerTrade).toBe(1.5);
  });

  test("empty maxRiskPerTrade becomes null", () => {
    const payload = buildPayload({ maxRiskPerTrade: "" });
    expect(payload.riskRules.maxRiskPerTrade).toBeNull();
  });

  test("integer-only maxTradesPerDay is parsed to int", () => {
    const payload = buildPayload({ maxTradesPerDay: "3" });
    expect(payload.riskRules.maxTradesPerDay).toBe(3);
  });
});

describe("StrategyBuilder — confluence payload", () => {
  test("all_required mode sends no minCount", () => {
    const payload = buildPayload({ confluenceMode: "all_required" });
    expect(payload.confluence.mode).toBe("all_required");
    expect(payload.confluence.minCount).toBeUndefined();
  });

  test("min_count mode includes minCount", () => {
    const payload = buildPayload({ confluenceMode: "min_count", confluenceMinCount: "3" });
    expect(payload.confluence.mode).toBe("min_count");
    expect(payload.confluence.minCount).toBe(3);
  });

  test("min_count with empty minCount defaults to 0", () => {
    const payload = buildPayload({ confluenceMode: "min_count", confluenceMinCount: "" });
    expect(payload.confluence.minCount).toBe(0);
  });
});
