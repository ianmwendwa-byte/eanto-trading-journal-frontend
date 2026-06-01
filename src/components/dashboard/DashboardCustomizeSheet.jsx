import { useState, useEffect } from "react";
import {
  Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription,
} from "@/components/ui/sheet";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { useUpdateDashboardPreferences } from "@/hooks/useDashboard";
import { WIDGET_REGISTRY, WIDGET_CATEGORIES, DEFAULT_WIDGETS } from "@/constants/widgets";
import { Loader2 } from "lucide-react";

const CATEGORY_ORDER = [
  "portfolio", "prop", "performance", "activity",
  "charts", "score", "pairs", "sessions",
];

export const DashboardCustomizeSheet = ({ isOpen, onClose, preferences }) => {
  const [widgets, setWidgets] = useState([]);
  const { mutate: save, isPending } = useUpdateDashboardPreferences();

  // Initialise local state from preferences.
  // Always merge against DEFAULT_WIDGETS so every widget appears in the sheet,
  // even if the saved preferences predate a widget being added.
  useEffect(() => {
    if (!isOpen) return;
    const savedMap = new Map(
      (preferences?.widgets ?? []).map((w) => [w.id, w])
    );
    const merged = DEFAULT_WIDGETS.map((def) => ({
      ...def,
      ...(savedMap.has(def.id) ? { enabled: savedMap.get(def.id).enabled } : {}),
    }));
    setWidgets(merged);
  }, [isOpen, preferences]);

  const toggleWidget = (id) => {
    setWidgets((prev) =>
      prev.map((w) => (w.id === id ? { ...w, enabled: !w.enabled } : w))
    );
  };

  const handleSave = () => {
    save({ widgets }, { onSuccess: onClose });
  };

  // Group widgets by category for display
  const grouped = CATEGORY_ORDER.map((catKey) => {
    const cat = WIDGET_CATEGORIES[catKey];
    if (!cat) return null;
    const catWidgets = cat.ids
      .map((id) => ({
        registry: WIDGET_REGISTRY[id],
        pref:     widgets.find((w) => w.id === id),
      }))
      .filter((x) => x.registry && x.pref);
    if (!catWidgets.length) return null;
    return { key: catKey, label: cat.label, items: catWidgets };
  }).filter(Boolean);

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent
        side="right"
        className="w-full sm:w-[480px] bg-card border-border flex flex-col p-0"
      >
        <SheetHeader className="px-6 pt-6 pb-4 border-b border-border">
          <SheetTitle>Customize Dashboard</SheetTitle>
          <SheetDescription>Choose which widgets to display</SheetDescription>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-6">
          {!widgets.length ? (
            <div className="space-y-3">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-12 w-full rounded-lg" />
              ))}
            </div>
          ) : (
            grouped.map((group) => (
              <div key={group.key}>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-2">
                  {group.label}
                </p>
                <div className="space-y-1">
                  {group.items.map(({ registry, pref }) => (
                    <div
                      key={registry.id}
                      className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex-1 min-w-0 pr-4">
                        <p className="text-sm font-medium text-foreground">{registry.label}</p>
                        <p className="text-xs text-muted-foreground truncate">
                          {registry.description}
                        </p>
                      </div>
                      <Switch
                        checked={pref.enabled}
                        onCheckedChange={() => toggleWidget(registry.id)}
                      />
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>

        <div className="px-6 pb-6 pt-4 border-t border-border">
          <Button className="w-full" onClick={handleSave} disabled={isPending}>
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              "Save Changes"
            )}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
};
