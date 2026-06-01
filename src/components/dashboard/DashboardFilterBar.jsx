import { RefreshCw, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const PERIODS = [
  { label: "Today", value: "today" },
  { label: "1W",    value: "1w"    },
  { label: "1M",    value: "1m"    },
  { label: "3M",    value: "3m"    },
  { label: "YTD",   value: "ytd"   },
  { label: "All",   value: "all"   },
];

export const DashboardFilterBar = ({
  period,
  onPeriodChange,
  onRefresh,
  onCustomize,
  isFetching,
}) => (
  <div className="flex items-center justify-between gap-3 flex-wrap">
    {/* Period pills */}
    <div className="flex items-center gap-1 flex-wrap">
      {PERIODS.map((p) => (
        <button
          key={p.value}
          onClick={() => onPeriodChange?.(p.value)}
          className={cn(
            "px-3 py-1 rounded-full text-xs font-medium transition-colors",
            period === p.value
              ? "bg-primary text-primary-foreground"
              : "bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground"
          )}
        >
          {p.label}
        </button>
      ))}
    </div>

    {/* Right actions */}
    <div className="flex items-center gap-2">
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8"
        onClick={onRefresh}
        disabled={isFetching}
        title="Refresh data"
      >
        <RefreshCw className={cn("h-4 w-4", isFetching && "animate-spin")} />
      </Button>
      <Button
        variant="outline"
        size="sm"
        className="h-8 gap-1.5"
        onClick={onCustomize}
      >
        <Settings className="h-3.5 w-3.5" />
        Customize
      </Button>
    </div>
  </div>
);
