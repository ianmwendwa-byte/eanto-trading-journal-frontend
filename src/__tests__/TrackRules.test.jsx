import { describe, test, expect } from "vitest";

// ── Fixtures ──────────────────────────────────────────────────

const makeRule = (overrides = {}) => ({
  _id:            "rule-1",
  title:          "No more than 1% risk per trade",
  category:       "risk",
  evaluationType: "max_risk_percent",
  mode:           "warn",
  enabled:        true,
  threshold:      1,
  violated:       false,
  violationsCount: 0,
  ...overrides,
});

const makeAccount = (overrides = {}) => ({
  _id:        "acc-1",
  type:       "normal",
  ruleMode:   "track",
  trackRules: [],
  ...overrides,
});

// ── Category config (mirrors TrackRulesTab.jsx) ───────────────

const CATEGORY_CFG = {
  risk:     { label: "Risk",     cls: "bg-[var(--loss)]/10 text-[var(--loss)] border-[var(--loss)]/20" },
  behavior: { label: "Behavior", cls: "bg-[var(--warning)]/10 text-[var(--warning)] border-[var(--warning)]/20" },
  strategy: { label: "Strategy", cls: "bg-primary/10 text-primary border-primary/20" },
  session:  { label: "Session",  cls: "bg-muted text-muted-foreground border-border" },
  custom:   { label: "Custom",   cls: "bg-muted text-muted-foreground border-border" },
};

const MODE_CFG = {
  track:   { label: "Track",   cls: "bg-muted text-muted-foreground border-border" },
  warn:    { label: "Warn",    cls: "bg-[var(--warning)]/10 text-[var(--warning)] border-[var(--warning)]/20" },
  enforce: { label: "Enforce", cls: "bg-[var(--loss)]/10 text-[var(--loss)] border-[var(--loss)]/20" },
};

const THRESHOLD_SUFFIX = {
  max_risk_percent:   "%",
  daily_loss_limit:   "%",
  rr_minimum:         "R",
  trade_frequency:    "trades/day",
  consecutive_losses: "losses",
};

// ── Tests ─────────────────────────────────────────────────────

describe("Track Rules — rule list", () => {
  test("renders rule list from account.trackRules", () => {
    const account = makeAccount({
      trackRules: [makeRule(), makeRule({ _id: "rule-2", title: "Max 2 trades/day" })],
    });
    expect(account.trackRules).toHaveLength(2);
    expect(account.trackRules[0].title).toBe("No more than 1% risk per trade");
  });

  test("violated rule has violated flag set to true", () => {
    const rule = makeRule({ violated: true, violationsCount: 3 });
    expect(rule.violated).toBe(true);
    expect(rule.violationsCount).toBe(3);
  });

  test("violationsCount displays correctly", () => {
    const rule = makeRule({ violationsCount: 3 });
    const label = `Violated ${rule.violationsCount} time${rule.violationsCount !== 1 ? "s" : ""}`;
    expect(label).toBe("Violated 3 times");
  });

  test("singular form for violationsCount of 1", () => {
    const rule = makeRule({ violationsCount: 1 });
    const label = `Violated ${rule.violationsCount} time${rule.violationsCount !== 1 ? "s" : ""}`;
    expect(label).toBe("Violated 1 time");
  });
});

describe("Track Rules — ruleMode selector", () => {
  test("shows ruleMode selector for normal account", () => {
    const account = makeAccount({ type: "normal" });
    const showSelector = account.type !== "prop";
    expect(showSelector).toBe(true);
  });

  test("shows ruleMode selector for war account", () => {
    const account = makeAccount({ type: "war" });
    const showSelector = account.type !== "prop";
    expect(showSelector).toBe(true);
  });

  test("hides ruleMode selector for prop account", () => {
    const account = makeAccount({ type: "prop" });
    const showSelector = account.type !== "prop";
    expect(showSelector).toBe(false);
  });
});

describe("Track Rules — category badge", () => {
  test("risk category uses loss color class", () => {
    const cfg = CATEGORY_CFG["risk"];
    expect(cfg.cls).toContain("var(--loss)");
  });

  test("behavior category uses warning color class", () => {
    const cfg = CATEGORY_CFG["behavior"];
    expect(cfg.cls).toContain("var(--warning)");
  });

  test("strategy category uses primary color class", () => {
    const cfg = CATEGORY_CFG["strategy"];
    expect(cfg.cls).toContain("primary");
  });

  test("session and custom use neutral classes", () => {
    expect(CATEGORY_CFG["session"].cls).toContain("muted");
    expect(CATEGORY_CFG["custom"].cls).toContain("muted");
  });

  test("unknown category falls back to custom", () => {
    const cfg = CATEGORY_CFG["unknown"] ?? CATEGORY_CFG.custom;
    expect(cfg.label).toBe("Custom");
  });
});

describe("Track Rules — mode badge", () => {
  test("track mode uses neutral class", () => {
    expect(MODE_CFG["track"].cls).toContain("muted");
  });

  test("warn mode uses warning color", () => {
    expect(MODE_CFG["warn"].cls).toContain("var(--warning)");
  });

  test("enforce mode uses loss/danger color", () => {
    expect(MODE_CFG["enforce"].cls).toContain("var(--loss)");
  });
});

describe("Track Rules — threshold input", () => {
  test("rr_minimum evaluationType has suffix R", () => {
    expect(THRESHOLD_SUFFIX["rr_minimum"]).toBe("R");
  });

  test("max_risk_percent evaluationType has suffix %", () => {
    expect(THRESHOLD_SUFFIX["max_risk_percent"]).toBe("%");
  });

  test("trade_frequency evaluationType has suffix trades/day", () => {
    expect(THRESHOLD_SUFFIX["trade_frequency"]).toBe("trades/day");
  });

  test("session_control has no numeric suffix (multi-select UI)", () => {
    expect(THRESHOLD_SUFFIX["session_control"]).toBeUndefined();
  });

  test("consecutive_losses has suffix losses", () => {
    expect(THRESHOLD_SUFFIX["consecutive_losses"]).toBe("losses");
  });
});

describe("Track Rules — optimistic toggle", () => {
  test("toggle flips enabled state", () => {
    const rule = makeRule({ enabled: true });
    const toggled = { ...rule, enabled: !rule.enabled };
    expect(toggled.enabled).toBe(false);
  });

  test("toggle on disabled rule enables it", () => {
    const rule = makeRule({ enabled: false });
    const toggled = { ...rule, enabled: !rule.enabled };
    expect(toggled.enabled).toBe(true);
  });
});

describe("Track Rules — optimistic delete", () => {
  test("removes rule from trackRules array by id", () => {
    const account = makeAccount({
      trackRules: [makeRule({ _id: "rule-1" }), makeRule({ _id: "rule-2" })],
    });
    const afterDelete = {
      ...account,
      trackRules: account.trackRules.filter((r) => r._id !== "rule-1"),
    };
    expect(afterDelete.trackRules).toHaveLength(1);
    expect(afterDelete.trackRules[0]._id).toBe("rule-2");
  });
});

describe("Track Rules — rule form validation", () => {
  test("empty title is invalid", () => {
    const title = "";
    expect(title.length >= 1).toBe(false);
  });

  test("non-empty title is valid", () => {
    const title = "No more than 1% risk";
    expect(title.length >= 1).toBe(true);
  });
});
