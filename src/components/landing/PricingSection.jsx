import { useState } from "react";
import { motion } from "framer-motion";
import { Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useIsMounted } from "@/hooks/useIsMounted";

const TIERS = [
  {
    name: "Free",
    monthly: 0,
    annual: 0,
    description: "For traders just getting started",
    cta: "Start for free",
    highlighted: false,
    features: [
      { text: "1 trading account", included: true },
      { text: "Up to 50 trades/month", included: true },
      { text: "Manual trade entry", included: true },
      { text: "Basic analytics", included: true },
      { text: "CSV import (limited)", included: true },
      { text: "EA auto-sync", included: false },
      { text: "Business Score", included: false },
      { text: "Prop firm tracker", included: false },
    ],
  },
  {
    name: "Starter",
    monthly: 12,
    annual: 9,
    description: "For traders getting serious",
    cta: "Start Starter",
    highlighted: false,
    features: [
      { text: "3 trading accounts", included: true },
      { text: "Unlimited trades", included: true },
      { text: "Manual + CSV import", included: true },
      { text: "Full analytics dashboard", included: true },
      { text: "Business Score", included: true },
      { text: "EA auto-sync", included: false },
      { text: "War Account system", included: false },
      { text: "Prop firm challenge tracker", included: false },
    ],
  },
  {
    name: "Pro",
    monthly: 29,
    annual: 22,
    description: "For serious retail traders",
    cta: "Start Pro",
    highlighted: true,
    badge: "Most Popular",
    features: [
      { text: "10 trading accounts", included: true },
      { text: "Unlimited trades", included: true },
      { text: "Manual + CSV + EA sync", included: true },
      { text: "Full analytics + Business Score", included: true },
      { text: "War Account system", included: true },
      { text: "Prop firm challenge tracker", included: true },
      { text: "Priority support", included: true },
      { text: "API access", included: false },
    ],
  },
  {
    name: "Elite",
    monthly: 49,
    annual: 38,
    description: "For professional traders",
    cta: "Start Elite",
    highlighted: false,
    features: [
      { text: "Unlimited accounts", included: true },
      { text: "Everything in Pro", included: true },
      { text: "API access", included: true },
      { text: "AI coaching insights", included: true },
      { text: "Dedicated onboarding", included: true },
      { text: "Custom reporting", included: true },
      { text: "1-on-1 strategy review", included: true },
      { text: "White-glove support", included: true },
    ],
  },
];

const container = {
  initial: {},
  whileInView: { transition: { staggerChildren: 0.1 } },
};
const getCard = (mounted) => ({
  initial: mounted ? { opacity: 0, y: 28 } : false,
  whileInView: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
});

export const PricingSection = () => {
  const isMounted = useIsMounted();
  const card = getCard(isMounted);
  const [annual, setAnnual] = useState(false);

  return (
    <section
      id="pricing"
      className="py-24 md:py-32 border-t border-border"
      aria-labelledby="pricing-heading"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <motion.p
            initial={isMounted ? { opacity: 0, y: 12 } : false}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="text-xs uppercase tracking-widest text-primary mb-4 font-medium"
          >
            Pricing
          </motion.p>
          <motion.h2
            id="pricing-heading"
            initial={isMounted ? { opacity: 0, y: 16 } : false}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, ease: "easeOut", delay: 0.05 }}
            className="font-heading font-bold text-4xl md:text-5xl text-foreground mb-4"
          >
            Start free. Upgrade when ready.
          </motion.h2>
          <motion.p
            initial={isMounted ? { opacity: 0, y: 12 } : false}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, ease: "easeOut", delay: 0.1 }}
            className="text-muted-foreground text-lg mb-8"
          >
            No credit card required. Cancel anytime.
          </motion.p>

          {/* Billing toggle */}
          <motion.div
            initial={isMounted ? { opacity: 0, y: 12 } : false}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, ease: "easeOut", delay: 0.15 }}
            className="inline-flex items-center gap-3 bg-muted rounded-full p-1"
            role="group"
            aria-label="Billing cycle"
          >
            <button
              onClick={() => setAnnual(false)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                !annual
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
              aria-pressed={!annual}
            >
              Monthly
            </button>
            <button
              onClick={() => setAnnual(true)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                annual
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
              aria-pressed={annual}
            >
              Annual
              <span className="ml-1.5 text-[10px] bg-success/10 text-success border border-success/20 rounded-full px-1.5 py-0.5">
                −25%
              </span>
            </button>
          </motion.div>
        </div>

        {/* Pricing cards */}
        <motion.div
          variants={container}
          initial="initial"
          whileInView="whileInView"
          viewport={{ once: true }}
          className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5"
        >
          {TIERS.map((tier) => {
            const price = annual ? tier.annual : tier.monthly;
            return (
              <motion.article
                key={tier.name}
                variants={card}
                className={`relative rounded-2xl p-6 border flex flex-col ${
                  tier.highlighted
                    ? "bg-primary/5 border-primary/40 ring-1 ring-primary/20"
                    : "bg-card border-border"
                }`}
              >
                {/* Badge */}
                {tier.badge && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 text-[10px] font-semibold bg-primary text-primary-foreground rounded-full px-3 py-1">
                    {tier.badge}
                  </span>
                )}

                {/* Name + description */}
                <div className="mb-4">
                  <h3 className="font-heading font-bold text-lg text-foreground mb-1">
                    {tier.name}
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    {tier.description}
                  </p>
                </div>

                {/* Price */}
                <div className="mb-6">
                  <div className="flex items-end gap-1">
                    <span className="font-mono font-bold text-4xl text-foreground tabular-nums">
                      ${price}
                    </span>
                    <span className="text-sm text-muted-foreground mb-1">
                      /month
                    </span>
                  </div>
                  {annual && tier.monthly > 0 && (
                    <p className="text-[10px] text-muted-foreground mt-0.5">
                      Billed annually (${tier.annual * 12}/yr)
                    </p>
                  )}
                </div>

                {/* CTA */}
                <Button
                  variant={tier.highlighted ? "default" : "outline"}
                  className="w-full mb-6"
                  asChild
                >
                  <Link to="/register">{tier.cta}</Link>
                </Button>

                {/* Features */}
                <ul className="space-y-2.5 flex-1" aria-label={`${tier.name} features`}>
                  {tier.features.map((f) => (
                    <li key={f.text} className="flex items-center gap-2.5">
                      {f.included ? (
                        <Check
                          className="h-3.5 w-3.5 text-success flex-shrink-0"
                          aria-hidden="true"
                        />
                      ) : (
                        <X
                          className="h-3.5 w-3.5 text-border flex-shrink-0"
                          aria-hidden="true"
                        />
                      )}
                      <span
                        className={`text-xs ${
                          f.included ? "text-foreground" : "text-muted-foreground/60"
                        }`}
                      >
                        {f.text}
                      </span>
                    </li>
                  ))}
                </ul>
              </motion.article>
            );
          })}
        </motion.div>

        {/* Footnote */}
        <motion.p
          initial={isMounted ? { opacity: 0 } : false}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, delay: 0.3 }}
          className="text-center text-xs text-muted-foreground mt-8"
        >
          All plans include a 14-day free trial on paid tiers. No credit card
          required to start.
        </motion.p>
      </div>
    </section>
  );
};
