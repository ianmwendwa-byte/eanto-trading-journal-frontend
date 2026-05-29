# Dashboard Layout & Home Page Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build DashboardLayout (animated sidebar + header) and the Dashboard home page (4 stat cards, balance history chart, account summary, win/loss donut, top pairs bar, recent activity) connected to real Tradecore API data.

**Architecture:** DashboardLayout wraps all `/app` routes via React Router nested parent route; sidebar uses Framer Motion width animation for desktop collapse (240px ↔ 64px) and AnimatePresence slide-in drawer for mobile; React Query hooks own all server state; dashboard page shows full-page skeleton while accounts load, per-card skeletons for secondary data; no spinners anywhere in the dashboard.

**Tech Stack:** React 19 + Vite, shadcn/ui, Tailwind CSS v4, TanStack Query v5, Zustand v5, Framer Motion v12, TradingView Lightweight Charts v5 (`lightweight-charts`), Recharts v3, React Router v7, Lucide React v1, Axios

---

## Design Decisions

### References
1. **shadcn/ui/blocks** — `sidebar-07` (collapsing icon sidebar, toggle trigger, breadcrumb header), `dashboard-01` (sidebar + charts + data table layout)
2. **Linear.app** — 56px header, left logo+title / right utilities, hierarchical sidebar sections with labels, icon+text nav items, ~260px expanded sidebar
3. **Tradecore design system** — dark mode default (`#020618` bg, `#051042` sidebar/cards, `#173ded` primary), CSS variable tokens, JetBrains Mono for all numbers

### Layout
- Sidebar: `240px` expanded / `64px` collapsed, `motion.aside` with animated `width`
- Header: `56px` height, `h-14`
- Mobile: sidebar out of flow, `AnimatePresence` overlay drawer + backdrop
- Main content: `flex-1 overflow-auto` scrolls independently

### Typography  
- Section labels: `text-xs uppercase tracking-widest text-muted-foreground`
- Nav items: `text-sm font-sans`
- Numbers/balances: `font-mono`
- Page titles: `font-heading`

### Color Rules (never violate)
- Profit: `text-[hsl(var(--profit))]`
- Loss: `text-[hsl(var(--loss))]`
- Never hardcode colors — always use CSS variables

---

## File Map

**Create:**
```
src/hooks/useAuth.js
src/hooks/useAccounts.js
src/hooks/useNotifications.js
src/hooks/useTrades.js
src/hooks/useTransactions.js
src/hooks/useScore.js
src/components/layouts/DashboardSidebar.jsx
src/components/layouts/DashboardHeader.jsx
src/components/layouts/DashboardLayout.jsx
src/components/dashboard/StatCards.jsx
src/components/dashboard/BalanceHistoryChart.jsx
src/components/dashboard/AccountSummaryList.jsx
src/components/dashboard/WinLossDonut.jsx
src/components/dashboard/TopPairsChart.jsx
src/components/dashboard/RecentActivityList.jsx
src/components/dashboard/DashboardSkeleton.jsx
src/pages/app/Dashboard.jsx
```

**Modify:**
```
src/router.jsx          — add DashboardLayout parent route
src/components/shared/ProtectedRoute.jsx  — remove spinner, text only
```

---

## Task 1: Data Hooks

**Files:**
- Create: `src/hooks/useAuth.js`
- Create: `src/hooks/useAccounts.js`
- Create: `src/hooks/useNotifications.js`
- Create: `src/hooks/useTrades.js`
- Create: `src/hooks/useTransactions.js`
- Create: `src/hooks/useScore.js`

- [ ] **Step 1: Create `src/hooks/useAuth.js`**

```js
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useAuthStore } from "@/store/useAuthStore";
import { useQueryClient } from "@tanstack/react-query";

export const useAuth = () => {
  const authState = useAuthStore();
  const queryClient = useQueryClient();

  const logout = async () => {
    await signOut(auth);
    queryClient.clear();
    authState.logout();
  };

  return {
    firebaseUser: authState.firebaseUser,
    mongoUser: authState.mongoUser,
    isAuthenticated: authState.isAuthenticated,
    logout,
  };
};
```

- [ ] **Step 2: Create `src/hooks/useAccounts.js`**

```js
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/axios";
import { accountKeys } from "@/lib/queryKeys";

export const useAccounts = (filters = {}) =>
  useQuery({
    queryKey: accountKeys.list(filters),
    queryFn: () => api.get("/api/v1/accounts", { params: filters }),
    staleTime: 5 * 60 * 1000,
  });
```

- [ ] **Step 3: Create `src/hooks/useNotifications.js`**

```js
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/axios";
import { notificationKeys } from "@/lib/queryKeys";

export const useUnreadCount = () =>
  useQuery({
    queryKey: notificationKeys.unreadCount(),
    queryFn: () => api.get("/api/v1/notifications/unread-count"),
    staleTime: 30 * 1000,
    refetchInterval: 30 * 1000,
  });

export const useMarkAllRead = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => api.patch("/api/v1/notifications/read-all"),
    onSuccess: () => {
      queryClient.setQueryData(notificationKeys.unreadCount(), { count: 0 });
      queryClient.invalidateQueries({ queryKey: notificationKeys.all() });
    },
  });
};
```

- [ ] **Step 4: Create `src/hooks/useTrades.js`**

```js
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/axios";
import { tradeKeys } from "@/lib/queryKeys";

export const useTradeStats = (filters = {}) =>
  useQuery({
    queryKey: tradeKeys.stats(filters),
    queryFn: () => api.get("/api/v1/trades/stats/overview", { params: filters }),
    staleTime: 2 * 60 * 1000,
  });

export const usePairStats = (filters = {}) =>
  useQuery({
    queryKey: tradeKeys.stats({ ...filters, _type: "pairs" }),
    queryFn: () => api.get("/api/v1/trades/stats/pairs", { params: filters }),
    staleTime: 2 * 60 * 1000,
  });
```

- [ ] **Step 5: Create `src/hooks/useTransactions.js`**

```js
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/axios";
import { transactionKeys } from "@/lib/queryKeys";

export const useBalanceHistory = (filters = {}) =>
  useQuery({
    queryKey: transactionKeys.history(filters),
    queryFn: () => api.get("/api/v1/transactions/balance-history", { params: filters }),
    staleTime: 2 * 60 * 1000,
  });

export const useRecentTransactions = (limit = 5) =>
  useQuery({
    queryKey: transactionKeys.list({ limit, sortBy: "createdAt", sortOrder: "desc" }),
    queryFn: () =>
      api.get("/api/v1/transactions", {
        params: { limit, sortBy: "createdAt", sortOrder: "desc" },
      }),
    staleTime: 60 * 1000,
  });
```

