import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Wifi, Key, RefreshCw, Shield, CheckCircle, ArrowRight } from "lucide-react";
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
} from "@/components/landing/FeaturePageShared";

const PAGE_TITLE = "MT4/MT5 EA Auto-Sync for Trade Tracking | Kraviq";
const PAGE_DESCRIPTION =
  "Install the Kraviq Expert Advisor on MT4 or MT5 and every closed trade syncs automatically: pair, direction, lot size, P&L, swap, and commission, with no manual entry.";
const PAGE_URL = "https://kraviq.app/ea-sync";

const FAQS = [
  {
    question: "Is the EA API key shown more than once?",
    answer:
      "No. The key is shown exactly once, right after you generate it. Kraviq stores only a cryptographic hash, so if you lose the key, you generate a new one, which immediately revokes the old one.",
  },
  {
    question: "Does EA Sync work with both MT4 and MT5?",
    answer:
      "Yes. The same Expert Advisor installs on either platform. Attach it to any chart, enter your API key in the EA's input settings, and it starts syncing on the next trade close.",
  },
  {
    question: "What happens if my EA goes offline?",
    answer:
      "Kraviq marks the connection offline if no heartbeat arrives for five minutes. Past trades already synced stay intact, and syncing resumes automatically once the EA reconnects, no re-setup required.",
  },
  {
    question: "Does EA Sync replace manual trade entry entirely?",
    answer:
      "For the account it's running on, yes. You can still add trades manually if you want to log something the EA didn't catch, and you can choose to show EA trades only, manual trades only, or both.",
  },
];

const RELATED_FEATURES = [
  {
    title: "Trade Tracking",
    description: "See how EA-synced trades fit into your full trade history and grading.",
    href: "/features/trade-tracking",
  },
  {
    title: "Financial Ledger",
    description: "Synced trades create matching ledger transactions automatically.",
    href: "/features/financial-ledger",
  },
  {
    title: "Prop Firm Compliance",
    description: "EA Sync keeps a prop challenge's trade history current without manual work.",
    href: "/features/prop-firm-compliance",
  },
];

const breadcrumbItems = [
  { label: "Home", href: "/" },
  { label: "EA Sync" },
];

const STEPS = [
  {
    num: "01",
    icon: Key,
    title: "Generate your API key",
    desc: "In Kraviq, open your account settings and generate an EA API key. It is shown once, so copy it and keep it safe. We store only a secure hash.",
    mockup: (
      <div className="bg-card border border-border rounded-xl p-4 text-sm shadow-lg max-w-xs w-full">
        <p className="text-xs text-muted-foreground mb-3 font-medium">EA API Key</p>
        <div className="bg-muted rounded-lg px-3 py-2 font-mono text-xs text-foreground break-all mb-3">
          a3f8c21d…e90b4712
        </div>
        <div className="flex items-start gap-2 bg-warning/5 border border-warning/20 rounded-lg p-2">
          <span className="text-warning text-xs mt-0.5">⚠</span>
          <p className="text-[10px] text-warning">
            Copy this key now. It will never be shown again.
          </p>
        </div>
      </div>
    ),
  },
  {
    num: "02",
    icon: RefreshCw,
    title: "Install the EA on your chart",
    desc: "Attach the Kraviq Expert Advisor to any chart in MT4 or MT5. Enter your API key in the EA input settings. No coding required.",
    mockup: (
      <div className="bg-card border border-border rounded-xl p-4 text-sm shadow-lg max-w-xs w-full">
        <p className="text-xs text-muted-foreground mb-3 font-medium">Expert Advisor — Inputs</p>
        <div className="space-y-2">
          <div className="bg-muted rounded-lg px-3 py-2">
            <p className="text-[10px] text-muted-foreground mb-0.5">API Key</p>
            <p className="text-xs font-mono text-foreground">a3f8c21d…e90b4712</p>
          </div>
          <div className="bg-muted rounded-lg px-3 py-2">
            <p className="text-[10px] text-muted-foreground mb-0.5">Account ID</p>
            <p className="text-xs font-mono text-foreground">tc_acc_8f2a…</p>
          </div>
          <div className="bg-primary rounded-lg px-3 py-2 text-center">
            <p className="text-xs text-primary-foreground font-medium">Confirm ✓</p>
          </div>
        </div>
      </div>
    ),
  },
  {
    num: "03",
    icon: Wifi,
    title: "Trades sync automatically",
    desc: "That's it. Every trade that closes in MT4/MT5 is pushed to Kraviq instantly: pair, direction, lot size, P&L, open and close times, and balance snapshot.",
    mockup: (
      <div className="bg-card border border-border rounded-xl p-4 text-sm shadow-lg max-w-xs w-full">
        <div className="flex items-center justify-between mb-4">
          <p className="text-xs font-medium text-foreground">EA Sync</p>
          <div className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
            <span className="text-[10px] text-success font-medium">Online</span>
          </div>
        </div>
        <div className="space-y-2">
          {[
            { label: "Last synced", value: "2 min ago" },
            { label: "Today's syncs", value: "3 trades" },
            { label: "Total synced", value: "247 trades" },
            { label: "Broker", value: "IC Markets" },
          ].map((r) => (
            <div key={r.label} className="flex items-center justify-between bg-muted rounded-lg px-3 py-1.5">
              <span className="text-[10px] text-muted-foreground">{r.label}</span>
              <span className="text-[10px] font-mono text-foreground">{r.value}</span>
            </div>
          ))}
        </div>
      </div>
    ),
  },
];

