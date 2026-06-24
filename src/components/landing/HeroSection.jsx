import { useState, useEffect, useRef } from "react";
import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
  AnimatePresence,
} from "framer-motion";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, ChevronDown } from "lucide-react";
import { useIsMounted } from "@/hooks/useIsMounted";

// ── Mini screen mockups ───────────────────────────────────────────────────────

const DashboardScreen = () => (
  <motion.div
    key="dashboard"
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    transition={{ duration: 0.35 }}
    className="p-3 h-full overflow-hidden"
  >
    <div className="flex items-center gap-1.5 mb-2.5">
      <div className="w-1.5 h-1.5 rounded-full bg-success" />
      <span className="text-[7px] text-muted-foreground font-mono">
        Dashboard · Personal Overview
      </span>
    </div>

    <div className="grid grid-cols-4 gap-1.5 mb-2">
      {[
        { label: "Net P&L", value: "+$4,218", cls: "text-success" },
        { label: "Win Rate", value: "68.4%", cls: "text-foreground" },
        { label: "Trades", value: "127", cls: "text-foreground" },
        { label: "Score", value: "74", cls: "text-primary" },
      ].map((s) => (
        <div
          key={s.label}
          className="bg-card rounded-md p-1.5 border border-border"
        >
          <div className="text-[6px] text-muted-foreground mb-0.5">
            {s.label}
          </div>
          <div className={`text-[8px] font-mono font-bold ${s.cls}`}>
            {s.value}
          </div>
        </div>
      ))}
    </div>

    <div className="bg-card rounded-md border border-border p-2 mb-2">
      <div className="text-[6px] text-muted-foreground mb-1">Balance History</div>
      <svg viewBox="0 0 200 36" className="w-full h-7">
        <defs>
          <linearGradient id="heroAreaGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="rgba(23,61,237,0.25)" />
            <stop offset="100%" stopColor="rgba(23,61,237,0)" />
          </linearGradient>
        </defs>
        <path
          d="M0,32 L25,28 L50,24 L75,20 L100,16 L130,12 L160,8 L185,5 L200,3"
          fill="none"
          stroke="#173ded"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        <path
          d="M0,32 L25,28 L50,24 L75,20 L100,16 L130,12 L160,8 L185,5 L200,3 L200,36 L0,36 Z"
          fill="url(#heroAreaGrad)"
        />
      </svg>
    </div>

    <div className="bg-card rounded-md border border-border p-1.5">
      <div className="text-[6px] text-muted-foreground mb-1">Recent Trades</div>
      {[
        { pair: "EURUSD", dir: "BUY", pnl: "+$124", win: true },
        { pair: "GBPJPY", dir: "SELL", pnl: "-$48", win: false },
        { pair: "USDJPY", dir: "BUY", pnl: "+$210", win: true },
      ].map((t, i) => (
        <div
          key={i}
          className="flex items-center justify-between py-0.5 border-b border-border/40 last:border-0"
        >
          <span className="text-[7px] font-mono text-foreground">{t.pair}</span>
          <span
            className={`text-[6px] font-mono px-1 rounded ${
              t.dir === "BUY"
                ? "bg-success/10 text-success"
                : "bg-danger/10 text-danger"
            }`}
          >
            {t.dir}
          </span>
          <span
            className={`text-[7px] font-mono ${
              t.win ? "text-success" : "text-danger"
            }`}
          >
            {t.pnl}
          </span>
        </div>
      ))}
    </div>
  </motion.div>
);

