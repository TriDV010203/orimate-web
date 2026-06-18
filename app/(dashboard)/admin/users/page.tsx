"use client";

import { useState, useEffect } from "react";
import { useUsers } from "../_hooks/useUsers";
import { Card } from "../_components/ui/card";
import { Badge } from "../_components/ui/badge";

import { Lock, Unlock, Loader2, UserX, Shield } from "lucide-react";
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
    isMutating,
  } = useUsers();

  const [searchText, setSearchText] = useState("");

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
        <div className="w-full md:w-[320px]">
          <input
            type="text"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            placeholder="Tìm email, tên hiển thị..."
            className="w-full h-11 px-4 bg-white border border-slate-200 rounded-xl outline-none text-sm text-slate-800 shadow-sm transition-all focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
          />
        </div>
      </div>
      <br />
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
                data?.items.map((user) => (
                  <tr
                    key={user.id}
                    className="hover:bg-slate-50 transition-colors group"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div>
                          <p className="font-semibold text-slate-900 text-sm group-hover:text-emerald-600 transition-colors">
                            {user.email}
                          </p>

                          <p className="text-slate-500 text-xs mt-0.5">
                            {user.displayName || "Thành viên Origami"}
                          </p>
                        </div>
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
                        {user.roles.map((r) => (
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
                        {!user.roles.includes("Admin") && (
                          <button
                            onClick={() =>
                              handleToggleStatus(
                                user.id,
                                user.status,
                                user.roles,
                              )
                            }
                            className="p-2 rounded-lg hover:bg-slate-100 transition-all disabled:opacity-50 text-slate-500"
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

                        {/* <button
                          className="p-2 rounded-lg hover:bg-slate-100 transition-all text-slate-500"
                          title="Phân quyền (Đang phát triển)"
                        >
                          <Shield className="h-4 w-4 text-blue-500" />
                        </button> */}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* PHÂN TRANG */}
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
                onClick={() => setPage((p) => p - 1)}
              >
                Trước
              </button>

              <button
                className="px-4 py-2 rounded-lg bg-white border border-slate-200 text-sm font-medium text-slate-700 hover:text-slate-900 hover:bg-slate-50 hover:border-slate-300 transition-all disabled:opacity-50 shadow-sm"
                disabled={data.page >= data.totalPages}
                onClick={() => setPage((p) => p + 1)}
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
