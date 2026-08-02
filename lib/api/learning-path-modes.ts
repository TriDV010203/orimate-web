// lib/api/learning-path-modes.ts — Chế độ lộ trình (Cơ bản/Nâng cao/...) + bài test mở khoá
//
// Mỗi LearningPath thuộc 1 "chế độ" (LearningPathMode), sắp theo SortOrder. Chế độ đầu tiên
// luôn mở. Mở chế độ kế tiếp cần: (1) đã hoàn thành ≥1 lộ trình ở chế độ liền trước, và
// (2) được Admin/Manager duyệt 1 bài nộp ảnh cho bài test do admin chỉ định cho chế độ đó.
// Bài nộp test hoàn toàn tách biệt khỏi hệ Achievement (achievements.ts).

import { request } from "./client";
import type { PagedResult } from "./tutorials";

export type ModeUnlockSubmissionStatusValue = "None" | "Pending" | "Approved" | "Rejected";

export interface LearningPathModeUnlockTestStatusDto {
  tutorialId: string;
  tutorialTitle: string;
  tutorialSlug: string;
  tutorialCoverImageUrl?: string | null;
  instructions?: string | null;
  mySubmissionStatus: ModeUnlockSubmissionStatusValue;
  myReviewNote?: string | null;
}

/**
 * GET /api/learning-path-modes — 1 tab trên trang /lo-trinh.
 * Mở khoá 1 chế độ (trừ chế độ đầu) chỉ cần bài test của CHÍNH chế độ đó được duyệt —
 * không bắt buộc phải hoàn thành lộ trình ở chế độ thấp hơn trước (cho phép "nhảy cóc").
 */
export interface LearningPathModeDto {
  id: string;
  name: string;
  description?: string | null;
  sortOrder: number;
  isEntryMode: boolean;
  isUnlocked: boolean;
  unlockTest?: LearningPathModeUnlockTestStatusDto | null;
}

/** GET /api/learning-path-modes/admin/all */
export interface LearningPathModeAdminDto {
  id: string;
  name: string;
  description?: string | null;
  sortOrder: number;
  isActive: boolean;
  pathCount: number;
  unlockTestTutorialId?: string | null;
  unlockTestTutorialTitle?: string | null;
  unlockTestInstructions?: string | null;
  createdAt: string;
  updatedAt?: string | null;
}

export interface ModeUnlockSubmissionDto {
  id: string;
  userId: string;
  userDisplayName: string;
  userAvatarUrl?: string | null;
  learningPathModeId: string;
  learningPathModeName: string;
  tutorialId: string;
  tutorialTitle: string;
  photoUrl: string;
  note?: string | null;
  status: "Pending" | "Approved" | "Rejected";
  reviewNote?: string | null;
  createdAt: string;
  reviewedAt?: string | null;
}

export interface CreateLearningPathModeRequest {
  name: string;
  description?: string | null;
  sortOrder: number;
}

export interface UpdateLearningPathModeRequest extends CreateLearningPathModeRequest {
  isActive: boolean;
}

export interface UpsertModeUnlockTestRequest {
  tutorialId: string;
  instructions?: string | null;
}

export interface SubmitModeUnlockTestRequest {
  photoUrl: string;
  note?: string | null;
}

export const learningPathModesApi = {
  // ── Public ───────────────────────────────────────────────────────────────

  /** GET /api/learning-path-modes — token tuỳ chọn: có token thì kèm trạng thái mở khoá/bài nộp của chính mình */
  getModes(token?: string): Promise<LearningPathModeDto[]> {
    return request<LearningPathModeDto[]>("/api/learning-path-modes", token ? { token } : undefined);
  },

  /** POST /api/learning-path-modes/{modeId}/unlock-test/submissions — Nộp ảnh bài test */
  submitUnlockTest(
    token: string,
    modeId: string,
    body: SubmitModeUnlockTestRequest
  ): Promise<ModeUnlockSubmissionDto> {
    return request<ModeUnlockSubmissionDto>(`/api/learning-path-modes/${modeId}/unlock-test/submissions`, {
      method: "POST",
      body: JSON.stringify(body),
      token,
    });
  },

  // ── Admin management (Admin,Manager) ────────────────────────────────────

  /** GET /api/learning-path-modes/admin/all */
  getAllAdmin(token: string): Promise<LearningPathModeAdminDto[]> {
    return request<LearningPathModeAdminDto[]>("/api/learning-path-modes/admin/all", { token });
  },

  /** POST /api/learning-path-modes — Tạo chế độ mới */
  create(token: string, body: CreateLearningPathModeRequest): Promise<LearningPathModeAdminDto> {
    return request<LearningPathModeAdminDto>("/api/learning-path-modes", {
      method: "POST",
      body: JSON.stringify(body),
      token,
    });
  },

  /** PUT /api/learning-path-modes/{id} — Sửa tên/mô tả/thứ tự/trạng thái hoạt động */
  update(token: string, id: string, body: UpdateLearningPathModeRequest): Promise<LearningPathModeAdminDto> {
    return request<LearningPathModeAdminDto>(`/api/learning-path-modes/${id}`, {
      method: "PUT",
      body: JSON.stringify(body),
      token,
    });
  },

  /** PUT /api/learning-path-modes/{modeId}/unlock-test — Gán/đổi hướng dẫn dùng làm đề test */
  upsertUnlockTest(token: string, modeId: string, body: UpsertModeUnlockTestRequest): Promise<{ message: string }> {
    return request<{ message: string }>(`/api/learning-path-modes/${modeId}/unlock-test`, {
      method: "PUT",
      body: JSON.stringify(body),
      token,
    });
  },

  /** GET /api/learning-path-modes/admin/unlock-test-submissions — Hàng đợi duyệt */
  getSubmissionsAdmin(
    token: string,
    params?: { modeId?: string; status?: string; page?: number; pageSize?: number }
  ): Promise<PagedResult<ModeUnlockSubmissionDto>> {
    const q = new URLSearchParams();
    if (params?.modeId) q.set("modeId", params.modeId);
    if (params?.status) q.set("status", params.status);
    if (params?.page) q.set("page", String(params.page));
    if (params?.pageSize) q.set("pageSize", String(params.pageSize));
    const qs = q.toString() ? `?${q.toString()}` : "";
    return request<PagedResult<ModeUnlockSubmissionDto>>(`/api/learning-path-modes/admin/unlock-test-submissions${qs}`, {
      token,
    });
  },

  /** PUT /api/learning-path-modes/unlock-test-submissions/{id}/approve */
  approveSubmission(token: string, id: string): Promise<{ message: string }> {
    return request<{ message: string }>(`/api/learning-path-modes/unlock-test-submissions/${id}/approve`, {
      method: "PUT",
      token,
    });
  },

  /** PUT /api/learning-path-modes/unlock-test-submissions/{id}/reject */
  rejectSubmission(token: string, id: string, reason: string): Promise<{ message: string }> {
    return request<{ message: string }>(`/api/learning-path-modes/unlock-test-submissions/${id}/reject`, {
      method: "PUT",
      body: JSON.stringify({ reason }),
      token,
    });
  },
};