- [ ] **Step 6: Create `src/hooks/useScore.js`**

```js
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/axios";
import { scoreKeys } from "@/lib/queryKeys";

export const useUserScore = () =>
  useQuery({
    queryKey: scoreKeys.user(),
    queryFn: () => api.get("/api/v1/score/user"),
    staleTime: 10 * 60 * 1000,
  });
```

- [ ] **Step 7: Verify no import errors**

Run: `npm run build` (or just open in dev)
Expected: No import errors for hook files

- [ ] **Step 8: Commit**

```bash
git add src/hooks/
git commit -m "feat: add data hooks for accounts, trades, transactions, notifications, score, auth"
```

---

## Task 2: Fix ProtectedRoute Loading State

**Files:**
- Modify: `src/components/shared/ProtectedRoute.jsx`

Loading rule: auth check → text only, no spinner.

- [ ] **Step 1: Replace spinner with text-only loading**

In `src/components/shared/ProtectedRoute.jsx`, replace the `isLoading` return with:

```jsx
if (isLoading) {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <p className="text-sm text-muted-foreground">Loading...</p>
    </div>
  );
}
```

The full file after edit:

```jsx
import { Navigate, useLocation } from "react-router-dom";
import { useAuthStore } from "@/store/useAuthStore";

export const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuthStore();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-sm text-muted-foreground">Loading...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};
```

- [ ] **Step 2: Commit**

```bash
git add src/components/shared/ProtectedRoute.jsx
git commit -m "fix: remove spinner from ProtectedRoute — auth loading shows text only per design rules"
```

---

## Task 3: DashboardSidebar

**Files:**
- Create: `src/components/layouts/DashboardSidebar.jsx`

This is the main navigation panel. Desktop: in-flow animated width. Mobile: receives `mobile` prop and renders without width animation.

- [ ] **Step 1: Create `src/components/layouts/DashboardSidebar.jsx`**

```jsx
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard, Wallet, ArrowLeftRight, TrendingUp,
  BarChart3, Upload, Cpu, Trophy, Target, Lightbulb,
  Bot, ChevronLeft, ChevronRight, LogOut, X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/store/useAuthStore";
import { useAuth } from "@/hooks/useAuth";
import { Badge } from "@/components/ui/badge";

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
      { label: "EA Sync",         icon: Cpu,     path: "/ea",     soon: true },
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

const NavItem = ({ item, collapsed }) => {
  const location = useLocation();
  const { label, icon: Icon, path, soon } = item;
  const isActive =
    path === "/dashboard"
      ? location.pathname === "/dashboard"
      : location.pathname.startsWith(path);

  const content = (
    <div
      className={cn(
        "flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors relative group",
        isActive
          ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
          : "text-sidebar-foreground/60 hover:bg-sidebar-accent/40 hover:text-sidebar-foreground",
        soon && "pointer-events-none opacity-50"
      )}
    >
      <Icon className="h-4 w-4 flex-shrink-0" />
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
      {/* Tooltip when collapsed */}
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

export const DashboardSidebar = ({ collapsed, onToggle, mobile = false }) => {
  const { mongoUser, firebaseUser } = useAuthStore();
  const { logout } = useAuth();

  const displayName = mongoUser
    ? `${mongoUser.firstName ?? ""} ${mongoUser.lastName ?? ""}`.trim()
    : firebaseUser?.displayName ?? firebaseUser?.email?.split("@")[0] ?? "Trader";
  const email = mongoUser?.email ?? firebaseUser?.email ?? "";
  const initials = displayName
    .split(" ")
    .filter(Boolean)
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2) || "T";

  return (
    <div className="h-full flex flex-col bg-sidebar border-r border-sidebar-border">
      {/* Logo + toggle */}
      <div
        className={cn(
          "flex items-center h-14 px-3 border-b border-sidebar-border flex-shrink-0",
          collapsed ? "justify-center" : "justify-between"
        )}
      >
        {!collapsed && (
          <span className="font-heading font-bold text-base text-sidebar-foreground tracking-tight">
            Tradecore
          </span>
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
                <NavItem key={item.path} item={item} collapsed={collapsed} />
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* User section */}
      <div className={cn(
        "border-t border-sidebar-border p-2 flex-shrink-0",
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
            <div className="w-7 h-7 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center flex-shrink-0">
              <span className="text-[10px] font-bold text-primary">{initials}</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-sidebar-foreground truncate">{displayName}</p>
              <p className="text-[10px] text-muted-foreground truncate">{email}</p>
            </div>
            <button
              onClick={logout}
              className="h-7 w-7 flex items-center justify-center rounded-md hover:bg-sidebar-accent transition-colors text-muted-foreground hover:text-sidebar-foreground flex-shrink-0"
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
```

- [ ] **Step 2: Commit**

```bash
git add src/components/layouts/DashboardSidebar.jsx
git commit -m "feat: add DashboardSidebar with framer-motion collapse and section navigation"
```

---

## Task 4: DashboardHeader

**Files:**
- Create: `src/components/layouts/DashboardHeader.jsx`

56px header. Left: hamburger (mobile) or collapse toggle icon (desktop) + page title. Right: notification bell + unread badge + theme toggle + user avatar dropdown.

- [ ] **Step 1: Create `src/components/layouts/DashboardHeader.jsx`**

