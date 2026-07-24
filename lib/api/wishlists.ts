// lib/api/wishlists.ts — Wishlist (danh sách yêu thích) API endpoints

import { request } from "./client";
import type { TutorialListItemDto } from "./tutorials";

// ── Types ─────────────────────────────────────────────────────────────────────

export interface WishlistToggleResponse {
  isSaved: boolean;
  message?: string;
}

export interface WishlistItemDto {
  targetId: string;
  targetType: string;
  savedAt: string;
  tutorial: TutorialListItemDto | null;
}

export interface WishlistPagedResult {
  items: WishlistItemDto[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// ── API ───────────────────────────────────────────────────────────────────────

export const wishlistsApi = {
  /** POST /api/wishlists/toggle — Thêm/bỏ tutorial khỏi danh sách yêu thích */
  toggle(token: string, tutorialId: string): Promise<WishlistToggleResponse> {
    return request<WishlistToggleResponse>("/api/wishlists/toggle", {
      method: "POST",
      // Dùng PascalCase key vì backend dùng C# positional record (TargetId, TargetType)
      body: JSON.stringify({ TargetId: tutorialId, TargetType: "Tutorial" }),
      token,
    });
  },

  /** GET /api/wishlists/my-wishlist — Lấy danh sách đã lưu của user hiện tại */
  getMyWishlist(
    token: string,
    params?: { page?: number; pageSize?: number }
  ): Promise<WishlistPagedResult> {
    const q = new URLSearchParams();
    if (params?.page)     q.set("page",     String(params.page));
    if (params?.pageSize) q.set("pageSize", String(params.pageSize));
    const qs = q.toString() ? `?${q.toString()}` : "";
    return request<WishlistPagedResult>(`/api/wishlists/my-wishlist${qs}`, { token });
  },
};
