import { motion, useInView } from "framer-motion";
import { useRef, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useIsMounted } from "@/hooks/useIsMounted";

// ── Animated SVG score dial ───────────────────────────────────────────────────

const ScoreDial = ({ score = 74, band = "solid" }) => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });
  const [displayed, setDisplayed] = useState(0);

  const size = 200;
  const radius = size / 2 - 18;
  const circumference = 2 * Math.PI * radius;
  const strokeOffset = circumference - (score / 100) * circumference;

  useEffect(() => {
    if (!inView) return;
    let start = null;
    const duration = 1200;
    const animate = (timestamp) => {
      if (!start) start = timestamp;
      const elapsed = timestamp - start;
      const progress = Math.min(elapsed / duration, 1);
      setDisplayed(Math.round(score * progress));
      if (progress < 1) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }, [inView, score]);

  return (
    <div ref={ref} className="relative" style={{ width: size, height: size }}>
      <svg
        width={size}
        height={size}
        style={{ transform: "rotate(-90deg)" }}
        aria-hidden="true"
      >
        {/* Track — uses CSS variable so it adapts to light/dark */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          style={{ stroke: "var(--border)" }}
          strokeWidth={10}
        />
        {/* Progress arc */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#22c55e"
          strokeWidth={10}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={inView ? { strokeDashoffset: strokeOffset } : {}}
          transition={{ duration: 1.2, ease: "easeOut", delay: 0.2 }}
        />
      </svg>

      {/* Center label */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-mono font-bold text-4xl text-foreground tabular-nums">
          {displayed}
        </span>
        <span className="text-xs text-muted-foreground">/ 100</span>
        <span className="text-xs text-success font-medium mt-0.5">Solid</span>
      </div>
    </div>
  );
};

// ── Animated pillar bar ───────────────────────────────────────────────────────

const PillarBar = ({ label, value, color = "bg-success", delay = 0 }) => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });

  return (
    <div ref={ref} className="space-y-1">
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-mono text-foreground tabular-nums">{value}/100</span>
      </div>
      <div className="h-2 bg-muted rounded-full overflow-hidden">
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

// ── Score bands ───────────────────────────────────────────────────────────────

const BANDS = [
  { range: "0–20", label: "Needs Work", cls: "text-danger" },
  { range: "21–40", label: "Developing", cls: "text-warning" },
  { range: "41–60", label: "Progressing", cls: "text-primary" },
  { range: "61–80", label: "Solid", cls: "text-success", active: true },
  { range: "81–100", label: "Elite", cls: "text-warning" },
];

export const BusinessScoreSection = () => {
  const isMounted = useIsMounted();
  return (
    <section
      className="py-24 md:py-32 border-t border-primary/10 relative overflow-hidden"
      style={{ background: "rgba(23,61,237,0.025)" }}
      aria-labelledby="score-heading"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-2 gap-16 items-center">

          {/* Left — Score visual */}
          <motion.div
            key={isMounted ? "left-m" : "left-s"}
            initial={isMounted ? { opacity: 0, x: -40 } : false}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="flex flex-col items-center md:items-start"
          >
            {/* Dial */}
            <div className="mb-8">
              <ScoreDial score={74} band="solid" />
            </div>

            {/* Pillar bars */}
            <div className="w-full max-w-xs space-y-4">
              {[
                { label: "Consistency", value: 82, color: "bg-success", delay: 0.1 },
                { label: "Risk Management", value: 76, color: "bg-success", delay: 0.2 },
                { label: "Profitability", value: 71, color: "bg-success", delay: 0.3 },
                { label: "Discipline", value: 68, color: "bg-warning", delay: 0.4 },
                { label: "Growth", value: 74, color: "bg-success", delay: 0.5 },
              ].map((p) => (
                <PillarBar key={p.label} {...p} />
              ))}
            </div>
          </motion.div>

          {/* Right — Content */}
          <motion.div
            key={isMounted ? "right-m" : "right-s"}
            initial={isMounted ? { opacity: 0, x: 40 } : false}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: "easeOut", delay: 0.1 }}
          >
            <p className="text-xs uppercase tracking-widest text-primary mb-4 font-medium">
              Business Score
            </p>

            <h2
              id="score-heading"
              className="font-heading font-bold text-4xl md:text-5xl text-foreground leading-tight mb-6"
            >
              Know exactly where
              <br />
              your trading business stands.
            </h2>

            <p className="text-muted-foreground leading-relaxed mb-8 max-w-md">
              The{" "}
              <Link to="/business-score" className="text-primary hover:underline">
                Trading Business Score
              </Link>{" "}
              is a 0–100 composite metric that
              measures five pillars of your trading health. Updated weekly, it
              tells you not just if you're profitable — but if you're running a
              sustainable trading business.
            </p>

            {/* Score bands grid */}
            <div
              className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-8"
              aria-label="Score band reference"
            >
              {BANDS.map((b) => (
                <div
                  key={b.label}
                  className={`rounded-lg px-3 py-2 border ${
                    b.active
                      ? "bg-success/10 border-success/30"
                      : "bg-muted border-border"
                  }`}
                >
                  <div className="text-[10px] text-muted-foreground font-mono">
                    {b.range}
                  </div>
                  <div className={`text-xs font-semibold ${b.cls}`}>
                    {b.label}
                    {b.active && (
                      <span className="ml-1 text-[8px]">← you</span>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Quote */}
            <blockquote className="border-l-2 border-primary/40 pl-4 text-sm text-muted-foreground italic">
              "Most traders only track wins and losses. The Business Score
              tracks everything else."
            </blockquote>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
