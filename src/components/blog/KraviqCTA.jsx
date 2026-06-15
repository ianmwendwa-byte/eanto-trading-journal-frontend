import { Link } from "react-router-dom";
import { TrendingUp, Shield, BarChart2, Brain, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";

// Map common feature keywords to contextual icons
const FEATURE_ICON_MAP = [
  { keywords: ["discipline", "revenge", "psychology", "rule"], Icon: Brain },
  { keywords: ["drawdown", "compliance", "risk", "prop"], Icon: Shield },
  { keywords: ["score", "business", "kpi", "profit"], Icon: BarChart2 },
  { keywords: ["strategy", "ea", "sync", "template"], Icon: Zap },
];

function pickIcon(featureText = "") {
  const lower = featureText.toLowerCase();
  for (const { keywords, Icon } of FEATURE_ICON_MAP) {
    if (keywords.some((k) => lower.includes(k))) return Icon;
  }
  return TrendingUp; // default
}

/**
 * In-article Kraviq CTA block.
 *
 * Designed to read as a helpful "by the way, here's how to do this in Kraviq"
 * note — not a banner ad. Visually distinct from the article body via a left
 * border accent and a slightly raised card background.
 *
 * Props:
 *   feature  — frontmatter.kraviqTieIn.feature  (context string, not shown)
 *   ctaText  — frontmatter.kraviqTieIn.ctaText  (rendered body text)
 *   linksTo  — frontmatter.kraviqTieIn.linksTo  (internal route)
 */
export const KraviqCTA = ({ feature, ctaText, linksTo }) => {
  const Icon = pickIcon(feature);

  return (
    <aside
      aria-label="Try this in Kraviq"
      className="my-10 rounded-xl border border-primary/20 bg-primary/5 p-5 sm:p-6 flex flex-col gap-4 not-prose"
    >
      <div className="flex items-start gap-3">
        <div className="shrink-0 mt-0.5 w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
          <Icon className="h-4 w-4 text-primary" aria-hidden="true" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold text-primary uppercase tracking-widest mb-1.5">
            Try this in Kraviq
          </p>
          <p className="text-sm text-foreground/90 leading-relaxed">{ctaText}</p>
        </div>
      </div>
      <div className="pl-11">
        <Button size="sm" asChild>
          <Link to={linksTo}>Open in Kraviq</Link>
        </Button>
      </div>
    </aside>
  );
};
