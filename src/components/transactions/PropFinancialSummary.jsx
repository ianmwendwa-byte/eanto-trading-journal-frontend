import { useState } from "react";
import { Trophy, ChevronDown, ChevronUp } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { InfoTooltip } from "@/components/shared/InfoTooltip";
import { formatCurrency, formatDate } from "@/utils/format";
import { cn } from "@/lib/utils";

const StatRow = ({ label, value, colorClass, tooltip }) => (
  <div className="space-y-0.5">
    <div className="flex items-center gap-1">
      <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">
        {label}
      </p>
      {tooltip && <InfoTooltip content={tooltip} />}
    </div>
    <p className={cn("text-lg font-mono font-bold", colorClass ?? "text-foreground")}>
      {value}
    </p>
  </div>
);

export const PropFinancialSummary = ({ summary, account, isLoading }) => {
  const [collapsed, setCollapsed] = useState(false);

  const propFirmName = account?.propRules?.propFirmName ?? "Prop Firm";
  // All values come directly from the API summary — no frontend calculations.
  const totalFees    = summary?.totalPropFees ?? null;
  const totalPayouts = summary?.totalPayouts  ?? null;
  const splitPct     = account?.propRules?.payoutRules?.profitSplitPercent ?? null;

  return (
    <div className="trading-card overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <div className="flex items-center gap-2">
          <Trophy className="h-4 w-4 text-[var(--warning)]" />
          <p className="text-sm font-medium text-foreground">
            {propFirmName} Financial Summary
          </p>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="h-7 gap-1.5 text-xs text-muted-foreground hover:text-foreground"
          onClick={() => setCollapsed((v) => !v)}
        >
          {collapsed ? (
            <><ChevronDown className="h-3.5 w-3.5" />Expand</>
          ) : (
            <><ChevronUp className="h-3.5 w-3.5" />Collapse</>
          )}
        </Button>
      </div>

      <AnimatePresence initial={false}>
        {!collapsed && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            style={{ overflow: "hidden" }}
          >
            <div className="p-4">
              {isLoading ? (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="space-y-1.5">
                      <Skeleton className="h-3 w-24" />
                      <Skeleton className="h-6 w-20" />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <StatRow
                    label="Fees Invested"
                    value={totalFees !== null ? formatCurrency(totalFees) : "—"}
                    colorClass="text-[var(--loss)]"
                    tooltip="Total challenge fees paid to this prop firm (from API)"
                  />
                  <StatRow
                    label="Payouts Received"
                    value={totalPayouts !== null ? formatCurrency(totalPayouts) : "—"}
                    colorClass="text-[var(--profit)]"
                    tooltip="Total payouts received from this prop firm (from API)"
                  />
                  {splitPct !== null && (
                    <StatRow
                      label="Profit Split"
                      value={`${splitPct}%`}
                      colorClass="text-foreground"
                      tooltip="Your percentage of profits earned from this prop firm"
                    />
                  )}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
