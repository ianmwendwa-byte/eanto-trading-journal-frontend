import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";

const FAQS = [
  {
    q: "Is Kraviq free to start?",
    a: "Yes. The Free plan gives you 1 trading account, up to 50 trades per month, manual entry, and basic analytics — no credit card required. You can upgrade when you're ready.",
  },
  {
    q: "Does Kraviq work with MetaTrader 4 and MT5?",
    a: "Yes. Kraviq supports MT4 and MT5 via three methods: manual trade entry, CSV export/import from your broker terminal, and automatic EA sync through the Kraviq Expert Advisor you install on your chart.",
  },
  {
    q: "What is the Business Score?",
    a: "The Trading Business Score is a 0–100 composite metric unique to Kraviq. It measures five pillars — consistency, risk management, profitability, discipline, and growth — and gives you a single number that reflects your overall trading business health. It updates weekly and requires at least 10 closed trades.",
  },
  {
    q: "What is a War Account and why would I use one?",
    a: "A War Account is an isolated sandbox for testing experimental or high-risk strategies. It allows full margin, news trading, and scalping. Critically, War Account data is completely excluded from your aggregate performance metrics and Business Score — so your reckless experiments don't contaminate your real numbers.",
  },
  {
    q: "Can I import my existing MT4/MT5 trade history?",
    a: "Yes. Export a Statement from your MetaTrader terminal, upload it to Kraviq, and we'll auto-detect your broker format. You'll see a preview before confirming the import. We support all major broker statement formats.",
  },
  {
    q: "Does Kraviq support prop firm accounts like FTMO?",
    a: "Absolutely. Prop accounts in Kraviq track your challenge rules in real time — profit target, daily and overall drawdown limits, minimum trading days, and payout eligibility. We support FTMO, FundingPips, The Funded Trader, and more.",
  },
  {
    q: "How does EA sync work?",
    a: "Install the Kraviq Expert Advisor (EA) on your MT4/MT5 chart and configure it with your unique API key. Every time a trade closes, the EA automatically syncs the trade details to Kraviq — no manual input required. Your API key is shown once at generation and never again, so copy it safely.",
  },
  {
    q: "Can I cancel my subscription at any time?",
    a: "Yes. There are no lock-in periods. Cancel from your Settings page at any time. If you cancel, you'll retain access until the end of your current billing period. Your data is preserved — you can re-subscribe and pick up where you left off.",
  },
];

const FAQItem = ({ item, isOpen, onToggle }) => {
  return (
    <div
      className="border-b border-border last:border-0"
      itemScope
      itemProp="mainEntity"
      itemType="https://schema.org/Question"
    >
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between py-5 text-left group"
        aria-expanded={isOpen}
      >
        <span
          itemProp="name"
          className="font-medium text-foreground group-hover:text-primary transition-colors pr-4"
        >
          {item.q}
        </span>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="flex-shrink-0"
          aria-hidden="true"
        >
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        </motion.div>
      </button>

      {/* Always-present answer for schema microdata crawlers */}
      <div
        className="sr-only"
        itemScope
        itemProp="acceptedAnswer"
        itemType="https://schema.org/Answer"
      >
        <span itemProp="text">{item.a}</span>
      </div>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            style={{ overflow: "hidden" }}
          >
            <p className="text-muted-foreground text-sm leading-relaxed pb-5">
              {item.a}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export const FAQSection = () => {
  const [openIndex, setOpenIndex] = useState(null);

  const toggle = (i) => setOpenIndex((prev) => (prev === i ? null : i));

  return (
    <section
      id="faq"
      className="py-24 md:py-32 border-t border-border"
      aria-labelledby="faq-heading"
    >
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-14">
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="text-xs uppercase tracking-widest text-primary mb-4 font-medium"
          >
            FAQ
          </motion.p>
          <motion.h2
            id="faq-heading"
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, ease: "easeOut", delay: 0.05 }}
            className="font-heading font-bold text-4xl md:text-5xl text-foreground"
          >
            Common questions
          </motion.h2>
        </div>

        {/* FAQ list */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, ease: "easeOut", delay: 0.1 }}
          className="bg-card border border-border rounded-2xl px-6 md:px-8"
          role="list"
          aria-label="Frequently asked questions"
          itemScope
          itemType="https://schema.org/FAQPage"
        >
          {FAQS.map((item, i) => (
            <div role="listitem" key={i}>
              <FAQItem
                item={item}
                isOpen={openIndex === i}
                onToggle={() => toggle(i)}
              />
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};
