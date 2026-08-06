"use client";

import { useEffect, useState } from "react";
import {
  useQuery,
  useMutation,
  useQueryClient,
  keepPreviousData,
} from "@tanstack/react-query";
import { adminApi, type ApiError } from "@/lib/api";
import {
  Lock,
  Unlock,
  Loader2,
  UserX,
  Search,
  Pencil,
  ChevronRight,
  Plus,
  X,
} from "lucide-react";
import { format } from "date-fns";
import toast from "react-hot-toast";

interface User {
  id: string;
  displayName?: string | null;
  email: string;
  roles: string[];
  status: string;
  createdAt: string;
}

const ROLE_BADGE: Record<string, string> = {
  Admin: "badge-warning",
  Manager: "badge-success",
};

export default function AdminUsersPage() {
  const qc = useQueryClient();
  const [keyword, setKeyword] = useState("");
  const [page, setPage] = useState(1);
  const [searchText, setSearchText] = useState("");
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [addOpen, setAddOpen] = useState(false);
  const [addError, setAddError] = useState<string | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["admin-users", keyword, page],
    queryFn: () => adminApi.getUsers({ keyword, page, pageSize: 10 }),
    placeholderData: keepPreviousData,
  });

  const suspendMut = useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      adminApi.suspendUser(id, reason),
    onSuccess: () => {
      toast.success("Đã khóa tài khoản.");
      qc.invalidateQueries({ queryKey: ["admin-users"] });
    },
    onError: (error: unknown) => toast.error((error as ApiError).message || "Lỗi khi khóa tài khoản"),
  });

  const activateMut = useMutation({
    mutationFn: (id: string) => adminApi.activateUser(id),
    onSuccess: () => {
      toast.success("Đã mở khóa tài khoản.");
      qc.invalidateQueries({ queryKey: ["admin-users"] });
    },
    onError: (error: unknown) => toast.error((error as ApiError).message || "Lỗi khi mở khóa"),
  });

  const assignRoleMut = useMutation({
    mutationFn: ({ id, role }: { id: string; role: string }) =>
      adminApi.assignRole(id, role),
    onSuccess: () => {
      toast.success("Đã cập nhật phân quyền!");
      qc.invalidateQueries({ queryKey: ["admin-users"] });
      setEditingUser(null);
    },
    onError: (error: unknown) => toast.error((error as ApiError).message || "Lỗi khi phân quyền"),
  });

  const createUserMut = useMutation({
    mutationFn: ({ email, password, displayName, role }: { email: string; password: string; displayName: string; role: string }) =>
      adminApi.createUser({ email, password, displayName, role }),
    onSuccess: () => {
      toast.success("Đã tạo tài khoản mới!");
      qc.invalidateQueries({ queryKey: ["admin-users"] });
      setAddOpen(false);
      setAddError(null);
    },
    onError: (error: unknown) => setAddError((error as ApiError).message || "Lỗi khi tạo tài khoản"),
  });

  const handleCreateUser = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const email = (form.get("email") as string).trim();
    const password = form.get("password") as string;
    const displayName = (form.get("displayName") as string).trim();
    const role = form.get("role") as string;
    setAddError(null);
    createUserMut.mutate({ email, password, displayName, role });
  };

  const isMutating = suspendMut.isPending || activateMut.isPending || assignRoleMut.isPending;

  useEffect(() => {
    const timer = setTimeout(() => {
      setKeyword(searchText.trim());
      setPage(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchText]);

  const handleToggleStatus = (id: string, currentStatus: string, roles: string[]) => {
    if (roles.includes("Admin")) {
      toast.error("Không thể khóa Quản trị viên.");
      return;
    }

    if (currentStatus === "Active") {
      const reason = prompt("Nhập lý do khóa tài khoản (tối thiểu 10 ký tự):");
      if (reason && reason.length >= 10) {
        suspendMut.mutate({ id, reason });
      } else if (reason) {
        toast.error("Lý do quá ngắn hoặc không hợp lệ!");
      }
    } else if (confirm("Kích hoạt lại tài khoản này?")) {
      activateMut.mutate(id);
    }
  };

  const handleSaveRole = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editingUser) return;
    const role = new FormData(e.currentTarget).get("role") as string;
    assignRoleMut.mutate({ id: editingUser.id, role });
  };

  if (editingUser) {
    return (
      <div>
        <div className="admin-breadcrumb">
          <span className="admin-breadcrumb-link" onClick={() => setEditingUser(null)}>
            Dashboard
          </span>
          <ChevronRight size={14} />
          <span className="admin-breadcrumb-link" onClick={() => setEditingUser(null)}>
            Quản lý Người dùng
          </span>
          <ChevronRight size={14} />
          <span className="admin-breadcrumb-current">
            {editingUser.displayName || editingUser.email.split("@")[0]}
          </span>
        </div>

        <div className="admin-page-header">
          <h1 className="admin-page-title">Phân quyền tài khoản</h1>
          <p className="admin-page-desc">
            Đây là thao tác thật, gọi API PUT /api/admin/users/&#123;id&#125;/assign-role.
          </p>
        </div>

        <div className="card">
          <form onSubmit={handleSaveRole}>
            <div className="admin-form-grid">
              <div className="input-group">
                <label className="input-label">Tên hiển thị</label>
                <input
                  type="text"
                  disabled
                  defaultValue={editingUser.displayName || editingUser.email.split("@")[0]}
                  className="input-field"
                  title="Chưa có API để đổi tên hiển thị từ trang quản trị"
                />
              </div>

              <div className="input-group">
                <label className="input-label">Email</label>
                <input type="email" defaultValue={editingUser.email} disabled className="input-field" />
              </div>

              <div className="input-group">
                <label className="input-label">Phân quyền</label>
                <select
                  name="role"
                  defaultValue={editingUser.roles[0] || "User"}
                  className="input-field"
                >
                  <option value="Admin">Quản trị viên</option>
                  <option value="Manager">Người duyệt bài</option>
                  <option value="User">Thành viên</option>
                </select>
              </div>
            </div>

            <div className="admin-form-actions">
              <button type="button" onClick={() => setEditingUser(null)} className="btn btn-ghost">
                Hủy bỏ
              </button>
              <button type="submit" disabled={isMutating} className="btn btn-primary">
                {isMutating && <Loader2 size={16} className="animate-spin" />}
                Lưu thay đổi
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="admin-toolbar">
        <div className="admin-page-header" style={{ marginBottom: 0 }}>
          <h1 className="admin-page-title">Quản lý Người dùng</h1>
          <p className="admin-page-desc">
            Quản lý tài khoản, phân quyền và trạng thái của các thành viên.
          </p>
        </div>

        <div style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}>
          <div className="input-with-icon" style={{ minWidth: 260 }}>
            <Search className="input-icon" size={16} />
            <input
              type="text"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              placeholder="Tìm kiếm email, tên hiển thị..."
              className="input-field"
            />
          </div>
          <button
            onClick={() => { setAddError(null); setAddOpen(true); }}
            className="btn btn-primary"
            style={{ whiteSpace: "nowrap" }}
          >
            <Plus size={16} />
            Thêm tài khoản
          </button>
        </div>
      </div>

      <div className="card">
        <div className="admin-table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Người dùng</th>
                <th>Trạng thái</th>
                <th>Phân quyền</th>
                <th>Ngày tham gia</th>
                <th style={{ textAlign: "right" }}>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="admin-table-loading">
                    <Loader2 className="animate-spin" size={28} style={{ margin: "0 auto 0.5rem" }} />
                    <p>Đang nạp dữ liệu từ hệ thống...</p>
                  </td>
                </tr>
              ) : data?.items.length === 0 ? (
                <tr>
                  <td colSpan={5} className="admin-table-empty">
                    <UserX size={32} style={{ margin: "0 auto 0.5rem" }} />
                    <p>Không tìm thấy người dùng</p>
                  </td>
                </tr>
              ) : (
                data?.items.map((user: User) => (
                  <tr key={user.id}>
                    <td>
                      <div className="admin-user-cell">
                        <div className="admin-user-avatar">
                          {(user.displayName || user.email)[0].toUpperCase()}
                        </div>
                        <div>
                          <p className="admin-user-name">{user.displayName || "Thành viên Origami"}</p>
                          <p className="admin-user-email">{user.email}</p>
                        </div>
                      </div>
                    </td>

                    <td>
                      <span
                        className={`badge ${user.status === "Active" ? "badge-success" : user.status === "Suspended" ? "badge-danger" : "badge-neutral"}`}
                      >
                        {user.status === "Active" ? "Hoạt động" : user.status === "Suspended" ? "Bị khóa" : user.status}
                      </span>
                    </td>

                    <td>
                      <div style={{ display: "flex", gap: "0.375rem", flexWrap: "wrap" }}>
                        {user.roles.map((r) => (
                          <span key={r} className={`badge ${ROLE_BADGE[r] ?? "badge-neutral"}`}>
                            {r}
                          </span>
                        ))}
                      </div>
                    </td>

                    <td>{format(new Date(user.createdAt), "dd/MM/yyyy")}</td>

                    <td>
                      <div style={{ display: "flex", gap: "0.5rem", justifyContent: "flex-end" }}>
                        <button
                          onClick={() => setEditingUser(user)}
                          className="admin-icon-action"
                          title="Phân quyền tài khoản"
                        >
                          <Pencil size={16} />
                        </button>

                        {!user.roles.includes("Admin") && (
                          <button
                            onClick={() => handleToggleStatus(user.id, user.status, user.roles)}
                            className={`admin-icon-action ${user.status === "Active" ? "admin-icon-action-danger" : "admin-icon-action-success"}`}
                            title={user.status === "Active" ? "Khóa tài khoản" : "Mở khóa tài khoản"}
                            disabled={isMutating}
                          >
                            {user.status === "Active" ? <Lock size={16} /> : <Unlock size={16} />}
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

      {addOpen && (
        <div
          style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 50, display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem" }}
          onClick={() => setAddOpen(false)}
        >
          <div className="card" style={{ padding: "1.5rem", maxWidth: 480, width: "100%", maxHeight: "85vh", overflowY: "auto" }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.25rem" }}>
              <h2 style={{ fontWeight: 800, fontSize: "1.125rem" }}>Thêm tài khoản mới</h2>
              <button
                onClick={() => setAddOpen(false)}
                className="admin-icon-action"
                aria-label="Đóng"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleCreateUser}>
              <div className="admin-form-grid">
                <div className="input-group">
                  <label className="input-label" htmlFor="add-displayName">
                    Tên hiển thị <span style={{ color: "#E03131" }}>*</span>
                  </label>
                  <input id="add-displayName" name="displayName" type="text" required maxLength={60} className="input-field" placeholder="Tên hiển thị" />
                </div>

                <div className="input-group">
                  <label className="input-label" htmlFor="add-email">
                    Email <span style={{ color: "#E03131" }}>*</span>
                  </label>
                  <input id="add-email" name="email" type="email" required className="input-field" placeholder="ten@example.com" />
                </div>

                <div className="input-group">
                  <label className="input-label" htmlFor="add-password">
                    Mật khẩu <span style={{ color: "#E03131" }}>*</span>
                  </label>
                  <input id="add-password" name="password" type="password" required minLength={6} className="input-field" placeholder="Tối thiểu 6 ký tự" />
                </div>

                <div className="input-group">
                  <label className="input-label" htmlFor="add-role">Phân quyền</label>
                  <select id="add-role" name="role" defaultValue="User" className="input-field">
                    <option value="Admin">Quản trị viên</option>
                    <option value="Manager">Người duyệt bài</option>
                    <option value="User">Thành viên</option>
                  </select>
                </div>
              </div>

              {addError && (
                <div style={{ background: "#FEF2F2", border: "1px solid #FECACA", borderRadius: "var(--radius-md)", padding: "0.75rem 1rem", color: "#DC2626", fontSize: "0.875rem", marginTop: "1rem" }}>
                  {addError}
                </div>
              )}

              <div className="admin-form-actions">
                <button type="button" onClick={() => setAddOpen(false)} className="btn btn-ghost">
                  Hủy bỏ
                </button>
                <button type="submit" disabled={createUserMut.isPending} className="btn btn-primary">
                  {createUserMut.isPending && <Loader2 size={16} className="animate-spin" />}
                  Tạo tài khoản
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
