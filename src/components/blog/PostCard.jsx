import { Link } from "react-router-dom";
import { Calendar, Clock, Star } from "lucide-react";
import { motion } from "framer-motion";
import { PillarBadge } from "@/components/blog/PillarBadge";
import { getReadTime, getExcerpt } from "@/lib/blog";
import { useIsMounted } from "@/hooks/useIsMounted";

/**
 * Reusable blog post card.
 *
 * Props:
 *   post       — { frontmatter, content, slug }
 *   featured   — if true, renders larger "cornerstone" card
 *   compact    — if true, renders a compact variant for related posts
 *   animDelay  — optional framer-motion stagger delay
 */
export const PostCard = ({ post, featured = false, compact = false, animDelay = 0 }) => {
  const isMounted = useIsMounted();
  const { frontmatter, slug } = post;
  const readTime = getReadTime(frontmatter.estimatedWordCount);
  const excerpt = getExcerpt(post);

  const publishedDate = frontmatter.publishedAt
    ? new Date(frontmatter.publishedAt).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    : null;

  if (compact) {
    return (
      <Link
        to={`/blog/${slug}`}
        className="group flex flex-col gap-2 bg-card border border-border rounded-xl p-4 hover:border-primary/30 transition-colors"
      >
        <PillarBadge pillarId={frontmatter.pillar} />
        <p className="text-sm font-medium text-foreground leading-snug group-hover:text-primary transition-colors line-clamp-2">
          {frontmatter.title}
        </p>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Clock className="h-3 w-3 shrink-0" aria-hidden="true" />
          <span>{readTime} min read</span>
        </div>
      </Link>
    );
  }

  if (featured) {
    return (
      <motion.article
        initial={isMounted ? { opacity: 0, y: 24 } : false}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, ease: "easeOut", delay: animDelay }}
        className="relative"
      >
        <Link
          to={`/blog/${slug}`}
          className="group block bg-card border border-primary/20 rounded-2xl p-8 md:p-10 hover:border-primary/40 transition-colors"
          aria-label={`Read: ${frontmatter.title}`}
        >
          {frontmatter.isCornerstone && (
            <p className="flex items-center gap-1.5 text-xs uppercase tracking-widest text-primary font-medium mb-4">
              <Star className="h-3 w-3" aria-hidden="true" />
              Cornerstone
            </p>
          )}
          <div className="flex flex-wrap items-center gap-3 mb-4">
            <PillarBadge pillarId={frontmatter.pillar} />
            <PostMeta date={publishedDate} readTime={readTime} />
          </div>
          <h2 className="font-heading font-bold text-2xl md:text-3xl text-foreground mb-3 leading-snug group-hover:text-primary transition-colors">
            {frontmatter.title}
          </h2>
          {excerpt && (
            <p className="text-muted-foreground leading-relaxed text-base max-w-2xl">
              {excerpt}
            </p>
          )}
        </Link>
      </motion.article>
    );
  }

  return (
    <motion.article
      initial={isMounted ? { opacity: 0, y: 24 } : false}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.45, ease: "easeOut", delay: animDelay }}
    >
      <Link
        to={`/blog/${slug}`}
        className="group flex flex-col h-full bg-card border border-border rounded-2xl p-6 hover:border-primary/30 transition-colors"
        aria-label={`Read: ${frontmatter.title}`}
      >
        <div className="flex items-center gap-2 mb-4">
          <PillarBadge pillarId={frontmatter.pillar} />
        </div>
        <h3 className="font-heading font-semibold text-base text-foreground mb-3 leading-snug flex-1 group-hover:text-primary transition-colors">
          {frontmatter.title}
        </h3>
        {excerpt && (
          <p className="text-sm text-muted-foreground leading-relaxed mb-4 line-clamp-3">
            {excerpt}
          </p>
        )}
        <PostMeta date={publishedDate} readTime={readTime} />
      </Link>
    </motion.article>
  );
};

const PostMeta = ({ date, readTime }) => (
  <div className="flex items-center gap-3 text-xs text-muted-foreground">
    {date && (
      <span className="flex items-center gap-1">
        <Calendar className="h-3 w-3" aria-hidden="true" />
        {date}
      </span>
    )}
    <span className="flex items-center gap-1">
      <Clock className="h-3 w-3" aria-hidden="true" />
      {readTime} min read
    </span>
  </div>
);
