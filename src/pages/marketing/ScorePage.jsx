import { useRef, useEffect, useState } from "react";
import { motion, useInView } from "framer-motion";
import { Link } from "react-router-dom";
import { Star, TrendingUp, Shield, BarChart3, Target, Repeat, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageLayout } from "@/components/landing/PageLayout";

const reveal = (delay = 0) => ({
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.5, ease: "easeOut", delay },
});

// ── Animated score dial ───────────────────────────────────────────────────────

const ScoreDial = ({ score = 74 }) => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });
  const [displayed, setDisplayed] = useState(0);

  const size = 220;
  const radius = size / 2 - 20;
  const circumference = 2 * Math.PI * radius;
  const strokeOffset = circumference - (score / 100) * circumference;

  useEffect(() => {
    if (!inView) return;
    let start = null;
    const duration = 1200;
    const tick = (ts) => {
      if (!start) start = ts;
      const p = Math.min((ts - start) / duration, 1);
      setDisplayed(Math.round(score * p));
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [inView, score]);

  return (
    <div ref={ref} className="relative flex-shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }} aria-hidden="true">
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none"
          style={{ stroke: "var(--border)" }} strokeWidth={12} />
        <motion.circle cx={size / 2} cy={size / 2} r={radius} fill="none"
          stroke="#22c55e" strokeWidth={12} strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={inView ? { strokeDashoffset: strokeOffset } : {}}
          transition={{ duration: 1.2, ease: "easeOut", delay: 0.2 }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-mono font-bold text-5xl text-foreground tabular-nums">{displayed}</span>
        <span className="text-xs text-muted-foreground">/ 100</span>
        <span className="text-sm text-success font-medium mt-1">Solid</span>
      </div>
    </div>
  );
};

// ── Animated pillar bar ───────────────────────────────────────────────────────

const PillarBar = ({ label, value, color, delay }) => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });
  return (
    <div ref={ref} className="space-y-1.5">
      <div className="flex justify-between text-sm">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-mono text-foreground tabular-nums">{value}/100</span>
      </div>
      <div className="h-2.5 bg-muted rounded-full overflow-hidden">
        <motion.div
          className={`h-full rounded-full ${color}`}
          initial={{ width: 0 }}
          animate={inView ? { width: `${value}%` } : {}}
          transition={{ duration: 0.9, ease: "easeOut", delay }}
        />
      </div>
    </div>
  );
};

const PILLARS = [
  {
    icon: Repeat,
    title: "Consistency",
    description: "Are you trading the same way, every session? Consistency tracks your adherence to your own trading schedule, position sizing habits, and session patterns.",
    score: 82,
    color: "bg-success",
    example: "Trading 4–5 days a week with consistent lot sizes scores higher than erratic session attendance.",
  },
  {
    icon: Shield,
    title: "Risk Management",
    description: "Are you controlling what you can control? This pillar measures your average R:R, position sizing relative to balance, and drawdown behaviour.",
    score: 76,
    color: "bg-success",
    example: "Maintaining a 1:2+ R:R average and never risking more than 2% per trade pushes this pillar up.",
  },
  {
    icon: TrendingUp,
    title: "Profitability",
    description: "Are you actually making money at a meaningful R:R? Profitability examines your net P&L trend and your win rate in context of your risk-reward.",
    score: 71,
    color: "bg-success",
    example: "A 45% win rate with a 1:2.5 R:R scores better than a 70% win rate at 1:0.5.",
  },
  {
    icon: Target,
    title: "Discipline",
    description: "Are you following your rules? Discipline detects revenge trading, over-trading after losses, and session violations — the behavioural leaks that erode accounts.",
    score: 68,
    color: "bg-warning",
    example: "A cluster of trades within 10 minutes of a loss event is flagged as potential revenge trading.",
  },
  {
    icon: BarChart3,
    title: "Growth",
    description: "Is your trading improving week-on-week? Growth tracks your Business Score trajectory, your net P&L trend, and your pillar improvements over time.",
    score: 74,
    color: "bg-success",
    example: "Three consecutive weekly Business Score improvements in Consistency and Discipline signal real growth.",
  },
];

