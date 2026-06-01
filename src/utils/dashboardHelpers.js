import { WIDGET_REGISTRY, WIDGET_SECTIONS_MAP, DEFAULT_WIDGETS } from "@/constants/widgets";

export const getEnabledWidgets = (widgetPrefs) => {
  if (!widgetPrefs?.length) {
    return DEFAULT_WIDGETS
      .filter((w) => w.enabled)
      .sort((a, b) => a.order - b.order);
  }
  return [...widgetPrefs]
    .filter((w) => w.enabled)
    .sort((a, b) => a.order - b.order);
};

export const getRequiredSections = (enabledWidgetIds) => {
  const sections = new Set();
  enabledWidgetIds.forEach((id) => {
    (WIDGET_SECTIONS_MAP[id] ?? []).forEach((s) => sections.add(s));
  });
  return [...sections];
};

// Color helpers using CSS variables from index.css
export const getPnLColorClass = (value) => {
  if (value > 0)  return "text-[var(--profit)]";
  if (value < 0)  return "text-[var(--loss)]";
  return "text-[var(--breakeven)]";
};

export const getPnLBgClass = (value) => {
  if (value > 0)
    return "bg-[var(--profit)]/10 text-[var(--profit)]";
  if (value < 0)
    return "bg-[var(--loss)]/10 text-[var(--loss)]";
  return "bg-[var(--breakeven)]/10 text-[var(--breakeven)]";
};

export const getOutcomeColorClass = (outcome) => {
  if (outcome === "win")      return "text-[var(--profit)]";
  if (outcome === "loss")     return "text-[var(--loss)]";
  return "text-[var(--breakeven)]";
};

export const getStreakColorClass = (streak) => {
  if (streak > 0) return "text-[var(--profit)]";
  if (streak < 0) return "text-[var(--loss)]";
  return "text-muted-foreground";
};

export const getTransactionColorClass = (type) => {
  const positive = new Set(["deposit", "payout", "trade_profit", "adjustment_increase"]);
  const negative = new Set([
    "withdrawal", "trade_loss", "swap", "commission",
    "prop_challenge_fee", "adjustment_decrease",
  ]);
  if (positive.has(type)) return "text-[var(--profit)]";
  if (negative.has(type)) return "text-[var(--loss)]";
  return "text-muted-foreground";
};

export const formatStreakLabel = (streak) => {
  if (streak > 0) return `${streak}W streak`;
  if (streak < 0) return `${Math.abs(streak)}L streak`;
  return "No streak";
};

export const getWidgetLabel = (id) => WIDGET_REGISTRY[id]?.label ?? id;
