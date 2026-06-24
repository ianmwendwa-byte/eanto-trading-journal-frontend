import { useParams, Navigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { motion } from "framer-motion";
import { PageLayout } from "@/components/landing/PageLayout";
import { PostCard } from "@/components/blog/PostCard";
import { getPostsByPillar } from "@/lib/blog";
import { PILLAR_MAP, BACKLOG_BY_PILLAR } from "@/constants/blogPillars";

export const BlogCategoryPage = () => {
  const { pillar: pillarId } = useParams();
  const pillar = PILLAR_MAP[pillarId];

  // Unknown pillar — redirect to index
  if (!pillar) {
    return <Navigate to="/blog" replace />;
  }

  const posts = getPostsByPillar(pillarId);
  const backlog = BACKLOG_BY_PILLAR[pillarId] ?? [];
  const hasPublished = posts.length > 0;

  return (
    <PageLayout title={pillar.name}>
      <Helmet>
        <title>{`${pillar.name} — Kraviq Blog`}</title>
        <meta name="description" content={pillar.description} />
        <link
          rel="canonical"
          href={`https://kraviq.app/blog/category/${pillarId}`}
        />
        <meta property="og:title" content={`${pillar.name} — Kraviq Blog`} />
        <meta
          property="og:url"
          content={`https://kraviq.app/blog/category/${pillarId}`}
        />
        <meta name="robots" content="index, follow" />
      </Helmet>

      {/* Header */}
      <section className="relative pt-32 pb-16 overflow-hidden border-b border-border">
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: `radial-gradient(ellipse 55% 50% at 50% 0%, ${pillar.cssVar}18, transparent)`,
          }}
          aria-hidden="true"
        />
        <div className="relative max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.span
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="inline-block text-xs uppercase tracking-widest font-medium mb-4"
            style={{ color: pillar.cssVar }}
          >
            Category
          </motion.span>
          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut", delay: 0.05 }}
            className="font-heading font-bold text-4xl md:text-5xl text-foreground mb-4"
          >
            {pillar.name}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: "easeOut", delay: 0.1 }}
            className="text-lg text-muted-foreground max-w-xl mx-auto"
          >
            {pillar.description}
          </motion.p>
        </div>
      </section>

      {/* Content */}
      <section className="pb-24 pt-14">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">

          {hasPublished ? (
            <>
              {/* Published post grid */}
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {posts.map((post, i) => (
                  <PostCard key={post.slug} post={post} animDelay={i * 0.06} />
                ))}
              </div>

              {/* Coming soon items (backlog) */}
              {backlog.length > 0 && (
                <div className="mt-14">
                  <p className="text-xs uppercase tracking-widest text-muted-foreground font-medium mb-4">
                    Coming soon
                  </p>
                  <ul className="space-y-2">
                    {backlog.map((title) => (
                      <li
                        key={title}
                        className="text-sm text-muted-foreground pl-3 border-l-2 border-border"
                      >
                        {title}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </>
          ) : (
            /* All posts are backlog — nothing published yet */
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="py-12"
            >
              <p className="text-muted-foreground mb-8 text-base">
                Articles in this category are coming soon.
              </p>
              {backlog.length > 0 && (
                <div>
                  <p className="text-xs uppercase tracking-widest text-muted-foreground font-medium mb-4">
                    Topics in progress
                  </p>
                  <ul className="space-y-2">
                    {backlog.map((title) => (
                      <li
                        key={title}
                        className="text-sm text-muted-foreground pl-3 border-l-2 border-border"
                      >
                        {title}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </motion.div>
          )}

        </div>
      </section>
    </PageLayout>
  );
};
