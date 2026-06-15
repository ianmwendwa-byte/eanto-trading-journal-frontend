---
title: "Liquidity Sweeps Explained (ICT Kill Zones)"
slug: "liquidity-sweeps-explained-ict-kill-zones"
pillar: "ict_smc"
priority: 2
primaryKeyword: "liquidity sweep"
secondaryKeywords:
  - "stop hunt trading"
  - "ICT kill zones"
  - "liquidity grab"
  - "London kill zone"
  - "New York kill zone"
faq:
  - question: "What is a liquidity sweep?"
    answer: "A liquidity sweep occurs when price briefly moves beyond a level where many orders (such as stop losses) are clustered, triggering those orders before often reversing direction."
  - question: "What are ICT kill zones?"
    answer: "ICT kill zones are specific time windows (most commonly around the London and New York session opens) when increased volatility and institutional activity make certain setups more likely to play out."
  - question: "How do you trade a liquidity sweep?"
    answer: "Rather than predicting a sweep, many traders wait for it to occur and then look for confirmation of a reversal, such as a market structure shift, before entering in the new direction."
  - question: "How can I avoid getting stopped out by liquidity hunts?"
    answer: "Placing stops slightly beyond obvious clustering points (such as just past a recent swing high/low) rather than directly at them can reduce the chance of being caught in a sweep."
kraviqTieIn:
  feature: "Strategy setupCriteria (liquidity category), killzones field, and sessions array"
  ctaText: "The ICT Silver Bullet template in Kraviq is built around the London kill zone with 'liquidity sweep before entry' as a required setup criterion: assign it to an account and every trade's session and setup gets checked automatically."
  linksTo: "/strategies/templates"
relatedStrategyTemplate: "ICT Silver Bullet"
internalLinks:
  - "what-is-a-fair-value-gap-ict"
  - "order-blocks-explained-beginners-guide"
  - "is-ict-trading-still-relevant-2026"
estimatedWordCount: 1900
isCornerstone: false
publishedAt: "2026-06-14"
updatedAt: "2026-06-15"
---

Liquidity sweeps are one of the most frequently discussed concepts in ICT methodology, and one of the most frequently misused as a basis for entries. The idea that price "hunts stops" before reversing is well-known in retail trading communities, but knowing that it happens and knowing how to trade it are two different things.

## What is Liquidity in Trading?

In ICT and Smart Money Concepts terminology, liquidity refers to the pools of resting orders that accumulate at predictable price levels. These are not conceptual. They are actual orders waiting to be triggered at specific prices. Stop losses from long positions cluster just below recent swing lows. Stop losses from short positions cluster just above recent swing highs. Pending orders accumulate near round numbers and prior session extremes.

From an institutional perspective, these clustered orders represent the liquidity needed to fill large positions. A large buyer needs a large number of sellers to take the other side of the trade. When retail stop losses trigger at a swing low, those stop-loss sell orders provide exactly that opposing volume. The sweep is not necessarily adversarial from a structural standpoint. It is a mechanism by which large orders get filled at the institutional level using the liquidity that retail positions provide.

## Liquidity Sweep vs Stop Hunt: Same Thing?

The terms "liquidity sweep" and "stop hunt" are used interchangeably in most retail trading communities, and for practical purposes they describe the same phenomenon: price moves beyond a level where orders are clustered, triggers those orders, and often reverses. The ICT framing (liquidity sweep) emphasizes the institutional mechanism: large participants are using retail stop orders as the other side of their position entries. The "stop hunt" framing is more retail-centric and carries an adversarial implication.

The practical trading observation is identical in both cases: price overshoots a predictable level and then reverses, which creates a potential entry opportunity for traders who recognize the pattern and wait for confirmation rather than getting caught in the move itself.

## Where Liquidity Pools Typically Form

Liquidity pools form wherever retail traders predictably place orders. The most common locations are:

**Prior day's high and low**: many traders use these as reference points for stops and pending entries, creating a predictable cluster just beyond these levels.

