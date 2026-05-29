import { z } from "zod";

export const accountFormSchema = z.object({
  // ── Core fields (all types) ──────────────────────────────────
  name:            z.string().min(1, "Name is required").max(50),
  type:            z.enum(["normal", "prop", "war"]),
  platform:        z.enum(["mt4", "mt5", "ctrader", "tradingview", "manual"]),
  baseCurrency:    z.string().min(1, "Currency is required").default("USD"),
  startingBalance: z.coerce
    .number({ invalid_type_error: "Balance must be a number" })
    .min(0, "Balance must be 0 or greater"),

  // ── Normal / War fields ──────────────────────────────────────
  broker:          z.string().optional(),
  tradingMode:     z.enum(["live", "demo"]).optional().default("live"),
  maxRiskPercent:  z.coerce.number().min(0).max(100).optional().or(z.literal("")),
  maxDailyTrades:  z.coerce.number().int().min(0).optional().or(z.literal("")),
  notes:           z.string().max(1000).optional(),

  // ── War-specific fields ──────────────────────────────────────
  purpose:         z.string().max(500).optional(),

  // ── Prop-specific fields ─────────────────────────────────────
  propFirm:            z.string().optional(),
  programType:         z.enum(["1_step", "2_step", "3_step", "instant"]).optional(),
  profitTargetPercent: z.coerce.number().min(0).max(100).optional().or(z.literal("")),
  maxDrawdownPercent:  z.coerce.number().min(0).max(100).optional().or(z.literal("")),
  dailyDrawdownPercent:z.coerce.number().min(0).max(100).optional().or(z.literal("")),
  minTradingDays:      z.coerce.number().int().min(0).optional().or(z.literal("")),
  challengeFee:        z.coerce.number().min(0).optional().or(z.literal("")),
  accountSize:         z.coerce.number().min(0).optional().or(z.literal("")),
});

// ── Transform flat form data → nested API payload ────────────
export const transformAccountForm = (data) => {
  const base = {
    name:            data.name,
    type:            data.type,
    platform:        data.platform,
    baseCurrency:    data.baseCurrency,
    startingBalance: data.startingBalance,
  };

  if (data.type === "prop") {
    const propRules = {};
    if (data.propFirm)              propRules.propFirmName        = data.propFirm;
    if (data.programType)           propRules.programType         = data.programType;
    if (data.profitTargetPercent)   propRules.profitTarget        = data.profitTargetPercent;
    if (data.maxDrawdownPercent)    propRules.maxDrawdownPercent  = data.maxDrawdownPercent;
    if (data.dailyDrawdownPercent)  propRules.dailyDrawdownPercent = data.dailyDrawdownPercent;
    if (data.minTradingDays)        propRules.minTradingDays      = data.minTradingDays;
    if (data.challengeFee)          propRules.challengeFee        = data.challengeFee;

    // accountSize overrides startingBalance for prop accounts
    const balance = data.accountSize || data.startingBalance;

    return {
      ...base,
      startingBalance: balance,
      ...(Object.keys(propRules).length ? { propRules } : {}),
    };
  }

  if (data.type === "war") {
    const warConfig = {};
    if (data.purpose) warConfig.strategyNotes = data.purpose;

    const goals = {};
    if (data.maxRiskPercent) goals.maxRiskPerTrade = data.maxRiskPercent;

    return {
      ...base,
      broker: data.broker || undefined,
      notes:  data.notes  || undefined,
      ...(Object.keys(warConfig).length ? { warConfig } : {}),
      ...(Object.keys(goals).length    ? { goals }     : {}),
    };
  }

  // normal
  const normalConfig = {};
  if (data.maxRiskPercent) normalConfig.maxRiskPerTradePercent = data.maxRiskPercent;

  const tags = data.tradingMode === "demo" ? ["demo"] : [];

  return {
    ...base,
    broker: data.broker || undefined,
    notes:  data.notes  || undefined,
    ...(tags.length ? { tags } : {}),
    ...(Object.keys(normalConfig).length ? { normalConfig } : {}),
  };
};
