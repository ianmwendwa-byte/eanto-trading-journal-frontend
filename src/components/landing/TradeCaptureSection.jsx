import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { PenLine, FileUp, Wifi } from "lucide-react";

// ── Step mockups ──────────────────────────────────────────────────────────────

const ManualEntryMockup = () => (
  <div className="bg-card border border-border rounded-xl p-4 w-full max-w-[260px] shadow-lg">
    <div className="text-xs font-medium text-foreground mb-3">Add Trade</div>
    <div className="space-y-2 mb-3">
      <div className="bg-muted rounded-md px-3 py-2 flex items-center justify-between">
        <span className="text-xs text-muted-foreground">Pair</span>
        <span className="text-xs font-mono text-foreground">EURUSD</span>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div className="bg-success/10 border border-success/20 rounded-md px-3 py-2 text-center">
          <span className="text-xs font-medium text-success">BUY</span>
        </div>
        <div className="bg-muted rounded-md px-3 py-2 text-center">
          <span className="text-xs text-muted-foreground">SELL</span>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div className="bg-muted rounded-md px-3 py-2">
          <div className="text-[9px] text-muted-foreground">Entry</div>
          <div className="text-xs font-mono text-foreground">1.0821</div>
        </div>
        <div className="bg-muted rounded-md px-3 py-2">
          <div className="text-[9px] text-muted-foreground">Exit</div>
          <div className="text-xs font-mono text-foreground">1.0893</div>
        </div>
      </div>
    </div>
    <div className="bg-success/10 border border-success/20 rounded-md px-3 py-2 flex justify-between items-center">
      <span className="text-[10px] text-muted-foreground">Live P&L</span>
      <span className="text-sm font-mono font-bold text-success">+$144.00</span>
    </div>
  </div>
);

const CSVImportMockup = () => (
  <div className="bg-card border border-border rounded-xl p-4 w-full max-w-[260px] shadow-lg">
    <div className="text-xs font-medium text-foreground mb-3">Import Trades</div>
    <div className="bg-muted rounded-md px-3 py-2 mb-2">
      <div className="text-[9px] text-muted-foreground mb-0.5">Broker</div>
      <div className="text-xs text-foreground">IC Markets MT5</div>
    </div>
    <div className="border-2 border-dashed border-border rounded-md p-4 text-center mb-2">
      <FileUp className="h-5 w-5 text-muted-foreground mx-auto mb-1" />
      <div className="text-[10px] text-muted-foreground">
        history.xlsx dropped
      </div>
    </div>
    <div className="bg-muted rounded-md p-2">
      <div className="text-[9px] text-muted-foreground mb-1.5">Preview</div>
      {[
        { pair: "EURUSD", pnl: "+$124" },
        { pair: "GBPJPY", pnl: "-$48" },
        { pair: "USDJPY", pnl: "+$210" },
      ].map((t, i) => (
        <div key={i} className="flex justify-between py-0.5 border-b border-border/30 last:border-0">
          <span className="text-[9px] font-mono text-foreground">{t.pair}</span>
          <span className={`text-[9px] font-mono ${t.pnl.startsWith("+") ? "text-success" : "text-danger"}`}>
            {t.pnl}
          </span>
        </div>
      ))}
    </div>
  </div>
);

const EASyncMockup = () => (
  <div className="bg-card border border-border rounded-xl p-4 w-full max-w-[260px] shadow-lg">
    <div className="flex items-center justify-between mb-3">
      <div className="text-xs font-medium text-foreground">EA Sync</div>
      <div className="flex items-center gap-1.5">
        <div className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
        <span className="text-[10px] text-success font-medium">Online</span>
      </div>
    </div>
    <div className="space-y-2">
      <div className="bg-muted rounded-md px-3 py-2 flex justify-between items-center">
        <span className="text-[10px] text-muted-foreground">Last synced</span>
        <span className="text-[10px] font-mono text-foreground">2 min ago</span>
      </div>
      <div className="bg-muted rounded-md px-3 py-2 flex justify-between items-center">
        <span className="text-[10px] text-muted-foreground">Today's syncs</span>
        <span className="text-[10px] font-mono text-foreground">3 trades</span>
      </div>
      <div className="bg-muted rounded-md px-3 py-2 flex justify-between items-center">
        <span className="text-[10px] text-muted-foreground">Account</span>
        <span className="text-[10px] font-mono text-foreground">IC Markets</span>
      </div>
    </div>
    <div className="mt-3 pt-3 border-t border-border">
      <div className="text-[9px] text-muted-foreground">
        Syncs automatically on trade close
      </div>
    </div>
  </div>
);

