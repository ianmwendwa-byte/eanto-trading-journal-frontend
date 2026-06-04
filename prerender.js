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

// ── Prerender ─────────────────────────────────────────────────────────────────

const ROUTES = ["/"];

async function prerender() {
  console.log("🔄 Starting prerender...");

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

      const outputPath = path.resolve(__dirname, "dist/index.html");
      fs.writeFileSync(outputPath, html, "utf-8");

      console.log(`  ✅ Written: ${outputPath}`);
    } catch (err) {
      console.error(`  ❌ Failed to render ${url}:`, err.message);
      if (err.stack) console.error(err.stack);
      process.exit(1);
    }
  }

  console.log("✅ Prerender complete");
}

prerender().catch((err) => {
  console.error("Prerender script failed:", err);
  process.exit(1);
});
