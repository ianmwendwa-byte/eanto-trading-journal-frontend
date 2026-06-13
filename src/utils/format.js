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

// formatRR: "1:2.64" for positive, "−1:1.00" for negative, "—" for null
export const formatRR = (value) => {
  if (value === null || value === undefined) return "—";
  const n = Number(value);
  if (n >= 0) return `1:${n.toFixed(2)}`;
  return `−1:${Math.abs(n).toFixed(2)}`;
};

// formatPips: "+50.0 pips" — returns "—" for null (non-pip instruments)
export const formatPips = (value) => {
  if (value === null || value === undefined) return "—";
  const n = Number(value);
  const prefix = n > 0 ? "+" : "";
  return `${prefix}${n.toFixed(1)} pips`;
};

// formatPrice: correct decimal places per instrument
export const formatPrice = (value, pair) => {
  if (value === null || value === undefined) return "—";
  const n = Number(value);
  if (!pair) return n.toFixed(5);
  const p = pair.toUpperCase();
  if (p.includes("JPY")) return n.toFixed(3);
  if (p.startsWith("XAU") || p.startsWith("XAG") || p.startsWith("XPT") || p.startsWith("XPD")) return n.toFixed(2);
  if (p.startsWith("BTC") || p.startsWith("ETH") || p.startsWith("LTC") || p.startsWith("XRP")) return n.toFixed(2);
  if (["US30", "US500", "SPX", "NAS", "GER", "UK100", "JPN"].some((i) => p.includes(i))) return n.toFixed(2);
  return n.toFixed(5);
};

// formatDuration: from two dates — "1d 4h", "2h 15m", "30m", "—"
export const formatDuration = (start, end) => {
  if (!start || !end) return "—";
  const diffMs = new Date(end).getTime() - new Date(start).getTime();
  if (diffMs < 0) return "—";
  const mins = Math.floor(diffMs / 60000);
  const hours = Math.floor(mins / 60);
  const days = Math.floor(hours / 24);
  if (days > 0) return `${days}d ${hours % 24}h`;
  if (hours > 0) return `${hours}h ${mins % 60}m`;
  return `${mins}m`;
};
