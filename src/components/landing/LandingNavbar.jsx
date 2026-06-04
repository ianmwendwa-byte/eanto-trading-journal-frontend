import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Menu, Sun, Moon } from "lucide-react";
import Logo from "@/components/shared/Logo";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useTheme } from "@/components/theme-provider";

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
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
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
    { label: "Features", id: "features" },
    { label: "Pricing", id: "pricing" },
    { label: "FAQ", id: "faq" },
  ];

  return (
    <motion.header
      initial={{ opacity: 0, y: -10 }}
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
            <Logo variant="horizontal" size="md" />
          </Link>

          {/* Center nav — desktop */}
          <nav
            className="hidden md:flex items-center gap-6"
            aria-label="Main navigation"
          >
            {navLinks.map(({ label, id }) => (
              <button
                key={id}
                onClick={() => scrollTo(id)}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors duration-150 cursor-pointer"
              >
                {label}
              </button>
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
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
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
            <SheetContent
              side="right"
              className="w-80 bg-background border-border p-6 flex flex-col"
            >
              {/* Logo — padded away from the close button */}
              <div className="mb-8 pt-1">
                <Logo variant="horizontal" size="md" />
              </div>

              {/* Nav links */}
              <nav
                className="flex flex-col gap-1 flex-1"
                aria-label="Mobile navigation"
              >
                {navLinks.map(({ label, id }) => (
                  <button
                    key={id}
                    onClick={() => scrollTo(id)}
                    className="text-base text-muted-foreground hover:text-foreground hover:bg-muted transition-colors text-left px-3 py-2.5 rounded-md"
                  >
                    {label}
                  </button>
                ))}
              </nav>

              {/* CTAs */}
              <div className="flex flex-col gap-2 pt-4 border-t border-border">
                <div className="flex items-center justify-between px-3 py-1 mb-1">
                  <span className="text-sm text-muted-foreground">Theme</span>
                  <ThemeToggle />
                </div>
                <Button variant="outline" className="w-full" asChild>
                  <Link to="/login" onClick={() => setMobileOpen(false)}>
                    Sign In
                  </Link>
                </Button>
                <Button className="w-full" asChild>
                  <Link to="/register" onClick={() => setMobileOpen(false)}>
                    Get Started
                  </Link>
                </Button>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </motion.header>
  );
};