```jsx
import { useLocation, Link } from "react-router-dom";
import { Menu, Bell } from "lucide-react";
import { ModeToggle } from "@/components/mode-toggle";
import { useUnreadCount } from "@/hooks/useNotifications";
import { useAuth } from "@/hooks/useAuth";
import { useAuthStore } from "@/store/useAuthStore";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

const PAGE_TITLES = {
  "/dashboard":    "Dashboard",
  "/accounts":     "Accounts",
  "/transactions": "Transactions",
  "/trades":       "Trades",
  "/analytics":    "Analytics",
  "/strategies":   "Strategies",
  "/insights":     "Insights",
  "/score":        "Business Score",
  "/import":       "CSV Import",
  "/ea":           "EA Sync",
  "/ai":           "AI Coach",
};

export const DashboardHeader = ({ onMobileMenuOpen }) => {
  const location = useLocation();
  const { logout } = useAuth();
  const { mongoUser, firebaseUser } = useAuthStore();
  const { data: unreadData } = useUnreadCount();

  const title =
    PAGE_TITLES[location.pathname] ??
    Object.entries(PAGE_TITLES).find(([path]) =>
      location.pathname.startsWith(path) && path !== "/dashboard"
    )?.[1] ??
    "Dashboard";

  const unread = unreadData?.count ?? 0;
  const badgeLabel = unread > 99 ? "99+" : String(unread);

  const displayName = mongoUser
    ? `${mongoUser.firstName ?? ""} ${mongoUser.lastName ?? ""}`.trim()
    : firebaseUser?.displayName ?? firebaseUser?.email?.split("@")[0] ?? "Trader";
  const initials = displayName
    .split(" ")
    .filter(Boolean)
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2) || "T";

  return (
    <header className="h-14 flex items-center px-4 border-b border-border bg-background/80 backdrop-blur-sm flex-shrink-0 gap-3">
      {/* Mobile hamburger */}
      <button
        onClick={onMobileMenuOpen}
        className="md:hidden h-8 w-8 flex items-center justify-center rounded-md hover:bg-muted transition-colors text-muted-foreground"
      >
        <Menu className="h-4 w-4" />
      </button>

      {/* Page title */}
      <h1 className="font-heading font-semibold text-base text-foreground flex-1 truncate">
        {title}
      </h1>

      {/* Right utilities */}
      <div className="flex items-center gap-1">
        {/* Notification bell */}
        <Link to="/notifications">
          <button className="relative h-8 w-8 flex items-center justify-center rounded-md hover:bg-muted transition-colors text-muted-foreground">
            <Bell className="h-4 w-4" />
            {unread > 0 && (
              <span className={cn(
                "absolute -top-0.5 -right-0.5 min-w-[16px] h-4 rounded-full bg-primary text-primary-foreground",
                "text-[9px] font-bold flex items-center justify-center px-1 leading-none"
              )}>
                {badgeLabel}
              </span>
            )}
          </button>
        </Link>

        {/* Theme toggle */}
        <ModeToggle />

        {/* User avatar dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="h-8 w-8 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center hover:bg-primary/30 transition-colors ml-1">
              <span className="text-[10px] font-bold text-primary">{initials}</span>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" sideOffset={8} className="min-w-48">
            <div className="px-2 py-1.5">
              <p className="text-sm font-medium truncate">{displayName}</p>
              <p className="text-xs text-muted-foreground truncate">
                {mongoUser?.email ?? firebaseUser?.email ?? ""}
              </p>
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link to="/settings">Settings</Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={logout}
              className="text-destructive focus:text-destructive"
            >
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
};
```

- [ ] **Step 2: Commit**

```bash
git add src/components/layouts/DashboardHeader.jsx
git commit -m "feat: add DashboardHeader with notification bell, theme toggle, user dropdown"
```

---

## Task 5: DashboardLayout + Router Update

**Files:**
- Create: `src/components/layouts/DashboardLayout.jsx`
- Modify: `src/router.jsx`

- [ ] **Step 1: Read `src/hooks/use-mobile.js` to confirm export name**

Open and read the file — note the hook name it exports (likely `useIsMobile`).

- [ ] **Step 2: Create `src/components/layouts/DashboardLayout.jsx`**

```jsx
import { Outlet } from "react-router-dom";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { DashboardSidebar } from "./DashboardSidebar";
import { DashboardHeader } from "./DashboardHeader";
import { useAppStore } from "@/store/useAppStore";
import { useIsMobile } from "@/hooks/use-mobile";

const SIDEBAR_EXPANDED = 240;
const SIDEBAR_COLLAPSED = 64;

export const DashboardLayout = () => {
  const { sidebarCollapsed, setSidebarCollapsed } = useAppStore();
  const [mobileOpen, setMobileOpen] = useState(false);
  const isMobile = useIsMobile();

  return (
    <div className="min-h-screen flex bg-background">
      {/* Desktop sidebar — in-flow, animates width */}
      {!isMobile && (
        <motion.aside
          animate={{ width: sidebarCollapsed ? SIDEBAR_COLLAPSED : SIDEBAR_EXPANDED }}
          transition={{ duration: 0.25, ease: "easeInOut" }}
          className="flex-shrink-0 h-screen sticky top-0"
          style={{ overflow: "hidden" }}
        >
          <DashboardSidebar
            collapsed={sidebarCollapsed}
            onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
          />
        </motion.aside>
      )}

      {/* Mobile sidebar overlay */}
      <AnimatePresence>
        {isMobile && mobileOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setMobileOpen(false)}
              className="fixed inset-0 bg-black/60 z-40"
            />
            {/* Drawer */}
            <motion.div
              key="drawer"
              initial={{ x: -SIDEBAR_EXPANDED }}
              animate={{ x: 0 }}
              exit={{ x: -SIDEBAR_EXPANDED }}
              transition={{ duration: 0.25, ease: "easeInOut" }}
              className="fixed left-0 top-0 bottom-0 z-50"
              style={{ width: SIDEBAR_EXPANDED }}
            >
              <DashboardSidebar
                collapsed={false}
                onToggle={() => setMobileOpen(false)}
                mobile
              />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Main area */}
      <div className="flex-1 flex flex-col min-w-0">
        <DashboardHeader onMobileMenuOpen={() => setMobileOpen(true)} />
        <main className="flex-1 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
```

- [ ] **Step 3: Update `src/router.jsx`**

Replace the current router with a nested structure where DashboardLayout wraps all `/app` routes:

