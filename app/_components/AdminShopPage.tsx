"use client";
// _components/AdminShopPage.tsx — Quản trị Cửa hàng liên kết affiliate (FT-18)
//
// Chỉ là danh sách link ra shop ngoài (giấy, kit, sách...), Admin toàn quyền
// tạo/sửa/ẩn-hiện. Không có giỏ hàng, không thanh toán — Hạt Gấp không tiêu ở đây.

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2, Plus, Pencil, ExternalLink, Eye, EyeOff, ShoppingBag } from "lucide-react";
import toast from "react-hot-toast";
import { shopApi, type ShopLinkResponse } from "@/lib/api/shop";
import type { ApiError } from "@/lib/api/client";
import { getToken } from "@/lib/auth";
import { isValidImageUrl } from "@/lib/utils";

interface FormState {
  id: string | null; // null = đang tạo mới
  title: string;
  url: string;
  imageUrl: string;
  category: string;
  isActive: boolean;
}

const EMPTY_FORM: FormState = { id: null, title: "", url: "", imageUrl: "", category: "", isActive: true };

export default function AdminShopPage() {
  const qc = useQueryClient();
  const token = getToken() ?? "";
  const [form, setForm] = useState<FormState>(EMPTY_FORM);

  const { data: links, isLoading } = useQuery({
    queryKey: ["admin-shop-links"],
    queryFn: () => shopApi.getAllAdmin(token),
    enabled: !!token,
  });

  const createMut = useMutation({
    mutationFn: () =>
      shopApi.create(token, {
        title: form.title.trim(),
        url: form.url.trim(),
        imageUrl: form.imageUrl.trim() || null,
        category: form.category.trim() || null,
      }),
    onSuccess: () => {
      toast.success("Đã tạo link cửa hàng.");
      setForm(EMPTY_FORM);
      qc.invalidateQueries({ queryKey: ["admin-shop-links"] });
    },
    onError: (error: unknown) => toast.error((error as ApiError).message || "Tạo link thất bại"),
  });

  const updateMut = useMutation({
    mutationFn: (vars: { id: string; body: FormState }) =>
      shopApi.update(token, vars.id, {
        title: vars.body.title.trim(),
        url: vars.body.url.trim(),
        imageUrl: vars.body.imageUrl.trim() || null,
        category: vars.body.category.trim() || null,
        isActive: vars.body.isActive,
      }),
    onSuccess: () => {
      toast.success("Đã lưu thay đổi.");
      setForm(EMPTY_FORM);
      qc.invalidateQueries({ queryKey: ["admin-shop-links"] });
    },
    onError: (error: unknown) => toast.error((error as ApiError).message || "Cập nhật thất bại"),
  });

  function handleSubmit() {
    if (!form.title.trim() || !form.url.trim()) {
      toast.error("Vui lòng nhập Tiêu đề và Url.");
      return;
    }
    if (form.id) {
      updateMut.mutate({ id: form.id, body: form });
    } else {
      createMut.mutate();
    }
  }

  function startEdit(link: ShopLinkResponse) {
    setForm({
      id: link.id,
      title: link.title,
      url: link.url,
      imageUrl: link.imageUrl ?? "",
      category: link.category ?? "",
      isActive: link.isActive,
    });
  }

  function toggleActive(link: ShopLinkResponse) {
    updateMut.mutate({
      id: link.id,
      body: {
        id: link.id,
        title: link.title,
        url: link.url,
        imageUrl: link.imageUrl ?? "",
        category: link.category ?? "",
        isActive: !link.isActive,
      },
    });
  }

  const isEditing = form.id !== null;
  const submitting = createMut.isPending || updateMut.isPending;

  return (
    <div>
      <div className="admin-page-header">
        <h1 className="admin-page-title">Cửa hàng</h1>
        <p className="admin-page-desc">
          Quản lý link affiliate ra shop ngoài (giấy, kit, sách gấp giấy...). Chỉ là link tham khảo — không có giỏ hàng hay thanh toán trong hệ thống.
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1.6fr 1fr", gap: "1.5rem", alignItems: "start" }} className="admin-shop-grid">
        {/* ── Danh sách link ── */}
        <div className="card">
          <div className="admin-table-wrapper">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Link</th>
                  <th>Danh mục</th>
                  <th>Trạng thái</th>
                  <th style={{ textAlign: "right" }}>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr><td colSpan={4} className="admin-table-loading"><Loader2 className="animate-spin" size={28} style={{ margin: "0 auto" }} /></td></tr>
                ) : !links || links.length === 0 ? (
                  <tr><td colSpan={4} className="admin-table-empty"><ShoppingBag size={32} style={{ margin: "0 auto 0.5rem" }} /><p>Chưa có link cửa hàng nào.</p></td></tr>
                ) : (
                  links.map((l) => (
                    <tr key={l.id}>
                      <td>
                        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", minWidth: 0 }}>
                          <div style={{ width: 44, height: 44, borderRadius: "var(--radius-md)", background: "var(--color-surface-2)", flexShrink: 0, overflow: "hidden" }}>
                            {isValidImageUrl(l.imageUrl) && (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img src={l.imageUrl!} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                            )}
                          </div>
                          <div style={{ minWidth: 0 }}>
                            <p style={{ fontWeight: 600, fontSize: "0.875rem", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: 260 }}>
                              {l.title}
                            </p>
                            <a href={l.url} target="_blank" rel="noopener noreferrer" title={l.url} style={{ color: "var(--color-text-muted)", fontSize: "0.75rem", display: "inline-flex", alignItems: "center", gap: "0.25rem", marginTop: "0.125rem" }}>
                              <ExternalLink size={11} /> Xem link
                            </a>
                          </div>
                        </div>
                      </td>
                      <td>{l.category ? <span className="badge badge-category">{l.category}</span> : <span style={{ color: "var(--color-text-muted)" }}>—</span>}</td>
                      <td>
                        <span className={`badge ${l.isActive ? "badge-success" : "badge-neutral"}`}>
                          {l.isActive ? "Đang hiện" : "Đã ẩn"}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: "flex", gap: "0.5rem", justifyContent: "flex-end" }}>
                          <button className="admin-icon-action" title="Sửa" onClick={() => startEdit(l)}>
                            <Pencil size={16} />
                          </button>
                          <button
                            className="admin-icon-action"
                            title={l.isActive ? "Ẩn khỏi trang Cửa hàng" : "Hiện lại trên trang Cửa hàng"}
                            onClick={() => toggleActive(l)}
                            disabled={updateMut.isPending && updateMut.variables?.id === l.id}
                          >
                            {updateMut.isPending && updateMut.variables?.id === l.id ? (
                              <Loader2 className="animate-spin" size={16} />
                            ) : l.isActive ? (
                              <EyeOff size={16} />
                            ) : (
                              <Eye size={16} />
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
            {isEditing ? "Sửa link" : "Thêm link mới"}
          </h3>

          <div className="input-group">
            <label className="input-label">Tiêu đề *</label>
            <input
              type="text"
              className="input-field"
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              placeholder="VD: Bộ giấy Origami 100 tờ"
            />
          </div>

          <div className="input-group">
            <label className="input-label">Url *</label>
            <input
              type="text"
              className="input-field"
              value={form.url}
              onChange={(e) => setForm((f) => ({ ...f, url: e.target.value }))}
              placeholder="https://shop.vn/san-pham/..."
            />
          </div>

          <div className="input-group">
            <label className="input-label">Ảnh (Url)</label>
            <input
              type="text"
              className="input-field"
              value={form.imageUrl}
              onChange={(e) => setForm((f) => ({ ...f, imageUrl: e.target.value }))}
              placeholder="https://..."
            />
          </div>

          <div className="input-group">
            <label className="input-label">Danh mục</label>
            <input
              type="text"
              className="input-field"
              value={form.category}
              onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
              placeholder="VD: Giấy, Kit, Sách"
            />
          </div>

          {isEditing && (
            <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.875rem", marginBottom: "1rem", cursor: "pointer" }}>
              <input
                type="checkbox"
                checked={form.isActive}
                onChange={(e) => setForm((f) => ({ ...f, isActive: e.target.checked }))}
              />
              Hiện trên trang Cửa hàng
            </label>
          )}

          <div style={{ display: "flex", gap: "0.625rem" }}>
            <button onClick={handleSubmit} disabled={submitting} className="btn btn-primary" style={{ flex: 1 }}>
              {submitting ? (
                <Loader2 className="animate-spin" size={16} />
              ) : isEditing ? (
                "Lưu thay đổi"
              ) : (
                <>
                  <Plus size={16} /> Thêm link
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
          .admin-shop-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}
