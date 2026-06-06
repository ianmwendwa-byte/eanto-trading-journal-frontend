import { motion } from "framer-motion";
import { AnimatedScore } from "./AnimatedScore";

export const BAND_CONFIG = {
  needs_work:  { label: "Needs Work",  range: "0–20",   color: "hsl(var(--loss))",    textClass: "text-[var(--loss)]"    },
  developing:  { label: "Developing",  range: "21–40",  color: "hsl(var(--warning))", textClass: "text-[var(--warning)]" },
  progressing: { label: "Progressing", range: "41–60",  color: "hsl(var(--primary))", textClass: "text-[var(--primary)]" },
  solid:       { label: "Solid",       range: "61–80",  color: "hsl(var(--profit))",  textClass: "text-[var(--profit)]"  },
  elite:       { label: "Elite",       range: "81–100", color: "hsl(var(--info))",    textClass: "text-[var(--info)]"    },
};

export const getBandFromScore = (score) => {
  if (score == null) return null;
  if (score <= 20)   return "needs_work";
  if (score <= 40)   return "developing";
  if (score <= 60)   return "progressing";
  if (score <= 80)   return "solid";
  return "elite";
};

export const ScoreDial = ({ score, band: bandProp, size = 200, animate = true }) => {
  const strokeWidth  = size * 0.06;
  const radius       = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const center        = size / 2;
  const arcLength     = circumference * (270 / 360);

  // offset: full arcLength = no arc shown, 0 = full arc shown
  const scoreOffset = score == null
    ? arcLength
    : arcLength * (1 - score / 100);

  const band     = bandProp ?? getBandFromScore(score);
  const arcColor = band ? BAND_CONFIG[band].color : "hsl(var(--muted-foreground))";
  const bandLabel = band ? BAND_CONFIG[band].label : null;

  return (
    <div style={{ position: "relative", width: size, height: size }}>
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        style={{ transform: "rotate(135deg)" }}
      >
        {/* Track */}
        <circle
          cx={center} cy={center} r={radius}
          fill="none"
          stroke="hsl(var(--muted))"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={`${arcLength} ${circumference}`}
        />
        {/* Score arc */}
        <motion.circle
          cx={center} cy={center} r={radius}
          fill="none"
          stroke={arcColor}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={`${arcLength} ${circumference}`}
          initial={{ strokeDashoffset: arcLength }}
          animate={{ strokeDashoffset: scoreOffset }}
          transition={{ duration: animate ? 1.5 : 0, ease: "easeOut", delay: 0.3 }}
        />
      </svg>

      {/* Center content — positioned in original (unrotated) coordinate space */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          paddingTop: size * 0.08,
        }}
      >
        <AnimatedScore
          score={score}
          className="font-mono font-bold"
          style={{ fontSize: size * 0.26, color: arcColor, lineHeight: 1 }}
        />
        {bandLabel && (
          <span
            style={{
              fontSize: size * 0.09,
              color: arcColor,
              fontWeight: 500,
              marginTop: 4,
            }}
          >
            {bandLabel}
          </span>
        )}
      </div>
    </div>
  );
};
