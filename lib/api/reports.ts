// lib/api/reports.ts — Reports (báo cáo vi phạm) API endpoints

import { request } from "./client";

// ── DTOs ──────────────────────────────────────────────────────────────────────

export type ReportTargetType = "Tutorial" | "CommunityPost" | "Comment" | "User";

export interface SubmitReportRequest {
  targetType: ReportTargetType;
  targetId: string;
  reason: string;
}

// ── Reports API ────────────────────────────────────────────────────────────────

export const reportsApi = {
  /**
   * POST /api/reports — Báo cáo vi phạm (cần đăng nhập)
   */
  submitReport(
    token: string,
    body: SubmitReportRequest
  ): Promise<{ reportId: string }> {
    return request<{ reportId: string }>("/api/reports", {
      method: "POST",
      body: JSON.stringify({
        TargetType: body.targetType,
        TargetId: body.targetId,
        Reason: body.reason,
      }),
      token,
    });
  },
};
