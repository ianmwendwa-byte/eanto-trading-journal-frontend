import { useState, useEffect, useCallback, useMemo } from "react";
import {
  Select, SelectContent, SelectItem,
  SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Switch }  from "@/components/ui/switch";
import { Button }  from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle,
  AlertDialogDescription, AlertDialogFooter,
} from "@/components/ui/alert-dialog";
import { Save, Loader2 } from "lucide-react";
import { useDashboardPreferences } from "@/hooks/useDashboard";
import { useSilentUpdateDashboardPreferences } from "@/hooks/useUser";
import { useAccounts } from "@/hooks/useAccounts";
import { WIDGET_REGISTRY, WIDGET_CATEGORIES, DEFAULT_WIDGETS } from "@/constants/widgets";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const PERIODS = [
  { value: "today", label: "Today" },
  { value: "7d",    label: "1W" },
  { value: "1m",    label: "1M" },
  { value: "3m",    label: "3M" },
  { value: "ytd",   label: "YTD" },
  { value: "all",   label: "All" },
];

const CATEGORY_ORDER = [
  "portfolio", "performance", "activity", "charts", "sessions", "score", "pairs", "prop",
];

// Stable key for widget dirty comparison — only tracks enabled state per id
const widgetKey = (ws) => ws.map((w) => `${w.id}:${w.enabled}`).join(",");

