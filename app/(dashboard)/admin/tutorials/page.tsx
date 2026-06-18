"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminApi, ApiError } from "@/lib/api";
import { Check, X, ExternalLink, Loader2, PartyPopper } from "lucide-react";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import toast from "react-hot-toast";

export default function TutorialsQueuePage() {
  const qc = useQueryClient();

  // Fetch danh sách chờ duyệt
  const { data: queueData, isLoading } = useQuery({
    queryKey: ["admin-tutorials-queue"],
    queryFn: () => adminApi.getContributorQueue(),
  });

  const queue = queueData?.items || [];

  // Mutation: Xuất bản
  const publishMut = useMutation({
    mutationFn: (id: string) => adminApi.publishTutorial(id),
    onSuccess: () => {
      toast.success("Đã xuất bản bài viết thành công!");
      qc.invalidateQueries({ queryKey: ["admin-tutorials-queue"] });
    },
    onError: (error: unknown) => {
      const err = error as ApiError;
      toast.error(err.message || "Lỗi xuất bản bài viết");
    },
  });

  // Mutation: Từ chối / Yêu cầu sửa
  const rejectMut = useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      adminApi.contributorRequestRevision(id, reason),
    onSuccess: () => {
      toast.success("Đã gửi yêu cầu chỉnh sửa đến tác giả.");
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
      if (reason !== null) toast.error("Lý do quá ngắn hoặc không hợp lệ!");
      return;
    }
    rejectMut.mutate({ id, reason });
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* KHỐI HEADER */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 relative">
        <div className="relative z-10">
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight mb-2">
            Duyệt bài Hướng dẫn
          </h1>
          <br/>
        </div>
        <div className="relative z-10 bg-amber-50 border border-amber-200 text-amber-700 px-5 py-3 rounded-xl flex items-center gap-4">
          <div className="flex flex-col">
            <span className="text-[10px] font-bold uppercase tracking-wider opacity-70">
              Bài chờ duyệt
            </span>
            <span className="text-2xl font-extrabold leading-none">{queue.length}</span>
          </div>
        </div>
      </div>

      {/* DANH SÁCH BÀI VIẾT */}
      <div className="flex flex-col gap-4">
        {isLoading ? (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-16 text-center">
            <Loader2
              className="animate-spin mx-auto text-emerald-500 mb-4"
              size={32}
            />
            <p className="text-slate-500 font-medium">
              Đang nạp dữ liệu từ hệ thống...
            </p>
          </div>
        ) : queue.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-20 text-center">
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <PartyPopper className="text-slate-400" size={32} />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">
              Tuyệt vời, không có hàng chờ!
            </h3>
            <p className="text-slate-500 text-sm">
              Hiện không có bài hướng dẫn nào cần phê duyệt. Bạn có thể nghỉ ngơi.
            </p>
          </div>
        ) : (
          queue.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex flex-col md:flex-row justify-between md:items-center gap-6 hover:border-emerald-200 hover:shadow-md transition-all group"
            >
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-100 text-amber-700">
                    Đang chờ duyệt
                  </span>
                  <span className="text-xs text-slate-400 font-medium flex items-center gap-1">
                    🕒 {format(new Date(item.createdAt), "HH:mm dd/MM/yyyy", {
                      locale: vi,
                    })}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2 group-hover:text-emerald-600 transition-colors">
                  {item.title}
                  <a
                    href={`/huong-dan/${item.slug}?preview=true`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-slate-400 hover:text-blue-600 bg-slate-50 hover:bg-blue-50 p-1.5 rounded-lg transition-colors"
                    title="Xem trước nội dung"
                  >
                    <ExternalLink size={14} />
                  </a>
                </h3>
                <p className="text-sm text-slate-500 mt-1">
                  Tác giả:{" "}
                  <span className="font-semibold text-slate-700">
                    {item.authorName}
                  </span>{" "}
                  <span className="mx-2 text-slate-300">|</span> Quy mô:{" "}
                  <span className="font-semibold text-slate-700">
                    {item.stepCount} bước
                  </span>
                </p>
              </div>

              <div className="flex gap-2 pt-4 border-t border-slate-100 md:border-t-0 md:pt-0">
                <button
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-red-200 text-red-600 font-medium text-sm hover:bg-red-50 hover:border-red-300 transition-colors disabled:opacity-50"
                  onClick={() => handleReject(item.id)}
                  disabled={rejectMut.isPending || publishMut.isPending}
                >
                  <X size={16} /> Sửa
                </button>
                <button
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-medium text-sm shadow-sm transition-all disabled:opacity-50"
                  onClick={() => publishMut.mutate(item.id)}
                  disabled={rejectMut.isPending || publishMut.isPending}
                >
                  {publishMut.isPending && publishMut.variables === item.id ? (
                    <Loader2 className="animate-spin" size={16} />
                  ) : (
                    <Check size={16} />
                  )}
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
