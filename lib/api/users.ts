// lib/api/users.ts — API endpoints liên quan đến Users & Profile

import { request } from "./client";

// ── DTOs (khớp với BE CreatorProfileDto) ─────────────────────────────────────

export interface CreatorProfileDto {
  userId: string;
  displayName: string;
  avatarUrl?: string | null;
  bio?: string | null;
  followerCount: number;
  followingCount: number;
  postCount: number;
  achievementCount: number;
  isFollowing: boolean;
  isSuspended: boolean;
  roles: string[];
}

export interface UpdateProfileRequest {
  displayName: string;
  avatarUrl?: string | null;
  bio?: string | null;
}

export interface ToggleFollowResponse {
  message: string;
  isFollowing: boolean;
}

// ── Users API ─────────────────────────────────────────────────────────────────

export const usersApi = {
  /**
   * GET /api/users/{id}/profile
   * Lấy profile của bất kỳ user nào (public).
   * Nếu truyền token → trả thêm isFollowing chính xác.
   */
  getProfile(userId: string, token?: string): Promise<CreatorProfileDto> {
    return request<CreatorProfileDto>(`/api/users/${userId}/profile`, {
      token,
    });
  },

  /**
   * PUT /api/users/profile
   * Cập nhật profile của chính mình (cần đăng nhập).
   */
  updateProfile(
    token: string,
    body: UpdateProfileRequest
  ): Promise<{ message: string }> {
    return request<{ message: string }>("/api/users/profile", {
      method: "PUT",
      body: JSON.stringify(body),
      token,
    });
  },

  /**
   * POST /api/users/{id}/toggle-follow
   * Follow / Unfollow một user (cần đăng nhập).
   */
  toggleFollow(
    token: string,
    targetUserId: string
  ): Promise<ToggleFollowResponse> {
    return request<ToggleFollowResponse>(
      `/api/users/${targetUserId}/toggle-follow`,
      { method: "POST", token }
    );
  },
};
