import { CheckCircle2, Clock, Circle, AlertTriangle, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";

const STATUS_CONFIG = {
  verified: {
    icon:  CheckCircle2,
    label: "Verified",
    class: "bg-[var(--profit)]/10 text-[var(--profit)] border-[var(--profit)]/20",
  },
  pending: {
    icon:  Clock,
    label: "Pending Verification",
    class: "bg-[var(--warning)]/10 text-[var(--warning)] border-[var(--warning)]/20",
  },
  unverified: {
    icon:  Circle,
    label: "Not Verified",
    class: "bg-muted text-muted-foreground border-border",
  },
  suspicious: {
    icon:  AlertTriangle,
    label: "Suspicious Activity",
    class: "bg-[var(--warning)]/10 text-[var(--warning)] border-[var(--warning)]/20",
  },
  failed: {
    icon:  XCircle,
    label: "Verification Failed",
    class: "bg-[var(--loss)]/10 text-[var(--loss)] border-[var(--loss)]/20",
  },
};

export const VerificationBadge = ({ verificationStatus, className }) => {
  const config = STATUS_CONFIG[verificationStatus] ?? STATUS_CONFIG.unverified;
  const Icon = config.icon;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-xs font-medium",
        config.class,
        className
      )}
    >
      <Icon className="h-3 w-3 flex-shrink-0" />
      {config.label}
    </span>
  );
};
