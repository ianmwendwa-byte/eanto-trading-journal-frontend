import { renderToString } from "react-dom/server";
import { MemoryRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { HelmetProvider } from "react-helmet-async";
import { ThemeProvider } from "./components/theme-provider";
import { LandingPage } from "./pages/landing/LandingPage";

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
          <MemoryRouter initialEntries={[url]}>
            <LandingPage />
          </MemoryRouter>
        </QueryClientProvider>
      </ThemeProvider>
    </HelmetProvider>
  );

  return { html, helmetContext };
}
