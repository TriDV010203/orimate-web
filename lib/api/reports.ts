// lib/api/reports.ts — Reports (báo cáo vi phạm) API endpoints

import { request, type TargetType } from "./client";

export type { TargetType };

// ── DTOs ──────────────────────────────────────────────────────────────────────

/** BE Domain.Enums.ReportActionType */
export type ReportActionType = "Dismiss" | "RemoveContent" | "SuspendAccount";

export interface SubmitReportRequest {
  targetType: TargetType;
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
      body: JSON.stringify(body),
      token,
    });
  },
};
