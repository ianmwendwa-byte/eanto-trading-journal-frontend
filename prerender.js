import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// ── Browser API polyfills ─────────────────────────────────────────────────────
// Only polyfill APIs that are read during render WITHOUT checking typeof window.
// Do NOT set globalThis.window — framer-motion uses `typeof window === "undefined"`
// to detect SSR mode and skip all DOM projection/animation setup.
// Setting window here would fool it into running browser-only code.

if (typeof globalThis.localStorage === "undefined") {
  globalThis.localStorage = {
    getItem: () => null,
    setItem: () => {},
    removeItem: () => {},
    clear: () => {},
    length: 0,
    key: () => null,
  };
}

if (typeof globalThis.sessionStorage === "undefined") {
  globalThis.sessionStorage = globalThis.localStorage;
}

// ── Blog route enumeration (build-time) ──────────────────────────────────────
// Read all markdown files from src/content/blog/ and derive slugs and pillar
// IDs from filenames and frontmatter.
// This mirrors the getAllSlugs() logic in src/lib/blog.js but runs in Node.js
// (not Vite) so we use fs.readdirSync rather than import.meta.glob.
// IMPORTANT: PILLAR_IDS is derived from frontmatter — never hardcode it here,
// so adding new pillars to FRONTEND.md and creating new stub files automatically
// produces the correct category routes without any code change.

const BLOG_CONTENT_DIR = path.resolve(__dirname, "src/content/blog");

function getBlogSlugs() {
  try {
    const files = fs.readdirSync(BLOG_CONTENT_DIR);
    return files
      .filter((f) => f.endsWith(".md"))
      .map((f) => f.replace(/\.md$/, ""));
  } catch {
    console.warn("⚠️  Could not read blog content directory — skipping blog routes.");
    return [];
  }
}

/**
 * Derives unique pillar IDs from the frontmatter of all markdown files.
 * Reads each file, extracts the `pillar:` line from the YAML frontmatter block,
 * and deduplicates. Falls back to an empty array if no files are readable.
 */
function getPillarIds() {
  try {
    const files = fs.readdirSync(BLOG_CONTENT_DIR).filter((f) => f.endsWith(".md"));
    const pillarSet = new Set();
    for (const file of files) {
      const raw = fs.readFileSync(path.join(BLOG_CONTENT_DIR, file), "utf-8");
      // Extract the first `pillar: <value>` line from the frontmatter block
      const match = raw.match(/^pillar:\s*"?([^"\n]+)"?\s*$/m);
      if (match) {
        pillarSet.add(match[1].trim());
      }
    }
    return [...pillarSet];
  } catch {
    console.warn("⚠️  Could not derive pillar IDs from blog content — skipping category routes.");
    return [];
  }
}

/**
 * Maps blog slug -> most recent date (updatedAt falling back to publishedAt)
 * from frontmatter, for sitemap <lastmod> values.
 */
function getBlogDates() {
  const dates = {};
  try {
    const files = fs.readdirSync(BLOG_CONTENT_DIR).filter((f) => f.endsWith(".md"));
    for (const file of files) {
      const raw = fs.readFileSync(path.join(BLOG_CONTENT_DIR, file), "utf-8");
      const updated = raw.match(/^updatedAt:\s*"?([^"\n]+)"?\s*$/m);
      const published = raw.match(/^publishedAt:\s*"?([^"\n]+)"?\s*$/m);
      const slug = file.replace(/\.md$/, "");
      const date = (updated && updated[1]) || (published && published[1]);
      if (date) dates[slug] = date.trim();
    }
  } catch {
    // Fine to fall back to today's date for every blog route.
  }
  return dates;
}

// ── Route list ────────────────────────────────────────────────────────────────

const STATIC_ROUTES = [
  "/",
  "/about",
  "/contact",
  "/community",
  "/privacy",
  "/terms",
  "/cookies",
  "/war-account",
  "/ea-sync",
  "/business-score",
  "/features/trade-tracking",
  "/features/financial-ledger",
  "/features/prop-firm-compliance",
  "/features/risk-calculators",
  "/features/backtesting",
  "/features/strategy",
];

const blogSlugs = getBlogSlugs();
const PILLAR_IDS = getPillarIds();
const blogRoutes = [
  "/blog",
  ...PILLAR_IDS.map((id) => `/blog/category/${id}`),
  ...blogSlugs.map((slug) => `/blog/${slug}`),
];

const ROUTES = [...STATIC_ROUTES, ...blogRoutes];

// ── Sitemap ───────────────────────────────────────────────────────────────────
// public/sitemap.xml only ever listed 3 URLs (/, /login, /register) — every
// marketing, feature, and blog page was invisible to crawlers via the sitemap.
// Generate it here from the same ROUTES list that drives prerendering, so the
// two can never drift apart again.

const SITEMAP_PRIORITY = {
  "/": "1.0",
  "/blog": "0.8",
};

function priorityFor(url) {
  if (SITEMAP_PRIORITY[url]) return SITEMAP_PRIORITY[url];
  if (url.startsWith("/features/") || ["/business-score", "/ea-sync", "/war-account"].includes(url)) return "0.8";
  if (url.startsWith("/blog/")) return "0.6";
  return "0.5";
}

