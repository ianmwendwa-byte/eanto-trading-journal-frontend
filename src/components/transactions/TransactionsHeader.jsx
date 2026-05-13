"use client"

"use client"

import { Button } from "@/components/ui/button"
import {
  Download,
  Plus,
  Filter,
  ArrowLeft,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"

export function TransactionsHeader({ onAddClick, onFilterClick, onExportClick }) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      {/* LEFT SIDE */}
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-heading font-bold tracking-tight">
            Transactions
          </h1>
          <Badge
            variant="outline"
            className="bg-primary/10 text-primary border-primary/20 text-xs"
          >
            LIVE
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground">
          Account fund movements and balance history
        </p>
      </div>

      {/* RIGHT SIDE - ACTION BUTTONS */}
      <div className="flex flex-wrap items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          className="h-9 gap-1.5"
          onClick={onExportClick}
        >
          <Download className="h-4 w-4" />
          <span className="hidden sm:inline">Export</span>
        </Button>

        <Button
          variant="outline"
          size="sm"
          className="h-9 gap-1.5"
          onClick={onFilterClick}
        >
          <Filter className="h-4 w-4" />
          <span className="hidden sm:inline">Filters</span>
        </Button>

        <Button
          size="sm"
          className="h-9 gap-1.5 bg-primary text-primary-foreground hover:bg-primary/90"
          onClick={onAddClick}
        >
          <Plus className="h-4 w-4" />
          <span>Add Transaction</span>
        </Button>
      </div>
    </div>
  )
}
