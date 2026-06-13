import { describe, test, expect } from "vitest";
import {
  formatCurrency,
  formatPnL,
  formatPercent,
  formatRelativeTime,
  formatRR,
  formatPips,
  formatPrice,
  formatDuration,
} from "@/utils/format";

// ── formatCurrency ────────────────────────────────────────────────

describe("formatCurrency", () => {
  test("formats positive value correctly", () => {
    expect(formatCurrency(1234.56)).toBe("$1,234.56");
  });

  test("formats negative value correctly", () => {
    expect(formatCurrency(-1234.56)).toBe("-$1,234.56");
  });

  test("returns — for null", () => {
    expect(formatCurrency(null)).toBe("—");
  });

  test("returns — for undefined", () => {
    expect(formatCurrency(undefined)).toBe("—");
  });

  test("formats zero correctly", () => {
    expect(formatCurrency(0)).toBe("$0.00");
  });
});

// ── formatPnL ─────────────────────────────────────────────────────

describe("formatPnL", () => {
  test("adds + prefix for positive values", () => {
    expect(formatPnL(330)).toBe("+$330.00");
  });

  test("adds - prefix for negative values", () => {
    expect(formatPnL(-220)).toBe("-$220.00");
  });

  test("returns — for null", () => {
    expect(formatPnL(null)).toBe("—");
  });

  test("returns — for undefined", () => {
    expect(formatPnL(undefined)).toBe("—");
  });

  test("formats zero without prefix", () => {
    expect(formatPnL(0)).toBe("+$0.00");
  });
});

// ── formatPercent ─────────────────────────────────────────────────

describe("formatPercent", () => {
  test("formats positive value with + prefix", () => {
    expect(formatPercent(5.5)).toBe("+5.5%");
  });

  test("formats negative value", () => {
    expect(formatPercent(-2.3)).toBe("-2.3%");
  });

  test("returns — for null", () => {
    expect(formatPercent(null)).toBe("—");
  });
});

// ── formatRR ──────────────────────────────────────────────────────

describe("formatRR", () => {
  test("formats positive RR as 1:X", () => {
    expect(formatRR(2.64)).toBe("1:2.64");
  });

  test("formats 1.0 RR correctly", () => {
    expect(formatRR(1)).toBe("1:1.00");
  });

  test("formats negative RR with minus sign", () => {
    expect(formatRR(-1.0)).toBe("−1:1.00");
  });

  test("formats zero as 1:0.00", () => {
    expect(formatRR(0)).toBe("1:0.00");
  });

  test("returns — for null", () => {
    expect(formatRR(null)).toBe("—");
  });

  test("returns — for undefined", () => {
    expect(formatRR(undefined)).toBe("—");
  });
});

// ── formatPips ────────────────────────────────────────────────────

describe("formatPips", () => {
  test("formats positive pips with + prefix", () => {
    expect(formatPips(50)).toBe("+50.0 pips");
  });

  test("formats negative pips without + prefix", () => {
    expect(formatPips(-25.5)).toBe("-25.5 pips");
  });

  test("formats zero pips", () => {
    expect(formatPips(0)).toBe("0.0 pips");
  });

  test("returns — for null", () => {
    expect(formatPips(null)).toBe("—");
  });

  test("returns — for undefined", () => {
    expect(formatPips(undefined)).toBe("—");
  });
});

// ── formatPrice ───────────────────────────────────────────────────

describe("formatPrice", () => {
  test("EURUSD → 5 decimal places", () => {
    expect(formatPrice(1.0842, "EURUSD")).toBe("1.08420");
  });

  test("USDJPY → 3 decimal places", () => {
    expect(formatPrice(149.5, "USDJPY")).toBe("149.500");
  });

  test("XAUUSD → 2 decimal places", () => {
    expect(formatPrice(2350.12, "XAUUSD")).toBe("2350.12");
  });

  test("BTCUSD → 2 decimal places", () => {
    expect(formatPrice(65000.5, "BTCUSD")).toBe("65000.50");
  });

  test("no pair → 5 decimal places default", () => {
    expect(formatPrice(1.08420)).toBe("1.08420");
  });

  test("returns — for null", () => {
    expect(formatPrice(null)).toBe("—");
  });

  test("returns — for undefined", () => {
    expect(formatPrice(undefined)).toBe("—");
  });
});

// ── formatDuration ────────────────────────────────────────────────

describe("formatDuration", () => {
  const base = new Date("2024-01-15T09:00:00Z");

  test("calculates minutes correctly", () => {
    const end = new Date("2024-01-15T09:30:00Z").toISOString();
    expect(formatDuration(base.toISOString(), end)).toBe("30m");
  });

  test("calculates hours and minutes", () => {
    const end = new Date("2024-01-15T11:15:00Z").toISOString();
    expect(formatDuration(base.toISOString(), end)).toBe("2h 15m");
  });

  test("calculates days and hours", () => {
    const end = new Date("2024-01-16T13:00:00Z").toISOString();
    expect(formatDuration(base.toISOString(), end)).toBe("1d 4h");
  });

  test("returns — for null start", () => {
    expect(formatDuration(null, base.toISOString())).toBe("—");
  });

  test("returns — for null end", () => {
    expect(formatDuration(base.toISOString(), null)).toBe("—");
  });

  test("returns — for both null", () => {
    expect(formatDuration(null, null)).toBe("—");
  });

  test("returns — when end is before start", () => {
    const before = new Date("2024-01-14T08:00:00Z").toISOString();
    expect(formatDuration(base.toISOString(), before)).toBe("—");
  });
});

// ── formatRelativeTime ────────────────────────────────────────────

describe("formatRelativeTime", () => {
  test("returns just now for very recent time", () => {
    const now = new Date().toISOString();
    expect(formatRelativeTime(now)).toBe("just now");
  });

  test("returns — for null", () => {
    expect(formatRelativeTime(null)).toBe("—");
  });

  test("returns — for undefined", () => {
    expect(formatRelativeTime(undefined)).toBe("—");
  });
});
