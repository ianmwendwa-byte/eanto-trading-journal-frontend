import { PILLAR_MAP } from "@/constants/blogPillars";

/**
 * Small colored badge showing the pillar name for a blog post.
 * Variant "chip" is larger (for filter buttons), "badge" is compact (for cards/posts).
 */
export const PillarBadge = ({ pillarId, variant = "badge" }) => {
  const pillar = PILLAR_MAP[pillarId];
  if (!pillar) return null;

  if (variant === "chip") {
    return (
      <span
        className={`inline-flex items-center text-xs font-medium border rounded-full px-3 py-1 ${pillar.chipClass}`}
      >
        {pillar.name}
      </span>
    );
  }

  return (
    <span
      className={`inline-flex items-center text-[11px] font-medium rounded-full px-2.5 py-0.5 ${pillar.badgeClass}`}
    >
      {pillar.name}
    </span>
  );
};
