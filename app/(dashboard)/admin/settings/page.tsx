"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminApi, ApiError } from "@/lib/api";
import { Plus, Trash2, Loader2, ShieldAlert, Settings } from "lucide-react";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import toast from "react-hot-toast";

export default function SettingsPage() {
  const qc = useQueryClient();
  const [newWord, setNewWord] = useState("");

  const { data: words, isLoading } = useQuery({
    queryKey: ["admin-blocked-words"],
    queryFn: () => adminApi.getBlockedWords(),
  });

  const addMut = useMutation({
    mutationFn: (word: string) => adminApi.addBlockedWord(word),
    onSuccess: () => {
      setNewWord("");
      toast.success("Đã thêm từ khóa cấm thành công!");
      qc.invalidateQueries({ queryKey: ["admin-blocked-words"] });
    },
    onError: (error: unknown) => {
      const err = error as ApiError;
      toast.error(err.message || "Lỗi khi thêm từ khóa");
    },
  });

  const removeMut = useMutation({
    mutationFn: (id: number) => adminApi.removeBlockedWord(id),
    onSuccess: () => {
      toast.success("Đã gỡ bỏ từ khóa!");
      qc.invalidateQueries({ queryKey: ["admin-blocked-words"] });
    },
    onError: (error: unknown) => {
      const err = error as ApiError;
      toast.error(err.message || "Lỗi khi xóa từ khóa");
    },
  });

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (newWord.trim().length > 0 && newWord.trim().length <= 50) {
      addMut.mutate(newWord);
    } else {
      toast.error("Từ khóa không được để trống (tối đa 50 ký tự).");
    }
  };

  return (
    <div className="space-y-8 animate-fade-in w-full">
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 relative">
        <div className="relative z-10">
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight mb-2">
            Cấu hình Hệ thống
          </h1>
          <br />
        </div>
      </div>

      {/* BLOCKED WORDS SETTINGS */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-6 border-b border-slate-200 bg-red-50/50">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-8 h-8 bg-red-100 text-red-500 rounded-lg flex items-center justify-center">
              <ShieldAlert size={18} />
            </div>
            <h2 className="text-xl font-bold text-slate-900">
              Bộ lọc từ khóa vi phạm
            </h2>
          </div>
          <p className="text-slate-500 text-sm ml-11">
            Hệ thống sẽ tự động chặn và cảnh báo người dùng khi họ tạo bài viết,
            gửi bình luận có chứa các từ khóa dưới đây.
          </p>
        </div>

        <div className="p-6">
          {/* Form thêm từ khóa */}
          <form
            onSubmit={handleAdd}
            className="flex flex-col sm:flex-row gap-3 mb-6 bg-slate-50 p-4 rounded-xl border border-slate-200"
          >
            <input
              type="text"
              className="w-full px-4 py-2.5 bg-white border border-slate-200 focus:border-red-400 focus:ring-1 focus:ring-red-400 rounded-lg outline-none transition-all text-slate-800 text-sm shadow-sm"
              placeholder="Nhập từ khóa cấm"
              value={newWord}
              onChange={(e) => setNewWord(e.target.value)}
              disabled={addMut.isPending}
              maxLength={50}
            />
            <button
              type="submit"
              className="flex-shrink-0 flex justify-center items-center px-6 py-2.5 bg-red-500 hover:bg-red-600 text-white font-medium text-sm rounded-lg shadow-sm transition-all disabled:opacity-50"
              disabled={addMut.isPending || !newWord.trim()}
            >
              {addMut.isPending && <Loader2 className="animate-spin w-4 h-4" />}
              Thêm từ cấm
            </button>
          </form>

          {/* Bảng danh sách từ khóa */}
          <div className="rounded-xl border border-slate-200 overflow-hidden">
            <table className="w-full text-left text-sm border-collapse">
              <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider text-[11px] font-semibold border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4 w-[100px]">ID</th>
                  <th className="px-6 py-4">Từ khóa (Word)</th>
                  <th className="px-6 py-4 w-[200px]">Ngày cấu hình</th>
                  <th className="px-6 py-4 text-right w-[100px]">Gỡ bỏ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {isLoading ? (
                  <tr>
                    <td
                      colSpan={4}
                      className="py-16 text-center text-slate-400"
                    >
                      <Loader2
                        className="animate-spin mx-auto mb-3 text-emerald-500"
                        size={28}
                      />
                      Đang tải bộ lọc...
                    </td>
                  </tr>
                ) : !words || words.length === 0 ? (
                  <tr>
                    <td
                      colSpan={4}
                      className="py-16 text-center text-slate-500 font-medium"
                    >
                      Bộ lọc hiện đang trống. Chưa có từ khóa nào được thiết
                      lập.
                    </td>
                  </tr>
                ) : (
                  words.map((bw) => (
                    <tr
                      key={bw.id}
                      className="hover:bg-slate-50 transition-colors"
                    >
                      <td className="px-6 py-4 font-medium text-slate-400 text-xs">
                        #{bw.id}
                      </td>
                      <td className="px-6 py-4 font-semibold text-red-500 text-sm">
                        {bw.word}
                      </td>
                      <td className="px-6 py-4 text-slate-500 font-medium text-xs">
                        {format(new Date(bw.createdAt), "dd/MM/yyyy HH:mm", {
                          locale: vi,
                        })}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => {
                            if (
                              confirm(
                                `Bạn có chắc muốn xóa từ khóa "${bw.word}"?`,
                              )
                            )
                              removeMut.mutate(bw.id);
                          }}
                          className="p-2 text-red-400 hover:bg-red-50 hover:text-red-600 rounded-lg transition-colors disabled:opacity-50"
                          title="Xóa từ khóa này"
                          disabled={removeMut.isPending}
                        >
                          {removeMut.isPending &&
                          removeMut.variables === bw.id ? (
                            <Loader2 className="animate-spin w-4 h-4" />
                          ) : (
                            <Trash2 className="w-4 h-4" />
                          )}
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
