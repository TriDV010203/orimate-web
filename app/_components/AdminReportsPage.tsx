"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminApi, type ApiError } from "@/lib/api";
import { Check, EyeOff, ShieldAlert, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import toast from "react-hot-toast";

const TARGET_TYPE_NAME: Record<number, string> = {
  0: "Hướng dẫn",
  1: "Bài đăng",
  2: "Bình luận",
};

export default function AdminReportsPage() {
  const qc = useQueryClient();
  const { data: reports, isLoading } = useQuery({
    queryKey: ["admin-reports"],
    queryFn: () => adminApi.getPendingReports(),
  });

  const handleMut = useMutation({
    mutationFn: ({ id, actionType }: { id: string; actionType: number }) =>
      adminApi.handleReport(id, actionType),
    onSuccess: () => {
      toast.success("Đã xử lý khiếu nại thành công!");
      qc.invalidateQueries({ queryKey: ["admin-reports"] });
    },
    onError: (error: unknown) => toast.error((error as ApiError).message || "Lỗi khi xử lý báo cáo"),
  });

  const processReport = (id: string, actionType: number) => {
    const actions = ["Bỏ qua (Không vi phạm)", "Gỡ bỏ nội dung này", "Khóa tài khoản người đăng"];
    if (confirm(`Xác nhận hành động: ${actions[actionType]}?`)) handleMut.mutate({ id, actionType });
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
                reports.map((rep) => (
                  <tr key={rep.id}>
                    <td>
                      <span className="badge badge-neutral">{TARGET_TYPE_NAME[rep.targetType] ?? "Khác"}</span>
                    </td>
                    <td>
                      &quot;
                      {rep.targetContent || (
                        <span style={{ color: "var(--color-text-muted)" }}>[Nội dung đã bị xóa ẩn]</span>
                      )}
                      &quot;
                    </td>
                    <td>{rep.reason}</td>
                    <td>{format(new Date(rep.createdAt), "HH:mm dd/MM/yyyy", { locale: vi })}</td>
                    <td>
                      <div style={{ display: "flex", gap: "0.5rem", justifyContent: "flex-end" }}>
                        <button
                          className="admin-icon-action admin-icon-action-success"
                          title="Bỏ qua"
                          onClick={() => processReport(rep.id, 0)}
                          disabled={handleMut.isPending}
                        >
                          <Check size={16} />
                        </button>
                        <button
                          className="admin-icon-action admin-icon-action-danger"
                          title="Gỡ bỏ"
                          onClick={() => processReport(rep.id, 1)}
                          disabled={handleMut.isPending}
                        >
                          <EyeOff size={16} />
                        </button>
                        <button
                          className="admin-icon-action admin-icon-action-danger"
                          title="Khóa TK"
                          onClick={() => processReport(rep.id, 2)}
                          disabled={handleMut.isPending}
                        >
                          <ShieldAlert size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
