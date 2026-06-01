export const getTradeDuration = (openedAt, closedAt) => {
  if (!openedAt || !closedAt) return "—";
  const ms = new Date(closedAt) - new Date(openedAt);
  if (ms < 0) return "—";

  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours   = Math.floor(minutes / 60);
  const days    = Math.floor(hours / 24);

  if (days > 0)    return `${days}d ${hours % 24}h`;
  if (hours > 0)   return `${hours}h ${minutes % 60}m`;
  if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
  return `${seconds}s`;
};

export const isShortDuration = (openedAt, closedAt, minSeconds = 120) => {
  if (!openedAt || !closedAt) return false;
  const ms = new Date(closedAt) - new Date(openedAt);
  return ms < minSeconds * 1000;
};
