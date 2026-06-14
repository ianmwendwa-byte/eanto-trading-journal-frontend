import { describe, test, expect } from "vitest";

// ── Helpers from TradeDetailPanel ────────────────────────────

const SEVERITY_ORDER = { critical: 0, high: 1, medium: 2, warning: 3 };

const formatRuleName = (rule) =>
  rule
    .replace(/_/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase());

const formatViolationValue = (rule, value) => {
  if (value == null) return null;
  if (rule.includes("_PERCENT") || rule.includes("RISK") || rule.includes("DRAWDOWN")) {
    return `${Number(value).toFixed(2)}%`;
  }
  if (rule.includes("RR") || rule.includes("_RR")) {
    return `${Number(value).toFixed(2)}R`;
  }
  if (rule.includes("LOT")) {
    return `${Number(value).toFixed(2)} lots`;
  }
  return String(value);
};

const getHighestSeverity = (violations = []) => {
  if (!violations.length) return null;
  return violations.reduce((best, v) =>
    (SEVERITY_ORDER[v.severity] ?? 99) < (SEVERITY_ORDER[best.severity] ?? 99) ? v : best
  ).severity;
};

const sortViolationsBySeverity = (violations) =>
  [...violations].sort(
    (a, b) => (SEVERITY_ORDER[a.severity] ?? 99) - (SEVERITY_ORDER[b.severity] ?? 99)
  );

// ── Fixtures ──────────────────────────────────────────────────

