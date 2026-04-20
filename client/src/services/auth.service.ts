import { apiFetch } from "../lib/api-client";
import type { Teacher, StudentLoginResponse } from "../types";
import {
  setStudentToken,
  setStudentInfo,
  removeStudentToken,
  removeStudentInfo,
} from "../lib/api-client";

/**
 * Auth Service
 *
 * Handles:
 * - Teacher profile creation (after Better Auth sign-up)
 * - Student login (name + classCode → JWT)
 * - Student logout (clear localStorage)
 *
 * Note: Teacher sign-up/sign-in/sign-out are handled directly
 * by Better Auth client (see lib/auth-client.ts).
 */
export const authService = {
  /**
   * Create or retrieve teacher profile after Better Auth registration.
   * POST /api/auth/teacher/profile
   */
  async createTeacherProfile(displayName: string): Promise<Teacher> {
    return apiFetch<Teacher>("/api/auth/teacher/profile", {
      method: "POST",
      body: JSON.stringify({ displayName }),
    });
  },

  /**
   * Student login via name + class code.
   * Returns a JWT token + student info.
   * POST /api/auth/student/login
   */
  async studentLogin(
    name: string,
    classCode: string
  ): Promise<StudentLoginResponse> {
    const result = await apiFetch<StudentLoginResponse>(
      "/api/auth/student/login",
      {
        method: "POST",
        body: JSON.stringify({ name, classCode }),
      }
    );

    // Store token & student info in localStorage
    setStudentToken(result.token);
    setStudentInfo(result.student);

    return result;
  },

  /**
   * Student logout — clears the JWT token and student info from localStorage.
   */
  studentLogout(): void {
    removeStudentToken();
    removeStudentInfo();
  },
};
