// lib/api/subscriptions.ts — Subscription (VIP) API endpoints

import { request } from "./client";

// ── DTOs ──────────────────────────────────────────────────────────────────────

export interface SubscriptionDto {
  id: string;
  subscriberId: string;
  creatorId: string;
  creatorName?: string;
  creatorAvatarUrl?: string | null;
  status: string;         // "Pending" | "Active" | "Expired" | "Rejected"
  referenceCode?: string | null;
  startDate?: string | null;
  endDate?: string | null;
  createdAt: string;
  price?: number | null;
}

export interface SubscriptionPagedResult {
  items: SubscriptionDto[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface VipTierDto {
  creatorId: string;
  price: number;
  isActive: boolean;
}

export interface CreatorRevenueDto {
  creatorId: string;
  totalRevenue: number;
  activeSubscribers: number;
  pendingSubscribers: number;
  monthlyData?: RevenueMonthDto[];
}

export interface RevenueMonthDto {
  month: string;   // "2026-06"
  revenue: number;
  newSubscribers: number;
}

// ── Subscriptions API ──────────────────────────────────────────────────────────

export const subscriptionsApi = {
  /**
   * POST /api/subscriptions — Đăng ký VIP cho một creator
   */
  subscribe(
    token: string,
    creatorId: string,
    referenceCode: string
  ): Promise<SubscriptionDto> {
    return request<SubscriptionDto>("/api/subscriptions", {
      method: "POST",
      body: JSON.stringify({ creatorId, referenceCode }),
      token,
    });
  },

  /**
   * PUT /api/subscriptions/vip-tier — Creator cấu hình giá VIP
   */
  configureVipTier(
    token: string,
    price: number,
    isActive: boolean
  ): Promise<VipTierDto> {
    return request<VipTierDto>("/api/subscriptions/vip-tier", {
      method: "PUT",
      body: JSON.stringify({ price, isActive }),
      token,
    });
  },

  /**
   * GET /api/subscriptions/me — Lịch sử đăng ký của chính mình
   */
  getMySubscriptions(
    token: string,
    params?: { page?: number; pageSize?: number }
  ): Promise<SubscriptionPagedResult> {
    const q = new URLSearchParams();
    if (params?.page)     q.set("page",     String(params.page));
    if (params?.pageSize) q.set("pageSize", String(params.pageSize));
    const qs = q.toString() ? `?${q.toString()}` : "";
    return request<SubscriptionPagedResult>(`/api/subscriptions/me${qs}`, { token });
  },

  /**
   * GET /api/subscriptions/creators/{id}/revenue — Doanh thu của creator
   */
  getCreatorRevenue(token: string, creatorId: string): Promise<CreatorRevenueDto> {
    return request<CreatorRevenueDto>(
      `/api/subscriptions/creators/${creatorId}/revenue`,
      { token }
    );
  },
};
