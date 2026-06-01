import { motion } from "framer-motion";
import { Check } from "lucide-react";

const reveal = (dir = "left") => ({
  initial: { opacity: 0, x: dir === "left" ? -40 : 40 },
  whileInView: { opacity: 1, x: 0, transition: { duration: 0.6, ease: "easeOut" } },
});

// ── Inline mockup cards ───────────────────────────────────────────────────────

const NormalAccountMockup = () => (
  <div className="bg-card border border-border rounded-2xl p-5 w-full max-w-xs shadow-xl">
    <div className="flex items-center justify-between mb-3">
      <div>
        <div className="text-xs text-muted-foreground mb-0.5">Account</div>
        <div className="font-heading font-semibold text-foreground">
          Main Account
        </div>
      </div>
      <span className="text-[10px] bg-success/10 text-success border border-success/20 rounded-full px-2.5 py-1 font-medium">
        Normal
      </span>
    </div>
    <div className="text-2xl font-mono font-bold text-foreground mb-1">
      $12,450.00
    </div>
    <div className="text-sm text-success font-mono mb-4">+$4,218 (+51.2%)</div>
    <div className="grid grid-cols-3 gap-2">
      {[
        { label: "Win Rate", val: "68.4%" },
        { label: "Trades", val: "127" },
        { label: "R:R", val: "1:2.1" },
      ].map((s) => (
        <div key={s.label} className="bg-muted rounded-lg p-2 text-center">
          <div className="text-[10px] text-muted-foreground">{s.label}</div>
          <div className="text-xs font-mono font-bold text-foreground">
            {s.val}
          </div>
        </div>
      ))}
    </div>
  </div>
);

const PropAccountMockup = () => (
  <div className="bg-card border border-primary/20 rounded-2xl p-5 w-full max-w-xs shadow-xl">
    <div className="flex items-center justify-between mb-3">
      <div>
        <div className="text-xs text-muted-foreground mb-0.5">Challenge</div>
        <div className="font-heading font-semibold text-foreground">
          FTMO $50K
        </div>
      </div>
      <span className="text-[10px] bg-primary/10 text-primary border border-primary/20 rounded-full px-2.5 py-1 font-medium">
        Prop · Evaluation
      </span>
    </div>
    <div className="space-y-3">
      <div>
        <div className="flex justify-between text-xs mb-1">
          <span className="text-muted-foreground">Profit Target</span>
          <span className="font-mono text-foreground">
            $2,100 / $5,000
          </span>
        </div>
        <div className="h-1.5 bg-muted rounded-full overflow-hidden">
          <div className="h-full bg-success rounded-full" style={{ width: "42%" }} />
        </div>
      </div>
      <div>
        <div className="flex justify-between text-xs mb-1">
          <span className="text-muted-foreground">Max Drawdown</span>
          <span className="font-mono text-foreground">
            1.8% / 10%
          </span>
        </div>
        <div className="h-1.5 bg-muted rounded-full overflow-hidden">
          <div className="h-full bg-success rounded-full" style={{ width: "18%" }} />
        </div>
      </div>
      <div>
        <div className="flex justify-between text-xs mb-1">
          <span className="text-muted-foreground">Trading Days</span>
          <span className="font-mono text-foreground">8 / 10</span>
        </div>
        <div className="h-1.5 bg-muted rounded-full overflow-hidden">
          <div className="h-full bg-primary rounded-full" style={{ width: "80%" }} />
        </div>
      </div>
    </div>
    <div className="mt-3 pt-3 border-t border-border flex items-center justify-between">
      <span className="text-[10px] text-muted-foreground">Compliance</span>
      <span className="text-[10px] text-success font-medium">All rules met ✓</span>
    </div>
  </div>
);

const WarAccountMockup = () => (
  <div className="bg-card border border-danger/30 rounded-2xl p-5 w-full max-w-xs shadow-xl">
    <div className="flex items-center justify-between mb-3">
      <div>
        <div className="text-xs text-muted-foreground mb-0.5">Strategy Lab</div>
        <div className="font-heading font-semibold text-foreground">
          EA Test Lab
        </div>
      </div>
      <span className="text-[10px] bg-danger/10 text-danger border border-danger/20 rounded-full px-2.5 py-1 font-medium">
        War
      </span>
    </div>
    <div className="text-2xl font-mono font-bold text-foreground mb-1">
      $2,000.00
    </div>
    <div className="text-sm text-danger font-mono mb-4">-$340 (-17.0%)</div>
    <div className="bg-danger/5 border border-danger/20 rounded-lg p-2.5 mb-3">
      <div className="text-[10px] text-muted-foreground mb-0.5">
        Graduation Pipeline
      </div>
      <div className="flex items-center gap-1.5">
        <div className="w-2 h-2 rounded-full bg-warning" />
        <span className="text-xs text-foreground font-medium">
          Testing — not yet ready
        </span>
      </div>
    </div>
    <div className="text-[10px] text-muted-foreground">
      Data fully isolated from your real metrics
    </div>
  </div>
);

