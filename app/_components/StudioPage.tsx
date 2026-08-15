"use client";

import Link from "next/link";
import { useState, useEffect, useCallback } from "react";
import Navbar from "./Navbar";
import Footer from "./Footer";
import { tutorialsApi } from "@/lib/api/tutorials";
import type { MyTutorialDto, TutorialStatusValue } from "@/lib/api/tutorials";
import { getToken, getUser } from "@/lib/auth";
import { useRouter } from "next/navigation";
import { useConfirm } from "@/lib/contexts/ConfirmContext";

// Trạng thái thật của BE (Domain.Enums.TutorialStatus)
const STATUS_META: Record<TutorialStatusValue, { label: string; color: string; bg: string; icon: string }> = {
  Draft:                { label: "Bản nháp",       color: "#555550", bg: "#F5F5F0", icon: "✏️" },
  PendingManagerReview: { label: "Chờ duyệt",      color: "#D97706", bg: "#FEF3C7", icon: "⏳" },
  RevisionRequired:     { label: "Cần chỉnh sửa",  color: "#DC2626", bg: "#FEE2E2", icon: "❌" },
  Published:            { label: "Đã xuất bản",    color: "#059669", bg: "#D1FAE5", icon: "✅" },
  Removed:              { label: "Đã gỡ",          color: "#6B7280", bg: "#F3F4F6", icon: "🚫" },
  EditPendingReview:    { label: "Đang soạn bản chỉnh sửa", color: "#2563EB", bg: "#DBEAFE", icon: "📝" },
  Merged:               { label: "Đã hợp nhất",    color: "#6B7280", bg: "#F3F4F6", icon: "✓" },
};

// Trạng thái author có thể bấm "Sửa" trực tiếp đối với bài GỐC (BR-TUT-01 — khớp điều kiện Submit ở BE).
// Với working copy (parentTutorialId != null), điều kiện sửa/nộp khác — xem isEditableRow/isSubmittableRow.
const EDITABLE_STATUSES: TutorialStatusValue[] = ["Draft", "RevisionRequired"];
// Trạng thái working copy có thể bấm "Sửa"/"Nộp lại" (khớp UpdateWorkingCopyHandler/SubmitEditHandler ở BE).
const WORKING_COPY_EDITABLE_STATUSES: TutorialStatusValue[] = ["EditPendingReview", "RevisionRequired"];

function isEditableRow(t: MyTutorialDto): boolean {
  return t.parentTutorialId
    ? WORKING_COPY_EDITABLE_STATUSES.includes(t.status)
    : EDITABLE_STATUSES.includes(t.status);
}

type Tab = "all" | TutorialStatusValue;

