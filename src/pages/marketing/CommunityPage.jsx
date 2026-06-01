import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  Users, MessageCircle, TrendingUp, Zap,
  BookOpen, Shield, ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageLayout } from "@/components/landing/PageLayout";

const reveal = (delay = 0) => ({
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.5, ease: "easeOut", delay },
});

const BENEFITS = [
  {
    icon: TrendingUp,
    title: "Live trade reviews",
    body: "Post your setups and get real feedback from traders who also use Tradecore. See exactly how others are reading price and managing risk.",
  },
  {
    icon: MessageCircle,
    title: "Direct platform access",
    body: "Suggest features, report bugs, and influence the roadmap. The traders in this community built Tradecore — they should shape what comes next.",
  },
  {
    icon: BookOpen,
    title: "Prop firm knowledge base",
    body: "Shared wisdom on FTMO, FundingPips, The Funded Trader, and every major prop firm. Rules, payout tips, and challenge strategies from funded traders.",
  },
  {
    icon: Zap,
    title: "Early feature access",
    body: "Community members get early access to beta features before public launch — AI coaching, advanced analytics, new account types, and more.",
  },
  {
    icon: Shield,
    title: "Accountability groups",
    body: "Join small accountability pods with 4–6 traders who share weekly Business Score updates, challenge results, and performance reviews.",
  },
  {
    icon: Users,
    title: "Mentorship network",
    body: "Connect with experienced traders who have been through the same challenges. The community was built around mentorship — that culture runs deep.",
  },
];

const CHANNELS = [
  { name: "#general",           desc: "Daily chat — anything trading" },
  { name: "#trade-journal",     desc: "Share setups and post-trade analysis" },
  { name: "#prop-firms",        desc: "Challenge updates, tips, funded wins" },
  { name: "#business-score",    desc: "Weekly score drops and pillar breakdowns" },
  { name: "#platform-feedback", desc: "Feature requests and bug reports" },
  { name: "#wins",              desc: "Celebrate funded accounts and milestones" },
];

const STATS = [
  { value: "1,000+", label: "Active traders" },
  { value: "Daily",  label: "Trade reviews" },
  { value: "Free",   label: "Always free to join" },
];

export const CommunityPage = () => (
  <PageLayout title="Community">

    {/* ── Hero ──────────────────────────────────────────────────────────── */}
    <section className="relative pt-32 pb-20 overflow-hidden">
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 70% 55% at 50% 0%, rgba(23,61,237,0.12), transparent)",
        }}
        aria-hidden="true"
      />
      <div className="relative max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="inline-flex items-center gap-1.5 bg-primary/10 text-primary border border-primary/20 text-xs font-medium rounded-full px-3 py-1 mb-6"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" aria-hidden="true" />
          Open community · Free to join
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut", delay: 0.05 }}
          className="font-heading font-bold text-5xl md:text-6xl text-foreground leading-tight mb-6"
        >
          Trade alongside
          <br />
          1,000+ serious traders.
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: "easeOut", delay: 0.1 }}
          className="text-lg text-muted-foreground max-w-xl mx-auto mb-10"
        >
          The Tradecore community is where traders who take their craft seriously
          come to share, improve, and hold each other accountable.
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: "easeOut", delay: 0.15 }}
          className="flex flex-col sm:flex-row gap-3 justify-center"
        >
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Button size="lg" asChild className="gap-2">
              <a href="https://discord.gg/tradecore" target="_blank" rel="noopener noreferrer">
                Join on Discord
                <ArrowRight className="h-4 w-4" />
              </a>
            </Button>
          </motion.div>
          <Button variant="outline" size="lg" asChild>
            <Link to="/register">Create your Tradecore account</Link>
          </Button>
        </motion.div>
      </div>
    </section>

    {/* ── Stats bar ─────────────────────────────────────────────────────── */}
    <section className="border-y border-border">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="grid grid-cols-3 divide-x divide-border"
        >
          {STATS.map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, ease: "easeOut", delay: i * 0.07 }}
              className="py-8 text-center"
            >
              <div className="font-heading font-bold text-2xl text-primary mb-1">
                {s.value}
              </div>
              <div className="text-xs text-muted-foreground uppercase tracking-wide">
                {s.label}
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>

    {/* ── What you get ──────────────────────────────────────────────────── */}
    <section className="py-24">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <motion.p {...reveal(0)} className="text-xs uppercase tracking-widest text-primary font-medium mb-4">
            What you get
          </motion.p>
          <motion.h2 {...reveal(0.05)} className="font-heading font-bold text-3xl md:text-4xl text-foreground">
            More than a Discord server.
          </motion.h2>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {BENEFITS.map((b, i) => {
            const Icon = b.icon;
            return (
              <motion.div
                key={b.title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.45, ease: "easeOut", delay: i * 0.07 }}
                className="bg-card border border-border rounded-2xl p-6"
              >
                <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-4">
                  <Icon className="h-5 w-5 text-primary" aria-hidden="true" />
                </div>
                <h3 className="font-heading font-semibold text-base text-foreground mb-2">
                  {b.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{b.body}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>

    {/* ── Channels ──────────────────────────────────────────────────────── */}
    <section className="py-20 border-t border-border">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -32 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.55, ease: "easeOut" }}
          >
            <p className="text-xs uppercase tracking-widest text-primary font-medium mb-4">
              What's inside
            </p>
            <h2 className="font-heading font-bold text-3xl md:text-4xl text-foreground mb-5">
              Channels built around
              your trading workflow.
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-6">
              Every channel has a purpose. No noise, no spam — just traders
              focused on improving their process and their numbers.
            </p>
            <Button asChild className="gap-2">
              <a href="https://discord.gg/tradecore" target="_blank" rel="noopener noreferrer">
                Open Discord
                <ArrowRight className="h-4 w-4" />
              </a>
            </Button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 32 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.55, ease: "easeOut", delay: 0.1 }}
            className="bg-card border border-border rounded-2xl divide-y divide-border overflow-hidden"
            aria-label="Community channels"
          >
            {CHANNELS.map((ch) => (
              <div key={ch.name} className="flex items-center gap-4 px-5 py-4">
                <span className="font-mono text-sm text-primary font-medium min-w-[160px]">
                  {ch.name}
                </span>
                <span className="text-sm text-muted-foreground">{ch.desc}</span>
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>

    {/* ── CTA ───────────────────────────────────────────────────────────── */}
    <section className="py-24 border-t border-border relative overflow-hidden">
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 60% 60% at 50% 100%, rgba(23,61,237,0.1), transparent)",
        }}
        aria-hidden="true"
      />
      <div className="relative max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.h2 {...reveal(0)} className="font-heading font-bold text-3xl md:text-4xl text-foreground mb-4">
          Ready to join?
        </motion.h2>
        <motion.p {...reveal(0.05)} className="text-muted-foreground mb-8">
          The community is free. Tradecore is free to start. There's no reason
          to trade alone.
        </motion.p>
        <motion.div
          {...reveal(0.1)}
          className="flex flex-col sm:flex-row gap-3 justify-center"
        >
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Button size="lg" asChild className="gap-2">
              <a href="https://discord.gg/tradecore" target="_blank" rel="noopener noreferrer">
                Join the community
                <ArrowRight className="h-4 w-4" />
              </a>
            </Button>
          </motion.div>
          <Button variant="outline" size="lg" asChild>
            <Link to="/register">Create free account</Link>
          </Button>
        </motion.div>
      </div>
    </section>

  </PageLayout>
);
