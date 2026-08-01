"use client";

import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2, Search, Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import { adminApi, type AdminTutorialListItemResponse } from "@/lib/api/admin";
import {
  weeklyChallengeApi,
  type WeeklyChallengeDto,
  type WeeklyChallengeStatus,
} from "@/lib/api/weekly-challenge";
import type { ApiError } from "@/lib/api/client";
import { getToken } from "@/lib/auth";
import { isValidImageUrl } from "@/lib/utils";

const STATUS_META: Record<
  WeeklyChallengeStatus,
  { label: string; className: string }
> = {
  Scheduled: { label: "Đã lên lịch", className: "badge badge-warning" },
  Active: { label: "Đang diễn ra", className: "badge badge-success" },
  Closed: { label: "Đã đóng", className: "badge badge-neutral" },
};

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

function formatVN(iso: string) {
  const [y, m, d] = iso.split("-");
  return `${d}/${m}/${y}`;
}

export default function AdminWeeklyChallengesPage() {
  const qc = useQueryClient();
  const token = getToken() ?? "";

  const [page, setPage] = useState(1);

  const { data: calendar, isLoading: loadingCalendar } = useQuery({
    queryKey: ["admin-weekly-challenges", page],
    queryFn: () =>
      weeklyChallengeApi.adminGetChallenges(token, {
        page,
        pageSize: 60,
      }),
    enabled: !!token,
  });

  const deleteMut = useMutation({
    mutationFn: (id: string) => weeklyChallengeApi.adminDelete(token, id),
    onSuccess: () => {
      toast.success("Đã xóa thử thách tuần.");
      qc.invalidateQueries({ queryKey: ["admin-weekly-challenges"] });
    },
    onError: (error: unknown) =>
      toast.error((error as ApiError).message || "Xóa thất bại"),
  });

  // ── Form đặt lịch mới ─────────────────────────────────────────────────
  const [title, setTitle] = useState("");
  const [theme, setTheme] = useState("");
  const [startDate, setStartDate] = useState(todayStr());
  const [endDate, setEndDate] = useState(todayStr());
  const [selectedTutorial, setSelectedTutorial] = useState<{
    id: string;
    title: string;
    coverImageUrl?: string | null;
  } | null>(null);

  const [pickerSearchText, setPickerSearchText] = useState("");
  const [pickerSearch, setPickerSearch] = useState("");
  const [pickerResults, setPickerResults] = useState<
    AdminTutorialListItemResponse[]
  >([]);
  const [pickerLoading, setPickerLoading] = useState(false);

  useEffect(() => {
    const timer = setTimeout(
      () => setPickerSearch(pickerSearchText.trim()),
      400,
    );
    return () => clearTimeout(timer);
  }, [pickerSearchText]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setPickerLoading(true);
      try {
        const res = await adminApi.getAllTutorials({
          search: pickerSearch || undefined,
          status: "Published",
          page: 1,
          pageSize: 20,
        });
        if (!cancelled) setPickerResults(res.items);
      } catch {
        if (!cancelled) setPickerResults([]);
      } finally {
        if (!cancelled) setPickerLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [pickerSearch]);

  const createMut = useMutation({
    mutationFn: () =>
      weeklyChallengeApi.adminCreate(token, {
        title,
        theme: theme || null,
        startDate,
        endDate,
        tutorialId: selectedTutorial!.id,
      }),
    onSuccess: () => {
      toast.success(`Đã tạo thử thách tuần "${title}".`);
      setTitle("");
      setTheme("");
      setSelectedTutorial(null);
      qc.invalidateQueries({ queryKey: ["admin-weekly-challenges"] });
    },
    onError: (error: unknown) =>
      toast.error((error as ApiError).message || "Tạo thử thách thất bại"),
  });

  function handleCreate() {
    if (!title) {
      toast.error("Vui lòng nhập tiêu đề.");
      return;
    }
    if (!selectedTutorial) {
      toast.error("Vui lòng chọn 1 hướng dẫn trước.");
      return;
    }
    if (startDate > endDate) {
      toast.error("Ngày bắt đầu không được lớn hơn ngày kết thúc.");
      return;
    }
    createMut.mutate();
  }

  return (
    <div>
      <div className="admin-page-header">
        <h1 className="admin-page-title">Thử thách tuần</h1>
        <p className="admin-page-desc">
          Tạo và quản lý các thử thách tuần với chủ đề riêng biệt.
        </p>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1.6fr 1fr",
          gap: "1.5rem",
          alignItems: "start",
        }}
        className="admin-daily-challenges-grid"
      >
        {/* ── Danh sách lịch ── */}
        <div className="card">
          <div className="admin-table-wrapper">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Tiêu đề</th>
                  <th>Thời gian</th>
                  <th>Trạng thái</th>
                  <th>Hướng dẫn</th>
                  <th>Bài nộp</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {loadingCalendar ? (
                  <tr>
                    <td colSpan={6} className="admin-table-loading">
                      <Loader2
                        className="animate-spin"
                        size={28}
                        style={{ margin: "0 auto" }}
                      />
                    </td>
                  </tr>
                ) : !calendar || calendar.items.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="admin-table-empty">
                      Chưa có thử thách tuần nào.
                    </td>
                  </tr>
                ) : (
                  calendar.items.map((c: WeeklyChallengeDto) => {
                    const meta = STATUS_META[c.status];
                    return (
                      <tr key={c.id}>
                        <td style={{ fontWeight: 600 }}>
                          {c.title}
                          {c.theme && (
                            <div
                              style={{
                                fontSize: "0.75rem",
                                color: "var(--color-text-muted)",
                                fontWeight: "normal",
                              }}
                            >
                              {c.theme}
                            </div>
                          )}
                        </td>
                        <td style={{ whiteSpace: "nowrap" }}>
                          {formatVN(c.startDate)} <br />
                          <span
                            style={{
                              color: "var(--color-text-muted)",
                              fontSize: "0.8125rem",
                            }}
                          >
                            đến {formatVN(c.endDate)}
                          </span>
                        </td>
                        <td>
                          <span className={meta.className}>{meta.label}</span>
                        </td>
                        <td>{c.tutorialTitle}</td>
                        <td style={{ textAlign: "center" }}>
                          {c.submissionCount}
                        </td>
                        <td>
                          <button
                            onClick={() => {
                              if (
                                confirm(
                                  "Bạn có chắc chắn muốn xóa thử thách tuần này?",
                                )
                              ) {
                                deleteMut.mutate(c.id);
                              }
                            }}
                            className="btn btn-outline btn-sm"
                            style={{
                              color: "var(--color-danger)",
                              borderColor: "var(--color-danger)",
                            }}
                            disabled={deleteMut.isPending}
                          >
                            <Trash2 size={16} />
                          </button>
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
        <div
          style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}
        >
          <div className="card" style={{ padding: "1.25rem" }}>
            <h3
              style={{
                fontWeight: 700,
                fontSize: "1rem",
                marginBottom: "0.875rem",
              }}
            >
              Tạo thử thách tuần
            </h3>

            <div className="input-group">
              <label className="input-label">Tiêu đề</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="input-field"
              />
            </div>

            <div className="input-group">
              <label className="input-label">Chủ đề</label>
              <input
                type="text"
                value={theme}
                onChange={(e) => setTheme(e.target.value)}
                className="input-field"
              />
            </div>

            <div style={{ display: "flex", gap: "0.75rem" }}>
              <div className="input-group" style={{ flex: 1 }}>
                <label className="input-label">Từ ngày</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="input-field"
                />
              </div>
              <div className="input-group" style={{ flex: 1 }}>
                <label className="input-label">Đến ngày</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="input-field"
                />
              </div>
            </div>

            {selectedTutorial ? (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.75rem",
                  padding: "0.625rem",
                  borderRadius: "var(--radius-md)",
                  background: "var(--color-surface-2)",
                  marginBottom: "0.875rem",
                }}
              >
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: "var(--radius-sm)",
                    background: "var(--color-surface)",
                    flexShrink: 0,
                    overflow: "hidden",
                  }}
                >
                  {isValidImageUrl(selectedTutorial.coverImageUrl) && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={selectedTutorial.coverImageUrl!}
                      alt=""
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                      }}
                    />
                  )}
                </div>
                <span
                  style={{
                    flex: 1,
                    minWidth: 0,
                    fontSize: "0.875rem",
                    fontWeight: 600,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {selectedTutorial.title}
                </span>
                <button
                  onClick={() => setSelectedTutorial(null)}
                  className="btn btn-outline btn-sm"
                >
                  Đổi
                </button>
              </div>
            ) : (
              <>
                <div
                  className="input-with-icon"
                  style={{ marginBottom: "0.625rem" }}
                >
                  <Search className="input-icon" size={16} />
                  <input
                    type="text"
                    value={pickerSearchText}
                    onChange={(e) => setPickerSearchText(e.target.value)}
                    placeholder="Tìm bài hướng dẫn"
                    className="input-field"
                  />
                </div>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "0.5rem",
                    maxHeight: 220,
                    overflowY: "auto",
                    marginBottom: "0.875rem",
                  }}
                >
                  {pickerLoading ? (
                    <div style={{ textAlign: "center", padding: "0.75rem" }}>
                      <Loader2 className="animate-spin" size={18} />
                    </div>
                  ) : pickerResults.length === 0 ? (
                    <p
                      style={{
                        textAlign: "center",
                        color: "var(--color-text-muted)",
                        fontSize: "0.8125rem",
                        padding: "0.5rem 0",
                      }}
                    >
                      Không tìm thấy hướng dẫn nào.
                    </p>
                  ) : (
                    pickerResults.map((t) => (
                      <div
                        key={t.id}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "0.625rem",
                          padding: "0.5rem",
                          borderRadius: "var(--radius-md)",
                          background: "var(--color-surface-2)",
                          cursor: "pointer",
                        }}
                        onClick={() =>
                          setSelectedTutorial({
                            id: t.id,
                            title: t.title,
                            coverImageUrl: t.coverImageUrl,
                          })
                        }
                      >
                        <div
                          style={{
                            width: 30,
                            height: 30,
                            borderRadius: "var(--radius-sm)",
                            background: "var(--color-surface)",
                            flexShrink: 0,
                            overflow: "hidden",
                          }}
                        >
                          {isValidImageUrl(t.coverImageUrl) && (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={t.coverImageUrl!}
                              alt=""
                              style={{
                                width: "100%",
                                height: "100%",
                                objectFit: "cover",
                              }}
                            />
                          )}
                        </div>
                        <span
                          style={{
                            flex: 1,
                            minWidth: 0,
                            fontSize: "0.8125rem",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {t.title}
                        </span>
                        <span
                          style={{
                            fontSize: "0.6875rem",
                            color: "var(--color-text-muted)",
                          }}
                        >
                          {t.authorName}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </>
            )}

            <button
              onClick={handleCreate}
              disabled={createMut.isPending || !selectedTutorial || !title}
              className="btn btn-primary"
              style={{ width: "100%" }}
            >
              {createMut.isPending ? "Đang tạo..." : "Tạo thử thách"}
            </button>
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
