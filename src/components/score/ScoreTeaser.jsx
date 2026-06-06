import { Lock, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ScoreDial } from "./ScoreDial";

export const ScoreTeaser = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-6 py-12">
      <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-6">
        <Lock className="h-8 w-8 text-primary/30" />
      </div>

      <h1 className="font-heading font-bold text-3xl text-foreground mb-3">
        Trading Business Score
      </h1>
      <p className="text-muted-foreground max-w-md mb-8 leading-relaxed">
        Get a real-time 0–100 score that measures your trading business health
        across 5 key pillars: Consistency, Risk Management, Profitability,
        Discipline, and Growth.
      </p>

      {/* Blurred dial — teaser preview */}
      <div
        className="mb-8"
        style={{ filter: "blur(6px)", opacity: 0.4, pointerEvents: "none" }}
      >
        <ScoreDial score={74} band="solid" animate={false} />
      </div>

      <Button onClick={() => navigate("/settings?section=beta")} className="gap-2">
        Enable Business Score Beta
        <ArrowRight className="h-4 w-4" />
      </Button>

      <p className="text-xs text-muted-foreground mt-4">
        Business Score is currently in beta. Enable it in Settings → Beta Features.
      </p>
    </div>
  );
};
