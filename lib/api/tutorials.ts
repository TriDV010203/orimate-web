// lib/api/tutorials.ts — Các API endpoint và types liên quan đến tutorial

import { request } from "./client";
import type { AchievementDto } from "./achievements";

// ── Tutorial types (matches BE DTOs) ──────────────────────────────────────────

export interface AuthorDto {
  id: string;
  displayName: string;
  avatarUrl?: string | null;
}

export interface TutorialStepDto {
  id: string;
  stepOrder: number;
  description: string;
  imageUrl?: string | null;
  isLocked?: boolean;
}

export interface TutorialListItemDto {
  id: string;
  title: string;
  slug: string;
  description: string;
  coverImageUrl?: string | null;
  type: string;         // "Free" | "VIP"
  difficulty?: string | null;
  categoryId: number;
  categoryName: string;
  author: AuthorDto;
  stepCount: number;
  publishedAt: string;
  likeCount?: number;
  wishlistCount?: number;
  commentCount?: number;
  isLikedByCurrentUser?: boolean | null;
  isWishlistedByCurrentUser?: boolean | null;
}

export interface TutorialDetailDto {
  id: string;
  title: string;
  slug: string;
  description: string;
  coverImageUrl?: string | null;
  model3DUrl?: string | null;
  model3DPosterUrl?: string | null;
  type: string;
  difficulty?: string | null;
  categoryId: number;
  categoryName: string;
  author: AuthorDto;
  steps: TutorialStepDto[];
  publishedAt: string;
  isVipLocked?: boolean;
  likeCount?: number;
  wishlistCount?: number;
  isLikedByCurrentUser?: boolean | null;
  isWishlistedByCurrentUser?: boolean | null;
  ratingSummary?: TutorialRatingSummaryDto | null;
  hasAchievement?: boolean;
  hasRated?: boolean;
  completedStepCount?: number;
  totalStepCount?: number;
  progressPercent?: number;
  /** Số người dùng đã hoàn thành bài này (tổng số Achievement gắn với tutorial, không phụ thuộc người xem hiện tại). */
  completedCount?: number;
}

