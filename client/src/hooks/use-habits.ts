import {
  useQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { habitService } from "../services/habit.service";
import type { ToggleHabitPayload } from "../types";
import { studentKeys } from "./use-students";

// ════════════════════════════════════════════
// Habit Query Keys
// ════════════════════════════════════════════

export const habitKeys = {
  all: ["habits"] as const,
  todayMissions: (studentId: number) =>
    ["habits", "today", studentId] as const,
  scores: (studentId: number) => ["habits", "scores", studentId] as const,
};

// ════════════════════════════════════════════
// Query Hooks
// ════════════════════════════════════════════

/**
 * Hook: Get all 7 habits.
 * These rarely change, so we use a long stale time.
 */
export function useHabits() {
  return useQuery({
    queryKey: habitKeys.all,
    queryFn: () => habitService.getAll(),
    staleTime: 30 * 60 * 1000, // 30 minutes — habits are seed data
  });
}

/**
 * Hook: Get today's missions for a student.
 * Shows which habits are completed today.
 */
export function useTodayMissions(studentId: number) {
  return useQuery({
    queryKey: habitKeys.todayMissions(studentId),
    queryFn: () => habitService.getTodayMissions(studentId),
    enabled: !!studentId,
    staleTime: 1 * 60 * 1000, // 1 minute — missions change frequently
  });
}

/**
 * Hook: Get habit scores for a student (radar chart).
 */
export function useHabitScores(studentId: number) {
  return useQuery({
    queryKey: habitKeys.scores(studentId),
    queryFn: () => habitService.getScores(studentId),
    enabled: !!studentId,
  });
}

// ════════════════════════════════════════════
// Mutation Hooks
// ════════════════════════════════════════════

/**
 * Hook: Toggle habit completion for the authenticated student.
 * Invalidates today's missions + student dashboard on success.
 */
export function useToggleHabit(studentId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: ToggleHabitPayload) =>
      habitService.toggleCompletion(payload),
    onSuccess: () => {
      // Refetch today's missions to update completion status
      queryClient.invalidateQueries({
        queryKey: habitKeys.todayMissions(studentId),
      });
      // Refetch student dashboard (XP, coins may have changed)
      queryClient.invalidateQueries({
        queryKey: studentKeys.dashboard(studentId),
      });
      // Refetch student profile
      queryClient.invalidateQueries({
        queryKey: studentKeys.detail(studentId),
      });
      // Refetch habit scores (radar chart may change)
      queryClient.invalidateQueries({
        queryKey: habitKeys.scores(studentId),
      });
    },
  });
}
