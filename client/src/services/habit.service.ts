import { apiFetch, apiStudentFetch } from "../lib/api-client";
import type {
  Habit,
  TodayMission,
  ToggleHabitPayload,
  ToggleHabitResponse,
  HabitScore,
} from "../types";

/**
 * Habit Service
 *
 * Manages the 7 SAPTARA habits and daily completion tracking.
 * - getAll / getTodayMissions / getScores: public
 * - toggleCompletion: requires student JWT auth
 */
export const habitService = {
  /**
   * Get all 7 habits.
   * GET /api/habits
   */
  async getAll(): Promise<Habit[]> {
    return apiFetch<Habit[]>("/api/habits");
  },

  /**
   * Get today's missions for a specific student.
   * GET /api/habits/today/:studentId
   */
  async getTodayMissions(studentId: number): Promise<TodayMission[]> {
    return apiFetch<TodayMission[]>(`/api/habits/today/${studentId}`);
  },

  /**
   * Toggle habit completion for the authenticated student.
   * POST /api/habits/complete  (requires student JWT)
   */
  async toggleCompletion(
    payload: ToggleHabitPayload
  ): Promise<ToggleHabitResponse> {
    return apiStudentFetch<ToggleHabitResponse>("/api/habits/complete", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  /**
   * Get habit scores for a student (radar chart data).
   * GET /api/habits/scores/:studentId
   */
  async getScores(studentId: number): Promise<HabitScore[]> {
    return apiFetch<HabitScore[]>(`/api/habits/scores/${studentId}`);
  },
};
