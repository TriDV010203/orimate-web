// lib/api/notifications.ts — Notifications API endpoints

import { request } from "./client";

// ── DTOs (matches BE NotificationDto) ─────────────────────────────────────────

export interface NotificationDto {
  id: string;
  type: string;           // Tên enum BE, vd: "TutorialRejected", "Like", "Comment", "Follow"...
  message: string;
  entityType?: string | null;
  entityId?: string | null;
  isRead: boolean;
  createdAt: string;
}

export interface NotificationPagedResult {
  items: NotificationDto[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// ── Notifications API ──────────────────────────────────────────────────────────

export const notificationsApi = {
  /** GET /api/notifications — Lấy danh sách thông báo (cần đăng nhập) */
  getNotifications(
    token: string,
    params?: { page?: number; pageSize?: number }
  ): Promise<NotificationPagedResult> {
    const q = new URLSearchParams();
    if (params?.page)     q.set("page",     String(params.page));
    if (params?.pageSize) q.set("pageSize", String(params.pageSize));
    const qs = q.toString() ? `?${q.toString()}` : "";
    return request<NotificationPagedResult>(`/api/notifications${qs}`, { token });
  },

  /** PUT /api/notifications/{id}/read — Đánh dấu đã đọc một thông báo */
  markAsRead(token: string, notificationId: string): Promise<{ message: string }> {
    return request<{ message: string }>(`/api/notifications/${notificationId}/read`, {
      method: "PUT",
      token,
    });
  },

  /** PUT /api/notifications/read-all — Đánh dấu tất cả đã đọc */
  markAllAsRead(token: string): Promise<{ message: string }> {
    return request<{ message: string }>("/api/notifications/read-all", {
      method: "PUT",
      token,
    });
  },
};
