import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { ArrowRight, BookOpen, ListChecks, Link2, GaugeCircle, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageLayout } from "@/components/landing/PageLayout";
import { reveal } from "@/lib/animations";
import {
  buildFaqSchema,
  buildBreadcrumbSchema,
  buildWebPageSchema,
} from "@/lib/featurePageSchemas";
import {
  FeatureBreadcrumb,
  FeatureFAQ,
  RelatedFeatures,
  FeatureCTABanner,
} from "@/components/landing/FeaturePageShared";

const PAGE_TITLE = "Trading Strategy & Playbook Tracker | Kraviq";
const PAGE_DESCRIPTION =
  "Define your trading strategies as rules in Kraviq, then link every trade to the strategy it followed. See which setups actually work and which rules you keep breaking.";
const PAGE_URL = "https://kraviq.app/features/strategy";

const CAPABILITIES = [
  "Define each strategy as a named set of rules: entry conditions, risk parameters, and session restrictions",
  "Link every trade you log to the strategy it was meant to follow",
  "Performance breakdowns per strategy, so you can see which setups are actually working",
  "Rule-adherence tracking that flags when a trade deviated from its linked strategy",
  "Goals attached to each strategy, with progress measured against your own trade data",
  "Strategy performance feeds directly into your discipline score and Business Score",
];

const STEPS = [
  {
    icon: BookOpen,
    title: "Write the strategy down once",
    body: "Define entry conditions, risk parameters, and any session or pair restrictions as a named playbook entry, not a note you'll forget.",
  },
  {
    icon: Link2,
    title: "Link every trade to it",
    body: "When you log a trade, attach it to the strategy it was meant to follow. Trades with no strategy attached are tracked separately.",
  },
  {
    icon: ListChecks,
    title: "See rule adherence, not just outcome",
    body: "Kraviq flags trades that deviated from the linked strategy's rules, so you can separate a bad setup from a good setup executed badly.",
  },
  {
    icon: GaugeCircle,
    title: "Compare strategies against each other",
    body: "Win rate, average R:R, and P&L broken down per strategy, so you can tell which playbook entries are carrying your results and which aren't.",
  },
];

const FAQS = [
  {
    question: "What counts as a 'strategy' in Kraviq?",
    answer:
      "A strategy is a named set of rules you define: entry conditions, risk parameters, and any session or pair restrictions. Once it exists, you can link trades to it and track how closely your execution matched the plan.",
  },
  {
    question: "What happens if I don't link a trade to a strategy?",
    answer:
      "It's tracked as an unlinked trade in your overall trade history and ledger, the same as any other trade, just without the strategy-specific performance breakdown. Linking is optional but it's the only way to see which setups are actually working.",
  },
  {
    question: "How is rule adherence different from win rate?",
    answer:
      "Win rate tells you the outcome. Rule adherence tells you whether the trade followed the strategy's own entry and risk rules, regardless of whether it won. A trade can lose money and still have followed the plan exactly, which is a different problem than a trade that won by breaking the rules.",
  },
  {
    question: "Can I set goals tied to a specific strategy?",
    answer:
      "Yes. Goals attach to individual strategies and are measured against your actual linked trades, so progress reflects real execution rather than a number you update by hand.",
  },
];

const RELATED = [
  {
    title: "Business Score",
    description: "Strategy adherence feeds directly into your discipline pillar.",
    href: "/business-score",
  },
  {
    title: "Backtesting",
    description: "Prove a strategy in the War Room before linking it to live trades.",
    href: "/features/backtesting",
  },
  {
    title: "Trade Tracking",
    description: "Every linked trade carries the strategy's rules into your history.",
    href: "/features/trade-tracking",
  },
];

const breadcrumbItems = [
  { label: "Home", href: "/" },
  { label: "Features", href: "/#features" },
  { label: "Strategy & Playbook" },
];

