// lib/api/admin.ts — Các API endpoint quản trị và kiểm duyệt dành cho Admin/Manager/CTV

import { request } from "./client";
import { getToken } from "../auth";
import type { PagedResult, TutorialStepDto, UpdateTutorialRequest, TutorialResponse } from "./tutorials";

export interface BlockedWordResponse {
  createdAt: string | number | Date;
  id: number;
  word: string;
}

export interface AdminUserResponse {
  id: string;
  email: string;
  displayName: string | null;
  avatarUrl: string | null;
  status: string;
  roles: string[];
  createdAt: string;
}

export interface PendingReportDto {
  id: string;
  reporterId: string;
  targetType: number; // 0: Tutorial, 1: CommunityPost, 2: Comment
  targetId: string;
  reason: string;
  createdAt: string;
  targetContent: string | null;
}

export interface ManagerQueueItemResponse {
  id: string;
  title: string;
  slug: string;
  authorName: string;
  stepCount: number;
  createdAt: string;
  isEdit: boolean;
  parentTutorialId: string | null;
}

export interface CategoryResponse {
  id: number;
  name: string;
  isActive: boolean;
  createdAt: string;
}

export interface AdminTutorialListItemResponse {
  id: string;
  title: string;
  slug: string;
  coverImageUrl?: string | null;
  type: string;
  difficulty: string;
  status: string;
  categoryId: number;
  categoryName: string;
  authorName: string;
  isOfficial: boolean;
  stepCount: number;
  createdAt: string;
  updatedAt?: string | null;
  publishedAt?: string | null;
}

export interface AdminTutorialDetailResponse {
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
  status: string;
  authorName: string;
  isOfficial: boolean;
  steps: TutorialStepDto[];
  createdAt: string;
  updatedAt?: string | null;
}

