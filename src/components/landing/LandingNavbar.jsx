import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Menu,
  X,
  Sun,
  Moon,
  ChevronDown,
  LineChart,
  Wallet,
  Gauge,
  ShieldCheck,
  Calculator,
  Swords,
  Bot,
  BookOpen,
  ArrowRight,
  DollarSign,
  HelpCircle,
  BookMarked,
} from "lucide-react";
import Logo from "@/components/shared/Logo";
import { Button } from "@/components/ui/button";
import { useIsMounted } from "@/hooks/useIsMounted";
import {
  Sheet,
  SheetContent,
  SheetClose,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useTheme } from "@/components/theme-provider";

const FEATURE_GROUPS = [
  {
    heading: "Journal & Analytics",
    items: [
      {
        label: "Trade Tracking",
        description: "Log, tag, and review every trade",
        href: "/features/trade-tracking",
        icon: LineChart,
      },
      {
        label: "Financial Ledger",
        description: "Full P&L history with net flows",
        href: "/features/financial-ledger",
        icon: Wallet,
      },
      {
        label: "Business Score",
        description: "Coaching score across 6 dimensions",
        href: "/business-score",
        icon: Gauge,
      },
      {
        label: "Strategy & Playbook",
        description: "Build, track, and refine setups",
        href: "/features/strategy",
        icon: BookOpen,
      },
    ],
  },
  {
    heading: "Risk & Automation",
    items: [
      {
        label: "Prop Firm Compliance",
        description: "Real-time drawdown & rule checks",
        href: "/features/prop-firm-compliance",
        icon: ShieldCheck,
      },
      {
        label: "Risk Calculators",
        description: "Position sizing & R:R tools",
        href: "/features/risk-calculators",
        icon: Calculator,
      },
      {
        label: "War Room",
        description: "Backtest strategies in isolation",
        href: "/features/backtesting",
        icon: Swords,
      },
      {
        label: "EA Sync",
        description: "Auto-import MT5 trades via EA",
        href: "/ea-sync",
        icon: Bot,
      },
    ],
  },
];

// Plain button — no dropdown, no portal, no scroll-lock side-effects
const ThemeToggle = () => {
  const { theme, setTheme } = useTheme();

  const toggle = () => {
    // Resolve "system" to the actual OS preference first, then flip
    const resolved =
      theme === "system"
        ? window.matchMedia("(prefers-color-scheme: dark)").matches
          ? "dark"
          : "light"
        : theme;
    setTheme(resolved === "dark" ? "light" : "dark");
  };

  return (
    <button
      onClick={toggle}
      aria-label="Toggle theme"
      className="h-8 w-8 flex items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors duration-150 flex-shrink-0"
    >
      {/* Icons swap via CSS — no conditional rendering, so width never changes */}
      <Sun className="h-4 w-4 dark:hidden" aria-hidden="true" />
      <Moon className="h-4 w-4 hidden dark:block" aria-hidden="true" />
    </button>
  );
};

