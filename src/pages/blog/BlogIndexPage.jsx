import { useSearchParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { motion } from "framer-motion";
import { PageLayout } from "@/components/landing/PageLayout";
import { PostCard } from "@/components/blog/PostCard";
import { getAllPosts } from "@/lib/blog";
import { PILLARS } from "@/constants/blogPillars";
import { cn } from "@/lib/utils";
import { useIsMounted } from "@/hooks/useIsMounted";

const allPosts = getAllPosts();

// All cornerstone posts — generically derived, scales to any count
const cornerstonePosts = allPosts.filter((p) => p.frontmatter.isCornerstone);

// Pillar filter chip
const PillarChip = ({ pillar, active, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    aria-pressed={active}
    className={cn(
      "inline-flex items-center text-sm font-medium border rounded-full px-4 py-1.5 transition-colors cursor-pointer",
      active
        ? `${pillar.chipClass} border-current`
        : "text-muted-foreground border-border hover:border-primary/30 hover:text-foreground"
    )}
  >
    {pillar.name}
  </button>
);

export const BlogIndexPage = () => {
  const isMounted = useIsMounted();
  const [searchParams, setSearchParams] = useSearchParams();
  const activePillar = searchParams.get("pillar") ?? "all";

  const setFilter = (id) => {
    if (id === "all") {
      setSearchParams({});
    } else {
      setSearchParams({ pillar: id });
    }
  };

  // Regular grid: exclude all cornerstones to avoid duplication (they live in
  // the Start Here row which is always visible regardless of filter state).
  // Filter the remaining posts by the active pillar if one is selected.
  const filteredGridPosts = (
    activePillar === "all"
      ? allPosts
      : allPosts.filter((p) => p.frontmatter.pillar === activePillar)
  ).filter((p) => !p.frontmatter.isCornerstone);

  return (
    <PageLayout title="Blog">
      <Helmet>
        <title>Kraviq Blog — Trading Insight, No Fluff</title>
        <meta
          name="description"
          content="Actionable articles on ICT &amp; SMC strategies, prop firm rules, trading psychology, and running trading like a business."
        />
        <link rel="canonical" href="https://kraviq.app/blog" />
        <meta property="og:title" content="Kraviq Blog — Trading Insight, No Fluff" />
        <meta property="og:url" content="https://kraviq.app/blog" />
        <meta name="robots" content="index, follow" />
      </Helmet>

      {/* Header */}
      <section className="relative pt-32 pb-16 overflow-hidden">
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse 60% 50% at 50% 0%, rgba(23,61,237,0.09), transparent)",
          }}
          aria-hidden="true"
        />
        <div className="relative max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.p
            initial={isMounted ? { opacity: 0, y: 12 } : false}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="text-xs uppercase tracking-widest text-primary font-medium mb-4"
          >
            The Kraviq Blog
          </motion.p>
          <motion.h1
            initial={isMounted ? { opacity: 0, y: 16 } : false}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut", delay: 0.05 }}
            className="font-heading font-bold text-5xl md:text-6xl text-foreground mb-4"
          >
            Trading insight.
            <br />
            No fluff.
          </motion.h1>
          <motion.p
            initial={isMounted ? { opacity: 0, y: 12 } : false}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: "easeOut", delay: 0.1 }}
            className="text-lg text-muted-foreground"
          >
            Actionable articles on performance, psychology, prop firms, and
            running your trading like a business.
          </motion.p>
        </div>
      </section>

      {/* Content */}
      <section className="pb-24 border-t border-border pt-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">

          {/* Pillar filter chips — data-driven from PILLARS constant */}
          <motion.div
            initial={isMounted ? { opacity: 0, y: 12 } : false}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: "easeOut", delay: 0.15 }}
            className="flex flex-wrap gap-2 mb-10"
            role="group"
            aria-label="Filter by pillar"
          >
            <button
              type="button"
              onClick={() => setFilter("all")}
              aria-pressed={activePillar === "all"}
              className={cn(
                "inline-flex items-center text-sm font-medium border rounded-full px-4 py-1.5 transition-colors cursor-pointer",
                activePillar === "all"
                  ? "bg-primary/10 text-primary border-primary/30"
                  : "text-muted-foreground border-border hover:border-primary/30 hover:text-foreground"
              )}
            >
              All
            </button>
            {PILLARS.map((pillar) => (
              <PillarChip
                key={pillar.id}
                pillar={pillar}
                active={activePillar === pillar.id}
                onClick={() => setFilter(pillar.id)}
              />
            ))}
          </motion.div>

          {/* Start Here row — always visible, filter-independent.
              Renders all cornerstone posts in a responsive grid.
              Scales generically: 1 post = full width, 2 = 2-col, 3+ = 3-col (desktop). */}
          {cornerstonePosts.length > 0 && (
            <motion.div
              initial={isMounted ? { opacity: 0, y: 16 } : false}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, ease: "easeOut", delay: 0.2 }}
              className="mb-12"
            >
              <p className="text-xs uppercase tracking-widest text-primary font-medium mb-5">
                Start Here
              </p>
              <div
                className={cn(
                  "grid gap-5",
                  cornerstonePosts.length === 1
                    ? "grid-cols-1"
                    : cornerstonePosts.length === 2
                    ? "sm:grid-cols-2"
                    : "sm:grid-cols-2 lg:grid-cols-3"
                )}
              >
                {cornerstonePosts.map((post, i) => (
                  <PostCard
                    key={post.slug}
                    post={post}
                    featured
                    animDelay={i * 0.07}
                  />
                ))}
              </div>
            </motion.div>
          )}

          {/* Divider between Start Here row and the regular grid */}
          {cornerstonePosts.length > 0 && (
            <div className="border-t border-border mb-10" />
          )}

          {/* Regular post grid — excludes cornerstones, respects active pillar filter */}
          {filteredGridPosts.length > 0 ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredGridPosts.map((post, i) => (
                <PostCard
                  key={post.slug}
                  post={post}
                  animDelay={i * 0.06}
                />
              ))}
            </div>
          ) : (
            <motion.div
              initial={isMounted ? { opacity: 0, y: 16 } : false}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="py-16 text-center"
            >
              <p className="text-muted-foreground">
                More articles in this category coming soon.
              </p>
            </motion.div>
          )}

        </div>
      </section>
    </PageLayout>
  );
};
