// lib/auth.ts — Quản lý trạng thái xác thực phía client
// Lưu JWT vào localStorage; dùng sessionStorage nếu "remember me" = false

import type { AuthResponse } from "./api";

const TOKEN_KEY = "origami_token";
const USER_KEY = "origami_user";

export interface StoredUser {
  userId: string;
  email: string;
  roles: string[];
  expiresAt: string;
}

export function saveSession(data: AuthResponse, remember: boolean): void {
  const storage = remember ? localStorage : sessionStorage;
  storage.setItem(TOKEN_KEY, data.token);
  const user: StoredUser = {
    userId: data.userId,
    email: data.email,
    roles: data.roles,
    expiresAt: data.expiresAt,
  };
  storage.setItem(USER_KEY, JSON.stringify(user));
}

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY) ?? sessionStorage.getItem(TOKEN_KEY);
}

export function getUser(): StoredUser | null {
  if (typeof window === "undefined") return null;
  const raw =
    localStorage.getItem(USER_KEY) ?? sessionStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as StoredUser;
  } catch {
    return null;
  }
}

export function clearSession(): void {
  [localStorage, sessionStorage].forEach((s) => {
    s.removeItem(TOKEN_KEY);
    s.removeItem(USER_KEY);
  });
}

export function isLoggedIn(): boolean {
  const token = getToken();
  if (!token) return false;
  const user = getUser();
  if (!user) return false;
  return new Date(user.expiresAt) > new Date();
}
