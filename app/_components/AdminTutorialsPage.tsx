"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminApi, type ApiError } from "@/lib/api";
import { Check, X, ExternalLink, Loader2, PartyPopper } from "lucide-react";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import toast from "react-hot-toast";

export default function AdminTutorialsPage() {
  const qc = useQueryClient();

  const { data: queueData, isLoading } = useQuery({
    queryKey: ["admin-tutorials-queue"],
    queryFn: () => adminApi.getManagerQueue(),
  });
  const queue = queueData?.items ?? [];

  const invalidate = () => qc.invalidateQueries({ queryKey: ["admin-tutorials-queue"] });

  const publishMut = useMutation({
    mutationFn: (id: string) => adminApi.publishTutorial(id),
    onSuccess: () => {
      toast.success("Đã xuất bản thành công!");
      invalidate();
    },
    onError: (error: unknown) => toast.error((error as ApiError).message || "Lỗi xuất bản"),
  });

  const rejectMut = useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) => adminApi.rejectTutorial(id, reason),
    onSuccess: () => {
      toast.success("Đã gửi yêu cầu sửa.");
      invalidate();
    },
    onError: (error: unknown) => toast.error((error as ApiError).message || "Lỗi thao tác"),
  });

  const approveEditMut = useMutation({
    mutationFn: (id: string) => adminApi.approveEdit(id),
    onSuccess: () => {
      toast.success("Đã duyệt bản chỉnh sửa!");
      invalidate();
    },
    onError: (error: unknown) => toast.error((error as ApiError).message || "Lỗi duyệt bản sửa"),
  });

  const rejectEditMut = useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) => adminApi.rejectEdit(id, reason),
    onSuccess: () => {
      toast.success("Đã từ chối bản chỉnh sửa.");
      invalidate();
    },
    onError: (error: unknown) => toast.error((error as ApiError).message || "Lỗi thao tác"),
  });

  const isBusy =
    publishMut.isPending || rejectMut.isPending || approveEditMut.isPending || rejectEditMut.isPending;

  const handleReject = (id: string, isEdit: boolean) => {
    const reason = prompt("Nhập lý do từ chối (tối thiểu 10 ký tự):");
    if (!reason || reason.length < 10) {
      if (reason !== null) toast.error("Lý do quá ngắn!");
      return;
    }
    if (isEdit) {
      rejectEditMut.mutate({ id, reason });
    } else {
      rejectMut.mutate({ id, reason });
    }
  };

  return (
    <div>
      <div className="admin-toolbar">
        <div className="admin-page-header" style={{ marginBottom: 0 }}>
          <h1 className="admin-page-title">Duyệt bài Hướng dẫn</h1>
          <p className="admin-page-desc">Danh sách chờ được xuất bản lên nền tảng.</p>
        </div>
        <div className="card" style={{ padding: "0.75rem 1.25rem" }}>
          <span className="admin-stat-label">Bài chờ duyệt: </span>
          <strong>{queueData?.totalCount ?? 0}</strong>
        </div>
      </div>

      {isLoading ? (
        <div className="card admin-queue-item">
          <Loader2 className="animate-spin" size={24} />
        </div>
      ) : queue.length === 0 ? (
        <div className="card admin-empty-state">
          <div className="admin-empty-icon">
            <PartyPopper size={28} style={{ color: "#94a3b8" }} />
          </div>
          <h3 style={{ fontWeight: 700, marginBottom: "0.25rem" }}>Tuyệt vời, không có hàng chờ!</h3>
          <p>Hiện không có bài hướng dẫn nào cần phê duyệt.</p>
        </div>
      ) : (
        queue.map((item) => (
          <div key={item.id} className="card admin-queue-item">
            <div>
              <div className="admin-queue-item-meta">
                <span className={`badge ${item.isEdit ? "badge-neutral" : "badge-warning"}`}>
                  {item.isEdit ? "Chỉnh sửa" : "Bài mới"}
                </span>
                <span>
                  🕒 {format(new Date(item.createdAt), "HH:mm dd/MM/yyyy", { locale: vi })}
                </span>
              </div>
              <h3 className="admin-queue-item-title">
                {item.title}
                <a href={`/huong-dan/${item.slug}?preview=true`} target="_blank" rel="noreferrer" title="Xem trước">
                  <ExternalLink size={14} />
                </a>
              </h3>
              <p className="admin-queue-item-desc">
                Tác giả: <strong>{item.authorName}</strong> · Quy mô: <strong>{item.stepCount} bước</strong>
              </p>
            </div>

            <div className="admin-queue-item-actions">
              <button
                className="btn btn-outline btn-sm"
                onClick={() => handleReject(item.id, item.isEdit)}
                disabled={isBusy}
              >
                <X size={16} /> Sửa
              </button>
              <button
                className="btn btn-primary btn-sm"
                onClick={() =>
                  item.isEdit ? approveEditMut.mutate(item.id) : publishMut.mutate(item.id)
                }
                disabled={isBusy}
              >
                {(publishMut.isPending && publishMut.variables === item.id) ||
                (approveEditMut.isPending && approveEditMut.variables === item.id) ? (
                  <Loader2 className="animate-spin" size={16} />
                ) : (
                  <Check size={16} />
                )}{" "}
                Xuất bản
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