```jsx
import { createBrowserRouter, Navigate, Outlet } from "react-router-dom";
import { ProtectedRoute } from "@/components/shared/ProtectedRoute";
import { DashboardLayout } from "@/components/layouts/DashboardLayout";

// Auth pages
import { Login }          from "@/pages/auth/Login";
import { Register }       from "@/pages/auth/Register";
import { ForgotPassword } from "@/pages/auth/ForgotPassword";

// App pages
import { Dashboard }  from "@/pages/app/Dashboard";
import { Analytics }  from "@/pages/app/Analytics";
import { Strategies } from "@/pages/app/Strategies";
import { Insights }   from "@/pages/app/Insights";

// Protected layout wrapper
const AppRoot = () => (
  <ProtectedRoute>
    <DashboardLayout />
  </ProtectedRoute>
);

export const router = createBrowserRouter([
  // Public auth routes
  { path: "/login",           element: <Login /> },
  { path: "/register",        element: <Register /> },
  { path: "/forgot-password", element: <ForgotPassword /> },

  // Root redirect
  { path: "/", element: <Navigate to="/dashboard" replace /> },

  // Protected app routes — all wrapped with DashboardLayout
  {
    element: <AppRoot />,
    children: [
      { path: "/dashboard",   element: <Dashboard /> },
      { path: "/analytics",   element: <Analytics /> },
      { path: "/strategies",  element: <Strategies /> },
      { path: "/insights",    element: <Insights /> },
      // Stub routes for nav items (add real pages as they're built)
      { path: "/accounts",     element: <ComingSoonStub title="Accounts" /> },
      { path: "/transactions", element: <ComingSoonStub title="Transactions" /> },
      { path: "/trades",       element: <ComingSoonStub title="Trades" /> },
      { path: "/score",        element: <ComingSoonStub title="Business Score" /> },
      { path: "/import",       element: <ComingSoonStub title="CSV Import" /> },
      { path: "/ea",           element: <ComingSoonStub title="EA Sync" /> },
      { path: "/ai",           element: <ComingSoonStub title="AI Coach" /> },
      { path: "/notifications",element: <ComingSoonStub title="Notifications" /> },
      { path: "/settings",     element: <ComingSoonStub title="Settings" /> },
    ],
  },

  // Catch all
  { path: "*", element: <Navigate to="/dashboard" replace /> },
]);

const ComingSoonStub = ({ title }) => (
  <div className="p-6 flex items-center justify-center min-h-[60vh]">
    <div className="text-center space-y-2">
      <p className="font-heading font-semibold text-foreground">{title}</p>
      <p className="text-sm text-muted-foreground">Coming soon</p>
    </div>
  </div>
);
```

- [ ] **Step 4: Start dev server and verify sidebar + header render**

Run: `npm run dev`
Navigate to `/dashboard` (must be logged in)
Expected:
- Sidebar visible on desktop (240px wide) with all nav sections
- Header visible with page title "Dashboard"
- Clicking collapse button → sidebar animates to 64px, icons only
- On mobile viewport → sidebar hidden, hamburger shows in header, tap hamburger → overlay drawer slides in from left

- [ ] **Step 5: Commit**

```bash
git add src/components/layouts/DashboardLayout.jsx src/router.jsx
git commit -m "feat: add DashboardLayout with animated sidebar and wrap all app routes"
```

---

## Task 6: DashboardSkeleton

**Files:**
- Create: `src/components/dashboard/DashboardSkeleton.jsx`

Shown when accounts are loading. Mirrors the full dashboard layout with skeleton shapes.

- [ ] **Step 1: Create `src/components/dashboard/DashboardSkeleton.jsx`**

```jsx
import { Skeleton } from "@/components/ui/skeleton";

const SkeletonCard = ({ className }) => (
  <div className={`trading-card p-4 ${className ?? ""}`}>
    <Skeleton className="h-3 w-24 mb-3" />
    <Skeleton className="h-7 w-32 mb-1" />
    <Skeleton className="h-3 w-20" />
  </div>
);

export const DashboardSkeleton = () => (
  <div className="p-6 space-y-6">
    {/* Row 1: 4 stat cards */}
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <SkeletonCard />
      <SkeletonCard />
      <SkeletonCard />
      <SkeletonCard />
    </div>

    {/* Row 2: balance chart + account list */}
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <div className="lg:col-span-2 trading-card p-4">
        <Skeleton className="h-3 w-28 mb-4" />
        <Skeleton className="h-56 w-full rounded-lg" />
      </div>
      <div className="trading-card p-4 space-y-3">
        <Skeleton className="h-3 w-24 mb-2" />
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex items-center gap-3">
            <Skeleton className="h-8 w-1 rounded-full" />
            <div className="flex-1 space-y-1.5">
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-3 w-16" />
            </div>
            <Skeleton className="h-4 w-20" />
          </div>
        ))}
      </div>
    </div>

    {/* Row 3: donut + bar + activity */}
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div className="trading-card p-4">
        <Skeleton className="h-3 w-24 mb-4" />
        <Skeleton className="h-40 w-full rounded-lg" />
      </div>
      <div className="trading-card p-4">
        <Skeleton className="h-3 w-24 mb-4" />
        <Skeleton className="h-40 w-full rounded-lg" />
      </div>
      <div className="trading-card p-4 space-y-3">
        <Skeleton className="h-3 w-28 mb-2" />
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="flex items-center gap-3">
            <Skeleton className="h-7 w-7 rounded-full" />
            <div className="flex-1 space-y-1">
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-2.5 w-16" />
            </div>
            <Skeleton className="h-3 w-14" />
          </div>
        ))}
      </div>
    </div>
  </div>
);
```

- [ ] **Step 2: Commit**

```bash
git add src/components/dashboard/DashboardSkeleton.jsx
git commit -m "feat: add DashboardSkeleton for full-page loading state"
```

---

## Task 7: StatCards

**Files:**
- Create: `src/components/dashboard/StatCards.jsx`

4 cards: Total Balance, Today's P&L, Overall Win Rate, Business Score. War accounts excluded from aggregate balance.

- [ ] **Step 1: Create `src/components/dashboard/StatCards.jsx`**

