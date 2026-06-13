import { Clock, RefreshCw, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ScoreDial, BAND_CONFIG } from "./ScoreDial";
import { cn } from "@/lib/utils";
import { formatDate } from "@/utils/format";

const BAND_DESCRIPTIONS = {
  needs_work:  "Your trading habits need serious attention. Focus on discipline and risk control.",
  developing:  "You're building the foundations of consistent trading. Keep refining your process.",
  progressing: "You're on the right track. Tighten your edge and consistency to push higher.",
  solid:       "Your trading business is running well. Stay disciplined and protect your edge.",
  elite:       "Exceptional execution. You're operating at the highest level of trading discipline.",
};

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
  if (diffDays >= 1) return `Next update in ${diffDays}d`;
  return `Next update in ${diffHours}h`;
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
      initial={{ opacity: 0, y: -16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="trading-card p-6 md:p-8"
    >
      <div className="flex flex-col sm:flex-row items-center gap-8 md:gap-12">

        {/* ── Dial — sole score display ── */}
        <div className="flex-shrink-0">
          <ScoreDial score={overall} band={band} size={200} animate />
        </div>

        {/* ── Info — adds context, never repeats the number ── */}
        <div className="flex-1 min-w-0 w-full space-y-4">

          {/* Band headline */}
          <div>
            {bandInfo ? (
              <>
                <h2
                  className="font-heading font-bold text-2xl leading-tight"
                  style={{ color: bandInfo.color }}
                >
                  {bandInfo.label}
                </h2>
                <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
                  {BAND_DESCRIPTIONS[band]}
                </p>
              </>
            ) : (
              <h2 className="font-heading font-bold text-2xl text-muted-foreground">
                Not yet scored
              </h2>
            )}
          </div>

          {/* Delta from last week */}
          {scoreDelta !== null && (
            <div className="flex items-center gap-2">
              {scoreDelta > 0 ? (
                <>
                  <TrendingUp className="h-4 w-4 text-[var(--profit)] shrink-0" />
                  <span className="text-sm font-semibold font-mono text-[var(--profit)]">
                    +{scoreDelta} pts from last week
                  </span>
                </>
              ) : scoreDelta < 0 ? (
                <>
                  <TrendingDown className="h-4 w-4 text-[var(--loss)] shrink-0" />
                  <span className="text-sm font-semibold font-mono text-[var(--loss)]">
                    {scoreDelta} pts from last week
                  </span>
                </>
              ) : (
                <>
                  <Minus className="h-4 w-4 text-muted-foreground shrink-0" />
                  <span className="text-sm text-muted-foreground">No change from last week</span>
                </>
              )}
            </div>
          )}

          <Separator />

          {/* Meta */}
          <div className="flex items-center gap-5 flex-wrap">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Clock className="h-3.5 w-3.5 shrink-0" />
              <span>
                {calculatedAt
                  ? `Calculated ${formatDate(calculatedAt)}`
                  : "Not yet calculated"}
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <RefreshCw className="h-3.5 w-3.5 shrink-0" />
              <span>{getNextCalcText()}</span>
            </div>
          </div>

          {/* Recalculate */}
          <div className="flex items-center gap-3 flex-wrap">
            <Button
              variant="outline"
              size="sm"
              className="gap-2"
              disabled={isDisabled}
              onClick={() => onRecalculate?.()}
            >
              <RefreshCw className={cn("h-3.5 w-3.5", isRecalculating && "animate-spin")} />
              {isRecalculating ? "Recalculating..." : "Recalculate"}
            </Button>
            {cooldown && !isRecalculating && (
              <p className="text-xs text-muted-foreground">Available once per hour</p>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};
