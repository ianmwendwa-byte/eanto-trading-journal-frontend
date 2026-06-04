import { Link } from "react-router-dom";
import { Share2, Play, MessageCircle } from "lucide-react";
import Logo from "@/components/shared/Logo";

const LINKS = {
  Product: [
    { label: "Features",       href: "/#features" },
    { label: "Pricing",        href: "/#pricing" },
    { label: "Business Score", href: "/business-score" },
    { label: "War Account",    href: "/war-account" },
    { label: "EA Sync",        href: "/ea-sync" },
  ],
  Company: [
    { label: "About",     href: "/about" },
    { label: "Blog",      href: "/blog" },
    { label: "Community", href: "/community" },
    { label: "Contact",   href: "/contact" },
  ],
  Legal: [
    { label: "Privacy Policy",  href: "/privacy" },
    { label: "Terms of Service", href: "/terms" },
    { label: "Cookie Policy",   href: "/cookies" },
  ],
};

const SOCIALS = [
  { icon: Share2, label: "Twitter / X", href: "https://twitter.com" },
  { icon: Play, label: "YouTube", href: "https://youtube.com" },
  { icon: MessageCircle, label: "Discord", href: "https://discord.com" },
];

export const LandingFooter = () => {
  const year = new Date().getFullYear();

  return (
    <footer
      className="border-t border-border pt-16 pb-10"
      role="contentinfo"
      aria-label="Site footer"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-[2fr_1fr_1fr_1fr] gap-10 mb-12">
          {/* Brand */}
          <div>
            <Link
              to="/"
              className="flex items-center mb-4"
              aria-label="Kraviq home"
            >
              <Logo variant="horizontal" size="sm" />
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-xs mb-6">
              The operating system for retail forex traders. Track, score,
              and scale your trading business.
            </p>
            <div className="flex gap-3">
              {SOCIALS.map(({ icon: Icon, label, href }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="w-8 h-8 rounded-lg border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-primary/40 transition-colors"
                >
                  <Icon className="h-3.5 w-3.5" aria-hidden="true" />
                </a>
              ))}
            </div>
          </div>

          {/* Link groups */}
          {Object.entries(LINKS).map(([group, links]) => (
            <nav key={group} aria-label={`${group} links`}>
              <h3 className="text-xs font-semibold text-foreground uppercase tracking-wider mb-4">
                {group}
              </h3>
              <ul className="space-y-2.5">
                {links.map(({ label, href }) => (
                  <li key={label}>
                    <Link
                      to={href}
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="border-t border-border pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-muted-foreground">
            © {year} Kraviq. All rights reserved.
          </p>
          <p className="text-xs text-muted-foreground">
            Built for traders, by a trader.
          </p>
        </div>
      </div>
    </footer>
  );
};
