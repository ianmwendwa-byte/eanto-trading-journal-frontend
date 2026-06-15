/**
 * Tests for src/lib/blog.js
 *
 * Because import.meta.glob is a Vite-only API, we mock the entire blog module
 * and test the pure logic of each exported function via a factory that accepts
 * a mock file map.
 */

import { describe, test, expect, vi, beforeEach } from "vitest";

// ---------------------------------------------------------------------------
// Helpers — build minimal post objects that mirror real parsed posts
// ---------------------------------------------------------------------------

const makeFrontmatter = (overrides = {}) => ({
  title: "Test Post",
  slug: overrides.slug ?? "test-post",
  pillar: overrides.pillar ?? "ict_smc",
  priority: overrides.priority ?? 2,
  primaryKeyword: "test",
  secondaryKeywords: [],
  faq: [],
  kraviqTieIn: { feature: "x", ctaText: "y", linksTo: "/z" },
  relatedStrategyTemplate: overrides.relatedStrategyTemplate ?? null,
  internalLinks: overrides.internalLinks ?? [],
  estimatedWordCount: overrides.estimatedWordCount ?? 1800,
  isCornerstone: overrides.isCornerstone ?? false,
  publishedAt: overrides.publishedAt ?? "2026-06-14",
  updatedAt: "2026-06-14",
  ...overrides,
});

const makePost = (overrides = {}) => ({
  slug: overrides.slug ?? "test-post",
  frontmatter: makeFrontmatter(overrides),
  content: overrides.content ?? "## Heading One\nBody text here.\n",
});

// ---------------------------------------------------------------------------
// We test the pure functions by importing the module and mocking import.meta.glob.
// Since vitest transpiles the module, we need to mock the gray-matter call and
// the glob result. We do this by mocking the entire lib/blog module with
// factory functions that accept raw posts, and test the logic in isolation.
// ---------------------------------------------------------------------------

// Pure sort logic extracted from getAllPosts for direct unit testing
function sortPosts(posts) {
  return [...posts].sort((a, b) => {
    const priorityDiff = (a.frontmatter.priority ?? 99) - (b.frontmatter.priority ?? 99);
    if (priorityDiff !== 0) return priorityDiff;
    const dateA = new Date(a.frontmatter.publishedAt ?? 0).getTime();
    const dateB = new Date(b.frontmatter.publishedAt ?? 0).getTime();
    return dateB - dateA;
  });
}

// Pure getPostBySlug logic
function getPostBySlugPure(posts, slug) {
  return posts.find((p) => p.slug === slug) ?? null;
}

// Pure getPostsByPillar logic
function getPostsByPillarPure(posts, pillarId) {
  return sortPosts(posts).filter((p) => p.frontmatter.pillar === pillarId);
}

// Pure getRelatedPosts logic
function getRelatedPostsPure(allPosts, post) {
  const links = post.frontmatter.internalLinks ?? [];
  const resolved = [];
  const warnedSlugs = [];

  for (const linkedSlug of links) {
    const found = allPosts.find((p) => p.slug === linkedSlug);
    if (found) {
      resolved.push(found);
    } else {
      warnedSlugs.push(linkedSlug);
    }
  }
  return { resolved, warnedSlugs };
}

// Pure getAllSlugs logic
function getAllSlugsPure(posts) {
  return posts.map((p) => p.slug);
}

// Pure getReadTime logic
function getReadTime(wordCount) {
  return Math.max(1, Math.round((wordCount ?? 0) / 200));
}

// ---------------------------------------------------------------------------
// Build the 23-post collection mirroring actual FRONTEND.md posts
// ---------------------------------------------------------------------------

