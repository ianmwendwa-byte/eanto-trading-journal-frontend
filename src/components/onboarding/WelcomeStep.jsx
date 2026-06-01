import { motion } from "framer-motion";
import { TrendingUp, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const tagline1 = ["The", "Operating", "System", "for"];
const tagline2 = ["Retail", "Forex", "Traders"];

const WordFade = ({ words, delayStart = 0, className = "" }) =>
  words.map((word, i) => (
    <motion.span
      key={i}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: delayStart + i * 0.09, duration: 0.35, ease: "easeOut" }}
      className={className}
    >
      {word}{" "}
    </motion.span>
  ));

export const WelcomeStep = ({ onStart }) => (
  <div className="relative min-h-screen bg-background trading-grid flex items-center justify-center overflow-hidden">
    {/* Radial glow */}
    <div
      className="pointer-events-none absolute inset-0"
      style={{
        background:
          "radial-gradient(ellipse 60% 50% at 50% 40%, rgba(23,61,237,0.08) 0%, transparent 70%)",
      }}
    />

    <div className="relative z-10 flex flex-col items-center text-center px-6 max-w-xl w-full">
      {/* Logo */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="flex items-center gap-3 mb-10"
      >
        <div className="h-12 w-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center">
          <TrendingUp className="h-6 w-6 text-primary" />
        </div>
        <span className="text-2xl font-heading font-bold text-foreground tracking-tight">
          Tradecore
        </span>
      </motion.div>

      {/* Tagline */}
      <h1 className="text-4xl sm:text-5xl font-heading font-bold leading-tight text-foreground mb-2">
        <WordFade words={tagline1} delayStart={0.2} />
        <br />
        <span className="text-primary">
          <WordFade words={tagline2} delayStart={0.6} />
        </span>
      </h1>

      {/* Subtitle */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.1, duration: 0.4 }}
        className="text-sm text-muted-foreground mt-4 mb-10 max-w-sm leading-relaxed"
      >
        Track, analyze and grow your trading business from one place.
        Built for serious retail forex traders.
      </motion.p>

      {/* CTA */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.3, duration: 0.35 }}
      >
        <Button
          size="lg"
          className="gap-2 px-8 text-base h-12"
          onClick={onStart}
        >
          Get Started
          <ArrowRight className="h-4 w-4" />
        </Button>
      </motion.div>

      {/* Step hint */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.6, duration: 0.3 }}
        className="text-xs text-muted-foreground/60 mt-6"
      >
        5-minute setup · personalizes your experience
      </motion.p>
    </div>
  </div>
);
