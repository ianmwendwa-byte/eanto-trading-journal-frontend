import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { ArrowRight, Receipt, Calculator, LineChart, Layers, Star } from "lucide-react";
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

const PAGE_TITLE = "Financial Ledger for Trading Accounts | True Net P&L | Kraviq";
const PAGE_DESCRIPTION =
  "Kraviq's financial ledger tracks every deposit, withdrawal, trade, swap, and commission per account, so you see true net profit and loss instead of the gross number your broker shows you.";
const PAGE_URL = "https://kraviq.app/features/financial-ledger";

const CAPABILITIES = [
  "Every deposit, withdrawal, trade profit, trade loss, swap, and commission recorded as a discrete transaction",
  "True net P&L after all costs, not the gross figure most brokers display",
  "A running balance history chart built from the transaction ledger, not a separate calculation",
  "Per-account ledgers, so a prop challenge, a live account, and a backtesting sandbox never mix numbers",
  "Automatic transaction creation when a trade closes, so your ledger and your trade history can't drift apart",
  "A monthly summary view that breaks down where money actually came from and went",
];

const STEPS = [
  {
    icon: Receipt,
    title: "Every money movement is logged",
    body: "Deposits, withdrawals, trade profit, trade loss, swap, and commission each create a transaction record the moment they happen.",
  },
  {
    icon: Calculator,
    title: "Costs are subtracted, not ignored",
    body: "Commission and swap reduce your net P&L automatically. The number you see is what actually landed in your account, not the headline figure before fees.",
  },
  {
    icon: Layers,
    title: "Balance history rebuilds itself",
    body: "Your balance chart isn't a manual entry; it's the running total of every transaction in the ledger, so it always matches reality.",
  },
  {
    icon: LineChart,
    title: "You see the trend, not just the total",
    body: "Monthly summaries show deposits versus withdrawals versus trading P&L, so you can tell whether your account grew from trading or from funding it.",
  },
];

const FAQS = [
  {
    question: "What's the difference between gross P&L and net P&L?",
    answer:
      "Gross P&L is the raw profit or loss on a trade before costs. Net P&L subtracts commission and swap, which is what actually changes your account balance. Most brokers show you gross by default. Kraviq's ledger always shows net, because that's the number that matters for judging real performance.",
  },
  {
    question: "Does the ledger update automatically when I close a trade?",
    answer:
      "Yes. Closing a trade, whether entered manually, imported by CSV, or synced through the EA, creates a matching transaction in the ledger automatically. You never have to log the same trade twice.",
  },
  {
    question: "Can I see deposits and withdrawals separately from trading performance?",
    answer:
      "Yes. The transaction summary breaks out deposits, withdrawals, trade profit, trade loss, swap, and commission as separate categories, so you can tell whether a balance increase came from funding the account or from actually trading well.",
  },
  {
    question: "How does the ledger work for prop firm accounts?",
    answer:
      "Prop accounts don't have deposit or withdrawal transactions, since you're trading the firm's capital. Instead, the ledger tracks challenge fees, payouts, and trade P&L, which keeps the numbers honest to how prop accounts actually work.",
  },
];

const RELATED = [
  {
    title: "Trade Tracking",
    description: "Every trade that closes writes directly into your ledger automatically.",
    href: "/features/trade-tracking",
  },
  {
    title: "Risk Calculators",
    description: "Size positions correctly before the trade ever reaches your ledger.",
    href: "/features/risk-calculators",
  },
  {
    title: "Prop Firm Compliance",
    description: "See how challenge fees and payouts are tracked differently for prop accounts.",
    href: "/features/prop-firm-compliance",
  },
];

const breadcrumbItems = [
  { label: "Home", href: "/" },
  { label: "Features", href: "/#features" },
  { label: "Financial Ledger" },
];

export const FinancialLedgerPage = () => {
  const faqSchema = buildFaqSchema(FAQS);
  const breadcrumbSchema = buildBreadcrumbSchema(breadcrumbItems);
  const webPageSchema = buildWebPageSchema({
    name: PAGE_TITLE,
    description: PAGE_DESCRIPTION,
    url: PAGE_URL,
  });

  return (
    <PageLayout title="Financial Ledger">
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
            Financial Ledger
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: "easeOut", delay: 0.05 }}
            className="text-lg text-muted-foreground leading-relaxed mb-8"
          >
            Every deposit, withdrawal, trade, swap, and commission, recorded as a transaction, so your true net P&L is never a guess.
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
              The financial ledger is the accounting layer underneath every Kraviq account. It records every transaction that changes your balance: deposits, withdrawals, trade profit, trade loss, swap, and commission. Each one is its own entry, not a number folded into a bigger total.
            </motion.p>
            <motion.p {...reveal(0.1)}>
              Because every transaction is recorded individually, Kraviq can show you net P&L after costs instead of the gross figure your broker's terminal usually leads with. The gap between those two numbers is often the difference between a trader who thinks they're profitable and one who actually is.
            </motion.p>
            <motion.p {...reveal(0.15)}>
              Prop accounts use the same ledger structure but a different set of transaction types: challenge fees and payouts instead of deposits and withdrawals, since you're trading the firm's capital, not your own.
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
            Commission and swap quietly erode returns that look fine on paper. A trader who wins 60% of trades at small size can still lose money once costs are subtracted, and never notice because the broker statement shows gross numbers by default. A ledger that tracks every transaction, not just trade outcomes, is the only way to know if a strategy is actually profitable after the cost of running it.
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
      <FeatureCTABanner heading="See your true net P&L, not the gross number." />
    </PageLayout>
  );
};