export const LandingNavbar = () => {
  const isMounted = useIsMounted();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [featuresOpen, setFeaturesOpen] = useState(false);
  const { pathname } = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 80);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollTo = (id) => {
    setMobileOpen(false);
    const onLanding = pathname === "/" || pathname === "/landing";
    if (onLanding) {
      // Already on the landing page — scroll directly
      document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    } else {
      // On a different page — navigate to landing with the hash
      navigate(`/#${id}`);
    }
  };

  const navLinks = [
    { label: "Pricing", id: "pricing" },
    { label: "FAQ", id: "faq" },
  ];

  const pageLinks = [
    { label: "Blog", href: "/blog" },
  ];

  return (
    <motion.header
      initial={isMounted ? { opacity: 0, y: -10 } : false}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.1 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-background/80 backdrop-blur-md border-b border-border"
          : "bg-transparent border-b border-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center">
            <Logo variant="horizontal" size="lg" />
          </Link>

          {/* Center nav — desktop */}
          <nav
            className="hidden md:flex items-center gap-6"
            aria-label="Main navigation"
          >
            {/* modal={false} — this is a plain nav menu, not a blocking dialog.
                Radix's default modal scroll-lock toggles the page scrollbar,
                which changes viewport width and shifts this fixed header. */}
            <DropdownMenu modal={false}>
              <DropdownMenuTrigger asChild>
                <button
                  className="group flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors duration-150 cursor-pointer outline-none"
                  aria-label="Features menu"
                >
                  Features
                  <ChevronDown className="h-3.5 w-3.5 transition-transform duration-200 group-data-[state=open]:rotate-180" aria-hidden="true" />
                </button>
              </DropdownMenuTrigger>

              <DropdownMenuContent
                align="start"
                sideOffset={12}
                className="w-[300px] lg:w-[580px] p-0 overflow-hidden shadow-xl border border-border/60 rounded-xl"
              >
                {/* Main grid — 1 col on md, 2 col on lg+ */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-0 p-4">
                  {FEATURE_GROUPS.map((group, gi) => (
                    <div
                      key={group.heading}
                      className={
                        gi === 0
                          ? "pb-3 border-b border-border/60 lg:pb-0 lg:border-b-0 lg:pr-3 lg:border-r"
                          : "pt-3 lg:pt-0 lg:pl-3"
                      }
                    >
                      <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/70 px-2 pb-2.5 pt-0.5">
                        {group.heading}
                      </p>
                      <div className="flex flex-col gap-0.5">
                        {group.items.map((topic) => {
                          const Icon = topic.icon;
                          return (
                            <Link
                              key={topic.href}
                              to={topic.href}
                              className="group/item flex items-start gap-3 rounded-lg px-2 py-2.5 hover:bg-muted/70 transition-colors duration-150"
                            >
                              <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary group-hover/item:bg-primary/20 transition-colors duration-150">
                                <Icon className="h-4 w-4" aria-hidden="true" />
                              </span>
                              <div className="min-w-0">
                                <p className="text-sm font-medium text-foreground leading-tight">
                                  {topic.label}
                                </p>
                                <p className="text-xs text-muted-foreground leading-snug mt-0.5">
                                  {topic.description}
                                </p>
                              </div>
                            </Link>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Bottom CTA strip */}
                <div className="border-t border-border/60 bg-muted/30 px-4 py-3">
                  <Link
                    to="/features"
                    className="group/cta flex items-center justify-between rounded-lg px-2 py-1.5 hover:bg-muted/60 transition-colors duration-150"
                  >
                    <div>
                      <span className="text-sm font-medium text-foreground">
                        See everything Kraviq can do
                      </span>
                      <span className="ml-2 text-xs text-muted-foreground">
                        All features →
                      </span>
                    </div>
                    <ArrowRight className="h-3.5 w-3.5 text-muted-foreground group-hover/cta:text-primary group-hover/cta:translate-x-0.5 transition-all duration-150" aria-hidden="true" />
                  </Link>
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
            {navLinks.map(({ label, id }) => (
              <button
                key={id}
                onClick={() => scrollTo(id)}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors duration-150 cursor-pointer"
              >
                {label}
              </button>
            ))}
            {pageLinks.map(({ label, href }) => (
              <Link
                key={href}
                to={href}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors duration-150"
              >
                {label}
              </Link>
            ))}
          </nav>

          {/* Right CTAs — desktop */}
          <div className="hidden md:flex items-center gap-2">
            <ThemeToggle />
            <Button variant="ghost" size="sm" asChild>
              <Link to="/login">Sign In</Link>
            </Button>
            <Button size="sm" asChild>
              <Link to="/register">Get Started</Link>
            </Button>
          </div>

          {/* Mobile hamburger */}
          <Sheet
            open={mobileOpen}
            onOpenChange={(open) => {
              setMobileOpen(open);
              if (!open) setFeaturesOpen(false);
            }}
          >
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden"
                aria-label="Open menu"
              >
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>

            {/* Right slide-in drawer — showCloseButton=false: we render our own in the header */}
            <SheetContent
              side="right"
              showCloseButton={false}
              className="w-[min(85vw,320px)] p-0 flex flex-col border-l border-border bg-background"
            >
              {/* ── Header ── */}
              <div className="flex items-center justify-between h-14 px-4 border-b border-border shrink-0">
                <Logo variant="horizontal" size="lg" />
                <SheetClose asChild>
                  <button
                    className="h-8 w-8 flex items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                    aria-label="Close menu"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </SheetClose>
              </div>

              {/* ── Scrollable nav body ── */}
              <nav className="flex-1 overflow-y-auto py-2 px-3" aria-label="Mobile navigation">

                {/* ── Features accordion ── */}
                <div className="mb-1">
                  <button
                    onClick={() => setFeaturesOpen((v) => !v)}
                    className="w-full flex items-center justify-between px-3 py-3 rounded-xl text-sm font-medium text-foreground hover:bg-muted transition-colors duration-150"
                    aria-expanded={featuresOpen}
                  >
                    <span>Features</span>
                    <ChevronDown
                      className={`h-4 w-4 text-muted-foreground transition-transform duration-200 ${featuresOpen ? "rotate-180" : ""}`}
                      aria-hidden="true"
                    />
                  </button>

                  {/* Accordion panel */}
                  <motion.div
                    initial={false}
                    animate={{ height: featuresOpen ? "auto" : 0, opacity: featuresOpen ? 1 : 0 }}
                    transition={{ duration: 0.22, ease: "easeInOut" }}
                    style={{ overflow: "hidden" }}
                  >
                    <div className="mt-1 mb-2 mx-1 rounded-xl border border-border/60 bg-muted/30 overflow-hidden">
                      {FEATURE_GROUPS.map((group, gi) => (
                        <div key={group.heading}>
                          {gi > 0 && <div className="border-t border-border/60" />}
                          <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60 px-3 pt-3 pb-1.5">
                            {group.heading}
                          </p>
                          <div className="px-1.5 pb-1.5 space-y-0.5">
                            {group.items.map((topic) => {
                              const Icon = topic.icon;
                              return (
                                <Link
                                  key={topic.href}
                                  to={topic.href}
                                  onClick={() => setMobileOpen(false)}
                                  className="group/item flex items-center gap-2.5 px-2 py-2.5 rounded-lg hover:bg-background transition-colors duration-150"
                                >
                                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary group-hover/item:bg-primary/20 transition-colors duration-150">
                                    <Icon className="h-3.5 w-3.5" aria-hidden="true" />
                                  </span>
                                  <div className="min-w-0 flex-1">
                                    <p className="text-xs font-medium text-foreground leading-tight">
                                      {topic.label}
                                    </p>
                                    <p className="text-[11px] text-muted-foreground leading-snug mt-0.5 truncate">
                                      {topic.description}
                                    </p>
                                  </div>
                                </Link>
                              );
                            })}
                          </div>
                        </div>
                      ))}

                      {/* See all strip */}
                      <div className="border-t border-border/60">
                        <Link
                          to="/features"
                          onClick={() => setMobileOpen(false)}
                          className="group/all flex items-center justify-between px-3 py-2.5 hover:bg-background transition-colors duration-150"
                        >
                          <span className="text-xs font-medium text-foreground">See all features</span>
                          <ArrowRight className="h-3 w-3 text-muted-foreground group-hover/all:text-primary group-hover/all:translate-x-0.5 transition-all duration-150" aria-hidden="true" />
                        </Link>
                      </div>
                    </div>
                  </motion.div>
                </div>

                {/* ── Page links ── */}
                <div className="space-y-0.5">
                  {navLinks.map(({ label, id }) => (
                    <button
                      key={id}
                      onClick={() => scrollTo(id)}
                      className="w-full flex items-center px-3 py-3 rounded-xl text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors duration-150 text-left"
                    >
                      {label}
                    </button>
                  ))}
                  {pageLinks.map(({ label, href }) => (
                    <Link
                      key={href}
                      to={href}
                      onClick={() => setMobileOpen(false)}
                      className="flex items-center px-3 py-3 rounded-xl text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors duration-150"
                    >
                      {label}
                    </Link>
                  ))}
                </div>
              </nav>

              {/* ── Footer: appearance + CTAs ── */}
              <div className="shrink-0 border-t border-border bg-muted/20 px-4 pt-3 pb-5 space-y-3">
                <div className="flex items-center justify-between px-1">
                  <span className="text-sm text-muted-foreground">Appearance</span>
                  <ThemeToggle />
                </div>
                <div className="flex flex-col gap-2">
                  <Button className="w-full h-11 text-sm font-semibold" asChild>
                    <Link to="/register" onClick={() => setMobileOpen(false)}>
                      Get Started — It&apos;s Free
                    </Link>
                  </Button>
                  <Button variant="outline" className="w-full h-10 text-sm" asChild>
                    <Link to="/login" onClick={() => setMobileOpen(false)}>
                      Sign In
                    </Link>
                  </Button>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </motion.header>
  );
};