const DATA_FIELDS = [
  "Currency pair (e.g. EURUSD, XAUUSD)",
  "Trade direction (Buy or Sell)",
  "Lot size",
  "Open and close price",
  "Open and close timestamp",
  "Gross P&L in account currency",
  "Commission and swap",
  "Account balance at close",
  "Broker name and server",
];

const SECURITY = [
  {
    icon: Key,
    title: "One-time key display",
    body: "Your API key is shown once at generation and never again. Store it safely. If you lose it, generating a new one instantly revokes the old.",
  },
  {
    icon: Shield,
    title: "Hash-only storage",
    body: "Kraviq stores only a cryptographic hash of your API key. Even if our database were compromised, your key could not be reconstructed.",
  },
  {
    icon: CheckCircle,
    title: "Per-account scoping",
    body: "Each API key is scoped to a single Kraviq account. An EA key for Account A cannot write trades to Account B.",
  },
];

export const EASyncPage = () => {
  const isMounted = useIsMounted();
  const faqSchema = buildFaqSchema(FAQS);
  const breadcrumbSchema = buildBreadcrumbSchema(breadcrumbItems);
  const webPageSchema = buildWebPageSchema({
    name: PAGE_TITLE,
    description: PAGE_DESCRIPTION,
    url: PAGE_URL,
  });

  return (
  <PageLayout title="EA Sync">
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

    {/* ── Hero ──────────────────────────────────────────────────────────── */}
    <section className="relative pt-32 pb-20 overflow-hidden">
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 70% 55% at 50% 0%, rgba(23,61,237,0.1), transparent)",
        }}
        aria-hidden="true"
      />
      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <FeatureBreadcrumb items={breadcrumbItems} />
        <motion.div
          initial={isMounted ? { opacity: 0, y: 12 } : false}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="inline-flex items-center gap-1.5 bg-primary/10 text-primary border border-primary/20 text-xs font-medium rounded-full px-3 py-1 mb-6"
        >
          <div className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" aria-hidden="true" />
          EA Auto-Sync
        </motion.div>

        <motion.h1
          initial={isMounted ? { opacity: 0, y: 16 } : false}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut", delay: 0.05 }}
          className="font-heading font-bold text-5xl md:text-6xl text-foreground leading-tight mb-6"
        >
          Set it once.
          <br />
          Never miss a trade.
        </motion.h1>

        <motion.p
          initial={isMounted ? { opacity: 0, y: 12 } : false}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: "easeOut", delay: 0.1 }}
          className="text-lg text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed"
        >
          Install the Kraviq Expert Advisor on any MT4 or MT5 chart. Every
          trade that closes syncs to your account instantly, automatically,
          with zero manual input.
        </motion.p>

        <motion.div
          initial={isMounted ? { opacity: 0, y: 12 } : false}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: "easeOut", delay: 0.15 }}
          className="flex flex-col sm:flex-row gap-3 justify-center"
        >
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Button size="lg" asChild className="gap-2">
              <Link to="/register">
                Get Started, It's Free
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </motion.div>
          <Button variant="outline" size="lg" asChild>
            <Link to="/#pricing">View plans</Link>
          </Button>
        </motion.div>

        {/* Platform badges */}
        <motion.div
          initial={isMounted ? { opacity: 0 } : false}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="flex items-center justify-center gap-4 mt-8"
        >
          {["MetaTrader 4", "MetaTrader 5"].map((p) => (
            <span
              key={p}
              className="text-xs font-medium bg-card border border-border rounded-full px-3 py-1.5 text-muted-foreground"
            >
              {p}
            </span>
          ))}
        </motion.div>
      </div>
    </section>

    {/* ── 3-step setup ──────────────────────────────────────────────────── */}
    <section className="py-20 border-t border-border">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <motion.p {...reveal(0, isMounted)} className="text-xs uppercase tracking-widest text-primary font-medium mb-4">
            Setup in 3 steps
          </motion.p>
          <motion.h2 {...reveal(0.05, isMounted)} className="font-heading font-bold text-3xl md:text-4xl text-foreground">
            Up and running in under 5 minutes.
          </motion.h2>
        </div>

        <div className="space-y-16">
          {STEPS.map((step, i) => {
            const Icon = step.icon;
            const isEven = i % 2 === 1;
            return (
              <div
                key={step.num}
                className={`grid md:grid-cols-2 gap-12 items-center ${isEven ? "md:[&>*:first-child]:order-2 md:[&>*:last-child]:order-1" : ""}`}
              >
                <motion.div
                  initial={isMounted ? { opacity: 0, x: isEven ? 32 : -32 } : false}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.55, ease: "easeOut" }}
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                      <Icon className="h-5 w-5 text-primary" aria-hidden="true" />
                    </div>
                    <span className="text-xs font-mono text-muted-foreground">{step.num}</span>
                  </div>
                  <h3 className="font-heading font-bold text-2xl text-foreground mb-3">{step.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{step.desc}</p>
                </motion.div>
                <motion.div
                  initial={isMounted ? { opacity: 0, x: isEven ? -32 : 32 } : false}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.55, ease: "easeOut", delay: 0.1 }}
                  className="flex justify-center"
                >
                  <motion.div
                    animate={{ y: [0, -6, 0] }}
                    transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut", delay: i * 0.5 }}
                  >
                    {step.mockup}
                  </motion.div>
                </motion.div>
              </div>
            );
          })}
        </div>
      </div>
    </section>

    {/* ── Data synced ───────────────────────────────────────────────────── */}
    <section className="py-20 border-t border-border">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={isMounted ? { opacity: 0, x: -32 } : false}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.55, ease: "easeOut" }}
          >
            <p className="text-xs uppercase tracking-widest text-primary font-medium mb-4">
              What syncs
            </p>
            <h2 className="font-heading font-bold text-3xl text-foreground mb-5">
              Every detail. Every time.
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-6">
              When a trade closes in your MetaTrader terminal, the EA
              immediately pushes the full trade record to Kraviq. Nothing is
              missed, nothing needs to be entered manually.
            </p>
            <ul className="space-y-2">
              {DATA_FIELDS.map((f) => (
                <li key={f} className="flex items-center gap-2.5 text-sm text-muted-foreground">
                  <CheckCircle className="h-3.5 w-3.5 text-success flex-shrink-0" aria-hidden="true" />
                  {f}
                </li>
              ))}
            </ul>
          </motion.div>

          <motion.div
            initial={isMounted ? { opacity: 0, x: 32 } : false}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.55, ease: "easeOut", delay: 0.1 }}
            className="bg-card border border-border rounded-2xl divide-y divide-border overflow-hidden shadow-lg"
            aria-label="Sample synced trade"
          >
            <div className="px-5 py-4 bg-muted/30">
              <p className="text-xs font-semibold text-foreground uppercase tracking-wide">Trade synced</p>
            </div>
            {[
              { k: "Pair",      v: "EURUSD" },
              { k: "Direction", v: "BUY" },
              { k: "Lots",      v: "0.50" },
              { k: "Open",      v: "1.08210" },
              { k: "Close",     v: "1.08940" },
              { k: "Gross P&L", v: "+$365.00" },
              { k: "Commission", v: "−$7.00" },
              { k: "Swap",      v: "−$1.20" },
              { k: "Net P&L",   v: "+$356.80" },
            ].map((r) => (
              <div key={r.k} className="flex items-center justify-between px-5 py-3">
                <span className="text-xs text-muted-foreground">{r.k}</span>
                <span className={`text-xs font-mono font-medium ${
                  r.v.startsWith("+") ? "text-success"
                  : r.v.startsWith("−") ? "text-danger"
                  : r.k === "Direction" ? "text-primary"
                  : "text-foreground"
                }`}>{r.v}</span>
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>

    {/* ── Security ──────────────────────────────────────────────────────── */}
    <section className="py-20 border-t border-border">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <motion.p {...reveal(0, isMounted)} className="text-xs uppercase tracking-widest text-primary font-medium mb-4">
            Security
          </motion.p>
          <motion.h2 {...reveal(0.05, isMounted)} className="font-heading font-bold text-3xl md:text-4xl text-foreground">
            Your API key. Your data.
          </motion.h2>
        </div>
        <div className="grid md:grid-cols-3 gap-5">
          {SECURITY.map((s, i) => {
            const Icon = s.icon;
            return (
              <motion.div
                key={s.title}
                initial={isMounted ? { opacity: 0, y: 24 } : false}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.45, ease: "easeOut", delay: i * 0.08 }}
                className="bg-card border border-border rounded-2xl p-6"
              >
                <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-4">
                  <Icon className="h-5 w-5 text-primary" aria-hidden="true" />
                </div>
                <h3 className="font-heading font-semibold text-base text-foreground mb-2">{s.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{s.body}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>

    <FeatureFAQ faqs={FAQS} />
    <RelatedFeatures items={RELATED_FEATURES} />

    {/* ── CTA ───────────────────────────────────────────────────────────── */}
    <section className="py-20 border-t border-border">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.h2 {...reveal(0, isMounted)} className="font-heading font-bold text-3xl md:text-4xl text-foreground mb-4">
          Stop manually entering trades.
        </motion.h2>
        <motion.p {...reveal(0.05, isMounted)} className="text-muted-foreground mb-8">
          EA Sync is available on Starter, Pro, and Elite plans. Free to try.
        </motion.p>
        <motion.div {...reveal(0.1, isMounted)}>
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="inline-block">
            <Button size="lg" asChild className="gap-2">
              <Link to="/register">
                Set Up EA Sync
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
