/**
 * FAQ content for the landing page — single source of truth shared by
 * FAQSection.jsx (visible content) and LandingPage.jsx (FAQPage JSON-LD via
 * buildFaqSchema), so the two can never drift apart. Kept out of
 * FAQSection.jsx because exporting a non-component const from a component
 * file breaks React Fast Refresh.
 */
export const FAQS = [
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
