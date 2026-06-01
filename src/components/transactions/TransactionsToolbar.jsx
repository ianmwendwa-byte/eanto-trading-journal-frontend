import { useState, useEffect, useRef } from "react";
import { Search, X, ChevronDown, Filter } from "lucide-react";
import { Button }  from "@/components/ui/button";
import { Input }   from "@/components/ui/input";
import { Switch }  from "@/components/ui/switch";
import { Label }   from "@/components/ui/label";
import {
  DropdownMenu, DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuRadioGroup, DropdownMenuRadioItem,
  DropdownMenuTrigger, DropdownMenuSeparator, DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
  SelectGroup, SelectLabel, SelectSeparator,
} from "@/components/ui/select";
import { AccountTypeBadge } from "@/components/accounts/AccountTypeBadge";
import { TRANSACTION_LABELS, TRANSACTION_ICONS, CATEGORY_LABELS } from "@/constants/transactionTypes";
import { cn } from "@/lib/utils";

const PERIOD_PRESETS = [
  { value: "today",    label: "Today" },
  { value: "7d",       label: "1W"    },
  { value: "1m",       label: "1M"    },
  { value: "3m",       label: "3M"    },
  { value: "ytd",      label: "YTD"   },
  { value: "all",      label: "All"   },
];

const GROUP_BY_OPTIONS = [
  { value: "none",     label: "No Grouping" },
  { value: "date",     label: "Date"        },
  { value: "type",     label: "Type"        },
  { value: "account",  label: "Account"     },
  { value: "category", label: "Category"    },
];

const ALL_TYPES = Object.keys(TRANSACTION_LABELS);
const ALL_CATEGORIES = Object.keys(CATEGORY_LABELS);

const PeriodPill = ({ value, active, onClick, label }) => (
  <button
    type="button"
    onClick={onClick}
    className={cn(
      "px-2.5 py-1 rounded-md text-xs font-medium border transition-all whitespace-nowrap",
      active
        ? "bg-primary/10 text-primary border-primary/30"
        : "bg-transparent text-muted-foreground border-border hover:text-foreground"
    )}
  >
    {label}
  </button>
);

const CategoryPill = ({ value, active, onClick, label }) => (
  <button
    type="button"
    onClick={onClick}
    className={cn(
      "px-2.5 py-1 rounded-md text-xs font-medium border transition-all whitespace-nowrap",
      active
        ? "bg-primary/10 text-primary border-primary/30"
        : "bg-transparent text-muted-foreground border-border hover:text-foreground"
    )}
  >
    {label}
  </button>
);

