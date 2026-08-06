// lib/api/subscriptions.ts — Subscription (VIP) API endpoints

import { request } from "./client";
import type { PagedResult } from "./tutorials";

// ── DTOs ──────────────────────────────────────────────────────────────────────

/** VIP subscription price (VND) is platform-fixed — mirrors backend VipConstants.FixedPriceVnd. */
export const VIP_FIXED_PRICE_VND = 50000;

export interface VipTierDto {
  id: string;
  creatorId: string;
  price: number;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string | null;
}

export interface TransactionDto {
  id: string;
  userId: string;
  creatorId?: string | null;
  transactionType: string;
  amount: number;
  platformFeeAmount: number;
  creatorNetAmount: number;
  status: string;          // "PendingConfirmation" | "Confirmed" | "Rejected"
  paymentCode: string;
  confirmedBy?: string | null;
  confirmedAt?: string | null;
  adminNote?: string | null;
  createdAt: string;
}

/** Enriched transaction shape for the admin ledger. */
export interface AdminTransactionDto {
  id: string;
  userId: string;
  subscriberDisplayName: string;
  subscriberAvatarUrl?: string | null;
  creatorId?: string | null;
  creatorDisplayName?: string | null;
  creatorAvatarUrl?: string | null;
  transactionType: string;
  amount: number;
  platformFeeAmount: number;
  creatorNetAmount: number;
  status: string;
  paymentCode: string;
  confirmedBy?: string | null;
  confirmedAt?: string | null;
  adminNote?: string | null;
  createdAt: string;
}

/** Bank transfer instructions returned right after Subscribe — SePay auto-matches by paymentCode in the transfer content. */
export interface PaymentInstructionDto {
  bankAccountNumber: string;
  bankName: string;
  bankBin: string;
  accountHolderName: string;
  paymentCode: string;
  amount: number;
  qrCodeUrl: string;
}

export interface SubscribeResultDto {
  transaction: TransactionDto;
  paymentInstruction: PaymentInstructionDto;
}

export interface PlatformRevenueDto {
  totalGrossRevenue: number;
  totalCommissionCollected: number;
  totalNetPaidToCreators: number;
  confirmedCount: number;
  pendingCount: number;
  rejectedCount: number;
  activeSubscriptionCount: number;
}

/** A VIP subscription as returned right after admin confirm/reject — no creator display info. */
export interface VipSubscriptionDto {
  id: string;
  subscriberId: string;
  creatorId: string;
  transactionId: string;
  startDate: string;
  endDate: string;
  status: string;
  createdAt: string;
}

/** Enriched subscription shape for the buyer's own "VIP của tôi" list. */
export interface MySubscriptionDto {
  id: string;
  subscriberId: string;
  creatorId: string;
  creatorDisplayName: string;
  creatorAvatarUrl?: string | null;
  transactionId: string;
  price: number;
  startDate: string;
  endDate: string;
  daysRemaining: number;
  status: string;          // "Active" | "Expired"
  createdAt: string;
}

export interface CreatorSubscriberDto {
  subscriberId: string;
  displayName: string;
  avatarUrl?: string | null;
  startDate: string;
  endDate: string;
  daysRemaining: number;
}

export interface CreatorRevenueDto {
  creatorId: string;
  activeSubscriberCount: number;
  pendingCount: number;
  netRevenueThisMonth: number;
  netRevenueAllTime: number;
  periodStart: string;
  periodEndExclusive: string;
  subscribers: CreatorSubscriberDto[];
}

export type TransactionStatusFilter = "PendingConfirmation" | "Confirmed" | "Rejected";

// ── Subscriptions API ──────────────────────────────────────────────────────────

export const subscriptionsApi = {
  /**
   * POST /api/subscriptions — Đăng ký VIP cho một creator (giá cố định 50.000đ).
   * Tạo Transaction PendingConfirmation + trả hướng dẫn chuyển khoản (QR/mã thanh toán) —
   * giao dịch được SePay tự động xác nhận qua webhook, không cần nhập mã tay.
   */
  subscribe(token: string, creatorId: string): Promise<SubscribeResultDto> {
    return request<SubscribeResultDto>("/api/subscriptions", {
      method: "POST",
      body: JSON.stringify({ creatorId }),
      token,
    });
  },

  /**
   * GET /api/subscriptions/transactions/{id} — Poll trạng thái giao dịch của chính mình
   * trong lúc chờ webhook SePay tự động xác nhận.
   */
  getTransaction(token: string, transactionId: string): Promise<TransactionDto> {
    return request<TransactionDto>(`/api/subscriptions/transactions/${transactionId}`, { token });
  },

  /**
   * GET /api/subscriptions/vip-tier — Trạng thái bán VIP hiện tại của chính mình
   */
  getMyVipTier(token: string): Promise<VipTierDto> {
    return request<VipTierDto>("/api/subscriptions/vip-tier", { token });
  },

  /**
   * PUT /api/subscriptions/vip-tier — Creator bật/tắt bán VIP (giá luôn cố định 50.000đ)
   */
  configureVipTier(token: string, isActive: boolean): Promise<VipTierDto> {
    return request<VipTierDto>("/api/subscriptions/vip-tier", {
      method: "PUT",
      body: JSON.stringify({ isActive }),
      token,
    });
  },

  /**
   * GET /api/subscriptions/me — Lịch sử đăng ký VIP của chính mình (với tư cách người mua)
   */
  getMySubscriptions(
    token: string,
    params?: { page?: number; pageSize?: number }
  ): Promise<PagedResult<MySubscriptionDto>> {
    const q = new URLSearchParams();
    if (params?.page)     q.set("page",     String(params.page));
    if (params?.pageSize) q.set("pageSize", String(params.pageSize));
    const qs = q.toString() ? `?${q.toString()}` : "";
    return request<PagedResult<MySubscriptionDto>>(`/api/subscriptions/me${qs}`, { token });
  },

  /**
   * GET /api/subscriptions/creators/{id}/revenue — Doanh thu + danh sách người đăng ký VIP của creator
   */
  getCreatorRevenue(token: string, creatorId: string): Promise<CreatorRevenueDto> {
    return request<CreatorRevenueDto>(
      `/api/subscriptions/creators/${creatorId}/revenue`,
      { token }
    );
  },

  /**
   * GET /api/subscriptions/transactions — Admin: toàn bộ giao dịch VIP (lọc theo trạng thái)
   */
  getAllTransactions(
    token: string,
    params?: { status?: TransactionStatusFilter; page?: number; pageSize?: number }
  ): Promise<PagedResult<AdminTransactionDto>> {
    const q = new URLSearchParams();
    if (params?.status)   q.set("status",   params.status);
    if (params?.page)     q.set("page",     String(params.page));
    if (params?.pageSize) q.set("pageSize", String(params.pageSize));
    const qs = q.toString() ? `?${q.toString()}` : "";
    return request<PagedResult<AdminTransactionDto>>(`/api/subscriptions/transactions${qs}`, { token });
  },

  /**
   * GET /api/subscriptions/admin/revenue — Admin: tổng quan doanh thu + hoa hồng toàn nền tảng
   */
  getPlatformRevenue(token: string): Promise<PlatformRevenueDto> {
    return request<PlatformRevenueDto>("/api/subscriptions/admin/revenue", { token });
  },
};
