import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard, Wallet, ArrowLeftRight, TrendingUp,
  BarChart3, Upload, Cpu, Trophy, Target, Lightbulb,
  Bot, ChevronLeft, ChevronRight, LogOut, X,
} from "lucide-react";
import Logo from "@/components/shared/Logo";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/store/useAuthStore";
import { useAuth } from "@/hooks/useAuth";
import { Badge } from "@/components/ui/badge";
import { useAccounts } from "@/hooks/useAccounts";
import { useMemo } from "react";

const NAV_SECTIONS = [
  {
    label: "OVERVIEW",
    items: [
      { label: "Dashboard",     icon: LayoutDashboard, path: "/dashboard" },
      { label: "Accounts",      icon: Wallet,          path: "/accounts" },
      { label: "Transactions",  icon: ArrowLeftRight,  path: "/transactions" },
    ],
  },
  {
    label: "TRADING",
    items: [
      { label: "Trades",    icon: TrendingUp, path: "/trades" },
      { label: "Analytics", icon: BarChart3,  path: "/analytics", soon: true },
    ],
  },
  {
    label: "TOOLS",
    items: [
      { label: "CSV Import",      icon: Upload,  path: "/import", soon: true },
      { label: "EA Sync",         icon: Cpu,     path: "/ea"     },
      { label: "Business Score",  icon: Trophy,  path: "/score",  soon: true },
    ],
  },
  {
    label: "COMING SOON",
    items: [
      { label: "Strategies", icon: Target,    path: "/strategies", soon: true },
      { label: "Insights",   icon: Lightbulb, path: "/insights",   soon: true },
      { label: "AI Coach",   icon: Bot,       path: "/ai",         soon: true },
    ],
  },
];

const NavItem = ({ item, collapsed, eaBadge }) => {
  const location = useLocation();
  const { label, icon: Icon, path, soon } = item;
  const isActive =
    path === "/dashboard"
      ? location.pathname === "/dashboard"
      : location.pathname.startsWith(path);

  const showEABadge = eaBadge?.hasEA && eaBadge.onlineCount > 0;
  const eaBadgeColor = eaBadge?.allOffline
    ? "bg-[var(--loss)]/20 text-[var(--loss)]"
    : "bg-[var(--profit)]/20 text-[var(--profit)]";

  const content = (
    <div
      className={cn(
        "flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors relative group overflow-x-hidden",
        isActive
          ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
          : "text-sidebar-foreground/60 hover:bg-sidebar-accent/40 hover:text-sidebar-foreground",
        soon && "pointer-events-none opacity-50"
      )}
    >
      <Icon className="h-4 w-4 shrink-0" />
      <AnimatePresence initial={false}>
        {!collapsed && (
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, transition: { delay: 0.05 } }}
            exit={{ opacity: 0, transition: { duration: 0.1 } }}
            className="flex-1 truncate"
          >
            {label}
          </motion.span>
        )}
      </AnimatePresence>
      {!collapsed && soon && (
        <Badge
          variant="secondary"
          className="ml-auto text-[10px] px-1.5 py-0 h-4 font-medium"
        >
          Soon
        </Badge>
      )}
      {!collapsed && showEABadge && (
        <span className={cn("ml-auto text-[10px] px-1.5 py-0 h-4 rounded-full font-mono font-bold flex items-center", eaBadgeColor)}>
          {eaBadge.onlineCount}
        </span>
      )}
      {collapsed && (
        <div className="absolute left-full ml-2 px-2 py-1 bg-popover border border-border rounded-md text-xs text-popover-foreground whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none z-50 transition-opacity shadow-lg">
          {label}
          {soon && <span className="ml-1 text-muted-foreground">(Soon)</span>}
        </div>
      )}
    </div>
  );

  if (soon) return content;
  return <Link to={path}>{content}</Link>;
};

