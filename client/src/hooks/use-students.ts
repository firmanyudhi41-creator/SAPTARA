import {
  useQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { studentService } from "../services/student.service";
import type { CreateStudentPayload } from "../types";
import { classKeys } from "./use-classes";

// ════════════════════════════════════════════
// Student Query Keys
// ════════════════════════════════════════════

export const studentKeys = {
  detail: (id: number) => ["student", id] as const,
  dashboard: (id: number) => ["student", id, "dashboard"] as const,
  weekly: (id: number) => ["student", id, "weekly"] as const,
  compass: (id: number) => ["student", id, "compass"] as const,
  leaderboard: (classId: number) => ["leaderboard", classId] as const,
};

// ════════════════════════════════════════════
// Query Hooks
// ════════════════════════════════════════════

/**
 * Hook: Get student profile by ID.
 */
export function useStudent(id: number) {
  return useQuery({
    queryKey: studentKeys.detail(id),
    queryFn: () => studentService.getById(id),
    enabled: !!id,
  });
}

/**
 * Hook: Get full student dashboard data.
 * Includes ship level, today's missions, streak, etc.
 */
export function useStudentDashboard(id: number) {
  return useQuery({
    queryKey: studentKeys.dashboard(id),
    queryFn: () => studentService.getDashboard(id),
    enabled: !!id,
  });
}

/**
 * Hook: Get student's weekly completion trend.
 */
export function useStudentWeekly(id: number) {
  return useQuery({
    queryKey: studentKeys.weekly(id),
    queryFn: () => studentService.getWeeklyData(id),
    enabled: !!id,
  });
}

/**
 * Hook: Get student's compass / radar chart data.
 */
export function useStudentCompass(id: number) {
  return useQuery({
    queryKey: studentKeys.compass(id),
    queryFn: () => studentService.getCompassData(id),
    enabled: !!id,
  });
}

/**
 * Hook: Get class leaderboard (sorted by XP).
 */
export function useLeaderboard(classId: number) {
  return useQuery({
    queryKey: studentKeys.leaderboard(classId),
    queryFn: () => studentService.getLeaderboard(classId),
    enabled: !!classId,
  });
}

// ════════════════════════════════════════════
// Mutation Hooks
// ════════════════════════════════════════════

/**
 * Hook: Add a student to a class.
 * Invalidates the class students list on success.
 */
export function useCreateStudent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateStudentPayload) =>
      studentService.create(payload),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: classKeys.students(variables.classId),
      });
    },
  });
}

/**
 * Hook: Remove a student.
 * Invalidates all class-related queries on success.
 */
export function useDeleteStudent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => studentService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["classes"] });
    },
    onError: (error: Error) => {
      alert(`Gagal menghapus murid: ${error.message}`);
    },
  });
}
