import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { TrendingUp, Target, Users, BarChart3, ArrowRight, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageLayout } from "@/components/landing/PageLayout";

const reveal = (delay = 0) => ({
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.5, ease: "easeOut", delay },
});

const VALUES = [
  {
    icon: TrendingUp,
    title: "Data over emotion",
    body: "Every trading decision should be backed by evidence. Tradecore exists to turn your raw trade history into clear, actionable truth — not guesswork.",
  },
  {
    icon: Target,
    title: "Business mindset",
    body: "The best traders treat trading like a business. We built Tradecore to give retail traders the same discipline tools that institutional desks take for granted.",
  },
  {
    icon: Users,
    title: "Community first",
    body: "Tradecore was built inside a trading community, for that community. Every feature came from real traders asking real questions about their real performance.",
  },
  {
    icon: BarChart3,
    title: "Honest numbers",
    body: "Gross P&L is a lie you tell yourself. Tradecore shows you true net P&L — after every commission, swap, withdrawal, and prop fee. No flattering the numbers.",
  },
];

const STATS = [
  { value: "1,000+", label: "Community traders" },
  { value: "3",      label: "Account types supported" },
  { value: "5",      label: "Business Score pillars" },
  { value: "MT4/5",  label: "Platform compatibility" },
];

export const AboutPage = () => (
  <PageLayout title="About">

    {/* ── Hero ──────────────────────────────────────────────────────────── */}
    <section className="relative pt-32 pb-20 overflow-hidden">
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 70% 50% at 50% 0%, rgba(23,61,237,0.1), transparent)",
        }}
        aria-hidden="true"
      />
      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.p {...reveal(0)} className="text-xs uppercase tracking-widest text-primary font-medium mb-4">
          About Tradecore
        </motion.p>
        <motion.h1
          {...reveal(0.05)}
          className="font-heading font-bold text-5xl md:text-6xl text-foreground leading-tight mb-6"
        >
          Built by a trader.
          <br />
          For traders like you.
        </motion.h1>
        <motion.p
          {...reveal(0.1)}
          className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed"
        >
          Tradecore started as a personal frustration — too many spreadsheets,
          too little clarity, and no single place to run a real trading business.
          So we built one.
        </motion.p>
      </div>
    </section>

    {/* ── Story ─────────────────────────────────────────────────────────── */}
    <section className="py-20 border-t border-border">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-2 gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -32 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.55, ease: "easeOut" }}
          >
            <p className="text-xs uppercase tracking-widest text-primary font-medium mb-4">
              The story
            </p>
            <h2 className="font-heading font-bold text-3xl md:text-4xl text-foreground mb-6">
              Serious traders deserve serious tools.
            </h2>
            <div className="space-y-4 text-muted-foreground leading-relaxed">
              <p>
                Like most retail traders, we started with a MetaTrader terminal,
                a notebook, and a spreadsheet that kept breaking. The further we
                pushed our trading, the more obvious the gap became: there was
                nowhere to run a trading business the way a real business gets run.
              </p>
              <p>
                TradeZella tracks trades. Myfxbook shows a chart. But none of
                them told us the one number that actually mattered —{" "}
                <strong className="text-foreground">
                  am I actually profitable after every cost?
                </strong>
              </p>
              <p>
                And none of them helped with the harder question: am I running a
                sustainable trading business, or just getting lucky on a winning
                streak?
              </p>
              <p>
                Tradecore was built to answer both questions — and every question
                in between.
              </p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 32 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.55, ease: "easeOut", delay: 0.1 }}
            className="space-y-4"
          >
            {[
              "Multi-account management for normal, prop, and war accounts",
              "True net P&L after every commission, swap, and fee",
              "Prop firm challenge tracking with real-time compliance",
              "EA auto-sync from MetaTrader 4 and MT5",
              "The Trading Business Score — a single number for your trading health",
              "War account system for isolated strategy testing",
            ].map((point) => (
              <div key={point} className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Check className="h-3 w-3 text-primary" aria-hidden="true" />
                </div>
                <p className="text-sm text-muted-foreground">{point}</p>
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>

    {/* ── Values ────────────────────────────────────────────────────────── */}
    <section className="py-20 border-t border-border">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <motion.p {...reveal(0)} className="text-xs uppercase tracking-widest text-primary font-medium mb-4">
            What we stand for
          </motion.p>
          <motion.h2 {...reveal(0.05)} className="font-heading font-bold text-3xl md:text-4xl text-foreground">
            Our values
          </motion.h2>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5"
        >
          {VALUES.map((v, i) => {
            const Icon = v.icon;
            return (
              <motion.div
                key={v.title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.45, ease: "easeOut", delay: i * 0.08 }}
                className="bg-card border border-border rounded-2xl p-6"
              >
                <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-4">
                  <Icon className="h-5 w-5 text-primary" aria-hidden="true" />
                </div>
                <h3 className="font-heading font-semibold text-base text-foreground mb-2">
                  {v.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{v.body}</p>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>

    {/* ── Stats ─────────────────────────────────────────────────────────── */}
    <section className="py-20 border-t border-border">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-px bg-border rounded-2xl overflow-hidden"
        >
          {STATS.map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, ease: "easeOut", delay: i * 0.07 }}
              className="bg-card p-8 text-center"
            >
              <div className="font-heading font-bold text-3xl text-primary mb-1 tabular-nums">
                {s.value}
              </div>
              <div className="text-xs text-muted-foreground uppercase tracking-wide">
                {s.label}
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>

    {/* ── CTA ───────────────────────────────────────────────────────────── */}
    <section className="py-20 border-t border-border">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.h2 {...reveal(0)} className="font-heading font-bold text-3xl md:text-4xl text-foreground mb-4">
          Ready to run your trading like a business?
        </motion.h2>
        <motion.p {...reveal(0.05)} className="text-muted-foreground mb-8">
          Free to start. No credit card required.
        </motion.p>
        <motion.div {...reveal(0.1)} className="flex flex-col sm:flex-row gap-3 justify-center">
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Button size="lg" asChild className="gap-2">
              <Link to="/register">
                Get Started Free
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </motion.div>
          <Button variant="outline" size="lg" asChild>
            <Link to="/community">Meet the community</Link>
          </Button>
        </motion.div>
      </div>
    </section>

  </PageLayout>
);
