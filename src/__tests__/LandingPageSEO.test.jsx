/**
 * Homepage SEO tests.
 *
 * Covers the "Trading Business OS" rebrand of the homepage title/meta and the
 * new SoftwareApplication JSON-LD block. The Helmet tags themselves only
 * commit to document.head client-side, so most assertions read the source
 * file directly — this guarantees the strings exist in the prerendered HTML
 * output produced by prerender.js, not just in a client-only render pass.
 */

import { describe, test, expect, vi } from "vitest";
import { render } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import fs from "fs";
import path from "path";

// ── Mock framer-motion ─────────────────────────────────────────────────────

vi.mock("framer-motion", () => ({
  motion: {
    div:     ({ children, ...p }) => <div {...p}>{children}</div>,
    h1:      ({ children, ...p }) => <h1 {...p}>{children}</h1>,
    h2:      ({ children, ...p }) => <h2 {...p}>{children}</h2>,
    p:       ({ children, ...p }) => <p {...p}>{children}</p>,
    section: ({ children, ...p }) => <section {...p}>{children}</section>,
    span:    ({ children, ...p }) => <span {...p}>{children}</span>,
    header:  ({ children, ...p }) => <header {...p}>{children}</header>,
    button:  ({ children, ...p }) => <button {...p}>{children}</button>,
    circle:  (p) => <circle {...p} />,
  },
  AnimatePresence: ({ children }) => children,
  useMotionValue: () => ({ set: vi.fn(), get: () => 0 }),
  useSpring: (v) => v,
  useTransform: () => ({ get: () => 0 }),
  useInView: () => false,
  useReducedMotion: () => false,
}));

// ── Mock landing components not under test ────────────────────────────────

vi.mock("@/components/landing/LandingNavbar", () => ({
  LandingNavbar: () => <nav data-testid="landing-nav" />,
}));
vi.mock("@/components/landing/LandingFooter", () => ({
  LandingFooter: () => <footer data-testid="landing-footer" />,
}));
vi.mock("@/components/landing/ProblemStrip", () => ({
  ProblemStrip: () => <div data-testid="problem-strip" />,
}));
vi.mock("@/components/landing/PillarsSection", () => ({
  PillarsSection: () => <div data-testid="pillars-section" />,
}));
vi.mock("@/components/landing/AccountManagementSection", () => ({
  AccountManagementSection: () => <div data-testid="account-mgmt-section" />,
}));
vi.mock("@/components/landing/TradeCaptureSection", () => ({
  TradeCaptureSection: () => <div data-testid="trade-capture-section" />,
}));
vi.mock("@/components/landing/FinancialClaritySection", () => ({
  FinancialClaritySection: () => <div data-testid="financial-clarity-section" />,
}));
vi.mock("@/components/landing/WarAccountSection", () => ({
  WarAccountSection: () => <div data-testid="war-account-section" />,
}));
vi.mock("@/components/landing/BusinessScoreSection", () => ({
  BusinessScoreSection: () => <div data-testid="business-score-section" />,
}));
vi.mock("@/components/landing/PricingSection", () => ({
  PricingSection: () => <div data-testid="pricing-section" />,
}));
vi.mock("@/components/landing/FAQSection", () => ({
  FAQSection: () => <div data-testid="faq-section" />,
}));
vi.mock("@/components/landing/FinalCTASection", () => ({
  FinalCTASection: () => <div data-testid="final-cta-section" />,
}));

// ── Static imports after mocks ─────────────────────────────────────────────

import { LandingPage } from "@/pages/landing/LandingPage";

// ── Render helper ───────────────────────────────────────────────────────────

const renderLanding = () =>
  render(
    <HelmetProvider>
      <MemoryRouter initialEntries={["/"]}>
        <Routes>
          <Route path="/" element={<LandingPage />} />
        </Routes>
      </MemoryRouter>
    </HelmetProvider>
  );

const landingSource = fs.readFileSync(
  path.resolve(process.cwd(), "src/pages/landing/LandingPage.jsx"),
  "utf-8"
);
const heroSource = fs.readFileSync(
  path.resolve(process.cwd(), "src/components/landing/HeroSection.jsx"),
  "utf-8"
);
// index.html is the actual document Vite/the SSG pipeline serves for "/" —
// the React <Helmet> block in LandingPage.jsx is gated behind a `mounted`
// flag (see comment in that file) specifically so it never renders during
// SSR/prerender, which means index.html's static <head> tags are what
// search engines, social previews, and the Google OAuth verification
// crawler actually see. Both must stay in sync.
const indexHtmlSource = fs.readFileSync(
  path.resolve(process.cwd(), "index.html"),
  "utf-8"
);

