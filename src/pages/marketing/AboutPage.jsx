import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { Helmet } from "react-helmet-async";
import { Button } from "@/components/ui/button";
import { PageLayout } from "@/components/landing/PageLayout";
import { useIsMounted } from "@/hooks/useIsMounted";

const reveal = (delay = 0, mounted = true) => ({
  initial: mounted ? { opacity: 0, y: 24 } : false,
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.5, ease: "easeOut", delay },
});

const DEFINITION_SENTENCE =
  "Kraviq is a business operating system for retail traders. It runs your trade journal, ledger, backtesting, and risk calculators in one place, then adds the institutional-grade tools that most retail traders, and even some institutions, don't have access to.";

const WHAT_KRAVIQ_DOES = [
  {
    text: "Logs every trade manually, by CSV import, or automatically through MT4/MT5 EA sync",
    href: "/features/trade-tracking",
  },
  {
    text: "Tracks performance across every account you run: normal, prop, and high-risk",
    href: "/war-account",
  },
  {
    text: "Keeps a financial ledger with true net profit and loss after costs, not the gross number your broker shows you",
    href: "/features/financial-ledger",
  },
  {
    text: "Backtests a strategy against historical price data before you risk live money",
    href: "/features/backtesting",
  },
  {
    text: "Calculates risk, position size, and risk to reward before you place a trade",
    href: "/features/risk-calculators",
  },
  {
    text: "Runs Kraviq AI against your trade history to flag patterns you'd miss in a spreadsheet",
    href: null,
  },
  {
    text: "Monitors prop firm rules automatically: drawdown limits, trading days, lot size, session restrictions",
    href: "/features/prop-firm-compliance",
  },
  {
    text: "Scores your consistency, risk management, profitability, discipline, and growth every week, on a 100-point scale",
    href: "/business-score",
  },
  {
    text: "Gives retail traders, and smaller institutions, the same tools prop desks and hedge funds already use",
    href: null,
  },
];

const PILLARS = [
  {
    title: "Trade",
    body: "Capture every trade: manually, via CSV, or through your MT4/MT5 EA. Full compliance tracking and behavioural analysis built in.",
    highlighted: false,
  },
  {
    title: "Score",
    body: "The Trading Business Score measures five pillars: Consistency, Risk, Profitability, Discipline, Growth. Know exactly where you stand.",
    highlighted: true,
  },
  {
    title: "Scale",
    body: "True net P&L after all costs. Prop firm challenge tracking. War account graduation pipeline. Run it like a business.",
    highlighted: false,
  },
];

const VALUES = [
  {
    title: "Discipline over prediction",
    body: "We don't sell signals. We build systems that make following your own rules easier than breaking them.",
  },
  {
    title: "Truth over vanity metrics",
    body: "True net P&L, not gross. Real compliance checks, not assumptions.",
  },
  {
    title: "Built by a trader, for traders",
    body: "Every feature exists because it was missing when it mattered most.",
  },
  {
    title: "Access, not exclusivity",
    body: "Institutional-grade tools without institutional capital. Free to start.",
  },
];

const FOUNDER_PARAGRAPHS = [
  "Ian Mwendwa built Kraviq. He's a software engineer and a forex trader.",
  "It took him four years to become consistently profitable. The turning point wasn't a new strategy. It was discipline. For most of those four years he tracked every trade by hand, in a spreadsheet and Notion.",
  "Then a losing stretch hit with no obvious cause. The spreadsheet showed the damage. It couldn't explain it: bad risk sizing, the wrong session, a setup that had stopped working, or just inconsistency. He never fully knew which. What kept the account alive was discipline and tight risk management, long enough for the edge to come back.",
  "Kraviq exists so the next trader doesn't have to guess.",
];

