import { apiFetch } from "../lib/api-client";
import type { Class, CreateClassPayload, Student, DeleteResponse } from "../types";

/**
 * Class Service
 *
 * Manages class CRUD operations (teacher-authenticated).
 * All endpoints require a valid Better Auth session cookie.
 */
export const classService = {
  /**
   * Create a new class.
   * POST /api/classes
   */
  async create(payload: CreateClassPayload): Promise<Class> {
    return apiFetch<Class>("/api/classes", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  /**
   * Get all classes for the authenticated teacher.
   * GET /api/classes
   */
  async getAll(): Promise<Class[]> {
    return apiFetch<Class[]>("/api/classes");
  },

  /**
   * Get class details by ID.
   * GET /api/classes/:id
   */
  async getById(id: number): Promise<Class> {
    return apiFetch<Class>(`/api/classes/${id}`);
  },

  /**
   * Get all students in a class.
   * GET /api/classes/:id/students
   */
  async getStudents(classId: number): Promise<Student[]> {
    return apiFetch<Student[]>(`/api/classes/${classId}/students`);
  },

  /**
   * Delete a class.
   * DELETE /api/classes/:id
   */
  async delete(id: number): Promise<DeleteResponse> {
    return apiFetch<DeleteResponse>(`/api/classes/${id}`, {
      method: "DELETE",
    });
  },
};
