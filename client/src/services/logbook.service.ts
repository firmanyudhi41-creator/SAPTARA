import { apiFetch, apiStudentFetch } from "../lib/api-client";
import type {
  LogbookEntry,
  SubmitLogbookPayload,
  VerifyLogbookPayload,
  BatchVerifyPayload,
  BatchVerifyResponse,
} from "../types";

/**
 * Logbook Service
 *
 * Manages logbook (photo verification) entries.
 * - submit: student JWT auth + multipart form data
 * - getByStudent: public
 * - getByClass / getPending / verify / reject / batchVerify: teacher auth (cookie)
 */
export const logbookService = {
  /**
   * Submit a new logbook entry with optional photo upload.
   * POST /api/logbook (multipart/form-data, student JWT)
   */
  async submit(payload: SubmitLogbookPayload): Promise<LogbookEntry> {
    const formData = new FormData();
    formData.append("habitId", String(payload.habitId));
    formData.append("caption", payload.caption);
    if (payload.photo) {
      formData.append("photo", payload.photo);
    }

    return apiStudentFetch<LogbookEntry>("/api/logbook", {
      method: "POST",
      body: formData,
    });
  },

  /**
   * Get all logbook entries for a student.
   * GET /api/logbook/student/:studentId
   */
  async getByStudent(studentId: number): Promise<LogbookEntry[]> {
    return apiFetch<LogbookEntry[]>(`/api/logbook/student/${studentId}`);
  },

  /**
   * Get all logbook entries in a class (teacher feed).
   * GET /api/logbook/class/:classId (teacher auth)
   */
  async getByClass(classId: number): Promise<LogbookEntry[]> {
    return apiFetch<LogbookEntry[]>(`/api/logbook/class/${classId}`);
  },

  /**
   * Get pending-only entries for a class.
   * GET /api/logbook/pending/:classId (teacher auth)
   */
  async getPending(classId: number): Promise<LogbookEntry[]> {
    return apiFetch<LogbookEntry[]>(`/api/logbook/pending/${classId}`);
  },

  /**
   * Approve/verify a logbook entry.
   * PATCH /api/logbook/:id/verify (teacher auth)
   */
  async verify(
    entryId: number,
    payload: VerifyLogbookPayload
  ): Promise<LogbookEntry> {
    return apiFetch<LogbookEntry>(`/api/logbook/${entryId}/verify`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    });
  },

  /**
   * Reject a logbook entry.
   * PATCH /api/logbook/:id/reject (teacher auth)
   */
  async reject(
    entryId: number,
    payload: { comment?: string }
  ): Promise<LogbookEntry> {
    return apiFetch<LogbookEntry>(`/api/logbook/${entryId}/reject`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    });
  },

  /**
   * Batch approve multiple logbook entries.
   * POST /api/logbook/batch-verify (teacher auth)
   */
  async batchVerify(
    payload: BatchVerifyPayload
  ): Promise<BatchVerifyResponse> {
    return apiFetch<BatchVerifyResponse>("/api/logbook/batch-verify", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },
};
