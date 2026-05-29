import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const Pagination = ({
  page,
  totalPages,
  total,
  limit,
  onPageChange,
  isFetching = false,
}) => {
  if (!totalPages || totalPages <= 1) return null;

  const from = (page - 1) * limit + 1;
  const to   = Math.min(page * limit, total);

  const getPages = () => {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    if (page <= 4) {
      return [1, 2, 3, 4, 5, "…", totalPages];
    }
    if (page >= totalPages - 3) {
      return [1, "…", totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
    }
    return [1, "…", page - 1, page, page + 1, "…", totalPages];
  };

  return (
    <div className={cn(
      "flex items-center justify-between flex-wrap gap-3 transition-opacity duration-150",
      isFetching && "opacity-50 pointer-events-none"
    )}>
      <p className="text-xs text-muted-foreground">
        Showing {from}–{to} of {total}
      </p>

      <div className="flex items-center gap-1">
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8 border-border"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
        >
          <ChevronLeft className="h-3.5 w-3.5" />
        </Button>

        {getPages().map((p, i) =>
          typeof p === "string" ? (
            <span
              key={`ellipsis-${i}`}
              className="w-8 text-center text-sm text-muted-foreground select-none"
            >
              {p}
            </span>
          ) : (
            <Button
              key={p}
              variant={p === page ? "default" : "outline"}
              size="icon"
              className={cn(
                "h-8 w-8 text-xs border-border",
                p === page && "pointer-events-none"
              )}
              onClick={() => onPageChange(p)}
            >
              {p}
            </Button>
          )
        )}

        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8 border-border"
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
        >
          <ChevronRight className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  );
};
