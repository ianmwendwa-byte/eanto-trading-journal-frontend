"use client"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  ChevronLeft,
  ChevronRight,
} from "lucide-react"

export function TransactionPagination({
  currentPage,
  totalPages,
  totalRecords,
  limit,
  onPageChange,
}) {
  if (totalPages <= 1) return null

  const canGoPrev = currentPage > 1
  const canGoNext = currentPage < totalPages

  const startRecord = (currentPage - 1) * limit + 1
  const endRecord = Math.min(currentPage * limit, totalRecords)

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-4 py-3 border-t border-border bg-muted/20">
      {/* LEFT: RECORD COUNT */}
      <p className="text-sm text-muted-foreground">
        Showing{" "}
        <span className="font-medium text-foreground">
          {startRecord.toLocaleString()} - {endRecord.toLocaleString()}
        </span>{" "}
        of <span className="font-medium text-foreground">{totalRecords.toLocaleString()}</span> records
      </p>

      {/* RIGHT: PAGE NAVIGATION */}
      <div className="flex items-center gap-2">
        {/* PAGE INFO */}
        <p className="text-sm text-muted-foreground hidden sm:block">
          Page <span className="font-medium text-foreground">{currentPage}</span> of{" "}
          <span className="font-medium text-foreground">{totalPages}</span>
        </p>

        {/* BUTTONS */}
        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(currentPage - 1)}
            disabled={!canGoPrev}
            className="h-8 px-3"
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            <span className="hidden sm:inline">Prev</span>
          </Button>

          {/* PAGE NUMBERS */}
          <div className="flex items-center gap-1 mx-1">
            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
              let pageNum
              if (totalPages <= 5) {
                pageNum = i + 1
              } else if (currentPage <= 3) {
                pageNum = i + 1
              } else if (currentPage >= totalPages - 2) {
                pageNum = totalPages - 4 + i
              } else {
                pageNum = currentPage - 2 + i
              }

              const isActive = pageNum === currentPage

              return (
                <Button
                  key={pageNum}
                  variant={isActive ? "default" : "outline"}
                  size="sm"
                  onClick={() => onPageChange(pageNum)}
                  className={cn(
                    "h-8 w-8 p-0 font-mono text-sm",
                    isActive && "bg-primary text-primary-foreground"
                  )}
                >
                  {pageNum}
                </Button>
              )
            })}

            {totalPages > 5 && currentPage < totalPages - 2 && (
              <>
                <span className="px-1 text-muted-foreground">...</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onPageChange(totalPages)}
                  className="h-8 w-8 p-0 font-mono text-sm"
                >
                  {totalPages}
                </Button>
              </>
            )}
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(currentPage + 1)}
            disabled={!canGoNext}
            className="h-8 px-3"
          >
            <span className="hidden sm:inline">Next</span>
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      </div>
    </div>
  )
}
