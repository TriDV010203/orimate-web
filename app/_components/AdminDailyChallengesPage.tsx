"use client";

import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2, Play, Search, Sparkles } from "lucide-react";
import toast from "react-hot-toast";
import { adminApi, type AdminTutorialListItemResponse } from "@/lib/api/admin";
import {
  dailyChallengeApi,
  type AdminChallengeCalendarItemDto,
  type ChallengeSuggestionDto,
  type DailyChallengeStatus,
} from "@/lib/api/daily-challenge";
import type { ApiError } from "@/lib/api/client";
import { getToken } from "@/lib/auth";
import { diffLabel, isValidImageUrl, toLocalDateInputValue } from "@/lib/utils";

const STATUS_META: Record<DailyChallengeStatus, { label: string; className: string }> = {
  Scheduled: { label: "Đã lên lịch", className: "badge badge-warning" },
  Active: { label: "Đang diễn ra", className: "badge badge-success" },
  Closed: { label: "Đã đóng", className: "badge badge-neutral" },
};

function todayStr() {
  return toLocalDateInputValue();
}

function formatVN(iso: string) {
  const [y, m, d] = iso.split("-");
  return `${d}/${m}/${y}`;
}

export default function AdminDailyChallengesPage() {
  const qc = useQueryClient();
  const token = getToken() ?? "";

  // ── Bộ lọc khoảng ngày cho danh sách lịch ────────────────────────────────
  const [fromDate, setFromDate] = useState(todayStr());
  const [toDate, setToDate] = useState("");

  const { data: calendar, isLoading: loadingCalendar } = useQuery({
    queryKey: ["admin-daily-challenges", fromDate, toDate],
    queryFn: () =>
      dailyChallengeApi.adminGetCalendar(token, {
        fromDate: fromDate || undefined,
        toDate: toDate || undefined,
        page: 1,
        pageSize: 60,
      }),
    enabled: !!token,
  });

  const runSchedulerMut = useMutation({
    mutationFn: () => dailyChallengeApi.adminRunScheduler(token),
    onSuccess: () => {
      toast.success("Đã chạy scheduler: đóng thử thách hôm qua + kích hoạt hôm nay.");
      qc.invalidateQueries({ queryKey: ["admin-daily-challenges"] });
    },
    onError: (error: unknown) => toast.error((error as ApiError).message || "Chạy scheduler thất bại"),
  });

  // ── Gợi ý tutorial để đặt lịch ────────────────────────────────────────
  const { data: suggestions, isLoading: loadingSuggestions, refetch: refetchSuggestions } = useQuery({
    queryKey: ["admin-challenge-suggestions"],
    queryFn: () => dailyChallengeApi.adminGetSuggestions(token, 5),
    enabled: !!token,
  });

  // ── Form đặt lịch mới ─────────────────────────────────────────────────
  const [scheduleDate, setScheduleDate] = useState(todayStr());
  const [selectedTutorial, setSelectedTutorial] = useState<{ id: string; title: string; coverImageUrl?: string | null } | null>(null);

  const [pickerSearchText, setPickerSearchText] = useState("");
  const [pickerSearch, setPickerSearch] = useState("");
  const [pickerResults, setPickerResults] = useState<AdminTutorialListItemResponse[]>([]);
  const [pickerLoading, setPickerLoading] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setPickerSearch(pickerSearchText.trim()), 400);
    return () => clearTimeout(timer);
  }, [pickerSearchText]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setPickerLoading(true);
      try {
        // Không lọc isOfficial — thử thách ngày có thể lấy hướng dẫn của bất kỳ creator nào, miễn đã Published
        const res = await adminApi.getAllTutorials({ search: pickerSearch || undefined, status: "Published", page: 1, pageSize: 20 });
        if (!cancelled) setPickerResults(res.items);
      } catch {
        if (!cancelled) setPickerResults([]);
      } finally {
        if (!cancelled) setPickerLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [pickerSearch]);

  const scheduleMut = useMutation({
    mutationFn: () => dailyChallengeApi.adminSchedule(token, { challengeDate: scheduleDate, tutorialId: selectedTutorial!.id }),
    onSuccess: () => {
      toast.success(`Đã đặt lịch "${selectedTutorial?.title}" cho ngày ${formatVN(scheduleDate)}.`);
      setSelectedTutorial(null);
      qc.invalidateQueries({ queryKey: ["admin-daily-challenges"] });
    },
    onError: (error: unknown) => toast.error((error as ApiError).message || "Đặt lịch thất bại"),
  });

  function handleSchedule() {
    if (!selectedTutorial) {
      toast.error("Vui lòng chọn 1 hướng dẫn trước.");
      return;
    }
    scheduleMut.mutate();
  }

  function pickSuggestion(s: ChallengeSuggestionDto) {
    setSelectedTutorial({ id: s.tutorialId, title: s.title, coverImageUrl: s.coverImageUrl });
  }

  return (
    <div>
      <div className="admin-page-header">
        <h1 className="admin-page-title">Thử thách ngày</h1>
        <p className="admin-page-desc">Đặt lịch hướng dẫn cho Thử thách ngày, hoặc chạy tay job kích hoạt/đóng thử thách để kiểm tra không cần đợi 00:00.</p>
      </div>

      <div className="admin-toolbar">
        <div style={{ display: "flex", gap: "0.75rem", alignItems: "center", flexWrap: "wrap" }}>
          <div className="input-group" style={{ marginBottom: 0 }}>
            <label className="input-label">Từ ngày</label>
            <input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} className="input-field" />
          </div>
          <div className="input-group" style={{ marginBottom: 0 }}>
            <label className="input-label">Đến ngày</label>
            <input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} className="input-field" />
          </div>
        </div>
        <button
          className="btn btn-outline"
          onClick={() => runSchedulerMut.mutate()}
          disabled={runSchedulerMut.isPending}
          title="Đóng thử thách hôm qua + kích hoạt thử thách hôm nay ngay lập tức (dùng để test)"
        >
          {runSchedulerMut.isPending ? <Loader2 className="animate-spin" size={16} /> : <Play size={16} />}
          Chạy scheduler ngay
        </button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1.6fr 1fr", gap: "1.5rem", alignItems: "start" }} className="admin-daily-challenges-grid">
        {/* ── Danh sách lịch ── */}
        <div className="card">
          <div className="admin-table-wrapper">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Ngày</th>
                  <th>Trạng thái</th>
                  <th>Hướng dẫn</th>
                  <th>Nguồn</th>
                </tr>
              </thead>
              <tbody>
                {loadingCalendar ? (
                  <tr><td colSpan={4} className="admin-table-loading"><Loader2 className="animate-spin" size={28} style={{ margin: "0 auto" }} /></td></tr>
                ) : !calendar || calendar.items.length === 0 ? (
                  <tr><td colSpan={4} className="admin-table-empty">Chưa có thử thách nào trong khoảng ngày này.</td></tr>
                ) : (
                  calendar.items.map((c: AdminChallengeCalendarItemDto) => {
                    const meta = STATUS_META[c.status];
                    return (
                      <tr key={c.id}>
                        <td>{formatVN(c.challengeDate)}</td>
                        <td><span className={meta.className}>{meta.label}</span></td>
                        <td>{c.tutorialTitle}</td>
                        <td>
                          {c.isAutoGenerated
                            ? <span style={{ color: "var(--color-text-muted)", fontSize: "0.8125rem" }}>🤖 Tự động</span>
                            : <span style={{ color: "var(--color-text-muted)", fontSize: "0.8125rem" }}>👤 Thủ công</span>}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* ── Đặt lịch mới ── */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
          <div className="card" style={{ padding: "1.25rem" }}>
            <h3 style={{ fontWeight: 700, fontSize: "1rem", marginBottom: "0.875rem" }}>Đặt lịch mới</h3>

            <div className="input-group">
              <label className="input-label">Ngày thử thách</label>
              <input type="date" min={todayStr()} value={scheduleDate} onChange={(e) => setScheduleDate(e.target.value)} className="input-field" />
            </div>

            {selectedTutorial ? (
              <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", padding: "0.625rem", borderRadius: "var(--radius-md)", background: "var(--color-surface-2)", marginBottom: "0.875rem" }}>
                <div style={{ width: 36, height: 36, borderRadius: "var(--radius-sm)", background: "var(--color-surface)", flexShrink: 0, overflow: "hidden" }}>
                  {isValidImageUrl(selectedTutorial.coverImageUrl) && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={selectedTutorial.coverImageUrl!} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  )}
                </div>
                <span style={{ flex: 1, minWidth: 0, fontSize: "0.875rem", fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {selectedTutorial.title}
                </span>
                <button onClick={() => setSelectedTutorial(null)} className="btn btn-outline btn-sm">Đổi</button>
              </div>
            ) : (
              <>
                <div className="input-with-icon" style={{ marginBottom: "0.625rem" }}>
                  <Search className="input-icon" size={16} />
                  <input
                    type="text"
                    value={pickerSearchText}
                    onChange={(e) => setPickerSearchText(e.target.value)}
                    placeholder="Tìm hướng dẫn đã Published..."
                    className="input-field"
                  />
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", maxHeight: 220, overflowY: "auto", marginBottom: "0.875rem" }}>
                  {pickerLoading ? (
                    <div style={{ textAlign: "center", padding: "0.75rem" }}><Loader2 className="animate-spin" size={18} /></div>
                  ) : pickerResults.length === 0 ? (
                    <p style={{ textAlign: "center", color: "var(--color-text-muted)", fontSize: "0.8125rem", padding: "0.5rem 0" }}>Không tìm thấy hướng dẫn nào.</p>
                  ) : (
                    pickerResults.map((t) => (
                      <div key={t.id} style={{ display: "flex", alignItems: "center", gap: "0.625rem", padding: "0.5rem", borderRadius: "var(--radius-md)", background: "var(--color-surface-2)", cursor: "pointer" }}
                        onClick={() => setSelectedTutorial({ id: t.id, title: t.title, coverImageUrl: t.coverImageUrl })}
                      >
                        <div style={{ width: 30, height: 30, borderRadius: "var(--radius-sm)", background: "var(--color-surface)", flexShrink: 0, overflow: "hidden" }}>
                          {isValidImageUrl(t.coverImageUrl) && (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={t.coverImageUrl!} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                          )}
                        </div>
                        <span style={{ flex: 1, minWidth: 0, fontSize: "0.8125rem", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{t.title}</span>
                        <span style={{ fontSize: "0.6875rem", color: "var(--color-text-muted)" }}>{diffLabel(t.difficulty)}</span>
                      </div>
                    ))
                  )}
                </div>
              </>
            )}

            <button onClick={handleSchedule} disabled={scheduleMut.isPending || !selectedTutorial} className="btn btn-primary" style={{ width: "100%" }}>
              {scheduleMut.isPending ? "Đang đặt lịch..." : "Đặt lịch"}
            </button>
          </div>

          <div className="card" style={{ padding: "1.25rem" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.875rem" }}>
              <h3 style={{ fontWeight: 700, fontSize: "1rem", display: "flex", alignItems: "center", gap: "0.375rem" }}>
                <Sparkles size={16} /> Gợi ý
              </h3>
              <button onClick={() => refetchSuggestions()} className="btn btn-outline btn-sm">Làm mới</button>
            </div>
            {loadingSuggestions ? (
              <div style={{ textAlign: "center", padding: "0.75rem" }}><Loader2 className="animate-spin" size={18} /></div>
            ) : !suggestions || suggestions.length === 0 ? (
              <p style={{ fontSize: "0.8125rem", color: "var(--color-text-muted)" }}>Không có gợi ý phù hợp lúc này.</p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                {suggestions.map((s) => (
                  <button
                    key={s.tutorialId}
                    onClick={() => pickSuggestion(s)}
                    className="filter-chip"
                    style={{ textAlign: "left", justifyContent: "flex-start", width: "100%" }}
                  >
                    {s.title} <span style={{ opacity: 0.6, marginLeft: "0.25rem" }}>({diffLabel(s.difficulty)})</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 960px) {
          .admin-daily-challenges-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}
