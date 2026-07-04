"use client";

import { useState, useEffect } from "react";
import { useUsers } from "../_hooks/useUsers";
import { Card } from "../_components/ui/card";
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

export default function UsersManagementPage() {
  const {
    data,
    isLoading,
    setKeyword,
    page,
    setPage,
    suspendUser,
    activateUser,
    updateUser, // <-- Thêm hàm này từ hook useUsers của bạn
    isMutating,
  } = useUsers();

  const [searchText, setSearchText] = useState("");
  const [editingUser, setEditingUser] = useState<any | null>(null);

  // Debounce tìm kiếm
  useEffect(() => {
    const timer = setTimeout(() => {
      setKeyword(searchText.trim());
      setPage(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchText, setKeyword, setPage]);

  // Logic Khóa / Mở Khóa (GIỮ NGUYÊN CODE CŨ CỦA BẠN)
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

  // Logic Lưu chỉnh sửa User
  const handleSaveEdit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    const updatedData = {
      displayName: formData.get("displayName") as string,
      roles: [formData.get("role") as string],
      status: formData.get("status") as string,
    };

    if (updateUser) {
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
      // Fallback nếu chưa kịp viết API update
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
      <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in slide-in-from-right-8 duration-500 pb-10">
        <div className="flex items-center text-sm text-slate-500 font-medium">
          <span
            className="cursor-pointer hover:text-slate-900 transition-colors"
            onClick={() => setEditingUser(null)}
          >
            Dashboard
          </span>
          <ChevronRight className="w-4 h-4 mx-1" />
          <span
            className="cursor-pointer hover:text-slate-900 transition-colors"
            onClick={() => setEditingUser(null)}
          >
            Quản lý Người dùng
          </span>
          <ChevronRight className="w-4 h-4 mx-1" />
          <span className="text-slate-900">
            {editingUser.displayName || editingUser.email.split("@")[0]}
          </span>
        </div>

        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
            Chỉnh sửa{" "}
            {editingUser.displayName || editingUser.email.split("@")[0]}
          </h1>
        </div>

        <Card className="p-6 md:p-8">
          <form onSubmit={handleSaveEdit} className="space-y-5">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-900">
                Tên hiển thị
              </label>
              <input
                type="text"
                name="displayName"
                defaultValue={
                  editingUser.displayName || editingUser.email.split("@")[0]
                }
                className="w-full h-11 px-4 bg-white border border-slate-200 rounded-xl outline-none text-sm text-slate-900 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-900">
                Email
              </label>
              <input
                type="email"
                defaultValue={editingUser.email}
                disabled
                className="w-full h-11 px-4 bg-slate-50 border border-slate-200 rounded-xl outline-none text-sm text-slate-500 cursor-not-allowed"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-900">
                Phân quyền
              </label>
              <select
                name="role"
                defaultValue={editingUser.roles[0] || "User"}
                className="w-full h-11 px-4 bg-white border border-slate-200 rounded-xl outline-none text-sm text-slate-900 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
              >
                <option value="Admin">Quản trị viên</option>
                <option value="Manager">Người duyệt bài</option>
                <option value="User">Thành viên</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-900">
                Trạng thái
              </label>
              <select
                name="status"
                defaultValue={editingUser.status}
                className="w-full h-11 px-4 bg-white border border-slate-200 rounded-xl outline-none text-sm text-slate-900 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
              >
                <option value="Active">Hoạt động</option>
                <option value="Suspended">Bị khóa</option>
              </select>
            </div>

            <div className="pt-6 flex gap-3">
              <button
                type="submit"
                disabled={isMutating}
                className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-xl transition-all shadow-sm flex items-center gap-2"
              >
                {isMutating && <Loader2 className="w-4 h-4 animate-spin" />}
                Lưu thay đổi
              </button>
              <button
                type="button"
                onClick={() => setEditingUser(null)}
                className="px-6 py-2.5 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 text-sm font-semibold rounded-xl transition-colors shadow-sm"
              >
                Hủy bỏ
              </button>
            </div>
          </form>
        </Card>
      </div>
    );
  }

  // ==========================================
  // GIAO DIỆN: DANH SÁCH NGƯỜI DÙNG
  // ==========================================
  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-fade-in">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
            Quản lý Người dùng
          </h1>
        </div>

        {/* Tìm kiếm realtime */}
        <div className="w-full md:w-[320px] relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            placeholder="Tìm email, tên hiển thị..."
            className="w-full h-11 pl-9 pr-4 bg-white border border-slate-200 rounded-xl outline-none text-sm text-slate-800 shadow-sm transition-all focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
          />
        </div>
      </div>

      {/* BẢNG DỮ LIỆU */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50 text-slate-500 text-[11px] uppercase tracking-wider font-semibold border-b border-slate-200">
              <tr>
                <th className="px-6 py-4">Tài khoản</th>
                <th className="px-6 py-4">Trạng thái</th>
                <th className="px-6 py-4">Phân quyền</th>
                <th className="px-6 py-4">Ngày tham gia</th>
                <th className="px-6 py-4 text-right">Thao tác</th>
              </tr>
            </thead>

            <tbody className="text-sm divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="py-24 text-center text-gray-400">
                    <Loader2
                      className="animate-spin mx-auto mb-4 text-[#2d6a4f]"
                      size={36}
                    />
                    <p className="text-base font-medium">
                      Đang nạp dữ liệu từ hệ thống...
                    </p>
                  </td>
                </tr>
              ) : data?.items.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-24 text-center">
                    <p className="text-lg font-semibold text-gray-900">
                      Không tìm thấy người dùng
                    </p>
                    <p className="text-gray-500 mt-1">
                      Thử thay đổi từ khóa tìm kiếm.
                    </p>
                  </td>
                </tr>
              ) : (
                data?.items.map((user: any) => (
                  <tr
                    key={user.id}
                    className="hover:bg-slate-50 transition-colors group"
                  >
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-semibold text-slate-900 text-sm group-hover:text-emerald-600 transition-colors">
                          {user.email}
                        </p>
                        <p className="text-slate-500 text-xs mt-0.5">
                          {user.displayName || "Thành viên Origami"}
                        </p>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <Badge
                        variant={
                          user.status === "Active"
                            ? "success"
                            : user.status === "Suspended"
                              ? "danger"
                              : "default"
                        }
                      >
                        {user.status === "Active"
                          ? "Hoạt động"
                          : user.status === "Suspended"
                            ? "Bị khóa"
                            : user.status}
                      </Badge>
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1.5">
                        {user.roles.map((r: string) => (
                          <Badge
                            key={r}
                            variant={r === "Admin" ? "warning" : "default"}
                          >
                            {r}
                          </Badge>
                        ))}
                      </div>
                    </td>

                    <td className="px-6 py-4 text-slate-500 font-medium">
                      {format(new Date(user.createdAt), "dd/MM/yyyy")}
                    </td>

                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {/* Nút Chỉnh sửa */}
                        <button
                          onClick={() => setEditingUser(user)}
                          className="p-2 rounded-lg hover:bg-slate-200 transition-all text-slate-500"
                          title="Chỉnh sửa tài khoản"
                        >
                          <Pencil className="h-4 w-4" />
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
                            className="p-2 rounded-lg hover:bg-slate-200 transition-all disabled:opacity-50 text-slate-500"
                            title={
                              user.status === "Active"
                                ? "Khóa tài khoản"
                                : "Mở khóa tài khoản"
                            }
                            disabled={isMutating}
                          >
                            {user.status === "Active" ? (
                              <Lock className="h-4 w-4 text-red-500" />
                            ) : (
                              <Unlock className="h-4 w-4 text-emerald-600" />
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
          <div className="px-6 py-4 bg-slate-50 flex items-center justify-between border-t border-slate-200">
            <span className="text-sm text-slate-500">
              Trang{" "}
              <span className="font-semibold text-slate-900">{data.page}</span>{" "}
              / {data.totalPages}
            </span>

            <div className="flex gap-2">
              <button
                className="px-4 py-2 rounded-lg bg-white border border-slate-200 text-sm font-medium text-slate-700 hover:text-slate-900 hover:bg-slate-50 hover:border-slate-300 transition-all disabled:opacity-50 shadow-sm"
                disabled={data.page <= 1}
                onClick={() => setPage((p: number) => p - 1)}
              >
                Trước
              </button>

              <button
                className="px-4 py-2 rounded-lg bg-white border border-slate-200 text-sm font-medium text-slate-700 hover:text-slate-900 hover:bg-slate-50 hover:border-slate-300 transition-all disabled:opacity-50 shadow-sm"
                disabled={data.page >= data.totalPages}
                onClick={() => setPage((p: number) => p + 1)}
              >
                Sau
              </button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
