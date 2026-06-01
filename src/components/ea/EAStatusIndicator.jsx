import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

const SIZE = {
  sm: "w-2 h-2",
  md: "w-3 h-3",
  lg: "w-4 h-4",
};

function getStatus(eaSync) {
  if (!eaSync?.enabled) return "not_configured";
  if (eaSync.isOnline) return "online";
  const lastBeat = eaSync.lastHeartbeatAt ?? eaSync.lastHeartbeat;
  if (lastBeat) {
    const secondsAgo = (Date.now() - new Date(lastBeat).getTime()) / 1000;
    if (secondsAgo < 60) return "connecting";
  }
  return "offline";
}

const STATUS_CONFIG = {
  online:         { color: "bg-[var(--profit)]",         label: "Online"          },
  offline:        { color: "bg-[var(--loss)]",           label: "Offline"         },
  connecting:     { color: "bg-[var(--warning)]",        label: "Connecting"      },
  not_configured: { color: "bg-muted-foreground",        label: "Not configured"  },
};

export const EAStatusIndicator = ({ eaSync, size = "md", showLabel = true, className }) => {
  const status = getStatus(eaSync);
  const { color, label } = STATUS_CONFIG[status];
  const dotClass = SIZE[size] ?? SIZE.md;

  return (
    <div className={cn("flex items-center gap-1.5", className)}>
      <span className="relative flex-shrink-0" style={{ width: SIZE[size]?.split(" ")[0]?.replace("w-", "") * 4, height: SIZE[size]?.split(" ")[1]?.replace("h-", "") * 4 }}>
        {status === "online" ? (
          <motion.span
            className={cn("rounded-full absolute inset-0", color)}
            animate={{ opacity: [1, 0.3, 1] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          />
        ) : (
          <span className={cn("rounded-full absolute inset-0", color)} />
        )}
      </span>
      {showLabel && (
        <span className="text-xs text-muted-foreground">{label}</span>
      )}
    </div>
  );
};

// Simpler inline version using className-based sizing
export const EAStatusDot = ({ eaSync, size = "md", showLabel = true, className }) => {
  const status = getStatus(eaSync);
  const { color, label } = STATUS_CONFIG[status];
  const dotClass = SIZE[size] ?? SIZE.md;

  return (
    <div className={cn("flex items-center gap-1.5", className)}>
      <span className="relative flex-shrink-0 flex items-center justify-center">
        <span className={cn("rounded-full flex-shrink-0", dotClass, color)} />
        {status === "online" && (
          <motion.span
            className={cn("rounded-full absolute", dotClass, color)}
            animate={{ scale: [1, 1.8], opacity: [0.6, 0] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeOut" }}
          />
        )}
      </span>
      {showLabel && (
        <span className="text-xs text-muted-foreground">{label}</span>
      )}
    </div>
  );
};
