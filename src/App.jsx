import React from "react";
import ReactDOM from "react-dom/client";
import { RouterProvider } from "react-router-dom";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "sonner";
import { TooltipProvider } from "./components/ui/tooltip";
import { router }       from "./router";
import { queryClient }  from "./lib/queryClient";
import { AuthProvider } from "./components/providers/AuthProvider";
import { ThemeProvider } from "./components/theme-provider";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <ThemeProvider defaultTheme="dark" storageKey="tradecore-ui">
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <AuthProvider>
            <RouterProvider router={router} />
            <Toaster
              position="bottom-right"
              toastOptions={{
                style: {
                  background: "hsl(var(--card))",
                  color:      "hsl(var(--card-foreground))",
                  border:     "1px solid hsl(var(--border))",
                },
              }}
            />
          </AuthProvider>
        </TooltipProvider>
      </QueryClientProvider>
    </ThemeProvider>
  </React.StrictMode>
);
