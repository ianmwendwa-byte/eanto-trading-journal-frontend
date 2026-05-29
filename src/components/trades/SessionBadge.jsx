import { cn } from "@/lib/utils";

const CONFIG = {
  london:   { label: "London",   cls: "bg-blue-500/10   text-blue-400   border-blue-500/20"   },
  new_york: { label: "New York", cls: "bg-purple-500/10 text-purple-400 border-purple-500/20" },
  tokyo:    { label: "Asian",    cls: "bg-cyan-500/10   text-cyan-400   border-cyan-500/20"   },
  sydney:   { label: "Sydney",   cls: "bg-orange-500/10 text-orange-400 border-orange-500/20" },
  overlap:  { label: "Overlap",  cls: "bg-indigo-500/10 text-indigo-400 border-indigo-500/20" },
  custom:   { label: "Custom",   cls: "bg-muted         text-muted-foreground border-border"  },
};

export const SessionBadge = ({ session, small = false }) => {
  if (!session) return null;
  const { label, cls } = CONFIG[session] ?? CONFIG.custom;
  return (
    <span className={cn(
      "inline-flex items-center rounded border font-medium whitespace-nowrap",
      small ? "px-1 py-0 text-[10px]" : "px-1.5 py-0.5 text-xs",
      cls
    )}>
      {label}
    </span>
  );
};
