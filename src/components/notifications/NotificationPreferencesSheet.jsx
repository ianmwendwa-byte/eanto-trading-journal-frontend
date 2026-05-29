import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Info, Lock, ChevronDown, ChevronUp } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import {
  useNotificationPreferences,
  useUpdateNotificationPreferences,
} from "@/hooks/useNotifications";
import {
  CATEGORY_CONFIG,
  CATEGORY_TYPES,
  CRITICAL_TYPES,
  NOTIFICATION_TYPE_LABELS,
  NOTIFICATION_TYPE_DESCRIPTIONS,
} from "@/constants/notifications";

export const NotificationPreferencesSheet = ({ open, onClose }) => {
  const { data: preferences, isLoading } = useNotificationPreferences();
  const updatePrefs = useUpdateNotificationPreferences();

  const [localPrefs, setLocalPrefs] = useState(null);
  const [expandedCategories, setExpandedCategories] = useState({});

  useEffect(() => {
    if (preferences) setLocalPrefs(preferences);
  }, [preferences]);

  const handleCategoryToggle = (category, enabled) => {
    setLocalPrefs((prev) => ({
      ...prev,
      [category]: { ...prev[category], enabled },
    }));
  };

  const handleTypeToggle = (type, enabled) => {
    setLocalPrefs((prev) => ({
      ...prev,
      overrides: {
        ...prev.overrides,
        [type]: { enabled },
      },
    }));
  };

  const toggleExpand = (category) => {
    setExpandedCategories((prev) => ({
      ...prev,
      [category]: !prev[category],
    }));
  };

  const handleSave = () => {
    if (!localPrefs) return;
    updatePrefs.mutate(localPrefs, {
      onSuccess: () => onClose(),
    });
  };

  const categoryHasAllCritical = (category) =>
    CATEGORY_TYPES[category]?.every((t) => CRITICAL_TYPES.includes(t));

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 z-50 bg-black/40"
            onClick={onClose}
          />

          {/* Sheet */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className={cn(
              "fixed right-0 top-0 h-full z-50 flex flex-col",
              "bg-card border-l border-border shadow-2xl w-full max-w-[500px]"
            )}
          >
            {/* Header */}
            <div className="flex items-start justify-between p-6 border-b border-border shrink-0">
              <div>
                <h2 className="font-heading font-semibold text-base text-foreground">
                  Notification Preferences
                </h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Control which notifications you receive
                </p>
              </div>
              <button
                onClick={onClose}
                className="h-8 w-8 flex items-center justify-center rounded-md hover:bg-muted transition-colors text-muted-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {/* Critical notice */}
              <div className="flex items-start gap-3 p-3 rounded-lg bg-primary/5 border border-primary/20">
                <Info className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Critical notifications (security, account blown, drawdown limits)
                  cannot be disabled and will always be delivered.
                </p>
              </div>

              {isLoading || !localPrefs ? (
                <div className="space-y-3">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="h-16 rounded-lg bg-muted animate-pulse" />
                  ))}
                </div>
              ) : (
                Object.entries(CATEGORY_CONFIG).map(([categoryKey, config]) => {
                  const CategoryIcon = config.icon;
                  const categoryEnabled = localPrefs[categoryKey]?.enabled ?? true;
                  const allCritical = categoryHasAllCritical(categoryKey);
                  const isExpanded = expandedCategories[categoryKey];
                  const types = CATEGORY_TYPES[categoryKey] ?? [];

                  return (
                    <div key={categoryKey} className="rounded-lg border border-border overflow-hidden">
                      {/* Category header */}
                      <button
                        onClick={() => toggleExpand(categoryKey)}
                        className="w-full flex items-center gap-3 p-4 hover:bg-muted/40 transition-colors text-left"
                      >
                        <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                          <CategoryIcon className="h-4 w-4 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-foreground">
                            {config.label}
                          </p>
                          <p className="text-xs text-muted-foreground truncate">
                            {config.description}
                          </p>
                        </div>
                        <div className="flex items-center gap-3 shrink-0" onClick={(e) => e.stopPropagation()}>
                          {allCritical ? (
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <div className="flex items-center gap-1 text-muted-foreground">
                                  <Lock className="h-3 w-3" />
                                  <span className="text-xs">Always on</span>
                                </div>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>All notifications in this category are critical</p>
                              </TooltipContent>
                            </Tooltip>
                          ) : (
                            <Switch
                              checked={categoryEnabled}
                              onCheckedChange={(v) => handleCategoryToggle(categoryKey, v)}
                            />
                          )}
                        </div>
                        {isExpanded ? (
                          <ChevronUp className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <ChevronDown className="h-4 w-4 text-muted-foreground" />
                        )}
                      </button>

                      {/* Individual type overrides */}
                      <AnimatePresence initial={false}>
                        {isExpanded && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2, ease: "easeOut" }}
                            style={{ overflow: "hidden" }}
                          >
                            <div className="border-t border-border">
                              {types.map((type) => {
                                const isCritical = CRITICAL_TYPES.includes(type);
                                const typeEnabled = localPrefs.overrides?.[type]?.enabled ?? true;

                                return (
                                  <div
                                    key={type}
                                    className="flex items-center gap-3 px-4 py-3 border-b border-border/50 last:border-0"
                                  >
                                    <div className="flex-1 min-w-0">
                                      <div className="flex items-center gap-1.5">
                                        <p className="text-xs font-medium text-foreground">
                                          {NOTIFICATION_TYPE_LABELS[type]}
                                        </p>
                                        {isCritical && (
                                          <Lock className="h-3 w-3 text-muted-foreground" />
                                        )}
                                      </div>
                                      <p className="text-[11px] text-muted-foreground mt-0.5">
                                        {NOTIFICATION_TYPE_DESCRIPTIONS[type]}
                                      </p>
                                    </div>
                                    <div className="shrink-0">
                                      {isCritical ? (
                                        <Tooltip>
                                          <TooltipTrigger asChild>
                                            <div>
                                              <Switch checked disabled />
                                            </div>
                                          </TooltipTrigger>
                                          <TooltipContent>
                                            <p>This notification cannot be disabled</p>
                                          </TooltipContent>
                                        </Tooltip>
                                      ) : (
                                        <Switch
                                          checked={categoryEnabled && typeEnabled}
                                          disabled={!categoryEnabled}
                                          onCheckedChange={(v) => handleTypeToggle(type, v)}
                                        />
                                      )}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })
              )}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-border shrink-0">
              <button
                onClick={handleSave}
                disabled={!localPrefs || updatePrefs.isPending}
                className={cn(
                  "w-full h-9 rounded-lg text-sm font-medium transition-colors",
                  "bg-primary text-primary-foreground hover:bg-primary/90",
                  "disabled:opacity-50 disabled:cursor-not-allowed"
                )}
              >
                {updatePrefs.isPending ? "Saving..." : "Save Preferences"}
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
