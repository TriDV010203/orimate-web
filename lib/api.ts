// lib/api.ts — HTTP client kết nối tới backend OriMate
// next.config.ts đã cấu hình rewrite: /api/* → http://localhost:5104/api/*
// → FE chỉ cần gọi /api/... (tương đối), Next.js server sẽ proxy tới BE
// → Không cần CORS vì browser chỉ nói chuyện với Next.js (cùng origin)

const BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "";


export interface AuthResponse {
  userId: string;
  email: string;
  displayName?: string;
  roles: string[];
  token: string;
  expiresAt: string; // ISO datetime string
}

export interface ApiError {
  message: string;
  status: number;
}

// ── Achievement types (matches BE DTOs) ──────────────────────────────────────
export interface AchievementDto {
  achievementId: string;
  userId: string;
  tutorialId?: string | null;
  title: string;
  description?: string | null;
  mediaUrl?: string | null;
  completedAt: string;
  isPublic: boolean;
}

export interface CreateAchievementRequest {
  tutorialId?: string | null;
  title: string;
  description?: string | null;
  mediaUrl?: string | null;
  isPublic: boolean;
}

export interface UpdateAchievementRequest {
  title?: string;
  description?: string | null;
  isPublic?: boolean;
}

export interface PaginatedResult<T> {
  items: T[];
  totalCount: number;
  page: number;
  pageSize: number;
}

// ─────────────────────────────────────────────────────────────────────────────

async function request<T>(
  path: string,
  options?: RequestInit & { token?: string }
): Promise<T> {
  const { token, ...fetchOptions } = options ?? {};

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(fetchOptions.headers as Record<string, string> ?? {}),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const fullUrl = `${BASE_URL}${path}`;
  console.log("[api] →", fetchOptions.method ?? "GET", fullUrl);

  let res: Response;
  try {
    res = await fetch(fullUrl, {
      ...fetchOptions,
      headers,
    });
  } catch (networkErr) {
    console.error("[api] Network error calling", fullUrl, networkErr);
    // Nếu proxy không work, thử gọi trực tiếp BE
    throw { message: "Không thể kết nối tới server. Hãy kiểm tra API có đang chạy không.", status: 0 };
  }

  console.log("[api] ←", res.status, fullUrl);

  if (!res.ok) {
    let message = "Đã xảy ra lỗi. Vui lòng thử lại.";
    try {
      const body = await res.json();
      message = body?.message ?? body?.error ?? body?.title ?? message;
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

  register(email: string, password: string, displayName: string) {
    return request<AuthResponse>("/api/auth/register", {
      method: "POST",
      body: JSON.stringify({ email, password, displayName }),
    });
  },
};

// ===== ACHIEVEMENTS =====

export const achievementsApi = {
  /** GET /api/users/{userId}/achievements — Xem thành tựu của bất kỳ user nào (public) */
  getByUser(
    userId: string,
    page = 1,
    pageSize = 12
  ): Promise<PaginatedResult<AchievementDto>> {
    return request(`/api/users/${userId}/achievements?page=${page}&pageSize=${pageSize}`);
  },

  /** GET /api/achievements/me — Xem thành tựu của chính mình (kể cả private) */
  getMine(
    token: string,
    page = 1,
    pageSize = 12
  ): Promise<PaginatedResult<AchievementDto>> {
    return request(`/api/achievements/me?page=${page}&pageSize=${pageSize}`, { token });
  },

  /** POST /api/achievements — Tạo thành tựu mới */
  create(
    token: string,
    body: CreateAchievementRequest
  ): Promise<AchievementDto> {
    return request<AchievementDto>("/api/achievements", {
      method: "POST",
      body: JSON.stringify(body),
      token,
    });
  },

  /** PUT /api/achievements/{id} — Sửa thành tựu */
  update(
    token: string,
    achievementId: string,
    body: UpdateAchievementRequest
  ): Promise<AchievementDto> {
    return request<AchievementDto>(`/api/achievements/${achievementId}`, {
      method: "PUT",
      body: JSON.stringify(body),
      token,
    });
  },

  /** DELETE /api/achievements/{id} — Xóa thành tựu */
  delete(token: string, achievementId: string): Promise<void> {
    return request<void>(`/api/achievements/${achievementId}`, {
      method: "DELETE",
      token,
    });
  },
};
