import {
  useQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { classService } from "../services/class.service";
import type { CreateClassPayload } from "../types";

// ════════════════════════════════════════════
// Class Query Keys
// ════════════════════════════════════════════

export const classKeys = {
  all: ["classes"] as const,
  detail: (id: number) => ["classes", id] as const,
  students: (classId: number) => ["classes", classId, "students"] as const,
};

// ════════════════════════════════════════════
// Query Hooks
// ════════════════════════════════════════════

/**
 * Hook: Get all classes for the authenticated teacher.
 */
export function useClasses() {
  return useQuery({
    queryKey: classKeys.all,
    queryFn: () => classService.getAll(),
  });
}

/**
 * Hook: Get class details by ID.
 */
export function useClass(id: number) {
  return useQuery({
    queryKey: classKeys.detail(id),
    queryFn: () => classService.getById(id),
    enabled: !!id,
  });
}

/**
 * Hook: Get all students in a class.
 */
export function useClassStudents(classId: number) {
  return useQuery({
    queryKey: classKeys.students(classId),
    queryFn: () => classService.getStudents(classId),
    enabled: !!classId,
  });
}

// ════════════════════════════════════════════
// Mutation Hooks
// ════════════════════════════════════════════

/**
 * Hook: Create a new class.
 * Invalidates the classes list on success.
 */
export function useCreateClass() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateClassPayload) => classService.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: classKeys.all });
    },
  });
}

/**
 * Hook: Delete a class.
 * Invalidates the classes list on success.
 */
export function useDeleteClass() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => classService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: classKeys.all });
    },
    onError: (error: Error) => {
      alert(`Gagal menghapus kelas: ${error.message}`);
    },
  });
}
