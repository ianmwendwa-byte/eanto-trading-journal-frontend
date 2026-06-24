import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { ArrowRight, Edit3, Upload, Wifi, ShieldCheck, BarChart3, Star } from "lucide-react";
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

const PAGE_TITLE = "Trade Tracking Software for Forex Traders | Kraviq";
const PAGE_DESCRIPTION =
  "Log every forex trade manually, by CSV, or automatically through MT4/MT5 EA sync. Kraviq tracks pair, direction, lot size, R:R, grade, and discipline score on every trade.";
const PAGE_URL = "https://kraviq.app/features/trade-tracking";

const CAPABILITIES = [
  "Three ways to log a trade: manual entry, CSV import, or automatic MT4/MT5 EA sync",
  "Every trade stores pair, direction, lot size, entry, exit, open and close time, and net P&L after swap and commission",
  "Automatic risk-to-reward calculation on every closed trade",
  "A discipline score per trade, based on whether it matches your stated plan",
  "Trade grading from A+ to F, so you can sort your history by quality, not just outcome",
  "A calendar view that shows daily P&L next to your trade count, so clustering is visible at a glance",
];

const STEPS = [
  {
    icon: Edit3,
    title: "Log the trade",
    body: "Add it by hand in under 30 seconds, drop in a CSV export from your broker, or let the Kraviq EA push it the moment it closes on your MT4/MT5 terminal.",
  },
  {
    icon: Upload,
    title: "Kraviq fills in the rest",
    body: "Risk-to-reward, net P&L after commission and swap, and session tagging are calculated automatically. You don't compute any of it by hand.",
  },
  {
    icon: Wifi,
    title: "It lands in your ledger",
    body: "Every closed trade also writes a transaction to your account ledger, so your trade history and your balance history always agree.",
  },
  {
    icon: BarChart3,
    title: "Patterns surface on their own",
    body: "Win rate by pair, by session, by day of week. Once you have enough closed trades, the same data also feeds your weekly Business Score.",
  },
];

const FAQS = [
  {
    question: "Do I have to enter every trade by hand?",
    answer:
      "No. You can type trades in manually, import a CSV export from your broker, or install the Kraviq Expert Advisor on MT4 or MT5 so closed trades sync automatically. Most traders use EA sync for their main account and manual entry for occasional backtested setups.",
  },
  {
    question: "What does Kraviq calculate automatically on each trade?",
    answer:
      "Net P&L after commission and swap, risk-to-reward ratio, trade duration, and a discipline score that flags whether the trade matches patterns like revenge trading or session violations. You enter the raw trade; Kraviq does the math.",
  },
  {
    question: "Can I track trades across more than one account?",
    answer:
      "Yes. Kraviq separates trades by account, so a prop firm challenge, your live account, and a backtesting sandbox each keep their own trade history and statistics, without mixing into one blended number.",
  },
  {
    question: "What is trade grading and how is it calculated?",
    answer:
      "Each closed trade gets a letter grade from A+ to F based on execution quality: whether it followed your plan, the risk-to-reward achieved, and discipline flags. It's separate from win or loss, since a well-executed losing trade can still grade higher than a sloppy win.",
  },
];

const RELATED = [
  {
    title: "Financial Ledger",
    description: "See how every trade flows into your account balance and true net P&L.",
    href: "/features/financial-ledger",
  },
  {
    title: "Business Score",
    description: "Your trade history feeds five pillars scored weekly, on a 100-point scale.",
    href: "/business-score",
  },
  {
    title: "EA Sync",
    description: "Skip manual entry. Sync every closed MT4/MT5 trade automatically.",
    href: "/ea-sync",
  },
];

const breadcrumbItems = [
  { label: "Home", href: "/" },
  { label: "Features", href: "/#features" },
  { label: "Trade Tracking" },
];

export const TradeTrackingPage = () => {
  const faqSchema = buildFaqSchema(FAQS);
  const breadcrumbSchema = buildBreadcrumbSchema(breadcrumbItems);
  const webPageSchema = buildWebPageSchema({
    name: PAGE_TITLE,
    description: PAGE_DESCRIPTION,
    url: PAGE_URL,
  });

  return (
    <PageLayout title="Trade Tracking">
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
            Trade Tracking
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: "easeOut", delay: 0.05 }}
            className="text-lg text-muted-foreground leading-relaxed mb-8"
          >
            Every trade you take, recorded with pair, direction, size, P&L, and a discipline score, whether you type it in, import it, or let your EA sync it.
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
              Trade tracking in Kraviq is the record of every position you've opened and closed, across every account you run. It's not a spreadsheet you maintain on the side. It's the source of truth that the rest of the platform reads from: your ledger, your Business Score, and your prop firm compliance checks all pull from the same trade data.
            </motion.p>
            <motion.p {...reveal(0.1)}>
              You can add a trade by hand, drop in a CSV export from your broker, or install the Kraviq Expert Advisor so closed MT4 or MT5 trades sync the moment they happen. Whichever way a trade gets in, it carries the same fields: pair, direction, lot size, entry and exit price, open and close time, and net profit or loss.
            </motion.p>
            <motion.p {...reveal(0.15)}>
              Some fields are locked once a trade closes. Pair, direction, lot size, entry price, exit price, and P&L can't be edited after the fact, because a trade record that can be quietly rewritten isn't a record you can trust.
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
            A spreadsheet tells you what happened. It doesn't tell you why you keep losing on Fridays, or that three of your last five losses came within ten minutes of the previous loss. That kind of pattern only shows up when every trade is structured the same way, every time, and checked against the same rules. Most traders who track manually stop within a few weeks because the friction outweighs the insight. Kraviq removes the friction by handling the structure for you and surfacing the patterns without being asked.
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
      <FeatureCTABanner heading="Start tracking trades that actually tell you something." />
    </PageLayout>
  );
};
