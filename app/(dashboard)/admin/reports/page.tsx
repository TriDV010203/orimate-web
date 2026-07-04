"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminApi, ApiError } from "@/lib/api";
import { Check, EyeOff, ShieldAlert, Loader2, ShieldCheck } from "lucide-react";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import toast from "react-hot-toast";
import { Card } from "../_components/ui/card";

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
    if (confirm(`Xác nhận hành động: ${actions[actionType]}?`))
      handleMut.mutate({ id, actionType });
  };

  const getTargetTypeName = (typeCode: number) => {
    if (typeCode === 0) return "Hướng dẫn";
    if (typeCode === 1) return "Bài đăng";
    if (typeCode === 2) return "Bình luận";
    return "Khác";
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 relative">
        <div className="relative z-10">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight mb-2">
            Xử lý Báo cáo vi phạm
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
            Kiểm tra và áp dụng biện pháp với nội dung bị báo cáo.
          </p>
        </div>
      </div>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50 dark:bg-[#0b0f19] text-slate-500 dark:text-slate-400 text-[11px] uppercase tracking-wider font-semibold border-b border-slate-200 dark:border-white/5">
              <tr>
                <th className="px-6 py-4 w-[120px]">Nguồn</th>
                <th className="px-6 py-4 min-w-[250px]">Nội dung bị tố cáo</th>
                <th className="px-6 py-4 w-[200px]">Lý do vi phạm</th>
                <th className="px-6 py-4 w-[140px]">Thời gian gửi</th>
                <th className="px-6 py-4 text-right w-[160px]">Hành động</th>
              </tr>
            </thead>
            <tbody className="text-sm divide-y divide-slate-100 dark:divide-white/5">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="py-24 text-center text-slate-400">
                    <Loader2
                      className="animate-spin mx-auto mb-4 text-[#10b981]"
                      size={36}
                    />
                  </td>
                </tr>
              ) : !reports || reports.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-20 text-center">
                    <ShieldCheck className="w-12 h-12 mx-auto text-slate-300 dark:text-slate-600 mb-4" />
                    <p className="text-lg font-medium text-slate-900 dark:text-white mb-2">
                      Không có báo cáo vi phạm
                    </p>
                  </td>
                </tr>
              ) : (
                reports.map((rep) => (
                  <tr
                    key={rep.id}
                    className="hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-colors group"
                  >
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-[10px] font-medium tracking-wider uppercase border bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-white/10">
                        {getTargetTypeName(rep.targetType)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="bg-slate-50 dark:bg-[#0b0f19] p-3 rounded-lg italic text-slate-600 dark:text-slate-400 border border-slate-100 dark:border-white/5 max-h-32 overflow-y-auto text-xs">
                        &quot;
                        {rep.targetContent || (
                          <span className="text-slate-400 dark:text-slate-500">
                            [Nội dung đã bị xóa ẩn]
                          </span>
                        )}
                        &quot;
                      </div>
                    </td>
                    <td className="px-6 py-4 font-semibold text-rose-500 text-sm">
                      {rep.reason}
                    </td>
                    <td className="px-6 py-4 text-slate-500 dark:text-slate-400 font-medium text-xs">
                      {format(new Date(rep.createdAt), "HH:mm dd/MM/yyyy", {
                        locale: vi,
                      })}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          className="p-2 bg-slate-100 dark:bg-white/5 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-white/10 hover:text-slate-700 dark:hover:text-white rounded-lg transition-colors disabled:opacity-50"
                          title="Bỏ qua"
                          onClick={() => processReport(rep.id, 0)}
                          disabled={handleMut.isPending}
                        >
                          <Check size={16} />
                        </button>
                        <button
                          className="p-2 bg-amber-50 dark:bg-[#f59e0b]/10 text-amber-600 dark:text-[#f59e0b] hover:bg-amber-100 dark:hover:bg-[#f59e0b]/20 rounded-lg transition-colors disabled:opacity-50"
                          title="Gỡ bỏ"
                          onClick={() => processReport(rep.id, 1)}
                          disabled={handleMut.isPending}
                        >
                          <EyeOff size={16} />
                        </button>
                        <button
                          className="p-2 bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-500 hover:bg-rose-100 dark:hover:bg-rose-500/20 rounded-lg transition-colors disabled:opacity-50"
                          title="Khóa TK"
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
      </Card>
    </div>
  );
}