const AccountsScreen = () => (
  <motion.div
    key="accounts"
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    transition={{ duration: 0.35 }}
    className="p-3 h-full overflow-hidden"
  >
    <div className="text-[7px] text-muted-foreground mb-2.5 font-mono">
      My Accounts (3)
    </div>
    {[
      {
        name: "Main Account",
        type: "Normal",
        balance: "$12,450",
        pnl: "+$4,218",
        pct: 72,
        prop: false,
        war: false,
      },
      {
        name: "FTMO Challenge",
        type: "Prop",
        balance: "$50,000",
        pnl: "+$2,100",
        pct: 84,
        prop: true,
        war: false,
      },
      {
        name: "EA Test Lab",
        type: "War",
        balance: "$2,000",
        pnl: "-$340",
        pct: 45,
        prop: false,
        war: true,
      },
    ].map((acc, i) => (
      <div
        key={i}
        className="bg-card rounded-md border border-border p-2 mb-1.5 last:mb-0"
      >
        <div className="flex items-center justify-between mb-1">
          <span className="text-[8px] font-semibold text-foreground">
            {acc.name}
          </span>
          <span
            className={`text-[6px] px-1.5 py-0.5 rounded font-medium ${
              acc.war
                ? "bg-danger/10 text-danger"
                : acc.prop
                ? "bg-primary/10 text-primary"
                : "bg-success/10 text-success"
            }`}
          >
            {acc.type}
          </span>
        </div>
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[9px] font-mono text-foreground">
            {acc.balance}
          </span>
          <span
            className={`text-[7px] font-mono ${
              acc.pnl.startsWith("+") ? "text-success" : "text-danger"
            }`}
          >
            {acc.pnl}
          </span>
        </div>
        <div className="h-1 bg-muted rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full ${
              acc.war ? "bg-danger" : "bg-primary"
            }`}
            style={{ width: `${acc.pct}%` }}
          />
        </div>
      </div>
    ))}
  </motion.div>
);

const TradesScreen = () => (
  <motion.div
    key="trades"
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    transition={{ duration: 0.35 }}
    className="p-3 h-full overflow-hidden"
  >
    <div className="text-[7px] text-muted-foreground mb-2 font-mono">
      Trade History · 127 trades
    </div>
    <div className="grid grid-cols-5 gap-1 mb-1 pb-1 border-b border-border/40">
      {["Pair", "Dir", "P&L", "R:R", "Grade"].map((h) => (
        <span key={h} className="text-[6px] text-muted-foreground">
          {h}
        </span>
      ))}
    </div>
    {[
      { pair: "EURUSD", dir: "BUY", pnl: "+$124", rr: "1:2.4", grade: "A", win: true },
      { pair: "GBPJPY", dir: "SELL", pnl: "-$48", rr: "1:0.8", grade: "B", win: false },
      { pair: "USDJPY", dir: "BUY", pnl: "+$210", rr: "1:3.2", grade: "A+", win: true },
      { pair: "XAUUSD", dir: "SELL", pnl: "+$88", rr: "1:1.8", grade: "B+", win: true },
      { pair: "GBPUSD", dir: "BUY", pnl: "-$65", rr: "1:0.7", grade: "C", win: false },
      { pair: "EURUSD", dir: "SELL", pnl: "+$156", rr: "1:2.8", grade: "A", win: true },
    ].map((t, i) => (
      <div
        key={i}
        className="grid grid-cols-5 gap-1 py-1 border-b border-border/30 last:border-0 items-center"
      >
        <span className="text-[7px] font-mono text-foreground">{t.pair}</span>
        <span
          className={`text-[6px] font-mono ${
            t.dir === "BUY" ? "text-success" : "text-danger"
          }`}
        >
          {t.dir}
        </span>
        <span
          className={`text-[7px] font-mono ${
            t.win ? "text-success" : "text-danger"
          }`}
        >
          {t.pnl}
        </span>
        <span className="text-[7px] font-mono text-muted-foreground">
          {t.rr}
        </span>
        <span className="text-[7px] font-mono text-foreground">{t.grade}</span>
      </div>
    ))}
  </motion.div>
);

const SCREENS = [DashboardScreen, AccountsScreen, TradesScreen];
const LABELS = ["Dashboard", "Accounts", "Trades"];

// ── Hero Section ─────────────────────────────────────────────────────────────

export const HeroSection = () => {
  const isMounted = useIsMounted();
  const [currentScreen, setCurrentScreen] = useState(0);
  const containerRef = useRef(null);

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const rotateX = useSpring(
    useTransform(mouseY, [-300, 300], [6, -6]),
    { stiffness: 120, damping: 20 }
  );
  const rotateY = useSpring(
    useTransform(mouseX, [-300, 300], [-6, 6]),
    { stiffness: 120, damping: 20 }
  );

  useEffect(() => {
    const id = setInterval(
      () => setCurrentScreen((p) => (p + 1) % 3),
      3200
    );
    return () => clearInterval(id);
  }, []);

  const handleMouseMove = (e) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    mouseX.set(e.clientX - (rect.left + rect.width / 2));
    mouseY.set(e.clientY - (rect.top + rect.height / 2));
  };

  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
  };

  const CurrentScreen = SCREENS[currentScreen];

  const stagger = {
    initial: {},
    animate: { transition: { staggerChildren: 0.1, delayChildren: 0.2 } },
  };
  const item = {
    initial: isMounted ? { opacity: 0, y: 24 } : false,
    animate: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
  };

  return (
    <section
      className="relative min-h-screen flex items-center overflow-hidden pt-16"
      aria-label="Hero"
    >
      {/* Radial glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 90% 60% at 50% -10%, rgba(23,61,237,0.18), transparent)",
        }}
        aria-hidden="true"
      />
      {/* Grid overlay */}
      <div
        className="absolute inset-0 trading-grid pointer-events-none opacity-40"
        aria-hidden="true"
      />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full py-20">
        <div className="grid lg:grid-cols-2 gap-16 items-center min-h-[calc(100vh-5rem)]">

          {/* ── Left content ─────────────────────────────────────────────── */}
          <motion.div
            variants={stagger}
            initial="initial"
            animate="animate"
            className="flex flex-col justify-center"
          >
            {/* Eyebrow */}
            <motion.div variants={item}>
              <span className="inline-flex items-center gap-1.5 bg-primary/10 text-primary border border-primary/20 text-xs font-medium rounded-full px-3 py-1 mb-6">
                <span
                  className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"
                  aria-hidden="true"
                />
                Now available — be among the first
              </span>
            </motion.div>

            {/* H1 */}
            <motion.h1
              variants={item}
              className="font-heading font-bold text-5xl md:text-6xl lg:text-7xl leading-[1.05] tracking-tight text-foreground mb-6"
            >
              You Trade Well.
              <br />
              <span className="text-primary">Run It Like</span>
              <br />
              a Business.
            </motion.h1>

            {/* Subheadline */}
            <motion.p
              variants={item}
              className="text-lg text-muted-foreground max-w-md leading-relaxed mb-3"
            >
              Kraviq is a trading business operating system for retail traders.
              Track every trade, score your business, and grow with data not
              guesswork.
            </motion.p>


            {/* CTAs */}
            <motion.div
              variants={item}
              className="flex flex-col sm:flex-row gap-3 mb-6"
            >
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button size="lg" asChild className="gap-2 w-full sm:w-auto">
                  <Link to="/register">
                    Build Your Trading Business
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              </motion.div>
              <Button
                variant="ghost"
                size="lg"
                className="gap-2 text-muted-foreground w-full sm:w-auto"
                onClick={() =>
                  document
                    .getElementById("features")
                    ?.scrollIntoView({ behavior: "smooth" })
                }
              >
                See how it works
                <ChevronDown className="h-4 w-4" />
              </Button>
            </motion.div>

            {/* Trust indicators */}
            <motion.div
              variants={item}
              className="flex flex-wrap gap-4"
              aria-label="Key benefits"
            >
              {["Free to start", "No credit card", "MT4 & MT5 supported"].map(
                (t) => (
                  <span
                    key={t}
                    className="flex items-center gap-1.5 text-xs text-muted-foreground"
                  >
                    <span className="text-success" aria-hidden="true">✓</span>
                    {t}
                  </span>
                )
              )}
            </motion.div>
          </motion.div>

          {/* ── Right mockup ─────────────────────────────────────────────── */}
          <motion.div
            initial={isMounted ? { opacity: 0, x: 40 } : false}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, ease: "easeOut", delay: 0.3 }}
            className="relative hidden lg:flex items-center justify-center"
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            ref={containerRef}
            aria-hidden="true"
          >
            {/* Soft glow */}
            <div
              className="absolute inset-0 rounded-3xl pointer-events-none"
              style={{
                background:
                  "radial-gradient(ellipse 80% 70% at 50% 50%, rgba(23,61,237,0.1), transparent)",
              }}
            />

            {/* 3D tilt container */}
            <motion.div
              style={{ rotateX, rotateY, transformPerspective: 1200 }}
              className="relative w-full max-w-[520px]"
            >
              {/* Screen bezel */}
              <div className="bg-[#0d1117] rounded-t-2xl border border-white/10 p-2 shadow-2xl">
                {/* Traffic lights + screen tabs */}
                <div className="flex items-center gap-1.5 px-2 pb-1.5">
                  <div className="w-2 h-2 rounded-full bg-[#ef4444]/70" />
                  <div className="w-2 h-2 rounded-full bg-[#f59e0b]/70" />
                  <div className="w-2 h-2 rounded-full bg-[#22c55e]/70" />
                  <div className="flex-1" />
                  <div className="flex gap-1">
                    {LABELS.map((l, i) => (
                      <button
                        key={l}
                        onClick={() => setCurrentScreen(i)}
                        className={`text-[7px] px-2 py-0.5 rounded transition-colors ${
                          currentScreen === i
                            ? "bg-primary/20 text-primary"
                            : "text-muted-foreground/40 hover:text-muted-foreground"
                        }`}
                      >
                        {l}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Screen */}
                <div
                  className="bg-background rounded-xl overflow-hidden"
                  style={{ aspectRatio: "16/10" }}
                >
                  <AnimatePresence mode="wait">
                    <CurrentScreen key={currentScreen} />
                  </AnimatePresence>
                </div>
              </div>

              {/* Laptop base */}
              <div className="h-3 bg-[#1c2333] rounded-b-lg border-x border-b border-white/10" />
              <div className="h-2 bg-[#0d1117] rounded-b-2xl border-x border-b border-white/10 mx-8 shadow-xl" />
            </motion.div>

            {/* Floating card 1 — Return */}
            <motion.div
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -left-10 top-14 bg-card border border-border rounded-xl p-3 shadow-lg min-w-[130px]"
            >
              <div className="text-[10px] text-muted-foreground mb-0.5">
                Total Return
              </div>
              <div className="text-base font-mono font-bold text-success">
                ↑ 419%
              </div>
            </motion.div>

            {/* Floating card 2 — Business Score */}
            <motion.div
              animate={{ y: [0, -6, 0] }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 0.6,
              }}
              className="absolute -right-10 bottom-20 bg-card border border-primary/30 rounded-xl p-3 shadow-lg min-w-[150px]"
            >
              <div className="text-[10px] text-muted-foreground mb-0.5">
                Business Score
              </div>
              <div className="flex items-center gap-2">
                <span className="text-base font-mono font-bold text-foreground">
                  74
                </span>
                <span className="text-[10px] text-success font-medium">
                  Solid ✓
                </span>
              </div>
            </motion.div>

            {/* Floating card 3 — EA Sync */}
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{
                duration: 3.5,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 1.2,
              }}
              className="absolute right-2 top-6 bg-card border border-border rounded-xl p-2.5 shadow-lg min-w-[145px]"
            >
              <div className="flex items-center gap-2 mb-0.5">
                <div className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
                <span className="text-[10px] text-foreground font-medium">
                  EA Sync: Online
                </span>
              </div>
              <div className="text-[9px] text-muted-foreground">
                3 trades synced today
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
