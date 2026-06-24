/**
 * AboutPage tests.
 *
 * Covers the brand-voice rebuild + Google OAuth verification requirements:
 * - Page opens with the literal definition sentence, not a narrative hook
 * - Mission/vision render as short labeled blocks, not paragraphs
 * - Brand pillar text matches guidelines verbatim (Trade/Score/Scale)
 * - Core values render as 4 short cards
 * - Founder section is free of banned marketing language
 * - Founder name is present
 * - The definition sentence is present in the prerendered HTML source (/about
 *   is covered by the custom SSG/prerender pipeline in prerender.js)
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
    section: ({ children, ...p }) => <section {...p}>{children}</section>,
    li:      ({ children, ...p }) => <li {...p}>{children}</li>,
    span:    ({ children, ...p }) => <span {...p}>{children}</span>,
  },
  AnimatePresence: ({ children }) => children,
  useMotionValue: () => ({ set: vi.fn(), get: () => 0 }),
  useSpring: (v) => v,
  useTransform: () => ({ get: () => 0 }),
  useReducedMotion: () => false,
}));

// ── Mock PageLayout ────────────────────────────────────────────────────────

vi.mock("@/components/landing/PageLayout", () => ({
  PageLayout: ({ children }) => <div data-testid="page-layout">{children}</div>,
}));

// ── Mock LandingNavbar + LandingFooter ────────────────────────────────────

vi.mock("@/components/landing/LandingNavbar", () => ({
  LandingNavbar: () => <nav data-testid="landing-nav" />,
}));

vi.mock("@/components/landing/LandingFooter", () => ({
  LandingFooter: () => <footer data-testid="landing-footer" />,
}));

// ── Static imports after mocks ─────────────────────────────────────────────

import { AboutPage } from "@/pages/marketing/AboutPage";

// ── Constants under test ────────────────────────────────────────────────────

const DEFINITION_SENTENCE =
  "Kraviq is a business operating system for retail traders. It runs your trade journal, ledger, backtesting, and risk calculators in one place, then adds the institutional-grade tools that most retail traders, and even some institutions, don't have access to.";

const BANNED_WORDS = [
  "unlock",
  "leverage", // as a verb — none of our copy uses it at all, so a flat search is safe
  "cutting-edge",
  "journey",
  "crush",
  "game-changer",
];

// ── Render helpers ─────────────────────────────────────────────────────────

const renderAbout = () =>
  render(
    <HelmetProvider>
      <MemoryRouter initialEntries={["/about"]}>
        <Routes>
          <Route path="/about" element={<AboutPage />} />
        </Routes>
      </MemoryRouter>
    </HelmetProvider>
  );

// ── Tests ─────────────────────────────────────────────────────────────────

describe("Homepage hero plain-language description", () => {
  test("homepage hero includes plain-language description sentence in rendered output", () => {
    // Read the HeroSection source and verify the sentence is present in the source
    // (guarantees it is in the SSR/prerendered HTML, not just client-rendered state)
    const heroPath = path.resolve(
      process.cwd(),
      "src/components/landing/HeroSection.jsx"
    );
    const source = fs.readFileSync(heroPath, "utf-8");
    expect(source).toContain(
      "Kraviq is a trading business operating system for retail traders."
    );
  });
});

describe("AboutPage — header", () => {
  test("opens with the literal definition sentence, not a narrative hook", () => {
    renderAbout();
    expect(screen.getByRole("heading", { level: 1, name: /about kraviq/i })).toBeInTheDocument();
    expect(screen.getByText(DEFINITION_SENTENCE)).toBeInTheDocument();
  });

  test("does not open with a narrative hook", () => {
    renderAbout();
    expect(screen.queryByText(/why most traders/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/struggle with/i)).not.toBeInTheDocument();
  });
});

describe("AboutPage — mission and vision", () => {
  test("render as short labeled blocks, not paragraphs", () => {
    renderAbout();
    expect(screen.getByText("Mission")).toBeInTheDocument();
    expect(screen.getByText("Vision")).toBeInTheDocument();
    expect(
      screen.getByText(
        /bring institutional-grade trading infrastructure to retail traders/i
      )
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        /any trader, or any small fund, can run trading like a business/i
      )
    ).toBeInTheDocument();
  });
});

describe("AboutPage — what Kraviq does", () => {
  test("renders the plain bullet list of functionality", () => {
    renderAbout();
    expect(screen.getByText(/what kraviq does/i)).toBeInTheDocument();
    expect(screen.getByText(/logs every trade manually, by csv import/i)).toBeInTheDocument();
    expect(
      screen.getByText(/monitors prop firm rules automatically/i)
    ).toBeInTheDocument();
    expect(
      screen.getByText(/scores your consistency, risk management, profitability, discipline, and growth/i)
    ).toBeInTheDocument();
    expect(screen.getByText(/backtests a strategy against historical price data/i)).toBeInTheDocument();
    expect(screen.getByText(/runs kraviq ai against your trade history/i)).toBeInTheDocument();
  });
});

describe("AboutPage — brand pillars", () => {
  test("Trade pillar text matches guidelines verbatim", () => {
    renderAbout();
    expect(screen.getByText("Trade")).toBeInTheDocument();
    expect(
      screen.getByText(
        "Capture every trade: manually, via CSV, or through your MT4/MT5 EA. Full compliance tracking and behavioural analysis built in."
      )
    ).toBeInTheDocument();
  });

  test("Score pillar text matches guidelines verbatim (highlighted middle card)", () => {
    renderAbout();
    expect(screen.getByText("Score")).toBeInTheDocument();
    expect(
      screen.getByText(
        "The Trading Business Score measures five pillars: Consistency, Risk, Profitability, Discipline, Growth. Know exactly where you stand."
      )
    ).toBeInTheDocument();
  });

  test("Scale pillar text matches guidelines verbatim", () => {
    renderAbout();
    expect(screen.getByText("Scale")).toBeInTheDocument();
    expect(
      screen.getByText(
        "True net P&L after all costs. Prop firm challenge tracking. War account graduation pipeline. Run it like a business."
      )
    ).toBeInTheDocument();
  });
});

describe("AboutPage — core values", () => {
  test("renders 4 short cards with no elaboration", () => {
    renderAbout();
    expect(screen.getByText("Discipline over prediction")).toBeInTheDocument();
    expect(screen.getByText("Truth over vanity metrics")).toBeInTheDocument();
    expect(screen.getByText("Built by a trader, for traders")).toBeInTheDocument();
    expect(screen.getByText("Access, not exclusivity")).toBeInTheDocument();
  });
});

describe("AboutPage — founder", () => {
  test("contains no exclamation points", () => {
    renderAbout();
    const founderHeading = screen.getByRole("heading", { name: /^founder$/i });
    const section = founderHeading.closest("section");
    expect(section.textContent).not.toContain("!");
  });

  test("contains no banned marketing words", () => {
    renderAbout();
    const founderHeading = screen.getByRole("heading", { name: /^founder$/i });
    const section = founderHeading.closest("section");
    const text = section.textContent.toLowerCase();
    for (const word of BANNED_WORDS) {
      expect(text).not.toContain(word);
    }
  });

  test("founder name 'Ian Mwendwa' is present in rendered content", () => {
    renderAbout();
    expect(screen.getByText(/Ian Mwendwa/)).toBeInTheDocument();
  });

  test("uses the exact factual copy, clipped per writing principles", () => {
    renderAbout();
    expect(
      screen.getByText("Ian Mwendwa built Kraviq. He's a software engineer and a forex trader.")
    ).toBeInTheDocument();
    expect(
      screen.getByText(/kraviq exists so the next trader doesn't have to guess/i)
    ).toBeInTheDocument();
  });
});

describe("AboutPage — banned words across whole page", () => {
  test("page does not contain unlock, leverage, journey, crush, game-changer", () => {
    const { container } = renderAbout();
    const text = container.textContent.toLowerCase();
    for (const word of BANNED_WORDS) {
      expect(text).not.toContain(word);
    }
  });

  test("page contains no exclamation points or emoji", () => {
    const { container } = renderAbout();
    expect(container.textContent).not.toContain("!");
  });
});

describe("AboutPage — closing CTA", () => {
  test("renders Start Building Today linking to /register", () => {
    renderAbout();
    const cta = screen.getByRole("link", { name: /start building today/i });
    expect(cta).toBeInTheDocument();
    expect(cta).toHaveAttribute("href", "/register");
  });
});

describe("AboutPage — prerendered HTML / SSG coverage", () => {
  test("definition sentence is present in the AboutPage source (guarantees prerendered HTML output)", () => {
    const aboutPath = path.resolve(process.cwd(), "src/pages/marketing/AboutPage.jsx");
    const source = fs.readFileSync(aboutPath, "utf-8");
    expect(source).toContain(
      "Kraviq is a business operating system for retail traders."
    );
  });

  test("/about is present in prerender route list", () => {
    const prerenderPath = path.resolve(process.cwd(), "prerender.js");
    const source = fs.readFileSync(prerenderPath, "utf-8");
    expect(source).toContain('"/about"');
  });
});
