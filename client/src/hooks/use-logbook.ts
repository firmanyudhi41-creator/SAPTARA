import {
  useQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { logbookService } from "../services/logbook.service";
import type {
  SubmitLogbookPayload,
  VerifyLogbookPayload,
  BatchVerifyPayload,
} from "../types";
import { studentKeys } from "./use-students";
import { habitKeys } from "./use-habits";

// ════════════════════════════════════════════
// Logbook Query Keys
// ════════════════════════════════════════════

export const logbookKeys = {
  byStudent: (studentId: number) => ["logbook", "student", studentId] as const,
  byClass: (classId: number) => ["logbook", "class", classId] as const,
  pending: (classId: number) => ["logbook", "pending", classId] as const,
};

// ════════════════════════════════════════════
// Query Hooks
// ════════════════════════════════════════════

/**
 * Hook: Get all logbook entries for a student.
 */
export function useStudentLogbook(studentId: number) {
  return useQuery({
    queryKey: logbookKeys.byStudent(studentId),
    queryFn: () => logbookService.getByStudent(studentId),
    enabled: !!studentId,
  });
}

/**
 * Hook: Get all logbook entries in a class (teacher feed).
 */
export function useClassLogbook(classId: number) {
  return useQuery({
    queryKey: logbookKeys.byClass(classId),
    queryFn: () => logbookService.getByClass(classId),
    enabled: !!classId,
  });
}

/**
 * Hook: Get pending-only entries for a class.
 */
export function usePendingLogbook(classId: number) {
  return useQuery({
    queryKey: logbookKeys.pending(classId),
    queryFn: () => logbookService.getPending(classId),
    enabled: !!classId,
    staleTime: 30 * 1000, // 30 seconds — teacher wants fresh pending data
  });
}

// ════════════════════════════════════════════
// Mutation Hooks
// ════════════════════════════════════════════

/**
 * Hook: Submit a new logbook entry (student).
 * Invalidates student logbook + missions on success.
 */
export function useSubmitLogbook(studentId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: SubmitLogbookPayload) =>
      logbookService.submit(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: logbookKeys.byStudent(studentId),
      });
      queryClient.invalidateQueries({
        queryKey: habitKeys.todayMissions(studentId),
      });
      queryClient.invalidateQueries({
        queryKey: studentKeys.dashboard(studentId),
      });
    },
  });
}

/**
 * Hook: Verify/approve a logbook entry (teacher).
 * Invalidates class logbook + pending on success.
 */
export function useVerifyLogbook(classId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      entryId,
      payload,
    }: {
      entryId: number;
      payload: VerifyLogbookPayload;
    }) => logbookService.verify(entryId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: logbookKeys.byClass(classId),
      });
      queryClient.invalidateQueries({
        queryKey: logbookKeys.pending(classId),
      });
    },
  });
}

/**
 * Hook: Reject a logbook entry (teacher).
 * Invalidates class logbook + pending on success.
 */
export function useRejectLogbook(classId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      entryId,
      comment,
    }: {
      entryId: number;
      comment?: string;
    }) => logbookService.reject(entryId, { comment }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: logbookKeys.byClass(classId),
      });
      queryClient.invalidateQueries({
        queryKey: logbookKeys.pending(classId),
      });
    },
  });
}

/**
 * Hook: Batch approve multiple logbook entries (teacher).
 * Invalidates class logbook + pending on success.
 */
export function useBatchVerify(classId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: BatchVerifyPayload) =>
      logbookService.batchVerify(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: logbookKeys.byClass(classId),
      });
      queryClient.invalidateQueries({
        queryKey: logbookKeys.pending(classId),
      });
    },
  });
}
