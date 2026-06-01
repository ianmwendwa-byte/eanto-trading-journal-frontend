import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Calendar, Clock, ArrowRight, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PageLayout } from "@/components/landing/PageLayout";

const POSTS = [
  {
    slug:     "win-rate-is-a-lie",
    title:    "Why Your Win Rate Is a Lie (And What Actually Matters)",
    excerpt:
      "A 90% win rate with a 1:0.1 R:R will blow your account. A 40% win rate with a 1:3 R:R will make you rich. Here's why most traders chase the wrong number.",
    tag:      "Psychology",
    date:     "May 28, 2026",
    readTime: "6 min read",
    featured: true,
  },
  {
    slug:     "prop-firm-drawdown-survival",
    title:    "How to Survive a Prop Firm Drawdown Without Panic",
    excerpt:
      "Your daily drawdown is at 70%. Your hands are shaking. This is the exact framework to use when the pressure is highest and the rules are strictest.",
    tag:      "Prop Firms",
    date:     "May 24, 2026",
    readTime: "8 min read",
    featured: false,
  },
  {
    slug:     "true-net-pnl",
    title:    "The Real Cost of Trading: Understanding True Net P&L",
    excerpt:
      "Add up your commissions, spreads, swap rates, and prop fees over 100 trades. The number will shock you. Here's how to track what you actually made.",
    tag:      "Finance",
    date:     "May 20, 2026",
    readTime: "5 min read",
    featured: false,
  },
  {
    slug:     "war-account-strategy",
    title:    "War Account: How to Test Strategies Without Risking Real Capital",
    excerpt:
      "The worst thing you can do is take a scalping EA live before you understand its drawdown profile. The War Account system gives you a controlled sandbox.",
    tag:      "Strategy",
    date:     "May 15, 2026",
    readTime: "7 min read",
    featured: false,
  },
  {
    slug:     "business-score-explained",
    title:    "What Is the Trading Business Score? (A Full Breakdown)",
    excerpt:
      "A single number between 0 and 100 that measures your trading health across five pillars. Here's exactly how it's calculated and what each pillar means.",
    tag:      "Tradecore",
    date:     "May 10, 2026",
    readTime: "9 min read",
    featured: false,
  },
  {
    slug:     "mt4-vs-mt5",
    title:    "MT4 vs MT5 in 2026: Which One Should You Use?",
    excerpt:
      "Both platforms work with Tradecore's EA sync. But they're not the same. Here's a no-nonsense breakdown of what matters for retail forex traders today.",
    tag:      "Tools",
    date:     "May 5, 2026",
    readTime: "5 min read",
    featured: false,
  },
];

const TAG_COLORS = {
  Psychology: "bg-warning/10 text-warning border-warning/20",
  "Prop Firms": "bg-primary/10 text-primary border-primary/20",
  Finance:   "bg-success/10 text-success border-success/20",
  Strategy:  "bg-danger/10 text-danger border-danger/20",
  Tradecore: "bg-primary/10 text-primary border-primary/20",
  Tools:     "bg-muted text-muted-foreground border-border",
};

const TagBadge = ({ tag }) => (
  <span
    className={`inline-flex text-[10px] font-medium border rounded-full px-2.5 py-0.5 ${
      TAG_COLORS[tag] ?? "bg-muted text-muted-foreground border-border"
    }`}
  >
    {tag}
  </span>
);

const PostMeta = ({ date, readTime }) => (
  <div className="flex items-center gap-3 text-xs text-muted-foreground">
    <span className="flex items-center gap-1">
      <Calendar className="h-3 w-3" aria-hidden="true" />
      {date}
    </span>
    <span className="flex items-center gap-1">
      <Clock className="h-3 w-3" aria-hidden="true" />
      {readTime}
    </span>
  </div>
);

const ComingSoonOverlay = () => (
  <div className="absolute inset-0 rounded-2xl flex items-end p-4 pointer-events-none">
    <span className="text-[10px] font-medium bg-muted/90 text-muted-foreground rounded-full px-2.5 py-1 border border-border backdrop-blur-sm">
      Full article coming soon
    </span>
  </div>
);

export const BlogPage = () => {
  const [featured, ...rest] = POSTS;

  return (
    <PageLayout title="Blog">

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
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="text-xs uppercase tracking-widest text-primary font-medium mb-4"
          >
            The Tradecore Blog
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut", delay: 0.05 }}
            className="font-heading font-bold text-5xl md:text-6xl text-foreground mb-4"
          >
            Trading insight.
            <br />
            No fluff.
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 12 }}
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
      <section className="pb-24 border-t border-border pt-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">

          {/* Featured post */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="mb-12"
          >
            <p className="text-xs uppercase tracking-widest text-primary font-medium mb-5 flex items-center gap-2">
              <Tag className="h-3 w-3" aria-hidden="true" />
              Featured
            </p>
            <article className="relative bg-card border border-primary/20 rounded-2xl p-8 md:p-10 group hover:border-primary/40 transition-colors">
              <div className="flex flex-wrap items-center gap-3 mb-5">
                <TagBadge tag={featured.tag} />
                <PostMeta date={featured.date} readTime={featured.readTime} />
              </div>
              <h2 className="font-heading font-bold text-2xl md:text-3xl text-foreground mb-4 leading-snug">
                {featured.title}
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-6 max-w-2xl">
                {featured.excerpt}
              </p>
              <Button variant="outline" size="sm" className="gap-2 pointer-events-none opacity-60">
                Read article
                <ArrowRight className="h-3.5 w-3.5" />
              </Button>
              <ComingSoonOverlay />
            </article>
          </motion.div>

          {/* Post grid */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {rest.map((post, i) => (
              <motion.article
                key={post.slug}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.45, ease: "easeOut", delay: i * 0.07 }}
                className="relative bg-card border border-border rounded-2xl p-6 flex flex-col hover:border-primary/30 transition-colors"
              >
                <div className="flex items-center gap-2 mb-4">
                  <TagBadge tag={post.tag} />
                </div>
                <h3 className="font-heading font-semibold text-base text-foreground mb-3 leading-snug flex-1">
                  {post.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed mb-5 line-clamp-3">
                  {post.excerpt}
                </p>
                <PostMeta date={post.date} readTime={post.readTime} />
                <ComingSoonOverlay />
              </motion.article>
            ))}
          </div>

          {/* More coming soon */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.45, ease: "easeOut" }}
            className="mt-14 text-center border border-dashed border-border rounded-2xl p-10"
          >
            <p className="text-xs uppercase tracking-widest text-primary font-medium mb-3">
              More coming soon
            </p>
            <h3 className="font-heading font-semibold text-xl text-foreground mb-2">
              New articles every week
            </h3>
            <p className="text-sm text-muted-foreground mb-6 max-w-xs mx-auto">
              Get notified when new articles drop — join the community or follow
              us on social.
            </p>
            <Button variant="outline" asChild>
              <Link to="/community">Join the community</Link>
            </Button>
          </motion.div>

        </div>
      </section>

    </PageLayout>
  );
};
