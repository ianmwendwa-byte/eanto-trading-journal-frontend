---
title: "Daily Drawdown vs Max Drawdown: Why It Matters"
slug: "daily-drawdown-vs-max-drawdown-explained"
pillar: "prop_firm_rules"
priority: 1
primaryKeyword: "daily drawdown vs max drawdown"
secondaryKeywords:
  - "prop firm drawdown rules"
  - "what is daily drawdown"
  - "max drawdown prop firm"
  - "drawdown breach"
  - "floating loss drawdown"
faq:
  - question: "What's the difference between daily and max drawdown?"
    answer: "Daily drawdown limits how much your account can lose within a single trading day (often resetting at a set time), while max drawdown is the total decline allowed across the entire account's lifetime."
  - question: "Does daily drawdown reset every day?"
    answer: "Yes, in most prop firm models the daily drawdown limit resets at a defined time each day, typically based on the broker's server time or midnight UTC."
  - question: "What happens if I breach daily drawdown?"
    answer: "Depending on the firm, breaching daily drawdown can result in an immediate account violation and failure of the evaluation or funded account."
  - question: "Does floating (unrealized) loss count toward drawdown?"
    answer: "For most prop firms, yes. Equity-based drawdown calculations include open, unrealized losses, not just closed trade results."
kraviqTieIn:
  feature: "propRules (dailyDrawdownPercent, maxDrawdownPercent, softBreachPercent) and the MAX_DAILY_DRAWDOWN_EXCEEDED compliance check"
  ctaText: "Kraviq tracks your real-time drawdown against your exact prop firm's daily and max limits automatically, flagging violations the moment they happen rather than after your account is already breached."
  linksTo: "/features/compliance"
relatedStrategyTemplate: null
internalLinks:
  - "5-reasons-traders-fail-prop-firm-challenges"
  - "how-to-track-multiple-prop-firm-accounts"
estimatedWordCount: 1600
isCornerstone: false
publishedAt: "2026-06-14"
updatedAt: "2026-06-15"
---

Of all the rules that govern prop firm evaluations, drawdown rules are the ones that end accounts most abruptly, not because traders set out to violate them, but because the calculations are more complex than they appear. Knowing the difference between daily drawdown and maximum drawdown, understanding how each is calculated, and tracking both in real time are among the most important operational tasks for any trader running a funded or evaluation account.

## What is Drawdown in Trading?

Drawdown is the decline in your account value from a prior peak, expressed as a percentage. If your account reaches $110,000 and then falls to $99,000, you have experienced a 10% drawdown from peak. In the context of prop firm evaluations, drawdown is the most critical rule category to understand, not because losing is unexpected, but because prop firms impose hard numerical limits on how much decline they will tolerate before disqualifying an account.

Understanding the difference between daily and maximum drawdown is the starting point for managing any evaluation or funded account without surprises.

## Daily Drawdown Explained

Daily drawdown limits how much your account can decline within a single trading day. Most prop firms set this between 4% and 6% of your starting balance or your balance at the start of that day. The limit typically resets at a defined time (often the broker's server time at midnight, or midnight UTC) regardless of what happened during that day.

The reason firms impose daily drawdown is to prevent a single catastrophic session from eliminating an entire challenge in one sitting. Even if your overall drawdown headroom is 10%, the daily limit forces you to slow down and reassess if you lose a significant percentage in a single session. From the firm's risk management perspective, a trader who loses 8% in one day is behaving very differently from a trader who loses 8% over two months, and the firm wants to differentiate between those patterns.

## Max (Overall) Drawdown Explained

Maximum drawdown (also called overall drawdown or trailing drawdown depending on the firm) is the total decline permitted across the entire account's lifetime. Typical limits range from 8% to 12% of the initial balance. The key distinction from daily drawdown is that it accumulates: each losing day chips away at the total headroom, and unlike the daily limit, it does not reset.

Some firms use a "trailing" max drawdown, which means the ceiling adjusts upward as your account grows, making it possible to increase your safety buffer as you profit. If your account grows from $100,000 to $110,000, a trailing max drawdown recalculates from the new high, giving you $110,000 minus 10% = $99,000 as your floor rather than the original $90,000. Understanding whether your firm uses a static or trailing max drawdown calculation materially changes how you should size positions as the challenge progresses.

## Soft Breach vs Hard Breach

Some prop firms introduce a soft breach threshold, a warning level that triggers before the hard disqualification. For example, a firm might flag your account when you reach 80% of your daily drawdown limit, giving you a visible warning before the account is actually breached. This is similar in spirit to a three-tier warning system: yellow at 70% of available drawdown headroom, orange at 85%, and red at 95%, each providing increasing urgency as you approach a breach.

Not all firms offer soft breach warnings, and the absence of one means your first notification of a problem may be account closure. Relying on your broker's platform to tell you when you are close to a limit is a common and dangerous assumption. The MetaTrader terminal does not track prop firm drawdown rules natively.

## The Floating P&L Trap

Many traders are surprised to discover that their open, unrealized losses count toward drawdown in most equity-based prop firm calculations. This is the floating P&L trap. If you have two losing trades open simultaneously that together represent -3% of your account, you may already be at 75% of your daily drawdown limit before you close a single position.

This means that widening your stop losses mid-trade or adding to losing positions is doubly dangerous under prop firm rules. The floating equity impact can trigger a daily drawdown breach before the trade even closes. The account can fail while the position is still open. This is one of the most common sources of unexpected violations among traders who understand their rules in principle but do not track the equity impact of open positions in real time.

## How to Calculate Your Real-Time Drawdown

To calculate daily drawdown manually: take your account balance at the start of the day (or your peak balance that day, depending on your firm's calculation method), subtract your current equity (which includes open positions) then divide by the starting figure.

Example: start-of-day balance $100,000, current equity $96,000. Daily drawdown = (100,000 − 96,000) ÷ 100,000 = 4%. If your daily limit is 5%, you have 1% remaining, $1,000 of headroom. That $1,000 can evaporate quickly if an open position moves against you by even a small amount.

This calculation needs to be running in real time, not checked once at the end of the day. A drawdown breach happens intra-trade, not at session close.

## Why Manual Tracking Fails

Spreadsheets and manual drawdown trackers fail for a specific structural reason: they are updated at trade close, not in real time. Drawdown violations happen intra-trade. A single position moving against you beyond your daily limit will breach the account before you have time to update a spreadsheet.

The calculation also changes moment to moment with market prices. A spreadsheet updated at 9:00 AM reflects the account state at 9:00 AM; at 9:07 AM, when an open position has moved 30 pips against you, the spreadsheet is no longer accurate. The only reliable approach is a system that reads your current equity against your defined limits on a per-trade basis, with warnings before thresholds are approached rather than after they are crossed.
