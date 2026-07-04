// lib/api/auth.ts — Các API endpoint liên quan đến xác thực (login, register, forgot/reset password)

import { request } from "./client";

// ── Auth types ────────────────────────────────────────────────────────────────

export interface AuthResponse {
  userId: string;
  email: string;
  displayName?: string;
  roles: string[];
  token: string;
  expiresAt: string; // ISO datetime string
  refreshToken: string;
}

export interface MessageResponse {
  message: string;
}

// ── Auth API ──────────────────────────────────────────────────────────────────

export const authApi = {
  /** POST /api/auth/login */
  login(email: string, password: string) {
    return request<AuthResponse>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
  },

  /** POST /api/auth/register */
  register(email: string, password: string, displayName: string) {
    return request<AuthResponse>("/api/auth/register", {
      method: "POST",
      body: JSON.stringify({ email, password, displayName }),
    });
  },

  /** POST /api/auth/forgot-password */
  forgotPassword(email: string) {
    return request<MessageResponse>("/api/auth/forgot-password", {
      method: "POST",
      body: JSON.stringify({ email }),
    });
  },

  /** POST /api/auth/reset-password */
  resetPassword(token: string, newPassword: string, confirmPassword: string) {
    return request<MessageResponse>("/api/auth/reset-password", {
      method: "POST",
      body: JSON.stringify({ token, newPassword, confirmPassword }),
    });
  },

  /** GET /api/auth/verify-email?token=xxx */
  verifyEmail(token: string) {
    return request<MessageResponse>(
      `/api/auth/verify-email?token=${encodeURIComponent(token)}`,
    );
  },

  /** POST /api/auth/resend-verification */
  resendVerification(email: string) {
    return request<MessageResponse>("/api/auth/resend-verification", {
      method: "POST",
      body: JSON.stringify({ email }),
    });
  },

  /** POST /api/auth/refresh-token — Lấy access token mới bằng refresh token */
  refreshToken(refreshToken: string) {
    return request<AuthResponse>("/api/auth/refresh-token", {
      method: "POST",
      body: JSON.stringify({ refreshToken }),
    });
  },

  /** POST /api/auth/change-password — Yêu cầu đăng nhập (Bearer token) */
  changePassword(
    currentPassword: string,
    newPassword: string,
    confirmPassword: string,
    token: string,
  ) {
    return request<MessageResponse>("/api/auth/change-password", {
      method: "POST",
      body: JSON.stringify({ currentPassword, newPassword, confirmPassword }),
      token,
    });
  },

  /** POST /api/auth/logout — Vô hiệu hoá refresh token trên server */
  logout(token: string) {
    return request<MessageResponse>("/api/auth/logout", {
      method: "POST",
      token,
    });
  },
};