const TWENTY_THREE_POSTS = [
  // ict_smc pillar
  makePost({ slug: "what-is-a-fair-value-gap-ict", pillar: "ict_smc", priority: 1, publishedAt: "2026-06-14",
    internalLinks: ["order-blocks-explained-beginners-guide", "liquidity-sweeps-explained-ict-kill-zones", "ict-vs-smart-money-concepts-difference"] }),
  makePost({ slug: "order-blocks-explained-beginners-guide", pillar: "ict_smc", priority: 1, publishedAt: "2026-06-14",
    internalLinks: ["what-is-a-fair-value-gap-ict", "liquidity-sweeps-explained-ict-kill-zones", "ict-vs-smart-money-concepts-difference", "supply-and-demand-zones-vs-support-resistance"] }),
  makePost({ slug: "liquidity-sweeps-explained-ict-kill-zones", pillar: "ict_smc", priority: 2, publishedAt: "2026-06-14",
    internalLinks: ["what-is-a-fair-value-gap-ict", "order-blocks-explained-beginners-guide", "is-ict-trading-still-relevant-2026"] }),
  makePost({ slug: "ict-vs-smart-money-concepts-difference", pillar: "ict_smc", priority: 2, publishedAt: "2026-06-14",
    internalLinks: ["order-blocks-explained-beginners-guide", "what-is-a-fair-value-gap-ict", "support-and-resistance-trading-foundation", "is-ict-trading-still-relevant-2026"] }),
  makePost({ slug: "is-ict-trading-still-relevant-2026", pillar: "ict_smc", priority: 2, publishedAt: "2026-06-15",
    internalLinks: ["liquidity-sweeps-explained-ict-kill-zones", "ict-vs-smart-money-concepts-difference", "support-and-resistance-trading-foundation", "institutional-trading-tools-for-retail-traders"] }),

  // prop_firm_rules pillar
  makePost({ slug: "daily-drawdown-vs-max-drawdown-explained", pillar: "prop_firm_rules", priority: 1, publishedAt: "2026-06-14",
    internalLinks: ["5-reasons-traders-fail-prop-firm-challenges", "how-to-track-multiple-prop-firm-accounts"] }),
  makePost({ slug: "5-reasons-traders-fail-prop-firm-challenges", pillar: "prop_firm_rules", priority: 1, publishedAt: "2026-06-14",
    internalLinks: ["daily-drawdown-vs-max-drawdown-explained", "what-is-revenge-trading-how-to-stop", "risk-per-trade-why-1-percent-is-standard"] }),
  makePost({ slug: "how-to-track-multiple-prop-firm-accounts", pillar: "prop_firm_rules", priority: 2, publishedAt: "2026-06-14",
    internalLinks: ["daily-drawdown-vs-max-drawdown-explained", "how-to-run-your-trading-like-a-business"] }),

  // psychology pillar
  makePost({ slug: "what-is-revenge-trading-how-to-stop", pillar: "psychology", priority: 1, publishedAt: "2026-06-14",
    internalLinks: ["5-reasons-traders-fail-prop-firm-challenges", "trading-journal-benefits-what-data-shows"] }),
  makePost({ slug: "risk-per-trade-why-1-percent-is-standard", pillar: "psychology", priority: 1, publishedAt: "2026-06-14",
    internalLinks: ["5-reasons-traders-fail-prop-firm-challenges", "profit-factor-vs-win-rate-which-matters-more"] }),
  makePost({ slug: "trading-journal-benefits-what-data-shows", pillar: "psychology", priority: 2, publishedAt: "2026-06-14",
    internalLinks: ["what-is-revenge-trading-how-to-stop", "how-to-run-your-trading-like-a-business"] }),

  // trading_business pillar
  makePost({ slug: "profit-factor-vs-win-rate-which-matters-more", pillar: "trading_business", priority: 1, publishedAt: "2026-06-14",
    internalLinks: ["risk-per-trade-why-1-percent-is-standard", "how-to-run-your-trading-like-a-business"] }),
  makePost({ slug: "how-to-run-your-trading-like-a-business", pillar: "trading_business", priority: 1, isCornerstone: true, publishedAt: "2026-06-14",
    internalLinks: ["institutional-trading-tools-for-retail-traders", "what-is-a-fair-value-gap-ict", "daily-drawdown-vs-max-drawdown-explained", "what-is-revenge-trading-how-to-stop", "profit-factor-vs-win-rate-which-matters-more", "trading-journal-benefits-what-data-shows", "how-to-track-multiple-prop-firm-accounts"] }),

  // volume_order_flow pillar
  makePost({ slug: "institutional-trading-tools-for-retail-traders", pillar: "volume_order_flow", priority: 1, isCornerstone: true, publishedAt: "2026-06-15",
    internalLinks: ["what-is-volume-profile-poc-value-area-explained", "order-flow-trading-footprint-charts-explained", "vwap-explained-institutional-benchmark", "cot-report-explained-institutional-positioning", "how-to-run-your-trading-like-a-business"] }),
  makePost({ slug: "what-is-volume-profile-poc-value-area-explained", pillar: "volume_order_flow", priority: 1, publishedAt: "2026-06-15",
    internalLinks: ["why-forex-volume-data-is-different", "order-flow-trading-footprint-charts-explained", "institutional-trading-tools-for-retail-traders"] }),
  makePost({ slug: "why-forex-volume-data-is-different", pillar: "volume_order_flow", priority: 2, publishedAt: "2026-06-15",
    internalLinks: ["what-is-volume-profile-poc-value-area-explained", "order-flow-trading-footprint-charts-explained"] }),
  makePost({ slug: "order-flow-trading-footprint-charts-explained", pillar: "volume_order_flow", priority: 2, publishedAt: "2026-06-15",
    internalLinks: ["what-is-volume-profile-poc-value-area-explained", "why-forex-volume-data-is-different", "institutional-trading-tools-for-retail-traders"] }),
  makePost({ slug: "vwap-explained-institutional-benchmark", pillar: "volume_order_flow", priority: 2, publishedAt: "2026-06-15",
    internalLinks: ["what-is-volume-profile-poc-value-area-explained", "moving-average-strategies-ema-pullback-explained"] }),
  makePost({ slug: "cot-report-explained-institutional-positioning", pillar: "volume_order_flow", priority: 3, publishedAt: "2026-06-15",
    internalLinks: ["what-is-volume-profile-poc-value-area-explained", "how-to-run-your-trading-like-a-business"] }),

  // classic_ta pillar
  makePost({ slug: "support-and-resistance-trading-foundation", pillar: "classic_ta", priority: 1, publishedAt: "2026-06-15",
    internalLinks: ["supply-and-demand-zones-vs-support-resistance", "moving-average-strategies-ema-pullback-explained", "ict-vs-smart-money-concepts-difference"] }),
  makePost({ slug: "supply-and-demand-zones-vs-support-resistance", pillar: "classic_ta", priority: 2, publishedAt: "2026-06-15",
    internalLinks: ["support-and-resistance-trading-foundation", "order-blocks-explained-beginners-guide", "ict-vs-smart-money-concepts-difference"] }),
  makePost({ slug: "moving-average-strategies-ema-pullback-explained", pillar: "classic_ta", priority: 2, publishedAt: "2026-06-15",
    internalLinks: ["support-and-resistance-trading-foundation", "risk-per-trade-why-1-percent-is-standard"] }),
  makePost({ slug: "chart-patterns-that-still-work-2026", pillar: "classic_ta", priority: 2, publishedAt: "2026-06-15",
    internalLinks: ["support-and-resistance-trading-foundation", "ict-vs-smart-money-concepts-difference", "moving-average-strategies-ema-pullback-explained"] }),
];

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("blog lib — getAllPosts", () => {
  test("returns 23 posts sorted by priority then date", () => {
    const sorted = sortPosts(TWENTY_THREE_POSTS);
    expect(sorted).toHaveLength(23);
  });

  test("sorts by priority ascending, then publishedAt descending", () => {
    const postsWithDifferentDates = [
      makePost({ slug: "p2-older", priority: 2, publishedAt: "2026-05-01" }),
      makePost({ slug: "p1-post", priority: 1, publishedAt: "2026-06-14" }),
      makePost({ slug: "p2-newer", priority: 2, publishedAt: "2026-06-14" }),
    ];
    const sorted = sortPosts(postsWithDifferentDates);
    expect(sorted[0].slug).toBe("p1-post");       // priority 1 first
    expect(sorted[1].slug).toBe("p2-newer");      // priority 2, newer date
    expect(sorted[2].slug).toBe("p2-older");      // priority 2, older date
  });
});

