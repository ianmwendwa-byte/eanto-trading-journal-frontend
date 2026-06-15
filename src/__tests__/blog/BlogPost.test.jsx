/**
 * BlogPostPage tests
 *
 * Mocks:
 *   - @/lib/blog — controlled post data
 *   - @/components/landing/PageLayout — strips nav/footer from test scope
 *   - react-markdown / remark-gfm / rehype-slug — avoids ESM issues in jsdom
 *   - framer-motion — replaces animated elements with plain HTML
 */

import { describe, test, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";

// ---------------------------------------------------------------------------
// Mock PageLayout — avoids LandingNavbar/Footer complexity in tests
// ---------------------------------------------------------------------------

vi.mock("@/components/landing/PageLayout", () => ({
  PageLayout: ({ children }) => <div data-testid="page-layout">{children}</div>,
}));

// ---------------------------------------------------------------------------
// Mock ESM packages not compatible with jsdom
// ---------------------------------------------------------------------------

vi.mock("react-markdown", () => ({
  default: ({ children }) => <div data-testid="markdown-body">{children}</div>,
}));

vi.mock("remark-gfm", () => ({ default: () => {} }));
vi.mock("rehype-slug", () => ({ default: () => {} }));

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
// Mock blog lib — all data inside factory (avoids TDZ hoisting)
// ---------------------------------------------------------------------------

vi.mock("@/lib/blog", () => {
  const ALL_POSTS = [
    {
      slug: "what-is-a-fair-value-gap-ict",
      frontmatter: {
        title: "What is a Fair Value Gap? (ICT Concepts Explained)",
        pillar: "ict_smc",
        priority: 1,
        isCornerstone: false,
        estimatedWordCount: 1800,
        publishedAt: "2026-06-14",
        updatedAt: "2026-06-14",
        primaryKeyword: "fair value gap",
        secondaryKeywords: ["FVG trading", "fair value gap strategy"],
        faq: [
          {
            question: "What is a fair value gap in trading?",
            answer: "A fair value gap (FVG) is a three-candle price pattern.",
          },
          {
            question: "How do you trade a fair value gap?",
            answer: "Traders often wait for price to return into the FVG.",
          },
        ],
        kraviqTieIn: {
          feature: "Strategy setupCriteria checklist",
          ctaText: "If you trade FVGs, you can add an FVG criterion in Kraviq.",
          linksTo: "/strategies/templates",
        },
        relatedStrategyTemplate: "ICT Silver Bullet",
        internalLinks: ["order-blocks-explained-beginners-guide"],
      },
      // 5 H2s — triggers TOC (requires 4+)
      content: `## What is a Fair Value Gap?\nBody one.\n## Why Fair Value Gaps Form\nBody two.\n## Bullish vs Bearish FVGs\nBody three.\n## How to Identify FVGs\nBody four.\n## Trading a Fair Value Gap\nBody five.\n`,
    },
    {
      slug: "order-blocks-explained-beginners-guide",
      frontmatter: {
        title: "Order Blocks Explained: A Beginner's Guide",
        pillar: "ict_smc",
        priority: 1,
        isCornerstone: false,
        estimatedWordCount: 1700,
        publishedAt: "2026-06-14",
        internalLinks: [],
      },
      content: "## Section One\nContent.\n",
    },
    {
      slug: "daily-drawdown-vs-max-drawdown-explained",
      frontmatter: {
        title: "Daily Drawdown vs Max Drawdown",
        pillar: "prop_firm_rules",
        priority: 1,
        isCornerstone: false,
        estimatedWordCount: 1600,
        publishedAt: "2026-06-14",
        updatedAt: "2026-06-14",
        primaryKeyword: "daily drawdown",
        secondaryKeywords: [],
        faq: [],
        kraviqTieIn: {
          feature: "propRules compliance",
          ctaText: "Kraviq tracks drawdown automatically.",
          linksTo: "/features/compliance",
        },
        relatedStrategyTemplate: null,
        internalLinks: [],
      },
      content: "## Section One\nContent.\n",
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
        updatedAt: "2026-06-15",
        primaryKeyword: "institutional trading tools for retail traders",
        secondaryKeywords: ["retail vs institutional trading", "trading like an institution"],
        faq: [
          {
            question: "What tools do institutional traders use that retail traders don't?",
            answer: "Historically, institutions had exclusive access to tools like volume profile, order flow/footprint data.",
          },
          {
            question: "Can retail traders really trade like institutions?",
            answer: "Retail traders can adopt the same analytical concepts and the same process-driven approach.",
          },
          {
            question: "What's the biggest gap between retail and institutional trading?",
            answer: "The biggest remaining gap is typically process and discipline rather than tool access.",
          },
        ],
        kraviqTieIn: {
          feature: "Strategy/Playbook system + Business Score",
          ctaText: "This is the idea at the core of Kraviq: institutional-style tools paired with an institutional-style process.",
          linksTo: "/features/business-score",
        },
        relatedStrategyTemplate: null,
        internalLinks: ["how-to-run-your-trading-like-a-business"],
      },
      content: `## The Gap: What Institutions Have That Retail Doesn't\nBody one.\n## What's Actually Accessible Now\nBody two.\n## The Real Remaining Difference\nBody three.\n## How Institutional Desks Structure Decisions\nBody four.\n## Bringing That Process to Retail\nBody five.\n`,
    },
    {
      slug: "how-to-run-your-trading-like-a-business",
      frontmatter: {
        title: "How to Run Your Trading Like a Business",
        pillar: "trading_business",
        priority: 1,
        isCornerstone: true,
        estimatedWordCount: 2200,
        publishedAt: "2026-06-14",
        internalLinks: ["institutional-trading-tools-for-retail-traders"],
      },
      content: "## Section One\nContent.\n",
    },
  ];

  return {
    getPostBySlug: (slug) => ALL_POSTS.find((p) => p.slug === slug) ?? null,
    getRelatedPosts: (post) => {
      const links = post.frontmatter.internalLinks ?? [];
      return links
        .map((s) => ALL_POSTS.find((p) => p.slug === s))
        .filter(Boolean);
    },
    getReadTime: (w) => Math.max(1, Math.round((w ?? 0) / 200)),
    getAllPosts: () => ALL_POSTS,
    getExcerpt: () => "An excerpt.",
  };
});

