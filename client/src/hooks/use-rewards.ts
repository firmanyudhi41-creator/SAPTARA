import {
  useQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { rewardService } from "../services/reward.service";
import type {
  AwardBadgePayload,
  PurchaseAccessoryPayload,
  SendBottleMessagePayload,
} from "../types";
import { studentKeys } from "./use-students";

// ════════════════════════════════════════════
// Reward Query Keys
// ════════════════════════════════════════════

export const rewardKeys = {
  badges: (studentId: number) => ["rewards", "badges", studentId] as const,
  accessories: ["rewards", "accessories"] as const,
  studentAccessories: (studentId: number) =>
    ["rewards", "accessories", studentId] as const,
};

// ════════════════════════════════════════════
// Query Hooks
// ════════════════════════════════════════════

/**
 * Hook: Get all badges earned by a student.
 */
export function useStudentBadges(studentId: number) {
  return useQuery({
    queryKey: rewardKeys.badges(studentId),
    queryFn: () => rewardService.getBadges(studentId),
    enabled: !!studentId,
  });
}

/**
 * Hook: Get all available ship accessories (static catalog).
 */
export function useAccessories() {
  return useQuery({
    queryKey: rewardKeys.accessories,
    queryFn: () => rewardService.getAllAccessories(),
    staleTime: 30 * 60 * 1000, // 30 minutes — catalog rarely changes
  });
}

/**
 * Hook: Get accessories owned by a student.
 */
export function useStudentAccessories(studentId: number) {
  return useQuery({
    queryKey: rewardKeys.studentAccessories(studentId),
    queryFn: () => rewardService.getStudentAccessories(studentId),
    enabled: !!studentId,
  });
}

// ════════════════════════════════════════════
// Mutation Hooks
// ════════════════════════════════════════════

/**
 * Hook: Award a badge to a student (teacher action).
 * Invalidates the student's badges + profile on success.
 */
export function useAwardBadge() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: AwardBadgePayload) =>
      rewardService.awardBadge(payload),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: rewardKeys.badges(variables.studentId),
      });
      queryClient.invalidateQueries({
        queryKey: studentKeys.detail(variables.studentId),
      });
    },
  });
}

/**
 * Hook: Purchase a ship accessory (student action).
 * Invalidates the student's accessories + profile (coins changed).
 */
export function usePurchaseAccessory(studentId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: PurchaseAccessoryPayload) =>
      rewardService.purchaseAccessory(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: rewardKeys.studentAccessories(studentId),
      });
      queryClient.invalidateQueries({
        queryKey: studentKeys.detail(studentId),
      });
      queryClient.invalidateQueries({
        queryKey: studentKeys.dashboard(studentId),
      });
    },
  });
}

/**
 * Hook: Send a bottle message to a student (teacher action).
 */
export function useSendBottleMessage() {
  return useMutation({
    mutationFn: (payload: SendBottleMessagePayload) =>
      rewardService.sendBottleMessage(payload),
  });
}
