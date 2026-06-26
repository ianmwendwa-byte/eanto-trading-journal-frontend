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
      chunkSizeWarningLimit: 600,
      rollupOptions: {
        output: {
          manualChunks: (id) => {
            if (id.includes("node_modules/react/") ||
                id.includes("node_modules/react-dom/") ||
                id.includes("node_modules/react-router")) {
              return "vendor-react";
            }
            if (id.includes("node_modules/framer-motion")) {
              return "vendor-motion";
            }
            if (id.includes("node_modules/firebase") ||
                id.includes("node_modules/@firebase")) {
              return "vendor-firebase";
            }
            if (id.includes("node_modules/@tanstack")) {
              return "vendor-query";
            }
            if (id.includes("node_modules/radix-ui") ||
                id.includes("node_modules/@radix-ui")) {
              return "vendor-radix";
            }
            if (id.includes("node_modules/recharts")) {
              return "vendor-charts";
            }
            if (id.includes("node_modules/lightweight-charts")) {
              return "vendor-tv-charts";
            }
            if (id.includes("node_modules/lucide-react")) {
              return "vendor-icons";
            }
            if (id.includes("node_modules/zustand")) {
              return "vendor-state";
            }
            if (id.includes("node_modules/axios")) {
              return "vendor-http";
            }
            if (id.includes("node_modules/zod")) {
              return "vendor-validation";
            }
            if (id.includes("node_modules/@dnd-kit")) {
              return "vendor-dnd";
            }
            if (id.includes("node_modules/date-fns")) {
              return "vendor-dates";
            }
            if (id.includes("node_modules")) {
              return "vendor-misc";
            }
          },
        },
      },
    },
    test: {
      globals: true,
      environment: "jsdom",
      setupFiles: ["./src/__tests__/setup.js"],
      css: false,
    },
  };
});
