"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminApi, ApiError } from "@/lib/api";
import { Plus, Trash2, Loader2, ShieldAlert } from "lucide-react";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import toast from "react-hot-toast";
import { Card } from "../_components/ui/card";

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
    if (newWord.trim().length > 0 && newWord.trim().length <= 50)
      addMut.mutate(newWord);
    else toast.error("Từ khóa không hợp lệ (1-50 ký tự).");
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 w-full">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 relative">
        <div className="relative z-10">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight mb-2">
            Cấu hình Hệ thống
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
            Thiết lập các từ khóa nhạy cảm bị cấm trên nền tảng.
          </p>
        </div>
      </div>

      <Card>
        <div className="p-6 border-b border-slate-200 dark:border-white/5 bg-rose-50 dark:bg-rose-500/5">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-8 h-8 bg-rose-100 dark:bg-rose-500/10 text-rose-600 dark:text-rose-500 rounded-lg flex items-center justify-center border border-rose-200 dark:border-rose-500/20">
              <ShieldAlert size={18} />
            </div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              Bộ lọc từ khóa vi phạm
            </h2>
          </div>
          <p className="text-slate-500 dark:text-slate-400 text-sm ml-11">
            Hệ thống sẽ tự động chặn và cảnh báo khi có bài viết, bình luận chứa
            các từ khóa này.
          </p>
        </div>

        <div className="p-6">
          <form
            onSubmit={handleAdd}
            className="flex flex-col sm:flex-row gap-3 mb-6 bg-slate-50 dark:bg-[#0b0f19] p-4 rounded-xl border border-slate-200 dark:border-white/5"
          >
            <input
              type="text"
              className="w-full px-4 py-2.5 bg-white dark:bg-[#131722] border border-slate-200 dark:border-white/10 focus:border-rose-500 focus:ring-1 focus:ring-rose-500 rounded-lg outline-none transition-all text-slate-900 dark:text-white text-sm shadow-sm placeholder:text-slate-400 dark:placeholder:text-slate-500"
              placeholder="Nhập từ khóa cấm..."
              value={newWord}
              onChange={(e) => setNewWord(e.target.value)}
              disabled={addMut.isPending}
              maxLength={50}
            />
            <button
              type="submit"
              className="flex-shrink-0 flex justify-center items-center gap-2 px-6 py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-medium text-sm rounded-lg shadow-sm transition-all disabled:opacity-50"
              disabled={addMut.isPending || !newWord.trim()}
            >
              {addMut.isPending ? (
                <Loader2 className="animate-spin w-4 h-4" />
              ) : (
                <Plus className="w-4 h-4" />
              )}
              Thêm từ cấm
            </button>
          </form>

          <div className="rounded-xl border border-slate-200 dark:border-white/5 overflow-hidden">
            <table className="w-full text-left text-sm border-collapse">
              <thead className="bg-slate-50 dark:bg-[#0b0f19] text-slate-500 dark:text-slate-400 uppercase tracking-wider text-[11px] font-semibold border-b border-slate-200 dark:border-white/5">
                <tr>
                  <th className="px-6 py-4 w-[100px]">ID</th>
                  <th className="px-6 py-4">Từ khóa (Word)</th>
                  <th className="px-6 py-4 w-[200px]">Ngày cấu hình</th>
                  <th className="px-6 py-4 text-right w-[100px]">Gỡ bỏ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                {isLoading ? (
                  <tr>
                    <td
                      colSpan={4}
                      className="py-16 text-center text-slate-400"
                    >
                      <Loader2
                        className="animate-spin mx-auto mb-3 text-[#10b981]"
                        size={28}
                      />
                    </td>
                  </tr>
                ) : !words || words.length === 0 ? (
                  <tr>
                    <td
                      colSpan={4}
                      className="py-16 text-center text-slate-500"
                    >
                      Bộ lọc trống.
                    </td>
                  </tr>
                ) : (
                  words.map((bw) => (
                    <tr
                      key={bw.id}
                      className="hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-colors"
                    >
                      <td className="px-6 py-4 font-medium text-slate-400 dark:text-slate-500 text-xs">
                        #{bw.id}
                      </td>
                      <td className="px-6 py-4 font-semibold text-rose-500 text-sm">
                        {bw.word}
                      </td>
                      <td className="px-6 py-4 text-slate-500 dark:text-slate-400 font-medium text-xs">
                        {format(new Date(bw.createdAt), "dd/MM/yyyy HH:mm", {
                          locale: vi,
                        })}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => {
                            if (confirm(`Xóa từ khóa "${bw.word}"?`))
                              removeMut.mutate(bw.id);
                          }}
                          className="p-2 text-slate-400 hover:text-rose-600 dark:hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-lg transition-colors disabled:opacity-50"
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
      </Card>
    </div>
  );
}
