import { useState, useEffect, useRef } from "react";
import {
  Search, X, ChevronDown, LayoutList, CalendarDays, Plus,
} from "lucide-react";
import { Button }   from "@/components/ui/button";
import { Input }    from "@/components/ui/input";
import { cn }       from "@/lib/utils";
import {
  DropdownMenu, DropdownMenuContent,
  DropdownMenuRadioGroup, DropdownMenuRadioItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";

const PERIODS = [
  { value: "today", label: "Today" },
  { value: "7d",    label: "1W"    },
  { value: "30d",   label: "1M"    },
  { value: "90d",   label: "3M"    },
  { value: "all",   label: "All"   },
];

const DIRECTIONS = [
  { value: "",     label: "All"    },
  { value: "buy",  label: "▲ Buy"  },
  { value: "sell", label: "▼ Sell" },
];

const OUTCOMES = [
  { value: "",           label: "All"       },
  { value: "win",        label: "Win"       },
  { value: "loss",       label: "Loss"      },
  { value: "breakeven",  label: "Breakeven" },
];

const SESSIONS = [
  { value: "",          label: "All"      },
  { value: "london",    label: "London"   },
  { value: "new_york",  label: "New York" },
  { value: "tokyo",     label: "Asian"    },
  { value: "sydney",    label: "Sydney"   },
  { value: "overlap",   label: "Overlap"  },
];

const SORT_OPTIONS = [
  { value: "closedAt_desc",   label: "Newest First"  },
  { value: "closedAt_asc",    label: "Oldest First"  },
  { value: "pnl_desc",        label: "Highest P&L"   },
  { value: "pnl_asc",         label: "Lowest P&L"    },
  { value: "realizedRR_desc", label: "Best RR"       },
  { value: "pair_asc",        label: "Pair A–Z"      },
];

const PillGroup = ({ options, value, onChange, colored = false }) => (
  <div className="flex items-center gap-1 flex-wrap">
    {options.map((opt) => {
      const active = value === opt.value;
      const isBuy  = opt.value === "buy";
      const isSell = opt.value === "sell";
      return (
        <button
          key={opt.value}
          type="button"
          onClick={() => onChange(active ? "" : opt.value)}
          className={cn(
            "px-2.5 py-1 rounded-md text-xs font-medium border transition-all whitespace-nowrap",
            active && colored && isBuy  && "bg-[hsl(var(--profit)/0.15)] text-[hsl(var(--profit))] border-[hsl(var(--profit)/0.4)]",
            active && colored && isSell && "bg-[hsl(var(--loss)/0.15)] text-[hsl(var(--loss))] border-[hsl(var(--loss)/0.4)]",
            active && !isBuy && !isSell && "bg-primary/10 text-primary border-primary/30",
            !active && "bg-transparent text-muted-foreground border-border hover:border-border/60 hover:text-foreground"
          )}
        >
          {opt.label}
        </button>
      );
    })}
  </div>
);

export const TradesToolbar = ({
  filters,
  onFilterChange,
  view,
  onViewChange,
  totalCount = 0,
  accounts = [],
  isLoading = false,
  onAddTrade,
}) => {
  const [searchInput, setSearchInput] = useState(filters.search ?? "");
  const debounceRef = useRef(null);

  // Sync external filter change back to search input
  useEffect(() => {
    setSearchInput(filters.search ?? "");
  }, [filters.search]);

  const handleSearchChange = (e) => {
    const val = e.target.value;
    setSearchInput(val);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      onFilterChange({ search: val, page: 1 });
    }, 300);
  };

  const activeFilters = [
    filters.direction && { key: "direction", label: filters.direction === "buy" ? "▲ Buy" : "▼ Sell" },
    filters.outcome   && { key: "outcome",   label: filters.outcome   },
    filters.session   && { key: "session",   label: SESSIONS.find(s => s.value === filters.session)?.label ?? filters.session },
  ].filter(Boolean);

  const hasActiveFilters = activeFilters.length > 0;
  const currentSort = SORT_OPTIONS.find(s => s.value === (filters.sort ?? "closedAt_desc"));

  return (
    <div className="space-y-3">
      {/* ── Row 1 ───────────────────────────────────── */}
      <div className="flex items-center gap-3 flex-wrap">
        {/* Search */}
        <div className="relative flex-1 min-w-[180px] max-w-xs">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
          <Input
            value={searchInput}
            onChange={handleSearchChange}
            placeholder="Search pair, notes..."
            className="pl-8 h-9 bg-background border-border text-sm"
          />
          {searchInput && (
            <button
              onClick={() => {
                setSearchInput("");
                onFilterChange({ search: "", page: 1 });
              }}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {/* Account selector */}
        {accounts.length > 1 && (
          <Select
            value={filters.accountId ?? "all"}
            onValueChange={(v) => onFilterChange({ accountId: v === "all" ? "" : v, page: 1 })}
          >
            <SelectTrigger className="h-9 w-44 bg-background border-border text-sm">
              <SelectValue placeholder="All Accounts" />
            </SelectTrigger>
            <SelectContent className="bg-card border-border">
              <SelectItem value="all">All Accounts</SelectItem>
              {accounts.map((acc) => (
                <SelectItem key={acc._id} value={acc._id}>
                  {acc.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        <div className="flex items-center gap-2 ml-auto">
          {/* Period tabs (table view only) */}
          {view === "table" && (
            <div className="flex items-center bg-muted/50 rounded-lg p-0.5 border border-border">
              {PERIODS.map((p) => (
                <button
                  key={p.value}
                  type="button"
                  onClick={() => onFilterChange({ period: p.value, page: 1 })}
                  className={cn(
                    "px-2.5 py-1 rounded-md text-xs font-medium transition-all",
                    (filters.period ?? "30d") === p.value
                      ? "bg-background text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {p.label}
                </button>
              ))}
            </div>
          )}

          {/* View toggle */}
          <div className="flex items-center border border-border rounded-lg overflow-hidden">
            <button
              type="button"
              onClick={() => onViewChange("table")}
              className={cn(
                "px-2.5 py-1.5 transition-colors",
                view === "table"
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              )}
            >
              <LayoutList className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={() => onViewChange("calendar")}
              className={cn(
                "px-2.5 py-1.5 transition-colors",
                view === "calendar"
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              )}
            >
              <CalendarDays className="h-3.5 w-3.5" />
            </button>
          </div>

          {/* Add Trade */}
          <Button size="sm" onClick={onAddTrade} className="gap-1.5 h-9">
            <Plus className="h-3.5 w-3.5" />
            Add Trade
          </Button>
        </div>
      </div>

      {/* ── Row 2 ───────────────────────────────────── */}
      <div className="flex items-center gap-3 flex-wrap">
        <PillGroup
          options={DIRECTIONS}
          value={filters.direction ?? ""}
          onChange={(v) => onFilterChange({ direction: v, page: 1 })}
          colored
        />

        <div className="w-px h-4 bg-border" />

        <PillGroup
          options={OUTCOMES}
          value={filters.outcome ?? ""}
          onChange={(v) => onFilterChange({ outcome: v, page: 1 })}
        />

        <div className="w-px h-4 bg-border" />

        <PillGroup
          options={SESSIONS}
          value={filters.session ?? ""}
          onChange={(v) => onFilterChange({ session: v, page: 1 })}
        />

        {view === "table" && (
          <>
            <div className="w-px h-4 bg-border" />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  className="flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium border border-border bg-transparent text-muted-foreground hover:text-foreground hover:border-border/60 transition-all"
                >
                  {currentSort?.label ?? "Sort"}
                  <ChevronDown className="h-3 w-3" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="bg-card border-border w-44">
                <DropdownMenuRadioGroup
                  value={filters.sort ?? "closedAt_desc"}
                  onValueChange={(v) => onFilterChange({ sort: v, page: 1 })}
                >
                  {SORT_OPTIONS.map((opt) => (
                    <DropdownMenuRadioItem key={opt.value} value={opt.value} className="text-xs">
                      {opt.label}
                    </DropdownMenuRadioItem>
                  ))}
                </DropdownMenuRadioGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          </>
        )}

        {/* Active chips + count */}
        <div className="flex items-center gap-1.5 ml-auto flex-wrap">
          {activeFilters.map((f) => (
            <button
              key={f.key}
              type="button"
              onClick={() => onFilterChange({ [f.key]: "", page: 1 })}
              className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-primary/10 text-primary text-xs border border-primary/20 hover:bg-primary/20 transition-colors"
            >
              {f.label}
              <X className="h-2.5 w-2.5" />
            </button>
          ))}

          {hasActiveFilters && (
            <button
              type="button"
              onClick={() => onFilterChange({ direction: "", outcome: "", session: "", search: "", page: 1 })}
              className="text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              Clear all
            </button>
          )}

          {!isLoading && (
            <span className="text-xs text-muted-foreground ml-1">
              {totalCount.toLocaleString()} trades
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
