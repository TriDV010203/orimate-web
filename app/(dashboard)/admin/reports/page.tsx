"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminApi, ApiError } from "@/lib/api";
import { Check, EyeOff, ShieldAlert, Loader2, ShieldCheck } from "lucide-react";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import toast from "react-hot-toast";

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
    onError: (error: unknown) => {
      const err = error as ApiError;
      toast.error(err.message || "Lỗi khi xử lý báo cáo");
    },
  });

  const processReport = (id: string, actionType: number) => {
    const actions = [
      "Bỏ qua (Không vi phạm)",
      "Gỡ bỏ nội dung này",
      "Khóa tài khoản người đăng",
    ];
    if (confirm(`Xác nhận hành động: ${actions[actionType]}?`)) {
      handleMut.mutate({ id, actionType });
    }
  };

  const getTargetTypeName = (typeCode: number) => {
    if (typeCode === 0) return "Hướng dẫn";
    if (typeCode === 1) return "Bài đăng";
    if (typeCode === 2) return "Bình luận";
    return "Khác";
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 relative">
        <div className="relative z-10">
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight mb-2">
            Xử lý Báo cáo vi phạm
          </h1>
          <br />
        </div>
      </div>

      {/* TABLE SECTION */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50 text-slate-500 text-[11px] uppercase tracking-wider font-semibold border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 w-[120px]">Nguồn</th>
                <th className="px-6 py-4 min-w-[250px]">Nội dung bị tố cáo</th>
                <th className="px-6 py-4 w-[200px]">Lý do vi phạm</th>
                <th className="px-6 py-4 w-[140px]">Thời gian gửi</th>
                <th className="px-6 py-4 text-right w-[160px]">Hành động</th>
              </tr>
            </thead>
            <tbody className="text-sm divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="py-24 text-center text-gray-40">
                    <Loader2
                      className="animate-spin mx-auto mb-4 text-[#2d6a4f]"
                      size={36}
                    />
                    <p className="text-base font-medium">
                      Đang tải danh sách báo cáo...
                    </p>
                  </td>
                </tr>
              ) : !reports || reports.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-20 text-center">
                    <p className="text-lg font-medium text-slate-700 mb-2">
                      Không có báo cáo vi phạm
                    </p>
                  </td>
                </tr>
              ) : (
                reports.map((rep) => (
                  <tr
                    key={rep.id}
                    className="hover:bg-slate-50 transition-colors group"
                  >
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-medium tracking-wider uppercase border bg-slate-100 text-slate-600 border-slate-200">
                        {getTargetTypeName(rep.targetType)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="bg-slate-50 p-3 rounded-lg italic text-slate-700 border border-slate-100 max-h-32 overflow-y-auto text-xs">
                        &quot;
                        {rep.targetContent || (
                          <span className="text-slate-400">
                            [Nội dung đã bị xóa ẩn]
                          </span>
                        )}
                        &quot;
                      </div>
                    </td>
                    <td className="px-6 py-4 font-semibold text-red-500 text-sm">
                      {rep.reason}
                    </td>
                    <td className="px-6 py-4 text-slate-500 font-medium text-xs">
                      {format(new Date(rep.createdAt), "HH:mm dd/MM/yyyy", {
                        locale: vi,
                      })}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          className="p-2 bg-slate-50 text-slate-500 hover:bg-slate-200 hover:text-slate-700 rounded-lg transition-colors disabled:opacity-50"
                          title="Bỏ qua (Không vi phạm)"
                          onClick={() => processReport(rep.id, 0)}
                          disabled={handleMut.isPending}
                        >
                          <Check size={16} />
                        </button>
                        <button
                          className="p-2 bg-amber-50 text-amber-500 hover:bg-amber-100 hover:text-amber-600 rounded-lg transition-colors disabled:opacity-50"
                          title="Gỡ bỏ nội dung này"
                          onClick={() => processReport(rep.id, 1)}
                          disabled={handleMut.isPending}
                        >
                          <EyeOff size={16} />
                        </button>
                        <button
                          className="p-2 bg-red-50 text-red-500 hover:bg-red-100 hover:text-red-600 rounded-lg transition-colors disabled:opacity-50"
                          title="Khóa tài khoản người đăng"
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
