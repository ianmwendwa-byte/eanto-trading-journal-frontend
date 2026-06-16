---
title: "What is Volume Profile? POC, Value Area, and HVN/LVN Explained"
slug: "what-is-volume-profile-poc-value-area-explained"
pillar: "volume_order_flow"
priority: 1
primaryKeyword: "volume profile trading"
secondaryKeywords:
  - "point of control trading"
  - "value area trading"
  - "high volume node"
  - "low volume node"
  - "volume profile forex"
faq:
  - question: "What is volume profile in trading?"
    answer: "Volume profile is a charting tool that displays the amount of trading volume that occurred at each price level over a chosen period, shown as a horizontal histogram alongside the price chart."
  - question: "What is the point of control (POC)?"
    answer: "The point of control is the price level within a volume profile that had the highest traded volume, often viewed as the most 'agreed-upon' fair price during that period."
  - question: "What is a value area in volume profile?"
    answer: "The value area is the price range that contains a defined percentage (commonly around 70%) of the total traded volume, representing where most participants transacted."
  - question: "Does volume profile work in forex?"
    answer: "Volume profile can be applied to forex using available tick volume data, though it doesn't represent true traded volume the way it does for centralized exchange instruments like futures or stocks."
kraviqTieIn:
  feature: "Volume Profile Reversal Strategy template and setupCriteria 'volume' category"
  ctaText: "Kraviq's Volume Profile Reversal template uses 'Reaction at POC or HVN' as a required setup criterion - clone it as a starting point for documenting your own volume-based entries."
  linksTo: "/strategies/templates"
relatedStrategyTemplate: "Volume Profile Reversal"
internalLinks:
  - "why-forex-volume-data-is-different"
  - "order-flow-trading-footprint-charts-explained"
  - "institutional-trading-tools-for-retail-traders"
estimatedWordCount: 1900
isCornerstone: false
publishedAt: "2026-06-15"
updatedAt: "2026-06-15"
---

Volume profile turns the conventional price chart inside out. Instead of showing volume as a bar at the bottom of the chart aggregated by time, it shows volume as a horizontal histogram alongside the price chart, revealing how much activity occurred at each price level rather than in each time period. This shift in perspective surfaces information that time-based charts obscure: where the market has genuinely accepted price, where it has rejected it, and where price is likely to slow down or accelerate based on the volume distribution around it.

## What is volume profile?

A standard volume bar tells you how much volume occurred in a given candle period. A volume profile bar tells you how much volume occurred at a given price. The distinction is significant: two candles in the same time period at very different price levels would show the same volume on a standard chart if the volume was equal, but on a volume profile one price level would show more activity, revealing which price attracted more participation, not just when.

## Point of control (POC)

The POC is the price at which the market spent the most time and transacted the most volume. In auction market theory, this represents the most agreed-upon fair value during the profile period. Price tends to be drawn back toward the POC over time, and reactions at the POC (either acceptance and continuation, or rejection and reversal) are among the most watched signals in volume-profile-based trading.

## Value area explained

The value area high (VAH) and value area low (VAL) are the upper and lower boundaries of the accepted-price range (roughly 70% of volume). Price outside the value area is statistically unusual. It represents price where the market did not find consistent two-way participation. Traders watch the value area boundaries for potential reactions when price returns to these levels from outside the accepted range.

## High volume nodes (HVN) and low volume nodes (LVN)

High volume nodes are peaks in the volume profile: areas where substantial participation occurred and price spent significant time. These often act as future support or resistance because the market has proven it will transact at these levels. Low volume nodes are thin areas in the profile where price moved through quickly with little participation, which means they often offer little friction in future passes. Price tends to accelerate through LVNs and decelerate at HVNs.

## How institutions use volume profile

Institutional participants use volume profile as a framework derived from auction market theory: markets continuously auction price up and down seeking the level at which the most two-sided participation occurs. When price moves away from value (below the VAL or above the VAH), the market is exploring a new price area and will either attract participation and build a new value area, or reject and return to the prior accepted range. Institutional traders use this to assess whether current price represents opportunity or extension.

## Trading reactions at POC, HVN, and LVN

A common approach is to wait for price to approach a POC or HVN from outside, then look for a rejection confirmation before entering in the direction of the prior trend or value area. The POC acts as a magnet: if price is above it, there is a statistical pull back toward it; if price is below it, there is similar pull upward. LVNs are used as targets: if price is moving through low-volume areas, it may accelerate until it reaches the next HVN.

## Volume profile in forex: data limitations

Volume profile in its purest form requires centralized volume data, the actual number of contracts traded at each price. Forex, as a decentralized market, does not have this. What is available is tick volume, which measures price change frequency rather than actual transaction size. The next post in this series covers what this means in practice and what forex traders can realistically extract from volume profile concepts using the data that is actually available.
