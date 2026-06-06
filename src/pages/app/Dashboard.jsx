import { useState, useEffect, useMemo } from "react";

import { LayoutDashboard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { WidgetSkeleton } from "@/components/dashboard/WidgetSkeleton";
import { DashboardFilterBar } from "@/components/dashboard/DashboardFilterBar";
import { DashboardCustomizeSheet } from "@/components/dashboard/DashboardCustomizeSheet";
import { ErrorState } from "@/components/shared/ErrorState";

// Widgets — overview-driven
import { PersonalOverviewWidget }   from "@/components/dashboard/widgets/PersonalOverviewWidget";
import { PropOverviewWidget }       from "@/components/dashboard/widgets/PropOverviewWidget";
import { WinRateWidget }            from "@/components/dashboard/widgets/WinRateWidget";
import { AvgRRWidget }              from "@/components/dashboard/widgets/AvgRRWidget";
import { StreakWidget }             from "@/components/dashboard/widgets/StreakWidget";
import { BusinessScoreWidget }      from "@/components/dashboard/widgets/BusinessScoreWidget";
import { RecentTradesWidget }       from "@/components/dashboard/widgets/RecentTradesWidget";
import { RecentTransactionsWidget } from "@/components/dashboard/widgets/RecentTransactionsWidget";
import { BalanceHistoryWidget }     from "@/components/dashboard/widgets/BalanceHistoryWidget";
import { PairPerformanceWidget }    from "@/components/dashboard/widgets/PairPerformanceWidget";
import { PropChallengesWidget }     from "@/components/dashboard/widgets/PropChallengesWidget";
import { ScoreBreakdownWidget }     from "@/components/dashboard/widgets/ScoreBreakdownWidget";

// Widgets — self-fetching (use their own hooks)
import { SessionPerformanceWidget } from "@/components/dashboard/widgets/SessionPerformanceWidget";
import { WeekdayPerformanceWidget } from "@/components/dashboard/widgets/WeekdayPerformanceWidget";
import { MonthlyPnlWidget }         from "@/components/dashboard/widgets/MonthlyPnlWidget";
import { ScoreHistoryWidget }       from "@/components/dashboard/widgets/ScoreHistoryWidget";

import { useDashboardOverview, useDashboardPreferences } from "@/hooks/useDashboard";
import { useAuthStore } from "@/store/useAuthStore";
import { getEnabledWidgets, getRequiredSections } from "@/utils/dashboardHelpers";
import { WIDGET_REGISTRY } from "@/constants/widgets";
import { cn } from "@/lib/utils";
import { AddAccountSheet } from "@/components/accounts/AddAccountSheet";
import { ContinueSetupBanner } from "@/components/shared/ContinueSetupBanner";
import { SetupProgressWidget } from "@/components/dashboard/SetupProgressWidget";

// ── Greeting ──────────────────────────────────────────────────────
const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
};

// ── Widget renderer ───────────────────────────────────────────────
const renderWidget = (widgetId, overview, isLoading) => {
  const registry = WIDGET_REGISTRY[widgetId];

  switch (widgetId) {
    case "personal_overview":
      return <PersonalOverviewWidget data={overview?.portfolio?.personal} isLoading={isLoading} />;
    case "prop_overview":
      return <PropOverviewWidget data={overview?.portfolio?.prop} isLoading={isLoading} />;
    case "win_rate":
      return <WinRateWidget data={overview?.performance} isLoading={isLoading} />;
    case "avg_rr":
      return <AvgRRWidget data={overview?.performance} isLoading={isLoading} />;
    case "streak":
      return <StreakWidget data={overview?.performance} isLoading={isLoading} />;
    case "business_score":
      return <BusinessScoreWidget data={overview?.score} isLoading={isLoading} />;
    case "recent_trades":
      return <RecentTradesWidget data={overview?.activity?.recentTrades} isLoading={isLoading} />;
    case "recent_transactions":
      return <RecentTransactionsWidget data={overview?.activity?.recentTransactions} isLoading={isLoading} />;
    case "balance_history":
      return <BalanceHistoryWidget data={overview?.charts?.balanceHistory} isLoading={isLoading} />;
    case "pair_performance":
      return <PairPerformanceWidget data={overview?.pairs?.pairs} isLoading={isLoading} />;
    case "prop_challenges":
      return <PropChallengesWidget data={overview?.portfolio?.prop} isLoading={isLoading} />;
    case "score_breakdown":
      return <ScoreBreakdownWidget data={overview?.score} isLoading={isLoading} />;

    // Self-fetching — don't pass data, they use their own hooks
    case "session_performance":
      return <SessionPerformanceWidget />;
    case "weekday_performance":
      return <WeekdayPerformanceWidget />;
    case "monthly_pnl":
      return <MonthlyPnlWidget />;
    case "score_history":
      return <ScoreHistoryWidget />;

    default:
      return null;
  }
};

