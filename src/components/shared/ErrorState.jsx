import { useEffect } from "react";
import { AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const ErrorState = ({ message, onRetry, className }) => {
  useEffect(() => {
    toast.error(message);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleRetry = () => {
    toast.info("Retrying...");
    onRetry?.();
  };

  return (
    <div className={cn(
      "flex flex-col items-center justify-center py-10 text-center space-y-3",
      className
    )}>
      <AlertCircle className="h-8 w-8 text-destructive" />
      <div className="space-y-1">
        <p className="text-sm font-medium text-foreground">Failed to load</p>
        <p className="text-xs text-muted-foreground max-w-xs">{message}</p>
      </div>
      {onRetry && (
        <Button variant="outline" size="sm" onClick={handleRetry}>
          Try again
        </Button>
      )}
    </div>
  );
};
