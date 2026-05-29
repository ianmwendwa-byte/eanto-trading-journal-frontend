import { useState } from "react";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

export const GradeStars = ({ value = 0, onChange, readonly = false }) => {
  const [hovered, setHovered] = useState(0);
  const display = readonly ? value : (hovered || value);

  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={readonly}
          onClick={() => !readonly && onChange?.(star === value ? 0 : star)}
          onMouseEnter={() => !readonly && setHovered(star)}
          onMouseLeave={() => !readonly && setHovered(0)}
          className={cn(
            "p-0 transition-colors",
            readonly ? "cursor-default" : "cursor-pointer hover:scale-110 transition-transform"
          )}
        >
          <Star
            className={cn(
              "h-3.5 w-3.5 transition-colors",
              star <= display
                ? "fill-[hsl(var(--warning))] text-[hsl(var(--warning))]"
                : "text-muted-foreground fill-transparent"
            )}
          />
        </button>
      ))}
    </div>
  );
};