export default function StudioPage() {
  const router = useRouter();
  const confirm = useConfirm();
  const [activeTab, setActiveTab] = useState<Tab>("all");
  const [tutorials, setTutorials] = useState<MyTutorialDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [submittingId, setSubmittingId] = useState<string | null>(null);
  const [requestingEditId, setRequestingEditId] = useState<string | null>(null);

  const loadTutorials = useCallback(async (pageNum = 1, append = false) => {
    const token = getToken();
    if (!token) {
      router.push("/dang-nhap");
      return;
    }
    try {
      setLoading(true);
      const result = await tutorialsApi.getMyTutorials(token, { page: pageNum, pageSize: 20 });
      if (append) {
        setTutorials(prev => [...prev, ...result.items]);
      } else {
        setTutorials(result.items);
      }
      setTotalPages(result.totalPages);
      setPage(pageNum);
    } catch (err: unknown) {
      const apiErr = err as { message?: string };
      setError(apiErr.message ?? "Không thể tải danh sách bài hướng dẫn.");
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    const user = getUser();
    if (!user) { router.push("/dang-nhap"); return; }
    loadTutorials(1);
  }, [loadTutorials, router]);

  const filtered = activeTab === "all"
    ? tutorials
    : tutorials.filter(t => t.status === activeTab);

  // Stats computed from loaded data
  const statsByStatus = tutorials.reduce<Record<string, number>>((acc, t) => {
    acc[t.status] = (acc[t.status] ?? 0) + 1;
    return acc;
  }, {});

  async function handleSubmit(t: MyTutorialDto) {
    const token = getToken();
    if (!token) return;
    
    const isConfirmed = await confirm({
      title: "Xác nhận nộp bài",
      description: "Bạn có chắc muốn nộp bài này để kiểm duyệt?",
      confirmText: "Nộp bài",
    });
    if (!isConfirmed) return;

    setSubmittingId(t.id);
    try {
      if (t.parentTutorialId) {
        await tutorialsApi.submitEdit(token, t.id);
      } else {
        await tutorialsApi.submitTutorial(token, t.id);
      }
      setTutorials(prev =>
        prev.map(x => x.id === t.id ? { ...x, status: "PendingManagerReview" as const } : x)
      );
    } catch (err: unknown) {
      const apiErr = err as { message?: string };
      alert(apiErr.message ?? "Không thể nộp bài. Vui lòng thử lại.");
    } finally {
      setSubmittingId(null);
    }
  }

  async function handleRequestEdit(t: MyTutorialDto) {
    const token = getToken();
    if (!token) return;
    
    const isConfirmed = await confirm({
      title: "Yêu cầu chỉnh sửa",
      description: `Tạo bản chỉnh sửa cho "${t.title}"? Bài gốc vẫn hiển thị công khai cho đến khi bản sửa được duyệt.`,
      confirmText: "Tạo bản sửa",
    });
    if (!isConfirmed) return;

    setRequestingEditId(t.id);
    try {
      const { workingCopyId } = await tutorialsApi.createWorkingCopy(token, t.id);
      router.push(`/studio/${workingCopyId}`);
    } catch (err: unknown) {
      const apiErr = err as { message?: string };
      alert(apiErr.message ?? "Không thể tạo bản chỉnh sửa. Vui lòng thử lại.");
    } finally {
      setRequestingEditId(null);
    }
  }

  const CHANNEL_STATS = [
    { label: "Đã xuất bản", value: statsByStatus["Published"] ?? 0, icon: "✅" },
    { label: "Chờ duyệt",   value: statsByStatus["PendingManagerReview"] ?? 0, icon: "⏳" },
    { label: "Bản nháp",    value: statsByStatus["Draft"] ?? 0, icon: "✏️" },
    { label: "Cần sửa",     value: statsByStatus["RevisionRequired"] ?? 0, icon: "❌" },
  ];

  return (
    <>
      <Navbar />
      <main style={{ minHeight: "100vh", background: "var(--color-bg)", paddingTop: "2rem", paddingBottom: "4rem" }}>
        <div className="container">

          {/* Studio Header */}
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "2rem", flexWrap: "wrap", gap: "1rem" }}>
            <div>
              <div style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", background: "rgba(212,113,59,0.08)", borderRadius: "var(--radius-full)", padding: "0.375rem 1rem", marginBottom: "0.75rem" }}>
                <span style={{ fontSize: "0.8125rem", color: "var(--color-accent)", fontWeight: 600 }}>🎬 Creator Studio</span>
              </div>
              <h1 className="text-heading" style={{ fontSize: "1.875rem", color: "var(--color-text-primary)", marginBottom: "0.25rem" }}>Bài hướng dẫn của tôi</h1>
              <p style={{ color: "var(--color-text-muted)", fontSize: "0.9375rem" }}>Quản lý và theo dõi tất cả bài hướng dẫn của bạn</p>
            </div>
            <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
              <Link href="/studio/doanh-thu" className="btn btn-outline" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>
                Doanh thu
              </Link>
              <Link href="/studio/moi" className="btn btn-primary" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
                Tạo bài mới
              </Link>
            </div>
          </div>

          {/* Stats */}
          {!loading && (
            <div style={{ display: "flex", gap: "1rem", marginBottom: "2rem", flexWrap: "wrap" }}>
              {CHANNEL_STATS.map((s) => (
                <div key={s.label} style={{ background: "var(--color-surface)", borderRadius: "var(--radius-lg)", border: "1px solid var(--color-border)", padding: "1rem 1.25rem", display: "flex", alignItems: "center", gap: "0.875rem", boxShadow: "var(--shadow-xs)", flex: "1", minWidth: "140px" }}>
                  <span style={{ fontSize: "1.5rem" }}>{s.icon}</span>
                  <div>
                    <div style={{ fontWeight: 800, fontSize: "1.375rem", color: "var(--color-primary)", lineHeight: 1 }}>{s.value}</div>
                    <div style={{ fontSize: "0.75rem", color: "var(--color-text-muted)", marginTop: "0.125rem" }}>{s.label}</div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Tabs */}
          <div style={{ display: "flex", gap: "0", borderBottom: "2px solid var(--color-border)", marginBottom: "1.5rem" }}>
            {([
              ["all", "Tất cả"],
              ["Published", "Đã xuất bản"],
              ["PendingManagerReview", "Chờ duyệt"],
              ["Draft", "Bản nháp"],
              ["RevisionRequired", "Cần sửa"],
            ] as const).map(([key, label]) => {
              const count = key === "all" ? tutorials.length : tutorials.filter(t => t.status === key).length;
              return (
                <button key={key} onClick={() => setActiveTab(key as Tab)}
                  style={{ padding: "0.75rem 1.25rem", border: "none", background: "none", borderBottom: `2.5px solid ${activeTab === key ? "var(--color-primary)" : "transparent"}`, marginBottom: "-2px", color: activeTab === key ? "var(--color-primary)" : "var(--color-text-muted)", fontWeight: activeTab === key ? 700 : 500, fontSize: "0.9rem", cursor: "pointer", whiteSpace: "nowrap" }}>
                  {label} <span style={{ fontSize: "0.8125rem", opacity: 0.7 }}>({count})</span>
                </button>
              );
            })}
          </div>

          {/* Error state */}
          {error && !loading && (
            <div style={{ textAlign: "center", padding: "3rem 1rem" }}>
              <div style={{ fontSize: "3rem", marginBottom: "0.75rem" }}>⚠️</div>
              <p style={{ fontWeight: 600, color: "var(--color-text-primary)", marginBottom: "0.25rem" }}>{error}</p>
              <button onClick={() => loadTutorials(1)} className="btn btn-primary" style={{ marginTop: "1rem" }}>Thử lại</button>
            </div>
          )}

          {/* Loading skeleton */}
          {loading && (
            <div style={{ background: "var(--color-surface)", borderRadius: "var(--radius-xl)", border: "1px solid var(--color-border)", overflow: "hidden" }}>
              {[1, 2, 3, 4].map(i => (
                <div key={i} style={{ display: "grid", gridTemplateColumns: "2fr 1fr 120px 100px 140px", gap: "1rem", padding: "1rem 1.25rem", borderBottom: "1px solid var(--color-border)", alignItems: "center" }}>
                  <div style={{ display: "flex", gap: "0.875rem", alignItems: "center" }}>
                    <div style={{ width: "3rem", height: "3rem", borderRadius: "var(--radius-md)", background: "var(--color-surface-2)" }} />
                    <div style={{ flex: 1 }}>
                      <div style={{ height: "0.875rem", background: "var(--color-surface-2)", borderRadius: "4px", width: "70%", marginBottom: "0.5rem" }} />
                      <div style={{ height: "0.75rem", background: "var(--color-surface-2)", borderRadius: "4px", width: "40%" }} />
                    </div>
                  </div>
                  {[1,2,3,4].map(j => <div key={j} style={{ height: "0.875rem", background: "var(--color-surface-2)", borderRadius: "4px" }} />)}
                </div>
              ))}
            </div>
          )}

          {/* Tutorial Table */}
          {!loading && !error && (
            <div style={{ background: "var(--color-surface)", borderRadius: "var(--radius-xl)", border: "1px solid var(--color-border)", overflow: "hidden", boxShadow: "var(--shadow-sm)" }}>
              {/* Table Header */}
              <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 120px 100px 140px", gap: "1rem", padding: "0.875rem 1.25rem", background: "var(--color-surface-2)", borderBottom: "1px solid var(--color-border)", fontSize: "0.8125rem", fontWeight: 600, color: "var(--color-text-muted)", textTransform: "uppercase", letterSpacing: "0.04em" }}>
                <span>Bài hướng dẫn</span>
                <span>Loại</span>
                <span>Trạng thái</span>
                <span>Ngày tạo</span>
                <span>Hành động</span>
              </div>

              {filtered.length === 0 ? (
                <div style={{ textAlign: "center", padding: "3rem 1rem" }}>
                  <div style={{ fontSize: "3rem", marginBottom: "0.75rem" }}>📭</div>
                  <p style={{ fontWeight: 600, color: "var(--color-text-primary)", marginBottom: "0.25rem" }}>Không có bài nào</p>
                  <Link href="/studio/moi" className="btn btn-primary" style={{ textDecoration: "none", display: "inline-flex", marginTop: "1rem" }}>Tạo bài mới</Link>
                </div>
              ) : (
                filtered.map((t, i) => {
                  const meta = STATUS_META[t.status] ?? STATUS_META["Draft"];
                  const canEdit = isEditableRow(t);
                  const canSubmit = canEdit;
                  // Published có bản sửa đang xử lý (chưa Merged) thì ẩn nút "Yêu cầu chỉnh sửa" — BE chỉ cho 1 working copy/bài.
                  const hasInProgressEdit = t.status === "Published" &&
                    tutorials.some(x => x.parentTutorialId === t.id && x.status !== "Merged");
                  return (
                    <div key={t.id} style={{ display: "grid", gridTemplateColumns: "2fr 1fr 120px 100px 140px", gap: "1rem", padding: "1rem 1.25rem", borderBottom: i < filtered.length - 1 ? "1px solid var(--color-border)" : "none", alignItems: "center" }}>
                      {/* Title */}
                      <div style={{ display: "flex", alignItems: "center", gap: "0.875rem" }}>
                        {t.coverImageUrl ? (
                          <img src={t.coverImageUrl} alt={t.title}
                            style={{ width: "3rem", height: "3rem", borderRadius: "var(--radius-md)", objectFit: "cover", flexShrink: 0 }} />
                        ) : (
                          <div style={{ width: "3rem", height: "3rem", borderRadius: "var(--radius-md)", background: "var(--color-surface-2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.25rem", flexShrink: 0 }}>📄</div>
                        )}
                        <div style={{ minWidth: 0 }}>
                          <p style={{ fontWeight: 700, fontSize: "0.9375rem", color: "var(--color-text-primary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", display: "flex", alignItems: "center", gap: "0.375rem" }}>
                            {t.parentTutorialId && (
                              <span title="Bản chỉnh sửa của một bài đã xuất bản" style={{ fontSize: "0.6875rem", fontWeight: 700, color: "#2563EB", background: "#DBEAFE", borderRadius: "var(--radius-full)", padding: "0.0625rem 0.5rem", flexShrink: 0 }}>Bản sửa</span>
                            )}
                            <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{t.title}</span>
                          </p>
                          <p style={{ fontSize: "0.75rem", color: "var(--color-text-muted)" }}>{t.stepCount} bước</p>
                        </div>
                      </div>

                      {/* Type */}
                      <span className={`badge ${t.type === "VIP" ? "badge-vip" : "badge-free"}`} style={{ width: "fit-content" }}>{t.type}</span>

                      {/* Status */}
                      <span style={{ display: "inline-flex", alignItems: "center", gap: "0.375rem", background: meta.bg, color: meta.color, borderRadius: "var(--radius-full)", padding: "0.25rem 0.75rem", fontSize: "0.8125rem", fontWeight: 600, width: "fit-content" }}>
                        {meta.icon} {meta.label}
                      </span>

                      {/* Created date */}
                      <span style={{ fontSize: "0.8125rem", color: "var(--color-text-secondary)" }}>
                        {new Date(t.createdAt).toLocaleDateString("vi-VN")}
                      </span>

                      {/* Actions */}
                      <div style={{ display: "flex", gap: "0.375rem", flexWrap: "wrap" }}>
                        {canEdit && (
                          <Link href={`/studio/${t.id}`}
                            style={{ padding: "0.375rem 0.625rem", borderRadius: "var(--radius-md)", border: "1.5px solid var(--color-border)", background: "transparent", color: "var(--color-text-secondary)", fontSize: "0.75rem", textDecoration: "none", fontWeight: 500, display: "inline-flex", alignItems: "center", gap: "0.25rem" }}>
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>
                            Sửa
                          </Link>
                        )}
                        {canSubmit && (
                          <button onClick={() => handleSubmit(t)} disabled={submittingId === t.id}
                            style={{ padding: "0.375rem 0.625rem", borderRadius: "var(--radius-md)", border: "1.5px solid var(--color-primary)", background: "transparent", color: "var(--color-primary)", fontSize: "0.75rem", fontWeight: 500, cursor: "pointer", opacity: submittingId === t.id ? 0.6 : 1 }}>
                            {submittingId === t.id ? "…" : t.status === "RevisionRequired" ? "Nộp lại" : "Nộp"}
                          </button>
                        )}
                        {t.status === "Published" && (
                          <>
                            <Link href={`/huong-dan/${t.slug}`}
                              style={{ padding: "0.375rem 0.625rem", borderRadius: "var(--radius-md)", border: "1.5px solid var(--color-primary)", background: "transparent", color: "var(--color-primary)", fontSize: "0.75rem", textDecoration: "none", fontWeight: 500, display: "inline-flex", alignItems: "center" }}>
                              Xem
                            </Link>
                            {!hasInProgressEdit && (
                              <button onClick={() => handleRequestEdit(t)} disabled={requestingEditId === t.id}
                                style={{ padding: "0.375rem 0.625rem", borderRadius: "var(--radius-md)", border: "1.5px solid var(--color-border)", background: "transparent", color: "var(--color-text-secondary)", fontSize: "0.75rem", fontWeight: 500, cursor: "pointer", opacity: requestingEditId === t.id ? 0.6 : 1 }}>
                                {requestingEditId === t.id ? "…" : "Yêu cầu chỉnh sửa"}
                              </button>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}

          {/* Load more */}
          {!loading && !error && page < totalPages && (
            <div style={{ textAlign: "center", marginTop: "1.5rem" }}>
              <button onClick={() => loadTutorials(page + 1, true)}
                style={{ background: "var(--color-surface)", border: "1.5px solid var(--color-border)", borderRadius: "var(--radius-md)", padding: "0.625rem 1.5rem", fontSize: "0.9rem", color: "var(--color-text-secondary)", cursor: "pointer", fontWeight: 500 }}>
                Tải thêm
              </button>
            </div>
          )}
        </div>
      </main>
      <Footer />

      <style>{`
        @media (max-width: 900px) {
          [style*="grid-template-columns: 2fr 1fr 120px 100px 140px"] {
            grid-template-columns: 1fr 1fr !important;
          }
        }
      `}</style>
    </>
  );
}
