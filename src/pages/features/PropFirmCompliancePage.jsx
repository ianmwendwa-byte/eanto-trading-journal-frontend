import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { ArrowRight, ShieldAlert, Gauge, Bell, GitBranch, Star } from "lucide-react";
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

const PAGE_TITLE = "Prop Firm Rule Tracking & Drawdown Alerts | Kraviq";
const PAGE_DESCRIPTION =
  "Kraviq tracks your prop firm challenge rules automatically: drawdown limits, trading days, lot size, and session restrictions, with color-coded warnings before you breach.";
const PAGE_URL = "https://kraviq.app/features/prop-firm-compliance";

const CAPABILITIES = [
  "Drawdown tracking against your firm's exact maximum, with warnings at 70%, 85%, and 95% of the limit",
  "Status flow that follows the real challenge lifecycle: evaluation, active, funded, breached, or archived",
  "Trading day counts checked against minimum and maximum requirements set by your firm",
  "Lot size and session restriction checks applied automatically to every trade you log",
  "Rule mode locked to enforced on every prop account, since challenge rules aren't optional",
  "Payout and challenge fee tracking kept separate from deposit and withdrawal transactions",
];

const STEPS = [
  {
    icon: GitBranch,
    title: "Set up the account once",
    body: "Enter your firm's rules when you create the prop account: max drawdown, daily drawdown, minimum trading days, and any restrictions on lot size or session.",
  },
  {
    icon: Gauge,
    title: "Every trade checks against the rules",
    body: "As trades log, Kraviq calculates your current drawdown against the firm's limit in real time, not at the end of the day.",
  },
  {
    icon: Bell,
    title: "Warnings arrive before the breach",
    body: "Color-coded alerts fire at 70% of your max drawdown, then 85%, then 95%. You see the risk building, not just the result.",
  },
  {
    icon: ShieldAlert,
    title: "Status updates with the challenge",
    body: "The account moves through evaluation, active, and funded automatically as milestones are hit, or to breached if a rule is broken.",
  },
];

const FAQS = [
  {
    question: "Which prop firm rules does Kraviq actually track?",
    answer:
      "Maximum drawdown, daily drawdown, minimum and maximum trading days, lot size limits, and session restrictions, set up once when you create the account. Kraviq checks every trade against these automatically rather than requiring you to calculate compliance by hand.",
  },
  {
    question: "What happens when I get close to a drawdown limit?",
    answer:
      "You get a color-coded warning: yellow past 70% of your maximum drawdown, orange past 85%, and red past 95%. The goal is to give you room to stop before a breach, not just confirm one after it happens.",
  },
  {
    question: "Can I change a prop account's rule mode to be less strict?",
    answer:
      "No. Prop accounts are always set to enforced rule mode, because a challenge with rules you can quietly loosen isn't tracking real compliance. If your firm's actual rules change, you update the account's rule values, not the enforcement mode.",
  },
  {
    question: "Does Kraviq support multiple prop firms and challenge phases?",
    answer:
      "Yes. Each prop account tracks its own rule set and status independently, so a challenge with one firm and a funded account with another never share numbers or rules.",
  },
];

const RELATED = [
  {
    title: "Financial Ledger",
    description: "See how challenge fees and payouts are tracked separately from trading P&L.",
    href: "/features/financial-ledger",
  },
  {
    title: "Risk Calculators",
    description: "Size every position to stay inside your firm's drawdown limit before you click buy.",
    href: "/features/risk-calculators",
  },
  {
    title: "Trade Tracking",
    description: "Every trade you log feeds directly into your compliance checks.",
    href: "/features/trade-tracking",
  },
];

const breadcrumbItems = [
  { label: "Home", href: "/" },
  { label: "Features", href: "/#features" },
  { label: "Prop Firm Compliance" },
];

export const PropFirmCompliancePage = () => {
  const isMounted = useIsMounted();
  const faqSchema = buildFaqSchema(FAQS);
  const breadcrumbSchema = buildBreadcrumbSchema(breadcrumbItems);
  const webPageSchema = buildWebPageSchema({
    name: PAGE_TITLE,
    description: PAGE_DESCRIPTION,
    url: PAGE_URL,
  });

  return (
    <PageLayout title="Prop Firm Compliance">
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
            initial={isMounted ? { opacity: 0, y: 16 } : false}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="font-heading font-bold text-4xl md:text-5xl text-foreground leading-tight mb-5"
          >
            Prop Firm Compliance
          </motion.h1>
          <motion.p
            initial={isMounted ? { opacity: 0, y: 12 } : false}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: "easeOut", delay: 0.05 }}
            className="text-lg text-muted-foreground leading-relaxed mb-8"
          >
            Drawdown limits, trading days, lot size, and session rules, checked against every trade automatically, with warnings before you breach.
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
              Prop firm compliance tracking applies your challenge's actual rules to every trade you log, in the background, without you doing the math. Set the rules once when you create the prop account: maximum drawdown, daily drawdown, trading day requirements, lot size caps, session restrictions. Kraviq checks every trade against them from that point on.
            </motion.p>
            <motion.p {...reveal(0.1, isMounted)}>
              Prop accounts in Kraviq always run in enforced rule mode and skip the broker field entirely, since you're trading the firm's capital under their terms, not your own account at your own broker. The account status moves through the real challenge lifecycle on its own: evaluation, then active, then funded, with breached and paused as the branches that happen when something goes wrong.
            </motion.p>
            <motion.p {...reveal(0.15, isMounted)}>
              War accounts, used for testing aggressive strategies, are deliberately excluded from this and from every other aggregate metric, so they can't quietly distort your real compliance picture.
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
          <motion.h2 {...reveal(0, isMounted)} className="font-heading font-semibold text-2xl text-foreground mb-6">
            Why it matters
          </motion.h2>
          <motion.p {...reveal(0.05, isMounted)} className="text-[17px] leading-[1.75] text-muted-foreground">
            Most prop challenges fail on a drawdown breach the trader didn't see coming until it was already over the line. Mental math during a live trade is unreliable, especially after a losing stretch, which is exactly when the limit matters most. A system that calculates your current drawdown against the firm's actual number after every trade, and warns you in stages before the limit, turns a guess into a fact you can act on.
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
                <Star className="h-4 w-4 text-danger mt-1.5 flex-shrink-0" aria-hidden="true" />
                <span>{item}</span>
              </motion.li>
            ))}
          </ul>
        </div>
      </section>

      <FeatureFAQ faqs={FAQS} eyebrowColor="text-danger" />
      <RelatedFeatures items={RELATED} />
      <FeatureCTABanner heading="Know your drawdown before it knows you." />
    </PageLayout>
  );
};
