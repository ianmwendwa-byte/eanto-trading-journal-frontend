import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BalanceHistoryChart } from "@/components/dashboard/BalanceHistoryChart";
import { InfoTooltip } from "@/components/shared/InfoTooltip";

export const BalanceChart = ({ data, isLoading, isCollapsed, onToggle }) => (
  <div className="trading-card overflow-hidden">
    <div className="flex items-center justify-between px-4 py-3 border-b border-border">
      <div className="flex items-center gap-2">
        <p className="text-[10px] uppercase tracking-wider font-medium text-muted-foreground">
          Balance History
        </p>
        <InfoTooltip content="Your account balance over time based on all transactions" />
      </div>
      <Button
        variant="ghost"
        size="sm"
        className="h-7 gap-1.5 text-xs text-muted-foreground hover:text-foreground"
        onClick={onToggle}
      >
        {isCollapsed ? (
          <>
            <ChevronDown className="h-3.5 w-3.5" />
            Expand
          </>
        ) : (
          <>
            <ChevronUp className="h-3.5 w-3.5" />
            Collapse
          </>
        )}
      </Button>
    </div>

    <AnimatePresence initial={false}>
      {!isCollapsed && (
        <motion.div
          key="chart-content"
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.25, ease: "easeInOut" }}
          style={{ overflow: "hidden" }}
        >
          <div className="h-56 p-4">
            <BalanceHistoryChart data={data} isLoading={isLoading} />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  </div>
);
