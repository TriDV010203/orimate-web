"use client";
// _components/AdminCategoriesPage.tsx — Quản trị Danh mục hướng dẫn (dùng cho form đăng bài
// và bộ lọc "Danh mục" trên trang Thư viện). Xóa là xóa mềm (ẩn khỏi mọi danh sách) vì các
// tutorial đã publish vẫn tham chiếu categoryId.

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2, Plus, Pencil, Trash2, Eye, EyeOff, FolderOpen } from "lucide-react";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import toast from "react-hot-toast";
import { adminApi, type CategoryResponse, type ApiError } from "@/lib/api";

interface FormState {
  id: number | null; // null = đang tạo mới
  name: string;
}

const EMPTY_FORM: FormState = { id: null, name: "" };

export default function AdminCategoriesPage() {
  const qc = useQueryClient();
  const [form, setForm] = useState<FormState>(EMPTY_FORM);

  const { data: categories, isLoading } = useQuery({
    queryKey: ["admin-categories"],
    queryFn: () => adminApi.getCategories(),
  });

  const createMut = useMutation({
    mutationFn: (name: string) => adminApi.createCategory(name),
    onSuccess: () => {
      toast.success("Đã tạo danh mục.");
      setForm(EMPTY_FORM);
      qc.invalidateQueries({ queryKey: ["admin-categories"] });
    },
    onError: (error: unknown) => toast.error((error as ApiError).message || "Tạo danh mục thất bại"),
  });

  const updateMut = useMutation({
    mutationFn: (vars: { id: number; body: { name?: string; isActive?: boolean } }) =>
      adminApi.updateCategory(vars.id, vars.body),
    onSuccess: () => {
      toast.success("Đã lưu thay đổi.");
      setForm(EMPTY_FORM);
      qc.invalidateQueries({ queryKey: ["admin-categories"] });
    },
    onError: (error: unknown) => toast.error((error as ApiError).message || "Cập nhật thất bại"),
  });

  const deleteMut = useMutation({
    mutationFn: (id: number) => adminApi.deleteCategory(id),
    onSuccess: () => {
      toast.success("Đã xóa danh mục.");
      qc.invalidateQueries({ queryKey: ["admin-categories"] });
    },
    onError: (error: unknown) => toast.error((error as ApiError).message || "Xóa danh mục thất bại"),
  });

  function handleSubmit() {
    const name = form.name.trim();
    if (name.length < 2 || name.length > 50) {
      toast.error("Tên danh mục phải từ 2-50 ký tự.");
      return;
    }
    if (form.id !== null) {
      updateMut.mutate({ id: form.id, body: { name } });
    } else {
      createMut.mutate(name);
    }
  }

  function startEdit(cat: CategoryResponse) {
    setForm({ id: cat.id, name: cat.name });
  }

  function toggleActive(cat: CategoryResponse) {
    updateMut.mutate({ id: cat.id, body: { isActive: !cat.isActive } });
  }

  function handleDelete(cat: CategoryResponse) {
    if (confirm(`Xóa danh mục "${cat.name}"? Các bài hướng dẫn đã dùng danh mục này sẽ không bị ảnh hưởng, nhưng danh mục sẽ không còn hiển thị để chọn nữa.`)) {
      deleteMut.mutate(cat.id);
    }
  }

  const isEditing = form.id !== null;
  const submitting = createMut.isPending || updateMut.isPending;

  return (
    <div>
      <div className="admin-page-header">
        <h1 className="admin-page-title">Danh mục</h1>
        <p className="admin-page-desc">
          Quản lý danh mục hướng dẫn — dùng cho bộ lọc &quot;Danh mục&quot; ở trang Thư viện và dropdown khi tác giả tạo/sửa bài.
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1.6fr 1fr", gap: "1.5rem", alignItems: "start" }} className="admin-categories-grid">
        {/* ── Danh sách ── */}
        <div className="card">
          <div className="admin-table-wrapper">
            <table className="admin-table">
              <thead>
                <tr>
                  <th style={{ width: 80 }}>ID</th>
                  <th>Tên danh mục</th>
                  <th style={{ width: 140 }}>Trạng thái</th>
                  <th style={{ width: 200 }}>Ngày tạo</th>
                  <th style={{ width: 130, textAlign: "right" }}>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr><td colSpan={5} className="admin-table-loading"><Loader2 className="animate-spin" size={28} style={{ margin: "0 auto" }} /></td></tr>
                ) : !categories || categories.length === 0 ? (
                  <tr><td colSpan={5} className="admin-table-empty"><FolderOpen size={32} style={{ margin: "0 auto 0.5rem" }} /><p>Chưa có danh mục nào.</p></td></tr>
                ) : (
                  categories.map((c) => (
                    <tr key={c.id}>
                      <td>#{c.id}</td>
                      <td style={{ fontWeight: 600 }}>{c.name}</td>
                      <td>
                        <span className={`badge ${c.isActive ? "badge-success" : "badge-neutral"}`}>
                          {c.isActive ? "Đang hiện" : "Đã ẩn"}
                        </span>
                      </td>
                      <td>{format(new Date(c.createdAt), "dd/MM/yyyy HH:mm", { locale: vi })}</td>
                      <td>
                        <div style={{ display: "flex", gap: "0.5rem", justifyContent: "flex-end" }}>
                          <button className="admin-icon-action" title="Sửa" onClick={() => startEdit(c)}>
                            <Pencil size={16} />
                          </button>
                          <button
                            className="admin-icon-action"
                            title={c.isActive ? "Ẩn khỏi bộ lọc" : "Hiện lại"}
                            onClick={() => toggleActive(c)}
                            disabled={updateMut.isPending && updateMut.variables?.id === c.id}
                          >
                            {updateMut.isPending && updateMut.variables?.id === c.id ? (
                              <Loader2 className="animate-spin" size={16} />
                            ) : c.isActive ? (
                              <EyeOff size={16} />
                            ) : (
                              <Eye size={16} />
                            )}
                          </button>
                          <button
                            className="admin-icon-action admin-icon-action-danger"
                            title="Xóa"
                            onClick={() => handleDelete(c)}
                            disabled={deleteMut.isPending && deleteMut.variables === c.id}
                          >
                            {deleteMut.isPending && deleteMut.variables === c.id ? (
                              <Loader2 className="animate-spin" size={16} />
                            ) : (
                              <Trash2 size={16} />
                            )}
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

        {/* ── Form tạo/sửa ── */}
        <div className="card" style={{ padding: "1.25rem" }}>
          <h3 style={{ fontWeight: 700, fontSize: "1rem", marginBottom: "0.875rem" }}>
            {isEditing ? "Sửa danh mục" : "Thêm danh mục mới"}
          </h3>

          <div className="input-group">
            <label className="input-label">Tên danh mục *</label>
            <input
              type="text"
              className="input-field"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              placeholder="VD: Động vật, Hoa & Thực vật..."
              maxLength={50}
            />
          </div>

          <div style={{ display: "flex", gap: "0.625rem" }}>
            <button onClick={handleSubmit} disabled={submitting || !form.name.trim()} className="btn btn-primary" style={{ flex: 1 }}>
              {submitting ? (
                <Loader2 className="animate-spin" size={16} />
              ) : isEditing ? (
                "Lưu thay đổi"
              ) : (
                <>
                  <Plus size={16} /> Thêm danh mục
                </>
              )}
            </button>
            {isEditing && (
              <button onClick={() => setForm(EMPTY_FORM)} className="btn btn-outline" disabled={submitting}>
                Huỷ
              </button>
            )}
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 960px) {
          .admin-categories-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}
