import { QueryClient } from "@tanstack/react-query";

/**
 * TanStack Query Client Configuration
 *
 * Shared query client with sensible defaults for SAPTARA:
 * - 5 minute stale time (data stays fresh for 5 min before refetching)
 * - 1 retry on failure
 * - Refetch on window focus (catches updates when teacher/student switches tabs)
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: 1,
      refetchOnWindowFocus: true,
    },
    mutations: {
      retry: 0,
    },
  },
});
