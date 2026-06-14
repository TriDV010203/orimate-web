// lib/api/auth.ts — Các API endpoint liên quan đến xác thực (login, register)

import { request } from "./client";

// ── Auth types ────────────────────────────────────────────────────────────────

export interface AuthResponse {
  userId: string;
  email: string;
  displayName?: string;
  roles: string[];
  token: string;
  expiresAt: string; // ISO datetime string
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
};
