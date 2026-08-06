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

export interface FollowerUserDto {
  userId: string;
  displayName: string;
  avatarUrl?: string | null;
  bio?: string | null;
  followerCount: number;
  tutorialCount: number;
  isFollowing: boolean;
  roles: string[];
}

export interface UserPagedResult<T> {
  items: T[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
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

  /**
   * GET /api/users/{id}/followers — Danh sách người theo dõi user đó
   */
  getFollowers(
    userId: string,
    params?: { page?: number; pageSize?: number },
    token?: string
  ): Promise<UserPagedResult<FollowerUserDto>> {
    const q = new URLSearchParams();
    if (params?.page) q.set("page", String(params.page));
    if (params?.pageSize) q.set("pageSize", String(params.pageSize));
    const qs = q.toString() ? `?${q.toString()}` : "";
    return request<UserPagedResult<FollowerUserDto>>(
      `/api/users/${userId}/followers${qs}`,
      { token }
    );
  },

  /**
   * GET /api/users/{id}/following — Danh sách người mà user đó đang theo dõi
   */
  getFollowing(
    userId: string,
    params?: { page?: number; pageSize?: number },
    token?: string
  ): Promise<UserPagedResult<FollowerUserDto>> {
    const q = new URLSearchParams();
    if (params?.page) q.set("page", String(params.page));
    if (params?.pageSize) q.set("pageSize", String(params.pageSize));
    const qs = q.toString() ? `?${q.toString()}` : "";
    return request<UserPagedResult<FollowerUserDto>>(
      `/api/users/${userId}/following${qs}`,
      { token }
    );
  },

  /**
   * GET /api/users/top-creators — Nhà sáng tạo nổi bật, xếp hạng theo số người theo dõi (public).
   */
  getTopCreators(count = 4, token?: string): Promise<FollowerUserDto[]> {
    return request<FollowerUserDto[]>(
      `/api/users/top-creators?count=${count}`,
      { token }
    );
  },
};