const useEAOnlineCount = () => {
  const { data } = useAccounts({ limit: 50 });
  return useMemo(() => {
    const accounts = data?.accounts ?? [];
    const eaAccounts = accounts.filter((a) => a.eaSync?.enabled === true);
    const onlineCount = eaAccounts.filter((a) => a.eaSync?.isOnline === true).length;
    return { onlineCount, hasEA: eaAccounts.length > 0, allOffline: eaAccounts.length > 0 && onlineCount === 0 };
  }, [data]);
};

export const DashboardSidebar = ({ collapsed, onToggle, mobile = false }) => {
  const { mongoUser } = useAuthStore();
  const { logout } = useAuth();
  const { onlineCount, hasEA, allOffline } = useEAOnlineCount();

  const displayName =
    `${mongoUser?.firstName ?? ""} ${mongoUser?.lastName ?? ""}`.trim() || "Trader";
  const email = mongoUser?.email ?? "";
  const initials = displayName
    .split(" ")
    .filter(Boolean)
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2) || "T";

    const photoUrl = mongoUser?.traderProfile?.avatarUrl || null;

  return (
    <div className="h-full flex flex-col bg-sidebar border-r border-sidebar-border">
      {/* Logo + toggle */}
      <div
        className={cn(
          "flex items-center h-14 px-3 border-b border-sidebar-border shrink-0",
          collapsed ? "justify-center" : "justify-between"
        )}
      >
        {!collapsed && (
          <Logo variant="horizontal" size="sm" />
        )}
        {mobile ? (
          <button
            onClick={onToggle}
            className="h-8 w-8 flex items-center justify-center rounded-md hover:bg-sidebar-accent transition-colors text-sidebar-foreground/60"
          >
            <X className="h-4 w-4" />
          </button>
        ) : (
          <button
            onClick={onToggle}
            className="h-8 w-8 flex items-center justify-center rounded-md hover:bg-sidebar-accent transition-colors text-sidebar-foreground/60"
          >
            {collapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </button>
        )}
      </div>

      {/* Nav sections */}
      <div className="flex-1 overflow-y-auto py-3 space-y-4 px-2">
        {NAV_SECTIONS.map((section) => (
          <div key={section.label}>
            <AnimatePresence initial={false}>
              {!collapsed && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1, transition: { delay: 0.05 } }}
                  exit={{ opacity: 0, transition: { duration: 0.1 } }}
                  className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground px-3 mb-1"
                >
                  {section.label}
                </motion.p>
              )}
            </AnimatePresence>
            <div className="space-y-0.5">
              {section.items.map((item) => (
                <NavItem
                  key={item.path}
                  item={item}
                  collapsed={collapsed}
                  eaBadge={item.path === "/ea" ? { onlineCount, hasEA, allOffline } : null}
                />
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* User section */}
      <div className={cn(
        "border-t border-sidebar-border p-2 shrink-0",
        collapsed ? "flex justify-center" : ""
      )}>
        {collapsed ? (
          <button
            onClick={logout}
            className="h-8 w-8 flex items-center justify-center rounded-md hover:bg-sidebar-accent transition-colors text-sidebar-foreground/60"
            title="Logout"
          >
            <LogOut className="h-4 w-4" />
          </button>
        ) : (
          <div className="flex items-center gap-2 px-1">
            <div className="w-7 h-7 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center shrink-0">
            {photoUrl ? (
              <img src={photoUrl} alt={displayName} className="w-full h-full rounded-full object-cover" />
            ) : (
              <span className="text-[10px] font-bold text-primary">{initials}</span>
            )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-sidebar-foreground truncate">{displayName}</p>
              <p className="text-[10px] text-muted-foreground truncate">{email}</p>
            </div>
            <button
              onClick={logout}
              className="h-7 w-7 flex items-center justify-center rounded-md hover:bg-sidebar-accent transition-colors text-muted-foreground hover:text-sidebar-foreground shrink-0"
              title="Logout"
            >
              <LogOut className="h-3.5 w-3.5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
