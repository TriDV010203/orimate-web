// lib/api/community-posts.ts — Community posts API endpoints

import { request, type TargetType } from "./client";

export type { TargetType };

// ── DTOs ──────────────────────────────────────────────────────────────────────

export interface MediaItemDto {
  mediaUrl: string;
  mediaType: "Image" | "Video";
}

export type PostType = "photo" | "achievement" | "tutorial" | "standard";

export interface CommunityPostDto {
  id: string;
  authorId: string;
  content: string;
  createdAt: string;
  commentCount: number;
  likeCount: number;
  isLikedByCurrentUser: boolean;
  media: MediaItemDto[];
  // Loại bài đăng (backend có thể trả về hoặc suy luận từ linkedTutorialId + media)
  postType?: PostType | null;
  // Tutorial được liên kết (khi postType = "tutorial" hoặc "achievement")
  linkedTutorialId?: string | null;
  linkedTutorialTitle?: string | null;
  linkedTutorialSlug?: string | null;
}

export interface CreateCommunityPostRequest {
  content: string;
  tutorialId?: string | null;
  mediaItems?: MediaItemDto[] | null;
}

export interface PagedResult<T> {
  items: T[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface ToggleLikeResponse {
  isLiked: boolean;
}

export interface CommentDto {
  id: string;
  userId: string;
  content: string;
  createdAt: string;
  replies?: CommentDto[] | null;
}

export interface AddCommentRequest {
  targetId: string;
  targetType: TargetType;
  content: string;
}

// ── Community Posts API ───────────────────────────────────────────────────────

export const communityPostsApi = {
  /** GET /api/community-posts/feed — Danh sách bài đăng (phân trang) */
  getFeed(
    params?: { page?: number; pageSize?: number },
    token?: string
  ): Promise<PagedResult<CommunityPostDto>> {
    const q = new URLSearchParams();
    if (params?.page)     q.set("page",     String(params.page));
    if (params?.pageSize) q.set("pageSize", String(params.pageSize));
    const qs = q.toString() ? `?${q.toString()}` : "";
    return request<PagedResult<CommunityPostDto>>(
      `/api/community-posts/feed${qs}`,
      { token }
    );
  },

  /** GET /api/community-posts/{id} — Lấy một bài viết theo ID */
  getById(
    postId: string,
    token?: string
  ): Promise<CommunityPostDto> {
    return request<CommunityPostDto>(`/api/community-posts/${postId}`, { token });
  },

  /** POST /api/community-posts — Tạo bài viết mới (cần đăng nhập) */
  createPost(
    token: string,
    body: CreateCommunityPostRequest
  ): Promise<{ postId: string }> {
    return request<{ postId: string }>("/api/community-posts", {
      method: "POST",
      body: JSON.stringify(body),
      token,
    });
  },

  /** POST /api/likes/toggle — Like / Unlike (cần đăng nhập) */
  toggleLike(
    token: string,
    targetId: string,
    targetType: TargetType
  ): Promise<ToggleLikeResponse> {
    return request<ToggleLikeResponse>("/api/likes/toggle", {
      method: "POST",
      body: JSON.stringify({ targetId, targetType }),
      token,
    });
  },

  /** GET /api/comments?targetId=&targetType=CommunityPost — Lấy comments của một bài */
  getComments(
    targetId: string,
    targetType: TargetType = "CommunityPost",
    page = 1,
    pageSize = 20
  ): Promise<PagedResult<CommentDto>> {
    return request<PagedResult<CommentDto>>(
      `/api/comments?targetId=${targetId}&targetType=${targetType}&page=${page}&pageSize=${pageSize}`
    );
  },

  /** POST /api/comments — Đăng bình luận (cần đăng nhập) */
  addComment(
    token: string,
    body: AddCommentRequest
  ): Promise<{ commentId: string }> {
    return request<{ commentId: string }>("/api/comments", {
      method: "POST",
      body: JSON.stringify(body),
      token,
    });
  },

  /** DELETE /api/comments/{id} — Xóa bình luận của mình (cần đăng nhập) */
  deleteComment(token: string, commentId: string): Promise<void> {
    return request<void>(`/api/comments/${commentId}`, {
      method: "DELETE",
      token,
    });
  },
};
