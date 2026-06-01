import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Download, FolderOpen, BarChart2, Key, Zap, CheckCircle2, ChevronDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const STEPS = [
  {
    icon: Download,
    title: "Download Tradecore EA",
    content: "The Tradecore EA file (.ex5 for MT5, .ex4 for MT4) can be downloaded from your account dashboard.",
    note: "coming_soon",
  },
  {
    icon: FolderOpen,
    title: "Install in Your Terminal",
    content: (
      <span>
        In MetaTrader, go to:{" "}
        <span className="font-mono text-[11px] bg-muted px-1.5 py-0.5 rounded">
          File → Open Data Folder → MQL5/Experts
        </span>{" "}
        (for MT5) or{" "}
        <span className="font-mono text-[11px] bg-muted px-1.5 py-0.5 rounded">
          MQL4/Experts
        </span>{" "}
        (for MT4). Copy the Tradecore EA file into this folder, then restart MetaTrader or press F5 to refresh.
      </span>
    ),
  },
  {
    icon: BarChart2,
    title: "Attach EA to a Chart",
    content: "Open any chart in MetaTrader. In the Navigator panel, find 'Tradecore EA' under Expert Advisors. Double-click or drag it onto the chart.",
  },
  {
    icon: Key,
    title: "Configure with Your API Key",
    content: "In the EA settings dialog, paste your API key into the 'API Key' field.",
  },
  {
    icon: Zap,
    title: "Enable Auto-Trading",
    content: "Make sure the Auto Trading button in MetaTrader toolbar is enabled (green smiley face icon). The EA will appear in the top-right of your chart when active.",
  },
  {
    icon: CheckCircle2,
    title: "Verify Connection",
    content: "Return to Tradecore. Within 30 seconds, your EA status should change to 'Online' and broker details will appear.",
  },
];

const Step = ({ step, number, isLast }) => {
  const Icon = step.icon;
  return (
    <div className="flex gap-3">
      {/* Number + connector */}
      <div className="flex flex-col items-center">
        <div className="w-6 h-6 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0">
          <span className="text-[10px] font-bold text-primary">{number}</span>
        </div>
        {!isLast && <div className="w-px flex-1 bg-border mt-1.5 mb-1.5 min-h-[16px]" />}
      </div>

      {/* Content */}
      <div className={cn("flex-1", !isLast && "pb-4")}>
        <div className="flex items-center gap-1.5 mb-1">
          <Icon className="h-3.5 w-3.5 text-muted-foreground" />
          <p className="text-xs font-semibold text-foreground">{step.title}</p>
        </div>
        <div className="text-xs text-muted-foreground leading-relaxed">
          {step.content}
        </div>
        {step.note === "coming_soon" && (
          <Button variant="outline" size="sm" disabled className="mt-2 h-7 text-xs opacity-50">
            Download EA — Coming Soon
          </Button>
        )}
      </div>
    </div>
  );
};

export const EASetupInstructions = ({ className }) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className={cn("trading-card overflow-hidden", className)}>
      <button
        type="button"
        onClick={() => setExpanded((p) => !p)}
        className="w-full flex items-center justify-between p-4 text-left hover:bg-muted/30 transition-colors"
      >
        <div className="flex items-center gap-2">
          <Zap className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-semibold text-foreground">How to Connect Your EA</span>
        </div>
        <motion.div
          animate={{ rotate: expanded ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        </motion.div>
      </button>

      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            style={{ overflow: "hidden" }}
          >
            <div className="px-4 pb-4 border-t border-border pt-4">
              {STEPS.map((step, i) => (
                <Step key={i} step={step} number={i + 1} isLast={i === STEPS.length - 1} />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
