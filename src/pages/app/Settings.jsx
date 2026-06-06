import { useState, useMemo } from "react";
import { useSearchParams, useBlocker } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle,
  AlertDialogDescription, AlertDialogFooter,
} from "@/components/ui/alert-dialog";
import { SettingsSidebar, SETTINGS_SECTIONS } from "@/components/settings/SettingsSidebar";
import { ProfileSection }       from "@/components/settings/sections/ProfileSection";
import { TradingSection }       from "@/components/settings/sections/TradingSection";
import { NotificationsSection } from "@/components/settings/sections/NotificationsSection";
import { AIPreferencesSection } from "@/components/settings/sections/AIPreferencesSection";
import { DashboardSection }     from "@/components/settings/sections/DashboardSection";
import { SecuritySection }      from "@/components/settings/sections/SecuritySection";
import { BetaSection }          from "@/components/settings/sections/BetaSection";
import { SubscriptionSection }  from "@/components/settings/sections/SubscriptionSection";
import { pageVariants } from "@/lib/animations";
import { cn } from "@/lib/utils";

const SECTION_COMPONENTS = {
  profile:      ProfileSection,
  trading:      TradingSection,
  notifications:NotificationsSection,
  ai:           AIPreferencesSection,
  dashboard:    DashboardSection,
  security:     SecuritySection,
  beta:         BetaSection,
  subscription: SubscriptionSection,
};

// Settings page header is py-4 + text-xl (28px) + mt-0.5 + text-sm (20px) + border = ~84px
// Desktop sidebar and mobile tabs use this offset to stick below the header
const HEADER_HEIGHT = 84;

export const Settings = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const rawSection = searchParams.get("section") ?? "profile";
  const activeSection = SETTINGS_SECTIONS.some((s) => s.id === rawSection)
    ? rawSection
    : "profile";

  const [dirtySections, setDirtySections] = useState({});
  const isDirty = Object.values(dirtySections).some(Boolean);

  // Stable callbacks — prevents infinite loops
  const dirtyChangers = useMemo(
    () =>
      Object.fromEntries(
        SETTINGS_SECTIONS.map(({ id }) => [
          id,
          (dirty) =>
            setDirtySections((prev) => {
              if (prev[id] === dirty) return prev;
              return { ...prev, [id]: dirty };
            }),
        ])
      ),
    []
  );

  const handleSectionChange = (id) => {
    setSearchParams({ section: id }, { replace: true });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const blocker = useBlocker(
    ({ currentLocation, nextLocation }) =>
      isDirty && currentLocation.pathname !== nextLocation.pathname
  );

  const activeSectionData = SETTINGS_SECTIONS.find((s) => s.id === activeSection);

  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="min-h-full"
    >
      {/* ── Page header ─────────────────────────────── */}
      <div className="border-b border-border bg-background/50 backdrop-blur-sm sticky top-0 z-20">
        <div className="px-4 py-4 sm:px-6">
          <h1 className="font-heading font-bold text-xl text-foreground">Settings</h1>
          {activeSectionData && (
            <p className="text-sm text-muted-foreground mt-0.5">
              {activeSectionData.label}
            </p>
          )}
        </div>
      </div>

      <div className="flex">
        {/* ── Desktop sidebar ──────────────────────── */}
        <div
          className="hidden md:block w-56 shrink-0 border-r border-border p-4 sticky h-[calc(100vh-57px-84px)] overflow-y-auto"
          style={{ top: HEADER_HEIGHT }}
        >
          <SettingsSidebar
            activeSection={activeSection}
            onSectionChange={handleSectionChange}
          />
        </div>

        {/* ── Content column (full width on mobile) ── */}
        <div className="flex-1 min-w-0 flex flex-col">
          {/* Mobile section tabs — inside content column to prevent flex-row collision */}
          <div
            className="md:hidden w-full border-b border-border overflow-x-auto sticky z-10 bg-background"
            style={{ top: HEADER_HEIGHT }}
          >
            <div className="flex gap-1 px-3 py-2 min-w-max">
              {SETTINGS_SECTIONS.map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => handleSectionChange(id)}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors",
                    activeSection === id
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground"
                  )}
                >
                  <Icon className="h-3 w-3" />
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Section content */}
          <div className="px-4 py-5 sm:px-6 sm:py-6">
            <div className="max-w-2xl">
              {Object.entries(SECTION_COMPONENTS).map(([id, Component]) => (
                <div
                  key={id}
                  className={activeSection === id ? "block" : "hidden"}
                >
                  {id === "security" || id === "subscription" ? (
                    <Component />
                  ) : (
                    <Component onDirtyChange={dirtyChangers[id]} />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Unsaved changes blocker dialog ─────────── */}
      <AlertDialog open={blocker.state === "blocked"}>
        <AlertDialogContent className="bg-card border-border">
          <AlertDialogHeader>
            <AlertDialogTitle>You have unsaved changes</AlertDialogTitle>
            <AlertDialogDescription>
              You have unsaved changes that will be lost if you leave this page.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col-reverse sm:flex-row gap-2 sm:gap-0">
            <Button
              variant="ghost"
              className="text-destructive hover:text-destructive hover:bg-destructive/10 w-full sm:w-auto"
              onClick={() => blocker.proceed?.()}
            >
              Discard & leave
            </Button>
            <Button className="w-full sm:w-auto" onClick={() => blocker.reset?.()}>
              Stay & save
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </motion.div>
  );
};
