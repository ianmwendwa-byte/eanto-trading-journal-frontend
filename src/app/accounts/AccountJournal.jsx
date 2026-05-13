"use client"

import { useMemo, useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { toast } from "sonner"

import {
  ChevronLeft,
  ChevronRight,
  CircleDollarSign,
  CircleUser,
  Clock3,
  Download,
  Filter,
  Info,
  Plus,
  TrendingDown,
  TrendingUp,
} from "lucide-react"

import { Button } from "@/components/ui/button"

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"

import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

import { Badge } from "@/components/ui/badge"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

import { accountApi, tradeApi, transactionApi } from "@/app/services/api"

// ─────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────
const getDayFromDate = (dateStr) => {
  if (!dateStr) return 1
  const date = new Date(dateStr)
  return date.getDate()
}

const getDayTrades = (trades, day) => {
  return trades.filter((trade) => getDayFromDate(trade.createdAt) === day)
}

const getDayStatus = (dayTrades) => {
  const total = dayTrades.reduce(
    (sum, trade) => sum + (trade.pnl || 0),
    0
  )

  if (total > 0) return "success"

  if (total < 0) return "danger"

  return "info"
}

const statusClasses = {
  success:
    "border-success/20 bg-success/10 hover:bg-success/15",

  danger:
    "border-danger/20 bg-danger/10 hover:bg-danger/15",

  info:
    "border-info/20 bg-info/10 hover:bg-info/15",
}

// ─────────────────────────────────────────────
// PAGE
// ─────────────────────────────────────────────
export default function AccountJournal() {
  const { accountId } = useParams()
  const navigate = useNavigate()

   const [loading, setLoading] = useState(true)
   const [account, setAccount] = useState(null)
   const [trades, setTrades] = useState([])
   const [transactions, setTransactions] = useState([])
   const [transactionPagination, setTransactionPagination] = useState({
     total: 0,
     page: 1,
     limit: 20,
     pages: 1
   })
   const [selectedDay, setSelectedDay] = useState(null)
   const [open, setOpen] = useState(false)
   const [accountDetailsOpen, setAccountDetailsOpen] = useState(false)

   // Transaction filters and sort (UI state only)
   const [txFilter, setTxFilter] = useState("all")
   const [txSort, setTxSort] = useState({ field: "createdAt", order: "desc" })
   const [txPage, setTxPage] = useState(1)
   const [txLimit, setTxLimit] = useState(20)

   // Build query params string (UI state only)
   const txQueryParams = useMemo(() => {
     const params = new URLSearchParams()
     params.append("page", txPage.toString())
     params.append("limit", txLimit.toString())
     if (txFilter !== "all") {
       params.append("type", txFilter)
     }
     // Always sort by createdAt only (backend limitation)
     params.append("sort", `${txSort.order === "desc" ? "-" : ""}createdAt`)
     return params.toString()
   }, [txPage, txLimit, txFilter, txSort])

   // ───────────────── FETCH DATA ─────────────────
   useEffect(() => {
     const fetchData = async () => {
       try {
         setLoading(true)

         const [accountRes, tradesRes, transactionsRes] =
           await Promise.all([
             accountApi.getOne(accountId),
             tradeApi.getByAccount(accountId),
             transactionApi.getByAccount(accountId, txQueryParams),
           ])

         setAccount(accountRes || {})
         setTrades(tradesRes || [])
         setTransactions(transactionsRes?.data || [])
         setTransactionPagination(transactionsRes?.pagination || {
           total: 0,
           page: 1,
           limit: 20,
           pages: 1
         })
       } catch (err) {
         console.error(err)
         toast.error(
           err?.response?.data?.message ||
             err?.message ||
             "Failed to load journal data"
         )
       } finally {
         setLoading(false)
       }
     }

     if (accountId) {
       fetchData()
     }
   }, [accountId, txQueryParams])

  // ───────────────── STATS FROM API ─────────────────
  const totalPnl = account?.performance?.totalPnl ?? 0
  const winRate = account?.performance?.winRate ?? 0
  const profitFactor = account?.performance?.profitFactor ?? 0
  const largestWin = account?.performance?.largestWin ?? 0
  const largestLoss = account?.performance?.largestLoss ?? 0
  const totalTrades = account?.performance?.totalTrades ?? 0

  const selectedTrades = useMemo(() => {
    if (!selectedDay) return []
    return getDayTrades(trades, selectedDay)
  }, [trades, selectedDay])

  // ───────────────── CALENDAR DAYS (1–31) ─────────────────
  const calendarDays = useMemo(
    () => Array.from({ length: 31 }, (_, i) => i + 1),
    []
  )

  // ───────────────── RENDERING ─────────────────
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-muted-foreground">Loading journal...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* ───────────────── HEADER ───────────────── */}
<div className="px-6 pt-6">
  <div className="max-w-7xl mx-auto space-y-4">

     {/* TOP ACTION BAR */}
     <div className="flex items-center justify-between">
       <Button
         type="button"
         variant="ghost"
         size="icon"
         onClick={() => navigate(-1)}
         className="shrink-0"
       >
         <ChevronLeft className="h-4 w-4" />
       </Button>
     </div>

    {/* MAIN HEADER CARD */}
    <div className="trading-card bg-card/70 backdrop-blur-xl overflow-hidden">
      <div className="p-6">

        <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">

          {/* LEFT */}
          <div className="space-y-3">

            <div className="flex items-center gap-3 flex-wrap">

              <Badge className="bg-primary text-primary-foreground border-0">
                {account?.type || "UNKNOWN"}
              </Badge>

              <Badge
                variant="outline"
                className="bg-success/10 text-success border-success/20"
              >
                ACTIVE
              </Badge>

            </div>

            <div>

              <h1 className="text-xl lg:text-2xl font-heading">
                {account?.name || "Unnamed Account"}
              </h1>

              <p className="text-muted-foreground mt-1">
                {account?.type === "PROP ACCOUNT"
                ? account?.propFirm?.firmName
                : account?.broker || "Unknown broker"}
              </p>

            </div>

          </div>

           {/* RIGHT */}
           <div className="flex flex-wrap items-center gap-3">

             <Button
               type="button"
               variant="outline"
               onClick={() => {
                 setAccountDetailsOpen(true)
               }}
             >
               Account Details
             </Button>

             <Button type="button" variant="outline">
               <Download className="h-4 w-4 mr-2" />
               Export
             </Button>

             <Button type="button" variant="outline">
               <Filter className="h-4 w-4 mr-2" />
               Filters
             </Button>

             <Button
               type="button"
               onClick={() =>
                 navigate(`/trades/add/${accountId}`)
               }
             >
               <Plus className="h-4 w-4 mr-2" />
               Add Trade
             </Button>

           </div>

        </div>

        {/* STATS */}
        <div className="grid grid-cols-2 xl:grid-cols-5 gap-4 mt-6">

          <Card className="trading-card">
            <CardContent className="p-4">

              <div className="flex items-center justify-between">

                <div>
                  <p className="text-muted-foreground text-sm">
                    Net PnL
                  </p>

                  <h3
                    className={`text-2xl trading-number mt-1 ${
                      totalPnl >= 0
                        ? "profit-text"
                        : "loss-text"
                    }`}
                  >
                    {totalPnl >= 0 ? "+" : ""}
                    ${totalPnl.toLocaleString()}
                  </h3>
                </div>

                <div className="size-10 rounded-xl bg-success/10 flex items-center justify-center">
                  <TrendingUp className="h-5 w-5 text-success" />
                </div>

              </div>

            </CardContent>
          </Card>

          <Card className="trading-card">
            <CardContent className="p-4">

              <div className="flex items-center justify-between">

                <div>
                  <p className="text-muted-foreground text-sm">
                    Win Rate
                  </p>

                  <h3 className="text-2xl trading-number mt-1">
                    {winRate}%
                  </h3>
                </div>

                <div className="size-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <CircleDollarSign className="h-5 w-5 text-primary" />
                </div>

              </div>

            </CardContent>
          </Card>

          <Card className="trading-card">
            <CardContent className="p-4">

              <div className="flex items-center justify-between">

                <div>
                  <p className="text-muted-foreground text-sm">
                    Trades
                  </p>

                  <h3 className="text-2xl trading-number mt-1">
                    {totalTrades}
                  </h3>
                </div>

                <div className="size-10 rounded-xl bg-info/10 flex items-center justify-center">
                  <Clock3 className="h-5 w-5 text-info" />
                </div>

              </div>

            </CardContent>
          </Card>

          <Card className="trading-card">
            <CardContent className="p-4">

              <div className="flex items-center justify-between">

                <div>
                  <p className="text-muted-foreground text-sm">
                    Best Trade
                  </p>

                  <h3 className="text-2xl trading-number mt-1 profit-text">
                    +{Math.abs(largestWin).toLocaleString()}
                  </h3>
                </div>

                <div className="size-10 rounded-xl bg-success/10 flex items-center justify-center">
                  <TrendingUp className="h-5 w-5 text-success" />
                </div>

              </div>

            </CardContent>
          </Card>

          <Card className="trading-card">
            <CardContent className="p-4">

              <div className="flex items-center justify-between">

                <div>
                  <p className="text-muted-foreground text-sm">
                    Worst Trade
                  </p>

                  <h3 className="text-2xl trading-number mt-1 loss-text">
                    {Math.abs(largestLoss).toLocaleString()}
                  </h3>
                </div>

                <div className="size-10 rounded-xl bg-danger/10 flex items-center justify-center">
                  <TrendingDown className="h-5 w-5 text-danger" />
                </div>

              </div>

            </CardContent>
          </Card>

        </div>

      </div>
    </div>

  </div>
</div>

      {/* ───────────────── CONTENT ───────────────── */}
      <div className="max-w-7xl mx-auto px-6 py-6 space-y-6">
        {/* CALENDAR */}
        <Card className="trading-card overflow-hidden">
          <CardHeader className="border-b border-border">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Trading Calendar</CardTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  Monthly execution and performance overview
                </p>
              </div>

              <div className="flex items-center gap-2">
                <Button type="button" variant="outline" size="icon">
                  <ChevronLeft className="h-4 w-4" />
                </Button>

                <div className="px-4">
                  <p className="font-medium">
                    {new Date().toLocaleString("default", {
                      month: "long",
                      year: "numeric",
                    })}
                  </p>
                </div>

                <Button type="button" variant="outline" size="icon">
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-0">
            {/* WEEKDAYS */}
            <div className="grid grid-cols-7 border-b border-border">
              {[
                "Sun",
                "Mon",
                "Tue",
                "Wed",
                "Thu",
                "Fri",
                "Sat",
              ].map((day) => (
                <div
                  key={day}
                  className="p-4 text-sm font-medium text-muted-foreground border-r border-border last:border-r-0"
                >
                  {day}
                </div>
              ))}
            </div>

            {/* CALENDAR GRID */}
            <div className="grid grid-cols-7">
              {calendarDays.map((day) => {
                const dayTrades = getDayTrades(trades, day)
                const hasTrades = dayTrades.length > 0
                const status = getDayStatus(dayTrades)

                 return (
                   <button
                     type="button"
                     key={day}
                     onClick={() => {
                       if (!hasTrades) return
                       setSelectedDay(day)
                       setOpen(true)
                     }}
                     className={`relative h-34 border-r border-b border-border p-3 text-left transition-all ${
                       hasTrades
                         ? statusClasses[status]
                         : "hover:bg-muted/40"
                     }`}
                   >
                    {/* DAY */}
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">{day}</span>

                      {dayTrades.length > 2 && (
                        <Badge className="h-5 px-1.5 bg-primary text-primary-foreground text-[10px] border-0">
                          +2
                        </Badge>
                      )}
                    </div>

                    {/* TRADE DOTS */}
                    <div className="flex flex-wrap gap-1 mt-4">
                      {dayTrades.slice(0, 3).map((trade) => (
                        <div
                          key={trade._id || trade.id}
                          className={`h-2 w-2 rounded-full ${
                            trade.type === "win"
                              ? "bg-success"
                              : trade.type === "loss"
                              ? "bg-danger"
                              : "bg-info"
                          }`}
                        />
                      ))}
                    </div>

                    {/* PNL */}
                    {hasTrades && (
                      <div className="absolute bottom-3 left-3">
                        <p
                          className={`text-sm trading-number ${
                            status === "success"
                              ? "profit-text"
                              : status === "danger"
                              ? "loss-text"
                              : "text-info"
                          }`}
                        >
                          {dayTrades.reduce(
                            (sum, trade) => sum + (trade.pnl || 0),
                            0
                          ) > 0
                            ? "+"
                            : ""}
                          $
                          {dayTrades.reduce(
                            (sum, trade) => sum + (trade.pnl || 0),
                            0
                          )}
                        </p>
                      </div>
                    )}
                  </button>
                )
              })}
            </div>
          </CardContent>
        </Card>

        {/* TRANSACTIONS TABLE */}
        <Card className="trading-card">
          <CardHeader className="border-b border-border">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Transactions</CardTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  Account activity and fund movements
                </p>
              </div>

               <div className="flex items-center gap-2">
                  <Select value={txFilter} onValueChange={(val) => {
                    setTxFilter(val)
                    setTxPage(1)
                  }}>
                    <SelectTrigger className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="deposit">Deposits</SelectItem>
                      <SelectItem value="withdrawal">Withdrawals</SelectItem>
                      <SelectItem value="transfer">Transfers</SelectItem>
                      <SelectItem value="trade_profit">Trade Profit</SelectItem>
                      <SelectItem value="trade_loss">Trade Loss</SelectItem>
                      <SelectItem value="payout">Payout</SelectItem>
                    </SelectContent>
                  </Select>

                 <Select
                   value={`createdAt-${txSort.order}`}
                   onValueChange={(val) => {
                     const [field, order] = val.split("-")
                     setTxSort({ field, order })
                     setTxPage(1)
                   }}
                 >
                   <SelectTrigger className="w-36">
                     <SelectValue />
                   </SelectTrigger>
                   <SelectContent>
                     <SelectItem value="createdAt-desc">Newest</SelectItem>
                     <SelectItem value="createdAt-asc">Oldest</SelectItem>
                   </SelectContent>
                 </Select>

                 <Select
                   value={String(txLimit)}
                   onValueChange={(val) => {
                     setTxLimit(Number(val))
                     setTxPage(1)
                   }}
                 >
                   <SelectTrigger className="w-20">
                     <SelectValue />
                   </SelectTrigger>
                   <SelectContent>
                     <SelectItem value="10">10</SelectItem>
                     <SelectItem value="20">20</SelectItem>
                     <SelectItem value="50">50</SelectItem>
                     <SelectItem value="100">100</SelectItem>
                   </SelectContent>
                 </Select>
               </div>
            </div>
          </CardHeader>

          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Balance After</TableHead>
                    <TableHead>Description</TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {transactions.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={5}
                        className="text-center text-muted-foreground py-8"
                      >
                        No transactions recorded yet.
                      </TableCell>
                    </TableRow>
                  ) : (
                    transactions.map((tx) => {
                      const amount = tx.amount ?? 0

                      let displayAmount = amount

                      if (tx.type === "withdrawal" || tx.type === "trade_loss") {
                        displayAmount = -Math.abs(amount)
                      }

                      if (tx.type === "deposit" || tx.type === "trade_profit" || tx.type === "payout") {
                        displayAmount = Math.abs(amount)
                      }

                      return (
                        <TableRow key={tx._id || tx.id}>
                          {/* DATE */}
                          <TableCell className="text-xs">
                            {tx.createdAt
                              ? new Date(tx.createdAt).toLocaleDateString()
                              : "N/A"}
                          </TableCell>

                          {/* TYPE */}
                          <TableCell>
                            <Badge
                              variant="outline"
                              className={
                                tx.type === "deposit"
                                  ? "border-success/20 text-success bg-success/10"
                                  : tx.type === "withdrawal"
                                  ? "border-destructive/20 text-destructive bg-destructive/10"
                                  : tx.type === "payout"
                                  ? "border-warning/20 text-warning bg-warning/10"
                                  : tx.type === "trade_profit"
                                  ? "border-success/20 text-success bg-success/10"
                                  : tx.type === "trade_loss"
                                  ? "border-danger/20 text-danger bg-danger/10"
                                  : "border-info/20 text-info bg-info/10"
                              }
                            >
                              {tx.type === "deposit"
                                ? "Deposit"
                                : tx.type === "withdrawal"
                                ? "Withdrawal"
                                : tx.type === "payout"
                                ? "Payout"
                                : tx.type === "trade_profit"
                                ? "Trade Profit"
                                : tx.type === "trade_loss"
                                ? "Trade Loss"
                                : tx.type || "N/A"}
                            </Badge>
                          </TableCell>

                          {/* AMOUNT */}
                          <TableCell
                            className={`trading-number font-medium ${
                              displayAmount >= 0 ? "profit-text" : "loss-text"
                            }`}
                          >
                            {displayAmount >= 0 ? "+" : ""}${displayAmount.toLocaleString()}
                          </TableCell>

                          {/* BALANCE AFTER */}
                          <TableCell className="trading-number">
                            {(account?.currency || "$").toUpperCase()}{" "}
                            {Number(tx.balanceAfter || 0).toLocaleString()}
                          </TableCell>

                          {/* NOTE */}
                          <TableCell className="max-w-50 truncate">
                            {tx.note || "—"}
                          </TableCell>
                        </TableRow>
                      )
                    })
                  )}
                </TableBody>
              </Table>
            </div>

             {/* PAGINATION */}
             {transactionPagination.pages > 1 && (
               <div className="flex items-center justify-between px-4 py-3 border-t border-border">
                 <p className="text-sm text-muted-foreground">
                   Total: {transactionPagination.total} | Page {transactionPagination.page} of {transactionPagination.pages}
                 </p>
                 <div className="flex items-center gap-2">
                   <Button
                     type="button"
                     variant="outline"
                     size="sm"
                     disabled={txPage <= 1}
                     onClick={() => setTxPage(prev => Math.max(prev - 1, 1))}
                   >
                     Prev
                   </Button>
                   <Button
                     type="button"
                     variant="outline"
                     size="sm"
                     disabled={txPage >= transactionPagination.pages}
                     onClick={() => setTxPage(prev => Math.min(prev + 1, transactionPagination.pages))}
                   >
                     Next
                   </Button>
                 </div>
               </div>
             )}
          </CardContent>
        </Card>
      </div>

      {/* ───────────────── DAY DRAWER ───────────────── */}
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent className="w-full sm:max-w-xl p-0 border-l border-border bg-background">
          <SheetHeader className="px-6 py-5 border-b border-border">
            <div className="flex items-center justify-between">
              <div>
                <SheetTitle>Trading Activity</SheetTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  Day {selectedDay} review and execution breakdown
                </p>
              </div>
            </div>
          </SheetHeader>

          <div className="p-6 space-y-6 overflow-y-auto h-full pb-28">
            {/* SUMMARY */}
            <div className="grid grid-cols-3 gap-4">
              <Card className="trading-card">
                <CardContent className="p-4 text-center">
                  <p className="text-muted-foreground text-sm">Trades</p>
                  <h3 className="text-2xl trading-number mt-1">
                    {selectedTrades.length}
                  </h3>
                </CardContent>
              </Card>

              <Card className="trading-card">
                <CardContent className="p-4 text-center">
                  <p className="text-muted-foreground text-sm">Net PnL</p>
                  <h3
                    className={`text-2xl trading-number mt-1 ${
                      selectedTrades.reduce(
                        (sum, t) => sum + (t.pnl || 0),
                        0
                      ) >= 0
                        ? "profit-text"
                        : "loss-text"
                    }`}
                  >
                    $
                    {selectedTrades.reduce(
                      (sum, t) => sum + (t.pnl || 0),
                      0
                    )}
                  </h3>
                </CardContent>
              </Card>

              <Card className="trading-card">
                <CardContent className="p-4 text-center">
                  <p className="text-muted-foreground text-sm">Sessions</p>
                  <h3 className="text-2xl trading-number mt-1">
                    {new Set(selectedTrades.map((t) => t.session)).size}
                  </h3>
                </CardContent>
              </Card>
            </div>

            {/* TABS */}
            <Tabs defaultValue="trades">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="trades">Trades</TabsTrigger>
                <TabsTrigger value="notes">Notes</TabsTrigger>
              </TabsList>

              {/* TRADES */}
              <TabsContent
                value="trades"
                className="space-y-4 mt-5"
              >
                {selectedTrades.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No trades on this day.
                  </p>
                ) : (
                  selectedTrades.map((trade) => (
                    <Card key={trade._id || trade.id} className="trading-card">
                      <CardContent className="p-5">
                        <div className="flex items-start justify-between gap-4">
                          <div className="space-y-3">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h3 className="font-semibold">
                                {trade.pair || "N/A"}
                              </h3>
                              <Badge variant="outline">
                                {(trade.session || "N/A")
                                  .replace("_", " ")
                                  .replace(/\b\w/g, (c) =>
                                    c.toUpperCase()
                                  )}
                              </Badge>
                              <Badge
                                className={
                                  trade.type === "win"
                                    ? "bg-success/10 text-success border-success/20"
                                    : trade.type === "loss"
                                    ? "bg-danger/10 text-danger border-danger/20"
                                    : "bg-info/10 text-info border-info/20"
                                }
                              >
                                {trade.type || "N/A"}
                              </Badge>
                            </div>

                            <div className="grid grid-cols-2 gap-4 text-sm">
                              <div>
                                <p className="text-muted-foreground">
                                  Setup
                                </p>
                                <p className="mt-1">
                                  {trade.setup || "N/A"}
                                </p>
                              </div>

                              <div>
                                <p className="text-muted-foreground">RR</p>
                                <p className="mt-1 trading-number">
                                  {trade.realizedRR || trade.rr || "N/A"}
                                </p>
                              </div>
                            </div>

                            <div className="rounded-xl border border-border bg-muted/30 p-3">
                              <div className="flex items-start gap-2">
                                <Info className="h-4 w-4 mt-0.5 text-primary" />
                                <p className="text-sm text-muted-foreground leading-relaxed">
                                  {trade.note || trade.notes || "No notes."}
                                </p>
                              </div>
                            </div>
                          </div>

                          <div className="text-right">
                            <p
                              className={`text-xl trading-number ${
                                (trade.pnl || 0) > 0
                                  ? "profit-text"
                                  : (trade.pnl || 0) < 0
                                  ? "loss-text"
                                  : "text-info"
                              }`}
                            >
                              {(trade.pnl || 0) > 0 ? "+" : ""}
                              ${(trade.pnl || 0).toLocaleString()}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </TabsContent>

              {/* NOTES */}
              <TabsContent value="notes" className="mt-5">
                <Card className="trading-card">
                  <CardContent className="p-5 space-y-4">
                    {selectedTrades.some((t) => t.note || t.notes) ? (
                      selectedTrades
                        .filter((t) => t.note || t.notes)
                        .map((trade, idx) => (
                          <div key={idx}>
                            <h3 className="font-medium">
                              {trade.pair} — Note
                            </h3>
                            <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
                              {trade.note || trade.notes}
                            </p>
                          </div>
                        ))
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        No notes recorded for this day.
                      </p>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </SheetContent>
      </Sheet>

      {/* ───────────────── ACCOUNT DETAILS SHEET ───────────────── */}
      <Sheet open={accountDetailsOpen} onOpenChange={setAccountDetailsOpen}>
        <SheetContent className="w-full sm:max-w-3xl p-0 border-l border-border bg-background">
          <SheetHeader className="px-6 py-5 border-b border-border">
            <div className="flex items-center justify-between">
              <div>
                <SheetTitle>Account Details</SheetTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  View and manage account configuration
                </p>
              </div>
              <div className="flex items-center gap-3">
                <Badge className="bg-primary text-primary-foreground border-0">
                  {account?.type || "UNKNOWN"}
                </Badge>
                <Badge
                  variant="outline"
                  className="bg-success/10 text-success border-success/20"
                >
                  ACTIVE
                </Badge>
              </div>
            </div>
          </SheetHeader>

          <div className="p-6 space-y-6 overflow-y-auto h-full pb-28">
            {/* QUICK STATS */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

              <Card className="trading-card">
                <CardContent className="p-4 text-center">
                  <p className="text-muted-foreground text-sm">Starting</p>
                  <h3 className="text-2xl trading-number mt-1">
                    {(account?.currency || "$").toUpperCase()}{" "}
                    {Number(account?.startingBalance || 0).toLocaleString()}
                  </h3>
                </CardContent>
              </Card>

              <Card className="trading-card">
                <CardContent className="p-4 text-center">
                  <p className="text-muted-foreground text-sm">P&L</p>
                  <h3
                    className={`text-2xl trading-number mt-1 ${
                      totalPnl >= 0 ? "profit-text" : "loss-text"
                    }`}
                  >
                    {totalPnl >= 0 ? "+" : ""}${totalPnl.toLocaleString()}
                  </h3>
                </CardContent>
              </Card>
            </div>

            {/* TABS */}
            <Tabs defaultValue="overview">
              <TabsList className="grid w-full" style={{ gridTemplateColumns: "repeat(5, 1fr)" }}>
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="identity">Identity</TabsTrigger>
                <TabsTrigger value="financial">Financial</TabsTrigger>
                <TabsTrigger value="rules">Rules</TabsTrigger>
                {account?.type === "PROP ACCOUNT" && (
                  <TabsTrigger value="prop">Prop Firm</TabsTrigger>
                )}
              </TabsList>

              {/* OVERVIEW */}
              <TabsContent value="overview" className="space-y-4 mt-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card className="trading-card">
                    <CardHeader>
                      <CardTitle className="text-base">Performance</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Total Trades</span>
                        <span className="trading-number font-medium">
                          {account?.performance?.totalTrades ?? trades.length}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Win Rate</span>
                        <span className="trading-number font-medium">{winRate}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Profit Factor</span>
                        <span className="trading-number font-medium">
                          {account?.performance?.profitFactor ?? "N/A"}
                        </span>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="trading-card">
                    <CardHeader>
                      <CardTitle className="text-base">Best & Worst</CardTitle>
                    </CardHeader> 
                   <CardContent className="space-y-3">
                       <div className="flex justify-between">
                         <span className="text-muted-foreground">Best Trade</span>
                         <span className="trading-number font-medium profit-text">
                           +{Math.abs(largestWin).toLocaleString()}
                         </span>
                       </div>
                       <div className="flex justify-between">
                         <span className="text-muted-foreground">Worst Trade</span>
                         <span className="trading-number font-medium loss-text">
                           {Math.abs(largestLoss).toLocaleString()}
                         </span>
                       </div>
                     </CardContent>
                  </Card>
                </div>
              </TabsContent>

              {/* IDENTITY */}
              <TabsContent value="identity" className="space-y-4 mt-5">
                <Card className="trading-card">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base">
                      <CircleUser className="h-4 w-4 text-primary" />
                      Account Identity
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <p className="text-muted-foreground text-sm">Account Name</p>
                      <p className="font-medium mt-1">{account?.name || "Unnamed Account"}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground text-sm">Account Type</p>
                      <p className="font-medium mt-1">{account?.type || "N/A"}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground text-sm">Currency</p>
                      <p className="font-medium mt-1">{account?.currency || "N/A"}</p>
                    </div>
                    {!account?.type?.includes("PROP") && (
                      <div>
                        <p className="text-muted-foreground text-sm">Broker</p>
                        <p className="font-medium mt-1">{account?.broker || "N/A"}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* FINANCIAL */}
              <TabsContent value="financial" className="space-y-4 mt-5">
                <Card className="trading-card">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base">
                      <CircleDollarSign className="h-4 w-4 text-primary" />
                      Financial Details
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <p className="text-muted-foreground text-sm">Starting Balance</p>
                      <p className="font-medium mt-1 trading-number">
                        {(account?.currency || "$").toUpperCase()}{" "}
                        {Number(account?.startingBalance || 0).toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground text-sm">Current Balance</p>
                      <p className="font-medium mt-1 trading-number profit-text">
                        {(account?.currency || "$").toUpperCase()}{" "}
                        {Number(account?.balanceSnapshot || 0).toLocaleString()}
                      </p>
                    </div>
                    {account?.type === "PROP ACCOUNT" && (
                      <div>
                        <p className="text-muted-foreground text-sm">Account Size</p>
                        <p className="font-medium mt-1 trading-number">
                          {(account?.currency || "$").toUpperCase()}{" "}
                          {Number(account?.accountSize || 0).toLocaleString()}
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* RULES */}
              <TabsContent value="rules" className="space-y-4 mt-5">
                <Card className="trading-card">
                  <CardHeader>
                    <CardTitle className="text-base">Rule Engine</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Mode</span>
                      <Badge variant="outline" className="uppercase">
                        {account?.ruleMode || "track-only"}
                      </Badge>
                    </div>

                    {account?.type === "PROP ACCOUNT" && account.propRules && (
                      <div className="space-y-3 pt-2 border-t border-border">
                        <p className="text-sm font-medium">Prop Rules</p>
                        <div className="grid grid-cols-2 gap-3 text-sm">
                          <div>
                            <p className="text-muted-foreground">Max Drawdown</p>
                            <p className="trading-number font-medium">
                              {account.propRules.maxDrawdownPercent ?? "N/A"}%
                            </p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Daily DD</p>
                            <p className="trading-number font-medium">
                              {account.propRules.dailyDrawdownPercent ?? "N/A"}%
                            </p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Profit Target</p>
                            <p className="trading-number font-medium">
                              {account.propRules.profitTarget ?? "N/A"}%
                            </p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Max Trades/Day</p>
                            <p className="trading-number font-medium">
                              {account.propRules.maxTradesPerDay ?? "N/A"}
                            </p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Max Lot Size</p>
                            <p className="trading-number font-medium">
                              {account.propRules.maxLotSize ?? "N/A"}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {account?.trackRules?.length > 0 && (
                      <div className="space-y-3 pt-2 border-t border-border">
                        <p className="text-sm font-medium">Trading Rules ({account.trackRules.length})</p>
                        <div className="space-y-2">
                          {account.trackRules.map((rule, idx) => (
                            <div key={idx} className="text-sm p-2 bg-muted/30 rounded-lg">
                              {rule.title || rule}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* PROP FIRM */}
              {account?.type === "PROP ACCOUNT" && (
                <TabsContent value="prop" className="space-y-4 mt-5">
                  <Card className="trading-card">
                    <CardHeader>
                      <CardTitle className="text-base">Prop Firm Configuration</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <p className="text-muted-foreground text-sm">Firm Name</p>
                        <p className="font-medium mt-1">{account?.propFirm?.firmName || "N/A"}</p>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-muted-foreground text-sm">Phase</p>
                          <p className="font-medium mt-1 capitalize">
                            {account?.propFirm?.phase?.replace("_", " ") || "N/A"}
                          </p>
                        </div>
                        <div>
                          <p className="text-muted-foreground text-sm">Status</p>
                          <Badge
                            className="mt-1 capitalize"
                            variant={
                              account?.propFirm?.status === "passed"
                                ? "default"
                                : account?.propFirm?.status === "failed" ||
                                    account?.propFirm?.status === "blown"
                                  ? "destructive"
                                  : "secondary"
                            }
                          >
                            {account?.propFirm?.status || "N/A"}
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              )}
            </Tabs>

             {/* ACTIONS */}
             <div className="flex justify-end gap-3 pt-2">
               <Button type="button" variant="outline" onClick={() => navigate(`/accounts/${accountId}/edit`)}>
                 Edit Full Details
               </Button>
             </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  )
}