```jsx
import { TrendingUp, TrendingDown, Wallet, Target, Trophy } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency, formatPercent, getPnLColor } from "@/utils/format";
import { cn } from "@/lib/utils";

const SCORE_BANDS = {
  needs_work:  { label: "Needs Work",  color: "text-destructive" },
  developing:  { label: "Developing",  color: "text-orange-400" },
  progressing: { label: "Progressing", color: "text-warning" },
  solid:       { label: "Solid",       color: "text-[hsl(var(--profit))]" },
  elite:       { label: "Elite",       color: "text-blue-400" },
};

const StatCard = ({ icon: Icon, label, value, subValue, subColor, loading }) => (
  <div className="trading-card p-4">
    <div className="flex items-center justify-between mb-3">
      <p className="text-xs text-muted-foreground font-medium">{label}</p>
      <div className="w-7 h-7 rounded-lg bg-muted flex items-center justify-center">
        <Icon className="h-3.5 w-3.5 text-muted-foreground" />
      </div>
    </div>
    {loading ? (
      <>
        <Skeleton className="h-7 w-32 mb-1" />
        <Skeleton className="h-3 w-20" />
      </>
    ) : (
      <>
        <p className="text-2xl font-bold font-mono text-foreground leading-none mb-1">
          {value ?? "—"}
        </p>
        {subValue && (
          <p className={cn("text-xs font-mono", subColor ?? "text-muted-foreground")}>
            {subValue}
          </p>
        )}
      </>
    )}
  </div>
);

export const StatCards = ({ accounts, tradeStats, userScore }) => {
  const nonWarAccounts = (accounts ?? []).filter((a) => a.type !== "war");
  const totalBalance = nonWarAccounts.reduce(
    (sum, a) => sum + (a.currentBalance ?? a.startingBalance ?? 0),
    0
  );

  const todayPnl = tradeStats?.todayPnl ?? tradeStats?.todaysPnl ?? null;
  const winRate = tradeStats?.winRate ?? null;

  const scoreData = userScore?.score;
  const hasScoreData = scoreData?.metadata?.hasMinimumData !== false;
  const scoreOverall = hasScoreData ? scoreData?.overall : null;
  const scoreBand = scoreData?.band;
  const bandInfo = SCORE_BANDS[scoreBand] ?? null;

  const accountsLoading = accounts === undefined;
  const statsLoading = tradeStats === undefined;
  const scoreLoading = userScore === undefined;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard
        icon={Wallet}
        label="Total Balance"
        loading={accountsLoading}
        value={formatCurrency(totalBalance)}
        subValue={`${nonWarAccounts.length} account${nonWarAccounts.length !== 1 ? "s" : ""}`}
      />
      <StatCard
        icon={todayPnl >= 0 ? TrendingUp : TrendingDown}
        label="Today's P&L"
        loading={statsLoading}
        value={todayPnl !== null ? formatCurrency(todayPnl) : "—"}
        subValue={todayPnl !== null ? (todayPnl >= 0 ? "Positive day" : "Negative day") : undefined}
        subColor={todayPnl !== null ? getPnLColor(todayPnl) : undefined}
      />
      <StatCard
        icon={Target}
        label="Win Rate"
        loading={statsLoading}
        value={winRate !== null ? formatPercent(winRate) : "—"}
        subValue={
          tradeStats
            ? `${tradeStats.wins ?? 0}W / ${tradeStats.losses ?? 0}L`
            : undefined
        }
      />
      <StatCard
        icon={Trophy}
        label="Business Score"
        loading={scoreLoading}
        value={
          scoreLoading
            ? undefined
            : scoreOverall !== null
            ? String(scoreOverall)
            : "—"
        }
        subValue={
          !hasScoreData
            ? "Need 10+ trades"
            : bandInfo
            ? bandInfo.label
            : undefined
        }
        subColor={bandInfo?.color}
      />
    </div>
  );
};
```

- [ ] **Step 2: Commit**

```bash
git add src/components/dashboard/StatCards.jsx
git commit -m "feat: add StatCards for dashboard overview row (balance, P&L, win rate, score)"
```

---

## Task 8: BalanceHistoryChart + AccountSummaryList

**Files:**
- Create: `src/components/dashboard/BalanceHistoryChart.jsx`
- Create: `src/components/dashboard/AccountSummaryList.jsx`

- [ ] **Step 1: Create `src/components/dashboard/BalanceHistoryChart.jsx`**

Uses TradingView Lightweight Charts v5 area series. Chart background is transparent to inherit card background.

```jsx
import { useEffect, useRef } from "react";
import { createChart } from "lightweight-charts";
import { Skeleton } from "@/components/ui/skeleton";

const formatChartData = (history) => {
  if (!Array.isArray(history)) return [];
  return history
    .map((item) => ({
      time: item.date ?? item.time,
      value: item.balance ?? item.value ?? 0,
    }))
    .filter((d) => d.time)
    .sort((a, b) => (a.time > b.time ? 1 : -1));
};

export const BalanceHistoryChart = ({ data, isLoading }) => {
  const containerRef = useRef(null);
  const chartRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current) return;
    const chartData = formatChartData(data);
    if (!chartData.length) return;

    const chart = createChart(containerRef.current, {
      layout: {
        background: { type: "solid", color: "transparent" },
        textColor: "rgba(255,255,255,0.45)",
        fontSize: 11,
        fontFamily: "'JetBrains Mono', monospace",
      },
      grid: {
        vertLines: { color: "rgba(255,255,255,0.04)" },
        horzLines: { color: "rgba(255,255,255,0.04)" },
      },
      rightPriceScale: {
        borderColor: "rgba(255,255,255,0.06)",
        scaleMargins: { top: 0.1, bottom: 0.1 },
      },
      timeScale: {
        borderColor: "rgba(255,255,255,0.06)",
        timeVisible: true,
        secondsVisible: false,
      },
      crosshair: { mode: 1 },
      handleScroll: false,
      handleScale: false,
    });

    chartRef.current = chart;

    const series = chart.addAreaSeries({
      lineColor: "#173ded",
      topColor: "rgba(23,61,237,0.25)",
      bottomColor: "rgba(23,61,237,0)",
      lineWidth: 2,
      crosshairMarkerVisible: true,
      crosshairMarkerRadius: 4,
    });

    series.setData(chartData);
    chart.timeScale().fitContent();

    const observer = new ResizeObserver(() => {
      if (containerRef.current) {
        chart.applyOptions({ width: containerRef.current.clientWidth });
      }
    });
    observer.observe(containerRef.current);

    return () => {
      observer.disconnect();
      chart.remove();
      chartRef.current = null;
    };
  }, [data]);

  if (isLoading) {
    return <Skeleton className="h-full w-full rounded-lg min-h-56" />;
  }

  if (!data?.length) {
    return (
      <div className="h-full min-h-56 flex items-center justify-center text-sm text-muted-foreground">
        No balance history yet
      </div>
    );
  }

  return <div ref={containerRef} className="h-full w-full min-h-56" />;
};
```

- [ ] **Step 2: Create `src/components/dashboard/AccountSummaryList.jsx`**

