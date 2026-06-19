import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { Helmet } from "react-helmet-async";
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
    title: "Discipline over prediction",
    body: "We don't sell signals or shortcuts. We build the systems that make following your own rules easier than breaking them.",
  },
  {
    title: "Truth over vanity metrics",
    body: "True net P&L, not gross. Real compliance checks, not assumptions. If the number is uncomfortable, we show it anyway.",
  },
  {
    title: "Built by a trader, for traders",
    body: "Every feature in Kraviq exists because it was missing when it mattered most — not because it looked good on a roadmap.",
  },
  {
    title: "Access, not exclusivity",
    body: "Institutional-grade tools shouldn't require institutional capital. Free to start, always.",
  },
];

const WHAT_WE_DO = [
  "Log trades manually, by importing a CSV file, or automatically by connecting a MetaTrader 4/5 account",
  "View performance statistics across one or more trading accounts",
  "Track compliance with prop trading firm rules such as drawdown limits and trading day requirements",
  "Receive a weekly score summarizing trading consistency, risk management, and overall performance",
];

export const AboutPage = () => (
  <PageLayout title="About Kraviq — Built by a Trader, for Traders">
    <Helmet>
      <title>About Kraviq — Built by a Trader, for Traders</title>
      <meta
        name="description"
        content="Kraviq was built by Ian Mwendwa, a software engineer and forex trader, to bring institutional-grade trading tools to retail traders. Learn the story behind Kraviq."
      />
      <link rel="canonical" href="https://kraviq.app/about" />
      <meta property="og:title" content="About Kraviq — Built by a Trader, for Traders" />
      <meta
        property="og:description"
        content="Kraviq was built by Ian Mwendwa, a software engineer and forex trader, to bring institutional-grade trading tools to retail traders. Learn the story behind Kraviq."
      />
      <meta property="og:url" content="https://kraviq.app/about" />
    </Helmet>

    {/* ── Hero ──────────────────────────────────────────────────────────── */}
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
        <motion.p {...reveal(0)} className="text-xs uppercase tracking-widest text-primary font-medium mb-4">
          About Kraviq
        </motion.p>
        <motion.h1
          {...reveal(0.05)}
          className="font-heading font-bold text-5xl md:text-6xl text-foreground leading-tight mb-6"
        >
          About Kraviq
        </motion.h1>
        <motion.p
          {...reveal(0.1)}
          className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed"
        >
          Kraviq is a web-based platform that helps retail forex traders track their trades, monitor multiple trading accounts, and measure their trading performance over time.
        </motion.p>
      </div>
    </section>

    {/* ── Problem ───────────────────────────────────────────────────────── */}
    <section className="py-20 border-t border-border">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div {...reveal(0)} className="mb-6">
          <p className="text-xs uppercase tracking-widest text-primary font-medium mb-4">
            The problem
          </p>
          <h2 className="font-heading font-bold text-3xl md:text-4xl text-foreground mb-8">
            Why most traders can't see what's actually happening
          </h2>
        </motion.div>
        <div className="space-y-5 text-[17px] leading-[1.75] text-muted-foreground">
          <motion.p {...reveal(0.05)}>
            Most retail traders track their performance the same way: a spreadsheet, a notes app, or whatever basic history their broker provides. It works, until it doesn't. As soon as you're managing more than one account, taking dozens of trades a week, or trying to figure out why a strategy that used to work suddenly stopped — manual tracking falls apart.
          </motion.p>
          <motion.p {...reveal(0.1)}>
            The real problem isn't a lack of data. Brokers and trading platforms generate plenty of it. The problem is that almost none of it gets turned into something a trader can actually use to make better decisions. Win rate and total P&L tell you what happened. They don't tell you why, or what to do differently.
          </motion.p>
        </div>
      </div>
    </section>

    {/* ── Founder Story ─────────────────────────────────────────────────── */}
    <section className="py-20 border-t border-border">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div {...reveal(0)} className="mb-6">
          <p className="text-xs uppercase tracking-widest text-primary font-medium mb-4">
            The story
          </p>
          <h2 className="font-heading font-bold text-3xl md:text-4xl text-foreground mb-8">
            Built from four years of trying to figure this out
          </h2>
        </motion.div>
        <div className="space-y-5 text-[17px] leading-[1.75] text-muted-foreground">
          <motion.p {...reveal(0.05)}>
            Kraviq was built by Ian Mwendwa, a software engineer and retail forex trader. Ian spent four years trading before becoming consistently profitable — and the turning point wasn't a new strategy or a better indicator. It was discipline. Sticking to rules, sizing risk consistently, and actually understanding what his own trading data was telling him.
          </motion.p>
          <motion.p {...reveal(0.1)}>
            For most of those four years, tracking was done the same way most traders do it — a spreadsheet and a Notion page, updated by hand after every session. It worked well enough, until it didn't. At one point, Ian went through a long stretch of losing trades with no clear explanation. The spreadsheet showed losses. It didn't show why — whether it was risk sizing, the sessions he was trading, a specific setup that had quietly stopped working, or simple inconsistency. With no way to diagnose the problem, the only option was to keep trading carefully, manage risk, and stay in the game long enough to find out — which is exactly what happened. The losing stretch passed, the strategy was sound, but the uncertainty in the middle of it was the real cost.
          </motion.p>
          <motion.p {...reveal(0.15)}>
            That experience is the reason Kraviq exists. Not because spreadsheets are bad — they got the job done for years — but because no retail trader should have to guess whether a losing stretch is bad luck, a broken strategy, or a discipline problem. Kraviq was built to be the tool Ian wished he'd had: one that turns trade history into a clear, honest answer about what's actually going on.
          </motion.p>
        </div>
      </div>
    </section>

    {/* ── Purpose ───────────────────────────────────────────────────────── */}
    <section className="py-20 border-t border-border">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div {...reveal(0)} className="mb-6">
          <p className="text-xs uppercase tracking-widest text-primary font-medium mb-4">
            Our purpose
          </p>
          <h2 className="font-heading font-bold text-3xl md:text-4xl text-foreground mb-8">
            Bringing institutional tools to retail traders
          </h2>
        </motion.div>
        <div className="space-y-5 text-[17px] leading-[1.75] text-muted-foreground">
          <motion.p {...reveal(0.05)}>
            Trading desks and proprietary trading firms have always had access to tools retail traders don't: real-time risk monitoring, performance attribution, rule-compliance systems, and structured review processes. None of that is because the underlying ideas are complicated — it's because building and maintaining those systems has historically required a team and a budget no individual trader has.
          </motion.p>
          <motion.p {...reveal(0.1)}>
            Kraviq exists to close that gap. Every feature — from automatic prop firm rule compliance, to true net P&L after every cost, to a weekly score that measures discipline and consistency the way a trading desk would review a trader — is an attempt to bring that institutional-grade infrastructure to a single retail trader, for free or at a fraction of the cost it would take to build it yourself.
          </motion.p>
        </div>
      </div>
    </section>

    {/* ── Mission + Vision ──────────────────────────────────────────────── */}
    <section className="py-20 border-t border-border">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-2 gap-8">
          <motion.div
            {...reveal(0)}
            className="bg-card border border-border rounded-2xl p-8"
          >
            <p className="text-xs uppercase tracking-widest text-primary font-medium mb-4">
              Our mission
            </p>
            <h2 className="font-heading font-bold text-2xl text-foreground mb-4">
              Our mission
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              To give every retail forex trader the tools, data, and discipline systems that institutions have always had — so trading skill, not access, decides who survives.
            </p>
          </motion.div>
          <motion.div
            {...reveal(0.08)}
            className="bg-card border border-border rounded-2xl p-8"
          >
            <p className="text-xs uppercase tracking-widest text-primary font-medium mb-4">
              Our vision
            </p>
            <h2 className="font-heading font-bold text-2xl text-foreground mb-4">
              Our vision
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              A world where any disciplined trader, anywhere, can run their trading like a real business — with the same clarity, accountability, and tools once reserved for trading desks.
            </p>
          </motion.div>
        </div>
      </div>
    </section>

    {/* ── Core Values ───────────────────────────────────────────────────── */}
    <section className="py-20 border-t border-border">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <motion.p {...reveal(0)} className="text-xs uppercase tracking-widest text-primary font-medium mb-4">
            What we stand for
          </motion.p>
          <motion.h2 {...reveal(0.05)} className="font-heading font-bold text-3xl md:text-4xl text-foreground">
            Our core values
          </motion.h2>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {VALUES.map((v, i) => (
            <motion.div
              key={v.title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.45, ease: "easeOut", delay: i * 0.08 }}
              className="bg-card border border-border rounded-2xl p-6"
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

    {/* ── What Kraviq Does ──────────────────────────────────────────────── */}
    <section className="py-20 border-t border-border">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div {...reveal(0)} className="mb-8">
          <p className="text-xs uppercase tracking-widest text-primary font-medium mb-4">
            Plain and simple
          </p>
          <h2 className="font-heading font-bold text-3xl md:text-4xl text-foreground mb-6">
            What Kraviq does
          </h2>
        </motion.div>
        <ul className="space-y-4">
          {WHAT_WE_DO.map((item, i) => (
            <motion.li
              key={i}
              initial={{ opacity: 0, x: -16 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, ease: "easeOut", delay: i * 0.07 }}
              className="flex items-start gap-3 text-[17px] leading-[1.75] text-muted-foreground"
            >
              <span className="text-primary mt-1.5 flex-shrink-0" aria-hidden="true">•</span>
              <span>{item}</span>
            </motion.li>
          ))}
        </ul>
      </div>
    </section>

    {/* ── Contact / CTA ─────────────────────────────────────────────────── */}
    <section className="py-20 border-t border-border">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.h2 {...reveal(0)} className="font-heading font-bold text-3xl md:text-4xl text-foreground mb-4">
          Get in touch
        </motion.h2>
        <motion.p {...reveal(0.05)} className="text-muted-foreground mb-2 text-[17px] leading-[1.75]">
          Questions, feedback, or just want to talk trading?{" "}
          <Link to="/contact" className="text-primary underline underline-offset-2 hover:opacity-80 transition-opacity">
            Visit our contact page
          </Link>{" "}
          or reach us directly at{" "}
          <a href="mailto:support@kraviq.app" className="text-primary underline underline-offset-2 hover:opacity-80 transition-opacity">
            support@kraviq.app
          </a>
          .
        </motion.p>
        <motion.div {...reveal(0.1)} className="mt-8">
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