export const TransactionsToolbar = ({
  filters,
  onFilterChange,
  totalCount = 0,
  groupBy,
  onGroupByChange,
  accounts = [],
}) => {
  const [searchInput, setSearchInput] = useState(filters.search ?? "");
  const debounceRef = useRef(null);

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

  const handleClearSearch = () => {
    setSearchInput("");
    onFilterChange({ search: "", page: 1 });
  };

  const selectedTypes = filters.type
    ? filters.type.split(",").filter(Boolean)
    : [];

  const toggleType = (type) => {
    const current = filters.type
      ? filters.type.split(",").filter(Boolean)
      : [];
    const next = current.includes(type)
      ? current.filter((t) => t !== type)
      : [...current, type];
    onFilterChange({ type: next.join(","), page: 1 });
  };

  const hasActiveFilters =
    filters.search ||
    filters.type ||
    filters.category ||
    (filters.period && filters.period !== "all") ||
    filters.showReversed;

  return (
    <div className="space-y-2">
      {/* ── Main toolbar row ─────────────────────── */}
      <div className="flex items-center gap-2 flex-wrap">
        {/* Search */}
        <div className="relative flex-1 min-w-[180px] max-w-xs">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
          <Input
            value={searchInput}
            onChange={handleSearchChange}
            placeholder="Search notes, tags..."
            className="pl-8 pr-8 h-8 text-xs bg-background border-border"
          />
          {searchInput && (
            <button
              type="button"
              onClick={handleClearSearch}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {/* Account filter — sectioned by type */}
        {accounts.length > 0 && (
          <Select
            value={filters.accountId || "all"}
            onValueChange={(v) => onFilterChange({ accountId: v === "all" ? "" : v, page: 1 })}
          >
            <SelectTrigger className="h-8 text-xs w-44 bg-background border-border">
              <SelectValue placeholder="All Accounts" />
            </SelectTrigger>
            <SelectContent className="bg-card border-border">
              <SelectItem value="all">All Accounts</SelectItem>

              {/* Personal section: normal + war */}
              {accounts.some((a) => a.type !== "prop") && (
                <>
                  <SelectSeparator />
                  <SelectGroup>
                    <SelectLabel className="text-[10px] text-muted-foreground px-2 py-1.5">
                      Personal
                    </SelectLabel>
                    {accounts
                      .filter((a) => a.type !== "prop")
                      .map((a) => (
                        <SelectItem key={a._id} value={a._id}>
                          <div className="flex items-center gap-1.5">
                            <AccountTypeBadge type={a.type} />
                            <span className="truncate max-w-[110px]">{a.name}</span>
                          </div>
                        </SelectItem>
                      ))}
                  </SelectGroup>
                </>
              )}

              {/* Prop section */}
              {accounts.some((a) => a.type === "prop") && (
                <>
                  <SelectSeparator />
                  <SelectGroup>
                    <SelectLabel className="text-[10px] text-muted-foreground px-2 py-1.5">
                      Prop Firm
                    </SelectLabel>
                    {accounts
                      .filter((a) => a.type === "prop")
                      .map((a) => (
                        <SelectItem key={a._id} value={a._id}>
                          <div className="flex items-center gap-1.5">
                            <AccountTypeBadge type="prop" />
                            <span className="truncate max-w-[110px]">{a.name}</span>
                          </div>
                        </SelectItem>
                      ))}
                  </SelectGroup>
                </>
              )}
            </SelectContent>
          </Select>
        )}

        {/* Type multi-select */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="h-8 text-xs gap-1 border-border">
              <Filter className="h-3.5 w-3.5" />
              {selectedTypes.length > 0
                ? `Type: ${selectedTypes.length}`
                : "Type: All"}
              <ChevronDown className="h-3 w-3 opacity-60" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="bg-card border-border w-44">
            <DropdownMenuLabel className="text-xs text-muted-foreground">
              Transaction Type
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            {ALL_TYPES.map((type) => {
              const Icon = TRANSACTION_ICONS[type];
              return (
                <DropdownMenuCheckboxItem
                  key={type}
                  checked={selectedTypes.includes(type)}
                  onCheckedChange={() => toggleType(type)}
                  className="text-xs gap-2"
                >
                  {Icon && <Icon className="h-3.5 w-3.5 flex-shrink-0" />}
                  {TRANSACTION_LABELS[type]}
                </DropdownMenuCheckboxItem>
              );
            })}
            {selectedTypes.length > 0 && (
              <>
                <DropdownMenuSeparator />
                <button
                  type="button"
                  className="w-full text-xs text-muted-foreground hover:text-foreground px-2 py-1.5 text-left"
                  onClick={() => onFilterChange({ type: "", page: 1 })}
                >
                  Clear
                </button>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Group by */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="h-8 text-xs gap-1 border-border">
              {GROUP_BY_OPTIONS.find((o) => o.value === groupBy)?.label ?? "Group by"}
              <ChevronDown className="h-3 w-3 opacity-60" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="bg-card border-border w-40">
            <DropdownMenuLabel className="text-xs text-muted-foreground">
              Group By
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuRadioGroup value={groupBy} onValueChange={onGroupByChange}>
              {GROUP_BY_OPTIONS.map((opt) => (
                <DropdownMenuRadioItem
                  key={opt.value}
                  value={opt.value}
                  className="text-xs"
                >
                  {opt.label}
                </DropdownMenuRadioItem>
              ))}
            </DropdownMenuRadioGroup>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Show reversed toggle */}
        <div className="flex items-center gap-2 ml-auto">
          <Switch
            id="show-reversed"
            checked={!!filters.showReversed}
            onCheckedChange={(v) => onFilterChange({ showReversed: v, page: 1 })}
          />
          <Label htmlFor="show-reversed" className="text-xs text-muted-foreground cursor-pointer whitespace-nowrap">
            Show reversed
          </Label>
        </div>

        {/* Result count */}
        <p className="text-xs text-muted-foreground whitespace-nowrap">
          {totalCount} transaction{totalCount !== 1 ? "s" : ""}
        </p>
      </div>

      {/* ── Period + Category pills row ──────────── */}
      <div className="flex items-center gap-4 flex-wrap">
        {/* Period presets */}
        <div className="flex items-center gap-1">
          {PERIOD_PRESETS.map((p) => (
            <PeriodPill
              key={p.value}
              value={p.value}
              label={p.label}
              active={(filters.period ?? "all") === p.value}
              onClick={() => onFilterChange({ period: p.value, page: 1 })}
            />
          ))}
        </div>

        {/* Category pills */}
        <div className="flex items-center gap-1">
          <CategoryPill
            value=""
            label="All"
            active={!filters.category}
            onClick={() => onFilterChange({ category: "", page: 1 })}
          />
          {ALL_CATEGORIES.map((cat) => (
            <CategoryPill
              key={cat}
              value={cat}
              label={CATEGORY_LABELS[cat]}
              active={filters.category === cat}
              onClick={() =>
                onFilterChange({
                  category: filters.category === cat ? "" : cat,
                  page: 1,
                })
              }
            />
          ))}
        </div>
      </div>

      {/* ── Active filter chips ──────────────────── */}
      {hasActiveFilters && (
        <div className="flex items-center gap-1.5 flex-wrap">
          {filters.search && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-primary/10 text-primary text-xs border border-primary/20">
              Search: {filters.search}
              <button type="button" onClick={handleClearSearch}>
                <X className="h-3 w-3" />
              </button>
            </span>
          )}
          {selectedTypes.map((type) => (
            <span
              key={type}
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-muted text-muted-foreground text-xs border border-border"
            >
              {TRANSACTION_LABELS[type]}
              <button type="button" onClick={() => toggleType(type)}>
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
          {filters.category && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-muted text-muted-foreground text-xs border border-border">
              {CATEGORY_LABELS[filters.category] ?? filters.category}
              <button type="button" onClick={() => onFilterChange({ category: "", page: 1 })}>
                <X className="h-3 w-3" />
              </button>
            </span>
          )}
          <button
            type="button"
            onClick={() =>
              onFilterChange({
                search: "",
                type: "",
                category: "",
                period: "all",
                showReversed: false,
                page: 1,
              })
            }
            className="text-xs text-muted-foreground hover:text-foreground underline"
          >
            Clear all
          </button>
        </div>
      )}
    </div>
  );
};
