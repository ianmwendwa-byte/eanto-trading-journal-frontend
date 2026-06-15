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

// ── Route list ────────────────────────────────────────────────────────────────

const STATIC_ROUTES = ["/"];

const blogSlugs = getBlogSlugs();
const PILLAR_IDS = getPillarIds();
const blogRoutes = [
  "/blog",
  ...PILLAR_IDS.map((id) => `/blog/category/${id}`),
  ...blogSlugs.map((slug) => `/blog/${slug}`),
];

const ROUTES = [...STATIC_ROUTES, ...blogRoutes];

// ── Prerender ─────────────────────────────────────────────────────────────────

async function prerender() {
  console.log("🔄 Starting prerender...");
  console.log(`   Static routes: ${STATIC_ROUTES.length}`);
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
      const { html: appHtml } = render(url);

      const html = template.replace(
        '<div id="root"></div>',
        `<div id="root">${appHtml}</div>`
      );

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

  console.log("✅ Prerender complete");
}

prerender().catch((err) => {
  console.error("Prerender script failed:", err);
  process.exit(1);
});
