import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { ArrowRight, Percent, Ruler, Scale, TrendingDown, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageLayout } from "@/components/landing/PageLayout";
import { reveal } from "@/lib/animations";
import { useIsMounted } from "@/hooks/useIsMounted";
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

const PAGE_TITLE = "Position Size & Risk-to-Reward Calculator for Forex | Kraviq";
const PAGE_DESCRIPTION =
  "Calculate position size, risk percentage, and risk-to-reward before you place a trade. Kraviq's risk calculators work against your real account balance and current drawdown.";
const PAGE_URL = "https://kraviq.app/features/risk-calculators";

const CAPABILITIES = [
  "Position size calculated from your account balance, risk percentage, and stop-loss distance",
  "Risk-to-reward ratio computed from entry, stop, and target before you place the trade",
  "Calculations run against your actual account balance, not a number you have to look up and type in",
  "Prop account calculations factor in remaining drawdown room, not just account size",
  "Support for lot size, pip value, and risk percentage across the pairs you trade",
  "Every calculated trade can be logged directly, so the math and the record are never out of sync",
];

const STEPS = [
  {
    icon: Scale,
    title: "Enter your risk percentage",
    body: "Decide what fraction of your account you're willing to risk on this trade, typically 0.5% to 2%, and enter it once.",
  },
  {
    icon: Ruler,
    title: "Set your stop-loss distance",
    body: "Enter the distance in pips between your entry and your stop. Kraviq converts this into a dollar risk figure using your account's currency.",
  },
  {
    icon: Percent,
    title: "Get your position size instantly",
    body: "The calculator returns the exact lot size that risks your chosen percentage, no manual pip-value lookup required.",
  },
  {
    icon: TrendingDown,
    title: "Check risk-to-reward before you commit",
    body: "Add your target price and see the resulting R:R ratio immediately, so you know what you're risking relative to what you stand to gain.",
  },
];

const FAQS = [
  {
    question: "How does the position size calculator know my account balance?",
    answer:
      "It reads your account's current balance directly from Kraviq, so you're never calculating against a number you typed in from memory or an old broker statement.",
  },
  {
    question: "Does the calculator account for prop firm drawdown limits?",
    answer:
      "Yes, for prop accounts the calculator factors in your remaining drawdown room, not just total account size, so a position that would be fine on a normal account but risky against a tight challenge limit gets sized accordingly.",
  },
  {
    question: "Can I calculate risk-to-reward for a trade I haven't placed yet?",
    answer:
      "Yes. Enter your planned entry, stop, and target, and the calculator returns the R:R ratio before you risk anything. You can adjust the target and watch the ratio change in real time.",
  },
  {
    question: "What currency pairs and pip values does it support?",
    answer:
      "All standard forex pairs, with pip value calculated correctly for both standard pairs and JPY-quoted pairs, which use a different pip size than most other currencies.",
  },
];

const RELATED = [
  {
    title: "Trade Tracking",
    description: "Log the trade you just sized, with the same numbers carried through.",
    href: "/features/trade-tracking",
  },
  {
    title: "Backtesting",
    description: "Test the strategy this position size belongs to before risking live money.",
    href: "/features/backtesting",
  },
  {
    title: "Prop Firm Compliance",
    description: "See how drawdown limits factor into position sizing on a challenge account.",
    href: "/features/prop-firm-compliance",
  },
];

const breadcrumbItems = [
  { label: "Home", href: "/" },
  { label: "Features", href: "/#features" },
  { label: "Risk Calculators" },
];

export const RiskCalculatorsPage = () => {
  const isMounted = useIsMounted();
  const faqSchema = buildFaqSchema(FAQS);
  const breadcrumbSchema = buildBreadcrumbSchema(breadcrumbItems);
  const webPageSchema = buildWebPageSchema({
    name: PAGE_TITLE,
    description: PAGE_DESCRIPTION,
    url: PAGE_URL,
  });

  return (
    <PageLayout title="Risk Calculators">
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
            initial={isMounted ? { opacity: 0, y: 16 } : false}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="font-heading font-bold text-4xl md:text-5xl text-foreground leading-tight mb-5"
          >
            Risk Calculators
          </motion.h1>
          <motion.p
            initial={isMounted ? { opacity: 0, y: 12 } : false}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: "easeOut", delay: 0.05 }}
            className="text-lg text-muted-foreground leading-relaxed mb-8"
          >
            Position size and risk-to-reward, calculated against your real balance and drawdown, before you place the trade.
          </motion.p>
          <motion.div {...reveal(0.1, isMounted)}>
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
          <motion.h2 {...reveal(0, isMounted)} className="font-heading font-semibold text-2xl text-foreground mb-6">
            What it is
          </motion.h2>
          <div className="space-y-5 text-[17px] leading-[1.75] text-muted-foreground">
            <motion.p {...reveal(0.05, isMounted)}>
              The risk calculators turn account risk, stop-loss distance, and target price into position size and risk-to-reward, before you place a trade. Enter how much of your account you're willing to risk, where your stop sits, and where your target is. Kraviq returns the exact lot size and the resulting R:R ratio.
            </motion.p>
            <motion.p {...reveal(0.1, isMounted)}>
              The numbers come from your actual account balance and, on prop challenges, your remaining drawdown room, not a figure you copy in from a separate spreadsheet. That matters because a position size that's safe on a $50,000 normal account can breach a prop challenge with a tighter daily limit.
            </motion.p>
            <motion.p {...reveal(0.15, isMounted)}>
              Once you're satisfied with the size and the ratio, you can log the trade directly, carrying the same numbers into your trade history instead of re-entering them.
            </motion.p>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-16 border-t border-border">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.h2 {...reveal(0, isMounted)} className="font-heading font-semibold text-2xl text-foreground mb-10 text-center">
            How it works
          </motion.h2>
          <div className="grid sm:grid-cols-2 gap-5">
            {STEPS.map((step, i) => {
              const Icon = step.icon;
              return (
                <motion.div
                  key={step.title}
                  initial={isMounted ? { opacity: 0, y: 24 } : false}
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
          <motion.h2 {...reveal(0, isMounted)} className="font-heading font-semibold text-2xl text-foreground mb-6">
            Why it matters
          </motion.h2>
          <motion.p {...reveal(0.05, isMounted)} className="text-[17px] leading-[1.75] text-muted-foreground">
            Position sizing mistakes are rarely about strategy. They're arithmetic errors made under time pressure, right before a trade, when a trader rounds a lot size up because the exact calculation felt like too much friction in the moment. A 0.3% risk that quietly becomes 1.2% because of a rounding shortcut compounds over a hundred trades into a very different account than the one the trader thought they were running. A calculator that does the arithmetic exactly, every time, removes that entire category of mistake.
          </motion.p>
        </div>
      </section>

      {/* Key capabilities */}
      <section className="py-16 border-t border-border">
        <div className="max-w-[720px] mx-auto px-4 sm:px-6 lg:px-8">
          <motion.h2 {...reveal(0, isMounted)} className="font-heading font-semibold text-2xl text-foreground mb-6">
            Key capabilities
          </motion.h2>
          <ul className="space-y-4">
            {CAPABILITIES.map((item, i) => (
              <motion.li
                key={item}
                initial={isMounted ? { opacity: 0, x: -16 } : false}
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
      <FeatureCTABanner heading="Size the position correctly before you place it." />
    </PageLayout>
  );
};
