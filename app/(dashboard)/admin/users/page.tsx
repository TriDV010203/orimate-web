"use client";

import { useState, useEffect } from "react";
import { useUsers } from "../_hooks/useUsers";
import { Badge } from "../_components/ui/badge";

import {
  Lock,
  Unlock,
  Loader2,
  UserX,
  Search,
  Pencil,
  ChevronRight,
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

export default function UsersManagementPage() {
  const {
    data,
    isLoading,
    setKeyword,
    page,
    setPage,
    suspendUser,
    activateUser,
    updateUser,
    isMutating,
  } = useUsers();

  const [searchText, setSearchText] = useState("");
  const [editingUser, setEditingUser] = useState<User | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setKeyword(searchText.trim());
      setPage(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchText, setKeyword, setPage]);

  const handleToggleStatus = (
    id: string,
    currentStatus: string,
    roles: string[],
  ) => {
    if (roles.includes("Admin")) {
      return toast.error("Không thể khóa Quản trị viên.");
    }

    if (currentStatus === "Active") {
      const reason = prompt("Nhập lý do khóa tài khoản (tối thiểu 10 ký tự):");
      if (reason && reason.length >= 10) {
        suspendUser({ id, reason });
      } else if (reason) {
        toast.error("Lý do quá ngắn hoặc không hợp lệ!");
      }
    } else {
      if (confirm("Kích hoạt lại tài khoản này?")) {
        activateUser(id);
      }
    }
  };

  const handleSaveEdit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    const updatedData = {
      displayName: formData.get("displayName") as string,
      roles: [formData.get("role") as string],
      status: formData.get("status") as string,
    };

    if (updateUser && editingUser) {
      updateUser(
        { id: editingUser.id, data: updatedData },
        {
          onSuccess: () => {
            toast.success("Đã lưu thông tin người dùng!");
            setEditingUser(null);
          },
        },
      );
    } else {
      toast.success("Giao diện đã lấy được dữ liệu, chờ nối API!");
      console.log("Data:", updatedData);
      setEditingUser(null);
    }
  };

  // ==========================================
  // GIAO DIỆN: MÀN HÌNH CHỈNH SỬA
  // ==========================================
  if (editingUser) {
    return (
      <div className="usersEditContainer">
        <div className="breadcrumb">
          <span className="breadcrumbText" onClick={() => setEditingUser(null)}>
            Dashboard
          </span>
          <ChevronRight className="breadcrumbIcon" />
          <span className="breadcrumbText" onClick={() => setEditingUser(null)}>
            Quản lý Người dùng
          </span>
          <ChevronRight className="breadcrumbIcon" />
          <span className="breadcrumbActive">
            {editingUser.displayName || editingUser.email.split("@")[0]}
          </span>
        </div>

        <div className="editHeader">
          <div className="editHeaderIconWrapper">
            <Pencil className="editHeaderIcon" />
          </div>
          <div>
            <h1 className="editHeaderTitle">Chỉnh sửa tài khoản</h1>
            <p className="editHeaderDesc">
              Cập nhật thông tin và phân quyền cho người dùng
            </p>
          </div>
        </div>

        <div className="editCard">
          <form onSubmit={handleSaveEdit}>
            <div className="formGrid">
              <div className="formGroup">
                <label className="formLabel">Tên hiển thị</label>
                <input
                  type="text"
                  name="displayName"
                  defaultValue={
                    editingUser.displayName || editingUser.email.split("@")[0]
                  }
                  className="formInput"
                />
              </div>

              <div className="formGroup">
                <label className="formLabel">Email</label>
                <input
                  type="email"
                  defaultValue={editingUser.email}
                  disabled
                  className="formInput formInputDisabled"
                />
              </div>

              <div className="formGroup">
                <label className="formLabel">Phân quyền</label>
                <select
                  name="role"
                  defaultValue={editingUser.roles[0] || "User"}
                  className="formInput formSelect"
                >
                  <option value="Admin">Quản trị viên</option>
                  <option value="Manager">Người duyệt bài</option>
                  <option value="User">Thành viên</option>
                </select>
              </div>

              <div className="formGroup">
                <label className="formLabel">Trạng thái</label>
                <select
                  name="status"
                  defaultValue={editingUser.status}
                  className="formInput formSelect"
                >
                  <option value="Active">Hoạt động</option>
                  <option value="Suspended">Bị khóa</option>
                </select>
              </div>
            </div>

            <hr className="formDivider" />

            <div className="formActions">
              <button
                type="button"
                onClick={() => setEditingUser(null)}
                className="btnCancel"
              >
                Hủy bỏ
              </button>
              <button type="submit" disabled={isMutating} className="btnSave">
                {isMutating && (
                  <Loader2
                    className="loadingIcon"
                    style={{
                      margin: 0,
                      width: "16px",
                      height: "16px",
                      color: "white",
                    }}
                  />
                )}
                Lưu thay đổi
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  // ==========================================
  // GIAO DIỆN: DANH SÁCH NGƯỜI DÙNG
  // ==========================================
  return (
    <div className="usersContainer">
      {/* HEADER */}
      <div className="usersHeader">
        <div>
          <h1 className="usersTitle">Quản lý Người dùng</h1>
          <p className="usersDesc">
            Quản lý tài khoản, phân quyền và trạng thái của các thành viên.
          </p>
        </div>

        {/* Tìm kiếm realtime */}
        <div className="usersSearchWrapper">
          <Search className="usersSearchIcon" />
          <input
            type="text"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            placeholder="Tìm kiếm email, tên hiển thị..."
            className="usersSearchInput"
          />
        </div>
      </div>

      {/* BẢNG DỮ LIỆU */}
      <div className="tableCard">
        <div className="tableWrapper">
          <table className="usersTable">
            <thead className="tableHead">
              <tr>
                <th className="thLeft">Người dùng</th>
                <th className="thCenter">Trạng thái</th>
                <th className="thCenter">Phân quyền</th>
                <th className="thCenter">Ngày tham gia</th>
                <th className="thRight">Thao tác</th>
              </tr>
            </thead>

            <tbody className="tableBody">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="trLoading">
                    <Loader2
                      className="loadingIcon"
                      style={{ width: "32px", height: "32px" }}
                    />
                    <p className="loadingText">
                      Đang nạp dữ liệu từ hệ thống...
                    </p>
                  </td>
                </tr>
              ) : data?.items.length === 0 ? (
                <tr>
                  <td colSpan={5} className="trEmpty">
                    <div className="emptyIconWrapper">
                      <UserX className="emptyIcon" />
                    </div>
                    <p className="emptyTitle">Không tìm thấy người dùng</p>
                    <p className="emptyDesc">
                      Thử thay đổi từ khóa tìm kiếm hoặc xóa bộ lọc.
                    </p>
                  </td>
                </tr>
              ) : (
                data?.items.map((user: User) => (
                  <tr key={user.id} className="trUser">
                    <td className="tdUser">
                      <div className="userCell">
                        <div className="userAvatar">
                          {(user.displayName || user.email)[0].toUpperCase()}
                        </div>
                        <div>
                          <p className="userName">
                            {user.displayName || "Thành viên Origami"}
                          </p>
                          <p className="userEmail">{user.email}</p>
                        </div>
                      </div>
                    </td>

                    <td className="tdStatus">
                      <Badge
                        variant={
                          user.status === "Active"
                            ? "success"
                            : user.status === "Suspended"
                              ? "danger"
                              : "default"
                        }
                        className="gap-2 shadow-sm"
                      >
                        <span
                          className={`w-2 h-2 rounded-full flex-shrink-0 ${user.status === "Active" ? "bg-emerald-500 animate-pulse" : user.status === "Suspended" ? "bg-rose-500" : "bg-slate-500"}`}
                        ></span>
                        <span>
                          {user.status === "Active"
                            ? "Hoạt động"
                            : user.status === "Suspended"
                              ? "Bị khóa"
                              : user.status}
                        </span>
                      </Badge>
                    </td>

                    <td className="tdRoles">
                      <div className="rolesWrapper gap-2">
                        {user.roles.map((r: string) => (
                          <Badge
                            key={r}
                            variant={
                              r === "Admin"
                                ? "warning"
                                : r === "Manager"
                                  ? "success"
                                  : "default"
                            }
                          >
                            {r}
                          </Badge>
                        ))}
                      </div>
                    </td>

                    <td className="tdDate">
                      {format(new Date(user.createdAt), "dd/MM/yyyy")}
                    </td>

                    <td className="tdActions">
                      <div className="actionsWrapper">
                        {/* Nút Chỉnh sửa */}
                        <button
                          onClick={() => setEditingUser(user)}
                          className="actionBtn"
                          title="Chỉnh sửa tài khoản"
                        >
                          <Pencil className="actionIcon" />
                        </button>

                        {/* Nút Ổ Khóa / Mở Khóa */}
                        {!user.roles.includes("Admin") && (
                          <button
                            onClick={() =>
                              handleToggleStatus(
                                user.id,
                                user.status,
                                user.roles,
                              )
                            }
                            className={`actionBtn ${user.status === "Active" ? "btnLock" : "btnUnlock"}`}
                            title={
                              user.status === "Active"
                                ? "Khóa tài khoản"
                                : "Mở khóa tài khoản"
                            }
                            disabled={isMutating}
                          >
                            {user.status === "Active" ? (
                              <Lock className="actionIcon" />
                            ) : (
                              <Unlock className="actionIcon" />
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

        {/* PHÂN TRANG GỐC */}
        {data && data.totalPages > 1 && (
          <div className="pagination">
            <span className="pageInfo">
              Hiển thị trang <span className="pageNumber">{data.page}</span>{" "}
              trong tổng số{" "}
              <span className="pageNumber">{data.totalPages}</span> trang
            </span>

            <div className="pageActions">
              <button
                className="pageBtn"
                disabled={data.page <= 1}
                onClick={() => setPage((p: number) => p - 1)}
              >
                Trang trước
              </button>

              <button
                className="pageBtn"
                disabled={data.page >= data.totalPages}
                onClick={() => setPage((p: number) => p + 1)}
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