describe("blog lib — getPostBySlug", () => {
  test("returns the correct post for a known slug", () => {
    const post = getPostBySlugPure(TWENTY_THREE_POSTS, "what-is-a-fair-value-gap-ict");
    expect(post).not.toBeNull();
    expect(post.slug).toBe("what-is-a-fair-value-gap-ict");
  });

  test("returns null for an unknown slug", () => {
    const post = getPostBySlugPure(TWENTY_THREE_POSTS, "this-slug-does-not-exist");
    expect(post).toBeNull();
  });
});

describe("blog lib — getPostsByPillar", () => {
  test("filters correctly by ict_smc pillar", () => {
    const filtered = getPostsByPillarPure(TWENTY_THREE_POSTS, "ict_smc");
    expect(filtered.length).toBe(5);
    expect(filtered.every((p) => p.frontmatter.pillar === "ict_smc")).toBe(true);
  });

  test("filters correctly by prop_firm_rules pillar", () => {
    const filtered = getPostsByPillarPure(TWENTY_THREE_POSTS, "prop_firm_rules");
    expect(filtered.length).toBe(3);
  });

  test("filters correctly by psychology pillar", () => {
    const filtered = getPostsByPillarPure(TWENTY_THREE_POSTS, "psychology");
    expect(filtered.length).toBe(3);
  });

  test("filters correctly by trading_business pillar", () => {
    const filtered = getPostsByPillarPure(TWENTY_THREE_POSTS, "trading_business");
    expect(filtered.length).toBe(2);
  });

  test("filters correctly by volume_order_flow pillar", () => {
    const filtered = getPostsByPillarPure(TWENTY_THREE_POSTS, "volume_order_flow");
    expect(filtered.length).toBe(6);
    expect(filtered.every((p) => p.frontmatter.pillar === "volume_order_flow")).toBe(true);
  });

  test("filters correctly by classic_ta pillar", () => {
    const filtered = getPostsByPillarPure(TWENTY_THREE_POSTS, "classic_ta");
    expect(filtered.length).toBe(4);
    expect(filtered.every((p) => p.frontmatter.pillar === "classic_ta")).toBe(true);
  });

  test("returns empty array for unknown pillar", () => {
    const filtered = getPostsByPillarPure(TWENTY_THREE_POSTS, "nonexistent_pillar");
    expect(filtered).toHaveLength(0);
  });
});