describe("LandingPage — title tag", () => {
  test("React Helmet title contains 'Trading Business OS'", () => {
    expect(landingSource).toContain("Trading Business OS for Retail Traders");
  });

  test("index.html (the document actually prerendered/crawled) title contains 'Trading Business OS'", () => {
    expect(indexHtmlSource).toContain(
      "Kraviq — Trading Business OS for Retail Traders"
    );
  });
});

describe("LandingPage — meta description", () => {
  test("React Helmet meta description contains 'operating system'", () => {
    expect(landingSource).toContain(
      "Kraviq is a trading business operating system for retail traders."
    );
  });

  test("index.html meta description contains 'operating system'", () => {
    expect(indexHtmlSource).toContain(
      "Kraviq is a trading business operating system for retail traders."
    );
  });
});

describe("LandingPage — Open Graph and Twitter tags", () => {
  test("React Helmet includes og:description, twitter:title, and twitter:description", () => {
    expect(landingSource).toContain('property="og:description"');
    expect(landingSource).toContain('name="twitter:title"');
    expect(landingSource).toContain('name="twitter:description"');
  });

  test("index.html includes og:description, twitter:title, and twitter:description", () => {
    expect(indexHtmlSource).toContain('property="og:description"');
    expect(indexHtmlSource).toContain('name="twitter:title"');
    expect(indexHtmlSource).toContain('name="twitter:description"');
  });
});

describe("LandingPage — SoftwareApplication JSON-LD (sitewide, lives in index.html)", () => {
  test("index.html SoftwareApplication JSON-LD description matches the rebrand copy", () => {
    expect(indexHtmlSource).toContain('"@type": "SoftwareApplication"');
    expect(indexHtmlSource).toContain(
      "A trading business operating system for retail traders."
    );
  });

  test("LandingPage.jsx does not duplicate the sitewide SoftwareApplication schema", () => {
    // It already ships once, sitewide, via index.html — a second copy
    // rendered into the homepage body would be conflicting duplicate schema.
    expect(landingSource).not.toContain('"@type": "SoftwareApplication"');
  });
});

describe("LandingPage — FAQPage JSON-LD (page-scoped, not sitewide)", () => {
  // FAQPage structured data must only appear on pages where the matching
  // Q&A content is actually visible (Google's structured data guidelines).
  // It used to live in index.html's static <head>, which put the homepage's
  // FAQs onto every prerendered page (blog posts, /about, /features/*) even
  // though only the homepage renders <FAQSection>. It's now built here from
  // the same FAQS data FAQSection renders, via buildFaqSchema, so it never
  // drifts from the visible content and never leaks onto other pages.

  test("index.html no longer contains a sitewide FAQPage schema", () => {
    expect(indexHtmlSource).not.toContain('"@type": "FAQPage"');
  });

  test("LandingPage.jsx builds the FAQ schema from the shared FAQS data via buildFaqSchema", () => {
    expect(landingSource).toContain('import { buildFaqSchema } from "@/lib/featurePageSchemas"');
    expect(landingSource).toContain('import { FAQS } from "@/lib/landingFaqs"');
    expect(landingSource).toContain("buildFaqSchema(");
  });

  test("the component renders the FAQ schema as JSON-LD inside Helmet", () => {
    expect(landingSource).toMatch(
      /<script type="application\/ld\+json">\{faqSchema\}<\/script>/
    );
  });

  test("the shared FAQS data includes the Business Score question with its full answer", () => {
    const faqsSource = fs.readFileSync(
      path.resolve(process.cwd(), "src/lib/landingFaqs.js"),
      "utf-8"
    );
    expect(faqsSource).toContain("What is the Business Score?");
    expect(faqsSource).toContain("five pillars");
  });
});

describe("LandingPage — hero plain-language sentence", () => {
  test("hero source contains the updated plain-language sentence, matching the canonical definition used in meta/schema elsewhere", () => {
    expect(heroSource).toContain(
      "Kraviq is a trading business operating system for retail traders."
    );
  });
});

describe("LandingPage — banned word check", () => {
  test("homepage source does not contain the word 'journal'", () => {
    expect(landingSource.toLowerCase()).not.toContain("journal");
    expect(heroSource.toLowerCase()).not.toContain("journal");
    expect(indexHtmlSource.toLowerCase()).not.toContain("journal");
  });

  test("rendered homepage text does not contain 'trading journal'", () => {
    renderLanding();
    const text = document.body.textContent.toLowerCase();
    expect(text).not.toContain("trading journal");
  });
});
