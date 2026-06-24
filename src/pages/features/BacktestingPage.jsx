import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { ArrowRight, FlaskConical, ShieldOff, GitMerge, Swords, Star } from "lucide-react";
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

const PAGE_TITLE = "Strategy Backtesting & War Room Sandbox | Kraviq";
const PAGE_DESCRIPTION =
  "Test aggressive or experimental forex strategies in Kraviq's War Account: a fully isolated sandbox with full margin and news trading allowed, excluded from your real metrics and Business Score.";
const PAGE_URL = "https://kraviq.app/features/backtesting";

const CAPABILITIES = [
  "A fully isolated account type, called the War Account, for testing strategies you wouldn't run on your main account",
  "Full margin and news trading allowed, with none of the restrictions a normal or prop account carries",
  "Complete exclusion from your aggregate metrics and Business Score, so a bad test never drags your real numbers down",
  "The same trade tracking, ledger, and EA sync available on a War Account as on any other account",
  "A graduation pipeline: once a strategy proves itself, deploy it to a normal or prop account in one step",
  "Independent analytics per War Account, so you can run several experiments side by side without them blending",
];

const STEPS = [
  {
    icon: Swords,
    title: "Open a War Account",
    body: "Fund it with a seed balance separate from your main capital, and set your own exit criteria for what counts as proof the strategy works.",
  },
  {
    icon: FlaskConical,
    title: "Trade it at full intensity",
    body: "Full margin, news trading, scalping: nothing is restricted, because the point is to see what the strategy actually does under real pressure.",
  },
  {
    icon: ShieldOff,
    title: "Your real metrics stay untouched",
    body: "War Account P&L, drawdown, and trade history are excluded from your Business Score and aggregate statistics by design, not by accident.",
  },
  {
    icon: GitMerge,
    title: "Graduate when it earns it",
    body: "When the strategy holds up against your own criteria, move it to a normal or prop account in one step. Deployment becomes a decision, not an impulse.",
  },
];

const FAQS = [
  {
    question: "What is a War Account and how is it different from a normal account?",
    answer:
      "A War Account is a fully isolated account type built for testing strategies you wouldn't run on your main capital. It allows full margin and news trading, both of which are typically restricted, and its trade history is excluded from your aggregate metrics and Business Score entirely.",
  },
  {
    question: "Will a losing strategy on a War Account hurt my Business Score?",
    answer:
      "No. War Account trades, P&L, and drawdown are excluded from your aggregate metrics and Business Score by design. You can run an aggressive experiment that fails completely without it affecting how your real trading is measured.",
  },
  {
    question: "How does the graduation pipeline work?",
    answer:
      "You set your own exit criteria when you open the War Account: a minimum number of trades, a win rate threshold, a drawdown ceiling, whatever proves the strategy to you. Once a strategy meets that bar, you move it into a normal or prop account in one step instead of trading it live by default.",
  },
  {
    question: "Can I run more than one War Account at a time?",
    answer:
      "Yes. Each War Account tracks its own balance, trades, and analytics independently, so you can test several strategies in parallel without their numbers mixing together.",
  },
];

const RELATED = [
  {
    title: "Strategy & Playbook",
    description: "Define the rules a War Account test is actually measuring against.",
    href: "/features/strategy",
  },
  {
    title: "Risk Calculators",
    description: "Size positions correctly even when you're trading at full margin.",
    href: "/features/risk-calculators",
  },
  {
    title: "Trade Tracking",
    description: "Every War Account trade gets the same tracking as your main account.",
    href: "/features/trade-tracking",
  },
];

const breadcrumbItems = [
  { label: "Home", href: "/" },
  { label: "Features", href: "/#features" },
  { label: "Backtesting" },
];

export const BacktestingPage = () => {
  const faqSchema = buildFaqSchema(FAQS);
  const breadcrumbSchema = buildBreadcrumbSchema(breadcrumbItems);
  const webPageSchema = buildWebPageSchema({
    name: PAGE_TITLE,
    description: PAGE_DESCRIPTION,
    url: PAGE_URL,
  });

  return (
    <PageLayout title="Backtesting">
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
          style={{ background: "radial-gradient(ellipse 70% 55% at 50% 0%, rgba(239,68,68,0.08), transparent)" }}
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
            Backtesting &amp; the War Room
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: "easeOut", delay: 0.05 }}
            className="text-lg text-muted-foreground leading-relaxed mb-8"
          >
            Test aggressive or unproven strategies in a fully isolated War Account, with full margin allowed and zero impact on your real metrics.
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
              The War Account is Kraviq's sandbox for strategy testing. It's a separate account type, funded with its own seed balance, where full margin and news trading are allowed without the restrictions a normal or prop account would carry. You trade it exactly the way you'd want to test a strategy at full intensity.
            </motion.p>
            <motion.p {...reveal(0.1)}>
              The part that makes it useful rather than just another account: War Account trades, P&L, and drawdown are excluded from your aggregate metrics and Business Score entirely. A strategy that fails badly in testing doesn't drag your real numbers down with it, because it never touches them in the first place.
            </motion.p>
            <motion.p {...reveal(0.15)}>
              When a strategy proves itself against criteria you set yourself, the graduation pipeline moves it into a normal or prop account in one step, so deploying a tested idea is a deliberate decision rather than something that happens by default.
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
                  <div className="w-10 h-10 rounded-xl bg-danger/10 border border-danger/20 flex items-center justify-center mb-4">
                    <Icon className="h-5 w-5 text-danger" aria-hidden="true" />
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
            Most traders test new ideas on their live account, which means every failed experiment contaminates the same statistics they use to judge their real edge. A losing stretch from a strategy that was never going to work anyway drags down win rate, P&L trend, and Business Score, and makes it harder to tell what's actually wrong. Separating the testing ground from the real account is the only way to know whether your core trading is sound while you still get to experiment.
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
                <Star className="h-4 w-4 text-danger mt-1.5 flex-shrink-0" aria-hidden="true" />
                <span>{item}</span>
              </motion.li>
            ))}
          </ul>
        </div>
      </section>

      <FeatureFAQ faqs={FAQS} eyebrowColor="text-danger" />
      <RelatedFeatures items={RELATED} />
      <FeatureCTABanner heading="Test it in the War Room before you trade it for real." />
    </PageLayout>
  );
};