function changefreqFor(url) {
  if (url === "/") return "weekly";
  if (url.startsWith("/blog")) return "monthly";
  return "monthly";
}

function generateSitemap(blogDates) {
  const today = new Date().toISOString().slice(0, 10);
  const urls = ROUTES.map((url) => {
    const slug = url.startsWith("/blog/") ? url.replace("/blog/", "") : null;
    const lastmod = (slug && blogDates[slug]) || today;
    return `  <url>
    <loc>https://kraviq.app${url}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>${changefreqFor(url)}</changefreq>
    <priority>${priorityFor(url)}</priority>
  </url>`;
  }).join("\n\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">

${urls}

</urlset>
`;

  const outPath = path.resolve(__dirname, "dist/sitemap.xml");
  fs.writeFileSync(outPath, xml, "utf-8");
  console.log(`  ✅ Sitemap written: ${outPath} (${ROUTES.length} URLs)`);
}

// ── Prerender ─────────────────────────────────────────────────────────────────

async function prerender() {
  console.log("🔄 Starting prerender...");
  console.log(`   Static routes: ${STATIC_ROUTES.length} (/, /about, /contact, /community, /privacy, /terms, /cookies, /war-account, /ea-sync, /business-score, /features/trade-tracking, /features/financial-ledger, /features/prop-firm-compliance, /features/risk-calculators, /features/backtesting, /features/strategy)`);
  console.log(`   Blog routes:   ${blogRoutes.length} (${blogSlugs.length} posts + index + ${PILLAR_IDS.length} categories)`);

  const templatePath = path.resolve(__dirname, "dist/index.html");
  const template = fs.readFileSync(templatePath, "utf-8");

  // On Windows, dynamic import() requires a file:// URL — not a raw path.
  const serverEntry = pathToFileURL(
    path.resolve(__dirname, "dist/server/entry-server.js")
  ).href;

  const { render } = await import(serverEntry);

  for (const url of ROUTES) {
    console.log(`  Rendering: ${url}`);

    try {
      const { html: rawAppHtml } = render(url);

      // React 19 hoists <title>/<meta>/<link> rendered inside <Helmet> (or any
      // component) directly into the SSR output as a literal prefix on the
      // string returned by renderToString — there is no real <head> element
      // in the tree we render (just <StaticRouter><PublicRoutes /></...>), so
      // react-helmet-async's `helmetContext.helmet` API (which targets older
      // React versions without native head-hoisting) never populates. See
      // https://github.com/staylor/react-helmet-async — the "React 19 SSR
      // note" in its README documents this exact behavior change.
      //
      // <script> tags are NOT hoisted this way — they stay exactly where the
      // <Helmet> component sits in the render tree (e.g. inside <main>),
      // which is harmless: Google and other crawlers parse JSON-LD anywhere
      // in the document, not just inside <head>.
      //
      // So: strip the hoisted title/meta/link prefix off the front of
      // appHtml, move it into the static template's <head> (replacing the
      // homepage's own static title/canonical/OG/Twitter tags so there is
      // exactly one copy of each), and leave the JSON-LD <script> tags inline
      // in the body exactly where React placed them.
      const headTagPrefixMatch = rawAppHtml.match(
        /^((?:<title>[\s\S]*?<\/title>|<meta[^>]*\/?>|<link[^>]*\/?>)\s*)+/
      );
      const headTagPrefix = headTagPrefixMatch ? headTagPrefixMatch[0] : "";
      const appHtml = rawAppHtml.slice(headTagPrefix.length);

      let html = template.replace(
        '<div id="root"></div>',
        `<div id="root">${appHtml}</div>`
      );

      if (headTagPrefix.trim()) {
        html = html
          .replace(/<title>[\s\S]*?<\/title>\s*\n?/, "")
          .replace(/<link rel="canonical"[\s\S]*?\/>\s*\n?/, "")
          .replace(/<meta\s+name="description"[\s\S]*?\/>\s*\n?/, "")
          .replace(/<meta\s+property="og:[\s\S]*?\/>\s*\n?/g, "")
          .replace(/<meta\s+name="twitter:[\s\S]*?\/>\s*\n?/g, "");

        html = html.replace("</head>", `    ${headTagPrefix}\n  </head>`);
      }

      // Determine output file path
      // "/" → dist/index.html
      // "/blog" → dist/blog/index.html
      // "/blog/my-slug" → dist/blog/my-slug/index.html
      let outputPath;
      if (url === "/") {
        outputPath = path.resolve(__dirname, "dist/index.html");
      } else {
        const segments = url.replace(/^\//, "").split("/");
        const dir = path.resolve(__dirname, "dist", ...segments);
        fs.mkdirSync(dir, { recursive: true });
        outputPath = path.join(dir, "index.html");
      }

      fs.writeFileSync(outputPath, html, "utf-8");
      console.log(`  ✅ Written: ${outputPath}`);
    } catch (err) {
      console.error(`  ❌ Failed to render ${url}:`, err.message);
      if (err.stack) console.error(err.stack);
      // Don't exit — skip individual blog post failures so other routes still render
      if (url === "/") {
        process.exit(1);
      }
    }
  }

  generateSitemap(getBlogDates());

  console.log("✅ Prerender complete");
}

prerender().catch((err) => {
  console.error("Prerender script failed:", err);
  process.exit(1);
});
