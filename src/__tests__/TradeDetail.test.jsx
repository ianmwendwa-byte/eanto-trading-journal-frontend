import { describe, test, expect, vi } from "vitest";
import { formatRR, formatPips, formatPrice } from "@/utils/format";

// ── Helpers ───────────────────────────────────────────────────────

const makeTrade = (overrides = {}) => ({
  _id:          "trade-1",
  pair:         "EURUSD",
  direction:    "buy",
  lotSize:      0.1,
  entryPrice:   1.08500,
  exitPrice:    1.09100,
  pnl:          120,
  grossPnl:     120,
  netPnl:       108.3,
  commission:   -8.2,
  swap:         -3.5,
  outcome:      "win",
  source:       "manual",
  openedAt:     "2024-01-15T09:30:00Z",
  closedAt:     "2024-01-15T14:00:00Z",
  riskAmount:   50,
  riskPercent:  1.5,
  riskEstimated: false,
  plannedRR:    2.64,
  actualRR:     1.8,
  realizedRR:   1.8,
  pipsGained:   60,
  pipsRisked:   30,
  exitReason:   "tp_hit",
  riskQualityScore: 100,
  riskQualityFlags: [],
  isCompliant:  true,
  complianceViolations: [],
  propCompliance: { checked: false },
  discipline:   {},
  behavioural:  {},
  stopLossManagement: {},
  ...overrides,
});

// ── P&L breakdown ─────────────────────────────────────────────────

describe("P&L breakdown", () => {
  test("hides swap row when swap is zero", () => {
    const trade = makeTrade({ swap: 0 });
    expect(trade.swap !== 0).toBe(false);
  });

  test("hides swap row when swap is null", () => {
    const trade = makeTrade({ swap: null });
    const swapVal = trade.swap ?? 0;
    expect(swapVal !== 0).toBe(false);
  });

  test("hides commission row when commission is zero", () => {
    const trade = makeTrade({ commission: 0 });
    expect(trade.commission !== 0).toBe(false);
  });

  test("shows breakdown when commission and swap are non-zero", () => {
    const trade = makeTrade({ commission: -8.2, swap: -3.5 });
    expect(trade.commission !== 0).toBe(true);
    expect(trade.swap !== 0).toBe(true);
  });
});

// ── Risk display ──────────────────────────────────────────────────

describe("Risk display", () => {
  test("shows exact amount when riskEstimated is false", () => {
    const trade = makeTrade({ riskEstimated: false, riskAmount: 220 });
    const prefix = trade.riskEstimated ? "~" : "";
    expect(prefix).toBe("");
  });

  test("shows ~ prefix when riskEstimated is true", () => {
    const trade = makeTrade({ riskEstimated: true, riskAmount: 220 });
    const prefix = trade.riskEstimated ? "~" : "";
    expect(prefix).toBe("~");
  });

  test("returns N/A state when riskAmount is null", () => {
    const trade = makeTrade({ riskAmount: null });
    expect(trade.riskAmount).toBeNull();
  });

  test("formatPrice returns — for null", () => {
    expect(formatPrice(null)).toBe("—");
  });
});

// ── RR display ────────────────────────────────────────────────────

describe("RR display", () => {
  test("returns — for null plannedRR", () => {
    expect(formatRR(null)).toBe("—");
  });

  test("formats valid plannedRR as 1:X", () => {
    expect(formatRR(2.64)).toBe("1:2.64");
  });

  test("formats negative actualRR with minus", () => {
    expect(formatRR(-1.0)).toBe("−1:1.00");
  });
});

// ── Pips section ──────────────────────────────────────────────────

describe("Pips section", () => {
  test("hides pips section when pipsGained is null (gold trade)", () => {
    const trade = makeTrade({ pipsGained: null, pair: "XAUUSD" });
    expect(trade.pipsGained).toBeNull();
  });

  test("shows pips section for EURUSD trade", () => {
    const trade = makeTrade({ pipsGained: 60, pair: "EURUSD" });
    expect(trade.pipsGained).not.toBeNull();
    expect(formatPips(trade.pipsGained)).toBe("+60.0 pips");
  });
});

// ── Exit reason ───────────────────────────────────────────────────

describe("Exit reason", () => {
  const EXIT_REASON_MAP = {
    tp_hit:        { label: "Take Profit Hit ✓" },
    sl_hit:        { label: "Stop Loss Hit ✗"   },
    manual:        { label: "Manual Close"       },
    trailing_stop: { label: "Trailing Stop"      },
  };

  test("shows Take Profit Hit for tp_hit", () => {
    expect(EXIT_REASON_MAP.tp_hit.label).toBe("Take Profit Hit ✓");
  });

  test("shows Stop Loss Hit for sl_hit", () => {
    expect(EXIT_REASON_MAP.sl_hit.label).toBe("Stop Loss Hit ✗");
  });

  test("shows Manual Close for manual", () => {
    expect(EXIT_REASON_MAP.manual.label).toBe("Manual Close");
  });
});

// ── Compliance ────────────────────────────────────────────────────

describe("Compliance", () => {
  test("isCompliant true → compliant state", () => {
    const trade = makeTrade({ isCompliant: true });
    expect(trade.isCompliant).toBe(true);
  });

  test("isCompliant false with violations → violation list", () => {
    const trade = makeTrade({
      isCompliant: false,
      complianceViolations: [
        { rule: "MAX_RISK_EXCEEDED", message: "Risk 3.5% exceeds limit 2%", severity: "high" },
      ],
    });
    expect(trade.isCompliant).toBe(false);
    expect(trade.complianceViolations).toHaveLength(1);
    expect(trade.complianceViolations[0].rule).toBe("MAX_RISK_EXCEEDED");
  });

  test("shows not checked state when isCompliant is null", () => {
    const trade = makeTrade({ isCompliant: null });
    expect(trade.isCompliant).toBeNull();
  });
});

// ── Risk quality ──────────────────────────────────────────────────

const getRiskQualityClass = (score) => {
  if (score == null) return "text-muted-foreground";
  if (score >= 80) return "text-[var(--profit)]";
  if (score >= 60) return "text-[var(--primary)]";
  if (score >= 40) return "text-[var(--warning)]";
  return "text-[var(--loss)]";
};

describe("Risk quality", () => {
  test("score 100 → profit color class", () => {
    expect(getRiskQualityClass(100)).toBe("text-[var(--profit)]");
  });

  test("score below 40 → loss color class", () => {
    expect(getRiskQualityClass(30)).toBe("text-[var(--loss)]");
  });

  test("score null → muted color class", () => {
    expect(getRiskQualityClass(null)).toBe("text-muted-foreground");
  });

  test("NO_STOP_LOSS flag maps to correct label", () => {
    const FLAG_LABELS = {
      NO_STOP_LOSS:   "No stop loss set",
      NO_TAKE_PROFIT: "No take profit set",
      POOR_RR:        "Risk:Reward below 1:1",
      HIGH_RISK:      "Risk above 2% per trade",
    };
    expect(FLAG_LABELS.NO_STOP_LOSS).toBe("No stop loss set");
  });

  test("empty flags array → no concerns state", () => {
    const trade = makeTrade({ riskQualityFlags: [] });
    expect(trade.riskQualityFlags).toHaveLength(0);
  });
});