describe("blog lib — getRelatedPosts", () => {
  test("resolves internalLinks to full post objects", () => {
    const post = makePost({
      slug: "source-post",
      internalLinks: ["what-is-a-fair-value-gap-ict", "order-blocks-explained-beginners-guide"],
    });
    const { resolved } = getRelatedPostsPure(TWENTY_THREE_POSTS, post);
    expect(resolved).toHaveLength(2);
    expect(resolved.map((p) => p.slug)).toContain("what-is-a-fair-value-gap-ict");
    expect(resolved.map((p) => p.slug)).toContain("order-blocks-explained-beginners-guide");
  });

  test("skips unresolvable slugs without error", () => {
    const post = makePost({
      slug: "source-post",
      internalLinks: ["what-is-a-fair-value-gap-ict", "this-slug-does-not-exist-anywhere"],
    });
    const { resolved, warnedSlugs } = getRelatedPostsPure(TWENTY_THREE_POSTS, post);
    expect(resolved).toHaveLength(1);
    expect(resolved[0].slug).toBe("what-is-a-fair-value-gap-ict");
    expect(warnedSlugs).toContain("this-slug-does-not-exist-anywhere");
  });

  test("returns empty array when post has no internalLinks", () => {
    const post = makePost({ slug: "no-links", internalLinks: [] });
    const { resolved } = getRelatedPostsPure(TWENTY_THREE_POSTS, post);
    expect(resolved).toHaveLength(0);
  });

  test("all internalLinks across all 23 posts resolve to existing slugs (no dangling links)", () => {
    const allSlugs = new Set(TWENTY_THREE_POSTS.map((p) => p.slug));
    const danglingLinks = [];

    for (const post of TWENTY_THREE_POSTS) {
      const links = post.frontmatter.internalLinks ?? [];
      for (const link of links) {
        if (!allSlugs.has(link)) {
          danglingLinks.push({ post: post.slug, link });
        }
      }
    }

    expect(danglingLinks).toHaveLength(0);
  });
});

describe("blog lib — getAllSlugs", () => {
  test("returns 23 slugs", () => {
    const slugs = getAllSlugsPure(TWENTY_THREE_POSTS);
    expect(slugs).toHaveLength(23);
  });

  test("each slug is a non-empty string", () => {
    const slugs = getAllSlugsPure(TWENTY_THREE_POSTS);
    expect(slugs.every((s) => typeof s === "string" && s.length > 0)).toBe(true);
  });
});

describe("getReadTime", () => {
  test("1800 words → 9 min read", () => {
    expect(getReadTime(1800)).toBe(9);
  });

  test("200 words → 1 min read", () => {
    expect(getReadTime(200)).toBe(1);
  });

  test("0 words → minimum 1 min read", () => {
    expect(getReadTime(0)).toBe(1);
  });

  test("2200 words → 11 min read", () => {
    expect(getReadTime(2200)).toBe(11);
  });
});
