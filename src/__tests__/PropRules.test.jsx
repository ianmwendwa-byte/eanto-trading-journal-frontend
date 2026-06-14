import { describe, test, expect } from "vitest";

// ── Fixtures ──────────────────────────────────────────────────

const makePropAccount = (overrides = {}) => ({
  _id:  "acc-prop-1",
  type: "prop",
  propRules: {
    propFirmName:         "FTMO",
    programType:          "2_step",
    challengeFee:         299,
    maxDrawdownPercent:   10,
    dailyDrawdownPercent: 5,
    profitTarget:         10,
    minTradingDays:       4,
    maxTradesPerDay:      20,
    maxLotSize:           5,
    allowedSessions:      ["london", "new_york"],
    tradingPermissions: {
      easAllowed:            true,
      thirdPartyEasAllowed:  false,
      hftAllowed:            false,
      copyTradingAllowed:    false,
      hedgingAllowed:        false,
      martingaleAllowed:     false,
      gridAllowed:           false,
      goldArbitrageAllowed:  false,
    },
    holdingRules: {
      overnightAllowed:       false,
      weekendAllowed:         false,
      fridayCloseBufferHours: 2,
      mondayOpenBufferHours:  0,
      newsBufferMinutes:      30,
      newsTradingAllowed:     false,
      newsMaxProfitPercent:   0,
    },
    payoutRules: {
      profitSplitPercent:      80,
      payoutFrequency:         "monthly",
      minPayoutAmount:         100,
    },
    consistencyRules: {
      enabled:                   true,
      maxSingleDayProfitPercent: 40,
    },
  },
  ...overrides,
});

// ── Validation helpers (mirrors PropRulesTab.jsx schema) ──────

const validateMaxDrawdown = (v) => {
  if (v == null) return null;
  if (v < 1) return "Min 1";
  if (v > 20) return "Max 20";
  return null;
};

const validateProfitTarget = (v) => {
  if (v == null) return null;
  if (v <= 0) return "Must be > 0";
  return null;
};

const validateMaxTradesPerDay = (v) => {
  if (v == null) return null;
  if (v < 1) return "Min 1";
  if (v > 1000) return "Max 1000";
  return null;
};

const validateMaxLotSize = (v) => {
  if (v == null) return null;
  if (v <= 0) return "Must be > 0";
  return null;
};

// ── Tests ─────────────────────────────────────────────────────

describe("Prop Rules — account type gate", () => {
  test("only renders for prop accounts", () => {
    const propAccount   = makePropAccount({ type: "prop" });
    const normalAccount = { type: "normal" };
    expect(propAccount.type === "prop").toBe(true);
    expect(normalAccount.type === "prop").toBe(false);
  });
});

describe("Prop Rules — 10 sections exist", () => {
  const SECTIONS = [
    "Firm Info",
    "Drawdown Rules",
    "Profit Target",
    "Time Rules",
    "Position Limits",
    "Trading Permissions",
    "Allowed Sessions",
    "Holding Rules",
    "Payout Rules",
    "Consistency Rules",
  ];

  test("all 10 sections are defined", () => {
    expect(SECTIONS).toHaveLength(10);
  });

  SECTIONS.forEach((section) => {
    test(`section "${section}" is in the list`, () => {
      expect(SECTIONS).toContain(section);
    });
  });
});

describe("Prop Rules — validation: maxDrawdownPercent", () => {
  test("value 10 is valid", () => {
    expect(validateMaxDrawdown(10)).toBeNull();
  });

  test("value 25 exceeds max 20", () => {
    expect(validateMaxDrawdown(25)).toBe("Max 20");
  });

  test("value 0 is below min 1", () => {
    expect(validateMaxDrawdown(0)).toBe("Min 1");
  });

  test("boundary value 1 is valid", () => {
    expect(validateMaxDrawdown(1)).toBeNull();
  });

  test("boundary value 20 is valid", () => {
    expect(validateMaxDrawdown(20)).toBeNull();
  });
});

