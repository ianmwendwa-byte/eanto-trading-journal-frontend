import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Bell } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/store/useAppStore";
import { useUnreadCount } from "@/hooks/useNotifications";
import { API } from "@/constants/api";
import api from "@/lib/axios";

const safeNavigate = (navigate, url) => {
  try {
    const parsed = new URL(url, window.location.origin);
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") return;
    navigate(parsed.pathname + parsed.search + parsed.hash);
  } catch {
    // invalid URL — do nothing
  }
};

export const NotificationBell = () => {
  const navigate = useNavigate();
  const { notificationPanelOpen, setNotificationPanelOpen } = useAppStore();
  const { data: unreadCount = 0 } = useUnreadCount();
  const [shouldShake, setShouldShake] = useState(false);
  const prevCount = useRef(0);

  const badgeLabel = unreadCount > 99 ? "99+" : String(unreadCount);

  useEffect(() => {
    if (unreadCount > prevCount.current && prevCount.current !== 0) {
      setShouldShake(true);
      setTimeout(() => setShouldShake(false), 600);

      // Fetch the latest unread notification for the toast
      api
        .get(API.NOTIFICATION.BASE, { params: { limit: 1, read: "false" } })
        .then((res) => {
          const latest = res?.data?.data?.[0];
          if (!latest) return;
          const { severity, title, message, actionUrl, actionLabel } = latest;
          const action = actionUrl
            ? { label: actionLabel ?? "View", onClick: () => safeNavigate(navigate, actionUrl) }
            : undefined;

          if (severity === "critical") {
            toast.error(`🚨 ${title}`, { description: message, duration: 6000, action });
          } else if (severity === "warning") {
            toast.warning(`⚠️ ${title}`, { description: message, duration: 5000, action });
          } else {
            toast.info(title, { description: message, duration: 4000, action });
          }
        })
        .catch(() => {
          toast.info("New notification received", { duration: 3000 });
        });
    }
    prevCount.current = unreadCount;
  }, [unreadCount]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <button
      onClick={() => setNotificationPanelOpen(!notificationPanelOpen)}
      className={cn(
        "relative h-8 w-8 flex items-center justify-center rounded-md",
        "hover:bg-muted transition-colors text-muted-foreground",
        notificationPanelOpen && "bg-muted text-foreground"
      )}
      aria-label="Notifications"
    >
      <motion.div
        animate={shouldShake ? {
          rotate: [0, -15, 15, -15, 15, 0],
          transition: { duration: 0.5, ease: "easeInOut" },
        } : {}}
      >
        <Bell className="h-4 w-4" />
      </motion.div>

      <AnimatePresence>
        {unreadCount > 0 && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            transition={{ duration: 0.2, type: "spring", stiffness: 300, damping: 20 }}
            className={cn(
              "absolute -top-1 -right-1 min-w-[18px] h-[18px] rounded-full",
              "bg-destructive text-destructive-foreground",
              "text-[10px] font-bold font-mono flex items-center justify-center px-1 leading-none"
            )}
          >
            {badgeLabel}
          </motion.span>
        )}
      </AnimatePresence>
    </button>
  );
};
