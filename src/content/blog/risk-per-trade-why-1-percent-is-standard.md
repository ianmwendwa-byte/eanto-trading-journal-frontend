---
title: "Risk Per Trade: Why 1% Is the Standard"
slug: "risk-per-trade-why-1-percent-is-standard"
pillar: "psychology"
priority: 1
primaryKeyword: "risk per trade percentage"
secondaryKeywords:
  - "how much to risk per trade"
  - "1 percent risk rule"
  - "position sizing forex"
  - "risk management forex"
faq:
  - question: "What percentage should I risk per trade?"
    answer: "Many traders and prop firms use a 1-2% risk-per-trade guideline, which is designed to allow an account to withstand a normal losing streak without significant damage."
  - question: "How do I calculate risk per trade?"
    answer: "Risk per trade is generally the dollar distance between your entry and stop loss multiplied by your position size, expressed as a percentage of your account balance."
  - question: "Why is 1% risk recommended over 5%?"
    answer: "At 5% risk per trade, a string of just a handful of losses can produce a drawdown that's very difficult to recover from, while 1% risk allows for far more losing trades before the same impact."
  - question: "Does risk per trade calculation change for gold or crypto?"
    answer: "Yes. Contract sizes differ significantly between forex pairs, metals, and crypto, and the same price movement represents a different dollar risk depending on the instrument."
kraviqTieIn:
  feature: "Strategy.riskRules.maxRiskPerTrade and the contract-size-aware risk calculation engine (works correctly across forex, gold, and crypto)"
  ctaText: "Every Kraviq Strategy template defaults to 1% max risk per trade, calculated correctly whether you're trading EURUSD, XAUUSD, or BTCUSD, and every trade is automatically checked against it."
  linksTo: "/strategies/templates"
relatedStrategyTemplate: null
internalLinks:
  - "5-reasons-traders-fail-prop-firm-challenges"
  - "profit-factor-vs-win-rate-which-matters-more"
estimatedWordCount: 1800
isCornerstone: false
publishedAt: "2026-06-14"
updatedAt: "2026-06-15"
---

The 1% risk rule is the most repeated piece of risk management advice in retail trading — and also the most misunderstood. Some traders follow it rigidly without understanding why it works. Others dismiss it as too conservative for their account size or strategy. Neither approach is informed. Understanding what risk per trade actually means, why the 1 to 2% range was settled on, and how it applies across different instruments is the foundation of position sizing that actually protects capital through losing streaks.

## What 'Risk Per Trade' Actually Means

Risk per trade is the amount of money — expressed as a percentage of your account — that you stand to lose if a single trade hits its stop loss. This is not the same as lot size, margin used, or notional value. Two traders can both trade 0.1 lots on EURUSD but have completely different risk percentages depending on whether one has a 10-pip stop and the other has a 50-pip stop.

Risk per trade is specifically: (dollar distance from entry to stop loss) × (position size) ÷ (account balance). Getting this definition right is the prerequisite for applying any risk management guideline correctly. Traders who confuse lot size with risk are not calculating risk per trade — they are guessing.

## The Math: 1% vs 5% Over a Losing Streak

The case for 1% risk becomes clearest when you model a losing streak. Starting with a $10,000 account:

At **1% risk per trade**, ten consecutive losses leave you with approximately $9,044 — a 9.56% drawdown. Recovery to the original balance requires an 10.6% gain from the new balance.

At **5% risk per trade**, those same ten losses leave you with approximately $5,987 — a 40.13% drawdown. Recovery requires a 66.9% gain from the new balance.

The 1% trader can withstand a ten-loss streak and return to their peak with a modest run. The 5% trader needs to nearly double their account from the low to break even. The recovery math compounds the original problem: large drawdowns require disproportionately large gains to repair, which typically pressures traders into taking more risk — the exact dynamic that created the drawdown in the first place.

## Where the '1-2%' Guideline Comes From

The 1 to 2% guideline is not a universal law. It is a practical heuristic developed to ensure account survival through statistically normal variance. Most trading strategies, even genuinely profitable ones, experience losing streaks of 5 to 10 consecutive losses at some point. At 1% risk, a 10-loss streak produces a manageable drawdown that does not threaten the account or the trader's psychology. At 2%, the same streak is still survivable but produces more psychological pressure and a harder recovery path.

The guideline exists because most traders underestimate two things: the realistic length of their losing streaks, and how difficult it is to trade rationally when in a large drawdown. The math is one problem; the psychology of being down 40% is another. The 1% rule is sized to keep both problems manageable simultaneously.

## Calculating Risk Across Different Instruments

Risk calculation is instrument-specific because different markets have different contract structures. On major forex pairs like EURUSD, a standard lot represents 100,000 units and one pip has a defined dollar value that varies by quote currency. On gold (XAUUSD), the pip value per lot is different — a move of one dollar in gold price represents a specific dollar P&L per lot that is not the same as a forex pair. On crypto, the calculation differs further depending on whether you are trading a USD-denominated perpetual contract or a coin-denominated one.

The practical point is that you cannot use the same lot size as a proxy for risk across different instruments. A 0.1 lot on EURUSD represents a different dollar risk than 0.1 lots on XAUUSD at the same pip distance from entry to stop. Each instrument requires its own calculation using the actual dollar loss at your stop loss level for that specific instrument's contract specification.

## When Deviating from 1% Might Make Sense

There are legitimate arguments for deviating from 1% in specific contexts. Very small accounts (under $1,000) may find that 1% produces positions too small to trade at reasonable pip distances on standard lot structures. Highly experienced traders with extensive data on their strategy's actual drawdown profile may have quantitative reasons to size slightly higher if their backtested maximum drawdown is reliably below a certain threshold.

Traders running prop firm evaluations may calculate that a specific risk percentage better fits their exact challenge parameters — where the daily drawdown limit and the profit target interact to make a particular sizing approach optimal. These are legitimate, data-driven contexts for deviation.

The general principle is that any deviation from the conservative baseline should be based on explicit reasoning and data, not optimism about the upcoming trade or the upcoming week.

## Enforcing Your Risk Rule Automatically

The weakest form of a risk rule is one you calculate mentally before each trade and self-check in the moment. The failure mode is well-documented: in the heat of a setup, especially after a loss, position sizes drift upward. The rule set at the start of the week gets gradually overridden by in-session decisions that feel justified at the time.

A risk rule that is enforced automatically (checked on every trade sync against your stated maximum) is structurally different from one that lives in your head. It catches violations that the trader did not recognize as violations at the time of entry. That distinction matters because the trades most likely to violate a risk rule are exactly the trades most likely to be taken in an emotionally elevated state — which is precisely when the internal check is least reliable.
