"use client"

import { useState, useMemo, useCallback } from "react"
import { TransactionsHeader } from "@/components/transactions/TransactionsHeader"
import { TransactionsStats } from "@/components/transactions/TransactionsStats"
import { BalanceChart } from "@/components/transactions/BalanceChart"
import { TransactionDistribution } from "@/components/transactions/TransactionDistribution"
import { TransactionFilters } from "@/components/transactions/TransactionFilters"
import { TransactionsTable } from "@/components/transactions/TransactionsTable"
import { TransactionPagination } from "@/components/transactions/TransactionPagination"
import { mockTransactions, calculateStats } from "@/data/transactions-mock-data"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { toast } from "sonner"
import { Plus, Download, Filter } from "lucide-react"

const ITEMS_PER_PAGE = 20

export default function Transactions() {
  // ─────────────────────────────────────────────
  // FILTER STATE
  // ─────────────────────────────────────────────
  const [searchQuery, setSearchQuery] = useState("")
  const [typeFilter, setTypeFilter] = useState("all")
  const [sortBy, setSortBy] = useState("date-desc")
  const [dateRange, setDateRange] = useState("all")
  const [limit, setLimit] = useState(20)

  // ─────────────────────────────────────────────
  // PAGINATION STATE
  // ─────────────────────────────────────────────
  const [currentPage, setCurrentPage] = useState(1)

  // ─────────────────────────────────────────────
  // UI STATE
  // ─────────────────────────────────────────────
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [addSheetOpen, setAddSheetOpen] = useState(false)

  // ─────────────────────────────────────────────
  // FILTERED TRANSACTIONS (frontend only)
  // ─────────────────────────────────────────────
  const filteredTransactions = useMemo(() => {
    let result = [...mockTransactions]

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      result = result.filter(
        (tx) =>
          (tx.note && tx.note.toLowerCase().includes(query)) ||
          (tx.source && tx.source.toLowerCase().includes(query))
      )
    }

    // Type filter
    if (typeFilter !== "all") {
      result = result.filter((tx) => tx.type === typeFilter)
    }

    // Date range filter
    if (dateRange !== "all") {
      const daysAgo = parseInt(dateRange, 10)
      const cutoffDate = new Date()
      cutoffDate.setDate(cutoffDate.getDate() - daysAgo)
      result = result.filter((tx) => new Date(tx.createdAt) >= cutoffDate)
    }

    // Sorting
    result.sort((a, b) => {
      if (sortBy === "date-desc") {
        return new Date(b.createdAt) - new Date(a.createdAt)
      } else if (sortBy === "date-asc") {
        return new Date(a.createdAt) - new Date(b.createdAt)
      } else if (sortBy === "amount-desc") {
        return b.amount - a.amount
      } else if (sortBy === "amount-asc") {
        return a.amount - b.amount
      }
      return 0
    })

    return result
  }, [searchQuery, typeFilter, sortBy, dateRange])

  // ─────────────────────────────────────────────
  // PAGINATION
  // ─────────────────────────────────────────────
  const totalRecords = filteredTransactions.length
  const totalPages = Math.ceil(totalRecords / limit)
  const paginatedTransactions = useMemo(() => {
    const start = (currentPage - 1) * limit
    const end = start + limit
    return filteredTransactions.slice(start, end)
  }, [filteredTransactions, currentPage, limit])

  // Reset to page 1 when filters change
  useMemo(() => {
    setCurrentPage(1)
  }, [searchQuery, typeFilter, sortBy, dateRange, limit])

  // ─────────────────────────────────────────────
  // EMPTY STATE DETERMINATION
  // ─────────────────────────────────────────────
  const emptyState = totalRecords === 0
    ? searchQuery
      ? "search"
      : typeFilter !== "all" || dateRange !== "all"
      ? "filter"
      : "all"
    : "none"

  // ─────────────────────────────────────────────
  // STATS (calculated from all filtered data, not just current page)
  // ─────────────────────────────────────────────
  const stats = useMemo(() => calculateStats(filteredTransactions), [filteredTransactions])

  // ─────────────────────────────────────────────
  // HANDLERS
  // ─────────────────────────────────────────────
  const handleResetFilters = useCallback(() => {
    setSearchQuery("")
    setTypeFilter("all")
    setSortBy("date-desc")
    setDateRange("all")
    setLimit(20)
    setCurrentPage(1)
    toast.success("Filters reset")
  }, [])

  const handleAddTransaction = useCallback(() => {
    setAddSheetOpen(true)
    // In production: navigate to add transaction page or open dialog
    toast.info("Add Transaction feature coming soon")
  }, [])

  const handleExport = useCallback(() => {
    // Mock export - in production would generate CSV/PDF
    toast.success("Export started. Download will begin shortly.")
  }, [])

  const handleFilterToggle = useCallback(() => {
    setFiltersOpen(!filtersOpen)
  }, [filtersOpen])

  const handlePageChange = useCallback((page) => {
    setCurrentPage(page)
    window.scrollTo({ top: 0, behavior: "smooth" })
  }, [])

  return (
    <div className="min-h-screen bg-background">
      <div className="px-4 sm:px-6 lg:px-8 py-4 lg:py-6 space-y-6 max-w-7xl mx-auto">

        {/* ─────────────────────────────────────────
            PAGE HEADER
            ───────────────────────────────────────── */}
        <TransactionsHeader
          onAddClick={handleAddTransaction}
          onFilterClick={handleFilterToggle}
          onExportClick={handleExport}
        />

        {/* ─────────────────────────────────────────
            STATS CARDS
            ───────────────────────────────────────── */}
        <TransactionsStats stats={stats} />

        {/* ─────────────────────────────────────────
            CHARTS SECTION
            ───────────────────────────────────────── */}
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <BalanceChart transactions={filteredTransactions} />
          </div>
          <div className="lg:col-span-1">
            <TransactionDistribution transactions={filteredTransactions} />
          </div>
        </div>

        {/* ─────────────────────────────────────────
            FILTERS (collapsible)
            ───────────────────────────────────────── */}
        <Sheet open={filtersOpen} onOpenChange={setFiltersOpen}>
          <SheetContent side="bottom" className="h-auto max-h-[90vh] rounded-t-xl">
            <SheetHeader className="px-1">
              <SheetTitle className="font-heading">Filter Transactions</SheetTitle>
            </SheetHeader>
            <div className="px-1 py-4">
              <TransactionFilters
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                typeFilter={typeFilter}
                setTypeFilter={setTypeFilter}
                sortBy={sortBy}
                setSortBy={setSortBy}
                dateRange={dateRange}
                setDateRange={setDateRange}
                limit={limit}
                setLimit={setLimit}
                onReset={handleResetFilters}
              />
            </div>
          </SheetContent>
        </Sheet>

        {/* Quick filters row */}
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            {totalRecords.toLocaleString()} transaction{totalRecords !== 1 ? "s" : ""} found
          </p>

          {/* Mobile filter toggle */}
          <Button
            variant="outline"
            size="sm"
            className="lg:hidden gap-2"
            onClick={handleFilterToggle}
          >
            <Filter className="h-4 w-4" />
            Filters
          </Button>
        </div>

        {/* Desktop inline filters (hidden on mobile, shown on lg+) */}
        <div className="hidden lg:block">
          <TransactionFilters
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            typeFilter={typeFilter}
            setTypeFilter={setTypeFilter}
            sortBy={sortBy}
            setSortBy={setSortBy}
            dateRange={dateRange}
            setDateRange={setDateRange}
            limit={limit}
            setLimit={setLimit}
            onReset={handleResetFilters}
          />
        </div>

        {/* ─────────────────────────────────────────
            TRANSACTIONS TABLE
            ───────────────────────────────────────── */}
        <TransactionsTable
          transactions={paginatedTransactions}
          emptyState={emptyState}
          onResetFilters={handleResetFilters}
          onAddTransaction={handleAddTransaction}
        />

        {/* ─────────────────────────────────────────
            PAGINATION
            ───────────────────────────────────────── */}
        {totalPages > 1 && (
          <TransactionPagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalRecords={totalRecords}
            limit={limit}
            onPageChange={handlePageChange}
          />
        )}

      </div>

      {/* ─────────────────────────────────────────
          ADD TRANSACTION SHEET (mock)
          ───────────────────────────────────────── */}
      <Sheet open={addSheetOpen} onOpenChange={setAddSheetOpen}>
        <SheetContent className="w-full sm:max-w-md p-0">
          <SheetHeader className="px-6 py-5 border-b border-border">
            <SheetTitle className="font-heading">Add Transaction</SheetTitle>
          </SheetHeader>
          <div className="p-6 flex flex-col items-center justify-center text-center space-y-4">
            <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
              <Plus className="h-8 w-8 text-primary" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">Coming Soon</h3>
              <p className="text-sm text-muted-foreground mt-1">
                The Add Transaction form is under development. For now, transactions
                are loaded from mock data.
              </p>
            </div>
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => setAddSheetOpen(false)}
            >
              Close
            </Button>
          </div>
        </SheetContent>
      </Sheet>

    </div>
  )
}
