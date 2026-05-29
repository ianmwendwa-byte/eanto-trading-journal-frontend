import { useState, useEffect } from "react";
import { Search, LayoutGrid, List } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

const TYPE_FILTERS = [
  { value: "",       label: "All"    },
  { value: "normal", label: "Normal" },
  { value: "prop",   label: "Prop"   },
  { value: "war",    label: "War"    },
];

// Keys match what useAccounts splits into sortBy + sortOrder
const SORT_OPTIONS = [
  { value: "createdAt_desc",  label: "Newest first"        },
  { value: "createdAt_asc",   label: "Oldest first"        },
  { value: "balance_desc",    label: "Balance: High → Low" },
  { value: "balance_asc",     label: "Balance: Low → High" },
  { value: "name_asc",        label: "Name: A → Z"         },
  { value: "name_desc",       label: "Name: Z → A"         },
];

export const AccountsToolbar = ({
  search,
  onSearch,
  type,
  onTypeChange,
  sort,
  onSortChange,
  viewMode,
  onViewModeChange,
  totalCount,
}) => {
  const [inputValue, setInputValue] = useState(search);

  useEffect(() => { setInputValue(search); }, [search]);

  useEffect(() => {
    const t = setTimeout(() => {
      if (inputValue.trim() !== search) onSearch(inputValue.trim());
    }, 300);
    return () => clearTimeout(t);
  }, [inputValue]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="space-y-3">
      {/* Row 1: Search + Sort + View toggle */}
      <div className="flex items-center gap-2 flex-wrap">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
          <Input
            placeholder="Search accounts..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            className="pl-9 bg-card border-border h-9 text-sm"
          />
        </div>

        <Select value={sort} onValueChange={onSortChange}>
          <SelectTrigger className="w-48 h-9 bg-card border-border text-sm">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent className="bg-card border-border">
            {SORT_OPTIONS.map((o) => (
              <SelectItem key={o.value} value={o.value} className="text-sm">
                {o.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="flex items-center gap-0.5 border border-border rounded-lg p-0.5 bg-card">
          <Button
            variant="ghost"
            size="icon"
            className={cn("h-7 w-7 rounded-md", viewMode === "grid" && "bg-muted")}
            onClick={() => onViewModeChange("grid")}
          >
            <LayoutGrid className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className={cn("h-7 w-7 rounded-md", viewMode === "list" && "bg-muted")}
            onClick={() => onViewModeChange("list")}
          >
            <List className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      {/* Row 2: Type filter pills + count */}
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-1.5 flex-wrap">
          {TYPE_FILTERS.map((f) => (
            <button
              key={f.value}
              onClick={() => onTypeChange(f.value)}
              className={cn(
                "px-3 py-1 rounded-full text-xs font-medium transition-all",
                type === f.value
                  ? "bg-primary text-primary-foreground"
                  : "bg-card border border-border text-muted-foreground hover:text-foreground hover:border-foreground/30"
              )}
            >
              {f.label}
            </button>
          ))}
        </div>
        {totalCount !== undefined && (
          <p className="text-xs text-muted-foreground">
            {totalCount} account{totalCount !== 1 ? "s" : ""}
          </p>
        )}
      </div>
    </div>
  );
};
