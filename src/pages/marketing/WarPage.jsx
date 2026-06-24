import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Swords, Shield, TrendingUp, Zap, ArrowRight, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageLayout } from "@/components/landing/PageLayout";
import { useIsMounted } from "@/hooks/useIsMounted";

const reveal = (delay = 0, mounted = true) => ({
  initial: mounted ? { opacity: 0, y: 24 } : false,
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.5, ease: "easeOut", delay },
});

const FEATURES = [
  {
    icon: Swords,
    title: "Full margin allowed",
    body: "No position-size restrictions. Test high-leverage, aggressive strategies exactly as you'd run them in the wild.",
  },
  {
    icon: Zap,
    title: "News trading enabled",
    body: "Trade through NFP, CPI, FOMC — all the high-impact events that normal accounts restrict. See what your strategy actually does under pressure.",
  },
  {
    icon: Shield,
    title: "Complete data isolation",
    body: "War Account trades, P&L, and drawdowns are fully excluded from your aggregate metrics and Business Score. Your real numbers stay clean.",
  },
  {
    icon: TrendingUp,
    title: "Graduation pipeline",
    body: "When a strategy proves itself — hit your own criteria — graduate it to a Normal or Prop account in one click. Disciplined deployment, not impulse.",
  },
];

const COMPARISON = [
  { feature: "Metric bleed to main account",  war: false, normal: true  },
  { feature: "Included in Business Score",     war: false, normal: true  },
  { feature: "Full margin trading",            war: true,  normal: false },
  { feature: "News trading allowed",           war: true,  normal: false },
  { feature: "Scalping allowed",               war: true,  normal: false },
  { feature: "Graduation pipeline",            war: true,  normal: false },
  { feature: "EA auto-sync support",           war: true,  normal: true  },
  { feature: "CSV import support",             war: true,  normal: true  },
];

const PIPELINE_STEPS = [
  {
    step: "01",
    title: "Create",
    desc: "Open a War Account with a seed balance. Set your own exit criteria.",
    color: "border-danger/40 bg-danger/5",
    dot: "bg-danger",
  },
  {
    step: "02",
    title: "Test",
    desc: "Run your strategy aggressively. Every trade is logged and analysed in isolation.",
    color: "border-warning/40 bg-warning/5",
    dot: "bg-warning",
  },
  {
    step: "03",
    title: "Review",
    desc: "Check the War Account analytics. Does it hold up? What's the drawdown profile?",
    color: "border-primary/40 bg-primary/5",
    dot: "bg-primary",
  },
  {
    step: "04",
    title: "Graduate",
    desc: "Strategy earns its place. Deploy it to a Normal or Prop account with one click.",
    color: "border-success/40 bg-success/5",
    dot: "bg-success",
  },
];

