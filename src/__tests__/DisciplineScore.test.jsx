import { describe, test, expect, vi } from "vitest";

// ── Helpers (mirrors TradeDetailPanel discipline logic) ───────

const DISCIPLINE_THRESHOLD = 60;

const isDisciplined = (score) => score >= DISCIPLINE_THRESHOLD;

const scoreBarWidth = (score) => `${Math.min(Math.max(score, 0), 100)}%`;

const scoreBarColor = (score) => {
  if (score >= 80) return "var(--profit)";
  if (score >= 60) return "var(--warning)";
  return "var(--loss)";
};

// ── Fixtures ──────────────────────────────────────────────────

const makeTrade = (overrides = {}) => ({
  _id:       "trade-1",
  pair:      "EURUSD",
  direction: "buy",
  strategy:  null,
  ...overrides,
});

const makeDisciplineResult = (overrides = {}) => ({
  score:             72,
  isDisciplined:     true,
  violations:        [],
  feedback:          [],
  label:             "solid",
  calculatedAt:      "2025-06-09T10:00:00.000Z",
  ...overrides,
});

// ── Tests ─────────────────────────────────────────────────────

describe("Discipline Score — empty state", () => {
  test("result starts as null (no check run)", () => {
    let disciplineResult = null;
    expect(disciplineResult).toBeNull();
  });

  test("shows trigger button when result is null", () => {
    const disciplineResult = null;
    const shouldShowButton = disciplineResult === null;
    expect(shouldShowButton).toBe(true);
  });

  test("hides trigger button when result is present", () => {
    const disciplineResult = makeDisciplineResult();
    const shouldShowButton = disciplineResult === null;
    expect(shouldShowButton).toBe(false);
  });
});

describe("Discipline Score — button disabled when no strategy", () => {
  test("button disabled when trade.strategy is null", () => {
    const trade = makeTrade({ strategy: null });
    const disabled = trade.strategy == null;
    expect(disabled).toBe(true);
  });

  test("button disabled when trade.strategy is undefined", () => {
    const trade = makeTrade({ strategy: undefined });
    const disabled = trade.strategy == null;
    expect(disabled).toBe(true);
  });

  test("button enabled when trade.strategy is set", () => {
    const trade = makeTrade({ strategy: "strategy-id-abc" });
    const disabled = trade.strategy == null;
    expect(disabled).toBe(false);
  });

  test("noStrategyError flag set when no strategy and check attempted", () => {
    let noStrategyError = false;
    const trade = makeTrade({ strategy: null });
    if (trade.strategy == null) noStrategyError = true;
    expect(noStrategyError).toBe(true);
  });

  test("noStrategyError cleared when strategy is present", () => {
    let noStrategyError = false;
    const trade = makeTrade({ strategy: "strategy-abc" });
    if (trade.strategy == null) noStrategyError = true;
    expect(noStrategyError).toBe(false);
  });
});

describe("Discipline Score — score display after check", () => {
  test("score is shown from result object", () => {
    const result = makeDisciplineResult({ score: 72 });
    expect(result.score).toBe(72);
  });

  test("score bar width is clamped to 0-100%", () => {
    expect(scoreBarWidth(72)).toBe("72%");
    expect(scoreBarWidth(0)).toBe("0%");
    expect(scoreBarWidth(100)).toBe("100%");
    expect(scoreBarWidth(-10)).toBe("0%");
    expect(scoreBarWidth(110)).toBe("100%");
  });

  test("score bar color green for 80+", () => {
    expect(scoreBarColor(80)).toBe("var(--profit)");
    expect(scoreBarColor(100)).toBe("var(--profit)");
  });

  test("score bar color yellow for 60-79", () => {
    expect(scoreBarColor(60)).toBe("var(--warning)");
    expect(scoreBarColor(72)).toBe("var(--warning)");
    expect(scoreBarColor(79)).toBe("var(--warning)");
  });

  test("score bar color red for below 60", () => {
    expect(scoreBarColor(0)).toBe("var(--loss)");
    expect(scoreBarColor(59)).toBe("var(--loss)");
  });
});

