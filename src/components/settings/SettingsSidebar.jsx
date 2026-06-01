import { cn } from "@/lib/utils";
import {
  User, TrendingUp, Bell, Sparkles, LayoutDashboard,
  Shield, Zap, CreditCard,
} from "lucide-react";

export const SETTINGS_SECTIONS = [
  { id: "profile",      label: "Profile",        icon: User },
  { id: "trading",      label: "Trading",         icon: TrendingUp },
  { id: "notifications",label: "Notifications",   icon: Bell },
  { id: "ai",           label: "AI Preferences",  icon: Sparkles },
  { id: "dashboard",    label: "Dashboard",       icon: LayoutDashboard },
  { id: "security",     label: "Security",        icon: Shield },
  { id: "beta",         label: "Beta Features",   icon: Zap },
  { id: "subscription", label: "Subscription",    icon: CreditCard },
];

export const SettingsSidebar = ({ activeSection, onSectionChange }) => {
  return (
    <nav className="w-full space-y-0.5">
      {SETTINGS_SECTIONS.map(({ id, label, icon: Icon }) => {
        const isActive = activeSection === id;
        return (
          <button
            key={id}
            onClick={() => onSectionChange(id)}
            className={cn(
              "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-150 text-left",
              isActive
                ? "bg-primary/10 text-primary font-medium border-l-2 border-primary"
                : "text-muted-foreground hover:bg-muted hover:text-foreground border-l-2 border-transparent"
            )}
          >
            <Icon className="h-4 w-4 shrink-0" />
            <span>{label}</span>
          </button>
        );
      })}
    </nav>
  );
};
