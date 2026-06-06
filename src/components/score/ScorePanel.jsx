import { Clock, RefreshCw, TrendingUp, TrendingDown } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ScoreDial, BAND_CONFIG } from "./ScoreDial";
import { cn } from "@/lib/utils";
import { formatDate } from "@/utils/format";

const getNextCalcText = () => {
  const now = new Date();
  const day = now.getUTCDay();
  const daysUntil = day === 5 ? 7 : (5 - day + 7) % 7 || 7;
  const nextFriday = new Date(now);
  nextFriday.setUTCDate(now.getUTCDate() + daysUntil);
  nextFriday.setUTCHours(23, 59, 0, 0);
  const diffMs = nextFriday - now;
  if (diffMs <= 0) return "Calculating now...";
  const diffDays  = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  if (diffDays >= 1) return `Next update in ${diffDays} day${diffDays !== 1 ? "s" : ""}`;
  return `Next update in ${diffHours} hour${diffHours !== 1 ? "s" : ""}`;
};

const isCooldownActive = (calculatedAt) => {
  if (!calculatedAt) return false;
  return Date.now() - new Date(calculatedAt).getTime() < 60 * 60 * 1000;
};

export const ScorePanel = ({ score, previousScore, onRecalculate, isRecalculating }) => {
  const overall      = score?.overall ?? null;
  const band         = score?.band ?? null;
  const calculatedAt = score?.calculatedAt ?? null;
  const bandInfo     = band ? BAND_CONFIG[band] : null;
  const cooldown     = isCooldownActive(calculatedAt);
  const isDisabled   = isRecalculating || cooldown;

  const scoreDelta = overall != null && previousScore != null
    ? overall - previousScore
    : null;

  return (
    <motion.div
      initial={{ opacity: 0, x: -30 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="w-full md:w-80 flex-shrink-0 space-y-3"
    >
      {/* Dial card */}
      <div className="trading-card p-6 flex flex-col items-center">
        <ScoreDial score={overall} band={band} size={200} animate />

        {bandInfo && (
          <div className="mt-4 w-full flex items-center justify-between bg-background rounded-lg border border-border p-3">
            <span
              className="text-sm font-medium px-2 py-0.5 rounded-md"
              style={{ color: bandInfo.color, background: `${bandInfo.color}18` }}
            >
              {bandInfo.label}
            </span>
            <span className="text-xs text-muted-foreground font-mono">{bandInfo.range}</span>
          </div>
        )}
      </div>

      {/* Meta info */}
      <div className="trading-card p-4 space-y-2">
        <div className="flex items-center gap-2">
          <Clock className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
          <p className="text-xs text-muted-foreground">
            {calculatedAt ? `Calculated ${formatDate(calculatedAt)}` : "Not yet calculated"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <RefreshCw className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
          <p className="text-xs text-muted-foreground">{getNextCalcText()}</p>
        </div>
      </div>

      {/* Recalculate */}
      <div className="trading-card p-4 space-y-2">
        <Button
          variant="outline"
          size="sm"
          className="w-full gap-2"
          disabled={isDisabled}
          onClick={() => onRecalculate?.()}
        >
          <RefreshCw className={cn("h-3.5 w-3.5", isRecalculating && "animate-spin")} />
          {isRecalculating ? "Recalculating..." : "Recalculate"}
        </Button>
        {cooldown && !isRecalculating && (
          <p className="text-xs text-muted-foreground text-center">Available once per hour</p>
        )}
      </div>

      {/* vs last week */}
      {scoreDelta !== null && (
        <div className="trading-card p-4">
          <p className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground mb-2">
            vs last week
          </p>
          <div className="flex items-center gap-2">
            {scoreDelta > 0 ? (
              <>
                <TrendingUp className="h-4 w-4 text-[var(--profit)]" />
                <span className="font-mono font-bold text-[var(--profit)]">↑ +{scoreDelta} points</span>
              </>
            ) : scoreDelta < 0 ? (
              <>
                <TrendingDown className="h-4 w-4 text-[var(--loss)]" />
                <span className="font-mono font-bold text-[var(--loss)]">↓ {scoreDelta} points</span>
              </>
            ) : (
              <span className="font-mono text-muted-foreground">→ Same as last week</span>
            )}
          </div>
          {previousScore != null && (
            <p className="text-xs text-muted-foreground mt-1">
              Was <span className="font-mono">{previousScore}</span> last week
            </p>
          )}
        </div>
      )}
    </motion.div>
  );
};
