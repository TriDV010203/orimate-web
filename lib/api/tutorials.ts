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
  type: string;
  difficulty?: string | null;
  categoryId: number;
  categoryName: string;
  author: AuthorDto;
  steps: TutorialStepDto[];
  publishedAt: string;
  likeCount?: number;
  wishlistCount?: number;
  isLikedByCurrentUser?: boolean | null;
  isWishlistedByCurrentUser?: boolean | null;
  isCompleted?: boolean;
  achievementId?: string | null;
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
  /** GET /api/tutorials — Danh sách tutorial đã publish; token tùy chọn để trả về isLiked/isSaved */
  getList(
    params?: {
      search?: string;
      categoryId?: number;
      difficulty?: string;
      type?: string;
      authorId?: string;
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
    if (params?.authorId)   q.set("authorId",   params.authorId);
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
};