```jsx
import { Link } from "react-router-dom";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, getPnLColor } from "@/utils/format";
import { cn } from "@/lib/utils";

const TYPE_LABELS = { normal: "Normal", prop: "Prop", war: "War" };

const AccountRow = ({ account }) => {
  const pnl = (account.currentBalance ?? 0) - (account.startingBalance ?? 0);

  return (
    <Link to={`/accounts/${account._id}`}>
      <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer group">
        <div
          className="w-1 h-9 rounded-full flex-shrink-0"
          style={{ backgroundColor: account.color ?? "#173ded" }}
        />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium truncate text-foreground group-hover:text-foreground">
            {account.name}
          </p>
          <div className="flex items-center gap-1.5 mt-0.5">
            <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4">
              {TYPE_LABELS[account.type] ?? account.type}
            </Badge>
            {account.status && account.status !== "active" && (
              <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4 capitalize">
                {account.status}
              </Badge>
            )}
          </div>
        </div>
        <div className="text-right flex-shrink-0">
          <p className="text-sm font-mono font-medium text-foreground">
            {formatCurrency(account.currentBalance ?? account.startingBalance ?? 0)}
          </p>
          <p className={cn("text-[11px] font-mono", getPnLColor(pnl))}>
            {pnl >= 0 ? "+" : ""}
            {formatCurrency(pnl)}
          </p>
        </div>
      </div>
    </Link>
  );
};

export const AccountSummaryList = ({ accounts, isLoading }) => {
  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex items-center gap-3 p-2">
            <Skeleton className="h-9 w-1 rounded-full" />
            <div className="flex-1 space-y-1.5">
              <Skeleton className="h-3.5 w-28" />
              <Skeleton className="h-3 w-16" />
            </div>
            <div className="text-right space-y-1.5">
              <Skeleton className="h-3.5 w-20" />
              <Skeleton className="h-3 w-14" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  const nonWarAccounts = (accounts ?? []).filter((a) => a.type !== "war");
  const warAccounts = (accounts ?? []).filter((a) => a.type === "war");

  if (!nonWarAccounts.length && !warAccounts.length) {
    return (
      <p className="text-sm text-muted-foreground text-center py-8">
        No accounts yet
      </p>
    );
  }

  return (
    <div className="space-y-0.5 overflow-y-auto max-h-64">
      {nonWarAccounts.map((a) => (
        <AccountRow key={a._id} account={a} />
      ))}
      {warAccounts.length > 0 && (
        <>
          <p className="text-[10px] uppercase tracking-widest text-muted-foreground px-2 pt-3 pb-1">
            War Accounts
          </p>
          {warAccounts.map((a) => (
            <AccountRow key={a._id} account={a} />
          ))}
        </>
      )}
    </div>
  );
};
```

- [ ] **Step 3: Commit**

```bash
git add src/components/dashboard/BalanceHistoryChart.jsx src/components/dashboard/AccountSummaryList.jsx
git commit -m "feat: add BalanceHistoryChart (TradingView) and AccountSummaryList"
```

---

## Task 9: WinLossDonut + TopPairsChart + RecentActivityList

**Files:**
- Create: `src/components/dashboard/WinLossDonut.jsx`
- Create: `src/components/dashboard/TopPairsChart.jsx`
- Create: `src/components/dashboard/RecentActivityList.jsx`

- [ ] **Step 1: Create `src/components/dashboard/WinLossDonut.jsx`**

```jsx
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { Skeleton } from "@/components/ui/skeleton";

const SLICES = [
  { key: "wins",      label: "Win",       color: "hsl(var(--profit))" },
  { key: "losses",    label: "Loss",      color: "hsl(var(--loss))" },
  { key: "breakeven", label: "Breakeven", color: "hsl(var(--breakeven))" },
];

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  const { label, value } = payload[0].payload;
  return (
    <div className="bg-popover border border-border rounded-lg px-3 py-2 text-xs shadow-lg">
      <p className="font-medium text-foreground">{label}</p>
      <p className="font-mono text-muted-foreground">{value} trades</p>
    </div>
  );
};

export const WinLossDonut = ({ tradeStats, isLoading }) => {
  if (isLoading) {
    return <Skeleton className="h-40 w-full rounded-lg" />;
  }

  const data = SLICES.map((s) => ({
    label: s.label,
    value: tradeStats?.[s.key] ?? 0,
    color: s.color,
  })).filter((d) => d.value > 0);

  const total = data.reduce((sum, d) => sum + d.value, 0);

  if (!total) {
    return (
      <div className="h-40 flex items-center justify-center text-sm text-muted-foreground">
        No trade data yet
      </div>
    );
  }

  return (
    <div className="relative">
      <ResponsiveContainer width="100%" height={160}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={48}
            outerRadius={66}
            dataKey="value"
            strokeWidth={2}
            stroke="hsl(var(--card))"
          >
            {data.map((entry, i) => (
              <Cell key={i} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
        </PieChart>
      </ResponsiveContainer>
      {/* Center label */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="text-center">
          <p className="text-lg font-bold font-mono text-foreground">{total}</p>
          <p className="text-[10px] text-muted-foreground">trades</p>
        </div>
      </div>
      {/* Legend */}
      <div className="flex justify-center gap-4 mt-1">
        {data.map((d) => (
          <div key={d.label} className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: d.color }} />
            {d.label}
          </div>
        ))}
      </div>
    </div>
  );
};
```

- [ ] **Step 2: Create `src/components/dashboard/TopPairsChart.jsx`**

```jsx
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
} from "recharts";
import { Skeleton } from "@/components/ui/skeleton";

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-popover border border-border rounded-lg px-3 py-2 text-xs shadow-lg">
      <p className="font-medium text-foreground mb-1">{label}</p>
      <p className="font-mono text-muted-foreground">
        Win rate: {(payload[0].value ?? 0).toFixed(1)}%
      </p>
      {payload[0].payload.trades !== undefined && (
        <p className="font-mono text-muted-foreground">
          Trades: {payload[0].payload.trades}
        </p>
      )}
    </div>
  );
};

export const TopPairsChart = ({ pairStats, isLoading }) => {
  if (isLoading) {
    return <Skeleton className="h-40 w-full rounded-lg" />;
  }

  const pairs = (pairStats?.pairs ?? pairStats ?? [])
    .slice(0, 5)
    .map((p) => ({
      pair: p.pair,
      winRate: typeof p.winRate === "number" ? p.winRate * (p.winRate <= 1 ? 100 : 1) : 0,
      trades: p.trades ?? p.totalTrades ?? 0,
    }));

  if (!pairs.length) {
    return (
      <div className="h-40 flex items-center justify-center text-sm text-muted-foreground">
        No pair data yet
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={160}>
      <BarChart data={pairs} layout="vertical" margin={{ top: 0, right: 8, left: 0, bottom: 0 }}>
        <XAxis
          type="number"
          domain={[0, 100]}
          tickFormatter={(v) => `${v}%`}
          tick={{ fontSize: 10, fill: "rgba(255,255,255,0.4)", fontFamily: "JetBrains Mono" }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          type="category"
          dataKey="pair"
          tick={{ fontSize: 10, fill: "rgba(255,255,255,0.6)", fontFamily: "JetBrains Mono" }}
          axisLine={false}
          tickLine={false}
          width={56}
        />
        <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(255,255,255,0.04)" }} />
        <Bar dataKey="winRate" radius={[0, 4, 4, 0]} maxBarSize={14}>
          {pairs.map((entry, i) => (
            <Cell
              key={i}
              fill={entry.winRate >= 50 ? "hsl(var(--profit))" : "hsl(var(--loss))"}
              fillOpacity={0.8}
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
};
```

