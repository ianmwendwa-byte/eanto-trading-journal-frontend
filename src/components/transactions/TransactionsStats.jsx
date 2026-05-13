"use client"

import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  Download,
  Upload,
  Activity,
  Award,
} from "lucide-react"

const formatCurrency = (value) => {
  if (Math.abs(value) >= 1000000) {
    return `${(value / 1000000).toFixed(1)}M`
  }
  if (Math.abs(value) >= 1000) {
    return `${(value / 1000).toFixed(0)}K`
  }
  return value.toLocaleString()
}

const formatNumber = (value) => {
  if (value >= 1000000) {
    return `${(value / 1000000).toFixed(1)}M`
  }
  if (value >= 1000) {
    return `${(value / 1000).toFixed(0)}K`
  }
  return value.toLocaleString()
}

const StatsCard = ({
  label,
  value,
  type = "neutral",
  icon: Icon,
  suffix = "",
}) => {
  return (
    <Card
      className={cn(
        "card-elevated transition-all hover:shadow-lg",
        type === "profit" &&
          "bg-success/5 border-success/20 dark:bg-success/10 dark:border-success/30",
        type === "loss" &&
          "bg-destructive/5 border-destructive/20 dark:bg-destructive/10 dark:border-destructive/30",
        type === "neutral" && "bg-muted/30 border-border"
      )}
    >
      <CardContent className="p-4 sm:p-6 flex flex-col gap-4">
        {/* HEADER */}
        <div className="flex items-center justify-between">
          <p className="text-xs sm:text-sm text-muted-foreground font-medium">
            {label}
          </p>

          <div
            className={cn(
              "p-2 rounded-lg",
              type === "profit" && "bg-success/10",
              type === "loss" && "bg-destructive/10",
              type === "neutral" && "bg-muted"
            )}
          >
            <Icon
              className={cn(
                "h-4 w-4 sm:h-5 sm:w-5",
                type === "profit" && "text-success",
                type === "loss" && "text-destructive",
                type === "neutral" && "text-muted-foreground"
              )}
            />
          </div>
        </div>

        {/* VALUE */}
        <div>
          <h3
            className={cn(
              "text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight font-heading",
              type === "profit" && "profit-text",
              type === "loss" && "loss-text",
              type === "neutral" && "text-foreground"
            )}
          >
            {value}
          </h3>

          {suffix && (
            <p className="text-xs text-muted-foreground mt-1">{suffix}</p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

export function TransactionsStats({ stats }) {
  const {
    currentBalance,
    netCashFlow,
    totalDeposits,
    totalWithdrawals,
    totalTransactions,
    largestTransaction,
  } = stats

  // Determine net cash flow type
  const cashFlowType = netCashFlow >= 0 ? "profit" : "loss"

  const formatCurrencyValue = (val) => `$${formatCurrency(val)}`
  const formatNumberValue = (val) => formatNumber(val)

  return (
    <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3 sm:gap-4">
      {/* Current Balance */}
      <StatsCard
        label="Current Balance"
        value={formatCurrencyValue(currentBalance)}
        type="neutral"
        icon={Wallet}
      />

      {/* Net Cash Flow */}
      <StatsCard
        label="Net Cash Flow"
        value={`${netCashFlow >= 0 ? "+" : ""}$${formatCurrency(Math.abs(netCashFlow))}`}
        type={cashFlowType}
        icon={cashFlowType === "profit" ? TrendingUp : TrendingDown}
      />

      {/* Total Deposits */}
      <StatsCard
        label="Total Deposits"
        value={`$${formatCurrency(totalDeposits)}`}
        type="profit"
        icon={Download}
      />

      {/* Total Withdrawals */}
      <StatsCard
        label="Total Withdrawals"
        value={`$${formatCurrency(totalWithdrawals)}`}
        type="loss"
        icon={Upload}
      />

      {/* Total Transactions */}
      <StatsCard
        label="Total Transactions"
        value={formatNumberValue(totalTransactions)}
        type="neutral"
        icon={Activity}
      />

      {/* Largest Transaction */}
      <StatsCard
        label="Largest Transaction"
        value={`$${formatCurrency(largestTransaction)}`}
        type="neutral"
        icon={Award}
      />
    </div>
  )
}
