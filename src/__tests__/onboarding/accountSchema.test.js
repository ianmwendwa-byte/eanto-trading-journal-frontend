import { describe, test, expect } from "vitest";
import { accountFormSchema, transformAccountForm } from "@/app/schema/account";

// ── Helpers ───────────────────────────────────────────────────────

const parse = (data) => accountFormSchema.safeParse(data);

const validNormal = {
  name:            "IC Markets Main",
  type:            "normal",
  platform:        "mt5",
  baseCurrency:    "USD",
  startingBalance: 10000,
  tradingMode:     "live",
};

const validProp = {
  name:            "FTMO 10K Phase 1",
  type:            "prop",
  platform:        "mt5",
  baseCurrency:    "USD",
  startingBalance: 10000,
};

const validWar = {
  name:            "War Account",
  type:            "war",
  platform:        "mt4",
  baseCurrency:    "USD",
  startingBalance: 5000,
  tradingMode:     "live",
};

// ── accountFormSchema — valid inputs ──────────────────────────────

describe("accountFormSchema — valid normal account", () => {
  test("accepts a complete normal account", () => {
    expect(parse(validNormal).success).toBe(true);
  });

  test("accepts optional broker field", () => {
    expect(parse({ ...validNormal, broker: "IC Markets" }).success).toBe(true);
  });

  test("accepts all supported platforms", () => {
    for (const platform of ["mt4", "mt5", "ctrader", "tradingview", "manual"]) {
      expect(parse({ ...validNormal, platform }).success).toBe(true);
    }
  });

  test("accepts all supported currencies", () => {
    for (const baseCurrency of ["USD", "EUR", "GBP", "JPY"]) {
      expect(parse({ ...validNormal, baseCurrency }).success).toBe(true);
    }
  });

  test("accepts startingBalance of zero", () => {
    expect(parse({ ...validNormal, startingBalance: 0 }).success).toBe(true);
  });

  test("accepts live tradingMode", () => {
    expect(parse({ ...validNormal, tradingMode: "live" }).success).toBe(true);
  });

  test("accepts demo tradingMode", () => {
    expect(parse({ ...validNormal, tradingMode: "demo" }).success).toBe(true);
  });
});

describe("accountFormSchema — valid prop account", () => {
  test("accepts minimal prop account", () => {
    expect(parse(validProp).success).toBe(true);
  });

  test("accepts prop with all challenge fields", () => {
    const full = {
      ...validProp,
      propFirm:             "FTMO",
      programType:          "2_step",
      profitTargetPercent:  10,
      maxDrawdownPercent:   10,
      dailyDrawdownPercent: 5,
      minTradingDays:       4,
      challengeFee:         155,
    };
    expect(parse(full).success).toBe(true);
  });

  test("accepts all programType values", () => {
    for (const pt of ["1_step", "2_step", "3_step", "instant"]) {
      expect(parse({ ...validProp, programType: pt }).success).toBe(true);
    }
  });
});

describe("accountFormSchema — valid war account", () => {
  test("accepts a war account", () => {
    expect(parse(validWar).success).toBe(true);
  });
});

// ── accountFormSchema — invalid inputs ────────────────────────────

describe("accountFormSchema — name validation", () => {
  test("rejects empty name", () => {
    expect(parse({ ...validNormal, name: "" }).success).toBe(false);
  });

  test("rejects name over 50 characters", () => {
    expect(parse({ ...validNormal, name: "a".repeat(51) }).success).toBe(false);
  });

  test("accepts name at exactly 50 characters", () => {
    expect(parse({ ...validNormal, name: "a".repeat(50) }).success).toBe(true);
  });
});

describe("accountFormSchema — type validation", () => {
  test("rejects invalid account type", () => {
    expect(parse({ ...validNormal, type: "invalid" }).success).toBe(false);
  });

  test("rejects missing type", () => {
    const { type: _, ...rest } = validNormal;
    expect(parse(rest).success).toBe(false);
  });
});

describe("accountFormSchema — platform validation", () => {
  test("rejects invalid platform", () => {
    expect(parse({ ...validNormal, platform: "ninja" }).success).toBe(false);
  });
});

describe("accountFormSchema — startingBalance validation", () => {
  test("rejects negative balance", () => {
    expect(parse({ ...validNormal, startingBalance: -1 }).success).toBe(false);
  });

  test("coerces string '10000' to number", () => {
    const result = parse({ ...validNormal, startingBalance: "10000" });
    expect(result.success).toBe(true);
    expect(result.data.startingBalance).toBe(10000);
  });

  test("rejects non-numeric string", () => {
    expect(parse({ ...validNormal, startingBalance: "abc" }).success).toBe(false);
  });
});

describe("accountFormSchema — drawdown percent validation", () => {
  test("rejects profitTargetPercent above 100", () => {
    expect(parse({ ...validProp, profitTargetPercent: 101 }).success).toBe(false);
  });

  test("rejects maxDrawdownPercent below 0", () => {
    expect(parse({ ...validProp, maxDrawdownPercent: -1 }).success).toBe(false);
  });

  test("accepts empty string for optional numeric prop fields", () => {
    expect(parse({ ...validProp, profitTargetPercent: "" }).success).toBe(true);
  });
});

