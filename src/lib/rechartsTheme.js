// CSS variable references — resolved by the browser at render time
export const RC_COLORS = {
  profit:  "var(--profit)",
  loss:    "var(--loss)",
  warning: "var(--warning)",
  primary: "var(--primary)",
  muted:   "#94a3b8",
  grid:    "rgba(255,255,255,0.06)",
  text:    "#94a3b8",
  tooltip: {
    bg:     "var(--card)",
    border: "var(--border)",
    text:   "var(--card-foreground)",
  },
};

export const RC_PALETTE = [
  "#173ded",
  "#22c55e",
  "#f59e0b",
  "#8b5cf6",
  "#06b6d4",
  "#f97316",
  "#ec4899",
  "#84cc16",
];

export const tooltipStyle = {
  backgroundColor: "var(--card)",
  border:          "1px solid var(--border)",
  borderRadius:    "8px",
  color:           "var(--card-foreground)",
  fontSize:        "12px",
};
