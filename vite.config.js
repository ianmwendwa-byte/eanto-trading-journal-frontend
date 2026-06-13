import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";

export default defineConfig(({ mode }) => {
  const isSSR = mode === "ssr";

  if (isSSR) {
    return {
      plugins: [react()],
      resolve: {
        // Use browser conditions so react-router-dom, framer-motion, etc.
        // resolve their browser-optimised bundles in the SSR build.
        conditions: ["browser", "module", "import", "default"],
        alias: {
          "@": path.resolve(__dirname, "./src"),
        },
      },
      ssr: {
        // Bundle these instead of leaving them as Node externals so the
        // browser-condition resolution above takes effect for them.
        noExternal: ["react-router-dom", "framer-motion", "react-helmet-async"],
      },
      build: {
        ssr: true,
        rollupOptions: {
          input: path.resolve(__dirname, "src/entry-server.jsx"),
          output: {
            dir: path.resolve(__dirname, "dist/server"),
            format: "esm",
          },
        },
      },
    };
  }

  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    build: {
      outDir: "dist",
    },
    test: {
      globals: true,
      environment: "jsdom",
      setupFiles: ["./src/__tests__/setup.js"],
      css: false,
    },
  };
});