// ── Steps config ──────────────────────────────────────────────────────────────

const STEPS = [
  {
    num: "01",
    label: "Manual",
    icon: PenLine,
    badge: null,
    title: "Add trades as you trade",
    description:
      "Quick trade entry form with live P&L preview and R:R calculation. Add notes, tags, session info, and setup quality ratings. Takes under 30 seconds.",
    Mockup: ManualEntryMockup,
  },
  {
    num: "02",
    label: "CSV Import",
    icon: FileUp,
    badge: null,
    title: "Import your entire history",
    description:
      "Export your trade history from MT4/MT5 and import it in seconds. Kraviq auto-detects your broker format and maps every field correctly.",
    Mockup: CSVImportMockup,
  },
  {
    num: "03",
    label: "EA Sync",
    icon: Wifi,
    badge: "Automatic",
    title: "Zero-touch trade capture",
    description:
      "Install the Kraviq EA on your MT4/MT5 chart. Every trade syncs automatically the moment it closes — pair, direction, P&L, session, and broker details.",
    Mockup: EASyncMockup,
  },
];

export const TradeCaptureSection = () => {
  return (
    <section
      className="py-24 md:py-32 border-t border-border overflow-hidden"
      aria-labelledby="capture-heading"
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-20">
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="text-xs uppercase tracking-widest text-primary mb-4 font-medium"
          >
            Trade Capture
          </motion.p>
          <motion.h2
            id="capture-heading"
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, ease: "easeOut", delay: 0.05 }}
            className="font-heading font-bold text-4xl md:text-5xl text-foreground mb-4"
          >
            Every trade captured. Your way.
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, ease: "easeOut", delay: 0.1 }}
            className="text-muted-foreground text-lg max-w-lg mx-auto"
          >
            Three ways to get your trades into Kraviq — choose one or use
            all three. See the full breakdown on the{" "}
            <Link to="/features/trade-tracking" className="text-primary hover:underline">
              trade tracking page
            </Link>
            .
          </motion.p>
        </div>

        {/* Timeline */}
        <div className="relative">
          {/* Vertical line */}
          <motion.div
            initial={{ scaleY: 0 }}
            whileInView={{ scaleY: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1.2, ease: "easeOut", delay: 0.2 }}
            className="absolute left-6 top-6 bottom-6 w-px bg-primary/20 origin-top hidden md:block"
            aria-hidden="true"
          />

          <div className="space-y-16">
            {STEPS.map((step, i) => {
              const Icon = step.icon;
              return (
                <motion.div
                  key={step.num}
                  initial={{ opacity: 0, x: -24 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{
                    duration: 0.5,
                    ease: "easeOut",
                    delay: i * 0.1,
                  }}
                  className="grid md:grid-cols-[auto_1fr_auto] gap-8 items-center"
                >
                  {/* Timeline dot + step num */}
                  <div className="hidden md:flex flex-col items-center gap-2">
                    <div className="w-12 h-12 rounded-full border border-primary/40 bg-primary/10 flex items-center justify-center z-10">
                      <Icon className="h-5 w-5 text-primary" aria-hidden="true" />
                    </div>
                  </div>

                  {/* Content */}
                  <div>
                    <div className="flex items-center gap-3 mb-3">
                      <span className="text-xs font-medium text-muted-foreground font-mono">
                        {step.num} — {step.label}
                      </span>
                      {step.badge && (
                        <span className="text-[10px] font-medium bg-success/10 text-success border border-success/20 rounded-full px-2 py-0.5">
                          {step.badge}
                        </span>
                      )}
                    </div>
                    <h3 className="font-heading font-bold text-2xl text-foreground mb-3">
                      {step.title}
                    </h3>
                    <p className="text-muted-foreground leading-relaxed max-w-md">
                      {step.description}
                    </p>
                  </div>

                  {/* Mockup */}
                  <div className="flex justify-center md:justify-end">
                    <motion.div
                      animate={{ y: [0, -6, 0] }}
                      transition={{
                        duration: 3.5 + i * 0.5,
                        repeat: Infinity,
                        ease: "easeInOut",
                        delay: i * 0.4,
                      }}
                    >
                      <step.Mockup />
                    </motion.div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};
