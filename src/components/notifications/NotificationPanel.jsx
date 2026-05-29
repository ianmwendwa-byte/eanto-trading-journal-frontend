import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { X, Bell } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/store/useAppStore";
import {
  useNotifications,
  useUnreadCount,
  useMarkAsRead,
  useMarkAllAsRead,
  useDeleteNotification,
} from "@/hooks/useNotifications";
import { NotificationItem } from "./NotificationItem";
import { NotificationItemSkeleton } from "./NotificationItemSkeleton";
import { staggerContainerVariants, staggerItemVariants } from "@/lib/animations";

const PANEL_WIDTH = 380;

const FILTER_TABS = [
  { key: "all",      label: "All" },
  { key: "unread",   label: "Unread" },
  { key: "critical", label: "Critical" },
];

const getFilterParams = (filter) => {
  if (filter === "unread")   return { read: "false" };
  if (filter === "critical") return { severity: "critical" };
  return {};
};

const groupByDate = (notifications) => {
  const now   = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const weekAgo = new Date(today);
  weekAgo.setDate(weekAgo.getDate() - 7);

  const groups = { Today: [], Yesterday: [], "This Week": [], Earlier: [] };

  notifications.forEach((n) => {
    const d = new Date(n.createdAt);
    const day = new Date(d.getFullYear(), d.getMonth(), d.getDate());
    if (day.getTime() === today.getTime()) {
      groups.Today.push(n);
    } else if (day.getTime() === yesterday.getTime()) {
      groups.Yesterday.push(n);
    } else if (d >= weekAgo) {
      groups["This Week"].push(n);
    } else {
      groups.Earlier.push(n);
    }
  });

  return Object.entries(groups).filter(([, items]) => items.length > 0);
};

export const NotificationPanel = () => {
  const navigate = useNavigate();
  const {
    notificationPanelOpen,
    setNotificationPanelOpen,
    notificationFilter,
    setNotificationFilter,
  } = useAppStore();

  const { data: unreadCount = 0 } = useUnreadCount();
  const filterParams = getFilterParams(notificationFilter);

  const { data, isLoading } = useNotifications({ limit: 20, ...filterParams });
  const notifications = data?.notifications ?? [];

  const markAsRead  = useMarkAsRead();
  const markAllRead = useMarkAllAsRead();
  const deleteNotif = useDeleteNotification();

  const handleClose = () => setNotificationPanelOpen(false);

  const handleViewAll = () => {
    navigate("/notifications");
    handleClose();
  };

  const groups = groupByDate(notifications);

  return (
    <AnimatePresence>
      {notificationPanelOpen && (
        <>
          {/* Backdrop — transparent, just catches clicks */}
          <motion.div
            key="notif-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 z-40"
            onClick={handleClose}
          />

          {/* Panel */}
          <motion.div
            key="notif-panel"
            initial={{ x: PANEL_WIDTH, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: PANEL_WIDTH, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className={cn(
              "fixed right-0 top-0 h-full z-50 flex flex-col",
              "bg-card border-l border-border shadow-2xl"
            )}
            style={{ width: PANEL_WIDTH }}
          >
            {/* Header */}
            <div className="h-14 flex items-center justify-between px-4 border-b border-border shrink-0">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-sm text-foreground">Notifications</span>
                {unreadCount > 0 && (
                  <span className="text-xs text-muted-foreground">
                    {unreadCount} unread
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => markAllRead.mutate()}
                  disabled={unreadCount === 0 || markAllRead.isPending}
                  className="text-xs text-primary hover:underline disabled:opacity-40 disabled:no-underline disabled:cursor-not-allowed transition-opacity"
                >
                  {markAllRead.isPending ? "Marking..." : "Mark all read"}
                </button>
                <button
                  onClick={handleClose}
                  className="h-7 w-7 flex items-center justify-center rounded-md hover:bg-muted transition-colors text-muted-foreground ml-2"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Filter tabs */}
            <div className="flex items-center gap-1 px-4 py-2 border-b border-border">
              {FILTER_TABS.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setNotificationFilter(tab.key)}
                  className={cn(
                    "text-xs px-2.5 py-1 rounded-full transition-colors font-medium",
                    notificationFilter === tab.key
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-muted"
                  )}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Notification list */}
            <div className="flex-1 overflow-y-auto">
              {isLoading ? (
                <div className="p-2 space-y-1">
                  {[1, 2, 3].map((i) => (
                    <NotificationItemSkeleton key={i} />
                  ))}
                </div>
              ) : notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full py-16 text-center px-4">
                  <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center mb-3">
                    <Bell className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <p className="text-sm font-medium text-foreground">
                    {notificationFilter === "unread" ? "No unread notifications" : "All caught up!"}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {notificationFilter === "unread"
                      ? "You've read everything."
                      : "No notifications right now."}
                  </p>
                </div>
              ) : (
                <motion.div
                  variants={staggerContainerVariants}
                  initial="initial"
                  animate="animate"
                  className="p-2"
                >
                  {groups.map(([label, items]) => (
                    <div key={label}>
                      <p className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground px-2 py-2">
                        {label}
                      </p>
                      <AnimatePresence initial={false}>
                        {items.map((n) => (
                          <motion.div
                            key={n._id}
                            variants={staggerItemVariants}
                            className="mb-0.5"
                          >
                            <NotificationItem
                              notification={n}
                              onRead={(id) => markAsRead.mutate(id)}
                              onDelete={(id) => deleteNotif.mutate(id)}
                              compact
                            />
                          </motion.div>
                        ))}
                      </AnimatePresence>
                    </div>
                  ))}
                </motion.div>
              )}
            </div>

            {/* Footer */}
            <div className="border-t border-border p-4 shrink-0">
              <button
                onClick={handleViewAll}
                className="w-full text-sm text-primary hover:underline text-center"
              >
                View all notifications
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
