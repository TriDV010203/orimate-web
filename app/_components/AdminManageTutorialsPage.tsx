"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient, keepPreviousData } from "@tanstack/react-query";
import { adminApi, type ApiError } from "@/lib/api";
import type { AdminTutorialListItemResponse } from "@/lib/api/admin";
import type { TutorialStatusValue } from "@/lib/api/tutorials";
import { isValidImageUrl } from "@/lib/utils";
import { Search, Pencil, Plus, ExternalLink, BookOpen, Loader2, RotateCcw } from "lucide-react";
import { format } from "date-fns";
import toast from "react-hot-toast";

const STATUS_META: Record<TutorialStatusValue, { label: string; badge: string }> = {
  Draft: { label: "Bản nháp", badge: "badge-neutral" },
  PendingManagerReview: { label: "Chờ duyệt", badge: "badge-warning" },
  RevisionRequired: { label: "Cần chỉnh sửa", badge: "badge-danger" },
  Published: { label: "Đã xuất bản", badge: "badge-success" },
  Removed: { label: "Đã gỡ", badge: "badge-neutral" },
  EditPendingReview: { label: "Chờ áp dụng bản sửa", badge: "badge-warning" },
  Merged: { label: "Đã hợp nhất", badge: "badge-neutral" },
};

export default function AdminManageTutorialsPage() {
  const qc = useQueryClient();
  const [tab, setTab] = useState<"official" | "user">("official");
  const [searchText, setSearchText] = useState("");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);

  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchText.trim());
      setPage(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchText]);

  const isOfficial = tab === "official";

  const { data, isLoading } = useQuery({
    queryKey: ["admin-tutorials-all", isOfficial, search, status, page],
    queryFn: () =>
      adminApi.getAllTutorials({
        search: search || undefined,
        status: status || undefined,
        isOfficial,
        page,
        pageSize: 10,
      }),
    placeholderData: keepPreviousData,
  });

  const requestRevisionMut = useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) => adminApi.rejectTutorial(id, reason),
    onSuccess: () => {
      toast.success("Đã gửi yêu cầu chỉnh sửa.");
      qc.invalidateQueries({ queryKey: ["admin-tutorials-all"] });
    },
    onError: (error: unknown) => toast.error((error as ApiError).message || "Lỗi thao tác"),
  });

  const handleRequestRevision = (id: string) => {
    const reason = prompt("Nhập lý do yêu cầu chỉnh sửa (tối thiểu 10 ký tự):");
    if (!reason || reason.length < 10) {
      if (reason !== null) toast.error("Lý do quá ngắn!");
      return;
    }
    requestRevisionMut.mutate({ id, reason });
  };

  return (
    <div>
      <div className="admin-toolbar">
        <div className="admin-page-header" style={{ marginBottom: 0 }}>
          <h1 className="admin-page-title">Quản lý hướng dẫn</h1>
          <p className="admin-page-desc">
            {isOfficial
              ? "Bài hướng dẫn do Admin/Manager viết trực tiếp — sửa lại nội dung bất cứ lúc nào, kể cả bài đã xuất bản."
              : "Bài hướng dẫn do người dùng/creator viết — chỉ có thể yêu cầu chỉnh sửa bằng cách đổi trạng thái, không sửa nội dung trực tiếp."}
          </p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <div className="input-with-icon" style={{ minWidth: 240 }}>
            <Search className="input-icon" size={16} />
            <input
              type="text"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              placeholder="Tìm theo tiêu đề, mô tả..."
              className="input-field"
            />
          </div>
          <select
            value={status}
            onChange={(e) => { setStatus(e.target.value); setPage(1); }}
            style={{ padding: "0.625rem 0.75rem", borderRadius: "var(--radius-md)", border: "1.5px solid var(--color-border)", fontSize: "0.875rem", background: "var(--color-surface)", outline: "none", cursor: "pointer" }}
          >
            <option value="">Tất cả trạng thái</option>
            {Object.entries(STATUS_META).map(([value, meta]) => (
              <option key={value} value={value}>{meta.label}</option>
            ))}
          </select>
          <Link href="/admin/tutorials/new" className="btn btn-primary" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: "0.375rem", whiteSpace: "nowrap" }}>
            <Plus size={16} /> Tạo bài hướng dẫn
          </Link>
        </div>
      </div>

      <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1rem" }}>
        <button
          className={`btn btn-sm ${isOfficial ? "btn-primary" : "btn-outline"}`}
          onClick={() => { setTab("official"); setPage(1); }}
        >
          Bài của Admin/Manager
        </button>
        <button
          className={`btn btn-sm ${!isOfficial ? "btn-primary" : "btn-outline"}`}
          onClick={() => { setTab("user"); setPage(1); }}
        >
          Bài của người dùng/creator
        </button>
      </div>

      <div className="card">
        <div className="admin-table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Bài hướng dẫn</th>
                <th>Tác giả</th>
                <th>Danh mục</th>
                <th>Trạng thái</th>
                <th>Ngày tạo</th>
                <th style={{ textAlign: "right" }}>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="admin-table-loading">
                    <Loader2 className="animate-spin" size={28} style={{ margin: "0 auto 0.5rem" }} />
                    <p>Đang nạp dữ liệu...</p>
                  </td>
                </tr>
              ) : data?.items.length === 0 ? (
                <tr>
                  <td colSpan={6} className="admin-table-empty">
                    <BookOpen size={32} style={{ margin: "0 auto 0.5rem" }} />
                    <p>Không tìm thấy bài hướng dẫn nào</p>
                  </td>
                </tr>
              ) : (
                data?.items.map((t: AdminTutorialListItemResponse) => (
                  <tr key={t.id}>
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", minWidth: 0 }}>
                        <div style={{ width: 44, height: 44, borderRadius: "var(--radius-md)", background: "var(--color-surface-2)", flexShrink: 0, overflow: "hidden" }}>
                          {isValidImageUrl(t.coverImageUrl) && (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={t.coverImageUrl!} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                          )}
                        </div>
                        <div style={{ minWidth: 0 }}>
                          <p style={{ fontWeight: 600, fontSize: "0.875rem", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: 260 }}>
                            {t.title}
                          </p>
                          <div style={{ display: "flex", alignItems: "center", gap: "0.375rem", marginTop: "0.125rem" }}>
                            <span className={`badge ${t.type === "VIP" ? "badge-vip" : "badge-free"}`} style={{ fontSize: "0.6875rem" }}>{t.type}</span>
                            <span style={{ fontSize: "0.75rem", color: "var(--color-text-muted)" }}>{t.stepCount} bước</span>
                            {t.status === "Published" && (
                              <a href={`/huong-dan/${t.slug}`} target="_blank" rel="noreferrer" title="Xem bài" style={{ color: "var(--color-text-muted)", display: "inline-flex" }}>
                                <ExternalLink size={12} />
                              </a>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td>
                      <span>{t.authorName}</span>
                    </td>

                    <td>{t.categoryName}</td>

                    <td>
                      <span className={`badge ${STATUS_META[t.status as TutorialStatusValue]?.badge ?? "badge-neutral"}`}>
                        {STATUS_META[t.status as TutorialStatusValue]?.label ?? t.status}
                      </span>
                    </td>

                    <td>{format(new Date(t.createdAt), "dd/MM/yyyy")}</td>

                    <td>
                      <div style={{ display: "flex", gap: "0.5rem", justifyContent: "flex-end" }}>
                        {isOfficial ? (
                          <Link
                            href={`/admin/tutorials/manage/${t.id}/edit`}
                            className="admin-icon-action"
                            title="Sửa nội dung"
                          >
                            <Pencil size={16} />
                          </Link>
                        ) : t.status === "Published" ? (
                          <button
                            className="admin-icon-action"
                            title="Yêu cầu chỉnh sửa"
                            onClick={() => handleRequestRevision(t.id)}
                            disabled={requestRevisionMut.isPending}
                          >
                            {requestRevisionMut.isPending && requestRevisionMut.variables?.id === t.id ? (
                              <Loader2 className="animate-spin" size={16} />
                            ) : (
                              <RotateCcw size={16} />
                            )}
                          </button>
                        ) : (
                          <span style={{ color: "var(--color-text-muted)", fontSize: "0.75rem" }}>—</span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {data && data.totalPages > 1 && (
          <div className="admin-pagination">
            <span className="admin-pagination-info">
              Trang {data.page} / {data.totalPages}
            </span>
            <div style={{ display: "flex", gap: "0.5rem" }}>
              <button className="btn btn-outline btn-sm" disabled={data.page <= 1} onClick={() => setPage((p) => p - 1)}>
                Trang trước
              </button>
              <button
                className="btn btn-outline btn-sm"
                disabled={data.page >= data.totalPages}
                onClick={() => setPage((p) => p + 1)}
              >
                Trang sau
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
