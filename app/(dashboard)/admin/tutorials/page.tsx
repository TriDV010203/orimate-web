"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminApi, ApiError } from "@/lib/api";
import { Check, X, ExternalLink, Loader2, PartyPopper } from "lucide-react";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import toast from "react-hot-toast";

export default function TutorialsQueuePage() {
  const qc = useQueryClient();

  const { data: queueData, isLoading } = useQuery({
    queryKey: ["admin-tutorials-queue"],
    queryFn: () => adminApi.getContributorQueue(),
  });
  const queue = queueData?.items || [];

  const publishMut = useMutation({
    mutationFn: (id: string) => adminApi.publishTutorial(id),
    onSuccess: () => {
      toast.success("Đã xuất bản thành công!");
      qc.invalidateQueries({ queryKey: ["admin-tutorials-queue"] });
    },
    onError: (error: unknown) => {
      const err = error as ApiError;
      toast.error(err.message || "Lỗi xuất bản");
    },
  });

  const rejectMut = useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      adminApi.contributorRequestRevision(id, reason),
    onSuccess: () => {
      toast.success("Đã gửi yêu cầu sửa.");
      qc.invalidateQueries({ queryKey: ["admin-tutorials-queue"] });
    },
    onError: (error: unknown) => {
      const err = error as ApiError;
      toast.error(err.message || "Lỗi thao tác");
    },
  });

  const handleReject = (id: string) => {
    const reason = prompt("Nhập lý do từ chối (tối thiểu 10 ký tự):");
    if (!reason || reason.length < 10) {
      if (reason !== null) toast.error("Lý do quá ngắn!");
      return;
    }
    rejectMut.mutate({ id, reason });
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 relative">
        <div className="relative z-10">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight mb-2">
            Duyệt bài Hướng dẫn
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
            Danh sách chờ được xuất bản lên nền tảng.
          </p>
        </div>
        <div className="relative z-10 bg-amber-50 dark:bg-[#f59e0b]/10 border border-amber-200 dark:border-[#f59e0b]/20 text-amber-700 dark:text-[#f59e0b] px-5 py-3 rounded-xl flex items-center gap-4">
          <div className="flex flex-col">
            <span className="text-[10px] font-bold uppercase tracking-wider opacity-80">
              Bài chờ duyệt
            </span>
            <span className="text-2xl font-extrabold leading-none">
              {queue.length}
            </span>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        {isLoading ? (
          <div className="bg-white dark:bg-[#131722] rounded-2xl shadow-sm border border-slate-200 dark:border-white/5 p-16 text-center">
            <Loader2
              className="animate-spin mx-auto text-[#10b981] mb-4"
              size={32}
            />
          </div>
        ) : queue.length === 0 ? (
          <div className="bg-white dark:bg-[#131722] rounded-2xl shadow-sm border border-slate-200 dark:border-white/5 p-20 text-center">
            <div className="w-20 h-20 bg-slate-50 dark:bg-[#0b0f19] border border-slate-100 dark:border-white/5 rounded-full flex items-center justify-center mx-auto mb-6">
              <PartyPopper
                className="text-slate-400 dark:text-slate-500"
                size={32}
              />
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
              Tuyệt vời, không có hàng chờ!
            </h3>
            <p className="text-slate-500 dark:text-slate-400 text-sm">
              Hiện không có bài hướng dẫn nào cần phê duyệt.
            </p>
          </div>
        ) : (
          queue.map((item) => (
            <div
              key={item.id}
              className="bg-white dark:bg-[#131722] rounded-2xl shadow-sm border border-slate-200 dark:border-white/5 p-6 flex flex-col md:flex-row justify-between md:items-center gap-6 hover:border-emerald-200 dark:hover:border-white/10 transition-all group"
            >
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <span className="px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-amber-100 dark:bg-[#f59e0b]/10 text-amber-700 dark:text-[#f59e0b] border border-amber-200 dark:border-[#f59e0b]/20">
                    Đang chờ duyệt
                  </span>
                  <span className="text-xs text-slate-500 font-medium flex items-center gap-1">
                    🕒{" "}
                    {format(new Date(item.createdAt), "HH:mm dd/MM/yyyy", {
                      locale: vi,
                    })}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2 group-hover:text-[#10b981] transition-colors">
                  {item.title}
                  <a
                    href={`/huong-dan/${item.slug}?preview=true`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-slate-400 dark:text-slate-500 hover:text-blue-600 dark:hover:text-white bg-slate-50 dark:bg-white/5 hover:bg-blue-50 dark:hover:bg-white/10 p-1.5 rounded-lg transition-colors border border-transparent dark:hover:border-white/10"
                    title="Xem trước"
                  >
                    <ExternalLink size={14} />
                  </a>
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                  Tác giả:{" "}
                  <span className="font-medium text-slate-700 dark:text-slate-300">
                    {item.authorName}
                  </span>{" "}
                  <span className="mx-2 text-slate-300 dark:text-slate-600">
                    |
                  </span>{" "}
                  Quy mô:{" "}
                  <span className="font-medium text-slate-700 dark:text-slate-300">
                    {item.stepCount} bước
                  </span>
                </p>
              </div>

              <div className="flex gap-2 pt-4 border-t border-slate-100 dark:border-white/5 md:border-t-0 md:pt-0">
                <button
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-rose-200 dark:border-white/10 text-rose-600 dark:text-slate-300 font-medium text-sm hover:bg-rose-50 dark:hover:bg-white/5 dark:hover:text-white transition-colors disabled:opacity-50"
                  onClick={() => handleReject(item.id)}
                  disabled={rejectMut.isPending || publishMut.isPending}
                >
                  <X size={16} /> Sửa
                </button>
                <button
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#10b981] hover:bg-[#059669] text-white font-medium text-sm shadow-sm transition-all disabled:opacity-50"
                  onClick={() => publishMut.mutate(item.id)}
                  disabled={rejectMut.isPending || publishMut.isPending}
                >
                  {publishMut.isPending && publishMut.variables === item.id ? (
                    <Loader2 className="animate-spin" size={16} />
                  ) : (
                    <Check size={16} />
                  )}{" "}
                  Xuất bản
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
