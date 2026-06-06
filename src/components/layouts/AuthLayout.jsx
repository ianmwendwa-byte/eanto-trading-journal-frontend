import { motion } from "framer-motion";
import {
  TrendingUp, Wallet, Zap, Star, BarChart3,
  CheckCircle2, ArrowUpRight,
} from "lucide-react";
import { fadeVariants } from "@/lib/animations";

// Decorative equity curve sparkline — purely visual
const SparkLine = () => (
  <svg viewBox="0 0 280 72" fill="none" className="w-full">
    <defs>
      <linearGradient id="spark-grad" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#22c55e" stopOpacity="0.18" />
        <stop offset="100%" stopColor="#22c55e" stopOpacity="0" />
      </linearGradient>
    </defs>
    <path
      d="M0 60 L28 54 L56 58 L84 42 L112 46 L140 30 L168 24 L196 34 L224 18 L252 12 L280 8"
      stroke="#22c55e"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M0 60 L28 54 L56 58 L84 42 L112 46 L140 30 L168 24 L196 34 L224 18 L252 12 L280 8 L280 72 L0 72Z"
      fill="url(#spark-grad)"
    />
  </svg>
);

const Feature = ({ icon: Icon, text }) => (
  <div className="flex items-center gap-3">
    <div className="w-7 h-7 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0">
      <Icon className="h-3.5 w-3.5 text-primary" />
    </div>
    <span className="text-sm text-foreground/80">{text}</span>
  </div>
);

const BrandPanel = () => (
  <div className="hidden lg:flex flex-1 bg-card/30 border-l border-border relative overflow-hidden items-center justify-center p-12">
    {/* Background elements */}
    <div className="absolute inset-0 trading-grid opacity-20 pointer-events-none" />
    <div className="absolute -top-32 -right-32 w-96 h-96 bg-primary/8 rounded-full blur-3xl pointer-events-none" />
    <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-primary/5 rounded-full blur-3xl pointer-events-none" />

    <div className="relative z-10 w-full max-w-md space-y-8">
      {/* Headline */}
      <div>
        <div className="inline-flex items-center gap-1.5 text-xs font-medium text-primary bg-primary/10 border border-primary/20 rounded-full px-3 py-1 mb-4">
          <CheckCircle2 className="h-3 w-3" />
          Trusted by serious traders
        </div>
        <h2 className="text-2xl font-bold font-heading leading-tight text-foreground">
          The operating system for your trading business
        </h2>
        <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
          Multi-account management, EA auto-sync, prop firm tracking,
          and AI coaching — all in one platform.
        </p>
      </div>

      {/* Mock account card */}
      <div className="bg-background/60 border border-border rounded-xl p-4 backdrop-blur-sm shadow-xl">
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-xs text-muted-foreground">Total Portfolio Balance</p>
            <p className="text-2xl font-bold font-mono text-foreground mt-0.5">$48,250.00</p>
          </div>
          <div className="flex items-center gap-1 text-xs font-mono text-[var(--profit)] bg-[var(--profit)]/10 px-2 py-1 rounded-md">
            <ArrowUpRight className="h-3 w-3" />
            +12.4%
          </div>
        </div>

        {/* Sparkline */}
        <div className="mb-3">
          <SparkLine />
        </div>

        {/* Mini stats row */}
        <div className="grid grid-cols-3 gap-2 pt-3 border-t border-border/50">
          {[
            { label: "Win Rate", value: "67.4%", color: "text-[var(--profit)]" },
            { label: "Accounts", value: "5 active", color: "text-foreground" },
            { label: "Net P&L", value: "+$5.8K", color: "text-[var(--profit)]" },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <p className={`text-sm font-mono font-semibold ${stat.color}`}>{stat.value}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Features */}
      <div className="space-y-3">
        <Feature icon={Wallet}   text="Multi-account management across all brokers" />
        <Feature icon={Zap}      text="EA auto-sync — trades logged automatically" />
        <Feature icon={BarChart3} text="Business performance score & analytics" />
        <Feature icon={Star}     text="AI trading coach with weekly debrief" />
      </div>
    </div>
  </div>
);

export const AuthLayout = ({ children }) => (
  <div className="h-screen flex overflow-hidden bg-background">
    {/* Left: Form panel */}
    <motion.div
      variants={fadeVariants}
      initial="initial"
      animate="animate"
      className="flex-1 lg:flex-none lg:w-120 xl:w-130 flex flex-col overflow-y-auto overflow-x-hidden p-6 sm:p-10 relative"
    >
      {/* Radial glow behind form */}
      <div className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 640px 640px at 50% 40%, rgba(23,61,237,0.07) 0%, transparent 70%)",
        }}
      />
      <div className="relative w-full max-w-sm mx-auto my-auto">
        {children}
      </div>
    </motion.div>

    {/* Right: Brand panel */}
    <BrandPanel />
  </div>
);