// ── Grid col-span by widget size ──────────────────────────────────
// Grid is grid-cols-2 md:grid-cols-4
// small  → 1 col  (2 per row mobile, 4 per row desktop)
// medium → 2 cols (1 per row mobile, 2 per row desktop)
// large  → 2 cols mobile, 4 cols desktop (always full row)
const sizeToColSpan = (size) => {
  if (size === "large")  return "col-span-2 md:col-span-4";
  if (size === "medium") return "col-span-2";
  return "col-span-1";
};

// ── Dashboard page ────────────────────────────────────────────────
export const Dashboard = () => {
  const { mongoUser, onboardingComplete } = useAuthStore();
  const [period,        setPeriod]        = useState("1m");
  const [customizeOpen, setCustomizeOpen] = useState(false);

  // Preferences
  const { data: preferences, isLoading: prefLoading } = useDashboardPreferences();

  useEffect(() => {
    if (preferences?.defaultPeriod) setPeriod(preferences.defaultPeriod);
  }, [preferences]);

  // Enabled widgets sorted by order
  const enabledWidgets = useMemo(
    () => getEnabledWidgets(preferences?.widgets),
    [preferences]
  );

  // Required overview sections (self-fetching widgets don't add sections)
  const requiredSections = useMemo(
    () => getRequiredSections(enabledWidgets.map((w) => w.id)),
    [enabledWidgets]
  );

  // Overview fetch
  const {
    data:      overview,
    isLoading: overviewLoading,
    isError,
    error,
    refetch,
    isFetching,
  } = useDashboardOverview({ sections: requiredSections, period });

  const isLoading = prefLoading || overviewLoading;

  // Treat 404 (API not deployed yet) as empty rather than error
  const is404 = error?.status === 404 || error?.response?.status === 404;

  const hasNoAccounts =
    !isLoading &&
    (!isError || is404) &&
    !overview?.portfolio?.personal?.accountCount &&
    !overview?.portfolio?.prop?.accountCount;

  // Hard error (not 404)
  if (!isLoading && isError && !is404) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[60vh]">
        <ErrorState message="Failed to load dashboard data" onRetry={refetch} />
      </div>
    );
  }

  const firstName = mongoUser?.firstName ?? mongoUser?.name?.split(" ")[0] ?? "";

  return (
    <>
    <ContinueSetupBanner />
    <div className="p-6 space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {getGreeting()}{firstName ? `, ${firstName}` : ""}! 
          </p>
        </div>
      </div>

      {/* Filter bar */}
      <DashboardFilterBar
        period={period}
        onPeriodChange={setPeriod}
        onRefresh={refetch}
        onCustomize={() => setCustomizeOpen(true)}
        isFetching={isFetching}
      />

      {/* Welcome empty state — new user with no accounts */}
      {hasNoAccounts && !isLoading ? (
        <div className="flex flex-col items-center justify-center min-h-[50vh] text-center space-y-6">
          <div className="rounded-2xl bg-primary/10 p-5 border border-primary/20">
            <LayoutDashboard className="h-16 w-16 text-primary" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-foreground">Welcome to Kraviq</h2>
            <p className="text-muted-foreground font-medium">Your trading business OS is ready</p>
            <p className="text-sm text-muted-foreground max-w-md">
              Start by adding your first trading account. Track your performance, manage prop firm
              challenges, and grow your trading business.
            </p>
          </div>
          <Button asChild>
            <AddAccountSheet/>
          </Button>
        </div>
      ) : (
        /* Widget grid */
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {/* Setup progress — shown when onboarding not yet complete */}
          {!isLoading && onboardingComplete === false && (
            <div className="col-span-2">
              <SetupProgressWidget />
            </div>
          )}
          {isLoading
            ? enabledWidgets.map((w) => {
                const reg = WIDGET_REGISTRY[w.id];
                return (
                  <div key={w.id} className={sizeToColSpan(reg?.size)}>
                    <WidgetSkeleton size={reg?.size} />
                  </div>
                );
              })
            : enabledWidgets.map((widget) => {
                const reg     = WIDGET_REGISTRY[widget.id];
                const element = renderWidget(widget.id, overview, false);
                if (!element) return null;
                return (
                  <div key={widget.id} className={sizeToColSpan(reg?.size)}>
                    {element}
                  </div>
                );
              })
          }
        </div>
      )}

      {/* Customize sheet */}
      <DashboardCustomizeSheet
        isOpen={customizeOpen}
        onClose={() => setCustomizeOpen(false)}
        preferences={preferences}
      />
    </div>
    </>
  );
};
