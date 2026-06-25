import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useIsMounted } from "@/hooks/useIsMounted";

const PROBLEMS = [
  "You don't know if you're actually profitable.",
  "No visibility into true net P&L after all costs.",
  "Prop firm rules are tracked in your head.",
  "Multiple accounts, zero unified picture.",
  "Spreadsheets break when trading gets serious.",
];

const INTERVAL_MS = 3200;

export const ProblemStrip = () => {
  const isMounted = useIsMounted();
  const [active, setActive] = useState(0);
  const [progress, setProgress] = useState(0);
  const startRef = useRef(Date.now());

  useEffect(() => {
    startRef.current = Date.now();
    setProgress(0);

    const tick = setInterval(() => {
      const elapsed = Date.now() - startRef.current;
      setProgress(Math.min((elapsed / INTERVAL_MS) * 100, 100));
    }, 30);

    const next = setTimeout(() => {
      setActive((p) => (p + 1) % PROBLEMS.length);
    }, INTERVAL_MS);

    return () => {
      clearInterval(tick);
      clearTimeout(next);
    };
  }, [active]);

  return (
    <section
      className="py-24 border-y border-border relative overflow-hidden"
      aria-label="Common trader problems"
    >
      {/* Subtle background */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 60% 80% at 50% 50%, rgba(23,61,237,0.04), transparent)",
        }}
        aria-hidden="true"
      />

      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Section label */}
        <motion.p
          initial={isMounted ? { opacity: 0, y: 12 } : false}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="text-xs text-muted-foreground uppercase tracking-widest mb-12"
        >
          Sound familiar?
        </motion.p>

        {/* Pain point display — AnimatePresence mode="wait" only keeps the
            active item mounted, so the other 4 problem statements never
            reach the static/prerendered HTML. The sr-only list below holds
            the complete, real content for crawlers and screen readers; the
            animated rotation is purely a decorative presentation layer for
            sighted users on top of it. */}
        <div className="relative min-h-[120px] flex items-center justify-center mb-10">
          {/* Decorative quote mark */}
          <span
            className="absolute -top-4 left-1/2 -translate-x-1/2 text-8xl text-muted/30 font-serif leading-none select-none pointer-events-none"
            aria-hidden="true"
          >
            "
          </span>

          <ul className="sr-only">
            {PROBLEMS.map((problem) => (
              <li key={problem}>{problem}</li>
            ))}
          </ul>

          <AnimatePresence mode="wait">
            <motion.blockquote
              key={active}
              aria-hidden="true"
              initial={isMounted ? { opacity: 0, y: 16 } : false}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              className="font-heading font-bold text-3xl md:text-4xl text-foreground leading-tight max-w-3xl mx-auto"
            >
              {PROBLEMS[active]}
            </motion.blockquote>
          </AnimatePresence>
        </div>

        {/* Progress bar */}
        <div className="h-0.5 bg-border rounded-full mb-6 max-w-xs mx-auto overflow-hidden">
          <motion.div
            key={active}
            className="h-full bg-primary rounded-full"
            initial={{ width: "0%" }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0 }}
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Dots */}
        <div
          className="flex justify-center gap-2 mb-12"
          role="tablist"
          aria-label="Problem navigation"
        >
          {PROBLEMS.map((_, i) => (
            <button
              key={i}
              role="tab"
              aria-selected={active === i}
              aria-label={`Problem ${i + 1}`}
              onClick={() => setActive(i)}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                active === i ? "bg-primary scale-110" : "bg-border hover:bg-muted-foreground/40"
              }`}
            />
          ))}
        </div>

        {/* Resolution statement */}
        <motion.p
          initial={isMounted ? { opacity: 0, y: 12 } : false}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, ease: "easeOut", delay: 0.2 }}
          className="text-xl font-heading font-semibold text-primary"
        >
          Kraviq fixes all of this.
        </motion.p>
      </div>
    </section>
  );
};