export const WarPage = () => {
  const isMounted = useIsMounted();
  return (
  <PageLayout title="War Account">

    {/* ── Hero ──────────────────────────────────────────────────────────── */}
    <section className="relative pt-32 pb-20 overflow-hidden">
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 70% 55% at 50% 0%, rgba(239,68,68,0.08), transparent)",
        }}
        aria-hidden="true"
      />
      <div className="absolute left-0 top-0 bottom-0 w-1 bg-danger/50" aria-hidden="true" />

      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.div
          initial={isMounted ? { opacity: 0, y: 12 } : false}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="inline-flex items-center gap-2 bg-danger/10 text-danger border border-danger/20 text-xs font-medium rounded-full px-3 py-1 mb-6"
        >
          <Swords className="h-3.5 w-3.5" aria-hidden="true" />
          War Account
        </motion.div>

        <motion.h1
          initial={isMounted ? { opacity: 0, y: 16 } : false}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut", delay: 0.05 }}
          className="font-heading font-bold text-5xl md:text-6xl text-foreground leading-tight mb-6"
        >
          Test everything.
          <br />
          Risk nothing that matters.
        </motion.h1>

        <motion.p
          initial={isMounted ? { opacity: 0, y: 12 } : false}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: "easeOut", delay: 0.1 }}
          className="text-lg text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed"
        >
          The War Account is a fully isolated sandbox for your most aggressive
          and experimental strategies. Full margin, news trading, scalping —
          all allowed. Your real metrics? Completely untouched.
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
                Open a War Account
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </motion.div>
          <Button variant="outline" size="lg" asChild>
            <Link to="/#features">See all features</Link>
          </Button>
        </motion.div>
      </div>
    </section>

    {/* ── What it is ────────────────────────────────────────────────────── */}
    <section className="py-20 border-t border-border">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={isMounted ? { opacity: 0, x: -32 } : false}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.55, ease: "easeOut" }}
          >
            <p className="text-xs uppercase tracking-widest text-danger font-medium mb-4">
              The concept
            </p>
            <h2 className="font-heading font-bold text-3xl md:text-4xl text-foreground mb-5">
              Where strategies are born before they earn their place.
            </h2>
            <div className="space-y-4 text-muted-foreground leading-relaxed text-sm">
              <p>
                Most traders test new strategies by running them live — on real
                capital, contaminating their journal with experimental noise.
                When the strategy fails, it drags their score, their metrics,
                and their confidence down with it.
              </p>
              <p>
                The War Account flips this. You fund a sandbox with as little or
                as much as you want, run the strategy at full intensity, and
                review the results in complete isolation. Your main account
                performance, your Business Score, your aggregate P&L — none of
                it is touched.
              </p>
              <p>
                When the strategy proves itself, the Graduation Pipeline lets you
                deploy it into production with discipline — not impulse.
              </p>
            </div>
          </motion.div>

          {/* Mock War Account card */}
          <motion.div
            initial={isMounted ? { opacity: 0, x: 32 } : false}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.55, ease: "easeOut", delay: 0.1 }}
            className="flex justify-center"
          >
            <motion.div
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="bg-card border border-danger/30 rounded-2xl p-6 w-full max-w-xs shadow-xl"
            >
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-xs text-muted-foreground mb-0.5">Strategy Lab</p>
                  <p className="font-heading font-semibold text-foreground">Scalper EA v3</p>
                </div>
                <span className="text-xs font-bold bg-danger/10 text-danger border border-danger/30 rounded-full px-3 py-1">
                  WAR
                </span>
              </div>
              <p className="text-3xl font-mono font-bold text-foreground mb-1">$3,840.00</p>
              <p className="text-sm text-danger font-mono mb-5">−$160 (−4.0%) from $4,000 seed</p>
              <div className="space-y-2 mb-5">
                {[
                  { label: "Bleed to main account", value: "None", ok: true },
                  { label: "Business Score impact", value: "None", ok: true },
                  { label: "Full margin", value: "Active", ok: true },
                ].map((r) => (
                  <div key={r.label} className="flex items-center justify-between bg-muted rounded-lg px-3 py-2">
                    <span className="text-xs text-muted-foreground">{r.label}</span>
                    <span className={`text-xs font-medium ${r.ok ? "text-success" : "text-danger"}`}>{r.value}</span>
                  </div>
                ))}
              </div>
              <div className="bg-danger/5 border border-danger/20 rounded-xl p-3">
                <p className="text-[10px] text-muted-foreground uppercase tracking-wide mb-1">Graduation Pipeline</p>
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-warning" />
                  <span className="text-xs font-medium text-foreground">Testing — 41 trades logged</span>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>

    {/* ── Features ──────────────────────────────────────────────────────── */}
    <section className="py-20 border-t border-border">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <motion.p {...reveal(0, isMounted)} className="text-xs uppercase tracking-widest text-danger font-medium mb-4">
            What's included
          </motion.p>
          <motion.h2 {...reveal(0.05, isMounted)} className="font-heading font-bold text-3xl md:text-4xl text-foreground">
            Everything a strategy test needs.
          </motion.h2>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {FEATURES.map((f, i) => {
            const Icon = f.icon;
            return (
              <motion.div
                key={f.title}
                initial={isMounted ? { opacity: 0, y: 24 } : false}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.45, ease: "easeOut", delay: i * 0.08 }}
                className="bg-card border border-border rounded-2xl p-6 hover:border-danger/30 transition-colors"
              >
                <div className="w-10 h-10 rounded-xl bg-danger/10 border border-danger/20 flex items-center justify-center mb-4">
                  <Icon className="h-5 w-5 text-danger" aria-hidden="true" />
                </div>
                <h3 className="font-heading font-semibold text-base text-foreground mb-2">{f.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{f.body}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>

    {/* ── Graduation Pipeline ───────────────────────────────────────────── */}
    <section className="py-20 border-t border-border">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <motion.p {...reveal(0, isMounted)} className="text-xs uppercase tracking-widest text-primary font-medium mb-4">
            The graduation pipeline
          </motion.p>
          <motion.h2 {...reveal(0.05, isMounted)} className="font-heading font-bold text-3xl md:text-4xl text-foreground mb-4">
            Discipline over impulse.
          </motion.h2>
          <motion.p {...reveal(0.1, isMounted)} className="text-muted-foreground max-w-lg mx-auto">
            Every strategy in the War Account follows the same four-stage
            process. No shortcuts.
          </motion.p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {PIPELINE_STEPS.map((s, i) => (
            <motion.div
              key={s.step}
              initial={isMounted ? { opacity: 0, y: 24 } : false}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.45, ease: "easeOut", delay: i * 0.1 }}
              className={`rounded-2xl border p-6 ${s.color}`}
            >
              <div className="flex items-center gap-2 mb-4">
                <div className={`w-2 h-2 rounded-full ${s.dot}`} aria-hidden="true" />
                <span className="text-xs font-mono text-muted-foreground">{s.step}</span>
              </div>
              <h3 className="font-heading font-bold text-lg text-foreground mb-2">{s.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{s.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>

    {/* ── Comparison ────────────────────────────────────────────────────── */}
    <section className="py-20 border-t border-border">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <motion.h2 {...reveal(0, isMounted)} className="font-heading font-bold text-3xl text-foreground">
            War Account vs Normal Account
          </motion.h2>
        </div>
        <motion.div
          initial={isMounted ? { opacity: 0, y: 16 } : false}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="overflow-x-auto rounded-2xl border border-border"
        >
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr>
                <th className="text-left px-5 py-4 text-xs font-semibold text-foreground uppercase tracking-wide">Feature</th>
                <th className="text-center px-5 py-4 text-xs font-semibold text-danger uppercase tracking-wide">War Account</th>
                <th className="text-center px-5 py-4 text-xs font-semibold text-success uppercase tracking-wide">Normal Account</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {COMPARISON.map((row) => (
                <tr key={row.feature} className="hover:bg-muted/30 transition-colors">
                  <td className="px-5 py-3.5 text-muted-foreground">{row.feature}</td>
                  <td className="px-5 py-3.5 text-center">
                    {row.war
                      ? <Check className="h-4 w-4 text-success mx-auto" aria-label="Yes" />
                      : <X className="h-4 w-4 text-danger mx-auto" aria-label="No" />}
                  </td>
                  <td className="px-5 py-3.5 text-center">
                    {row.normal
                      ? <Check className="h-4 w-4 text-success mx-auto" aria-label="Yes" />
                      : <X className="h-4 w-4 text-danger mx-auto" aria-label="No" />}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </motion.div>
      </div>
    </section>

    {/* ── CTA ───────────────────────────────────────────────────────────── */}
    <section className="py-20 border-t border-border">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.h2 {...reveal(0, isMounted)} className="font-heading font-bold text-3xl md:text-4xl text-foreground mb-4">
          Start testing smarter.
        </motion.h2>
        <motion.p {...reveal(0.05, isMounted)} className="text-muted-foreground mb-8">
          War Accounts are available on all Kraviq plans. Free to start.
        </motion.p>
        <motion.div {...reveal(0.1, isMounted)}>
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="inline-block">
            <Button size="lg" asChild className="gap-2">
              <Link to="/register">
                Open a War Account
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
