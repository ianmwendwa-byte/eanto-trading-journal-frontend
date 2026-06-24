import { useMemo } from "react";
import { useParams, Navigate, Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeSlug from "rehype-slug";
import { motion } from "framer-motion";
import { Calendar, Clock, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { PageLayout } from "@/components/landing/PageLayout";
import { PillarBadge } from "@/components/blog/PillarBadge";
import { KraviqCTA } from "@/components/blog/KraviqCTA";
import { PostCard } from "@/components/blog/PostCard";
import { TableOfContents } from "@/components/blog/TableOfContents";
import { getPostBySlug, getRelatedPosts, getReadTime } from "@/lib/blog";
import { useIsMounted } from "@/hooks/useIsMounted";

// ---------------------------------------------------------------------------
// Extract H2 headings from markdown content for Table of Contents
// ---------------------------------------------------------------------------

function extractH2Headings(content) {
  const h2Regex = /^## (.+)$/gm;
  const headings = [];
  let match;
  while ((match = h2Regex.exec(content)) !== null) {
    const text = match[1].trim();
    // Replicate rehype-slug's ID generation: lowercase, spaces to hyphens
    const id = text
      .toLowerCase()
      .replace(/[^\w\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-");
    headings.push({ id, text });
  }
  return headings;
}

// ---------------------------------------------------------------------------
// Custom renderers for ReactMarkdown
// ---------------------------------------------------------------------------

const components = {
  // Headings — apply brand typography
  h1: ({ children }) => (
    <h1 className="font-heading font-bold text-3xl text-foreground mt-8 mb-4 leading-tight">
      {children}
    </h1>
  ),
  h2: ({ children, ...props }) => (
    <h2
      className="font-heading font-semibold text-2xl text-foreground mt-10 mb-4 leading-snug"
      {...props}
    >
      {children}
    </h2>
  ),
  h3: ({ children, ...props }) => (
    <h3
      className="font-heading font-semibold text-xl text-foreground mt-8 mb-3 leading-snug"
      {...props}
    >
      {children}
    </h3>
  ),
  // Body paragraphs — off-white on dark, generous line-height
  p: ({ children }) => (
    <p className="text-foreground/85 leading-[1.78] mb-5 text-[17px]">
      {children}
    </p>
  ),
  // Draft marker italics — styled distinctly to signal placeholder status
  em: ({ children }) => (
    <em className="not-italic text-muted-foreground/70 text-sm font-normal border-l-2 border-muted pl-3 block my-2">
      {children}
    </em>
  ),
  // Lists
  ul: ({ children }) => (
    <ul className="list-disc list-outside pl-5 mb-5 space-y-2 text-[17px] text-foreground/85 leading-[1.78]">
      {children}
    </ul>
  ),
  ol: ({ children }) => (
    <ol className="list-decimal list-outside pl-5 mb-5 space-y-2 text-[17px] text-foreground/85 leading-[1.78]">
      {children}
    </ol>
  ),
  li: ({ children }) => <li>{children}</li>,
  // Inline code — JetBrains Mono
  code: ({ children }) => (
    <code className="font-mono text-[14px] bg-muted/60 rounded px-1.5 py-0.5 text-foreground/90">
      {children}
    </code>
  ),
  // Tables (used in ICT vs SMC comparison table)
  table: ({ children }) => (
    <div className="overflow-x-auto mb-6">
      <table className="w-full text-sm border-collapse">
        {children}
      </table>
    </div>
  ),
  thead: ({ children }) => (
    <thead className="border-b border-border">{children}</thead>
  ),
  th: ({ children }) => (
    <th className="text-left py-2 pr-4 font-semibold text-foreground text-sm pb-3">
      {children}
    </th>
  ),
  td: ({ children }) => (
    <td className="py-2 pr-4 text-foreground/80 border-b border-border/50">
      {children}
    </td>
  ),
  // Blockquotes
  blockquote: ({ children }) => (
    <blockquote className="border-l-4 border-primary/40 pl-4 italic text-muted-foreground my-6">
      {children}
    </blockquote>
  ),
  // Horizontal rule
  hr: () => <hr className="border-border my-8" />,
  // Anchors
  a: ({ href, children }) => (
    <a
      href={href}
      className="text-primary hover:text-primary/80 underline underline-offset-2 transition-colors"
      {...(href?.startsWith("http") ? { target: "_blank", rel: "noopener noreferrer" } : {})}
    >
      {children}
    </a>
  ),
  // Strong
  strong: ({ children }) => (
    <strong className="font-semibold text-foreground">{children}</strong>
  ),
};

// ---------------------------------------------------------------------------
// Page component
// ---------------------------------------------------------------------------

export const BlogPostPage = () => {
  const isMounted = useIsMounted();
  const { slug } = useParams();
  const post = getPostBySlug(slug);

  if (!post) {
    return <Navigate to="/blog" replace />;
  }

  const { frontmatter, content } = post;
  const readTime = getReadTime(frontmatter.estimatedWordCount);
  const relatedPosts = useMemo(() => getRelatedPosts(post), [post]);
  const headings = useMemo(() => extractH2Headings(content), [content]);

  const publishedDate = frontmatter.publishedAt
    ? new Date(frontmatter.publishedAt).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : null;

  // ---------------------------------------------------------------------------
  // JSON-LD schemas
  // ---------------------------------------------------------------------------

  const faqSchema =
    frontmatter.faq && frontmatter.faq.length > 0
      ? JSON.stringify({
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: frontmatter.faq.map((item) => ({
            "@type": "Question",
            name: item.question,
            acceptedAnswer: {
              "@type": "Answer",
              text: item.answer,
            },
          })),
        })
      : null;

  const articleSchema = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "Article",
    headline: frontmatter.title,
    datePublished: frontmatter.publishedAt,
    dateModified: frontmatter.updatedAt || frontmatter.publishedAt,
    author: {
      "@type": "Organization",
      name: "Kraviq",
      url: "https://kraviq.app",
    },
    publisher: {
      "@type": "Organization",
      name: "Kraviq",
      logo: {
        "@type": "ImageObject",
        url: "https://kraviq.app/logo.png",
      },
    },
    url: `https://kraviq.app/blog/${slug}`,
    description: frontmatter.secondaryKeywords?.[0] ?? frontmatter.primaryKeyword,
  });

  return (
    <PageLayout title={frontmatter.title}>
      <Helmet>
        <title>{`${frontmatter.title} — Kraviq Blog`}</title>
        <meta
          name="description"
          content={
            frontmatter.secondaryKeywords?.slice(0, 2).join(", ") ??
            frontmatter.primaryKeyword
          }
        />
        <link rel="canonical" href={`https://kraviq.app/blog/${slug}`} />
        <meta property="og:title" content={`${frontmatter.title} — Kraviq Blog`} />
        <meta property="og:url" content={`https://kraviq.app/blog/${slug}`} />
        <meta property="og:type" content="article" />
        {frontmatter.publishedAt && (
          <meta property="article:published_time" content={frontmatter.publishedAt} />
        )}
        <meta name="robots" content="index, follow" />
        {/* Article schema */}
        <script type="application/ld+json">{articleSchema}</script>
        {/* FAQPage schema */}
        {faqSchema && (
          <script type="application/ld+json">{faqSchema}</script>
        )}
      </Helmet>

      {/* ── Post header ── */}
      <header className="relative pt-32 pb-10 border-b border-border overflow-hidden">
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse 50% 60% at 50% 0%, rgba(23,61,237,0.07), transparent)",
          }}
          aria-hidden="true"
        />
        <div className="relative max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Back link */}
          <Link
            to="/blog"
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            All articles
          </Link>

          <motion.div
            initial={isMounted ? { opacity: 0, y: 20 } : false}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          >
            <PillarBadge pillarId={frontmatter.pillar} />

            <h1 className="font-heading font-bold text-3xl sm:text-4xl md:text-5xl text-foreground mt-4 mb-5 leading-tight">
              {frontmatter.title}
            </h1>

            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
              {publishedDate && (
                <span className="flex items-center gap-1.5">
                  <Calendar className="h-4 w-4" aria-hidden="true" />
                  {publishedDate}
                </span>
              )}
              <span className="flex items-center gap-1.5">
                <Clock className="h-4 w-4" aria-hidden="true" />
                {readTime} min read
              </span>
            </div>
          </motion.div>
        </div>
      </header>

      {/* ── Article layout ── */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="relative flex gap-12 xl:gap-16">

          {/* ── Article body (reading column) ── */}
          <main
            className="min-w-0 flex-1 max-w-[720px]"
            aria-label="Article content"
          >
            {/* Mobile TOC — renders above body on small screens */}
            <TableOfContents headings={headings} />

            {/* Article prose */}
            <article>
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                rehypePlugins={[rehypeSlug]}
                components={components}
              >
                {content}
              </ReactMarkdown>
            </article>

            {/* ── Kraviq CTA ── */}
            {frontmatter.kraviqTieIn && (
              <KraviqCTA
                feature={frontmatter.kraviqTieIn.feature}
                ctaText={frontmatter.kraviqTieIn.ctaText}
                linksTo={frontmatter.kraviqTieIn.linksTo}
              />
            )}

            {/* ── Related Strategy Template ── */}
            {frontmatter.relatedStrategyTemplate && (
              <aside
                aria-label="Related strategy template"
                className="my-8 rounded-xl border border-border bg-card p-5 flex flex-col sm:flex-row sm:items-center gap-4 not-prose"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-1">
                    Strategy Template
                  </p>
                  <p className="text-sm text-foreground">
                    This post relates to the{" "}
                    <span className="font-semibold text-primary">
                      {frontmatter.relatedStrategyTemplate}
                    </span>{" "}
                    strategy template.
                  </p>
                </div>
                <Button variant="outline" size="sm" asChild className="shrink-0">
                  <Link to="/strategies/templates">View Template</Link>
                </Button>
              </aside>
            )}

            {/* ── FAQ Accordion ── */}
            {frontmatter.faq && frontmatter.faq.length > 0 && (
              <section
                aria-labelledby="faq-heading"
                className="my-12 not-prose"
              >
                <h2
                  id="faq-heading"
                  className="font-heading font-semibold text-xl text-foreground mb-6"
                >
                  Frequently Asked Questions
                </h2>
                <Accordion type="single" collapsible className="space-y-2">
                  {frontmatter.faq.map((item, i) => (
                    <AccordionItem
                      key={i}
                      value={`faq-${i}`}
                      className="border border-border rounded-xl px-4 overflow-hidden"
                    >
                      <AccordionTrigger className="text-left text-sm font-medium text-foreground py-4 hover:no-underline">
                        {item.question}
                      </AccordionTrigger>
                      <AccordionContent className="text-sm text-muted-foreground leading-relaxed pb-4">
                        {item.answer}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </section>
            )}

            {/* ── Related Articles ── */}
            {relatedPosts.length > 0 && (
              <section
                aria-labelledby="related-heading"
                className="my-12 not-prose"
              >
                <h2
                  id="related-heading"
                  className="font-heading font-semibold text-xl text-foreground mb-6"
                >
                  Related Articles
                </h2>
                <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {relatedPosts.slice(0, 3).map((relPost) => (
                    <PostCard key={relPost.slug} post={relPost} compact />
                  ))}
                </div>
              </section>
            )}
          </main>

          {/* ── Desktop TOC sidebar ── */}
          {headings.length >= 4 && (
            <aside className="hidden xl:block w-56 shrink-0">
              <TableOfContents
                headings={headings}
                className="sticky top-24"
              />
            </aside>
          )}
        </div>
      </div>
    </PageLayout>
  );
};