export const AboutPage = () => {
  const isMounted = useIsMounted();
  return (
  <PageLayout title="About Kraviq | Business Operating System for Retail Traders">
    <Helmet>
      <title>About Kraviq | Business Operating System for Retail Traders</title>
      <meta
        name="description"
        content="Kraviq is a business operating system for retail traders, built by Ian Mwendwa. Journal your trades, track your ledger, backtest strategies, run risk calculators, and use the same institutional-grade tools prop desks already have."
      />
      <link rel="canonical" href="https://kraviq.app/about" />
      <meta property="og:title" content="About Kraviq | Business Operating System for Retail Traders" />
      <meta
        property="og:description"
        content="Kraviq is a business operating system for retail traders, built by Ian Mwendwa. Journal your trades, track your ledger, backtest strategies, run risk calculators, and use the same institutional-grade tools prop desks already have."
      />
      <meta property="og:url" content="https://kraviq.app/about" />
    </Helmet>

    {/* ── Header ────────────────────────────────────────────────────────── */}
    <section className="relative pt-32 pb-20 overflow-hidden">
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 70% 50% at 50% 0%, rgba(79,110,247,0.1), transparent)",
        }}
        aria-hidden="true"
      />
      <div className="relative max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.h1
          {...reveal(0, isMounted)}
          className="font-heading font-bold text-5xl md:text-6xl text-foreground leading-tight mb-6"
        >
          About Kraviq
        </motion.h1>
        <motion.p
          {...reveal(0.05, isMounted)}
          className="text-lg text-foreground max-w-2xl mx-auto leading-relaxed"
        >
          {DEFINITION_SENTENCE}
        </motion.p>
      </div>
    </section>

    {/* ── Mission / Vision ─────────────────────────────────────────────── */}
    <section className="py-24 border-t border-border">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-2 gap-8">
          <motion.div {...reveal(0, isMounted)}>
            <p className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground mb-3 pb-2 border-b border-border">
              Mission
            </p>
            <p className="text-foreground leading-relaxed">
              Bring institutional-grade trading infrastructure to retail
              traders, and to the institutions that don't have full access to
              it either.
            </p>
          </motion.div>
          <motion.div {...reveal(0.08, isMounted)}>
            <p className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground mb-3 pb-2 border-b border-border">
              Vision
            </p>
            <p className="text-foreground leading-relaxed">
              Any trader, or any small fund, can run trading like a business,
              with the same clarity, accountability, and tools that have
              always belonged to professional desks.
            </p>
          </motion.div>
        </div>
      </div>
    </section>

    {/* ── What Kraviq does ─────────────────────────────────────────────── */}
    <section className="py-24 border-t border-border">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.h2
          {...reveal(0, isMounted)}
          className="font-heading font-bold text-3xl md:text-4xl text-foreground mb-8"
        >
          What Kraviq does
        </motion.h2>
        <ul className="space-y-4">
          {WHAT_KRAVIQ_DOES.map((item, i) => (
            <motion.li
              key={item.text}
              initial={isMounted ? { opacity: 0, x: -16 } : false}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, ease: "easeOut", delay: i * 0.06 }}
              className="flex items-start gap-3 text-[17px] leading-[1.7] text-muted-foreground"
            >
              <span className="text-primary mt-1.5 flex-shrink-0" aria-hidden="true">•</span>
              {item.href ? (
                <span>
                  <Link to={item.href} className="text-primary hover:underline">
                    {item.text}
                  </Link>
                </span>
              ) : (
                <span>{item.text}</span>
              )}
            </motion.li>
          ))}
        </ul>
      </div>
    </section>

    {/* ── Brand Pillars ────────────────────────────────────────────────── */}
    <section className="py-24 border-t border-border">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid sm:grid-cols-3 gap-3">
          {PILLARS.map((pillar, i) => (
            <motion.div
              key={pillar.title}
              initial={isMounted ? { opacity: 0, y: 24 } : false}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.45, ease: "easeOut", delay: i * 0.08 }}
              className={
                pillar.highlighted
                  ? "bg-primary/[0.04] border border-primary/30 rounded-lg p-7 flex flex-col gap-3"
                  : "bg-card border border-border rounded-lg p-7 flex flex-col gap-3"
              }
            >
              <h3 className="font-heading font-semibold text-xl text-foreground">
                {pillar.title}
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {pillar.body}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>

    {/* ── Core Values ──────────────────────────────────────────────────── */}
    <section className="py-24 border-t border-border">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.h2
          {...reveal(0, isMounted)}
          className="font-heading font-bold text-3xl md:text-4xl text-foreground mb-12 text-center"
        >
          What we stand for
        </motion.h2>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {VALUES.map((v, i) => (
            <motion.div
              key={v.title}
              initial={isMounted ? { opacity: 0, y: 24 } : false}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.45, ease: "easeOut", delay: i * 0.08 }}
              className="bg-card border border-border rounded-lg p-6"
            >
              <h3 className="font-heading font-semibold text-base text-foreground mb-3">
                {v.title}
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{v.body}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>

    {/* ── Founder ───────────────────────────────────────────────────────── */}
    <section className="py-24 border-t border-border">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.h2
          {...reveal(0, isMounted)}
          className="font-heading font-bold text-3xl md:text-4xl text-foreground mb-8"
        >
          Founder
        </motion.h2>
        <div className="space-y-5 text-[17px] leading-[1.75] text-muted-foreground">
          {FOUNDER_PARAGRAPHS.map((p, i) => (
            <motion.p key={p} {...reveal(0.05 * i, isMounted)}>
              {p}
            </motion.p>
          ))}
        </div>
      </div>
    </section>

    {/* ── Closing CTA ───────────────────────────────────────────────────── */}
    <section className="py-24 border-t border-border">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.div {...reveal(0, isMounted)}>
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="inline-block">
            <Button size="lg" asChild className="gap-2">
              <Link to="/register">
                Start Building Today
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </motion.div>
        </motion.div>
      </div>
    </section>
  </PageLayout>
  );
};
