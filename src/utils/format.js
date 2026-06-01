export const formatCurrency = (value, currency = "USD") => {
  if (value === null || value === undefined) return "—";
  return new Intl.NumberFormat("en-US", {
    style:                 "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
};

export const formatPnL = (value, currency = "USD") => {
  if (value === null || value === undefined) return "—";
  const abs = formatCurrency(Math.abs(value), currency);
  return value >= 0 ? `+${abs}` : `-${abs.replace("-", "")}`;
};

export const formatPercent = (value, decimals = 1) => {
  if (value === null || value === undefined) return "—";
  return `${value >= 0 ? "+" : ""}${value.toFixed(decimals)}%`;
};

export const formatCompact = (value) => {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000)     return `${(value / 1_000).toFixed(1)}K`;
  return String(value);
};

export const formatDate = (date) => {
  if (!date) return "—";
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day:   "numeric",
    year:  "numeric",
  }).format(new Date(date));
};

export const formatDateTime = (date) => {
  if (!date) return "—";
  return new Intl.DateTimeFormat("en-US", {
    month:  "short",
    day:    "numeric",
    year:   "numeric",
    hour:   "2-digit",
    minute: "2-digit",
  }).format(new Date(date));
};

export const formatRelativeTime = (date) => {
  if (!date) return "—";
  const seconds = Math.floor((new Date() - new Date(date)) / 1000);
  if (seconds < 60)    return "just now";
  if (seconds < 3600)  return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
};

export const formatLotSize = (value) => {
  if (value === null || value === undefined) return "—";
  return value.toFixed(2);
};

export const getPnLColor = (value) => {
  if (value > 0) return "text-[var(--profit)]";
  if (value < 0) return "text-[var(--loss)]";
  return "text-muted-foreground";
};

export const getPnLBg = (value) => {
  if (value > 0) return "bg-[var(--profit)]/10 text-[var(--profit)]";
  if (value < 0) return "bg-[var(--loss)]/10 text-[var(--loss)]";
  return "bg-muted text-muted-foreground";
};