export const StrategyPage = () => {
  const faqSchema = buildFaqSchema(FAQS);
  const breadcrumbSchema = buildBreadcrumbSchema(breadcrumbItems);
  const webPageSchema = buildWebPageSchema({
    name: PAGE_TITLE,
    description: PAGE_DESCRIPTION,
    url: PAGE_URL,
  });

  return (
    <PageLayout title="Strategy & Playbook">
      <Helmet>
        <title>{PAGE_TITLE}</title>
        <meta name="description" content={PAGE_DESCRIPTION} />
        <link rel="canonical" href={PAGE_URL} />
        <meta property="og:title" content={PAGE_TITLE} />
        <meta property="og:description" content={PAGE_DESCRIPTION} />
        <meta property="og:url" content={PAGE_URL} />
        <meta name="robots" content="index, follow" />
        <script type="application/ld+json">{webPageSchema}</script>
        <script type="application/ld+json">{breadcrumbSchema}</script>
        <script type="application/ld+json">{faqSchema}</script>
      </Helmet>

      {/* Hero */}
      <section className="relative pt-32 pb-16 overflow-hidden">
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: "radial-gradient(ellipse 70% 55% at 50% 0%, rgba(79,110,247,0.1), transparent)" }}
          aria-hidden="true"
        />
        <div className="relative max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <FeatureBreadcrumb items={breadcrumbItems} />
          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="font-heading font-bold text-4xl md:text-5xl text-foreground leading-tight mb-5"
          >
            Strategy &amp; Playbook
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: "easeOut", delay: 0.05 }}
            className="text-lg text-muted-foreground leading-relaxed mb-8"
          >
            Write down your trading rules once, link every trade to the strategy it followed, and see which setups actually work.
          </motion.p>
          <motion.div {...reveal(0.1)}>
            <Button size="lg" asChild className="gap-2">
              <Link to="/register">
                Start Free
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </motion.div>
        </div>
      </section>

      {/* What it is */}
      <section className="py-16 border-t border-border">
        <div className="max-w-[720px] mx-auto px-4 sm:px-6 lg:px-8">
          <motion.h2 {...reveal(0)} className="font-heading font-semibold text-2xl text-foreground mb-6">
            What it is
          </motion.h2>
          <div className="space-y-5 text-[17px] leading-[1.75] text-muted-foreground">
            <motion.p {...reveal(0.05)}>
              Strategy and playbook tracking lets you define a trading approach as a named set of rules, entry conditions, risk parameters, session restrictions, instead of leaving it as a mental model that shifts every week. Once a strategy exists, you link the trades you take to the strategy they were meant to follow.
            </motion.p>
            <motion.p {...reveal(0.1)}>
              That link is what makes the difference. Without it, your trade history is a flat list of wins and losses. With it, you can see exactly which strategies are carrying your performance, which ones you've outgrown, and which trades deviated from the plan even when they happened to win.
            </motion.p>
            <motion.p {...reveal(0.15)}>
              Strategy adherence also feeds into your discipline score, since following your own stated plan, win or lose, is one of the clearest signals of whether a trading business is being run with control.
            </motion.p>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-16 border-t border-border">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.h2 {...reveal(0)} className="font-heading font-semibold text-2xl text-foreground mb-10 text-center">
            How it works
          </motion.h2>
          <div className="grid sm:grid-cols-2 gap-5">
            {STEPS.map((step, i) => {
              const Icon = step.icon;
              return (
                <motion.div
                  key={step.title}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.45, ease: "easeOut", delay: i * 0.08 }}
                  className="bg-card border border-border rounded-2xl p-6"
                >
                  <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-4">
                    <Icon className="h-5 w-5 text-primary" aria-hidden="true" />
                  </div>
                  <h3 className="font-heading font-semibold text-base text-foreground mb-2">{step.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{step.body}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Why it matters */}
      <section className="py-16 border-t border-border">
        <div className="max-w-[720px] mx-auto px-4 sm:px-6 lg:px-8">
          <motion.h2 {...reveal(0)} className="font-heading font-semibold text-2xl text-foreground mb-6">
            Why it matters
          </motion.h2>
          <motion.p {...reveal(0.05)} className="text-[17px] leading-[1.75] text-muted-foreground">
            A trader without a defined strategy can't tell the difference between a setup that stopped working and a setup they stopped executing correctly. Both look the same in a basic win-loss log: a losing stretch. Linking trades to a written strategy splits that ambiguity apart. If rule adherence stayed high and results dropped, the edge may be gone. If adherence dropped, the problem is execution, not the strategy, and that's a different fix entirely.
          </motion.p>
        </div>
      </section>

      {/* Key capabilities */}
      <section className="py-16 border-t border-border">
        <div className="max-w-[720px] mx-auto px-4 sm:px-6 lg:px-8">
          <motion.h2 {...reveal(0)} className="font-heading font-semibold text-2xl text-foreground mb-6">
            Key capabilities
          </motion.h2>
          <ul className="space-y-4">
            {CAPABILITIES.map((item, i) => (
              <motion.li
                key={item}
                initial={{ opacity: 0, x: -16 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, ease: "easeOut", delay: i * 0.05 }}
                className="flex items-start gap-3 text-[17px] leading-[1.7] text-muted-foreground"
              >
                <Star className="h-4 w-4 text-primary mt-1.5 flex-shrink-0" aria-hidden="true" />
                <span>{item}</span>
              </motion.li>
            ))}
          </ul>
        </div>
      </section>

      <FeatureFAQ faqs={FAQS} />
      <RelatedFeatures items={RELATED} />
      <FeatureCTABanner heading="Find out which of your strategies actually work." />
    </PageLayout>
  );
};
