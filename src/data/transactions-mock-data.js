"use client"

// ─────────────────────────────────────────────
// MOCK TRANSACTION DATA
// All amounts stored as POSITIVE numbers only
// Sign is derived from transaction type during display
// ─────────────────────────────────────────────

const generateMockTransactions = () => {
  const now = new Date()
  const transactions = []

  // Helper: format date with random time
  const randomDate = (daysAgo) => {
    const date = new Date(now)
    date.setDate(date.getDate() - daysAgo)
    date.setHours(Math.floor(Math.random() * 24), Math.floor(Math.random() * 60), 0, 0)
    return date.toISOString()
  }

  // Starting balance
  let currentBalance = 100000 // $100,000 starting

  // ─────────────────────────────────────────
  // DEPOSITS (increase balance, positive display)
  // ─────────────────────────────────────────
  const deposits = [
    { amount: 25000, note: "Initial funding", source: "Bank Transfer" },
    { amount: 10000, note: "Additional capital", source: "Wise" },
    { amount: 5000, note: "Monthly top-up", source: "Bank Transfer" },
    { amount: 15000, note: "Quarterly injection", source: "PayPal" },
    { amount: 7500, note: "Profit reinvestment", source: "Bank Transfer" },
  ]

  deposits.forEach((deposit, i) => {
    currentBalance += deposit.amount
    transactions.push({
      id: `dep-${i + 1}`,
      type: "deposit",
      amount: deposit.amount,
      balanceAfter: currentBalance,
      note: deposit.note,
      source: deposit.source,
      createdAt: randomDate(180 - i * 30),
    })
  })

  // ─────────────────────────────────────────
  // TRADE PROFITS (increase balance, positive display)
  // ─────────────────────────────────────────
  const tradeProfits = [
    { amount: 3200, pair: "EURUSD", session: "london" },
    { amount: 1850, pair: "GBPUSD", session: "new_york" },
    { amount: 4200, pair: "XAUUSD", session: "asian" },
    { amount: 2800, pair: "USDJPY", session: "london" },
    { amount: 5100, pair: "EURUSD", session: "new_york" },
    { amount: 1650, pair: "AUDUSD", session: "asian" },
    { amount: 3900, pair: "GBPUSD", session: "london" },
    { amount: 2450, pair: "USDCAD", session: "new_york" },
    { amount: 3400, pair: "EURUSD", session: "london" },
    { amount: 4100, pair: "XAUUSD", session: "new_york" },
    { amount: 2150, pair: "NZDUSD", session: "asian" },
    { amount: 2800, pair: "GBPUSD", session: "london" },
    { amount: 3750, pair: "EURUSD", session: "new_york" },
    { amount: 1900, pair: "USDCHF", session: "london" },
    { amount: 4600, pair: "XAUUSD", session: "asian" },
    { amount: 3100, pair: "GBPUSD", session: "new_york" },
    { amount: 2600, pair: "EURUSD", session: "london" },
    { amount: 3400, pair: "AUDUSD", session: "asian" },
    { amount: 2900, pair: "USDCAD", session: "new_york" },
    { amount: 4100, pair: "GBPUSD", session: "london" },
  ]

  tradeProfits.forEach((trade, i) => {
    currentBalance += trade.amount
    transactions.push({
      id: `tp-${i + 1}`,
      type: "trade_profit",
      amount: trade.amount,
      balanceAfter: currentBalance,
      note: `${trade.pair} win – ${trade.session.replace("_", " ")} session`,
      source: "Trade",
      createdAt: randomDate(150 - i * 7),
    })
  })

  // ─────────────────────────────────────────
  // WITHDRAWALS (decrease balance, negative display)
  // ─────────────────────────────────────────
  const withdrawals = [
    { amount: 8000, note: "Personal expenses", source: "Bank Transfer" },
    { amount: 5000, note: "Monthly withdrawal", source: "PayPal" },
    { amount: 12000, note: "Quarterly payout", source: "Wise" },
    { amount: 3500, note: "Car purchase", source: "Bank Transfer" },
    { amount: 6000, note: "Holiday fund", source: "Bank Transfer" },
    { amount: 4500, note: "Savings", source: "PayPal" },
    { amount: 7500, note: "Investment elsewhere", source: "Wise" },
    { amount: 9000, note: "Home improvement", source: "Bank Transfer" },
  ]

  withdrawals.forEach((wd, i) => {
    currentBalance -= wd.amount
    transactions.push({
      id: `wd-${i + 1}`,
      type: "withdrawal",
      amount: wd.amount,
      balanceAfter: currentBalance,
      note: wd.note,
      source: wd.source,
      createdAt: randomDate(140 - i * 15),
    })
  })

  // ─────────────────────────────────────────
  // TRADE LOSSES (decrease balance, negative display)
  // ─────────────────────────────────────────
  const tradeLosses = [
    { amount: 1200, pair: "EURUSD", session: "london" },
    { amount: 2100, pair: "GBPUSD", session: "new_york" },
    { amount: 800, pair: "XAUUSD", session: "asian" },
    { amount: 1500, pair: "USDJPY", session: "london" },
    { amount: 2300, pair: "EURUSD", session: "new_york" },
    { amount: 950, pair: "AUDUSD", session: "asian" },
    { amount: 1800, pair: "GBPUSD", session: "london" },
    { amount: 1100, pair: "USDCAD", session: "new_york" },
    { amount: 1400, pair: "EURUSD", session: "london" },
    { amount: 1950, pair: "XAUUSD", session: "asian" },
    { amount: 850, pair: "NZDUSD", session: "asian" },
    { amount: 1700, pair: "GBPUSD", session: "london" },
    { amount: 1250, pair: "EURUSD", session: "new_york" },
    { amount: 900, pair: "USDCHF", session: "london" },
    { amount: 2100, pair: "XAUUSD", session: "new_york" },
    { amount: 1550, pair: "GBPUSD", session: "london" },
    { amount: 1300, pair: "EURUSD", session: "asian" },
    { amount: 1700, pair: "AUDUSD", session: "new_york" },
    { amount: 1450, pair: "USDCAD", session: "london" },
    { amount: 1950, pair: "GBPUSD", session: "asian" },
  ]

  tradeLosses.forEach((loss, i) => {
    currentBalance -= loss.amount
    transactions.push({
      id: `tl-${i + 1}`,
      type: "trade_loss",
      amount: loss.amount,
      balanceAfter: currentBalance,
      note: `${loss.pair} loss – ${loss.session.replace("_", " ")} session`,
      source: "Trade",
      createdAt: randomDate(145 - i * 6),
    })
  })

  // ─────────────────────────────────────────
  // PAYOUTS (decrease balance, negative display)
  // ─────────────────────────────────────────
  const payouts = [
    { amount: 15000, note: "Monthly profit distribution", source: "Prop Firm" },
    { amount: 22000, note: "Quarterly bonus", source: "Prop Firm" },
    { amount: 12000, note: "Performance incentive", source: "Prop Firm" },
    { amount: 18500, note: "Profit share", source: "Prop Firm" },
    { amount: 25000, note: "Annual distribution", source: "Prop Firm" },
  ]

  payouts.forEach((payout, i) => {
    currentBalance -= payout.amount
    transactions.push({
      id: `po-${i + 1}`,
      type: "payout",
      amount: payout.amount,
      balanceAfter: currentBalance,
      note: payout.note,
      source: payout.source,
      createdAt: randomDate(130 - i * 25),
    })
  })

  // Sort by date descending (newest first)
  transactions.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))

  return transactions
}

