// lib/api/client.ts — HTTP client nội bộ (shared across all API modules)
// next.config.ts đã cấu hình rewrite: /api/* → BE (mặc định http://orimate.runasp.net/api/*)
// → FE chỉ cần gọi /api/... (tương đối), Next.js server sẽ proxy tới BE
// → Không cần CORS, không bị mixed-content vì browser chỉ nói chuyện với Next.js (cùng origin)

export const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "";

export interface ApiError {
  message: string;
  status: number;
}

/** BE Domain.Enums.TargetType — dùng chung cho Likes, Comments, Wishlists, Reports. */
export type TargetType =
  | "Tutorial"
  | "CommunityPost"
  | "Comment"
  | "StuckThread"
  | "DailyChallengeSubmission"
  | "WeeklyChallengeSubmission";

export async function request<T>(
  path: string,
  options?: RequestInit & { token?: string; expectedErrorStatuses?: number[] }
): Promise<T> {
  const { token, expectedErrorStatuses = [], ...fetchOptions } = options ?? {};

  // FormData tự set Content-Type kèm boundary — không được set tay, browser lo việc đó
  const isFormData = typeof FormData !== "undefined" && fetchOptions.body instanceof FormData;

  const headers: Record<string, string> = {
    ...(isFormData ? {} : { "Content-Type": "application/json" }),
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
    throw { message: "Không thể kết nối tới server. Hãy kiểm tra API có đang chạy không.", status: 0 } satisfies ApiError;
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
    if (!expectedErrorStatuses.includes(res.status)) {
      console.error("[api] Error response:", res.status, message);
    }
    throw err;
  }

  return res.json() as Promise<T>;
}
