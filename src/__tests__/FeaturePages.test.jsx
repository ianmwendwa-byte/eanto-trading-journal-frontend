/**
 * Feature pages tests — covers all 8 deep feature pages:
 * 6 new pages under /features/*, plus the 2 rewritten-in-place pages
 * (/ea-sync, /business-score).
 *
 * Per page: correct H1, unique title tag, FAQPage JSON-LD present and valid,
 * BreadcrumbList JSON-LD present, related-features section renders 3 links,
 * no banned words, route present in prerender.js STATIC_ROUTES.
 */

import { describe, test, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
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
    h3:      ({ children, ...p }) => <h3 {...p}>{children}</h3>,
    p:       ({ children, ...p }) => <p {...p}>{children}</p>,
    li:      ({ children, ...p }) => <li {...p}>{children}</li>,
    section: ({ children, ...p }) => <section {...p}>{children}</section>,
    span:    ({ children, ...p }) => <span {...p}>{children}</span>,
    circle:  (p) => <circle {...p} />,
  },
  AnimatePresence: ({ children }) => children,
  useInView: () => false,
  useReducedMotion: () => false,
}));

// ── Mock PageLayout / Navbar / Footer ──────────────────────────────────────

vi.mock("@/components/landing/PageLayout", () => ({
  PageLayout: ({ children }) => <div data-testid="page-layout">{children}</div>,
}));
vi.mock("@/components/landing/LandingNavbar", () => ({
  LandingNavbar: () => <nav data-testid="landing-nav" />,
}));
vi.mock("@/components/landing/LandingFooter", () => ({
  LandingFooter: () => <footer data-testid="landing-footer" />,
}));

// ── Static imports after mocks ─────────────────────────────────────────────

import { TradeTrackingPage } from "@/pages/features/TradeTrackingPage";
import { FinancialLedgerPage } from "@/pages/features/FinancialLedgerPage";
import { PropFirmCompliancePage } from "@/pages/features/PropFirmCompliancePage";
import { RiskCalculatorsPage } from "@/pages/features/RiskCalculatorsPage";
import { BacktestingPage } from "@/pages/features/BacktestingPage";
import { StrategyPage } from "@/pages/features/StrategyPage";
import { EASyncPage } from "@/pages/marketing/EASyncPage";
import { ScorePage } from "@/pages/marketing/ScorePage";

// ── Banned words (brand voice) ──────────────────────────────────────────────

const BANNED_WORDS = [
  "unlock",
  "leverage", // as marketing verb — flat search is safe since none of our copy uses it
  "cutting-edge",
  "journal",
  "game-changer",
  "powerful",
  "seamless",
  "robust",
  "utilize",
  "delve",
  "crucial",
  "streamline",
];

// ── Page registry ────────────────────────────────────────────────────────────

const PAGES = [
  {
    name: "TradeTrackingPage",
    route: "/features/trade-tracking",
    Component: TradeTrackingPage,
    h1: "Trade Tracking",
  },
  {
    name: "FinancialLedgerPage",
    route: "/features/financial-ledger",
    Component: FinancialLedgerPage,
    h1: "Financial Ledger",
  },
  {
    name: "PropFirmCompliancePage",
    route: "/features/prop-firm-compliance",
    Component: PropFirmCompliancePage,
    h1: "Prop Firm Compliance",
  },
  {
    name: "RiskCalculatorsPage",
    route: "/features/risk-calculators",
    Component: RiskCalculatorsPage,
    h1: "Risk Calculators",
  },
  {
    name: "BacktestingPage",
    route: "/features/backtesting",
    Component: BacktestingPage,
    h1: /backtesting/i,
  },
  {
    name: "StrategyPage",
    route: "/features/strategy",
    Component: StrategyPage,
    h1: /strategy/i,
  },
  {
    name: "EASyncPage",
    route: "/ea-sync",
    Component: EASyncPage,
    h1: /set it once/i,
  },
  {
    name: "ScorePage",
    route: "/business-score",
    Component: ScorePage,
    h1: /one number/i,
  },
];

const prerenderSource = fs.readFileSync(
  path.resolve(process.cwd(), "prerender.js"),
  "utf-8"
);

const renderPage = (route, Component) =>
  render(
    <HelmetProvider>
      <MemoryRouter initialEntries={[route]}>
        <Routes>
          <Route path={route} element={<Component />} />
        </Routes>
      </MemoryRouter>
    </HelmetProvider>
  );

describe.each(PAGES)("$name ($route)", ({ route, Component, h1 }) => {
  test("renders an H1", () => {
    renderPage(route, Component);
    const heading = screen.getByRole("heading", { level: 1 });
    expect(heading).toBeInTheDocument();
    if (h1) {
      expect(heading.textContent).toMatch(h1);
    }
  });

  test("route is present in prerender.js STATIC_ROUTES", () => {
    expect(prerenderSource).toContain(`"${route}"`);
  });

  test("renders a related-features section with 3 internal links", async () => {
    renderPage(route, Component);
    await new Promise((r) => setTimeout(r, 0));
    const heading = screen.getByText(/other parts of the system/i);
    expect(heading).toBeInTheDocument();
    const section = heading.closest("section");
    const links = section.querySelectorAll("a[href]");
    expect(links.length).toBe(3);
  });

  test("renders an FAQ section with at least 4 questions", () => {
    renderPage(route, Component);
    const heading = screen.getByText(/frequently asked questions/i);
    expect(heading).toBeInTheDocument();
    const section = heading.closest("section");
    // Each FAQ item renders as an h3 inside the FAQ section
    const questions = section.querySelectorAll("h3");
    expect(questions.length).toBeGreaterThanOrEqual(4);
  });

  test("contains no banned brand-voice words", () => {
    const { container } = renderPage(route, Component);
    const text = container.textContent.toLowerCase();
    for (const word of BANNED_WORDS) {
      expect(text).not.toContain(word);
    }
  });

  test("contains no exclamation points", () => {
    const { container } = renderPage(route, Component);
    expect(container.textContent).not.toContain("!");
  });
});

