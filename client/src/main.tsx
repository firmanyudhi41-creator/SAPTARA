import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { queryClient } from "./lib/query-client";
import { App } from "./App";

// Import all CSS (same order as original index.html)
import "./styles/variables.css";
import "./styles/base.css";
import "./styles/animations.css";
import "./styles/components.css";
import "./styles/student-pages.css";
import "./styles/teacher-pages.css";
import "./styles/responsive.css";
import "./styles/react-app.css";

/**
 * Application Entry Point
 *
 * Wraps the app with:
 * - React StrictMode for development checks
 * - QueryClientProvider for TanStack Query
 * - ReactQueryDevtools for debugging data fetching
 */
createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  </StrictMode>
);
