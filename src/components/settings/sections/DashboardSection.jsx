import { useState, useEffect, useCallback } from "react";
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
import { AlertCircle } from "lucide-react";
import { AutoSaveIndicator }  from "@/components/settings/AutoSaveIndicator";
import { useAutoSave }        from "@/hooks/useAutoSave";
import { useDashboardPreferences } from "@/hooks/useDashboard";
import { useSilentUpdateDashboardPreferences } from "@/hooks/useUser";
import { useAccounts }        from "@/hooks/useAccounts";
import { WIDGET_REGISTRY, WIDGET_CATEGORIES, DEFAULT_WIDGETS } from "@/constants/widgets";
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

export const DashboardSection = ({ onDirtyChange }) => {
  const { data: prefs, isLoading: prefsLoading } = useDashboardPreferences();
  const { mutateAsync: updatePrefs } = useSilentUpdateDashboardPreferences();
  const { data: accountsData } = useAccounts({ limit: 50 });
  const accounts = accountsData?.accounts ?? [];

  const [resetDialogOpen, setResetDialogOpen] = useState(false);

  const buildWidgets = useCallback((savedWidgets) => {
    const savedMap = new Map((savedWidgets ?? []).map((w) => [w.id, w]));
    return DEFAULT_WIDGETS.map((def) => ({
      ...def,
      ...(savedMap.has(def.id) ? { enabled: savedMap.get(def.id).enabled } : {}),
    }));
  }, []);

  const [defaultPeriod,  setDefaultPeriod]  = useState("1m");
  const [accountFilter,  setAccountFilter]  = useState("all");
  const [widgets, setWidgets] = useState(() => buildWidgets(null));

  useEffect(() => {
    if (!prefs) return;
    setDefaultPeriod(prefs.defaultPeriod ?? "1m");
    setAccountFilter(prefs.defaultAccountFilter ?? "all");
    setWidgets(buildWidgets(prefs.widgets));
  }, [prefs, buildWidgets]);

  const { save, status, error, isDirty } = useAutoSave({
    mutationFn: (d) => updatePrefs(d),
  });

  useEffect(() => { onDirtyChange?.(isDirty); }, [isDirty]); // eslint-disable-line react-hooks/exhaustive-deps

  const handlePeriod = (value) => {
    setDefaultPeriod(value);
    save({ defaultPeriod: value });
  };

  const handleAccountFilter = (value) => {
    setAccountFilter(value);
    save({ defaultAccountFilter: value });
  };

  const handleWidgetToggle = (id) => {
    const next = widgets.map((w) => (w.id === id ? { ...w, enabled: !w.enabled } : w));
    setWidgets(next);
    save({ widgets: next });
  };

  const handleReset = () => {
    setWidgets(DEFAULT_WIDGETS);
    save({ widgets: DEFAULT_WIDGETS });
    setResetDialogOpen(false);
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
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-foreground">Dashboard Settings</p>
        <AutoSaveIndicator status={status} />
      </div>

      {error && (
        <p className="text-xs flex items-center gap-1 p-2 rounded-md bg-destructive/10"
           style={{ color: "var(--loss)" }}>
          <AlertCircle className="h-3.5 w-3.5" />
          {error}
        </p>
      )}

      <Tabs defaultValue="defaults">
        <TabsList className="bg-muted/50">
          <TabsTrigger value="defaults">Defaults</TabsTrigger>
          <TabsTrigger value="widgets">Widgets</TabsTrigger>
        </TabsList>

        {/* ── Defaults ────────────────────────────── */}
        <TabsContent value="defaults" className="mt-4 space-y-6">
          {/* Default period */}
          <div className="space-y-2.5">
            <p className="text-xs font-medium text-foreground">Default Time Period</p>
            <div className="flex flex-wrap gap-2">
              {PERIODS.map(({ value, label }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => handlePeriod(value)}
                  className={cn(
                    "px-3 py-1.5 rounded-lg text-xs font-medium border transition-all duration-150",
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
            <Select
              value={accountFilter}
              onValueChange={handleAccountFilter}
            >
              <SelectTrigger className="bg-background border-border">
                <SelectValue placeholder="Select account" />
              </SelectTrigger>
              <SelectContent className="bg-card border-border">
                <SelectItem value="all">All Accounts</SelectItem>
                {accounts.map((a) => (
                  <SelectItem key={a._id} value={a._id}>
                    {a.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </TabsContent>

        {/* ── Widgets ─────────────────────────────── */}
        <TabsContent value="widgets" className="mt-4 space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-xs text-muted-foreground">
              Choose which widgets appear on your dashboard.
            </p>
            <Button
              variant="outline"
              size="sm"
              className="text-xs h-7"
              onClick={() => setResetDialogOpen(true)}
            >
              Reset to defaults
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
                    className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex-1 min-w-0 pr-4">
                      <p className="text-sm font-medium text-foreground">{registry.label}</p>
                      <p className="text-xs text-muted-foreground truncate">{registry.description}</p>
                    </div>
                    <Switch
                      checked={pref.enabled}
                      onCheckedChange={() => handleWidgetToggle(registry.id)}
                    />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </TabsContent>
      </Tabs>

      {/* Reset dialog */}
      <AlertDialog open={resetDialogOpen} onOpenChange={setResetDialogOpen}>
        <AlertDialogContent className="bg-card border-border">
          <AlertDialogHeader>
            <AlertDialogTitle>Reset widget layout?</AlertDialogTitle>
            <AlertDialogDescription>
              This will restore the default dashboard configuration.
              Your current widget preferences will be lost.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <Button variant="outline" onClick={() => setResetDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleReset}>Reset</Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
