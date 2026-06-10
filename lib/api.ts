// lib/api.ts — HTTP client kết nối tới backend OriMate
// BE đã cấu hình CORS → FE gọi thẳng không cần proxy

const BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5104";

export interface AuthResponse {
  userId: string;
  email: string;
  roles: string[];
  token: string;
  expiresAt: string; // ISO datetime string
}

export interface ApiError {
  message: string;
  status: number;
}

async function request<T>(
  path: string,
  options?: RequestInit
): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(options?.headers ?? {}),
    },
    ...options,
  });

  if (!res.ok) {
    let message = "Đã xảy ra lỗi. Vui lòng thử lại.";
    try {
      const body = await res.json();
      // BE trả về { message: "..." } hoặc { error: "..." }
      message = body?.message ?? body?.error ?? message;
    } catch {
      // ignore parse error
    }
    const err: ApiError = { message, status: res.status };
    throw err;
  }

  return res.json() as Promise<T>;
}

// ===== AUTH =====

export const authApi = {
  login(email: string, password: string) {
    return request<AuthResponse>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
  },

  register(email: string, password: string) {
    return request<AuthResponse>("/api/auth/register", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
  },
};
