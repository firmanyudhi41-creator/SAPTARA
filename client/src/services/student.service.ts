import { apiFetch } from "../lib/api-client";
import type {
  Student,
  CreateStudentPayload,
  StudentDashboard,
  WeeklyData,
  CompassData,
  LeaderboardEntry,
  DeleteResponse,
} from "../types";

/**
 * Student Service
 *
 * Manages student CRUD and data endpoints.
 * - Create/Delete: requires teacher auth (cookie)
 * - Read endpoints: public (no auth required by backend)
 */
export const studentService = {
  /**
   * Add a student to a class (teacher auth).
   * POST /api/students
   */
  async create(payload: CreateStudentPayload): Promise<Student> {
    return apiFetch<Student>("/api/students", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  /**
   * Get student profile by ID.
   * GET /api/students/:id
   */
  async getById(id: number): Promise<Student> {
    return apiFetch<Student>(`/api/students/${id}`);
  },

  /**
   * Get full student dashboard data.
   * GET /api/students/:id/dashboard
   */
  async getDashboard(id: number): Promise<StudentDashboard> {
    return apiFetch<StudentDashboard>(`/api/students/${id}/dashboard`);
  },

  /**
   * Get student's weekly completion trend.
   * GET /api/students/:id/weekly
   */
  async getWeeklyData(id: number): Promise<WeeklyData[]> {
    return apiFetch<WeeklyData[]>(`/api/students/${id}/weekly`);
  },

  /**
   * Get student's radar chart / compass data.
   * GET /api/students/:id/compass
   */
  async getCompassData(id: number): Promise<CompassData[]> {
    return apiFetch<CompassData[]>(`/api/students/${id}/compass`);
  },

  /**
   * Get class leaderboard.
   * GET /api/students/leaderboard/:classId
   */
  async getLeaderboard(classId: number): Promise<LeaderboardEntry[]> {
    return apiFetch<LeaderboardEntry[]>(
      `/api/students/leaderboard/${classId}`
    );
  },

  /**
   * Remove a student (teacher auth).
   * DELETE /api/students/:id
   */
  async delete(id: number): Promise<DeleteResponse> {
    return apiFetch<DeleteResponse>(`/api/students/${id}`, {
      method: "DELETE",
    });
  },
};