- [ ] **Step 3: Create `src/components/dashboard/RecentActivityList.jsx`**

```jsx
import {
  ArrowDownToLine, ArrowUpFromLine, TrendingUp, TrendingDown,
  Repeat2, DollarSign, MinusCircle, PlusCircle,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency, formatRelativeTime, getPnLColor } from "@/utils/format";
import { cn } from "@/lib/utils";

const POSITIVE_TYPES = new Set([
  "deposit", "payout", "trade_profit", "adjustment_increase",
]);

const TYPE_CONFIG = {
  deposit:             { icon: ArrowDownToLine, label: "Deposit" },
  withdrawal:          { icon: ArrowUpFromLine, label: "Withdrawal" },
  payout:              { icon: DollarSign,      label: "Payout" },
  trade_profit:        { icon: TrendingUp,      label: "Trade Win" },
  trade_loss:          { icon: TrendingDown,    label: "Trade Loss" },
  swap:                { icon: Repeat2,         label: "Swap" },
  commission:          { icon: MinusCircle,     label: "Commission" },
  prop_challenge_fee:  { icon: MinusCircle,     label: "Challenge Fee" },
  adjustment_increase: { icon: PlusCircle,      label: "Adjustment +" },
  adjustment_decrease: { icon: MinusCircle,     label: "Adjustment −" },
};

const ActivityRow = ({ tx }) => {
  const isPositive = POSITIVE_TYPES.has(tx.type);
  const config = TYPE_CONFIG[tx.type] ?? { icon: DollarSign, label: tx.type };
  const Icon = config.icon;

  return (
    <div className="flex items-center gap-3">
      <div className={cn(
        "w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0",
        isPositive
          ? "bg-[hsl(var(--profit)/0.1)] text-[hsl(var(--profit))]"
          : "bg-[hsl(var(--loss)/0.1)] text-[hsl(var(--loss))]"
      )}>
        <Icon className="h-3.5 w-3.5" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-foreground truncate">{config.label}</p>
        <p className="text-xs text-muted-foreground">{formatRelativeTime(tx.createdAt)}</p>
      </div>
      <p className={cn("text-sm font-mono font-medium flex-shrink-0", getPnLColor(isPositive ? 1 : -1))}>
        {isPositive ? "+" : "−"}{formatCurrency(Math.abs(tx.amount ?? 0))}
      </p>
    </div>
  );
};

export const RecentActivityList = ({ transactions, isLoading }) => {
  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="flex items-center gap-3">
            <Skeleton className="h-7 w-7 rounded-full" />
            <div className="flex-1 space-y-1">
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-2.5 w-16" />
            </div>
            <Skeleton className="h-3 w-16" />
          </div>
        ))}
      </div>
    );
  }

  const items = transactions ?? [];

  if (!items.length) {
    return (
      <p className="text-sm text-muted-foreground text-center py-6">
        No transactions yet
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {items.map((tx) => (
        <ActivityRow key={tx._id} tx={tx} />
      ))}
    </div>
  );
};
```

- [ ] **Step 4: Commit**

```bash
git add src/components/dashboard/WinLossDonut.jsx src/components/dashboard/TopPairsChart.jsx src/components/dashboard/RecentActivityList.jsx
git commit -m "feat: add WinLossDonut, TopPairsChart, RecentActivityList dashboard components"
```

---

## Task 10: Dashboard Page Assembly

**Files:**
- Create: `src/pages/app/Dashboard.jsx`

Assembles all dashboard components. Shows full-page skeleton while accounts load. Shows `EmptyState` if zero accounts. Otherwise renders 3-row layout.

- [ ] **Step 1: Create `src/pages/app/Dashboard.jsx`**

