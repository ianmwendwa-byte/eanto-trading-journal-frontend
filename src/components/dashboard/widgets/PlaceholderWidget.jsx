import { Lock } from "lucide-react";

export const PlaceholderWidget = ({ label, size = "medium" }) => (
  <div className="trading-card p-4 h-full flex flex-col items-center justify-center text-center min-h-[120px]">
    <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center mb-2">
      <Lock className="h-4 w-4 text-muted-foreground" />
    </div>
    <p className="text-sm font-medium text-foreground">{label}</p>
    <p className="text-xs text-muted-foreground mt-1">Coming soon</p>
  </div>
);
