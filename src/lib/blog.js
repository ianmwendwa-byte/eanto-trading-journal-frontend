/**
 * Blog content loader utilities.
 *
 * Uses Vite's import.meta.glob with eager: true and query: '?raw' to read
 * all markdown files at build time. js-yaml parses the YAML frontmatter after
 * a manual split on the --- delimiters — gray-matter is not used here because
 * it depends on Node.js Buffer, which is not available in the browser bundle.
 *
 * All functions are synchronous — the glob is resolved at bundle time.
 */

import yaml from "js-yaml";

/**
 * Parses YAML frontmatter from a raw markdown string.
 * Splits on the first pair of `---` delimiters; returns { data, content }.
 * Browser-safe: no Buffer dependency.
 *
 * @param {string} raw
 * @returns {{ data: object, content: string }}
 */
function parseFrontmatter(raw) {
  const DELIM = "---";
  const start = raw.indexOf(DELIM);
  if (start === -1) return { data: {}, content: raw };

  const end = raw.indexOf(DELIM, start + DELIM.length);
  if (end === -1) return { data: {}, content: raw };

  const yamlBlock = raw.slice(start + DELIM.length, end).trim();
  const content = raw.slice(end + DELIM.length).trim();

  try {
    // JSON_SCHEMA restricts parsing to JSON-compatible types only
    // (strings, numbers, booleans, null, arrays, objects) — no arbitrary
    // type constructors can execute, which is the safe default for untrusted input.
    const data = yaml.load(yamlBlock, { schema: yaml.JSON_SCHEMA }) ?? {};
    return { data, content };
  } catch (e) {
    console.error("[blog] YAML parse error:", e.message);
    return { data: {}, content };
  }
}

// ---------------------------------------------------------------------------
// Raw file import — Vite resolves this glob at build time.
// The result is an object: { "/src/content/blog/slug.md": "raw file string" }
// ---------------------------------------------------------------------------

const rawFiles = import.meta.glob("/src/content/blog/*.md", {
  eager: true,
  query: "?raw",
  import: "default",
});

// ---------------------------------------------------------------------------
// Internal: parse all posts once
// ---------------------------------------------------------------------------

function parseAllPosts() {
  return Object.entries(rawFiles).map(([filePath, raw]) => {
    // Extract slug from filename: /src/content/blog/my-slug.md → my-slug
    const fileName = filePath.split("/").pop(); // "my-slug.md"
    const fileSlug = fileName.replace(/\.md$/, "");

    const { data: frontmatter, content } = parseFrontmatter(raw);

    // Use the frontmatter slug if present, otherwise fall back to filename
    const slug = frontmatter.slug || fileSlug;

    return { frontmatter, content, slug };
  });
}

// Parse once at module load (eager glob = synchronous)
const _allPosts = parseAllPosts();

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Returns all posts sorted by priority ascending, then publishedAt descending.
 * @returns {{ frontmatter: object, content: string, slug: string }[]}
 */
export function getAllPosts() {
  return [..._allPosts].sort((a, b) => {
    const priorityDiff = (a.frontmatter.priority ?? 99) - (b.frontmatter.priority ?? 99);
    if (priorityDiff !== 0) return priorityDiff;

    // Same priority — sort by publishedAt descending (newest first)
    const dateA = new Date(a.frontmatter.publishedAt ?? 0).getTime();
    const dateB = new Date(b.frontmatter.publishedAt ?? 0).getTime();
    return dateB - dateA;
  });
}

/**
 * Returns a single post by slug, or null if not found.
 * @param {string} slug
 * @returns {{ frontmatter: object, content: string, slug: string } | null}
 */
export function getPostBySlug(slug) {
  return _allPosts.find((p) => p.slug === slug) ?? null;
}

/**
 * Returns posts filtered by pillar ID.
 * @param {string} pillarId  e.g. "ict_smc"
 * @returns {{ frontmatter: object, content: string, slug: string }[]}
 */
export function getPostsByPillar(pillarId) {
  return getAllPosts().filter((p) => p.frontmatter.pillar === pillarId);
}

/**
 * Resolves internalLinks slugs from a post's frontmatter to full post objects.
 * Silently skips any slug that does not have a corresponding file.
 *
 * @param {{ frontmatter: object, content: string, slug: string }} post
 * @returns {{ frontmatter: object, content: string, slug: string }[]}
 */
export function getRelatedPosts(post) {
  const links = post.frontmatter.internalLinks ?? [];
  const resolved = [];

  for (const linkedSlug of links) {
    const found = getPostBySlug(linkedSlug);
    if (found) {
      resolved.push(found);
    } else {
      // Gracefully log missing slugs (backlog topics not yet written)
      if (typeof console !== "undefined") {
        console.warn(
          `[blog] Related post not found for slug "${linkedSlug}" referenced in "${post.slug}"`
        );
      }
    }
  }

  return resolved;
}

/**
 * Returns an array of all post slugs.
 * Used by prerender.js to enumerate blog routes for SSG.
 * @returns {string[]}
 */
export function getAllSlugs() {
  return _allPosts.map((p) => p.slug);
}

/**
 * Derives a reading time estimate from estimatedWordCount.
 * Assumes 200 wpm. Returns a rounded integer (minimum 1).
 * @param {number} wordCount
 * @returns {number}  minutes
 */
export function getReadTime(wordCount) {
  return Math.max(1, Math.round((wordCount ?? 0) / 200));
}

/**
 * Returns a short excerpt from a post.
 * Uses frontmatter.excerpt if present, otherwise truncates the first
 * non-empty non-heading line of the markdown body to 160 chars.
 * @param {{ frontmatter: object, content: string }} post
 * @returns {string}
 */
export function getExcerpt(post) {
  if (post.frontmatter.excerpt) return post.frontmatter.excerpt;

  // Find first paragraph line (not a heading, not empty, not a draft marker)
  const lines = post.content.split("\n");
  for (const line of lines) {
    const trimmed = line.trim();
    if (
      trimmed.length > 20 &&
      !trimmed.startsWith("#") &&
      !trimmed.startsWith("*[Draft") &&
      !trimmed.startsWith("---")
    ) {
      return trimmed.slice(0, 160) + (trimmed.length > 160 ? "…" : "");
    }
  }

  return "";
}