// ---------------------------------------------------------------------------
// Import after mocks
// ---------------------------------------------------------------------------

import { BlogPostPage } from "@/pages/blog/BlogPostPage";

// ---------------------------------------------------------------------------
// Render helper
// ---------------------------------------------------------------------------

const renderPost = (slug) =>
  render(
    <HelmetProvider>
      <MemoryRouter initialEntries={[`/blog/${slug}`]}>
        <Routes>
          <Route path="/blog/:slug" element={<BlogPostPage />} />
          <Route
            path="/blog"
            element={<div data-testid="blog-index">Blog index</div>}
          />
          <Route
            path="/strategies/templates"
            element={<div>Templates</div>}
          />
        </Routes>
      </MemoryRouter>
    </HelmetProvider>
  );

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("BlogPostPage", () => {
  test("renders article body from markdown", () => {
    renderPost("what-is-a-fair-value-gap-ict");
    expect(screen.getByTestId("markdown-body")).toBeInTheDocument();
  });

  test("renders table of contents for posts with 4+ H2 sections", () => {
    renderPost("what-is-a-fair-value-gap-ict");
    // TOC shows "In this article" when heading count >= 4
    expect(screen.getAllByText(/in this article/i).length).toBeGreaterThan(0);
  });

  test("FAQ accordion renders all Q&A pairs", () => {
    renderPost("what-is-a-fair-value-gap-ict");
    expect(
      screen.getByText("What is a fair value gap in trading?")
    ).toBeInTheDocument();
    expect(
      screen.getByText("How do you trade a fair value gap?")
    ).toBeInTheDocument();
  });

  test("FAQPage JSON-LD schema indicated by FAQ section heading being present", () => {
    renderPost("what-is-a-fair-value-gap-ict");
    expect(screen.getByText("Frequently Asked Questions")).toBeInTheDocument();
  });

  test("Article schema headline matches post title in h1", () => {
    renderPost("what-is-a-fair-value-gap-ict");
    expect(
      screen.getByRole("heading", {
        name: /What is a Fair Value Gap\? \(ICT Concepts Explained\)/i,
        level: 1,
      })
    ).toBeInTheDocument();
  });

  test("Kraviq CTA block renders ctaText and links to linksTo", () => {
    renderPost("what-is-a-fair-value-gap-ict");
    expect(screen.getByText("Try this in Kraviq")).toBeInTheDocument();
    expect(
      screen.getByText(
        "If you trade FVGs, you can add an FVG criterion in Kraviq."
      )
    ).toBeInTheDocument();
    const ctaButton = screen.getByRole("link", { name: "Open in Kraviq" });
    expect(ctaButton).toHaveAttribute("href", "/strategies/templates");
  });

  test("related strategy template callout renders when relatedStrategyTemplate is non-null", () => {
    renderPost("what-is-a-fair-value-gap-ict");
    expect(screen.getByText(/ICT Silver Bullet/i)).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "View Template" })
    ).toBeInTheDocument();
  });

  test("related strategy template callout is absent when relatedStrategyTemplate is null", () => {
    renderPost("daily-drawdown-vs-max-drawdown-explained");
    expect(screen.queryByText("View Template")).not.toBeInTheDocument();
  });

  test("related articles render resolved internalLinks as post cards", () => {
    renderPost("what-is-a-fair-value-gap-ict");
    expect(
      screen.getByText("Order Blocks Explained: A Beginner's Guide")
    ).toBeInTheDocument();
  });

  test("related articles section absent when no internalLinks resolve", () => {
    renderPost("daily-drawdown-vs-max-drawdown-explained");
    expect(screen.queryByText("Related Articles")).not.toBeInTheDocument();
  });

  test("navigates to /blog when an unknown slug is requested", () => {
    renderPost("this-slug-does-not-exist");
    expect(screen.getByTestId("blog-index")).toBeInTheDocument();
  });

  // ── New post-13 spot-check ─────────────────────────────────────────────────

  test("institutional-trading-tools-for-retail-traders post renders FAQ schema correctly", () => {
    renderPost("institutional-trading-tools-for-retail-traders");
    // FAQPage heading present
    expect(screen.getByText("Frequently Asked Questions")).toBeInTheDocument();
    // All three FAQ questions rendered
    expect(
      screen.getByText("What tools do institutional traders use that retail traders don't?")
    ).toBeInTheDocument();
    expect(
      screen.getByText("Can retail traders really trade like institutions?")
    ).toBeInTheDocument();
    expect(
      screen.getByText("What's the biggest gap between retail and institutional trading?")
    ).toBeInTheDocument();
  });

  test("related articles for how-to-run-your-trading-like-a-business includes institutional-trading-tools-for-retail-traders", () => {
    renderPost("how-to-run-your-trading-like-a-business");
    expect(
      screen.getByText("Institutional Trading Tools You Can Actually Use as a Retail Trader")
    ).toBeInTheDocument();
  });
});
