import { Badge } from "@/components/ui/badge";

const CONFIG = {
  prop:   { label: "PROP",   cls: "bg-blue-500/10  text-blue-400  border-blue-500/20"  },
  normal: { label: "NORMAL", cls: "bg-green-500/10 text-green-400 border-green-500/20" },
  war:    { label: "WAR",    cls: "bg-red-500/10   text-red-400   border-red-500/20"   },
};

export const AccountTypeBadge = ({ type }) => {
  const { label, cls } = CONFIG[type] ?? CONFIG.normal;
  return (
    <Badge variant="outline" className={cls}>
      {label}
    </Badge>
  );
};
