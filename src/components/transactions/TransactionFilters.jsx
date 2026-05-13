"use client"

"use client"

import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Search,
  Calendar,
  RotateCcw,
} from "lucide-react"
import { transactionTypes } from "@/data/transactions-mock-data"

const sortOptions = [
  { value: "date-desc", label: "Newest First" },
  { value: "date-asc", label: "Oldest First" },
  { value: "amount-desc", label: "Highest Amount" },
  { value: "amount-asc", label: "Lowest Amount" },
]

const dateRangeOptions = [
  { value: "all", label: "All Time" },
  { value: "7", label: "Last 7 Days" },
  { value: "30", label: "Last 30 Days" },
  { value: "90", label: "Last 90 Days" },
  { value: "365", label: "Last Year" },
]

const limitOptions = [
  { value: "10", label: "10" },
  { value: "20", label: "20" },
  { value: "50", label: "50" },
  { value: "100", label: "100" },
]

export function TransactionFilters({
  searchQuery,
  setSearchQuery,
  typeFilter,
  setTypeFilter,
  sortBy,
  setSortBy,
  dateRange,
  setDateRange,
  limit,
  setLimit,
  onReset,
}) {
  return (
    <div className="flex flex-col gap-4 p-4 bg-muted/30 rounded-lg border border-border">
      {/* TOP ROW */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* SEARCH */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search transactions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 h-9 bg-background"
          />
        </div>

        {/* TYPE FILTER */}
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-full sm:w-40 h-9">
            <SelectValue placeholder="Filter by type" />
          </SelectTrigger>
          <SelectContent>
            {transactionTypes.map((type) => (
              <SelectItem key={type.value} value={type.value}>
                {type.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* DATE RANGE */}
        <Select value={dateRange} onValueChange={setDateRange}>
          <SelectTrigger className="w-full sm:w-40 h-9">
            <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
            <SelectValue placeholder="Date range" />
          </SelectTrigger>
          <SelectContent>
            {dateRangeOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* BOTTOM ROW */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        {/* SORT & LIMIT */}
        <div className="flex flex-wrap items-center gap-2">
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-full sm:w-44 h-9">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              {sortOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={limit} onValueChange={setLimit}>
            <SelectTrigger className="w-full sm:w-20 h-9">
              <SelectValue placeholder="Show" />
            </SelectTrigger>
            <SelectContent>
              {limitOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* RESET BUTTON */}
        <Button
          variant="ghost"
          size="sm"
          onClick={onReset}
          className="h-9 gap-1.5 text-muted-foreground hover:text-foreground"
        >
          <RotateCcw className="h-4 w-4" />
          Reset Filters
        </Button>
      </div>
    </div>
  )
}