export const mockTransactions = generateMockTransactions()

// ─────────────────────────────────────────
// TRANSACTION TYPES LIST
// ─────────────────────────────────────────
export const transactionTypes = [
  { value: "all", label: "All Types" },
  { value: "deposit", label: "Deposits" },
  { value: "withdrawal", label: "Withdrawals" },
  { value: "trade_profit", label: "Trade Profits" },
  { value: "trade_loss", label: "Trade Losses" },
  { value: "payout", label: "Payouts" },
]

// ─────────────────────────────────────────
// CHART DATA HELPERS
// ─────────────────────────────────────────

// Balance over time (for line chart)
export const getBalanceHistory = (transactions) => {
  const sorted = [...transactions].sort(
    (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
  )

  return sorted.map((tx) => ({
    date: new Date(tx.createdAt).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }),
    balance: tx.balanceAfter,
    type: tx.type,
    amount: tx.amount,
  }))
}

// Transaction distribution (for pie/bar chart)
export const getTransactionDistribution = (transactions) => {
  const distribution = {
    deposit: 0,
    withdrawal: 0,
    trade_profit: 0,
    trade_loss: 0,
    payout: 0,
  }

  transactions.forEach((tx) => {
    if (distribution[tx.type] !== undefined) {
      distribution[tx.type] += tx.amount
    }
  })

  return Object.entries(distribution).map(([type, value]) => ({
    type,
    value,
    label:
      type === "deposit"
        ? "Deposits"
        : type === "withdrawal"
        ? "Withdrawals"
        : type === "trade_profit"
        ? "Trade Profits"
        : type === "trade_loss"
        ? "Trade Losses"
        : "Payouts",
    color:
      type === "deposit" || type === "trade_profit"
        ? "var(--success)"
        : type === "withdrawal" || type === "trade_loss"
        ? "var(--destructive)"
        : "var(--warning)",
  }))
}

// ─────────────────────────────────────────
// STATS CALCULATIONS
// ─────────────────────────────────────────
export const calculateStats = (transactions) => {
  const currentBalance = transactions.length > 0
    ? transactions[0].balanceAfter
    : 0

  let totalDeposits = 0
  let totalWithdrawals = 0
  let netCashFlow = 0
  let largestTransaction = 0

  transactions.forEach((tx) => {
    if (tx.type === "deposit") {
      totalDeposits += tx.amount
      netCashFlow += tx.amount
    } else if (tx.type === "withdrawal" || tx.type === "payout") {
      totalWithdrawals += tx.amount
      netCashFlow -= tx.amount
    } else if (tx.type === "trade_profit") {
      netCashFlow += tx.amount
    } else if (tx.type === "trade_loss") {
      netCashFlow -= tx.amount
    }

    // Largest transaction (absolute value, positive display)
    if (tx.amount > largestTransaction) {
      largestTransaction = tx.amount
    }
  })

  const totalTransactions = transactions.length

  return {
    currentBalance,
    netCashFlow,
    totalDeposits,
    totalWithdrawals,
    totalTransactions,
    largestTransaction,
  }
}
