import {
  Info, AlertTriangle, AlertCircle,
  Shield, Trophy, TrendingUp, Star, Settings,
} from "lucide-react";

export const SEVERITY_CONFIG = {
  info: {
    color:  "blue",
    icon:   Info,
    bg:     "bg-blue-500/10",
    text:   "text-blue-400",
    border: "border-blue-500/20",
  },
  warning: {
    color:  "amber",
    icon:   AlertTriangle,
    bg:     "bg-warning/10",
    text:   "text-warning",
    border: "border-warning/20",
  },
  critical: {
    color:  "red",
    icon:   AlertCircle,
    bg:     "bg-destructive/10",
    text:   "text-destructive",
    border: "border-destructive/20",
  },
};

export const CATEGORY_CONFIG = {
  account_health: {
    label:       "Account Health",
    icon:        Shield,
    description: "Drawdown alerts, EA sync, balance",
  },
  prop_firm: {
    label:       "Prop Firm",
    icon:        Trophy,
    description: "Challenges, payouts, phases",
  },
  trading_activity: {
    label:       "Trading Activity",
    icon:        TrendingUp,
    description: "Trade syncs, CSV imports",
  },
  milestones: {
    label:       "Milestones",
    icon:        Star,
    description: "Trade counts, streaks, score",
  },
  system: {
    label:       "System",
    icon:        Settings,
    description: "Security, API keys, account",
  },
};

export const CATEGORY_TYPES = {
  account_health: [
    "drawdown_warning",
    "daily_drawdown_hit",
    "account_blown",
    "balance_mismatch",
    "ea_sync_offline",
    "ea_sync_online",
  ],
  prop_firm: [
    "challenge_passed",
    "challenge_failed",
    "payout_eligible",
    "phase_progression",
  ],
  trading_activity: [
    "trades_synced",
    "csv_import_complete",
    "csv_import_failed",
    "pattern_detected",
  ],
  milestones: [
    "first_trade",
    "trade_count_milestone",
    "win_streak",
    "profitable_period",
    "business_score_improved",
    "business_score_declined",
  ],
  system: [
    "api_key_generated",
    "api_key_revoked",
    "password_changed",
    "new_login",
    "account_deleted",
  ],
};

export const CRITICAL_TYPES = [
  "account_blown",
  "daily_drawdown_hit",
  "balance_mismatch",
  "password_changed",
  "new_login",
  "account_deleted",
];

export const NOTIFICATION_TYPE_LABELS = {
  drawdown_warning:        "Drawdown Warning",
  daily_drawdown_hit:      "Daily Drawdown Limit Hit",
  account_blown:           "Account Blown",
  balance_mismatch:        "Balance Mismatch",
  ea_sync_offline:         "EA Sync Offline",
  ea_sync_online:          "EA Sync Restored",
  challenge_passed:        "Challenge Passed",
  challenge_failed:        "Challenge Failed",
  payout_eligible:         "Payout Eligible",
  phase_progression:       "Phase Progression",
  trades_synced:           "Trades Synced",
  csv_import_complete:     "CSV Import Complete",
  csv_import_failed:       "CSV Import Failed",
  pattern_detected:        "Pattern Detected",
  first_trade:             "First Trade",
  trade_count_milestone:   "Trade Milestone",
  win_streak:              "Win Streak",
  profitable_period:       "Profitable Period",
  api_key_generated:       "EA Key Generated",
  api_key_revoked:         "EA Key Revoked",
  password_changed:        "Password Changed",
  new_login:               "New Login",
  account_deleted:         "Account Deleted",
  business_score_improved: "Score Improved",
  business_score_declined: "Score Declined",
};

export const NOTIFICATION_TYPE_DESCRIPTIONS = {
  drawdown_warning:        "Triggered when drawdown approaches your limit",
  daily_drawdown_hit:      "Triggered when daily drawdown limit is reached",
  account_blown:           "Triggered when account reaches maximum drawdown",
  balance_mismatch:        "Triggered when EA balance doesn't match records",
  ea_sync_offline:         "Triggered when EA stops sending data",
  ea_sync_online:          "Triggered when EA reconnects and syncs",
  challenge_passed:        "Triggered when you pass a challenge phase",
  challenge_failed:        "Triggered when a challenge phase fails",
  payout_eligible:         "Triggered when you become eligible for payout",
  phase_progression:       "Triggered when you advance to the next phase",
  trades_synced:           "Triggered when EA syncs new trades",
  csv_import_complete:     "Triggered when CSV import finishes successfully",
  csv_import_failed:       "Triggered when CSV import encounters errors",
  pattern_detected:        "Triggered when a trading pattern is detected",
  first_trade:             "Triggered when you log your first trade",
  trade_count_milestone:   "Triggered at 10, 50, 100, 250, 500 trades",
  win_streak:              "Triggered when you reach a win streak",
  profitable_period:       "Triggered when you complete a profitable period",
  api_key_generated:       "Triggered when a new EA API key is created",
  api_key_revoked:         "Triggered when an EA API key is revoked",
  password_changed:        "Triggered when your password changes",
  new_login:               "Triggered when a new login is detected",
  account_deleted:         "Triggered when an account is deleted",
  business_score_improved: "Triggered when your business score improves",
  business_score_declined: "Triggered when your business score declines",
};