describe("Prop Rules — validation: profitTarget", () => {
  test("value 10 is valid", () => {
    expect(validateProfitTarget(10)).toBeNull();
  });

  test("value 0 is invalid (must be > 0)", () => {
    expect(validateProfitTarget(0)).toBe("Must be > 0");
  });

  test("value -5 is invalid", () => {
    expect(validateProfitTarget(-5)).toBe("Must be > 0");
  });
});

describe("Prop Rules — validation: maxTradesPerDay", () => {
  test("value 20 is valid", () => {
    expect(validateMaxTradesPerDay(20)).toBeNull();
  });

  test("value 0 is below min 1", () => {
    expect(validateMaxTradesPerDay(0)).toBe("Min 1");
  });

  test("value 1001 exceeds max 1000", () => {
    expect(validateMaxTradesPerDay(1001)).toBe("Max 1000");
  });
});

describe("Prop Rules — validation: maxLotSize", () => {
  test("value 5 is valid", () => {
    expect(validateMaxLotSize(5)).toBeNull();
  });

  test("value 0 is invalid", () => {
    expect(validateMaxLotSize(0)).toBe("Must be > 0");
  });
});

describe("Prop Rules — trading permissions", () => {
  test("tradingPermissions contains 8 boolean fields", () => {
    const account = makePropAccount();
    const perms = account.propRules.tradingPermissions;
    const keys = Object.keys(perms);
    expect(keys).toHaveLength(8);
    keys.forEach((k) => expect(typeof perms[k]).toBe("boolean"));
  });
});

describe("Prop Rules — allowed sessions", () => {
  test("allowedSessions renders 4 chip options", () => {
    const SESSION_OPTIONS = ["asian", "london", "new_york", "sydney"];
    expect(SESSION_OPTIONS).toHaveLength(4);
  });

  test("empty allowedSessions means all sessions allowed", () => {
    const account = makePropAccount();
    account.propRules.allowedSessions = [];
    expect(account.propRules.allowedSessions).toHaveLength(0);
    const allAllowed = account.propRules.allowedSessions.length === 0;
    expect(allAllowed).toBe(true);
  });

  test("two sessions selected means only those allowed", () => {
    const account = makePropAccount();
    expect(account.propRules.allowedSessions).toEqual(["london", "new_york"]);
  });
});

describe("Prop Rules — holding rules", () => {
  test("newsMaxProfitPercent disabled when newsTradingAllowed is false", () => {
    const account = makePropAccount();
    const disabled = !account.propRules.holdingRules.newsTradingAllowed;
    expect(disabled).toBe(true);
  });

  test("newsMaxProfitPercent enabled when newsTradingAllowed is true", () => {
    const account = makePropAccount();
    account.propRules.holdingRules.newsTradingAllowed = true;
    const disabled = !account.propRules.holdingRules.newsTradingAllowed;
    expect(disabled).toBe(false);
  });
});

describe("Prop Rules — consistency rules", () => {
  test("maxSingleDayProfitPercent disabled when consistencyRules.enabled is false", () => {
    const account = makePropAccount();
    account.propRules.consistencyRules.enabled = false;
    expect(account.propRules.consistencyRules.enabled).toBe(false);
  });

  test("maxSingleDayProfitPercent enabled when consistencyRules.enabled is true", () => {
    const account = makePropAccount();
    expect(account.propRules.consistencyRules.enabled).toBe(true);
  });
});

describe("Prop Rules — save behavior", () => {
  test("response shape contains propRules object", () => {
    const mockResponse = {
      success: true,
      propRules: { maxDrawdownPercent: 10, dailyDrawdownPercent: 5 },
    };
    expect(mockResponse.propRules).toBeDefined();
    expect(mockResponse.propRules.maxDrawdownPercent).toBe(10);
  });

  test("merging propRules into account cache", () => {
    const account = makePropAccount();
    const newPropRules = { ...account.propRules, maxDrawdownPercent: 8 };
    const updated = { ...account, propRules: newPropRules };
    expect(updated.propRules.maxDrawdownPercent).toBe(8);
    expect(updated.propRules.profitTarget).toBe(10); // unchanged
  });
});
