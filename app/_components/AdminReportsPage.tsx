"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { adminApi, type ApiError } from "@/lib/api";
import type { PendingReportDto } from "@/lib/api/admin";
import type { ReportActionType } from "@/lib/api/reports";
import type { TargetType } from "@/lib/api/client";
import { Check, EyeOff, ShieldAlert, Loader2, ExternalLink } from "lucide-react";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import toast from "react-hot-toast";

// Dựng link xem chi tiết nội dung bị báo cáo — trả về null nếu chưa hỗ trợ xem trước
// (vd. StuckThread, bài nộp thử thách... chưa có trang chi tiết công khai).
function getReportTargetHref(rep: PendingReportDto): string | null {
  if (rep.targetType === "CommunityPost") {
    return `/cong-dong/${rep.targetId}?fromReport=1`;
  }
  if (rep.targetType === "Tutorial") {
    return rep.targetSlug ? `/huong-dan/${rep.targetSlug}?fromReport=1` : null;
  }
  if (rep.targetType === "Comment") {
    if (rep.rootTargetType === "CommunityPost" && rep.rootTargetId) {
      return `/cong-dong/${rep.rootTargetId}?fromReport=1&highlightComment=${rep.targetId}`;
    }
    if (rep.rootTargetType === "Tutorial" && rep.targetSlug) {
      return `/huong-dan/${rep.targetSlug}?fromReport=1&highlightComment=${rep.targetId}`;
    }
    return null;
  }
  return null;
}

const TARGET_TYPE_NAME: Record<TargetType, string> = {
  Tutorial: "Hướng dẫn",
  CommunityPost: "Bài đăng",
  Comment: "Bình luận",
  StuckThread: "Chủ đề hỏi bị kẹt",
  DailyChallengeSubmission: "Bài nộp thử thách ngày",
};

const REPORT_ACTIONS: { type: ReportActionType; label: string }[] = [
  { type: "Dismiss", label: "Bỏ qua (Không vi phạm)" },
  { type: "RemoveContent", label: "Gỡ bỏ nội dung này" },
  { type: "SuspendAccount", label: "Khóa tài khoản người đăng" },
];

export default function AdminReportsPage() {
  const qc = useQueryClient();
  const { data: reports, isLoading } = useQuery({
    queryKey: ["admin-reports"],
    queryFn: () => adminApi.getPendingReports(),
  });

  const handleMut = useMutation({
    mutationFn: ({ id, actionType }: { id: string; actionType: ReportActionType }) =>
      adminApi.handleReport(id, actionType),
    onSuccess: () => {
      toast.success("Đã xử lý khiếu nại thành công!");
      qc.invalidateQueries({ queryKey: ["admin-reports"] });
    },
    onError: (error: unknown) => toast.error((error as ApiError).message || "Lỗi khi xử lý báo cáo"),
  });

  const processReport = (id: string, actionType: ReportActionType) => {
    const label = REPORT_ACTIONS.find((a) => a.type === actionType)?.label ?? actionType;
    if (confirm(`Xác nhận hành động: ${label}?`)) handleMut.mutate({ id, actionType });
  };

  return (
    <div>
      <div className="admin-page-header">
        <h1 className="admin-page-title">Xử lý Báo cáo vi phạm</h1>
        <p className="admin-page-desc">Kiểm tra và áp dụng biện pháp với nội dung bị báo cáo.</p>
      </div>

      <div className="card">
        <div className="admin-table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Nguồn</th>
                <th>Nội dung bị tố cáo</th>
                <th>Lý do vi phạm</th>
                <th>Thời gian gửi</th>
                <th style={{ textAlign: "right" }}>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="admin-table-loading">
                    <Loader2 className="animate-spin" size={28} style={{ margin: "0 auto" }} />
                  </td>
                </tr>
              ) : !reports || reports.length === 0 ? (
                <tr>
                  <td colSpan={5} className="admin-table-empty">
                    Không có báo cáo vi phạm
                  </td>
                </tr>
              ) : (
                reports.map((rep) => {
                  const href = getReportTargetHref(rep);
                  return (
                  <tr key={rep.id}>
                    <td>
                      <span className="badge badge-neutral">{TARGET_TYPE_NAME[rep.targetType] ?? "Khác"}</span>
                    </td>
                    <td>
                      {href ? (
                        <Link
                          href={href}
                          title="Xem chi tiết nội dung bị báo cáo"
                          style={{ color: "var(--color-primary)", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: "0.375rem" }}
                          onMouseEnter={(e) => (e.currentTarget.style.textDecoration = "underline")}
                          onMouseLeave={(e) => (e.currentTarget.style.textDecoration = "none")}
                        >
                          &quot;
                          {rep.targetContent || (
                            <span style={{ color: "var(--color-text-muted)" }}>[Nội dung đã bị xóa ẩn]</span>
                          )}
                          &quot;
                          <ExternalLink size={13} style={{ flexShrink: 0 }} />
                        </Link>
                      ) : (
                        <>
                          &quot;
                          {rep.targetContent || (
                            <span style={{ color: "var(--color-text-muted)" }}>[Nội dung đã bị xóa ẩn]</span>
                          )}
                          &quot;
                        </>
                      )}
                    </td>
                    <td>{rep.reason}</td>
                    <td>{format(new Date(rep.createdAt), "HH:mm dd/MM/yyyy", { locale: vi })}</td>
                    <td>
                      <div style={{ display: "flex", gap: "0.5rem", justifyContent: "flex-end" }}>
                        <button
                          className="admin-icon-action admin-icon-action-success"
                          title="Bỏ qua"
                          onClick={() => processReport(rep.id, "Dismiss")}
                          disabled={handleMut.isPending}
                        >
                          <Check size={16} />
                        </button>
                        <button
                          className="admin-icon-action admin-icon-action-danger"
                          title="Gỡ bỏ"
                          onClick={() => processReport(rep.id, "RemoveContent")}
                          disabled={handleMut.isPending}
                        >
                          <EyeOff size={16} />
                        </button>
                        <button
                          className="admin-icon-action admin-icon-action-danger"
                          title="Khóa TK"
                          onClick={() => processReport(rep.id, "SuspendAccount")}
                          disabled={handleMut.isPending}
                        >
                          <ShieldAlert size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
