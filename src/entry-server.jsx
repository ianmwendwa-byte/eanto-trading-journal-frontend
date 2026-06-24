import { renderToString } from "react-dom/server";
import { StaticRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { HelmetProvider } from "react-helmet-async";
import { ThemeProvider } from "./components/theme-provider";
import { PublicRoutes } from "./PublicRoutes";

export function render(url) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        refetchOnWindowFocus: false,
        staleTime: Infinity,
      },
    },
  });

  const helmetContext = {};

  const html = renderToString(
    <HelmetProvider context={helmetContext}>
      <ThemeProvider defaultTheme="dark" storageKey="kraviq-ui">
        <QueryClientProvider client={queryClient}>
          <StaticRouter location={url}>
            <PublicRoutes />
          </StaticRouter>
        </QueryClientProvider>
      </ThemeProvider>
    </HelmetProvider>
  );

  return { html, helmetContext };
}
