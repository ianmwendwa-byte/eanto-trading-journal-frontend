import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const LS_KEY = "kraviq_hints_seen";

const getSeenHints = () => {
  try { return JSON.parse(localStorage.getItem(LS_KEY) ?? "{}"); }
  catch { return {}; }
};

const markHintSeen = (hintKey) => {
  try {
    const seen = getSeenHints();
    seen[hintKey] = true;
    localStorage.setItem(LS_KEY, JSON.stringify(seen));
  } catch {}
};

export const OnboardingTooltip = ({
  hintKey,
  content,
  children,
  position = "bottom",
  className,
}) => {
  const [visible, setVisible] = useState(() => !getSeenHints()[hintKey]);

  const dismiss = () => {
    markHintSeen(hintKey);
    setVisible(false);
  };

  if (!visible) return children;

  const popoverClass = cn(
    "absolute z-50 w-56 p-3 rounded-xl shadow-lg",
    "bg-card border border-primary/30",
    position === "bottom" && "top-full left-1/2 -translate-x-1/2 mt-2.5",
    position === "top"    && "bottom-full left-1/2 -translate-x-1/2 mb-2.5",
    position === "right"  && "left-full top-1/2 -translate-y-1/2 ml-2.5",
    position === "left"   && "right-full top-1/2 -translate-y-1/2 mr-2.5",
  );

  const arrowClass = cn(
    "absolute w-2 h-2 bg-card border-primary/30 rotate-45",
    position === "bottom" && "-top-1 left-1/2 -translate-x-1/2 border-t border-l",
    position === "top"    && "-bottom-1 left-1/2 -translate-x-1/2 border-b border-r",
    position === "right"  && "-left-1 top-1/2 -translate-y-1/2 border-l border-b",
    position === "left"   && "-right-1 top-1/2 -translate-y-1/2 border-r border-t",
  );

  return (
    <div className={cn("relative inline-block", className)}>
      {children}
      <AnimatePresence>
        {visible && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: position === "bottom" ? 4 : -4 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className={popoverClass}
          >
            <div className={arrowClass} />
            <div className="flex items-start justify-between gap-2 mb-2">
              <div className="h-1.5 w-1.5 rounded-full bg-primary mt-1.5 flex-shrink-0" />
              <p className="text-xs text-foreground flex-1 leading-relaxed">{content}</p>
              <button
                type="button"
                onClick={dismiss}
                className="text-muted-foreground hover:text-foreground transition-colors flex-shrink-0"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
            <Button
              size="sm"
              variant="outline"
              className="h-6 text-[10px] px-2 w-full"
              onClick={dismiss}
            >
              Got it
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
