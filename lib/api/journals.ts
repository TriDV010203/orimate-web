// lib/api/journals.ts — Journal API endpoints

import { request } from "./client";

// ── DTOs (matches BE JournalDto) ──────────────────────────────────────────────

export interface JournalDto {
  id: string;
  userId: string;
  linkedTutorialId?: string | null;
  linkedTutorialTitle?: string | null;
  linkedTutorialSlug?: string | null;
  content: string;
  imageUrls: string[];
  isPublic: boolean;
  createdAt: string;
  updatedAt?: string | null;
}

export interface CreateJournalRequest {
  linkedTutorialId?: string | null;
  content: string;
  imageUrls?: string[] | null;
  isPublic?: boolean;
}

export interface UpdateJournalRequest {
  linkedTutorialId?: string | null;
  content: string;
  imageUrls?: string[] | null;
  isPublic?: boolean;
}

export interface PagedResult<T> {
  items: T[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// ── Journals API ──────────────────────────────────────────────────────────────

export const journalsApi = {
  /** GET /api/journals/me — Nhật ký của bản thân (cần đăng nhập) */
  getMyJournals(
    token: string,
    params?: { page?: number; pageSize?: number }
  ): Promise<PagedResult<JournalDto>> {
    const q = new URLSearchParams();
    if (params?.page) q.set("page", String(params.page));
    if (params?.pageSize) q.set("pageSize", String(params.pageSize));
    const qs = q.toString() ? `?${q.toString()}` : "";
    return request<PagedResult<JournalDto>>(`/api/journals/me${qs}`, { token });
  },

  /** GET /api/users/{userId}/journals — Nhật ký công khai của một user */
  getUserJournals(
    userId: string,
    params?: { page?: number; pageSize?: number },
    token?: string
  ): Promise<PagedResult<JournalDto>> {
    const q = new URLSearchParams();
    if (params?.page) q.set("page", String(params.page));
    if (params?.pageSize) q.set("pageSize", String(params.pageSize));
    const qs = q.toString() ? `?${q.toString()}` : "";
    return request<PagedResult<JournalDto>>(
      `/api/users/${userId}/journals${qs}`,
      { token }
    );
  },

  /** POST /api/journals — Tạo nhật ký mới (cần đăng nhập) */
  createJournal(
    token: string,
    body: CreateJournalRequest
  ): Promise<JournalDto> {
    return request<JournalDto>("/api/journals", {
      method: "POST",
      body: JSON.stringify(body),
      token,
    });
  },

  /** PUT /api/journals/{journalId} — Cập nhật nhật ký (cần đăng nhập) */
  updateJournal(
    token: string,
    journalId: string,
    body: UpdateJournalRequest
  ): Promise<JournalDto> {
    return request<JournalDto>(`/api/journals/${journalId}`, {
      method: "PUT",
      body: JSON.stringify(body),
      token,
    });
  },

  /** DELETE /api/journals/{journalId} — Xóa nhật ký (cần đăng nhập) */
  deleteJournal(token: string, journalId: string): Promise<void> {
    return request<void>(`/api/journals/${journalId}`, {
      method: "DELETE",
      token,
    });
  },
};