const BANDS = [
  { range: "0–20",   label: "Needs Work",   cls: "text-danger",  bg: "bg-danger/10 border-danger/20"  },
  { range: "21–40",  label: "Developing",   cls: "text-warning", bg: "bg-warning/10 border-warning/20" },
  { range: "41–60",  label: "Progressing",  cls: "text-primary", bg: "bg-primary/10 border-primary/20" },
  { range: "61–80",  label: "Solid",        cls: "text-success", bg: "bg-success/10 border-success/20", active: true },
  { range: "81–100", label: "Elite",        cls: "text-warning", bg: "bg-warning/10 border-warning/20" },
];

export const ScorePage = () => (
  <PageLayout title="Business Score">

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
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="inline-flex items-center gap-2 bg-warning/10 text-warning border border-warning/20 text-xs font-medium rounded-full px-3 py-1 mb-6"
        >
          <Star className="h-3.5 w-3.5" aria-hidden="true" />
          Business Score
        </motion.div>
        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut", delay: 0.05 }}
          className="font-heading font-bold text-5xl md:text-6xl text-foreground leading-tight mb-6"
        >
          One number.
          <br />
          Five pillars.
          <br />
          Complete clarity.
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: "easeOut", delay: 0.1 }}
          className="text-lg text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed"
        >
          The Trading Business Score is a 0–100 composite metric unique to
          Kraviq. It tells you not just if you're profitable — but whether
          you're running a sustainable trading business.
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: "easeOut", delay: 0.15 }}
          className="flex flex-col sm:flex-row gap-3 justify-center"
        >
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Button size="lg" asChild className="gap-2">
              <Link to="/register">
                Check Your Score
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </motion.div>
          <Button variant="outline" size="lg" asChild>
            <Link to="/#pricing">View plans</Link>
          </Button>
        </motion.div>
      </div>
    </section>

    {/* ── Score visual + bands ──────────────────────────────────────────── */}
    <section className="py-20 border-t border-border">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-2 gap-16 items-center">
          {/* Dial + pillar bars */}
          <motion.div
            initial={{ opacity: 0, x: -32 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.55, ease: "easeOut" }}
            className="flex flex-col items-center gap-8"
          >
            <ScoreDial score={74} />
            <div className="w-full space-y-4">
              {PILLARS.map((p, i) => (
                <PillarBar key={p.title} label={p.title} value={p.score} color={p.color} delay={0.1 + i * 0.1} />
              ))}
            </div>
          </motion.div>

          {/* Bands + explanation */}
          <motion.div
            initial={{ opacity: 0, x: 32 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.55, ease: "easeOut", delay: 0.1 }}
          >
            <p className="text-xs uppercase tracking-widest text-primary font-medium mb-4">
              Score bands
            </p>
            <h2 className="font-heading font-bold text-3xl text-foreground mb-5">
              Where do you stand?
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-8 text-sm">
              Your Business Score updates weekly every Friday. It requires a
              minimum of 10 closed trades to generate. War Account trades are
              always excluded.
            </p>

            <div className="space-y-2 mb-8">
              {BANDS.map((b) => (
                <div
                  key={b.label}
                  className={`flex items-center justify-between rounded-xl border px-4 py-3 ${b.bg} ${b.active ? "ring-1 ring-success/30" : ""}`}
                >
                  <div className="flex items-center gap-3">
                    <span className={`font-mono text-xs font-bold ${b.cls}`}>{b.range}</span>
                    <span className={`font-medium text-sm ${b.cls}`}>{b.label}</span>
                  </div>
                  {b.active && (
                    <span className="text-[10px] text-success font-medium bg-success/10 border border-success/20 rounded-full px-2 py-0.5">
                      Example: 74
                    </span>
                  )}
                </div>
              ))}
            </div>

            <blockquote className="border-l-2 border-primary/40 pl-4 text-sm text-muted-foreground italic">
              "Most traders only track wins and losses. The Business Score tracks
              everything else."
            </blockquote>
          </motion.div>
        </div>
      </div>
    </section>

    {/* ── The 5 pillars ─────────────────────────────────────────────────── */}
    <section className="py-20 border-t border-border">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <motion.p {...reveal(0)} className="text-xs uppercase tracking-widest text-primary font-medium mb-4">
            The five pillars
          </motion.p>
          <motion.h2 {...reveal(0.05)} className="font-heading font-bold text-3xl md:text-4xl text-foreground mb-4">
            Every dimension of your trading. Measured.
          </motion.h2>
          <motion.p {...reveal(0.1)} className="text-muted-foreground max-w-xl mx-auto">
            Each pillar is scored from 0–100. The composite Business Score is a
            weighted average. Improving any pillar improves your score.
          </motion.p>
        </div>

        <div className="space-y-5">
          {PILLARS.map((p, i) => {
            const Icon = p.icon;
            return (
              <motion.div
                key={p.title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.45, ease: "easeOut", delay: i * 0.07 }}
                className="bg-card border border-border rounded-2xl p-6 grid md:grid-cols-[auto_1fr_auto] gap-6 items-start"
              >
                <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0">
                  <Icon className="h-5 w-5 text-primary" aria-hidden="true" />
                </div>
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-heading font-bold text-lg text-foreground">{p.title}</h3>
                    <span className={`text-xs font-mono font-bold ${p.color === "bg-warning" ? "text-warning" : "text-success"}`}>
                      {p.score}/100
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed mb-3">{p.description}</p>
                  <div className="bg-muted/50 rounded-lg px-3 py-2 text-xs text-muted-foreground">
                    <span className="text-foreground font-medium">Example: </span>
                    {p.example}
                  </div>
                </div>
                <div className="hidden md:block min-w-[80px]">
                  <div className="h-2 bg-muted rounded-full overflow-hidden mb-1">
                    <div className={`h-full rounded-full ${p.color}`} style={{ width: `${p.score}%` }} />
                  </div>
                  <p className="text-[10px] text-muted-foreground text-right">{p.score}%</p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>

    {/* ── Why it matters ────────────────────────────────────────────────── */}
    <section className="py-20 border-t border-border">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <motion.h2 {...reveal(0)} className="font-heading font-bold text-3xl md:text-4xl text-foreground mb-4">
            Why not just track P&L?
          </motion.h2>
          <motion.p {...reveal(0.05)} className="text-muted-foreground leading-relaxed">
            P&L tells you the outcome. The Business Score tells you the process.
          </motion.p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="grid sm:grid-cols-2 gap-5"
        >
          <div className="bg-danger/5 border border-danger/20 rounded-2xl p-6">
            <p className="text-sm font-semibold text-danger mb-3">P&L alone tells you:</p>
            <ul className="space-y-2">
              {[
                "Whether you made money this month",
                "How much you made (gross)",
                "Nothing about why you made it",
                "Nothing about whether it will repeat",
              ].map((t) => (
                <li key={t} className="flex items-start gap-2 text-sm text-muted-foreground">
                  <span className="text-danger mt-0.5 flex-shrink-0">✕</span>
                  {t}
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-success/5 border border-success/20 rounded-2xl p-6">
            <p className="text-sm font-semibold text-success mb-3">Business Score tells you:</p>
            <ul className="space-y-2">
              {[
                "Whether your process is sound",
                "Which exact behaviour is costing you",
                "Whether your edge is real or lucky",
                "Exactly what to improve next week",
              ].map((t) => (
                <li key={t} className="flex items-start gap-2 text-sm text-muted-foreground">
                  <span className="text-success mt-0.5 flex-shrink-0">✓</span>
                  {t}
                </li>
              ))}
            </ul>
          </div>
        </motion.div>
      </div>
    </section>

    {/* ── CTA ───────────────────────────────────────────────────────────── */}
    <section className="py-20 border-t border-border">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.h2 {...reveal(0)} className="font-heading font-bold text-3xl md:text-4xl text-foreground mb-4">
          Find out your score.
        </motion.h2>
        <motion.p {...reveal(0.05)} className="text-muted-foreground mb-8">
          Free to start. Requires at least 10 closed trades to generate.
        </motion.p>
        <motion.div {...reveal(0.1)}>
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="inline-block">
            <Button size="lg" asChild className="gap-2">
              <Link to="/register">
                Get My Business Score
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </motion.div>
        </motion.div>
      </div>
    </section>

  </PageLayout>
);
