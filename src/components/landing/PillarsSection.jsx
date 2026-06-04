import { motion } from "framer-motion";
import { TrendingUp, Star, BarChart3, Check } from "lucide-react";

const PILLARS = [
  {
    icon: TrendingUp,
    title: "Trade",
    description:
      "Capture every trade — manually, via CSV import, or automatically through your MT4/MT5 EA. Full trade journal with session analysis, compliance tracking, and behavioural detection.",
    features: [
      "Manual + CSV + EA sync",
      "Prop firm compliance",
      "Behavioural pattern detection",
      "Multi-account management",
    ],
    accent: "text-primary",
    bg: "bg-primary/5",
    border: "border-border",
    highlighted: false,
  },
  {
    icon: Star,
    title: "Score",
    description:
      "The Trading Business Score measures five pillars of your trading health — consistency, risk management, profitability, discipline, and growth. Know exactly where you stand.",
    features: [
      "0–100 composite score",
      "5-pillar breakdown",
      "Weekly score history",
      "Improvement tracking",
    ],
    accent: "text-warning",
    bg: "bg-primary/5",
    border: "border-primary/40",
    highlighted: true,
    badge: "Unique to Kraviq",
  },
  {
    icon: BarChart3,
    title: "Scale",
    description:
      "Run your trading like a business. True net P&L after all costs, prop firm ROI tracking, financial ledger, and War Account graduation pipeline.",
    features: [
      "True net P&L calculation",
      "Prop firm challenge tracker",
      "Financial ledger",
      "War Account system",
    ],
    accent: "text-success",
    bg: "bg-primary/5",
    border: "border-border",
    highlighted: false,
  },
];

const container = {
  initial: {},
  whileInView: {
    transition: { staggerChildren: 0.15 },
  },
};

const card = {
  initial: { opacity: 0, y: 32 },
  whileInView: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: "easeOut" },
  },
};

export const PillarsSection = () => {
  return (
    <section
      id="features"
      className="py-24 md:py-32"
      aria-labelledby="pillars-heading"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="text-xs uppercase tracking-widest text-primary mb-4 font-medium"
          >
            The Platform
          </motion.p>
          <motion.h2
            id="pillars-heading"
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, ease: "easeOut", delay: 0.05 }}
            className="font-heading font-bold text-4xl md:text-5xl text-foreground mb-4"
          >
            Trade. Score. Scale.
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, ease: "easeOut", delay: 0.1 }}
            className="text-muted-foreground text-lg max-w-xl mx-auto"
          >
            Everything a professional forex trading business needs — in one
            place.
          </motion.p>
        </div>

        {/* Pillar cards */}
        <motion.div
          variants={container}
          initial="initial"
          whileInView="whileInView"
          viewport={{ once: true }}
          className="grid md:grid-cols-3 gap-6"
        >
          {PILLARS.map((pillar) => {
            const Icon = pillar.icon;
            return (
              <motion.article
                key={pillar.title}
                variants={card}
                className={`relative rounded-2xl p-8 border ${pillar.border} ${
                  pillar.highlighted ? pillar.bg : "bg-card"
                } transition-colors hover:border-primary/40`}
              >
                {/* Highlighted badge */}
                {pillar.badge && (
                  <span className="absolute top-4 right-4 text-[10px] font-medium bg-primary/10 text-primary border border-primary/20 rounded-full px-2.5 py-0.5">
                    {pillar.badge}
                  </span>
                )}

                {/* Icon */}
                <div className={`mb-6 ${pillar.accent}`}>
                  <Icon className="h-10 w-10" aria-hidden="true" />
                </div>

                {/* Title */}
                <h3 className="font-heading font-bold text-2xl text-foreground mb-3">
                  {pillar.title}
                </h3>

                {/* Description */}
                <p className="text-muted-foreground text-sm leading-relaxed mb-6">
                  {pillar.description}
                </p>

                {/* Features list */}
                <ul className="space-y-2" aria-label={`${pillar.title} features`}>
                  {pillar.features.map((f) => (
                    <li
                      key={f}
                      className="flex items-center gap-2.5 text-sm text-foreground"
                    >
                      <Check
                        className="h-3.5 w-3.5 text-success flex-shrink-0"
                        aria-hidden="true"
                      />
                      {f}
                    </li>
                  ))}
                </ul>
              </motion.article>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
};
