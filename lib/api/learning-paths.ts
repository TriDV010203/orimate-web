// lib/api/learning-paths.ts — Lộ trình học (FT-33)
// Admin/Manager biên soạn lộ trình từ chính bài hướng dẫn "official" (IsOfficial = true,
// Status = Published) mà họ đã đăng qua /api/tutorials/admin — không lấy bài của creator khác.

import { request } from "./client";
import type { PagedResult } from "./tutorials";

export type LearningPathStatusValue = "Draft" | "Published" | "Archived";

export interface LearningPathItemDto {
  itemOrder: number;
  tutorialId: string;
  tutorialTitle: string;
  tutorialSlug: string;
  tutorialCoverImageUrl?: string | null;
  tutorialDifficulty: string;
  categoryId: number;
  categoryName: string;
}

export interface LearningPathDto {
  id: string;
  learningPathModeId: string;
  learningPathModeName: string;
  title: string;
  description: string;
  coverImageUrl?: string | null;
  status: LearningPathStatusValue;
  items: LearningPathItemDto[];
  createdAt: string;
  updatedAt?: string | null;
  publishedAt?: string | null;
}

export interface LearningPathListItemDto {
  id: string;
  learningPathModeId: string;
  learningPathModeName: string;
  title: string;
  description: string;
  coverImageUrl?: string | null;
  status: LearningPathStatusValue;
  itemCount: number;
  createdAt: string;
  updatedAt?: string | null;
  publishedAt?: string | null;
}

/** Powers the "this tutorial is lesson X/Y of path Z" banner on a tutorial's own page. */
export interface LearningPathContextDto {
  pathId: string;
  pathTitle: string;
  lessonIndex: number;
  totalLessons: number;
  isLastLesson: boolean;
}

export interface CreateLearningPathRequest {
  learningPathModeId: string;
  title: string;
  description: string;
  coverImageUrl?: string | null;
  tutorialIds: string[];
}

export type UpdateLearningPathRequest = CreateLearningPathRequest;

export const learningPathsApi = {
  // ── Public ───────────────────────────────────────────────────────────────

  /** GET /api/learning-paths — Lộ trình đã xuất bản (Published) */
  getList(params?: {
    search?: string;
    modeId?: string;
    page?: number;
    pageSize?: number;
  }): Promise<PagedResult<LearningPathListItemDto>> {
    const q = new URLSearchParams();
    if (params?.search) q.set("search", params.search);
    if (params?.modeId) q.set("modeId", params.modeId);
    if (params?.page) q.set("page", String(params.page));
    if (params?.pageSize) q.set("pageSize", String(params.pageSize));
    const qs = q.toString() ? `?${q.toString()}` : "";
    return request<PagedResult<LearningPathListItemDto>>(`/api/learning-paths${qs}`);
  },

  /** GET /api/learning-paths/{id} — Chi tiết lộ trình đã xuất bản, kèm danh sách bài theo thứ tự */
  getById(id: string): Promise<LearningPathDto> {
    return request<LearningPathDto>(`/api/learning-paths/${id}`);
  },

  /** GET /api/learning-paths/for-tutorial/{tutorialId} — Bài này thuộc lộ trình nào (nếu có) */
  getForTutorial(tutorialId: string): Promise<LearningPathContextDto | null> {
    return request<LearningPathContextDto | null>(`/api/learning-paths/for-tutorial/${tutorialId}`);
  },

  // ── Admin management (Admin,Manager) ────────────────────────────────────

  /** GET /api/learning-paths/admin/all — Mọi lộ trình, mọi trạng thái */
  getAllAdmin(
    token: string,
    params?: { search?: string; status?: string; modeId?: string; page?: number; pageSize?: number }
  ): Promise<PagedResult<LearningPathListItemDto>> {
    const q = new URLSearchParams();
    if (params?.search) q.set("search", params.search);
    if (params?.status) q.set("status", params.status);
    if (params?.modeId) q.set("modeId", params.modeId);
    if (params?.page) q.set("page", String(params.page));
    if (params?.pageSize) q.set("pageSize", String(params.pageSize));
    const qs = q.toString() ? `?${q.toString()}` : "";
    return request<PagedResult<LearningPathListItemDto>>(`/api/learning-paths/admin/all${qs}`, { token });
  },

  /** GET /api/learning-paths/{id}/admin — Chi tiết lộ trình (mọi trạng thái), để đổ dữ liệu lên form sửa */
  getForAdmin(token: string, id: string): Promise<LearningPathDto> {
    return request<LearningPathDto>(`/api/learning-paths/${id}/admin`, { token });
  },

  /** POST /api/learning-paths — Tạo lộ trình mới (luôn ở trạng thái Draft) */
  create(token: string, body: CreateLearningPathRequest): Promise<LearningPathDto> {
    return request<LearningPathDto>("/api/learning-paths", {
      method: "POST",
      body: JSON.stringify(body),
      token,
    });
  },

  /** PUT /api/learning-paths/{id} — Sửa nội dung + danh sách bài (thay thế toàn bộ) */
  update(token: string, id: string, body: UpdateLearningPathRequest): Promise<LearningPathDto> {
    return request<LearningPathDto>(`/api/learning-paths/${id}`, {
      method: "PUT",
      body: JSON.stringify(body),
      token,
    });
  },

  /** PUT /api/learning-paths/{id}/publish — Xuất bản (cần có ít nhất 1 bài) */
  publish(token: string, id: string): Promise<{ message: string }> {
    return request<{ message: string }>(`/api/learning-paths/${id}/publish`, {
      method: "PUT",
      token,
    });
  },

  /** PUT /api/learning-paths/{id}/archive — Lưu trữ (tương đương xoá mềm, ẩn khỏi trang công khai) */
  archive(token: string, id: string): Promise<{ message: string }> {
    return request<{ message: string }>(`/api/learning-paths/${id}/archive`, {
      method: "PUT",
      token,
    });
  },
};
