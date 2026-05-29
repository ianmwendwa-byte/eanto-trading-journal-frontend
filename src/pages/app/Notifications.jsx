import { useState, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, SlidersHorizontal, X } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  useNotifications,
  useMarkAsRead,
  useMarkAllAsRead,
  useDeleteNotification,
  useUnreadCount,
} from "@/hooks/useNotifications";
import { NotificationItem }         from "@/components/notifications/NotificationItem";
import { NotificationItemSkeleton } from "@/components/notifications/NotificationItemSkeleton";
import { NotificationPreferencesSheet } from "@/components/notifications/NotificationPreferencesSheet";
import { EmptyState }  from "@/components/shared/EmptyState";
import { Pagination }  from "@/components/shared/Pagination";
import { pageVariants, staggerContainerVariants, staggerItemVariants } from "@/lib/animations";
import { CATEGORY_CONFIG } from "@/constants/notifications";

const SEVERITY_OPTIONS = [
  { value: "",         label: "All" },
  { value: "info",     label: "Info" },
  { value: "warning",  label: "Warning" },
  { value: "critical", label: "Critical" },
];

const READ_OPTIONS = [
  { value: "",      label: "All" },
  { value: "false", label: "Unread" },
  { value: "true",  label: "Read" },
];

const groupByDate = (notifications) => {
  const now       = new Date();
  const today     = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const weekAgo = new Date(today);
  weekAgo.setDate(weekAgo.getDate() - 7);

  const groups = { Today: [], Yesterday: [], "This Week": [], Earlier: [] };
  notifications.forEach((n) => {
    const d   = new Date(n.createdAt);
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

export const Notifications = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [prefsOpen, setPrefsOpen] = useState(false);

  const getParam = (key, fallback = "") =>
    searchParams.get(key) ?? fallback;

  const page     = parseInt(getParam("page", "1"), 10);
  const category = getParam("category") || undefined;
  const read     = getParam("read")     || undefined;
  const severity = getParam("severity") || undefined;

  const setParam = useCallback((key, value) => {
    const next = new URLSearchParams(searchParams);
    if (!value) next.delete(key);
    else        next.set(key, value);
    if (key !== "page") next.set("page", "1");
    setSearchParams(next, { replace: true });
  }, [searchParams, setSearchParams]);

  const clearAll = () => setSearchParams({}, { replace: true });

  const filters = { page, limit: 20, category, read, severity };
  const { data, isLoading } = useNotifications(filters);
  const { data: unreadCount = 0 } = useUnreadCount();

  const notifications = data?.notifications ?? [];
  const pagination    = data?.pagination;

  const markAsRead  = useMarkAsRead();
  const markAllRead = useMarkAllAsRead();
  const deleteNotif = useDeleteNotification();

  const activeFilters = [
    category && { key: "category", label: CATEGORY_CONFIG[category]?.label },
    read     && { key: "read",     label: read === "false" ? "Unread" : "Read" },
    severity && { key: "severity", label: severity.charAt(0).toUpperCase() + severity.slice(1) },
  ].filter(Boolean);

  const hasFilters = activeFilters.length > 0;
  const groups     = groupByDate(notifications);

  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="max-w-3xl mx-auto px-4 py-6 space-y-6"
    >
      {/* Page header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="font-heading font-bold text-2xl text-foreground">Notifications</h1>
          <p className={cn(
            "text-sm mt-0.5",
            unreadCount > 0 ? "text-primary font-medium" : "text-muted-foreground"
          )}>
            {unreadCount > 0
              ? `${unreadCount} unread notification${unreadCount === 1 ? "" : "s"}`
              : "All caught up"}
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => markAllRead.mutate()}
            disabled={unreadCount === 0 || markAllRead.isPending}
            className={cn(
              "h-9 px-3 text-sm border border-border rounded-lg transition-colors",
              "hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed"
            )}
          >
            {markAllRead.isPending ? "Marking..." : "Mark all read"}
          </button>
          <button
            onClick={() => setPrefsOpen(true)}
            className="h-9 w-9 flex items-center justify-center rounded-lg border border-border hover:bg-muted transition-colors text-muted-foreground"
            title="Preferences"
          >
            <SlidersHorizontal className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="space-y-3">
        {/* Category pills */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <button
            onClick={() => setParam("category", "")}
            className={cn(
              "h-7 px-3 rounded-full text-xs font-medium transition-colors",
              !category ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"
            )}
          >
            All
          </button>
          {Object.entries(CATEGORY_CONFIG).map(([key, config]) => {
            const Icon = config.icon;
            return (
              <button
                key={key}
                onClick={() => setParam("category", key)}
                className={cn(
                  "h-7 px-3 rounded-full text-xs font-medium flex items-center gap-1.5 transition-colors",
                  category === key
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                )}
              >
                <Icon className="h-3 w-3" />
                {config.label}
              </button>
            );
          })}
        </div>

        {/* Read + Severity filters */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-1">
            {READ_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setParam("read", opt.value)}
                className={cn(
                  "h-7 px-2.5 rounded-full text-xs font-medium transition-colors",
                  (read ?? "") === opt.value
                    ? "bg-foreground text-background"
                    : "text-muted-foreground hover:bg-muted"
                )}
              >
                {opt.label}
              </button>
            ))}
          </div>
          <div className="w-px h-4 bg-border" />
          <div className="flex items-center gap-1">
            {SEVERITY_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setParam("severity", opt.value)}
                className={cn(
                  "h-7 px-2.5 rounded-full text-xs font-medium transition-colors",
                  (severity ?? "") === opt.value
                    ? "bg-foreground text-background"
                    : "text-muted-foreground hover:bg-muted"
                )}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Active filter chips + result count */}
        {(hasFilters || pagination?.total) && (
          <div className="flex items-center gap-2 flex-wrap">
            {activeFilters.map((f) => (
              <span
                key={f.key}
                className="inline-flex items-center gap-1 h-6 px-2 rounded-full bg-primary/10 text-primary text-xs font-medium"
              >
                {f.label}
                <button onClick={() => setParam(f.key, "")} className="hover:opacity-70">
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}
            {hasFilters && (
              <button
                onClick={clearAll}
                className="text-xs text-muted-foreground hover:text-foreground underline"
              >
                Clear all
              </button>
            )}
            {pagination?.total !== undefined && (
              <span className="text-xs text-muted-foreground ml-auto font-mono">
                {pagination.total} notification{pagination.total !== 1 ? "s" : ""}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="space-y-1.5">
          {[1, 2, 3, 4, 5].map((i) => (
            <NotificationItemSkeleton key={i} />
          ))}
        </div>
      ) : notifications.length === 0 ? (
        <EmptyState
          icon={Bell}
          title={hasFilters ? "No notifications match your filters" : "All caught up!"}
          description={
            hasFilters
              ? "Try adjusting or clearing your filters."
              : "You have no notifications. We'll alert you when something needs your attention."
          }
          action={
            hasFilters ? (
              <button
                onClick={clearAll}
                className="h-9 px-4 text-sm bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
              >
                Clear filters
              </button>
            ) : undefined
          }
        />
      ) : (
        <motion.div
          variants={staggerContainerVariants}
          initial="initial"
          animate="animate"
          className="space-y-4"
        >
          {groups.map(([label, items]) => (
            <div key={label}>
              <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground mb-2 px-1">
                {label}
              </p>
              <div className="rounded-xl border border-border overflow-hidden">
                <AnimatePresence initial={false}>
                  {items.map((n, i) => (
                    <motion.div
                      key={n._id}
                      variants={staggerItemVariants}
                      className={cn(i < items.length - 1 && "border-b border-border")}
                    >
                      <NotificationItem
                        notification={n}
                        onRead={(id) => markAsRead.mutate(id)}
                        onDelete={(id) => deleteNotif.mutate(id)}
                        compact={false}
                      />
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </div>
          ))}
        </motion.div>
      )}

      {/* Pagination */}
      {pagination && pagination.pages > 1 && (
        <Pagination
          page={page}
          totalPages={pagination.pages}
          total={pagination.total}
          limit={20}
          onPageChange={(p) => setParam("page", String(p))}
        />
      )}

      {/* Preferences sheet */}
      <NotificationPreferencesSheet open={prefsOpen} onClose={() => setPrefsOpen(false)} />
    </motion.div>
  );
};
