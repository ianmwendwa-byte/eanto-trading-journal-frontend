import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { useUpdateEAConfig } from "@/hooks/useEA";
import { cn } from "@/lib/utils";

export const EAConfigPanel = ({ account, eaSync }) => {
  const [expanded, setExpanded] = useState(false);
  const [dirty, setDirty] = useState(false);

  const [enabledLocal, setEnabledLocal] = useState(eaSync?.enabled ?? false);
  const [syncMode, setSyncMode]         = useState(eaSync?.syncMode ?? "new_only");
  const [syncFromDate, setSyncFromDate] = useState(
    eaSync?.syncStartDate
      ? new Date(eaSync.syncStartDate).toISOString().split("T")[0]
      : new Date(account.createdAt ?? Date.now()).toISOString().split("T")[0]
  );

  const { mutate: updateConfig, isPending } = useUpdateEAConfig(account._id);

  const handleChange = (fn) => {
    fn();
    setDirty(true);
  };

  const handleSave = () => {
    const payload = {
      enabled:       enabledLocal,
      syncMode,
      ...(syncMode === "all" ? { syncStartDate: syncFromDate } : {}),
    };
    updateConfig(payload, { onSuccess: () => setDirty(false) });
  };

  return (
    <div className="trading-card overflow-hidden">
      <button
        type="button"
        onClick={() => setExpanded((p) => !p)}
        className="w-full flex items-center justify-between p-4 text-left hover:bg-muted/30 transition-colors"
      >
        <p className="text-sm font-semibold text-foreground">Advanced Settings</p>
        <motion.div animate={{ rotate: expanded ? 180 : 0 }} transition={{ duration: 0.2 }}>
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
            <div className="px-4 pb-4 pt-3 border-t border-border space-y-5">
              {/* Enable toggle */}
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-sm font-medium text-foreground">Enable EA Sync</Label>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Allow the EA to sync trades to this account
                  </p>
                </div>
                <Switch
                  checked={enabledLocal}
                  onCheckedChange={(v) => handleChange(() => setEnabledLocal(v))}
                />
              </div>

              {/* Sync mode */}
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Sync Mode</Label>
                <Select
                  value={syncMode}
                  onValueChange={(v) => handleChange(() => setSyncMode(v))}
                >
                  <SelectTrigger className="bg-background border-border">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-card border-border">
                    <SelectItem value="new_only">
                      <div>
                        <p className="font-medium">New Trades Only</p>
                        <p className="text-xs text-muted-foreground">Only sync trades opened after connecting</p>
                      </div>
                    </SelectItem>
                    <SelectItem value="all">
                      <div>
                        <p className="font-medium">All Trades</p>
                        <p className="text-xs text-muted-foreground">Sync all trades including those opened before connecting</p>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Sync start date — only for "all" mode */}
              {syncMode === "all" && (
                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">Sync trades from</Label>
                  <Input
                    type="date"
                    value={syncFromDate}
                    max={new Date().toISOString().split("T")[0]}
                    onChange={(e) => handleChange(() => setSyncFromDate(e.target.value))}
                    className="bg-background border-border"
                  />
                </div>
              )}

              {/* Note */}
              <p className="text-xs text-muted-foreground border border-border rounded-lg p-2.5">
                These settings affect how data is synced and require explicit confirmation before applying.
              </p>

              <Button
                onClick={handleSave}
                disabled={!dirty || isPending}
                className="w-full gap-2"
              >
                {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
                {isPending ? "Saving..." : "Save Configuration"}
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
