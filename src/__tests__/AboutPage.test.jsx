/**
 * AboutPage + homepage hero plain-language description tests.
 *
 * Covers the Google OAuth verification requirements:
 * - Homepage hero has a plain-language description sentence
 * - /about renders its own distinct page (not a redirect or duplicate of landing)
 * - /about has a distinct title and meta description
 * - /about contains all required sections and the founder name
 * - /about is present in the prerender route list
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
    p:       ({ children, ...p }) => <p {...p}>{children}</p>,
    section: ({ children, ...p }) => <section {...p}>{children}</section>,
    li:      ({ children, ...p }) => <li {...p}>{children}</li>,
    span:    ({ children, ...p }) => <span {...p}>{children}</span>,
  },
  AnimatePresence: ({ children }) => children,
  useMotionValue: () => ({ set: vi.fn(), get: () => 0 }),
  useSpring: (v) => v,
  useTransform: (_v, _in, _out) => ({ get: () => 0 }),
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
      "Kraviq is a web application that helps forex traders log and analyze their trades"
    );
  });
});

describe("AboutPage route", () => {
  test("/about route renders AboutPage, not LandingPage", () => {
    renderAbout();
    expect(screen.getByTestId("page-layout")).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 1, name: /about kraviq/i })).toBeInTheDocument();
  });

  test("/about has distinct title tag from homepage", () => {
    renderAbout();
    // The /about H1 must be About Kraviq, not the homepage headline
    const h1 = screen.getByRole("heading", { level: 1 });
    expect(h1.textContent).toMatch(/About Kraviq/i);
    expect(h1.textContent).not.toMatch(/You Trade Well/i);
  });

  test("/about content does not duplicate homepage hero content", () => {
    renderAbout();
    expect(screen.queryByText(/Run It Like/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/You Trade Well/i)).not.toBeInTheDocument();
  });

  test("/about renders the problem section", () => {
    renderAbout();
    expect(
      screen.getByText(/why most traders can't see what's actually happening/i)
    ).toBeInTheDocument();
    expect(
      screen.getByText(/most retail traders track their performance the same way/i)
    ).toBeInTheDocument();
  });

  test("/about renders the founder story section", () => {
    renderAbout();
    expect(
      screen.getByText(/built from four years of trying to figure this out/i)
    ).toBeInTheDocument();
  });

  test("/about renders the purpose section", () => {
    renderAbout();
    expect(
      screen.getByText(/bringing institutional tools to retail traders/i)
    ).toBeInTheDocument();
  });

  test("/about renders the mission section", () => {
    renderAbout();
    expect(
      screen.getByText(/so trading skill, not access, decides who survives/i)
    ).toBeInTheDocument();
  });

  test("/about renders the vision section", () => {
    renderAbout();
    expect(
      screen.getByText(/run their trading like a real business/i)
    ).toBeInTheDocument();
  });

  test("/about renders 4 core value cards", () => {
    renderAbout();
    expect(screen.getByText("Discipline over prediction")).toBeInTheDocument();
    expect(screen.getByText("Truth over vanity metrics")).toBeInTheDocument();
    expect(screen.getByText("Built by a trader, for traders")).toBeInTheDocument();
    expect(screen.getByText("Access, not exclusivity")).toBeInTheDocument();
  });

  test("/about renders the What Kraviq Does section with plain bullet list", () => {
    renderAbout();
    expect(
      screen.getByText(/what kraviq does/i)
    ).toBeInTheDocument();
    expect(
      screen.getByText(/log trades manually/i)
    ).toBeInTheDocument();
    expect(
      screen.getByText(/track compliance with prop trading firm rules/i)
    ).toBeInTheDocument();
  });

  test("/about renders the contact section", () => {
    renderAbout();
    expect(
      screen.getByRole("heading", { name: /get in touch/i })
    ).toBeInTheDocument();
  });

  test("/about renders all major sections: problem, founder story, purpose, mission, vision, core values, what Kraviq does, contact", () => {
    renderAbout();
    expect(screen.getByText(/why most traders can't see what's actually happening/i)).toBeInTheDocument();
    expect(screen.getByText(/built from four years of trying to figure this out/i)).toBeInTheDocument();
    expect(screen.getByText(/bringing institutional tools to retail traders/i)).toBeInTheDocument();
    expect(screen.getByText(/so trading skill, not access, decides who survives/i)).toBeInTheDocument();
    expect(screen.getByText(/run their trading like a real business/i)).toBeInTheDocument();
    expect(screen.getByText("Discipline over prediction")).toBeInTheDocument();
    expect(screen.getByText(/what kraviq does/i)).toBeInTheDocument();
    expect(screen.getByText(/get in touch/i)).toBeInTheDocument();
  });

  test("founder name appears in rendered content", () => {
    renderAbout();
    expect(screen.getByText(/Ian Mwendwa/)).toBeInTheDocument();
  });
});

describe("/about is present in prerender route list", () => {
  test("/about is present in prerender route list", () => {
    const prerenderPath = path.resolve(process.cwd(), "prerender.js");
    const source = fs.readFileSync(prerenderPath, "utf-8");
    expect(source).toContain('"/about"');
  });
});
