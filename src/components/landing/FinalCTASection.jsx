import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { useIsMounted } from "@/hooks/useIsMounted";

export const FinalCTASection = () => {
  const isMounted = useIsMounted();
  return (
    <section
      className="py-24 md:py-32 border-t border-border relative overflow-hidden"
      aria-labelledby="cta-heading"
    >
      {/* Background glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 70% 60% at 50% 100%, rgba(23,61,237,0.12), transparent)",
        }}
        aria-hidden="true"
      />

      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.p
          initial={isMounted ? { opacity: 0, y: 12 } : false}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="text-xs uppercase tracking-widest text-primary mb-6 font-medium"
        >
          Get Started Today
        </motion.p>

        <motion.h2
          id="cta-heading"
          initial={isMounted ? { opacity: 0, y: 20 } : false}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.55, ease: "easeOut", delay: 0.05 }}
          className="font-heading font-bold text-5xl md:text-6xl text-foreground leading-tight mb-6"
        >
          Your trading business
          <br />
          starts here.
        </motion.h2>

        <motion.p
          initial={isMounted ? { opacity: 0, y: 16 } : false}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, ease: "easeOut", delay: 0.1 }}
          className="text-lg text-muted-foreground max-w-xl mx-auto mb-10"
        >
          Join traders who treat their craft as a business. Free to start, no
          credit card required. Your data, your edge.
        </motion.p>

        <motion.div
          initial={isMounted ? { opacity: 0, y: 16 } : false}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, ease: "easeOut", delay: 0.15 }}
          className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-10"
        >
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Button size="lg" asChild className="gap-2 px-8">
              <Link to="/register">
                Start Building Today
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </motion.div>
          <Button variant="ghost" size="lg" asChild className="text-muted-foreground">
            <Link to="/login">Already have an account? Sign in</Link>
          </Button>
        </motion.div>

        {/* Trust indicators */}
        <motion.div
          initial={isMounted ? { opacity: 0 } : false}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="flex flex-wrap justify-center gap-6"
          aria-label="Trust indicators"
        >
          {[
            "Free to start",
            "No credit card",
            "MT4 & MT5 supported",
            "Cancel anytime",
          ].map((t) => (
            <span
              key={t}
              className="flex items-center gap-1.5 text-xs text-muted-foreground"
            >
              <span className="text-success" aria-hidden="true">✓</span>
              {t}
            </span>
          ))}
        </motion.div>
      </div>
    </section>
  );
};
