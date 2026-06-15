/**
 * Blog pillar definitions — source of truth for pillar metadata, colors,
 * and backlog topics.
 *
 * Derived directly from FRONTEND.md contentPillars[].
 */

export const PILLARS = [
  {
    id: "ict_smc",
    name: "ICT & Smart Money Concepts",
    description:
      "Explainer and how-to content covering order blocks, fair value gaps, liquidity, market structure, and kill zones.",
    cssVar: "var(--pillar-ict-smc)",
    // Tailwind-compatible inline style approach — avoids needing custom classes
    // for low-usage utility colors.
    chipClass: "bg-[#8B5CF6]/10 text-[#8B5CF6] border-[#8B5CF6]/20",
    badgeClass: "bg-[#8B5CF6]/10 text-[#8B5CF6]",
  },
  {
    id: "prop_firm_rules",
    name: "Prop Firm Rules & Compliance",
    description:
      "Content explaining drawdown rules, consistency rules, challenge mechanics, and why traders fail evaluations.",
    cssVar: "var(--pillar-prop-firm)",
    chipClass: "bg-[#0EA5E9]/10 text-[#0EA5E9] border-[#0EA5E9]/20",
    badgeClass: "bg-[#0EA5E9]/10 text-[#0EA5E9]",
  },
  {
    id: "psychology",
    name: "Trading Psychology & Discipline",
    description:
      "Evergreen content on revenge trading, overtrading, risk discipline, and journaling, framed with data rather than generic advice.",
    cssVar: "var(--pillar-psychology)",
    chipClass: "bg-[#F97316]/10 text-[#F97316] border-[#F97316]/20",
    badgeClass: "bg-[#F97316]/10 text-[#F97316]",
  },
  {
    id: "trading_business",
    name: "Trading as a Business",
    description:
      "Operational framing of trading: KPIs, P&L, profit factor, expectancy, and running trading like a professional operation.",
    cssVar: "var(--pillar-business)",
    chipClass: "bg-[#10B981]/10 text-[#10B981] border-[#10B981]/20",
    badgeClass: "bg-[#10B981]/10 text-[#10B981]",
  },
  {
    id: "volume_order_flow",
    name: "Volume & Order Flow",
    description:
      "Institutional-grade volume and order flow concepts - volume profile, VWAP, footprint charts, and COT positioning - translated for retail traders.",
    cssVar: "var(--pillar-volume-order-flow)",
    chipClass: "bg-[#06B6D4]/10 text-[#06B6D4] border-[#06B6D4]/20",
    badgeClass: "bg-[#06B6D4]/10 text-[#06B6D4]",
  },
  {
    id: "classic_ta",
    name: "Classic Strategies & Technical Analysis",
    description:
      "Time-tested technical analysis approaches - support/resistance, supply/demand, moving averages, and chart patterns - for traders who prefer structured, indicator-driven setups over discretionary order-flow reading.",
    cssVar: "var(--pillar-classic-ta)",
    chipClass: "bg-[#EAB308]/10 text-[#EAB308] border-[#EAB308]/20",
    badgeClass: "bg-[#EAB308]/10 text-[#EAB308]",
  },
];

/** Map from pillar ID → pillar object for O(1) lookups */
export const PILLAR_MAP = Object.fromEntries(PILLARS.map((p) => [p.id, p]));

/**
 * Backlog topics by pillar (not yet published — used in CategoryPage empty states).
 */
export const BACKLOG_BY_PILLAR = {
  ict_smc: [
    "Market Structure Shifts Explained (BOS vs CHoCH)",
    "OTE Zones: Trading the 62-79% Fibonacci Retracement",
  ],
  prop_firm_rules: [
    "Prop Firm Rules Explained: EAs, News Trading, and Weekend Holding",
    "Consistency Rules Explained: Why One Big Day Can Disqualify You",
    "What Happens After You Pass a Prop Firm Challenge?",
  ],
  psychology: [
    "Overtrading: Signs You're Trading Too Much",
    "Why Traders Break Their Own Rules (And How to Fix It)",
  ],
  trading_business: [
    "Expectancy: The Trading Metric Most Traders Ignore",
    "The Metrics Prop Firms Look At Before They Pay You",
  ],
  volume_order_flow: [],
  classic_ta: [],
};
