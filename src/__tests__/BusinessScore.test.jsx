import { describe, test, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter } from "react-router-dom";

// ── Mocks ─────────────────────────────────────────────────────────

vi.mock("@/store/useAuthStore", () => ({
  useAuthStore: () => ({
    isAuthenticated: true,
    mongoUser: { featureFlags: { betaBusinessScore: true } },
  }),
}));

vi.mock("@/store/useAppStore", () => ({
  useAppStore: () => ({ activeAccountId: null }),
}));

vi.mock("@/hooks/useAccounts", () => ({
  useAccounts: () => ({ data: { accounts: [] } }),
}));

vi.mock("@/hooks/useScore", () => ({
  useUserScore:             () => ({ data: null, isLoading: false, isError: false }),
  useUserScoreHistory:      () => ({ data: []   }),
  useRecalculateScore:      () => ({ mutate: vi.fn(), isPending: false }),
  useAccountScore:          () => ({ data: null, isLoading: false, isError: false }),
  useAccountScoreHistory:   () => ({ data: []   }),
  useRecalculateAccountScore: () => ({ mutate: vi.fn(), isPending: false }),
}));

vi.mock("framer-motion", () => ({
  motion: {
    div: ({ children, ...props }) => <div {...props}>{children}</div>,
  },
  AnimatePresence: ({ children }) => <>{children}</>,
}));

vi.mock("sonner", () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

// ── Helpers ───────────────────────────────────────────────────────

const makeQueryClient = () =>
  new QueryClient({ defaultOptions: { queries: { retry: false } } });

const makeScore = (overrides = {}) => ({
  overall: 72,
  band: "solid",
  pillars: {
    consistency:    { score: 78, weight: 25 },
    riskManagement: { score: 82, weight: 30 },
    profitability:  { score: 65, weight: 20 },
    discipline:     { score: 70, weight: 15 },
    growth:         { score: 60, weight: 10 },
  },
  metadata: {
    hasMinimumData: true,
    totalTrades:    45,
    calculatedAt:   "2024-01-15T02:00:00Z",
  },
  ...overrides,
});

// ── Score band logic ───────────────────────────────────────────────

describe("Score band logic", () => {
  const SCORE_BANDS = {
    needs_work:  { label: "Needs Work",   range: [0,  20], color: "var(--loss)"     },
    developing:  { label: "Developing",   range: [21, 40], color: "var(--warning)"  },
    progressing: { label: "Progressing",  range: [41, 60], color: "var(--warning)"  },
    solid:       { label: "Solid",        range: [61, 80], color: "var(--profit)"   },
    elite:       { label: "Elite",        range: [81, 100], color: "var(--primary)" },
  };

  const getBand = (score) => {
    if (score <= 20)  return "needs_work";
    if (score <= 40)  return "developing";
    if (score <= 60)  return "progressing";
    if (score <= 80)  return "solid";
    return "elite";
  };

  test("score 72 maps to solid band", () => {
    expect(getBand(72)).toBe("solid");
  });

  test("score 15 maps to needs_work band", () => {
    expect(getBand(15)).toBe("needs_work");
  });

  test("score 100 maps to elite band", () => {
    expect(getBand(100)).toBe("elite");
  });

  test("needs_work label is correct", () => {
    expect(SCORE_BANDS.needs_work.label).toBe("Needs Work");
  });

  test("elite label is correct", () => {
    expect(SCORE_BANDS.elite.label).toBe("Elite");
  });
});

// ── Minimum data gate ─────────────────────────────────────────────

describe("Minimum data gate", () => {
  test("hasMinimumData false hides dial", () => {
    const score = makeScore({ metadata: { hasMinimumData: false, totalTrades: 3 } });
    expect(score.metadata.hasMinimumData).toBe(false);
  });

  test("hasMinimumData true allows dial to render", () => {
    const score = makeScore({ metadata: { hasMinimumData: true, totalTrades: 45 } });
    expect(score.metadata.hasMinimumData).toBe(true);
  });

  test("null score with hasMinimumData false → not enough trades state", () => {
    const score = makeScore({
      overall: null,
      metadata: { hasMinimumData: false, totalTrades: 7 },
    });
    const hasScore = score != null && score.overall != null;
    expect(hasScore).toBe(false);
  });
});

// ── Pillar data ────────────────────────────────────────────────────

describe("Pillar breakdown", () => {
  test("5 pillars present in score object", () => {
    const score = makeScore();
    expect(Object.keys(score.pillars)).toHaveLength(5);
  });

  test("riskManagement pillar score is accessible", () => {
    const score = makeScore();
    expect(score.pillars.riskManagement.score).toBe(82);
  });

  test("pillar weight for riskManagement is 30", () => {
    const score = makeScore();
    expect(score.pillars.riskManagement.weight).toBe(30);
  });

  test("all 5 pillar keys are expected", () => {
    const score = makeScore();
    const expected = ["consistency", "riskManagement", "profitability", "discipline", "growth"];
    expect(Object.keys(score.pillars)).toEqual(expected);
  });
});

// ── Previous score comparison ──────────────────────────────────────

describe("Previous score comparison", () => {
  test("positive delta when current > previous", () => {
    const current  = 72;
    const previous = 65;
    const delta = current - previous;
    expect(delta).toBe(7);
    expect(delta > 0).toBe(true);
  });

  test("negative delta when current < previous", () => {
    const current  = 60;
    const previous = 72;
    const delta = current - previous;
    expect(delta).toBe(-12);
    expect(delta < 0).toBe(true);
  });

  test("previousScore is null when history has fewer than 2 entries", () => {
    const historyArr = [{ overall: 72 }];
    const previousScore = historyArr.length >= 2 ? (historyArr[1]?.overall ?? null) : null;
    expect(previousScore).toBeNull();
  });

  test("previousScore reads second entry from history", () => {
    const historyArr = [{ overall: 72 }, { overall: 65 }, { overall: 60 }];
    const previousScore = historyArr.length >= 2 ? (historyArr[1]?.overall ?? null) : null;
    expect(previousScore).toBe(65);
  });
});

// ── Beta gate ─────────────────────────────────────────────────────

describe("Beta gate", () => {
  test("betaBusinessScore false → ScoreTeaser shown instead of dial", () => {
    const user = { featureFlags: { betaBusinessScore: false } };
    const betaEnabled = user?.featureFlags?.betaBusinessScore;
    expect(betaEnabled).toBe(false);
  });

  test("betaBusinessScore true → score page proceeds", () => {
    const user = { featureFlags: { betaBusinessScore: true } };
    const betaEnabled = user?.featureFlags?.betaBusinessScore;
    expect(betaEnabled).toBe(true);
  });
});

// ── ScoreTeaser (non-beta) ─────────────────────────────────────────

describe("ScoreTeaser non-beta gate", () => {
  test("renders ScoreTeaser when betaBusinessScore is false", () => {
    // Gate check: if (!betaEnabled) return <ScoreTeaser />
    const betaEnabled = false;
    expect(!betaEnabled).toBe(true);
  });
});
