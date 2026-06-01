import { AnimatePresence, motion } from "framer-motion";
import { Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

export const AutoSaveIndicator = ({ status, className }) => {
  return (
    <div className={cn("flex items-center h-5", className)}>
      <AnimatePresence mode="wait">
        {status === "saving" && (
          <motion.div
            key="saving"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="flex items-center gap-1 text-muted-foreground"
          >
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
            <span className="text-xs">Saving...</span>
          </motion.div>
        )}

        {status === "saved" && (
          <motion.div
            key="saved"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="flex items-center gap-1"
            style={{ color: "var(--profit)" }}
          >
            <CheckCircle2 className="h-3.5 w-3.5" />
            <span className="text-xs font-medium">Saved</span>
          </motion.div>
        )}

        {status === "error" && (
          <motion.div
            key="error"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="flex items-center gap-1"
            style={{ color: "var(--loss)" }}
          >
            <AlertCircle className="h-3.5 w-3.5" />
            <span className="text-xs">Failed</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
