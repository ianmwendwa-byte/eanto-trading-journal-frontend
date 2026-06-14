import { useState } from "react";
import {
  TrendingUp, Waves, Square, BarChart, Activity,
  GitBranch, Clock, Layers, CheckCircle, Newspaper,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// ── Category metadata ─────────────────────────────────────────
const CATEGORY_CFG = {
  market_structure: { label: "Market Structure", Icon: TrendingUp  },
  liquidity:        { label: "Liquidity",         Icon: Waves       },
  zones:            { label: "Zones",             Icon: Square      },
  volume:           { label: "Volume",            Icon: BarChart    },
  order_flow:       { label: "Order Flow",        Icon: Activity    },
  fibonacci:        { label: "Fibonacci",         Icon: GitBranch   },
  timing:           { label: "Timing",            Icon: Clock       },
  multi_timeframe:  { label: "Multi-Timeframe",   Icon: Layers      },
  confirmation:     { label: "Confirmation",      Icon: CheckCircle },
  fundamental:      { label: "Fundamental",       Icon: Newspaper   },
};

// ── Confluence calculation (display-only — never calculated here) ─
export const calculateConfluence = (setupCriteria, confluence, checkedMap) => {
  const mode = confluence?.mode ?? "all_required";
  if (mode === "min_count") {
    const minCount  = confluence?.minCount ?? 0;
    const total     = Object.values(checkedMap).filter(Boolean).length;
    return total >= minCount;
  }
  // all_required: every required criterion must be checked
  const required = setupCriteria.filter((c) => c.required);
  if (required.length === 0) return true; // no required items → vacuously met
  return required.every((c) => checkedMap[c.id]);
};

// ── Component ─────────────────────────────────────────────────
export const SetupCriteriaChecklist = ({
  strategy,
  initialChecked = [],
  onSubmit,
}) => {
  if (!strategy?.setupCriteria?.length) return null;

  const { setupCriteria, confluence } = strategy;

  // Build initial checked map from array
  const buildMap = (arr) => {
    const map = {};
    setupCriteria.forEach((c) => { map[c.id] = false; });
    arr.forEach(({ id, checked }) => { if (id in map) map[id] = checked; });
    return map;
  };

  const [checkedMap, setCheckedMap] = useState(() => buildMap(initialChecked));

  const toggle = (id) =>
    setCheckedMap((prev) => ({ ...prev, [id]: !prev[id] }));

  const confluenceMet = calculateConfluence(setupCriteria, confluence, checkedMap);
  const checkedCount  = Object.values(checkedMap).filter(Boolean).length;

  // Group criteria by category, preserving order
  const grouped = {};
  setupCriteria.forEach((c) => {
    const cat = c.category ?? "confirmation";
    if (!grouped[cat]) grouped[cat] = [];
    grouped[cat].push(c);
  });

  const handleSave = () => {
    const criteriaChecked = setupCriteria.map((c) => ({
      id:      c.id,
      checked: checkedMap[c.id] ?? false,
    }));
    onSubmit(criteriaChecked);
  };

  const mode     = confluence?.mode ?? "all_required";
  const minCount = confluence?.minCount ?? 0;

  const confluenceLabel = mode === "min_count"
    ? `${checkedCount} / ${minCount} required`
    : (() => {
        const req = setupCriteria.filter((c) => c.required);
        const met = req.filter((c) => checkedMap[c.id]).length;
        return `${met} / ${req.length} required`;
      })();

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Setup Criteria
        </p>
        <span className={cn(
          "text-xs font-medium px-2 py-0.5 rounded border",
          confluenceMet
            ? "bg-[var(--profit)]/10 text-[var(--profit)] border-[var(--profit)]/20"
            : "bg-muted text-muted-foreground border-border"
        )}>
          {confluenceMet ? "✓ Confluence Met" : "✗ Not Met"} ({confluenceLabel})
        </span>
      </div>

      <div className="trading-card divide-y divide-border overflow-hidden">
        {Object.entries(grouped).map(([cat, items]) => {
          const cfg = CATEGORY_CFG[cat] ?? { label: cat, Icon: CheckCircle };
          const { Icon } = cfg;
          return (
            <div key={cat}>
              {/* Category header */}
              <div className="flex items-center gap-1.5 px-3 py-2 bg-muted/30">
                <Icon className="h-3 w-3 text-muted-foreground" />
                <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  {cfg.label}
                </span>
              </div>
              {/* Criteria rows */}
              {items.map((criterion) => (
                <label
                  key={criterion.id}
                  className="flex items-center justify-between gap-3 px-3 py-2.5 cursor-pointer hover:bg-muted/20 transition-colors"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <input
                      type="checkbox"
                      checked={checkedMap[criterion.id] ?? false}
                      onChange={() => toggle(criterion.id)}
                      className="h-3.5 w-3.5 rounded accent-[var(--primary)] flex-shrink-0"
                    />
                    <span className="text-sm text-foreground leading-snug truncate">
                      {criterion.label}
                    </span>
                  </div>
                  <span className={cn(
                    "text-[10px] font-medium px-1.5 py-0.5 rounded border flex-shrink-0",
                    criterion.required
                      ? "bg-primary/10 text-primary border-primary/20"
                      : "bg-muted text-muted-foreground border-border"
                  )}>
                    {criterion.required ? "Required" : "Optional"}
                  </span>
                </label>
              ))}
            </div>
          );
        })}
      </div>

      <Button size="sm" onClick={handleSave} className="w-full">
        Save Setup
      </Button>
    </div>
  );
};