**Session highs and lows**: the extremes of the Asian, London, or New York sessions represent levels where a large number of retail positions were initiated or protected.

**Equal highs and equal lows**: levels where price has tested the same point multiple times without breaking through. Each failed test creates another cluster of stops just beyond the level, since traders place stops there expecting the level to hold.

**Round numbers**: psychological levels like 1.1000, 1.0850, or 2000 on gold attract orders simply because of their memorability. The clustering of orders at these levels is not based on technical significance. It is based on cognitive convenience.

ICT methodology emphasizes that these levels are not random technical resistance. They are locations where orders are mechanically concentrated, which makes them targets for institutional activity when the firm needs to fill large orders.

## ICT Kill Zones Explained

ICT kill zones are specific time windows during which institutional activity is concentrated, making certain setups (including liquidity sweeps) more likely to produce clean directional moves afterward. The three primary kill zones are:

**London Open** (approximately 02:00–05:00 AM EST): the most active kill zone for major forex pairs, particularly EURUSD and GBPUSD.

**New York Open** (07:00–10:00 AM EST): a second high-activity window, especially relevant for USD pairs and the period of overlap with the London session.

**London Close** (10:00 AM–12:00 PM EST): a shorter but often active period as London traders close positions and New York liquidity adjusts.

The Asian session (07:00–09:00 PM EST) is often treated as a range-setting period rather than an active kill zone. Price tends to consolidate within a relatively tight range, establishing highs and lows that become liquidity targets for the London Open sweep.

The logic behind timing is that institutional order flow is concentrated when major financial centers are actively operating. A liquidity sweep during a kill zone is more likely to produce a clean, purposeful reversal than a sweep occurring during a low-liquidity period when the directional follow-through is less reliable.

## How to Trade AFTER a Liquidity Sweep (Not Before)

The fundamental error that retail traders make with liquidity sweeps is attempting to predict them rather than react to them. Placing a long trade "because price should sweep the lows and reverse" before the sweep occurs simply means you are caught in the sweep itself. Your stop loss may be at exactly the level that gets triggered.

The higher-probability approach is reaction-based: wait for the sweep to occur (price spikes beyond the obvious level, triggering the expected stops), then wait for a confirmation signal that the reversal has begun. Confirmation signals include a strong rejection candle forming at or below the sweep level, a lower-timeframe market structure shift (a break of a recent short-term swing high after the sweep), or an FVG or order block aligning with the reversal point.

You sacrifice the very first pip movement after the sweep, but you dramatically improve the probability of being on the right side of the resulting move. The entry is later; the confidence is higher.

## Avoiding Becoming the Liquidity Yourself

The most practical takeaway from the liquidity concept is in stop placement. If you place your stop loss directly at a prior swing high or low, you are placing it at exactly the level where liquidity is expected to be swept. The institutional move does not need to go far to stop you out, just far enough to trigger the clustered orders at that obvious level, which your stop is now part of.

A small but deliberate adjustment (placing your stop a few pips beyond the obvious level rather than at it) removes you from the liquidity pool that the sweep is designed to trigger. This does not mean using arbitrarily wider stops; it means being deliberate about placing your stop where it would only be hit if the trade thesis is genuinely wrong, rather than at the predictable clustering zone that routinely gets swept before price reverses.

## Combining Liquidity Sweeps with FVG/Order Blocks

The highest-confluence entry model in ICT methodology combines three elements: a liquidity sweep (confirmation that the stops have been run), a fair value gap or order block at the reversal point (a technical reason for the reversal beyond just the sweep itself), and kill zone timing (the event happens during an active institutional window).

When all three align, the entry has multiple independent reasons to work. A sweep without an FVG or order block is less precise as an entry zone. You know the stops were run but you do not have a specific price level to frame the entry. An order block without a sweep is unconfirmed. The zone is potentially significant, but there is no evidence yet that institutional activity has engaged there. Timing outside a kill zone reduces the probability of a clean, directional move following the setup.

The combination is what separates a high-quality ICT setup from a pattern that merely resembles one.
