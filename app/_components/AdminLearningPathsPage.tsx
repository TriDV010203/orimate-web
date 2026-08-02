"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient, keepPreviousData } from "@tanstack/react-query";
import { learningPathsApi } from "@/lib/api/learning-paths";
import type { LearningPathStatusValue } from "@/lib/api/learning-paths";
import type { ApiError } from "@/lib/api";
import { getToken } from "@/lib/auth";
import { isValidImageUrl } from "@/lib/utils";
import { Search, Pencil, Plus, ExternalLink, Map, Loader2, Rocket, Archive } from "lucide-react";
import { format } from "date-fns";
import toast from "react-hot-toast";

const STATUS_META: Record<LearningPathStatusValue, { label: string; badge: string }> = {
  Draft: { label: "Bản nháp", badge: "badge-neutral" },
  Published: { label: "Đã xuất bản", badge: "badge-success" },
  Archived: { label: "Đã lưu trữ", badge: "badge-danger" },
};

export default function AdminLearningPathsPage() {
  const qc = useQueryClient();
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

  const token = getToken() ?? "";

  const { data, isLoading } = useQuery({
    queryKey: ["admin-learning-paths", search, status, page],
    queryFn: () =>
      learningPathsApi.getAllAdmin(token, {
        search: search || undefined,
        status: status || undefined,
        page,
        pageSize: 10,
      }),
    placeholderData: keepPreviousData,
  });

  const publishMut = useMutation({
    mutationFn: (id: string) => learningPathsApi.publish(token, id),
    onSuccess: () => {
      toast.success("Đã xuất bản lộ trình.");
      qc.invalidateQueries({ queryKey: ["admin-learning-paths"] });
    },
    onError: (error: unknown) => toast.error((error as ApiError).message || "Lỗi thao tác"),
  });

  const archiveMut = useMutation({
    mutationFn: (id: string) => learningPathsApi.archive(token, id),
    onSuccess: () => {
      toast.success("Đã lưu trữ lộ trình.");
      qc.invalidateQueries({ queryKey: ["admin-learning-paths"] });
    },
    onError: (error: unknown) => toast.error((error as ApiError).message || "Lỗi thao tác"),
  });

  return (
    <div>
      <div className="admin-toolbar">
        <div className="admin-page-header" style={{ marginBottom: 0 }}>
          <h1 className="admin-page-title">Lộ trình học</h1>
          <p className="admin-page-desc">
            Biên soạn lộ trình từ chính các bài hướng dẫn Admin/Manager đã đăng (official, đã xuất bản) — sắp xếp theo thứ tự cố định.
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
          <Link href="/admin/learning-paths/new" className="btn btn-primary" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: "0.375rem", whiteSpace: "nowrap" }}>
            <Plus size={16} /> Tạo lộ trình
          </Link>
        </div>
      </div>

      <div className="card">
        <div className="admin-table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Lộ trình</th>
                <th>Số bài</th>
                <th>Trạng thái</th>
                <th>Ngày tạo</th>
                <th style={{ textAlign: "right" }}>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="admin-table-loading">
                    <Loader2 className="animate-spin" size={28} style={{ margin: "0 auto 0.5rem" }} />
                    <p>Đang nạp dữ liệu...</p>
                  </td>
                </tr>
              ) : data?.items.length === 0 ? (
                <tr>
                  <td colSpan={5} className="admin-table-empty">
                    <Map size={32} style={{ margin: "0 auto 0.5rem" }} />
                    <p>Chưa có lộ trình học nào</p>
                  </td>
                </tr>
              ) : (
                data?.items.map((p) => (
                  <tr key={p.id}>
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", minWidth: 0 }}>
                        <div style={{ width: 44, height: 44, borderRadius: "var(--radius-md)", background: "var(--color-surface-2)", flexShrink: 0, overflow: "hidden" }}>
                          {isValidImageUrl(p.coverImageUrl) && (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={p.coverImageUrl!} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                          )}
                        </div>
                        <div style={{ minWidth: 0 }}>
                          <p style={{ fontWeight: 600, fontSize: "0.875rem", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: 320 }}>
                            {p.title}
                          </p>
                          {p.status === "Published" && (
                            <a href={`/lo-trinh/${p.id}`} target="_blank" rel="noreferrer" title="Xem lộ trình" style={{ color: "var(--color-text-muted)", display: "inline-flex", marginTop: "0.125rem" }}>
                              <ExternalLink size={12} />
                            </a>
                          )}
                        </div>
                      </div>
                    </td>

                    <td>{p.itemCount} bài</td>

                    <td>
                      <span className={`badge ${STATUS_META[p.status]?.badge ?? "badge-neutral"}`}>
                        {STATUS_META[p.status]?.label ?? p.status}
                      </span>
                    </td>

                    <td>{format(new Date(p.createdAt), "dd/MM/yyyy")}</td>

                    <td>
                      <div style={{ display: "flex", gap: "0.5rem", justifyContent: "flex-end" }}>
                        <Link href={`/admin/learning-paths/${p.id}/edit`} className="admin-icon-action" title="Sửa">
                          <Pencil size={16} />
                        </Link>
                        {p.status !== "Published" && (
                          <button
                            className="admin-icon-action"
                            title="Xuất bản"
                            onClick={() => publishMut.mutate(p.id)}
                            disabled={publishMut.isPending}
                          >
                            {publishMut.isPending && publishMut.variables === p.id ? (
                              <Loader2 className="animate-spin" size={16} />
                            ) : (
                              <Rocket size={16} />
                            )}
                          </button>
                        )}
                        {p.status !== "Archived" && (
                          <button
                            className="admin-icon-action"
                            title="Lưu trữ"
                            onClick={() => {
                              if (confirm(`Lưu trữ lộ trình "${p.title}"? Lộ trình sẽ bị ẩn khỏi trang công khai.`)) {
                                archiveMut.mutate(p.id);
                              }
                            }}
                            disabled={archiveMut.isPending}
                          >
                            {archiveMut.isPending && archiveMut.variables === p.id ? (
                              <Loader2 className="animate-spin" size={16} />
                            ) : (
                              <Archive size={16} />
                            )}
                          </button>
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
