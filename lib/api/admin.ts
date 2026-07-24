// lib/api/admin.ts — Các API endpoint quản trị và kiểm duyệt dành cho Admin/Manager/CTV

import { request } from "./client";
import { getToken } from "../auth";
import type { PagedResult } from "./tutorials";

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

export interface TutorialReviewItemResponse {
  id: string;
  title: string;
  slug: string;
  authorName: string;
  stepCount: number;
  createdAt: string;
}

export interface CategoryResponse {
  id: number;
  name: string;
  description?: string | null;
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

  createCategory(name: string, description: string): Promise<CategoryResponse> {
    return request<CategoryResponse>("/api/admin/categories", {
      method: "POST",
      body: JSON.stringify({ name, description }),
      token: getToken() ?? undefined,
    });
  },

  updateCategory(
    id: number,
    name: string,
    description: string,
  ): Promise<CategoryResponse> {
    return request<CategoryResponse>(`/api/admin/categories/${id}`, {
      method: "PUT",
      body: JSON.stringify({ name, description }),
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

  // ── TUTORIAL WORKFLOW ────────────────────────────────────────────────

  getContributorQueue(params?: {
    page?: number;
    pageSize?: number;
  }): Promise<PagedResult<TutorialReviewItemResponse>> {
    const q = new URLSearchParams();
    if (params?.page) q.set("page", String(params.page));
    if (params?.pageSize) q.set("pageSize", String(params.pageSize));
    const qs = q.toString() ? `?${q.toString()}` : "";
    return request<PagedResult<TutorialReviewItemResponse>>(
      `/api/tutorials/contributor-queue${qs}`,
      {
        token: getToken() ?? undefined,
      },
    );
  },

  contributorApprove(id: string): Promise<{ message: string }> {
    return request<{ message: string }>(
      `/api/tutorials/${id}/contributor-approve`,
      {
        method: "PUT",
        token: getToken() ?? undefined,
      },
    );
  },

  contributorRequestRevision(
    id: string,
    reason: string,
  ): Promise<{ message: string }> {
    return request<{ message: string }>(
      `/api/tutorials/${id}/contributor-request-revision`,
      {
        method: "PUT",
        body: JSON.stringify({ reason }),
        token: getToken() ?? undefined,
      },
    );
  },

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
};
