import { Badge } from "@/components/ui/badge";

const CONFIG = {
  prop:   { label: "PROP",   cls: "bg-blue-500/10 text-blue-400 border-blue-500/20" },
  normal: { label: "NORMAL", cls: "bg-[var(--profit)]/10 text-[var(--profit)] border-[var(--profit)]/20" },
  war:    { label: "WAR",    cls: "bg-[var(--loss)]/10 text-[var(--loss)] border-[var(--loss)]/20" },
};

export const AccountTypeBadge = ({ type }) => {
  const { label, cls } = CONFIG[type] ?? CONFIG.normal;
  return (
    <Badge variant="outline" className={cls}>
      {label}
    </Badge>
  );
};