// ── transformAccountForm — normal ─────────────────────────────────

describe("transformAccountForm — normal account", () => {
  test("passes core fields to payload", () => {
    const result = transformAccountForm(validNormal);
    expect(result.name).toBe("IC Markets Main");
    expect(result.type).toBe("normal");
    expect(result.platform).toBe("mt5");
    expect(result.baseCurrency).toBe("USD");
    expect(result.startingBalance).toBe(10000);
  });

  test("includes broker when provided", () => {
    const result = transformAccountForm({ ...validNormal, broker: "IC Markets" });
    expect(result.broker).toBe("IC Markets");
  });

  test("broker undefined when empty string", () => {
    const result = transformAccountForm({ ...validNormal, broker: "" });
    expect(result.broker).toBeUndefined();
  });

  test("live tradingMode adds no tags", () => {
    const result = transformAccountForm({ ...validNormal, tradingMode: "live" });
    expect(result.tags).toBeUndefined();
  });

  test("demo tradingMode adds ['demo'] tag", () => {
    const result = transformAccountForm({ ...validNormal, tradingMode: "demo" });
    expect(result.tags).toEqual(["demo"]);
  });

  test("maxRiskPercent goes into normalConfig", () => {
    const result = transformAccountForm({ ...validNormal, maxRiskPercent: 2 });
    expect(result.normalConfig?.maxRiskPerTradePercent).toBe(2);
  });

  test("omits normalConfig when maxRiskPercent not provided", () => {
    const result = transformAccountForm(validNormal);
    expect(result.normalConfig).toBeUndefined();
  });

  test("does not include propRules", () => {
    const result = transformAccountForm(validNormal);
    expect(result.propRules).toBeUndefined();
  });
});

// ── transformAccountForm — prop ───────────────────────────────────

describe("transformAccountForm — prop account", () => {
  test("uses startingBalance when accountSize not provided", () => {
    const result = transformAccountForm(validProp);
    expect(result.startingBalance).toBe(10000);
  });

  test("accountSize overrides startingBalance", () => {
    const result = transformAccountForm({ ...validProp, accountSize: 25000, startingBalance: 10000 });
    expect(result.startingBalance).toBe(25000);
  });

  test("propFirm maps to propRules.propFirmName", () => {
    const result = transformAccountForm({ ...validProp, propFirm: "FTMO" });
    expect(result.propRules.propFirmName).toBe("FTMO");
  });

  test("programType included in propRules", () => {
    const result = transformAccountForm({ ...validProp, programType: "2_step" });
    expect(result.propRules.programType).toBe("2_step");
  });

  test("profitTargetPercent maps to propRules.profitTarget", () => {
    const result = transformAccountForm({ ...validProp, profitTargetPercent: 10 });
    expect(result.propRules.profitTarget).toBe(10);
  });

  test("maxDrawdownPercent included in propRules", () => {
    const result = transformAccountForm({ ...validProp, maxDrawdownPercent: 10 });
    expect(result.propRules.maxDrawdownPercent).toBe(10);
  });

  test("dailyDrawdownPercent included in propRules", () => {
    const result = transformAccountForm({ ...validProp, dailyDrawdownPercent: 5 });
    expect(result.propRules.dailyDrawdownPercent).toBe(5);
  });

  test("minTradingDays included in propRules", () => {
    const result = transformAccountForm({ ...validProp, minTradingDays: 4 });
    expect(result.propRules.minTradingDays).toBe(4);
  });

  test("challengeFee included in propRules", () => {
    const result = transformAccountForm({ ...validProp, challengeFee: 155 });
    expect(result.propRules.challengeFee).toBe(155);
  });

  test("omits propRules entirely when no prop fields filled", () => {
    const result = transformAccountForm(validProp);
    expect(result.propRules).toBeUndefined();
  });

  test("does not include broker on prop account", () => {
    const result = transformAccountForm({ ...validProp, broker: "some broker" });
    expect(result.broker).toBeUndefined();
  });
});

// ── transformAccountForm — war ────────────────────────────────────

describe("transformAccountForm — war account", () => {
  test("passes core fields", () => {
    const result = transformAccountForm(validWar);
    expect(result.type).toBe("war");
    expect(result.startingBalance).toBe(5000);
  });

  test("purpose maps to warConfig.strategyNotes", () => {
    const result = transformAccountForm({ ...validWar, purpose: "High RR scalping" });
    expect(result.warConfig.strategyNotes).toBe("High RR scalping");
  });

  test("omits warConfig when purpose not provided", () => {
    const result = transformAccountForm(validWar);
    expect(result.warConfig).toBeUndefined();
  });

  test("maxRiskPercent maps to goals.maxRiskPerTrade", () => {
    const result = transformAccountForm({ ...validWar, maxRiskPercent: 5 });
    expect(result.goals.maxRiskPerTrade).toBe(5);
  });

  test("omits goals when maxRiskPercent not provided", () => {
    const result = transformAccountForm(validWar);
    expect(result.goals).toBeUndefined();
  });

  test("includes broker for war accounts", () => {
    const result = transformAccountForm({ ...validWar, broker: "Pepperstone" });
    expect(result.broker).toBe("Pepperstone");
  });
});
