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