// ── Account rows ──────────────────────────────────────────────────────────────

const ACCOUNT_TYPES = [
  {
    num: "01",
    badge: "Normal Account",
    badgeCls: "bg-success/10 text-success border-success/20",
    title: "Your Trading Capital",
    description:
      "Track your personal trading with complete analytics. Custom rules, risk parameters, and full performance history. Your real money, tracked with precision.",
    chips: [
      "Manual trading",
      "EA sync",
      "CSV import",
      "Custom rules",
      "Full analytics",
    ],
    Mockup: NormalAccountMockup,
    reverse: false,
  },
  {
    num: "02",
    badge: "Prop Account",
    badgeCls: "bg-primary/10 text-primary border-primary/20",
    title: "Funded Challenges. Tracked Perfectly.",
    description:
      "Every prop firm rule monitored in real time. Drawdown limits, profit targets, trading day requirements, and payout eligibility — always visible, never missed.",
    chips: [
      "FTMO & FundingPips",
      "Challenge tracker",
      "Drawdown alerts",
      "Compliance check",
      "Payout eligibility",
    ],
    Mockup: PropAccountMockup,
    reverse: true,
  },
  {
    num: "03",
    badge: "War Account",
    badgeCls: "bg-danger/10 text-danger border-danger/20",
    title: "Your Experimental Sandbox.",
    description:
      "Test your most aggressive strategies in complete isolation. Full margin, news trading, scalping — data never bleeds into your real performance. When a strategy earns its place, graduate it to production.",
    chips: [
      "Isolated data",
      "High risk allowed",
      "Strategy testing",
      "Graduation pipeline",
      "No metric bleed",
    ],
    Mockup: WarAccountMockup,
    reverse: false,
  },
];

export const AccountManagementSection = () => {
  return (
    <section
      className="py-24 md:py-32 border-t border-border"
      aria-labelledby="accounts-heading"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-20">
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="text-xs uppercase tracking-widest text-primary mb-4 font-medium"
          >
            Account Management
          </motion.p>
          <motion.h2
            id="accounts-heading"
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, ease: "easeOut", delay: 0.05 }}
            className="font-heading font-bold text-4xl md:text-5xl text-foreground mb-4"
          >
            One platform. Every type of account.
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, ease: "easeOut", delay: 0.1 }}
            className="text-muted-foreground text-lg max-w-xl mx-auto"
          >
            Whether you're trading your own capital, managing prop firm
            challenges, or testing experimental strategies — Tradecore has a
            dedicated account type for you.
          </motion.p>
        </div>

        {/* Account type rows */}
        <div className="space-y-24">
          {ACCOUNT_TYPES.map((acc) => {
            const { Mockup } = acc;
            const contentSide = !acc.reverse ? "left" : "right";
            const mockupSide = !acc.reverse ? "right" : "left";

            return (
              <div
                key={acc.num}
                className={`grid md:grid-cols-2 gap-12 md:gap-20 items-center ${
                  acc.reverse ? "md:[&>*:first-child]:order-2 md:[&>*:last-child]:order-1" : ""
                }`}
              >
                {/* Content */}
                <motion.div
                  {...reveal(contentSide)}
                  viewport={{ once: true }}
                >
                  <div className="text-[80px] font-heading font-bold text-border/40 leading-none mb-4 select-none">
                    {acc.num}
                  </div>
                  <span
                    className={`inline-block text-xs font-medium border rounded-full px-3 py-1 mb-4 ${acc.badgeCls}`}
                  >
                    {acc.badge}
                  </span>
                  <h3 className="font-heading font-bold text-3xl text-foreground mb-4">
                    {acc.title}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed mb-6">
                    {acc.description}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {acc.chips.map((chip) => (
                      <span
                        key={chip}
                        className="inline-flex items-center gap-1.5 text-xs bg-muted text-muted-foreground rounded-full px-3 py-1.5"
                      >
                        <Check className="h-3 w-3 text-success" aria-hidden="true" />
                        {chip}
                      </span>
                    ))}
                  </div>
                </motion.div>

                {/* Mockup */}
                <motion.div
                  {...reveal(mockupSide)}
                  viewport={{ once: true }}
                  className="flex justify-center"
                >
                  <motion.div
                    animate={{ y: [0, -8, 0] }}
                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                  >
                    <Mockup />
                  </motion.div>
                </motion.div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
