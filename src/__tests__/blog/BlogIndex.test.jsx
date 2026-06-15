/**
 * BlogIndexPage tests
 *
 * Mocks:
 *   - @/lib/blog — controlled post data
 *   - @/components/landing/PageLayout — strips nav/footer from test scope
 *   - framer-motion — replaces animated elements with plain HTML
 */

import { describe, test, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";

// ---------------------------------------------------------------------------
// Mock PageLayout — avoids LandingNavbar/Footer complexity in tests
// ---------------------------------------------------------------------------

vi.mock("@/components/landing/PageLayout", () => ({
  PageLayout: ({ children }) => <div data-testid="page-layout">{children}</div>,
}));

// ---------------------------------------------------------------------------
// Mock framer-motion
// ---------------------------------------------------------------------------

vi.mock("framer-motion", () => ({
  motion: {
    div: ({ children, ...props }) => <div {...props}>{children}</div>,
    h1: ({ children, ...props }) => <h1 {...props}>{children}</h1>,
    p: ({ children, ...props }) => <p {...props}>{children}</p>,
    article: ({ children, ...props }) => <article {...props}>{children}</article>,
    span: ({ children, ...props }) => <span {...props}>{children}</span>,
    header: ({ children, ...props }) => <header {...props}>{children}</header>,
  },
  AnimatePresence: ({ children }) => children,
  useReducedMotion: () => false,
}));

// ---------------------------------------------------------------------------
// Mock blog lib — data inside factory to avoid TDZ hoisting
// Two cornerstone posts (post-12 and post-13) matching the current plan.
// ---------------------------------------------------------------------------

vi.mock("@/lib/blog", () => {
  const posts = [
    {
      slug: "how-to-run-your-trading-like-a-business",
      frontmatter: {
        title: "How to Run Your Trading Like a Business",
        pillar: "trading_business",
        priority: 1,
        isCornerstone: true,
        estimatedWordCount: 2200,
        publishedAt: "2026-06-14",
      },
      content: "## Section One\nContent here.\n",
    },
    {
      slug: "institutional-trading-tools-for-retail-traders",
      frontmatter: {
        title: "Institutional Trading Tools You Can Actually Use as a Retail Trader",
        pillar: "volume_order_flow",
        priority: 1,
        isCornerstone: true,
        estimatedWordCount: 2000,
        publishedAt: "2026-06-15",
      },
      content: "## Section One\nContent here.\n",
    },
    {
      slug: "what-is-a-fair-value-gap-ict",
      frontmatter: {
        title: "What is a Fair Value Gap?",
        pillar: "ict_smc",
        priority: 1,
        isCornerstone: false,
        estimatedWordCount: 1800,
        publishedAt: "2026-06-14",
      },
      content: "## Section One\nContent here.\n",
    },
    {
      slug: "daily-drawdown-vs-max-drawdown-explained",
      frontmatter: {
        title: "Daily Drawdown vs Max Drawdown: Why It Matters",
        pillar: "prop_firm_rules",
        priority: 1,
        isCornerstone: false,
        estimatedWordCount: 1600,
        publishedAt: "2026-06-14",
      },
      content: "## Section One\nContent here.\n",
    },
    {
      slug: "what-is-revenge-trading-how-to-stop",
      frontmatter: {
        title: "What is Revenge Trading (And How to Stop It)",
        pillar: "psychology",
        priority: 1,
        isCornerstone: false,
        estimatedWordCount: 1700,
        publishedAt: "2026-06-14",
      },
      content: "## Section One\nContent here.\n",
    },
    {
      slug: "support-and-resistance-trading-foundation",
      frontmatter: {
        title: "Support and Resistance Trading: The Foundation of Technical Analysis",
        pillar: "classic_ta",
        priority: 1,
        isCornerstone: false,
        estimatedWordCount: 1700,
        publishedAt: "2026-06-15",
      },
      content: "## Section One\nContent here.\n",
    },
  ];

  return {
    getAllPosts: () => posts,
    getPostBySlug: (slug) => posts.find((p) => p.slug === slug) ?? null,
    getReadTime: (w) => Math.max(1, Math.round((w ?? 0) / 200)),
    getExcerpt: () => "An excerpt for testing.",
  };
});

// ---------------------------------------------------------------------------
// Import after mocks
// ---------------------------------------------------------------------------

import { BlogIndexPage } from "@/pages/blog/BlogIndexPage";

// ---------------------------------------------------------------------------
// Render helper
// ---------------------------------------------------------------------------

const renderBlogIndex = (initialSearch = "") =>
  render(
    <HelmetProvider>
      <MemoryRouter initialEntries={[`/blog${initialSearch}`]}>
        <Routes>
          <Route path="/blog" element={<BlogIndexPage />} />
          <Route path="/blog/:slug" element={<div>Post page</div>} />
        </Routes>
      </MemoryRouter>
    </HelmetProvider>
  );

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("BlogIndexPage", () => {
  // ── Start Here row ─────────────────────────────────────────────────────────

  test("renders both cornerstone posts in Start Here row", () => {
    renderBlogIndex();
    // "Start Here" label is always present when there are cornerstones
    expect(screen.getByText("Start Here")).toBeInTheDocument();
    expect(
      screen.getByText("How to Run Your Trading Like a Business")
    ).toBeInTheDocument();
    expect(
      screen.getByText("Institutional Trading Tools You Can Actually Use as a Retail Trader")
    ).toBeInTheDocument();
    // Both should show the Cornerstone badge
    const cornerstoneBadges = screen.getAllByText("Cornerstone");
    expect(cornerstoneBadges.length).toBe(2);
  });

  test("Start Here row remains visible when a pillar filter is active that excludes both cornerstones", () => {
    // psychology filter — neither cornerstone belongs to psychology
    renderBlogIndex("?pillar=psychology");
    // Start Here row must still be visible (filter-independent)
    expect(screen.getByText("Start Here")).toBeInTheDocument();
    expect(
      screen.getByText("How to Run Your Trading Like a Business")
    ).toBeInTheDocument();
    expect(
      screen.getByText("Institutional Trading Tools You Can Actually Use as a Retail Trader")
    ).toBeInTheDocument();
    // But the psychology pillar post should appear in the grid
    expect(
      screen.getByText("What is Revenge Trading (And How to Stop It)")
    ).toBeInTheDocument();
  });

  test("regular grid excludes both cornerstone posts to avoid duplication", () => {
    renderBlogIndex();
    // Both cornerstone titles should only appear once (in Start Here row, not also in grid)
    const businessTitles = screen.getAllByText("How to Run Your Trading Like a Business");
    expect(businessTitles.length).toBe(1);
    const institutionalTitles = screen.getAllByText(
      "Institutional Trading Tools You Can Actually Use as a Retail Trader"
    );
    expect(institutionalTitles.length).toBe(1);
  });

  // ── Pillar filter chips ────────────────────────────────────────────────────

  test("pillar filter chips render for all 6 pillars", () => {
    renderBlogIndex();
    expect(screen.getAllByText("ICT & Smart Money Concepts").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Prop Firm Rules & Compliance").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Trading Psychology & Discipline").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Trading as a Business").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Volume & Order Flow").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Classic Strategies & Technical Analysis").length).toBeGreaterThan(0);
  });

  test("All filter chip is present and initially active", () => {
    renderBlogIndex();
    const allChip = screen.getByRole("button", { name: "All" });
    expect(allChip).toBeInTheDocument();
    expect(allChip).toHaveAttribute("aria-pressed", "true");
  });

  test("post cards show post titles", () => {
    renderBlogIndex();
    expect(screen.getByText("What is a Fair Value Gap?")).toBeInTheDocument();
  });

  test("read time calculated from estimatedWordCount (1800 words → 9 min read)", () => {
    renderBlogIndex();
    const labels = screen.getAllByText(/9 min read/i);
    expect(labels.length).toBeGreaterThan(0);
  });

  test("clicking a pillar chip filters out posts from other pillars", () => {
    renderBlogIndex();
    const ictChip = screen.getByRole("button", {
      name: "ICT & Smart Money Concepts",
    });
    fireEvent.click(ictChip);
    // psychology post should not appear in the grid after filtering to ict_smc
    expect(
      screen.queryByText("What is Revenge Trading (And How to Stop It)")
    ).not.toBeInTheDocument();
  });

  test("filtering by volume_order_flow shows only that pillar's posts in the grid", () => {
    renderBlogIndex();
    const volumeChip = screen.getByRole("button", {
      name: "Volume & Order Flow",
    });
    fireEvent.click(volumeChip);
    // classic_ta post should not appear in the grid
    expect(
      screen.queryByText(
        "Support and Resistance Trading: The Foundation of Technical Analysis"
      )
    ).not.toBeInTheDocument();
    // But Start Here row with volume_order_flow cornerstone is still visible
    expect(
      screen.getByText("Institutional Trading Tools You Can Actually Use as a Retail Trader")
    ).toBeInTheDocument();
  });

  test("filtering by classic_ta shows only that pillar's posts in the grid", () => {
    renderBlogIndex();
    const classicChip = screen.getByRole("button", {
      name: "Classic Strategies & Technical Analysis",
    });
    fireEvent.click(classicChip);
    // Support and resistance post should appear in the grid
    expect(
      screen.getByText(
        "Support and Resistance Trading: The Foundation of Technical Analysis"
      )
    ).toBeInTheDocument();
    // ict_smc post should not appear in the grid
    expect(
      screen.queryByText("What is a Fair Value Gap?")
    ).not.toBeInTheDocument();
  });

  test("empty category shows coming soon message when no posts match filter", () => {
    render(
      <HelmetProvider>
        <MemoryRouter initialEntries={["/blog?pillar=nonexistent_pillar"]}>
          <Routes>
            <Route path="/blog" element={<BlogIndexPage />} />
          </Routes>
        </MemoryRouter>
      </HelmetProvider>
    );
    expect(
      screen.getByText(/more articles in this category coming soon/i)
    ).toBeInTheDocument();
  });

  test("non-cornerstone posts appear in the grid", () => {
    renderBlogIndex();
    expect(
      screen.getByText("Daily Drawdown vs Max Drawdown: Why It Matters")
    ).toBeInTheDocument();
    expect(
      screen.getByText("What is Revenge Trading (And How to Stop It)")
    ).toBeInTheDocument();
  });
});
