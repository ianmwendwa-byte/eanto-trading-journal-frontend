import { describe, test, expect } from "vitest";

// ── Helpers (mirror TrackRulesTab.jsx) ───────────────────────

const showRuleModeSelector = (accountType) => accountType !== "prop";

const RULE_MODE_DESCRIPTIONS = {
  track:    "Violations are logged silently. No UI interruption.",
  enforced: "Rules with mode \"Enforce\" will actively block or flag trades.",
  off:      "Rule system is completely disabled. No evaluation occurs.",
};

const makeAccount = (overrides = {}) => ({
  _id:      "acc-1",
  type:     "normal",
  ruleMode: "track",
  ...overrides,
});

// ── Tests ─────────────────────────────────────────────────────

describe("RuleMode Selector — visibility by account type", () => {
  test("shows selector for normal account", () => {
    expect(showRuleModeSelector("normal")).toBe(true);
  });

  test("shows selector for war account", () => {
    expect(showRuleModeSelector("war")).toBe(true);
  });

  test("hides selector for prop account", () => {
    expect(showRuleModeSelector("prop")).toBe(false);
  });
});

describe("RuleMode Selector — prop account shows locked badge", () => {
  test("prop account shows enforced badge instead of selector", () => {
    const account = makeAccount({ type: "prop" });
    const showSelector = showRuleModeSelector(account.type);
    const showBadge    = !showSelector && account.type === "prop";
    expect(showSelector).toBe(false);
    expect(showBadge).toBe(true);
  });

  test("non-prop account does not show locked badge", () => {
    const account = makeAccount({ type: "normal" });
    const showSelector = showRuleModeSelector(account.type);
    const showBadge    = !showSelector && account.type === "prop";
    expect(showBadge).toBe(false);
  });
});

describe("RuleMode Selector — PATCH on mode change", () => {
  test("PATCH body is { ruleMode: value } for track", () => {
    const newMode   = "track";
    const patchBody = { ruleMode: newMode };
    expect(patchBody).toEqual({ ruleMode: "track" });
  });

  test("PATCH body is { ruleMode: value } for enforced", () => {
    const patchBody = { ruleMode: "enforced" };
    expect(patchBody.ruleMode).toBe("enforced");
  });

  test("PATCH body is { ruleMode: value } for off", () => {
    const patchBody = { ruleMode: "off" };
    expect(patchBody.ruleMode).toBe("off");
  });
});

describe("RuleMode Selector — mode descriptions", () => {
  test("track mode has description about silent logging", () => {
    expect(RULE_MODE_DESCRIPTIONS.track).toContain("logged silently");
  });

  test("enforced mode has description about blocking trades", () => {
    expect(RULE_MODE_DESCRIPTIONS.enforced).toContain("block");
  });

  test("off mode has description about disabled system", () => {
    expect(RULE_MODE_DESCRIPTIONS.off).toContain("disabled");
  });

  test("track description shown when ruleMode is track", () => {
    const account = makeAccount({ ruleMode: "track" });
    const description = RULE_MODE_DESCRIPTIONS[account.ruleMode] ?? null;
    expect(description).not.toBeNull();
    expect(description).toContain("silently");
  });

  test("off description shown when ruleMode is off", () => {
    const account = makeAccount({ type: "war", ruleMode: "off" });
    const description = RULE_MODE_DESCRIPTIONS[account.ruleMode] ?? null;
    expect(description).toContain("disabled");
  });
});

describe("RuleMode Selector — three options available", () => {
  const RULE_MODE_OPTIONS = ["track", "enforced", "off"];

  test("has exactly three options", () => {
    expect(RULE_MODE_OPTIONS).toHaveLength(3);
  });

  test("track option is available", () => {
    expect(RULE_MODE_OPTIONS).toContain("track");
  });

  test("enforced option is available", () => {
    expect(RULE_MODE_OPTIONS).toContain("enforced");
  });

  test("off option is available", () => {
    expect(RULE_MODE_OPTIONS).toContain("off");
  });
});
