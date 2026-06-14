// lib/api/achievements.ts — Các API endpoint và types liên quan đến thành tích

import { request } from "./client";

// ── Achievement types (matches BE DTOs) ───────────────────────────────────────

export interface AchievementDto {
  id: string;
  userId: string;
  tutorialId: string;
  tutorialTitle: string;
  tutorialSlug: string;
  photoUrl?: string | null;
  note?: string | null;
  isPublic: boolean;
  createdAt: string;
  updatedAt?: string | null;
}

export interface CreateAchievementRequest {
  tutorialId: string;
  photoUrl?: string | null;
  note?: string | null;
  isPublic?: boolean;
}

export interface UpdateAchievementRequest {
  photoUrl?: string | null;
  note?: string | null;
  isPublic: boolean;
}

export interface PaginatedResult<T> {
  items: T[];
  totalCount: number;
  page: number;
  pageSize: number;
}

// ── Achievements API ──────────────────────────────────────────────────────────

export const achievementsApi = {
  /** GET /api/users/{userId}/achievements — Xem thành tựu của bất kỳ user nào (public) */
  getByUser(
    userId: string,
    page = 1,
    pageSize = 12
  ): Promise<PaginatedResult<AchievementDto>> {
    return request(`/api/users/${userId}/achievements?page=${page}&pageSize=${pageSize}`);
  },

  /** GET /api/achievements/me — Xem thành tựu của chính mình (kể cả private) */
  getMine(
    token: string,
    page = 1,
    pageSize = 12
  ): Promise<PaginatedResult<AchievementDto>> {
    return request(`/api/achievements/me?page=${page}&pageSize=${pageSize}`, { token });
  },

  /** POST /api/achievements — Tạo thành tựu mới */
  create(
    token: string,
    body: CreateAchievementRequest
  ): Promise<AchievementDto> {
    return request<AchievementDto>("/api/achievements", {
      method: "POST",
      body: JSON.stringify(body),
      token,
    });
  },

  /** PUT /api/achievements/{id} — Sửa thành tựu */
  update(
    token: string,
    achievementId: string,
    body: UpdateAchievementRequest
  ): Promise<AchievementDto> {
    return request<AchievementDto>(`/api/achievements/${achievementId}`, {
      method: "PUT",
      body: JSON.stringify(body),
      token,
    });
  },

  /** DELETE /api/achievements/{id} — Xóa thành tựu */
  delete(token: string, achievementId: string): Promise<void> {
    return request<void>(`/api/achievements/${achievementId}`, {
      method: "DELETE",
      token,
    });
  },
};
