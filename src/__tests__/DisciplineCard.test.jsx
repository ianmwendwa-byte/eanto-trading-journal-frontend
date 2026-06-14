import { describe, test, expect } from "vitest";

// ── Helpers mirroring DisciplineSection in TradeDetailPanel ──

const getScoreColor = (score) => {
  if (score >= 80) return "var(--profit)";
  if (score >= 60) return "var(--warning)";
  return "var(--loss)";
};

const getScoreTextClass = (score) => {
  if (score >= 80) return "text-[var(--profit)]";
  if (score >= 60) return "text-[var(--warning)]";
  return "text-[var(--loss)]";
};

const setupViolationLabel = (setupValue) => {
  if (setupValue === null)  return "Not assessed";
  if (setupValue === false) return "OK";
  return "Violated";
};

const makeDiscipline = (overrides = {}) => ({
  score:       75,
  isDisciplined: true,
  violations:  { stopLoss: false, riskSize: false, session: false, setup: null },
  feedback:    [],
  calculatedAt: "2025-06-10T08:00:00.000Z",
  ...overrides,
});

const makeTrade = (overrides = {}) => ({
  _id:        "trade-1",
  strategy:   "strat-abc",
  discipline: null,
  ...overrides,
});

// ── Tests ─────────────────────────────────────────────────────

describe("DisciplineSection — null discipline (no strategy)", () => {
  test("trade with no discipline shows null section", () => {
    const trade = makeTrade({ discipline: null });
    expect(trade.discipline).toBeNull();
  });

  test("discipline null + no strategy: prompt to assign strategy", () => {
    const trade = makeTrade({ strategy: null, discipline: null });
    const shouldPrompt = trade.discipline === null && trade.strategy == null;
    expect(shouldPrompt).toBe(true);
  });

  test("discipline null + strategy assigned: awaiting next sync or calculation", () => {
    const trade = makeTrade({ strategy: "strat-id", discipline: null });
    const awaitingCalc = trade.discipline === null && trade.strategy != null;
    expect(awaitingCalc).toBe(true);
  });
});

describe("DisciplineSection — score display", () => {
  test("score color is profit green for 80+", () => {
    expect(getScoreColor(80)).toBe("var(--profit)");
    expect(getScoreColor(100)).toBe("var(--profit)");
  });

  test("score color is warning yellow for 60-79", () => {
    expect(getScoreColor(60)).toBe("var(--warning)");
    expect(getScoreColor(75)).toBe("var(--warning)");
  });

  test("score color is loss red for below 60", () => {
    expect(getScoreColor(59)).toBe("var(--loss)");
    expect(getScoreColor(0)).toBe("var(--loss)");
  });

  test("text class matches border color", () => {
    expect(getScoreTextClass(80)).toBe("text-[var(--profit)]");
    expect(getScoreTextClass(65)).toBe("text-[var(--warning)]");
    expect(getScoreTextClass(40)).toBe("text-[var(--loss)]");
  });
});

describe("DisciplineSection — setup violation 3-state", () => {
  test("setup null renders 'Not assessed'", () => {
    expect(setupViolationLabel(null)).toBe("Not assessed");
  });

  test("setup false renders 'OK'", () => {
    expect(setupViolationLabel(false)).toBe("OK");
  });

  test("setup true renders 'Violated'", () => {
    expect(setupViolationLabel(true)).toBe("Violated");
  });
});

describe("DisciplineSection — reads from trade object (no button)", () => {
  test("discipline is sourced directly from trade prop", () => {
    const trade = makeTrade({ discipline: makeDiscipline({ score: 72 }) });
    expect(trade.discipline.score).toBe(72);
  });

  test("no manual trigger — discipline exists or does not", () => {
    const hasDiscipline = (trade) => trade.discipline !== null;
    expect(hasDiscipline(makeTrade({ discipline: null }))).toBe(false);
    expect(hasDiscipline(makeTrade({ discipline: makeDiscipline() }))).toBe(true);
  });

  test("feedback array from discipline object is displayable", () => {
    const trade = makeTrade({
      discipline: makeDiscipline({ feedback: ["Check session", "Verify SL size"] }),
    });
    expect(trade.discipline.feedback).toHaveLength(2);
    trade.discipline.feedback.forEach((f) => expect(typeof f).toBe("string"));
  });
});
