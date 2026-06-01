import { cn } from "@/lib/utils";

const STATUS_CONFIG = {
  online:  { color: "bg-[var(--profit)]", label: "Syncing"         },
  offline: { color: "bg-[var(--loss)]",   label: "Offline"         },
  pending: { color: "bg-[var(--warning)]", label: "Pending"        },
  disabled:{ color: "bg-muted-foreground",      label: "Not configured" },
};

export const EASyncStatus = ({ isOnline, enabled, showLabel = true, className }) => {
  let status = "disabled";
  if (enabled && isOnline)  status = "online";
  if (enabled && !isOnline) status = "offline";

  const { color, label } = STATUS_CONFIG[status];

  return (
    <div className={cn("flex items-center gap-1.5", className)}>
      <span className={cn("w-1.5 h-1.5 rounded-full flex-shrink-0", color)} />
      {showLabel && (
        <span className="text-xs text-muted-foreground">{label}</span>
      )}
    </div>
  );
};