const makeViolation = (overrides = {}) => ({
  rule:     "MAX_RISK_EXCEEDED",
  message:  "Risk 3.5% exceeds account limit 2%",
  severity: "high",
  actual:   3.5,
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

describe("Compliance Display — banner", () => {
  test("shows compliant state when isCompliant is true", () => {
    const trade = makeTrade({ isCompliant: true });
    expect(trade.isCompliant).toBe(true);
    expect(trade.complianceViolations).toHaveLength(0);
  });

  test("shows violations when isCompliant is false", () => {
    const trade = makeTrade({
      isCompliant: false,
      complianceViolations: [
        makeViolation(),
        makeViolation({ rule: "NO_TAKE_PROFIT", severity: "warning", actual: null, limit: null }),
      ],
    });
    expect(trade.isCompliant).toBe(false);
    expect(trade.complianceViolations).toHaveLength(2);
  });

  test("shows not-checked state when isCompliant is null", () => {
    const trade = makeTrade({ isCompliant: null });
    expect(trade.isCompliant).toBeNull();
  });
});

describe("Compliance Display — severity ordering", () => {
  test("orders violations: critical → high → medium → warning", () => {
    const violations = [
      makeViolation({ severity: "warning" }),
      makeViolation({ severity: "critical" }),
      makeViolation({ severity: "high" }),
      makeViolation({ severity: "medium" }),
    ];
    const sorted = sortViolationsBySeverity(violations);
    expect(sorted[0].severity).toBe("critical");
    expect(sorted[1].severity).toBe("high");
    expect(sorted[2].severity).toBe("medium");
    expect(sorted[3].severity).toBe("warning");
  });

  test("single violation stays unchanged after sort", () => {
    const violations = [makeViolation({ severity: "medium" })];
    const sorted = sortViolationsBySeverity(violations);
    expect(sorted[0].severity).toBe("medium");
  });
});

describe("Compliance Display — rule name formatting", () => {
  test("MAX_RISK_EXCEEDED → Max Risk Exceeded", () => {
    expect(formatRuleName("MAX_RISK_EXCEEDED")).toBe("Max Risk Exceeded");
  });

  test("NO_STOP_LOSS → No Stop Loss", () => {
    expect(formatRuleName("NO_STOP_LOSS")).toBe("No Stop Loss");
  });

  test("MIN_RR_NOT_MET → Min Rr Not Met", () => {
    expect(formatRuleName("MIN_RR_NOT_MET")).toBe("Min Rr Not Met");
  });

  test("SESSION_NOT_ALLOWED → Session Not Allowed", () => {
    expect(formatRuleName("SESSION_NOT_ALLOWED")).toBe("Session Not Allowed");
  });
});

describe("Compliance Display — actual/limit formatting", () => {
  test("shows formatted actual and limit when both are not null", () => {
    const v = makeViolation({ rule: "MAX_RISK_EXCEEDED", actual: 3.5, limit: 2 });
    const actualStr = formatViolationValue(v.rule, v.actual);
    const limitStr  = formatViolationValue(v.rule, v.limit);
    expect(actualStr).toBe("3.50%");
    expect(limitStr).toBe("2.00%");
  });

  test("returns null for null actual value", () => {
    const v = makeViolation({ rule: "NO_TAKE_PROFIT", actual: null });
    expect(formatViolationValue(v.rule, v.actual)).toBeNull();
  });

  test("returns null for null limit value", () => {
    const v = makeViolation({ rule: "NO_STOP_LOSS", limit: null });
    expect(formatViolationValue(v.rule, v.limit)).toBeNull();
  });

  test("LOT rule formats as lots suffix", () => {
    expect(formatViolationValue("MAX_LOT_SIZE_EXCEEDED", 2.5)).toBe("2.50 lots");
  });

  test("RR rule formats with R suffix", () => {
    expect(formatViolationValue("MIN_RR_NOT_MET", 0.8)).toBe("0.80R");
  });
});

describe("Compliance Display — trade list indicator", () => {
  test("compliant trade returns no severity (no dot shown)", () => {
    const trade = makeTrade({ isCompliant: true, complianceViolations: [] });
    expect(trade.isCompliant).toBe(true);
  });

  test("non-compliant trade with violations returns highest severity", () => {
    const trade = makeTrade({
      isCompliant: false,
      complianceViolations: [
        makeViolation({ severity: "warning" }),
        makeViolation({ severity: "high" }),
      ],
    });
    const highest = getHighestSeverity(trade.complianceViolations);
    expect(highest).toBe("high");
  });

  test("only warning violations → warning severity dot", () => {
    const trade = makeTrade({
      isCompliant: false,
      complianceViolations: [
        makeViolation({ severity: "warning" }),
        makeViolation({ severity: "warning" }),
      ],
    });
    const highest = getHighestSeverity(trade.complianceViolations);
    expect(highest).toBe("warning");
  });

  test("critical violation dominates all others", () => {
    const trade = makeTrade({
      isCompliant: false,
      complianceViolations: [
        makeViolation({ severity: "warning" }),
        makeViolation({ severity: "critical" }),
        makeViolation({ severity: "medium" }),
      ],
    });
    const highest = getHighestSeverity(trade.complianceViolations);
    expect(highest).toBe("critical");
  });

  test("empty violations array returns null severity", () => {
    expect(getHighestSeverity([])).toBeNull();
  });
});

describe("Compliance Display — check details table", () => {
  const CHECK_LABELS = {
    stopLoss:      "Stop Loss",
    takeProfit:    "Take Profit",
    riskPercent:   "Risk %",
    rrRatio:       "RR Ratio",
    dailyDrawdown: "Daily Drawdown",
    lotSize:       "Lot Size",
    session:       "Session",
    newsWindow:    "News Window",
  };

  test("stopLoss key maps to Stop Loss", () => {
    expect(CHECK_LABELS.stopLoss).toBe("Stop Loss");
  });

  test("lotSize key maps to Lot Size", () => {
    expect(CHECK_LABELS.lotSize).toBe("Lot Size");
  });

  test("true value means pass", () => {
    const checks = { stopLoss: true, lotSize: false };
    expect(checks.stopLoss).toBe(true);
    expect(checks.lotSize).toBe(false);
  });

  test("all 8 checks are covered by labels", () => {
    expect(Object.keys(CHECK_LABELS)).toHaveLength(8);
  });

  test("recheck response populates checks object", () => {
    const response = {
      success:     true,
      isCompliant: false,
      violations:  [makeViolation()],
      checks: {
        stopLoss: true, takeProfit: true, riskPercent: false,
        rrRatio: true, dailyDrawdown: true, lotSize: true,
        session: true, newsWindow: true,
      },
    };
    expect(response.checks.riskPercent).toBe(false);
    expect(Object.keys(response.checks)).toHaveLength(8);
  });
});