export const DashboardSection = ({ onDirtyChange }) => {
  const { data: prefs, isLoading: prefsLoading } = useDashboardPreferences();
  const { mutateAsync: updatePrefs, isPending }  = useSilentUpdateDashboardPreferences();
  const { data: accountsData } = useAccounts({ limit: 50 });
  const accounts = accountsData?.accounts ?? [];

  const [resetDialogOpen, setResetDialogOpen] = useState(false);
  const [resetPending,    setResetPending]    = useState(false);

  const buildWidgets = useCallback((savedWidgets) => {
    const savedMap = new Map((savedWidgets ?? []).map((w) => [w.id, w]));
    return DEFAULT_WIDGETS.map((def) => ({
      ...def,
      ...(savedMap.has(def.id) ? { enabled: savedMap.get(def.id).enabled } : {}),
    }));
  }, []);

  const [defaultPeriod, setDefaultPeriod] = useState("1m");
  const [accountFilter, setAccountFilter] = useState("all");
  const [widgets,       setWidgets]       = useState(() => buildWidgets(null));

  useEffect(() => {
    if (!prefs) return;
    setDefaultPeriod(prefs.defaultPeriod        ?? "1m");
    setAccountFilter(prefs.defaultAccountFilter ?? "all");
    setWidgets(buildWidgets(prefs.widgets));
  }, [prefs, buildWidgets]);

  const isDirty = useMemo(() => {
    if (!prefs) return false;
    return (
      defaultPeriod !== (prefs.defaultPeriod        ?? "1m")  ||
      accountFilter !== (prefs.defaultAccountFilter ?? "all") ||
      widgetKey(widgets) !== widgetKey(buildWidgets(prefs.widgets))
    );
  }, [defaultPeriod, accountFilter, widgets, prefs, buildWidgets]);

  useEffect(() => { onDirtyChange?.(isDirty); }, [isDirty]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSave = async () => {
    try {
      await updatePrefs({
        defaultPeriod,
        defaultAccountFilter: accountFilter,
        widgets,
      });
      toast.success("Dashboard settings saved");
    } catch (err) {
      const msg = err?.response?.data?.message ?? err?.message ?? "Failed to save";
      toast.error(msg);
    }
  };

  // Reset saves immediately — user already confirmed in the dialog
  const handleReset = async () => {
    setResetDialogOpen(false);
    setWidgets(DEFAULT_WIDGETS);
    setResetPending(true);
    try {
      await updatePrefs({ widgets: DEFAULT_WIDGETS });
      toast.success("Widget layout reset to defaults");
    } catch (err) {
      toast.error("Failed to reset widgets");
    } finally {
      setResetPending(false);
    }
  };

  const grouped = CATEGORY_ORDER.map((catKey) => {
    const cat = WIDGET_CATEGORIES[catKey];
    if (!cat) return null;
    const items = cat.ids
      .map((id) => ({
        registry: WIDGET_REGISTRY[id],
        pref:     widgets.find((w) => w.id === id),
      }))
      .filter((x) => x.registry && x.pref);
    if (!items.length) return null;
    return { key: catKey, label: cat.label, items };
  }).filter(Boolean);

  if (prefsLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => <Skeleton key={i} className="h-10 w-full" />)}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Tabs defaultValue="defaults">
        <TabsList className="bg-muted/50 w-full sm:w-auto">
          <TabsTrigger value="defaults" className="flex-1 sm:flex-none">Defaults</TabsTrigger>
          <TabsTrigger value="widgets"  className="flex-1 sm:flex-none">Widgets</TabsTrigger>
        </TabsList>

        {/* ── Defaults ────────────────────────────── */}
        <TabsContent value="defaults" className="mt-4 space-y-6">
          {/* Default time period */}
          <div className="space-y-2.5">
            <p className="text-xs font-medium text-foreground">Default Time Period</p>
            <div className="flex flex-wrap gap-2">
              {PERIODS.map(({ value, label }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setDefaultPeriod(value)}
                  className={cn(
                    "px-3 py-2 rounded-lg text-xs font-medium border transition-all duration-150 min-h-[44px] sm:min-h-0 sm:py-1.5",
                    defaultPeriod === value
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-muted text-muted-foreground border-border hover:border-primary/30 hover:text-foreground"
                  )}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Default account filter */}
          <div className="space-y-2.5">
            <p className="text-xs font-medium text-foreground">Default Account Filter</p>
            <Select value={accountFilter} onValueChange={setAccountFilter}>
              <SelectTrigger className="bg-background border-border h-11">
                <SelectValue placeholder="Select account" />
              </SelectTrigger>
              <SelectContent className="bg-card border-border">
                <SelectItem value="all">All Accounts</SelectItem>
                {accounts.map((a) => (
                  <SelectItem key={a._id} value={a._id}>{a.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </TabsContent>

        {/* ── Widgets ─────────────────────────────── */}
        <TabsContent value="widgets" className="mt-4 space-y-4">
          <div className="flex items-center justify-between gap-2">
            <p className="text-xs text-muted-foreground">
              Choose which widgets appear on your dashboard.
            </p>
            <Button
              variant="outline"
              size="sm"
              className="text-xs h-8 shrink-0"
              onClick={() => setResetDialogOpen(true)}
              disabled={resetPending}
            >
              {resetPending ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : (
                "Reset to defaults"
              )}
            </Button>
          </div>

          {grouped.map((group) => (
            <div key={group.key}>
              <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest mb-1.5">
                {group.label}
              </p>
              <div className="space-y-0.5">
                {group.items.map(({ registry, pref }) => (
                  <div
                    key={registry.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors min-h-[56px]"
                  >
                    <div className="flex-1 min-w-0 pr-4">
                      <p className="text-sm font-medium text-foreground">{registry.label}</p>
                      <p className="text-xs text-muted-foreground truncate">{registry.description}</p>
                    </div>
                    <Switch
                      checked={pref.enabled}
                      onCheckedChange={() =>
                        setWidgets((prev) =>
                          prev.map((w) => (w.id === registry.id ? { ...w, enabled: !w.enabled } : w))
                        )
                      }
                    />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </TabsContent>
      </Tabs>

      {/* ── Save footer ─────────────────────────── */}
      <div className="pt-4 border-t border-border flex flex-col-reverse sm:flex-row sm:items-center gap-3">
        {isDirty && (
          <p className="text-xs text-muted-foreground text-center sm:text-left">Unsaved changes</p>
        )}
        <Button
          onClick={handleSave}
          disabled={!isDirty || isPending}
          size="sm"
          className="sm:ml-auto w-full sm:w-auto min-h-[44px] sm:min-h-0"
        >
          {isPending ? (
            <><Loader2 className="h-3.5 w-3.5 mr-2 animate-spin" />Saving...</>
          ) : (
            <><Save className="h-3.5 w-3.5 mr-2" />Save Changes</>
          )}
        </Button>
      </div>

      {/* Reset confirmation dialog */}
      <AlertDialog open={resetDialogOpen} onOpenChange={setResetDialogOpen}>
        <AlertDialogContent className="bg-card border-border">
          <AlertDialogHeader>
            <AlertDialogTitle>Reset widget layout?</AlertDialogTitle>
            <AlertDialogDescription>
              This will restore the default dashboard configuration.
              Your current widget preferences will be lost.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col-reverse sm:flex-row gap-2 sm:gap-0">
            <Button
              variant="outline"
              className="w-full sm:w-auto"
              onClick={() => setResetDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button className="w-full sm:w-auto" onClick={handleReset}>
              Reset
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
