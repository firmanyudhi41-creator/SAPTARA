import { apiFetch, apiStudentFetch } from "../lib/api-client";
import type {
  StudentBadge,
  AwardBadgePayload,
  ShipAccessory,
  StudentAccessory,
  PurchaseAccessoryPayload,
  PurchaseAccessoryResponse,
  SendBottleMessagePayload,
  LogbookEntry,
} from "../types";

/**
 * Reward Service
 *
 * Manages badges, ship accessories, and bottle messages.
 * - getBadges / getAccessories / getStudentAccessories: public
 * - awardBadge / sendBottleMessage: teacher auth (cookie)
 * - purchaseAccessory: student JWT auth
 */
export const rewardService = {
  /**
   * Get all badges earned by a student.
   * GET /api/rewards/badges/:studentId
   */
  async getBadges(studentId: number): Promise<StudentBadge[]> {
    return apiFetch<StudentBadge[]>(`/api/rewards/badges/${studentId}`);
  },

  /**
   * Award a badge to a student (teacher auth).
   * POST /api/rewards/badges
   */
  async awardBadge(payload: AwardBadgePayload): Promise<StudentBadge> {
    return apiFetch<StudentBadge>("/api/rewards/badges", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  /**
   * Get all available ship accessories.
   * GET /api/rewards/accessories
   */
  async getAllAccessories(): Promise<ShipAccessory[]> {
    return apiFetch<ShipAccessory[]>("/api/rewards/accessories");
  },

  /**
   * Get accessories owned by a student.
   * GET /api/rewards/accessories/:studentId
   */
  async getStudentAccessories(
    studentId: number
  ): Promise<StudentAccessory[]> {
    return apiFetch<StudentAccessory[]>(
      `/api/rewards/accessories/${studentId}`
    );
  },

  /**
   * Purchase a ship accessory with coins (student JWT auth).
   * POST /api/rewards/accessories/purchase
   */
  async purchaseAccessory(
    payload: PurchaseAccessoryPayload
  ): Promise<PurchaseAccessoryResponse> {
    return apiStudentFetch<PurchaseAccessoryResponse>(
      "/api/rewards/accessories/purchase",
      {
        method: "POST",
        body: JSON.stringify(payload),
      }
    );
  },

  /**
   * Send a bottle message to a student (teacher auth).
   * POST /api/rewards/message
   */
  async sendBottleMessage(
    payload: SendBottleMessagePayload
  ): Promise<LogbookEntry> {
    return apiFetch<LogbookEntry>("/api/rewards/message", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },
};
