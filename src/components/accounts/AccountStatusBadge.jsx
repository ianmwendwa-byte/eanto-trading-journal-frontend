import { Badge } from "@/components/ui/badge";

const CONFIG = {
  // Normal / War
  active:     { label: "Active",       cls: "bg-[var(--profit)]/10 text-[var(--profit)] border-[var(--profit)]/20" },
  inactive:   { label: "Inactive",     cls: "bg-muted text-muted-foreground border-border" },
  // Prop
  evaluation: { label: "Evaluation",   cls: "bg-[var(--warning)]/10 text-[var(--warning)] border-[var(--warning)]/20" },
  funded:     { label: "Funded",        cls: "bg-blue-500/10 text-blue-400 border-blue-500/20" },
  passed:     { label: "Passed ✓",      cls: "bg-[var(--profit)]/10 text-[var(--profit)] border-[var(--profit)]/20" },
  failed:     { label: "Failed ✗",      cls: "bg-[var(--loss)]/10 text-[var(--loss)] border-[var(--loss)]/20" },
  blown:      { label: "Blown",         cls: "bg-[var(--loss)]/10 text-[var(--loss)] border-[var(--loss)]/20" },
  completed:  { label: "Completed",     cls: "bg-muted text-muted-foreground border-border" },
  breached:   { label: "Breached",      cls: "bg-[var(--loss)]/10 text-[var(--loss)] border-[var(--loss)]/20" },
  paused:     { label: "Paused",        cls: "bg-muted text-muted-foreground border-border" },
  archived:   { label: "Archived",      cls: "bg-muted text-muted-foreground border-border" },
};

export const AccountStatusBadge = ({ status }) => {
  if (!status) return null;
  const { label, cls } = CONFIG[status] ?? { label: status, cls: "bg-muted text-muted-foreground border-border" };
  return (
    <Badge variant="outline" className={cls}>
      {label}
    </Badge>
  );
};
