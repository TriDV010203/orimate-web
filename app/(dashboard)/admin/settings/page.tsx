"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminApi, ApiError } from "@/lib/api";
import { Plus, Trash2, Loader2, ShieldAlert } from "lucide-react";
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
    if (newWord.trim().length > 0 && newWord.trim().length <= 50)
      addMut.mutate(newWord);
    else toast.error("Từ khóa không hợp lệ (1-50 ký tự).");
  };

  return (
    <div className="usersContainer">
      <div className="settingsHeader">
        <div className="settingsHeaderInner">
          <h1 className="settingsTitle">Cấu hình Hệ thống</h1>
          <p className="settingsDesc">
            Thiết lập các từ khóa nhạy cảm bị cấm trên nền tảng.
          </p>
        </div>
      </div>

      <div className="settingsCard">
        <div className="settingsAlertBox">
          <div className="settingsAlertHeader">
            <div className="settingsAlertIcon">
              <ShieldAlert size={18} />
            </div>
            <h2 className="settingsAlertTitle">Bộ lọc từ khóa vi phạm</h2>
          </div>
          <p className="settingsAlertDesc">
            Hệ thống sẽ tự động chặn và cảnh báo khi có bài viết, bình luận chứa
            các từ khóa này.
          </p>
        </div>

        <div className="settingsContent">
          <form onSubmit={handleAdd} className="settingsForm">
            <input
              type="text"
              className="settingsInput"
              placeholder="Nhập từ khóa cấm..."
              value={newWord}
              onChange={(e) => setNewWord(e.target.value)}
              disabled={addMut.isPending}
              maxLength={50}
            />
            <button
              type="submit"
              className="settingsBtn"
              disabled={addMut.isPending || !newWord.trim()}
            >
              {addMut.isPending ? (
                <Loader2 className="animate-spin w-5 h-5" />
              ) : (
                <Plus className="w-5 h-5" />
              )}
              Thêm từ cấm
            </button>
          </form>

          <div className="settingsTableWrapper">
            <table className="settingsTable">
              <thead className="settingsThead">
                <tr>
                  <th className="settingsTh" style={{ width: "100px" }}>
                    ID
                  </th>
                  <th className="settingsTh">Từ khóa</th>
                  <th className="settingsTh" style={{ width: "300px" }}>
                    Ngày cấu hình
                  </th>
                  <th className="settingsThRight" style={{ width: "120px" }}>
                    Gỡ bỏ
                  </th>
                </tr>
              </thead>
              <tbody className="settingsTbody">
                {isLoading ? (
                  <tr>
                    <td colSpan={4} className="settingsLoading">
                      <Loader2
                        className="animate-spin mx-auto mb-3"
                        size={28}
                        style={{ color: "#10b981" }}
                      />
                    </td>
                  </tr>
                ) : !words || words.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="settingsEmpty">
                      Bộ lọc trống.
                    </td>
                  </tr>
                ) : (
                  words.map((bw) => (
                    <tr key={bw.id} className="settingsTr">
                      <td className="settingsTd settingsIdText">#{bw.id}</td>
                      <td className="settingsTd settingsWordText">{bw.word}</td>
                      <td className="settingsTd settingsDateText">
                        {format(new Date(bw.createdAt), "dd/MM/yyyy HH:mm", {
                          locale: vi,
                        })}
                      </td>
                      <td className="settingsTdRight">
                        <button
                          onClick={() => {
                            if (confirm(`Xóa từ khóa "${bw.word}"?`))
                              removeMut.mutate(bw.id);
                          }}
                          className="settingsRemoveBtn"
                          disabled={removeMut.isPending}
                        >
                          {removeMut.isPending &&
                          removeMut.variables === bw.id ? (
                            <Loader2 className="animate-spin w-5 h-5" />
                          ) : (
                            <Trash2 className="w-5 h-5" />
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