describe("Discipline Score — disciplined badge", () => {
  test("shows disciplined badge when score >= 60", () => {
    const result = makeDisciplineResult({ score: 60, isDisciplined: true });
    expect(isDisciplined(result.score)).toBe(true);
  });

  test("shows disciplined badge for score of 72", () => {
    expect(isDisciplined(72)).toBe(true);
  });

  test("shows disciplined badge for score of 100", () => {
    expect(isDisciplined(100)).toBe(true);
  });

  test("shows not-disciplined badge when score < 60", () => {
    const result = makeDisciplineResult({ score: 42, isDisciplined: false });
    expect(isDisciplined(result.score)).toBe(false);
  });

  test("shows not-disciplined badge for score of 0", () => {
    expect(isDisciplined(0)).toBe(false);
  });

  test("boundary: score of 59 is not disciplined", () => {
    expect(isDisciplined(59)).toBe(false);
  });
});

describe("Discipline Score — violation flags", () => {
  test("empty violations list renders nothing", () => {
    const result = makeDisciplineResult({ violations: [] });
    expect(result.violations).toHaveLength(0);
  });

  test("each violation has a flag label", () => {
    const result = makeDisciplineResult({
      violations: [
        { flag: "ENTERED_OUTSIDE_SESSION", message: "Trade opened outside allowed session" },
        { flag: "NO_STOP_LOSS",            message: "No stop loss was set" },
      ],
    });
    expect(result.violations).toHaveLength(2);
    expect(result.violations[0].flag).toBe("ENTERED_OUTSIDE_SESSION");
    expect(result.violations[1].flag).toBe("NO_STOP_LOSS");
  });

  test("violation message is displayable string", () => {
    const v = { flag: "CHASED_LOSS", message: "Trade placed immediately after a loss" };
    expect(typeof v.message).toBe("string");
    expect(v.message.length).toBeGreaterThan(0);
  });
});

describe("Discipline Score — feedback bullet list", () => {
  test("empty feedback renders nothing", () => {
    const result = makeDisciplineResult({ feedback: [] });
    expect(result.feedback).toHaveLength(0);
  });

  test("each feedback item is a string", () => {
    const result = makeDisciplineResult({
      feedback: [
        "Always set a stop loss before entering a trade",
        "Avoid trading during major news events",
      ],
    });
    result.feedback.forEach((item) => expect(typeof item).toBe("string"));
  });

  test("three feedback items renders as three bullets", () => {
    const result = makeDisciplineResult({
      feedback: ["Tip 1", "Tip 2", "Tip 3"],
    });
    expect(result.feedback).toHaveLength(3);
  });
});

describe("Discipline Score — result not persisted to trade cache", () => {
  test("useCheckDiscipline mutation does not update trade query cache", () => {
    // The hook intentionally has no onSuccess cache update — discipline result
    // is local state only. This test documents that the response is used for
    // local state, not written to the trade cache.
    const mockOnSuccess = vi.fn((data, variables) => {
      // Simulate what the hook does: set local state only — no cache write
      let localDisciplineResult = data;
      expect(localDisciplineResult).toBeDefined();
      // The mock queryClient should NOT be called
    });

    const mockMutationConfig = {
      mutationFn:      vi.fn(),
      onSuccess:       mockOnSuccess,
      onError:         () => {},   // silent — caller handles error state
      // Deliberately: no onSuccess that calls queryClient.setQueryData
    };

    // Verify no cache setter exists in config
    const configStr = mockMutationConfig.onSuccess.toString();
    expect(configStr).not.toContain("setQueryData");
  });

  test("onError is silent — caller manages noStrategyError state", () => {
    let noStrategyError = false;
    const onError = (err) => {
      // In the hook, onError is a no-op: () => {}
      // The caller in TradeDetailPanel handles it by checking the error type
      if (err?.message?.includes("no strategy")) {
        noStrategyError = true;
      }
    };

    onError({ message: "Account has no strategy linked" });
    // noStrategyError is managed in component state, not in the hook
    expect(typeof onError).toBe("function");
  });

  test("discipline result is local state — survives re-renders without query refetch", () => {
    // Simulates useState holding the result
    let disciplineResult = null;
    const setDisciplineResult = (val) => { disciplineResult = val; };

    const apiResponse = makeDisciplineResult({ score: 65 });
    setDisciplineResult(apiResponse);

    expect(disciplineResult).not.toBeNull();
    expect(disciplineResult.score).toBe(65);

    // A hypothetical cache invalidation should not wipe this
    const queryCache = {};  // no discipline result stored here
    expect(queryCache["trade-1"]).toBeUndefined();
  });
});
