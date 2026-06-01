import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatRelativeTime } from "@/utils/format";
import { SEVERITY_CONFIG } from "@/constants/notifications";
import { CategoryBadge } from "./CategoryBadge";

export const NotificationItem = ({
  notification,
  onRead,
  onDelete,
  onAction,
  compact = false,
}) => {
  const navigate = useNavigate();
  const { _id, severity, title, message, read, createdAt, category, actionUrl } = notification;

  const severityCfg = SEVERITY_CONFIG[severity] ?? SEVERITY_CONFIG.info;
  const SeverityIcon = severityCfg.icon;
  const iconSize = compact ? "h-4 w-4" : "h-5 w-5";
  const circleSize = compact ? "h-7 w-7" : "h-9 w-9";

  const handleClick = () => {
    if (!read && onRead) onRead(_id);
    if (actionUrl) {
      navigate(actionUrl);
      if (onAction) onAction();
    }
  };

  const handleRead = (e) => {
    e.stopPropagation();
    if (onRead) onRead(_id);
  };

  const handleDelete = (e) => {
    e.stopPropagation();
    if (onDelete) onDelete(_id);
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: -4 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: 40, height: 0, marginBottom: 0, paddingTop: 0, paddingBottom: 0 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      onClick={handleClick}
      className={cn(
        "flex items-start gap-3 rounded-lg transition-all duration-150 cursor-pointer group relative",
        compact ? "p-2.5" : "p-3.5",
        !read && "border-l-2 border-l-primary bg-primary/5",
        read && "border-l-2 border-l-transparent",
        "hover:bg-muted/40"
      )}
    >
      {/* Severity icon circle */}
      <div className={cn(
        "rounded-full flex items-center justify-center shrink-0",
        circleSize,
        severityCfg.bg,
        severityCfg.border,
        "border"
      )}>
        <SeverityIcon className={cn(iconSize, severityCfg.text)} />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p className={cn(
          "text-sm leading-snug",
          !read ? "font-semibold text-foreground" : "font-medium text-muted-foreground"
        )}>
          {title}
        </p>
        <p className={cn(
          "text-xs text-muted-foreground mt-0.5",
          compact ? "line-clamp-1" : "line-clamp-2"
        )}>
          {message}
        </p>
        <div className="flex items-center gap-2 mt-1">
          <span className="text-[10px] text-muted-foreground font-mono">
            {formatRelativeTime(createdAt)}
          </span>
          {!compact && <CategoryBadge category={category} />}
        </div>

        {actionUrl && (
          <span className="text-[11px] text-primary font-medium mt-1 inline-block">
            View →
          </span>
        )}
      </div>

      {/* Right: unread dot + action buttons */}
      <div className="flex flex-col items-end gap-1.5 shrink-0">
        <AnimatePresence>
          {!read && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              className="w-2 h-2 rounded-full bg-primary mt-1"
            />
          )}
        </AnimatePresence>

        {/* Action buttons — visible on group hover */}
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
          {!read && (
            <button
              onClick={handleRead}
              title="Mark as read"
              className="h-6 w-6 rounded flex items-center justify-center hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
            >
              <CheckCircle className="h-3.5 w-3.5" />
            </button>
          )}
          <button
            onClick={handleDelete}
            title="Delete"
            className="h-6 w-6 rounded flex items-center justify-center hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </motion.div>
  );
};
