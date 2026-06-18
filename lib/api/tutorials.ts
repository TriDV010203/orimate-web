// lib/api/tutorials.ts — Các API endpoint và types liên quan đến tutorial

import { request } from "./client";

// ── Tutorial types (matches BE DTOs) ──────────────────────────────────────────

export interface AuthorDto {
  id: string;
  displayName: string;
  avatarUrl?: string | null;
}

export interface TutorialStepDto {
  id: string;
  stepOrder: number;
  title: string;
  content: string;
  mediaUrl?: string | null;
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
}

export interface TutorialDetailDto {
  id: string;
  title: string;
  slug: string;
  description: string;
  coverImageUrl?: string | null;
  type: string;
  difficulty?: string | null;
  categoryId: number;
  categoryName: string;
  author: AuthorDto;
  steps: TutorialStepDto[];
  publishedAt: string;
}

export interface PagedResult<T> {
  items: T[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// ── Tutorials API ─────────────────────────────────────────────────────────────

export const tutorialsApi = {
  /** GET /api/tutorials — Danh sách tutorial đã publish (public) */
  getList(params?: {
    search?: string;
    categoryId?: number;
    difficulty?: string;
    type?: string;
    page?: number;
    pageSize?: number;
  }): Promise<PagedResult<TutorialListItemDto>> {
    const q = new URLSearchParams();
    if (params?.search)     q.set("search",     params.search);
    if (params?.categoryId) q.set("categoryId", String(params.categoryId));
    if (params?.difficulty) q.set("difficulty", params.difficulty);
    if (params?.type)       q.set("type",       params.type);
    if (params?.page)       q.set("page",       String(params.page));
    if (params?.pageSize)   q.set("pageSize",   String(params.pageSize));
    const qs = q.toString() ? `?${q.toString()}` : "";
    return request<PagedResult<TutorialListItemDto>>(`/api/tutorials${qs}`);
  },

  /** GET /api/tutorials/{slug} — Chi tiết tutorial theo slug (public) */
  async getBySlug(slug: string): Promise<TutorialDetailDto> {
    const raw = await request<any>(`/api/tutorials/${slug}`);
    return {
      ...raw,
      steps: (raw.steps || []).map((s: any) => ({
        id: s.id,
        stepOrder: s.stepOrder,
        title: `Bước ${s.stepOrder}`,
        content: s.description || "",
        mediaUrl: s.imageUrl || null,
      })),
    };
  },
};
