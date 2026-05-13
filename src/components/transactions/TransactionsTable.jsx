"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { SearchX, FilterX, Plus } from "lucide-react"

// Get badge variant based on transaction type
const getTypeBadgeVariant = (type) => {
  switch (type) {
    case "deposit":
    case "trade_profit":
      return "outline" // will apply custom colors
    case "withdrawal":
    case "trade_loss":
      return "outline"
    case "payout":
      return "outline"
    default:
      return "outline"
  }
}

// Get type display name
const getTypeLabel = (type) => {
  switch (type) {
    case "deposit":
      return "Deposit"
    case "withdrawal":
      return "Withdrawal"
    case "trade_profit":
      return "Trade Profit"
    case "trade_loss":
      return "Trade Loss"
    case "payout":
      return "Payout"
    default:
      return type || "Unknown"
  }
}

// Get type-specific styles for badge
const getTypeStyles = (type) => {
  switch (type) {
    case "deposit":
    case "trade_profit":
      return "bg-success/10 text-success border-success/20"
    case "withdrawal":
    case "trade_loss":
      return "bg-destructive/10 text-destructive border-destructive/20"
    case "payout":
      return "bg-warning/10 text-warning border-warning/20"
    default:
      return "bg-muted text-muted-foreground border-border"
  }
}

// Get amount class
const getAmountClass = (type) => {
  switch (type) {
    case "deposit":
    case "trade_profit":
      return "profit-text"
    case "withdrawal":
    case "trade_loss":
      return "loss-text"
    case "payout":
      return "breakeven-text"
    default:
      return "text-foreground"
  }
}

// Format amount with sign based on type
const formatAmount = (amount, type) => {
  let displayAmount = amount

  if (type === "withdrawal" || type === "trade_loss" || type === "payout") {
    displayAmount = -Math.abs(amount)
  } else {
    displayAmount = Math.abs(amount)
  }

  const sign = displayAmount >= 0 ? "+" : ""
  return `${sign}$${displayAmount.toLocaleString()}`
}

// Format date
const formatDate = (dateString) => {
  if (!dateString) return "N/A"
  const date = new Date(dateString)
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  })
}

export function TransactionsTable({ transactions, emptyState = "all", onResetFilters, onAddTransaction }) {
  // No loading state - mock data is synchronous
  // If implemented loading in future, add isLoading prop

  if (transactions.length === 0) {
    // ── EMPTY STATE VARIATIONS ──
    let icon = null
    let title = "No transactions"
    let description = "Your transaction history is empty."
    let action = null

    switch (emptyState) {
      case "search":
        icon = <SearchX className="h-8 w-8 text-muted-foreground" />
        title = "No search results"
        description = "We couldn't find any transactions matching your search. Try a different term."
        action = (
          <Button variant="outline" size="sm" onClick={onResetFilters}>
            Clear search
          </Button>
        )
        break

      case "filter":
        icon = <FilterX className="h-8 w-8 text-muted-foreground" />
        title = "No matching transactions"
        description = "No transactions match the selected filters. Try adjusting your criteria."
        action = (
          <Button variant="outline" size="sm" onClick={onResetFilters}>
            Reset filters
          </Button>
        )
        break

      case "all":
      default:
        icon = (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="h-8 w-8 text-muted-foreground"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        )
        description = "Your transaction history will appear here once you start adding transactions."
        action = (
          <Button size="sm" className="mt-2" onClick={onAddTransaction}>
            <Plus className="h-4 w-4 mr-2" />
            Add Transaction
          </Button>
        )
    }

    return (
      <Card className="card-elevated">
        <CardContent className="py-12">
          <div className="flex flex-col items-center justify-center text-center space-y-4 max-w-md mx-auto">
            <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center">
              {icon}
            </div>
            <div>
              <h3 className="text-lg font-semibold text-foreground">{title}</h3>
              <p className="text-sm text-muted-foreground mt-1">{description}</p>
            </div>
            {action && <div>{action}</div>}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="card-elevated">
      <CardHeader className="border-b border-border">
        <CardTitle className="font-heading">Transaction History</CardTitle>
      </CardHeader>

      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-muted/30">
              <TableRow>
                <TableHead className="w-[140px] font-medium">Date</TableHead>
                <TableHead className="w-[140px] font-medium">Type</TableHead>
                <TableHead className="w-[160px] font-medium text-right">Amount</TableHead>
                <TableHead className="w-[160px] font-medium text-right">
                  Balance After
                </TableHead>
                <TableHead className="min-w-[200px] font-medium">Description</TableHead>
                <TableHead className="w-[120px] font-medium">Source</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {transactions.map((tx) => {
                const typeStyles = getTypeStyles(tx.type)
                const amountClass = getAmountClass(tx.type)

                return (
                  <TableRow
                    key={tx.id}
                    className="group hover:bg-muted/40 transition-colors"
                  >
                    {/* DATE */}
                    <TableCell className="text-xs sm:text-sm text-muted-foreground">
                      {formatDate(tx.createdAt)}
                    </TableCell>

                    {/* TYPE */}
                    <TableCell>
                      <Badge
                        variant={getTypeBadgeVariant(tx.type)}
                        className={cn("text-xs font-normal border", typeStyles)}
                      >
                        {getTypeLabel(tx.type)}
                      </Badge>
                    </TableCell>

                    {/* AMOUNT */}
                    <TableCell
                      className={cn(
                        "text-right font-mono text-sm font-medium",
                        amountClass
                      )}
                    >
                      {formatAmount(tx.amount, tx.type)}
                    </TableCell>

                    {/* BALANCE AFTER */}
                    <TableCell className="text-right font-mono text-sm text-foreground">
                      ${(tx.balanceAfter || 0).toLocaleString()}
                    </TableCell>

                    {/* DESCRIPTION / NOTE */}
                    <TableCell className="text-sm text-muted-foreground truncate max-w-[250px]">
                      {tx.note || "—"}
                    </TableCell>

                    {/* SOURCE */}
                    <TableCell className="text-sm text-muted-foreground">
                      {tx.source || "—"}
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}
