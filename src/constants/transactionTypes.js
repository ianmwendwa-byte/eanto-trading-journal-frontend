import {
  ArrowDownLeft,
  ArrowUpRight,
  TrendingUp,
  TrendingDown,
  RefreshCw,
  Minus,
  Trophy,
  Gift,
  Plus,
} from "lucide-react";

export const TRANSACTION_DIRECTION = {
  deposit:             "credit",
  withdrawal:          "debit",
  trade_profit:        "credit",
  trade_loss:          "debit",
  swap:                "debit",
  commission:          "debit",
  prop_challenge_fee:  "debit",
  payout:              "credit",
  adjustment_increase: "credit",
  adjustment_decrease: "debit",
};

export const TRANSACTION_LABELS = {
  deposit:             "Deposit",
  withdrawal:          "Withdrawal",
  trade_profit:        "Trade Profit",
  trade_loss:          "Trade Loss",
  swap:                "Swap",
  commission:          "Commission",
  prop_challenge_fee:  "Challenge Fee",
  payout:              "Payout",
  adjustment_increase: "Adjustment +",
  adjustment_decrease: "Adjustment -",
};

export const TRANSACTION_ICONS = {
  deposit:             ArrowDownLeft,
  withdrawal:          ArrowUpRight,
  trade_profit:        TrendingUp,
  trade_loss:          TrendingDown,
  swap:                RefreshCw,
  commission:          Minus,
  prop_challenge_fee:  Trophy,
  payout:              Gift,
  adjustment_increase: Plus,
  adjustment_decrease: Minus,
};

export const TRANSACTION_COLORS = {
  deposit:             "text-[var(--profit)] bg-[var(--profit)]/10",
  withdrawal:          "text-[var(--loss)] bg-[var(--loss)]/10",
  trade_profit:        "text-[var(--profit)] bg-[var(--profit)]/10",
  trade_loss:          "text-[var(--loss)] bg-[var(--loss)]/10",
  swap:                "text-[var(--loss)] bg-[var(--loss)]/10",
  commission:          "text-[var(--loss)] bg-[var(--loss)]/10",
  prop_challenge_fee:  "text-[var(--loss)] bg-[var(--loss)]/10",
  payout:              "text-[var(--profit)] bg-[var(--profit)]/10",
  adjustment_increase: "text-[var(--profit)] bg-[var(--profit)]/10",
  adjustment_decrease: "text-[var(--loss)] bg-[var(--loss)]/10",
};

// Only these types can be manually created by the user
export const MANUAL_TRANSACTION_TYPES = [
  "deposit",
  "withdrawal",
  "prop_challenge_fee",
  "payout",
  "adjustment_increase",
  "adjustment_decrease",
];

export const CATEGORY_LABELS = {
  trading:     "Trading",
  funding:     "Funding",
  fees:        "Fees",
  payouts:     "Payouts",
  adjustments: "Adjustments",
};

export const EVENT_TAG_LABELS = {
  challenge_started: "Challenge Started",
  phase_progression: "Phase Progression",
  payout_received:   "Payout Received",
  account_blown:     "Account Blown",
};

export const SOURCE_LABELS = {
  trade:   "Auto",
  system:  "System",
  ea_sync: "EA",
};
