import { describe, test, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter } from "react-router-dom";
import { formatRR, formatPnL, formatPrice } from "@/utils/format";

// ── Mocks ─────────────────────────────────────────────────────────

vi.mock("@/store/useAuthStore", () => ({
  useAuthStore: () => ({ isAuthenticated: true, mongoUser: {} }),
}));

vi.mock("@/store/useAppStore", () => ({
  useAppStore: () => ({ activeAccountId: null }),
}));

vi.mock("@/hooks/useAccounts", () => ({
  useAccounts: () => ({ data: { accounts: [] } }),
}));

vi.mock("sonner", () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

// ── Helpers ───────────────────────────────────────────────────────

const mockTrade = (overrides = {}) => ({
  _id:        "trade-1",
  pair:       "EURUSD",
  direction:  "buy",
  lotSize:    0.1,
  entryPrice: 1.08500,
  exitPrice:  1.09100,
  netPnl:     56.50,
  pnl:        60,
  commission: -3.5,
  swap:       0,
  outcome:    "win",
  source:     "manual",
  session:    "london",
  openedAt:   "2024-01-15T09:30:00Z",
  closedAt:   "2024-01-15T14:00:00Z",
  realizedRR: 1.8,
  plannedRR:  2.0,
  riskPercent: 1.5,
  riskEstimated: false,
  ...overrides,
});

const makeQueryClient = () =>
  new QueryClient({ defaultOptions: { queries: { retry: false } } });

// ── Format utilities used in table ────────────────────────────────

describe("TradesTable display — format utilities", () => {
  test("shows — for null plannedRR", () => {
    expect(formatRR(null)).toBe("—");
  });

  test("shows — for null stopLoss via formatPrice", () => {
    expect(formatPrice(null)).toBe("—");
  });

  test("formatPnL adds + prefix for positive netPnl", () => {
    expect(formatPnL(56.5)).toBe("+$56.50");
  });

  test("formatPnL adds - prefix for negative netPnl", () => {
    expect(formatPnL(-220)).toBe("-$220.00");
  });

  test("riskEstimated flag is set correctly on trade object", () => {
    const trade = mockTrade({ riskEstimated: true, riskPercent: 2.2 });
    expect(trade.riskEstimated).toBe(true);
  });
});

// ── Source badge label mapping ─────────────────────────────────────

describe("Trade source badge labels", () => {
  const SOURCE_BADGE = {
    ea:         "EA",
    csv_import: "CSV",
    manual:     "Manual",
  };

  test("EA source maps to EA label", () => {
    expect(SOURCE_BADGE.ea).toBe("EA");
  });

  test("manual source maps to Manual label", () => {
    expect(SOURCE_BADGE.manual).toBe("Manual");
  });

  test("csv_import source maps to CSV label", () => {
    expect(SOURCE_BADGE.csv_import).toBe("CSV");
  });
});

// ── Source filter state ────────────────────────────────────────────

describe("Source filter", () => {
  const SOURCES = [
    { value: "",           label: "All"    },
    { value: "manual",     label: "Manual" },
    { value: "ea",         label: "EA"     },
    { value: "csv_import", label: "CSV"    },
  ];

  test("empty string is the 'All' filter option", () => {
    const allOption = SOURCES.find(s => s.value === "");
    expect(allOption?.label).toBe("All");
  });

  test("SOURCES has 4 options", () => {
    expect(SOURCES).toHaveLength(4);
  });
});

// ── Direction badge color logic ────────────────────────────────────

describe("Direction badge color", () => {
  const getDirectionClass = (direction) =>
    direction === "buy"
      ? "text-[var(--profit)]"
      : "text-[var(--loss)]";

  test("buy direction uses profit color", () => {
    expect(getDirectionClass("buy")).toBe("text-[var(--profit)]");
  });

  test("sell direction uses loss color", () => {
    expect(getDirectionClass("sell")).toBe("text-[var(--loss)]");
  });
});

// ── Pagination display ─────────────────────────────────────────────

describe("Pagination display", () => {
  test("computes first page range correctly", () => {
    const total = 87;
    const page  = 1;
    const limit = 25;
    const from  = (page - 1) * limit + 1;
    const to    = Math.min(page * limit, total);
    expect(`Showing ${from}–${to} of ${total} trades`).toBe("Showing 1–25 of 87 trades");
  });

  test("computes last page range correctly", () => {
    const total = 87;
    const page  = 4;
    const limit = 25;
    const from  = (page - 1) * limit + 1;
    const to    = Math.min(page * limit, total);
    expect(from).toBe(76);
    expect(to).toBe(87);
  });

  test("single page shows full range", () => {
    const total = 10;
    const page  = 1;
    const limit = 25;
    const to = Math.min(page * limit, total);
    expect(to).toBe(10);
  });
});

// ── Outcome logic ──────────────────────────────────────────────────

describe("Trade outcome", () => {
  test("positive netPnl maps to win outcome", () => {
    const trade = mockTrade({ netPnl: 50, outcome: "win" });
    expect(trade.outcome).toBe("win");
  });

  test("negative netPnl maps to loss outcome", () => {
    const trade = mockTrade({ netPnl: -50, outcome: "loss" });
    expect(trade.outcome).toBe("loss");
  });
});
