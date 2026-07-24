"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminApi, type ApiError } from "@/lib/api";
import { Plus, Trash2, Loader2, ShieldAlert } from "lucide-react";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import toast from "react-hot-toast";

export default function AdminSettingsPage() {
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
    onError: (error: unknown) => toast.error((error as ApiError).message || "Lỗi khi thêm từ khóa"),
  });

  const removeMut = useMutation({
    mutationFn: (id: number) => adminApi.removeBlockedWord(id),
    onSuccess: () => {
      toast.success("Đã gỡ bỏ từ khóa!");
      qc.invalidateQueries({ queryKey: ["admin-blocked-words"] });
    },
    onError: (error: unknown) => toast.error((error as ApiError).message || "Lỗi khi xóa từ khóa"),
  });

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (newWord.trim().length > 0 && newWord.trim().length <= 50) addMut.mutate(newWord);
    else toast.error("Từ khóa không hợp lệ (1-50 ký tự).");
  };

  return (
    <div>
      <div className="admin-page-header">
        <h1 className="admin-page-title">Cấu hình Hệ thống</h1>
        <p className="admin-page-desc">Thiết lập các từ khóa nhạy cảm bị cấm trên nền tảng.</p>
      </div>

      <div className="card">
        <div className="admin-alert-box">
          <div className="admin-alert-header">
            <ShieldAlert size={18} />
            <span>Bộ lọc từ khóa vi phạm</span>
          </div>
          <p className="admin-alert-desc">
            Hệ thống sẽ tự động chặn và cảnh báo khi có bài viết, bình luận chứa các từ khóa này.
          </p>
        </div>

        <form onSubmit={handleAdd} className="admin-add-form">
          <input
            type="text"
            className="input-field"
            placeholder="Nhập từ khóa cấm..."
            value={newWord}
            onChange={(e) => setNewWord(e.target.value)}
            disabled={addMut.isPending}
            maxLength={50}
          />
          <button type="submit" className="btn btn-primary" disabled={addMut.isPending || !newWord.trim()}>
            {addMut.isPending ? <Loader2 className="animate-spin" size={18} /> : <Plus size={18} />}
            Thêm từ cấm
          </button>
        </form>

        <div className="admin-table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th style={{ width: 100 }}>ID</th>
                <th>Từ khóa</th>
                <th style={{ width: 220 }}>Ngày cấu hình</th>
                <th style={{ width: 100, textAlign: "right" }}>Gỡ bỏ</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={4} className="admin-table-loading">
                    <Loader2 className="animate-spin" size={24} style={{ margin: "0 auto" }} />
                  </td>
                </tr>
              ) : !words || words.length === 0 ? (
                <tr>
                  <td colSpan={4} className="admin-table-empty">
                    Bộ lọc trống.
                  </td>
                </tr>
              ) : (
                words.map((bw) => (
                  <tr key={bw.id}>
                    <td>#{bw.id}</td>
                    <td style={{ fontWeight: 600 }}>{bw.word}</td>
                    <td>{format(new Date(bw.createdAt), "dd/MM/yyyy HH:mm", { locale: vi })}</td>
                    <td style={{ textAlign: "right" }}>
                      <button
                        onClick={() => confirm(`Xóa từ khóa "${bw.word}"?`) && removeMut.mutate(bw.id)}
                        className="admin-icon-action admin-icon-action-danger"
                        disabled={removeMut.isPending}
                      >
                        {removeMut.isPending && removeMut.variables === bw.id ? (
                          <Loader2 className="animate-spin" size={16} />
                        ) : (
                          <Trash2 size={16} />
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
  );
}