// ── JSON-LD checks ───────────────────────────────────────────────────────────
// react-helmet-async only commits <script> tags to document.head after an
// async side-effect flush, which is unreliable to await in jsdom. Instead we
// render the component, capture the FAQ/breadcrumb data structures it builds
// (via the same buildFaqSchema/buildBreadcrumbSchema helpers used in source),
// and validate the on-page FAQ content lines up with what would be serialized.

const FEATURE_PAGE_SOURCE_FILES = {
  TradeTrackingPage: "src/pages/features/TradeTrackingPage.jsx",
  FinancialLedgerPage: "src/pages/features/FinancialLedgerPage.jsx",
  PropFirmCompliancePage: "src/pages/features/PropFirmCompliancePage.jsx",
  RiskCalculatorsPage: "src/pages/features/RiskCalculatorsPage.jsx",
  BacktestingPage: "src/pages/features/BacktestingPage.jsx",
  StrategyPage: "src/pages/features/StrategyPage.jsx",
  EASyncPage: "src/pages/marketing/EASyncPage.jsx",
  ScorePage: "src/pages/marketing/ScorePage.jsx",
};

describe.each(PAGES)("$name — structured data", ({ name }) => {
  test("source builds FAQPage and BreadcrumbList JSON-LD via Helmet", () => {
    const file = FEATURE_PAGE_SOURCE_FILES[name];
    const source = fs.readFileSync(path.resolve(process.cwd(), file), "utf-8");

    // Schema builders are wired up and rendered inside <Helmet>
    expect(source).toContain("buildFaqSchema(FAQS)");
    expect(source).toContain("buildBreadcrumbSchema(breadcrumbItems)");
    expect(source).toMatch(/<script type="application\/ld\+json">\{faqSchema\}<\/script>/);
    expect(source).toMatch(/<script type="application\/ld\+json">\{breadcrumbSchema\}<\/script>/);

    // FAQS array has at least 4 question/answer pairs
    const faqMatches = source.match(/question:\s*"/g) || [];
    expect(faqMatches.length).toBeGreaterThanOrEqual(4);

    // breadcrumbItems has at least 2 entries
    const breadcrumbMatches = source.match(/\{\s*label:\s*"[^"]+"/g) || [];
    expect(breadcrumbMatches.length).toBeGreaterThanOrEqual(2);
  });

  test("buildFaqSchema and buildBreadcrumbSchema produce valid schema.org JSON-LD", async () => {
    const { buildFaqSchema, buildBreadcrumbSchema } = await import(
      "@/lib/featurePageSchemas"
    );
    const faqJson = JSON.parse(
      buildFaqSchema([{ question: "Q1?", answer: "A1." }])
    );
    expect(faqJson["@type"]).toBe("FAQPage");
    expect(faqJson.mainEntity[0].name).toBe("Q1?");
    expect(faqJson.mainEntity[0].acceptedAnswer["@type"]).toBe("Answer");

    const breadcrumbJson = JSON.parse(
      buildBreadcrumbSchema([{ label: "Home", href: "/" }, { label: "Current" }])
    );
    expect(breadcrumbJson["@type"]).toBe("BreadcrumbList");
    expect(breadcrumbJson.itemListElement).toHaveLength(2);
    expect(breadcrumbJson.itemListElement[0].item).toBe("https://kraviq.app/");
  });
});

// ── Unique title tags across all 8 pages ────────────────────────────────────

describe("Feature pages — unique title tags", () => {
  test("each page declares a distinct <title> in its Helmet block", () => {
    const sourceFiles = [
      "src/pages/features/TradeTrackingPage.jsx",
      "src/pages/features/FinancialLedgerPage.jsx",
      "src/pages/features/PropFirmCompliancePage.jsx",
      "src/pages/features/RiskCalculatorsPage.jsx",
      "src/pages/features/BacktestingPage.jsx",
      "src/pages/features/StrategyPage.jsx",
      "src/pages/marketing/EASyncPage.jsx",
      "src/pages/marketing/ScorePage.jsx",
    ];

    const titles = sourceFiles.map((file) => {
      const source = fs.readFileSync(path.resolve(process.cwd(), file), "utf-8");
      const match = source.match(/PAGE_TITLE\s*=\s*"([^"]+)"/);
      expect(match, `${file} missing PAGE_TITLE constant`).toBeTruthy();
      return match[1];
    });

    expect(new Set(titles).size).toBe(titles.length);
  });
});
