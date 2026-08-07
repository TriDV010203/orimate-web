// lib/api/shop.ts — Cửa hàng liên kết affiliate (FT-18)
// Chỉ là danh sách link ra shop ngoài (giấy, kit, sách...) — không có giỏ hàng,
// không thanh toán, Hạt Gấp không tiêu ở đây (BR-SEEDS-01).

import { request } from "./client";

// ── DTOs ──────────────────────────────────────────────────────────────────────

export interface ShopLinkDto {
  id: string;
  title: string;
  url: string;
  imageUrl: string | null;
  category: string | null;
  createdAt: string;
}

// Dùng cho danh sách quản trị (bao gồm cả link đã tắt) và cho response tạo/sửa
export interface ShopLinkResponse {
  id: string;
  title: string;
  url: string;
  imageUrl: string | null;
  category: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string | null;
}

export interface CreateShopLinkRequest {
  title: string;
  url: string;
  imageUrl?: string | null;
  category?: string | null;
}

export interface UpdateShopLinkRequest {
  title: string;
  url: string;
  imageUrl?: string | null;
  category?: string | null;
  isActive: boolean;
}

// ── Shop API ─────────────────────────────────────────────────────────────────

export const shopApi = {
  /** GET /api/shop — public, chỉ trả link đang active */
  getActive(): Promise<ShopLinkDto[]> {
    return request<ShopLinkDto[]>("/api/shop");
  },

  /** GET /api/shop/admin — Admin only, trả toàn bộ link kể cả đã tắt */
  getAllAdmin(token: string): Promise<ShopLinkResponse[]> {
    return request<ShopLinkResponse[]>("/api/shop/admin", { token });
  },

  /** POST /api/shop — Admin only */
  create(token: string, body: CreateShopLinkRequest): Promise<ShopLinkResponse> {
    return request<ShopLinkResponse>("/api/shop", {
      method: "POST",
      body: JSON.stringify(body),
      token,
    });
  },

  /** PUT /api/shop/{id} — Admin only */
  update(token: string, id: string, body: UpdateShopLinkRequest): Promise<ShopLinkResponse> {
    return request<ShopLinkResponse>(`/api/shop/${id}`, {
      method: "PUT",
      body: JSON.stringify(body),
      token,
    });
  },

  /** GET /api/shop/patterns — Mẫu gấp trả phí (chưa có UI tiêu thụ, response shape chưa được BE document) */
  getPatterns(token?: string): Promise<unknown> {
    return request<unknown>("/api/shop/patterns", { token });
  },

  /** POST /api/shop/patterns/{id}/purchase — Mua mẫu gấp bằng Hạt Gấp */
  purchasePattern(token: string, id: string): Promise<unknown> {
    return request<unknown>(`/api/shop/patterns/${id}/purchase`, {
      method: "POST",
      token,
    });
  },
};