export interface PagedResult<T> {
  items: T[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// ── Author / Studio types ──────────────────────────────────────────────────────

// Trạng thái thật của BE (Domain.Enums.TutorialStatus) — không phải "Pending"/"Rejected" như bản cũ
export type TutorialStatusValue =
  | "Draft"
  | "PendingManagerReview"
  | "RevisionRequired"
  | "Published"
  | "Removed"
  | "EditPendingReview"
  | "Merged";

export interface MyTutorialDto {
  id: string;
  title: string;
  slug: string;
  coverImageUrl?: string | null;
  type: string;         // "Free" | "VIP"
  difficulty: string;   // "Beginner" | "Intermediate" | "Advanced"
  status: TutorialStatusValue;
  stepCount: number;
  createdAt: string;
}

export interface CategoryDto {
  id: number;
  name: string;
  isActive: boolean;
}

export interface CreateTutorialStepRequest {
  stepOrder: number;
  description: string;
  imageUrl?: string | null;
}

export interface CreateTutorialRequest {
  title: string;
  description: string;
  coverImageUrl?: string | null;
  model3DUrl?: string | null;
  model3DPosterUrl?: string | null;
  type: string;         // "Free" | "VIP"
  difficulty: string;   // "Beginner" | "Intermediate" | "Advanced"
  categoryId: number;
  steps: CreateTutorialStepRequest[];
}

export interface UpdateTutorialRequest {
  title: string;
  description: string;
  coverImageUrl?: string | null;
  model3DUrl?: string | null;
  model3DPosterUrl?: string | null;
  type: string;
  difficulty: string;
  categoryId: number;
  steps: CreateTutorialStepRequest[];
}

/** Đáp ứng TutorialResponse (BE) — trả về khi create/update/submit tutorial. */
export interface TutorialResponse {
  id: string;
  slug: string;
  title: string;
  description: string;
  coverImageUrl?: string | null;
  model3DUrl?: string | null;
  model3DPosterUrl?: string | null;
  type: string;
  difficulty: string;
  categoryId: number;
  status: TutorialStatusValue;
  createdAt: string;
  updatedAt?: string | null;
}

/** Đáp ứng TutorialAuthorDetailResponse (BE) — GET /api/tutorials/{id}, dùng để đổ dữ liệu lên form sửa. */
export interface TutorialAuthorDetailDto {
  id: string;
  slug: string;
  title: string;
  description: string;
  coverImageUrl?: string | null;
  model3DUrl?: string | null;
  model3DPosterUrl?: string | null;
  type: string;
  difficulty: string;
  categoryId: number;
  status: TutorialStatusValue;
  steps: TutorialStepDto[];
  createdAt: string;
  updatedAt?: string | null;
}

// ── Progress types ─────────────────────────────────────────────────────────────

export interface TutorialProgressDto {
  tutorialId: string;
  totalSteps: number;
  completedSteps: number;
  percentComplete: number;
  isCompleted: boolean;
  completedStepIds: string[];
}

// ── Rating / completion types ────────────────────────────────────────────────

/** BE Domain.Enums.PerceivedDifficulty — đánh giá độ khó theo cảm nhận người học (khác difficulty tác giả đặt) */
export type PerceivedDifficultyValue = "Easy" | "Medium" | "Hard";

export interface TutorialRatingSummaryDto {
  counts: Partial<Record<PerceivedDifficultyValue, number>>;
  totalCount: number;
}

export interface CompleteTutorialRequest {
  perceivedDifficulty?: PerceivedDifficultyValue | null;
  photoUrl?: string | null;
  note?: string | null;
  isPublic?: boolean;
}

export interface CompleteTutorialResultDto {
  progress: TutorialProgressDto;
  achievement: AchievementDto;
  isNewCompletion: boolean;
}

// ── Variant types ───────────────────────────────────────────────────────────────

export interface TutorialVariantDto {
  id: string;
  title: string;
  slug: string;
  coverImageUrl?: string | null;
  difficulty: string;
  difficultyDelta?: number | null;
}

export interface AddVariantRequest {
  variantTutorialId: string;
  difficultyDelta?: number | null;
}

// ── Tutorials API ─────────────────────────────────────────────────────────────

export const tutorialsApi = {
  /**
   * GET /api/tutorials — Danh sách tutorial đã publish; token tùy chọn để trả về isLiked/isSaved.
   * Lưu ý: BE không hỗ trợ lọc theo authorId — muốn lấy bài của 1 tác giả phải tự lọc phía client.
   */
  getList(
    params?: {
      search?: string;
      categoryId?: number;
      difficulty?: string;
      type?: string;
      sortBy?: string;   // "date" | "likes"
      page?: number;
      pageSize?: number;
    },
    token?: string
  ): Promise<PagedResult<TutorialListItemDto>> {
    const q = new URLSearchParams();
    if (params?.search)     q.set("search",     params.search);
    if (params?.categoryId) q.set("categoryId", String(params.categoryId));
    if (params?.difficulty) q.set("difficulty", params.difficulty);
    if (params?.type)       q.set("type",       params.type);
    if (params?.sortBy)     q.set("sortBy",     params.sortBy);
    if (params?.page)       q.set("page",       String(params.page));
    if (params?.pageSize)   q.set("pageSize",   String(params.pageSize));
    const qs = q.toString() ? `?${q.toString()}` : "";
    return request<PagedResult<TutorialListItemDto>>(`/api/tutorials${qs}`, { token });
  },

  /** GET /api/tutorials/{slug} — Chi tiết tutorial theo slug; token tùy chọn để trả về isLiked/isSaved/isCompleted */
  getBySlug(slug: string, token?: string): Promise<TutorialDetailDto> {
    return request<TutorialDetailDto>(`/api/tutorials/${slug}`, { token });
  },

  /** GET /api/tutorials/recommended — Gợi ý cá nhân hoá (cần đăng nhập) */
  getRecommended(
    params?: { page?: number; pageSize?: number },
    token?: string
  ): Promise<PagedResult<TutorialListItemDto>> {
    const q = new URLSearchParams();
    if (params?.page)     q.set("page",     String(params.page));
    if (params?.pageSize) q.set("pageSize", String(params.pageSize));
    const qs = q.toString() ? `?${q.toString()}` : "";
    return request<PagedResult<TutorialListItemDto>>(`/api/tutorials/recommended${qs}`, { token });
  },

  // ── Author / Studio ──────────────────────────────────────────────────────────

  /** GET /api/tutorials/my-tutorials — Bài của chính mình (tất cả trạng thái) */
  getMyTutorials(
    token: string,
    params?: { page?: number; pageSize?: number }
  ): Promise<PagedResult<MyTutorialDto>> {
    const q = new URLSearchParams();
    if (params?.page)     q.set("page",     String(params.page));
    if (params?.pageSize) q.set("pageSize", String(params.pageSize));
    const qs = q.toString() ? `?${q.toString()}` : "";
    return request<PagedResult<MyTutorialDto>>(`/api/tutorials/my-tutorials${qs}`, { token });
  },

  /** GET /api/tutorials/categories — Danh mục đang active; public, dùng cho dropdown tạo/sửa bài và bộ lọc thư viện */
  getCategories(token?: string): Promise<CategoryDto[]> {
    return request<CategoryDto[]>("/api/tutorials/categories", { token });
  },

  /** GET /api/tutorials/{id} — Chi tiết bài của chính tác giả (mọi trạng thái), dùng để đổ dữ liệu lên form sửa */
  getTutorialForAuthor(token: string, tutorialId: string): Promise<TutorialAuthorDetailDto> {
    return request<TutorialAuthorDetailDto>(`/api/tutorials/${tutorialId}`, { token });
  },

  /** POST /api/tutorials — Tạo bài hướng dẫn mới (luôn ở trạng thái Draft) */
  createTutorial(
    token: string,
    body: CreateTutorialRequest
  ): Promise<TutorialResponse> {
    return request<TutorialResponse>("/api/tutorials", {
      method: "POST",
      body: JSON.stringify(body),
      token,
    });
  },

  /**
   * POST /api/tutorials/admin — Admin/Manager tự viết và đăng bài trực tiếp (Admin,Manager only).
   * Luôn miễn phí, xuất bản ngay lập tức, không qua hàng chờ duyệt.
   */
  adminCreateTutorial(
    token: string,
    body: CreateTutorialRequest
  ): Promise<TutorialResponse> {
    return request<TutorialResponse>("/api/tutorials/admin", {
      method: "POST",
      body: JSON.stringify(body),
      token,
    });
  },

  /** PUT /api/tutorials/{id} — Sửa bài khi chưa xuất bản (chỉ Draft/RevisionRequired) */
  updateTutorial(
    token: string,
    tutorialId: string,
    body: UpdateTutorialRequest
  ): Promise<TutorialResponse> {
    return request<TutorialResponse>(`/api/tutorials/${tutorialId}`, {
      method: "PUT",
      body: JSON.stringify(body),
      token,
    });
  },

  /** PUT /api/tutorials/{id}/submit — Nộp bài cho manager duyệt (Draft/RevisionRequired → PendingManagerReview) */
  submitTutorial(token: string, tutorialId: string): Promise<TutorialResponse> {
    return request<TutorialResponse>(`/api/tutorials/${tutorialId}/submit`, {
      method: "PUT",
      token,
    });
  },

  /** POST /api/tutorials/{id}/edit — Tạo bản sao làm việc từ bài đã publish */
  createWorkingCopy(token: string, tutorialId: string): Promise<{ workingCopyId: string }> {
    return request<{ workingCopyId: string }>(`/api/tutorials/${tutorialId}/edit`, {
      method: "POST",
      token,
    });
  },

  /** PUT /api/tutorials/{id}/edit-content — Cập nhật nội dung bản sao làm việc */
  updateWorkingCopy(
    token: string,
    tutorialId: string,
    body: UpdateTutorialRequest
  ): Promise<TutorialDetailDto> {
    return request<TutorialDetailDto>(`/api/tutorials/${tutorialId}/edit-content`, {
      method: "PUT",
      body: JSON.stringify(body),
      token,
    });
  },

  /** PUT /api/tutorials/{id}/submit-edit — Nộp bản sao làm việc cho manager */
  submitEdit(token: string, tutorialId: string): Promise<{ message: string }> {
    return request<{ message: string }>(`/api/tutorials/${tutorialId}/submit-edit`, {
      method: "PUT",
      token,
    });
  },

  // ── Progress ─────────────────────────────────────────────────────────────────

  /** GET /api/tutorials/{tutorialId}/progress — Tiến độ học của user hiện tại */
  getProgress(token: string, tutorialId: string): Promise<TutorialProgressDto> {
    return request<TutorialProgressDto>(`/api/tutorials/${tutorialId}/progress`, { token });
  },

  /** POST /api/tutorials/{tutorialId}/steps/{stepId}/complete — Đánh dấu hoàn thành bước */
  completeStep(
    token: string,
    tutorialId: string,
    stepId: string
  ): Promise<TutorialProgressDto> {
    return request<TutorialProgressDto>(
      `/api/tutorials/${tutorialId}/steps/${stepId}/complete`,
      { method: "POST", token }
    );
  },

  /** DELETE /api/tutorials/{tutorialId}/steps/{stepId}/complete — Bỏ đánh dấu hoàn thành bước */
  uncompleteStep(
    token: string,
    tutorialId: string,
    stepId: string
  ): Promise<TutorialProgressDto> {
    return request<TutorialProgressDto>(
      `/api/tutorials/${tutorialId}/steps/${stepId}/complete`,
      { method: "DELETE", token }
    );
  },

  /**
   * POST /api/tutorials/{tutorialId}/complete — Hoàn thành tutorial: tạo thành tựu + (lần đầu) lưu
   * đánh giá độ khó. BE tự kiểm tra đã hoàn thành hết các bước chưa; gọi lại lần 2 vẫn trả về
   * thành tựu cũ (idempotent), không tạo trùng hay ghi đè rating.
   */
  completeTutorial(
    token: string,
    tutorialId: string,
    body: CompleteTutorialRequest
  ): Promise<CompleteTutorialResultDto> {
    return request<CompleteTutorialResultDto>(`/api/tutorials/${tutorialId}/complete`, {
      method: "POST",
      body: JSON.stringify(body),
      token,
    });
  },

  /** POST /api/tutorials/{tutorialId}/steps/{stepId}/stuck — Đánh dấu đang bị kẹt ở bước này */
  markStepStuck(
    token: string,
    tutorialId: string,
    stepId: string
  ): Promise<{ message: string }> {
    return request<{ message: string }>(
      `/api/tutorials/${tutorialId}/steps/${stepId}/stuck`,
      { method: "POST", token }
    );
  },

  // ── Variants ─────────────────────────────────────────────────────────────────

  /** GET /api/tutorials/{parentId}/variants — Các biến thể (độ khó khác) của một tutorial */
  getVariants(parentId: string, token?: string): Promise<TutorialVariantDto[]> {
    return request<TutorialVariantDto[]>(`/api/tutorials/${parentId}/variants`, { token });
  },

  /** POST /api/tutorials/{parentId}/variants — Gắn một tutorial khác làm biến thể (Admin/Manager) */
  addVariant(
    token: string,
    parentId: string,
    body: AddVariantRequest
  ): Promise<{ message: string }> {
    return request<{ message: string }>(`/api/tutorials/${parentId}/variants`, {
      method: "POST",
      body: JSON.stringify(body),
      token,
    });
  },

  /** DELETE /api/tutorials/{parentId}/variants/{variantId} — Gỡ liên kết biến thể (Admin/Manager) */
  removeVariant(token: string, parentId: string, variantId: string): Promise<{ message: string }> {
    return request<{ message: string }>(`/api/tutorials/${parentId}/variants/${variantId}`, {
      method: "DELETE",
      token,
    });
  },
};
