import { Info } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export const InfoTooltip = ({ content, side = "top" }) => (
  <TooltipProvider>
    <Tooltip>
      <TooltipTrigger asChild>
        <Info className="h-3.5 w-3.5 text-muted-foreground hover:text-foreground cursor-help transition-colors flex-shrink-0" />
      </TooltipTrigger>
      <TooltipContent side={side} className="max-w-xs">
        <p className="text-xs leading-relaxed">{content}</p>
      </TooltipContent>
    </Tooltip>
  </TooltipProvider>
);