```jsx
import { Link } from "react-router-dom";
import { PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/shared/EmptyState";
import { DashboardSkeleton } from "@/components/dashboard/DashboardSkeleton";
import { StatCards } from "@/components/dashboard/StatCards";
import { BalanceHistoryChart } from "@/components/dashboard/BalanceHistoryChart";
import { AccountSummaryList } from "@/components/dashboard/AccountSummaryList";
import { WinLossDonut } from "@/components/dashboard/WinLossDonut";
import { TopPairsChart } from "@/components/dashboard/TopPairsChart";
import { RecentActivityList } from "@/components/dashboard/RecentActivityList";
import { useAccounts } from "@/hooks/useAccounts";
import { useTradeStats, usePairStats } from "@/hooks/useTrades";
import { useBalanceHistory, useRecentTransactions } from "@/hooks/useTransactions";
import { useUserScore } from "@/hooks/useScore";

export const Dashboard = () => {
  const { data: accountsData, isLoading: accountsLoading } = useAccounts();
  const { data: tradeStatsData, isLoading: statsLoading } = useTradeStats();
  const { data: pairStatsData, isLoading: pairsLoading } = usePairStats();
  const { data: balanceHistoryData, isLoading: historyLoading } = useBalanceHistory();
  const { data: recentTxData, isLoading: txLoading } = useRecentTransactions(5);
  const { data: userScoreData, isLoading: scoreLoading } = useUserScore();

  const accounts = accountsData?.accounts ?? [];
  const tradeStats = tradeStatsData;
  const pairStats = pairStatsData;
  const balanceHistory = balanceHistoryData?.history ?? balanceHistoryData;
  const recentTransactions = recentTxData?.transactions ?? [];
  const userScore = userScoreData;

  // Show full skeleton while primary data loads
  if (accountsLoading) {
    return <DashboardSkeleton />;
  }

  // Empty state: no accounts
  if (!accounts.length) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[60vh]">
        <EmptyState
          icon={PlusCircle}
          title="No accounts yet"
          description="Add your first trading account to start tracking your performance across all your accounts."
          action={
            <Button asChild>
              <Link to="/accounts/new">Create First Account</Link>
            </Button>
          }
        />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Row 1: Stat cards */}
      <StatCards
        accounts={accounts}
        tradeStats={tradeStats}
        userScore={userScore}
      />

      {/* Row 2: Balance history + account summary */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 trading-card p-4">
          <p className="text-xs font-medium text-muted-foreground mb-4 uppercase tracking-widest">
            Balance History
          </p>
          <div className="h-56">
            <BalanceHistoryChart
              data={balanceHistory}
              isLoading={historyLoading}
            />
          </div>
        </div>
        <div className="trading-card p-4">
          <p className="text-xs font-medium text-muted-foreground mb-3 uppercase tracking-widest">
            Accounts
          </p>
          <AccountSummaryList
            accounts={accounts}
            isLoading={false}
          />
        </div>
      </div>

      {/* Row 3: Donut + Top pairs + Recent activity */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="trading-card p-4">
          <p className="text-xs font-medium text-muted-foreground mb-3 uppercase tracking-widest">
            Win / Loss
          </p>
          <WinLossDonut
            tradeStats={tradeStats}
            isLoading={statsLoading}
          />
        </div>
        <div className="trading-card p-4">
          <p className="text-xs font-medium text-muted-foreground mb-3 uppercase tracking-widest">
            Top Pairs
          </p>
          <TopPairsChart
            pairStats={pairStats}
            isLoading={pairsLoading}
          />
        </div>
        <div className="trading-card p-4">
          <p className="text-xs font-medium text-muted-foreground mb-3 uppercase tracking-widest">
            Recent Activity
          </p>
          <RecentActivityList
            transactions={recentTransactions}
            isLoading={txLoading}
          />
        </div>
      </div>
    </div>
  );
};
```

- [ ] **Step 2: Commit**

```bash
git add src/pages/app/Dashboard.jsx
git commit -m "feat: add Dashboard home page with stats, charts, account summary, activity feed"
```

---

## Task 11: Verification

- [ ] **Step 1: Start dev server**

Run: `npm run dev`
Expected: Dev server starts, no build errors

- [ ] **Step 2: Test routes**

Navigate to each route and verify DashboardLayout wraps them:
- `/dashboard` → Dashboard home
- `/accounts` → ComingSoon stub inside layout
- `/transactions` → ComingSoon stub inside layout
- `/analytics` → Analytics ComingSoon page inside layout
- `/strategies` → Strategies page inside layout

- [ ] **Step 3: Test sidebar collapse (desktop)**

At ≥768px viewport:
- Sidebar visible at 240px
- Click chevron → animates to 64px, labels disappear, icons remain
- Hover icon when collapsed → tooltip shows label
- Click chevron again → expands to 240px

- [ ] **Step 4: Test mobile sidebar**

At <768px viewport:
- Sidebar not visible in normal flow
- Tap hamburger in header → overlay drawer slides in from left
- Tap backdrop → drawer slides out
- X button inside drawer → closes drawer

- [ ] **Step 5: Test dashboard data states**

With logged-in user:
- When data is loading → skeleton rows appear (no spinners)
- When accounts = 0 → EmptyState with "Create First Account" button
- When accounts exist → all 3 rows render, numbers in font-mono
- Profit values → green (`text-[hsl(var(--profit))]`)
- Loss values → red (`text-[hsl(var(--loss))]`)

- [ ] **Step 6: Test notification bell**

- Unread count > 0 → badge visible on bell icon
- Count > 99 → badge shows "99+"
- Badge ≤ 30 seconds stale (re-fetches on interval)

- [ ] **Step 7: Test theme toggle**

- Click moon/sun icon in header → theme switches dark/light
- All CSS variables respond correctly
- No hardcoded colors visible

- [ ] **Step 8: Commit final**

```bash
git add -A
git commit -m "feat: complete dashboard layout + home page with verified functionality"
```

---

## Spec Coverage Checklist

| Requirement | Task |
|---|---|
| Sidebar 240px expanded / 64px collapsed | Task 3, 5 |
| Framer Motion collapse animation | Task 3, 5 |
| Sections: OVERVIEW, TRADING, TOOLS, COMING SOON | Task 3 |
| Nav items with lucide-react icons | Task 3 |
| "Soon" badge on Coming Soon items | Task 3 |
| Bottom: user avatar, name, email, logout | Task 3 |
| Header 56px height | Task 4 |
| Header: hamburger (mobile), page title | Task 4, 5 |
| Header: notification bell + unread badge | Task 4 |
| Header: theme toggle | Task 4 |
| Header: user avatar dropdown | Task 4 |
| Mobile sidebar hidden by default | Task 5 |
| Hamburger opens overlay drawer | Task 5 |
| Slides in from left (framer-motion) | Task 5 |
| Backdrop click closes drawer | Task 5 |
| Row 1: 4 stat cards | Task 7 |
| Total Balance (sum all non-war accounts) | Task 7 |
| Today's P&L | Task 7 |
| Overall Win Rate | Task 7 |
| Business Score | Task 7 |
| Row 2: Balance History (TradingView area) | Task 8 |
| Row 2: Account summary list | Task 8 |
| Row 3: Win/Loss donut (Recharts) | Task 9 |
| Row 3: Top pairs bar chart | Task 9 |
| Row 3: Recent activity (last 5 transactions) | Task 9 |
| Empty state: no accounts → create prompt | Task 10 |
| useAuth hook | Task 1 |
| useAccounts hook | Task 1 |
| useNotifications hook | Task 1 |
| useTrades hook | Task 1 |
| useTransactions hook | Task 1 |
| useScore hook | Task 1 |
| DashboardLayout wraps all /app routes | Task 5 |
| Auth loading → text only, no spinner | Task 2 |
| Dashboard loading → skeleton only, no spinner | Task 6, 10 |
| All numbers → font-mono | Tasks 7–9 |
| Profit → text-[hsl(var(--profit))] | Tasks 7–9 |
| Loss → text-[hsl(var(--loss))] | Tasks 7–9 |
| Never hardcode colors | All tasks |
| Dark mode default | All tasks |
| War accounts excluded from aggregate metrics | Task 7 |
| Never cache unread count > 30 seconds | Task 1 |