export const adminApi = {
  // ── BLOCKED WORDS ───────────────────────────────────────────────────

  getBlockedWords(): Promise<BlockedWordResponse[]> {
    return request<BlockedWordResponse[]>("/api/admin/blocked-words", {
      token: getToken() ?? undefined,
    });
  },

  addBlockedWord(word: string): Promise<BlockedWordResponse> {
    return request<BlockedWordResponse>("/api/admin/blocked-words", {
      method: "POST",
      body: JSON.stringify({ word }),
      token: getToken() ?? undefined,
    });
  },

  removeBlockedWord(id: number): Promise<{ message: string }> {
    return request<{ message: string }>(`/api/admin/blocked-words/${id}`, {
      method: "DELETE",
      token: getToken() ?? undefined,
    });
  },

  // ── USER MANAGEMENT ─────────────────────────────────────────────────

  getUsers(params?: {
    keyword?: string;
    status?: string;
    role?: string;
    page?: number;
    pageSize?: number;
  }): Promise<PagedResult<AdminUserResponse>> {
    const q = new URLSearchParams();
    if (params?.keyword) q.set("keyword", params.keyword);
    if (params?.status) q.set("status", params.status);
    if (params?.role) q.set("role", params.role);
    if (params?.page) q.set("page", String(params.page));
    if (params?.pageSize) q.set("pageSize", String(params.pageSize));
    const qs = q.toString() ? `?${q.toString()}` : "";
    return request<PagedResult<AdminUserResponse>>(`/api/admin/users${qs}`, {
      token: getToken() ?? undefined,
    });
  },

  createUser(body: {
    email: string;
    password: string;
    displayName: string;
    role: string;
  }): Promise<AdminUserResponse> {
    return request<AdminUserResponse>("/api/admin/users", {
      method: "POST",
      body: JSON.stringify(body),
      token: getToken() ?? undefined,
    });
  },

  assignRole(userId: string, role: string): Promise<{ message: string }> {
    return request<{ message: string }>(
      `/api/admin/users/${userId}/assign-role`,
      {
        method: "PUT",
        body: JSON.stringify({ role }),
        token: getToken() ?? undefined,
      },
    );
  },

  removeRole(userId: string, role: string): Promise<{ message: string }> {
    return request<{ message: string }>(
      `/api/admin/users/${userId}/remove-role`,
      {
        method: "DELETE",
        body: JSON.stringify({ role }),
        token: getToken() ?? undefined,
      },
    );
  },

  suspendUser(userId: string, reason: string): Promise<{ message: string }> {
    return request<{ message: string }>(`/api/admin/users/${userId}/suspend`, {
      method: "PUT",
      body: JSON.stringify({ reason }),
      token: getToken() ?? undefined,
    });
  },

  activateUser(userId: string): Promise<{ message: string }> {
    return request<{ message: string }>(`/api/admin/users/${userId}/activate`, {
      method: "PUT",
      token: getToken() ?? undefined,
    });
  },

  // ── CATEGORY MANAGEMENT ─────────────────────────────────────────────

  getCategories(): Promise<CategoryResponse[]> {
    return request<CategoryResponse[]>("/api/admin/categories", {
      token: getToken() ?? undefined,
    });
  },

  createCategory(name: string): Promise<CategoryResponse> {
    return request<CategoryResponse>("/api/admin/categories", {
      method: "POST",
      body: JSON.stringify({ name }),
      token: getToken() ?? undefined,
    });
  },

  updateCategory(
    id: number,
    body: { name?: string; isActive?: boolean },
  ): Promise<CategoryResponse> {
    return request<CategoryResponse>(`/api/admin/categories/${id}`, {
      method: "PUT",
      body: JSON.stringify(body),
      token: getToken() ?? undefined,
    });
  },

  deleteCategory(id: number): Promise<{ message: string }> {
    return request<{ message: string }>(`/api/admin/categories/${id}`, {
      method: "DELETE",
      token: getToken() ?? undefined,
    });
  },

  // ── COMMUNITY REPORTS ───────────────────────────────────────────────

  getPendingReports(params?: {
    page?: number;
    pageSize?: number;
  }): Promise<PendingReportDto[]> {
    const q = new URLSearchParams();
    if (params?.page) q.set("page", String(params.page));
    if (params?.pageSize) q.set("pageSize", String(params.pageSize));
    const qs = q.toString() ? `?${q.toString()}` : "";
    return request<PendingReportDto[]>(`/api/reports/pending${qs}`, {
      token: getToken() ?? undefined,
    });
  },

  handleReport(id: string, actionType: number): Promise<{ message: string }> {
    return request<{ message: string }>(`/api/reports/${id}/handle`, {
      method: "POST",
      body: JSON.stringify({ actionType }),
      token: getToken() ?? undefined,
    });
  },

  // ── TUTORIAL WORKFLOW (Manager review queue) ─────────────────────────

  getManagerQueue(params?: {
    page?: number;
    pageSize?: number;
  }): Promise<PagedResult<ManagerQueueItemResponse>> {
    const q = new URLSearchParams();
    if (params?.page) q.set("page", String(params.page));
    if (params?.pageSize) q.set("pageSize", String(params.pageSize));
    const qs = q.toString() ? `?${q.toString()}` : "";
    return request<PagedResult<ManagerQueueItemResponse>>(
      `/api/tutorials/manager-queue${qs}`,
      {
        token: getToken() ?? undefined,
      },
    );
  },

  // New-submission workflow (ParentTutorialId === null)
  publishTutorial(id: string): Promise<{ message: string }> {
    return request<{ message: string }>(`/api/tutorials/${id}/publish`, {
      method: "PUT",
      token: getToken() ?? undefined,
    });
  },

  rejectTutorial(id: string, reason: string): Promise<{ message: string }> {
    return request<{ message: string }>(`/api/tutorials/${id}/reject`, {
      method: "PUT",
      body: JSON.stringify({ reason }),
      token: getToken() ?? undefined,
    });
  },

  removeTutorial(id: string, reason?: string): Promise<{ message: string }> {
    return request<{ message: string }>(`/api/tutorials/${id}`, {
      method: "DELETE",
      body: reason ? JSON.stringify({ reason }) : undefined,
      token: getToken() ?? undefined,
    });
  },

  // Edit-submission workflow (ParentTutorialId set — working copy of a published tutorial)
  approveEdit(workingCopyId: string): Promise<{ message: string }> {
    return request<{ message: string }>(
      `/api/tutorials/${workingCopyId}/approve-edit`,
      {
        method: "PUT",
        token: getToken() ?? undefined,
      },
    );
  },

  rejectEdit(workingCopyId: string, reason: string): Promise<{ message: string }> {
    return request<{ message: string }>(
      `/api/tutorials/${workingCopyId}/reject-edit`,
      {
        method: "PUT",
        body: JSON.stringify({ reason }),
        token: getToken() ?? undefined,
      },
    );
  },

  // ── TUTORIAL MANAGEMENT (edit any tutorial, any author/status) ──────────

  getAllTutorials(params?: {
    search?: string;
    status?: string;
    categoryId?: number;
    difficulty?: string;
    isOfficial?: boolean;
    page?: number;
    pageSize?: number;
  }): Promise<PagedResult<AdminTutorialListItemResponse>> {
    const q = new URLSearchParams();
    if (params?.search) q.set("search", params.search);
    if (params?.status) q.set("status", params.status);
    if (params?.categoryId) q.set("categoryId", String(params.categoryId));
    if (params?.difficulty) q.set("difficulty", params.difficulty);
    if (params?.isOfficial !== undefined) q.set("isOfficial", String(params.isOfficial));
    if (params?.page) q.set("page", String(params.page));
    if (params?.pageSize) q.set("pageSize", String(params.pageSize));
    const qs = q.toString() ? `?${q.toString()}` : "";
    return request<PagedResult<AdminTutorialListItemResponse>>(
      `/api/tutorials/admin/all${qs}`,
      { token: getToken() ?? undefined },
    );
  },

  getTutorialForAdmin(id: string): Promise<AdminTutorialDetailResponse> {
    return request<AdminTutorialDetailResponse>(`/api/tutorials/${id}/admin`, {
      token: getToken() ?? undefined,
    });
  },

  updateTutorialAdmin(id: string, body: UpdateTutorialRequest): Promise<TutorialResponse> {
    return request<TutorialResponse>(`/api/tutorials/${id}/admin`, {
      method: "PUT",
      body: JSON.stringify(body),
      token: getToken() ?? undefined,
    });
  },
};
