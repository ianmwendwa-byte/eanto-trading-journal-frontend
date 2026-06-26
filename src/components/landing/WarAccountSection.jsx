import { motion } from "framer-motion";
import { Swords, Shield, TrendingUp, Zap } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useIsMounted } from "@/hooks/useIsMounted";

const WarMockup = () => (
  <div className="bg-card border border-danger/30 rounded-2xl p-6 w-full max-w-sm shadow-2xl">
    <div className="flex items-center justify-between mb-4">
      <div>
        <div className="text-xs text-muted-foreground mb-0.5">Strategy Lab</div>
        <div className="font-heading font-semibold text-xl text-foreground">
          EA Scalper v2
        </div>
      </div>
      <span className="text-xs font-bold bg-danger/10 text-danger border border-danger/30 rounded-full px-3 py-1">
        WAR
      </span>
    </div>

    <div className="text-3xl font-mono font-bold text-foreground mb-1">
      $4,200.00
    </div>
    <div className="text-sm text-danger font-mono mb-5">
      -$800 (-16.0%) from $5,000 seed
    </div>

    <div className="space-y-2 mb-5">
      <div className="flex items-center justify-between bg-muted rounded-lg px-3 py-2">
        <span className="text-xs text-muted-foreground">Risk mode</span>
        <span className="text-xs font-medium text-danger">Full margin</span>
      </div>
      <div className="flex items-center justify-between bg-muted rounded-lg px-3 py-2">
        <span className="text-xs text-muted-foreground">News trading</span>
        <span className="text-xs font-medium text-success">Allowed</span>
      </div>
      <div className="flex items-center justify-between bg-muted rounded-lg px-3 py-2">
        <span className="text-xs text-muted-foreground">Metric bleed</span>
        <span className="text-xs font-medium text-success">Isolated ✓</span>
      </div>
    </div>

    <div className="bg-danger/5 border border-danger/20 rounded-xl p-3">
      <div className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1.5">
        Graduation Pipeline
      </div>
      <div className="flex items-center gap-2">
        <div className="w-2.5 h-2.5 rounded-full bg-warning" />
        <span className="text-sm text-foreground font-medium">
          Testing — 34 trades logged
        </span>
      </div>
      <div className="mt-2 text-[10px] text-muted-foreground">
        Needs 66 more trades to qualify
      </div>
    </div>
  </div>
);

const POINTS = [
  { icon: Swords, text: "Complete data isolation from real metrics" },
  { icon: Shield, text: "Real capital performance unaffected" },
  { icon: TrendingUp, text: "Graduation pipeline to production" },
  { icon: Zap, text: "All high-risk modes enabled" },
];

export const WarAccountSection = () => {
  const isMounted = useIsMounted();
  return (
    <section
      className="py-24 md:py-32 border-t border-border relative overflow-hidden"
      aria-labelledby="war-heading"
    >
      {/* Subtle red edge tint */}
      <div
        className="absolute left-0 top-0 bottom-0 w-1 bg-danger/60"
        aria-hidden="true"
      />
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 50% 60% at 0% 50%, rgba(239,68,68,0.04), transparent)",
        }}
        aria-hidden="true"
      />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-2 gap-16 items-center">
          {/* Content */}
          <motion.div
            key={isMounted ? "content-m" : "content-s"}
            initial={isMounted ? { opacity: 0, x: -60 } : false}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          >
            <span className="inline-flex items-center gap-2 text-xs font-medium bg-danger/10 text-danger border border-danger/20 rounded-full px-3 py-1 mb-6">
              <Swords className="h-3.5 w-3.5" aria-hidden="true" />
              War Account
            </span>

            <h2
              id="war-heading"
              className="font-heading font-bold text-4xl md:text-5xl text-foreground leading-tight mb-6"
            >
              Where strategies are born
              <br />
              before they earn their place.
            </h2>

            <p className="text-muted-foreground leading-relaxed mb-8 max-w-md">
              Not every strategy is ready for real capital. The War Account is
              your experimental sandbox — full margin, news trading, scalping
              allowed. Complete data isolation means your reckless experiments
              never contaminate your real trading metrics.
            </p>

            <ul className="space-y-4 mb-8" aria-label="War Account features">
              {POINTS.map(({ icon: Icon, text }) => (
                <li key={text} className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-danger/10 border border-danger/20 flex items-center justify-center flex-shrink-0">
                    <Icon className="h-4 w-4 text-danger" aria-hidden="true" />
                  </div>
                  <span className="text-sm text-foreground">{text}</span>
                </li>
              ))}
            </ul>

            <Button variant="outline" className="gap-2 border-danger/40 text-danger hover:bg-danger/5 hover:text-danger" asChild>
              <Link to="/war-account">Explore War Accounts →</Link>
            </Button>
          </motion.div>

          {/* Mockup */}
          <motion.div
            key={isMounted ? "mockup-m" : "mockup-s"}
            initial={isMounted ? { opacity: 0, x: 60 } : false}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: "easeOut", delay: 0.1 }}
            className="flex justify-center"
          >
            <motion.div
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            >
              <WarMockup />
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
