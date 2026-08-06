"use client";
// _components/AdminLearningPathModesPage.tsx — Quản lý "Chế độ lộ trình" (Cơ bản/Nâng cao/...)
// + cấu hình bài test mở khoá cho từng chế độ + hàng đợi duyệt ảnh nộp bài test.

import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient, keepPreviousData } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { Loader2, Plus, Pencil, Search, Layers, Check, X, Camera } from "lucide-react";
import { learningPathModesApi } from "@/lib/api/learning-path-modes";
import type { LearningPathModeAdminDto, ModeUnlockSubmissionDto } from "@/lib/api/learning-path-modes";
import { adminApi } from "@/lib/api/admin";
import type { AdminTutorialListItemResponse } from "@/lib/api/admin";
import type { ApiError } from "@/lib/api";
import { getToken } from "@/lib/auth";
import { isValidImageUrl, diffLabel, DIFFICULTY_OPTIONS } from "@/lib/utils";

interface ModeFormState {
  id: string | null; // null = tạo mới
  name: string;
  description: string;
  sortOrder: number;
  isActive: boolean;
}

const EMPTY_MODE_FORM: ModeFormState = { id: null, name: "", description: "", sortOrder: 1, isActive: true };

const STATUS_META: Record<string, { label: string; badge: string }> = {
  Pending: { label: "Chờ duyệt", badge: "badge-warning" },
  Approved: { label: "Đã duyệt", badge: "badge-success" },
  Rejected: { label: "Đã từ chối", badge: "badge-danger" },
};

export default function AdminLearningPathModesPage() {
  const qc = useQueryClient();
  const token = getToken() ?? "";

  // ── Modes CRUD ─────────────────────────────────────────────────────────
  const [form, setForm] = useState<ModeFormState>(EMPTY_MODE_FORM);
  const isEditingMode = form.id !== null;

  const { data: modes, isLoading: modesLoading } = useQuery({
    queryKey: ["admin-learning-path-modes"],
    queryFn: () => learningPathModesApi.getAllAdmin(token),
  });

  const createModeMut = useMutation({
    mutationFn: (body: { name: string; description: string | null; sortOrder: number }) =>
      learningPathModesApi.create(token, body),
    onSuccess: () => {
      toast.success("Đã tạo chế độ.");
      setForm(EMPTY_MODE_FORM);
      qc.invalidateQueries({ queryKey: ["admin-learning-path-modes"] });
    },
    onError: (error: unknown) => toast.error((error as ApiError).message || "Tạo chế độ thất bại"),
  });

  const updateModeMut = useMutation({
    mutationFn: (vars: { id: string; body: { name: string; description: string | null; sortOrder: number; isActive: boolean } }) =>
      learningPathModesApi.update(token, vars.id, vars.body),
    onSuccess: () => {
      toast.success("Đã lưu thay đổi.");
      setForm(EMPTY_MODE_FORM);
      qc.invalidateQueries({ queryKey: ["admin-learning-path-modes"] });
    },
    onError: (error: unknown) => toast.error((error as ApiError).message || "Cập nhật thất bại"),
  });

  function startEditMode(m: LearningPathModeAdminDto) {
    setForm({ id: m.id, name: m.name, description: m.description ?? "", sortOrder: m.sortOrder, isActive: m.isActive });
  }

  function handleSubmitMode() {
    const name = form.name.trim();
    if (name.length < 1 || name.length > 100) {
      toast.error("Tên chế độ phải từ 1-100 ký tự.");
      return;
    }
    if (form.sortOrder < 1) {
      toast.error("Thứ tự phải là số nguyên dương.");
      return;
    }
    const description = form.description.trim() || null;
    if (isEditingMode) {
      updateModeMut.mutate({ id: form.id!, body: { name, description, sortOrder: form.sortOrder, isActive: form.isActive } });
    } else {
      createModeMut.mutate({ name, description, sortOrder: form.sortOrder });
    }
  }

  // ── Unlock test config ────────────────────────────────────────────────
  const [testConfigModeId, setTestConfigModeId] = useState<string | null>(null);
  const [testTutorialId, setTestTutorialId] = useState("");
  const [testTutorialTitle, setTestTutorialTitle] = useState("");
  const [testInstructions, setTestInstructions] = useState("");
  const [pickerSearchText, setPickerSearchText] = useState("");
  const [pickerSearch, setPickerSearch] = useState("");
  const [pickerDifficulty, setPickerDifficulty] = useState("");
  const [pickerResults, setPickerResults] = useState<AdminTutorialListItemResponse[]>([]);
  const [pickerLoading, setPickerLoading] = useState(false);

  function openTestConfig(m: LearningPathModeAdminDto) {
    setTestConfigModeId(m.id);
    setTestTutorialId(m.unlockTestTutorialId ?? "");
    setTestTutorialTitle(m.unlockTestTutorialTitle ?? "");
    setTestInstructions(m.unlockTestInstructions ?? "");
    setPickerSearchText("");
    setPickerDifficulty("");
    setPickerResults([]);
  }

  useEffect(() => {
    const timer = setTimeout(() => setPickerSearch(pickerSearchText.trim()), 400);
    return () => clearTimeout(timer);
  }, [pickerSearchText]);

  useEffect(() => {
    if (testConfigModeId === null) return;
    let cancelled = false;
    (async () => {
      setPickerLoading(true);
      try {
        const res = await adminApi.getAllTutorials({
          search: pickerSearch || undefined,
          status: "Published",
          isOfficial: true,
          difficulty: pickerDifficulty || undefined,
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
    return () => { cancelled = true; };
  }, [testConfigModeId, pickerSearch, pickerDifficulty]);

  const upsertTestMut = useMutation({
    mutationFn: (vars: { modeId: string; tutorialId: string; instructions: string | null }) =>
      learningPathModesApi.upsertUnlockTest(token, vars.modeId, { tutorialId: vars.tutorialId, instructions: vars.instructions }),
    onSuccess: () => {
      toast.success("Đã lưu bài test.");
      setTestConfigModeId(null);
      qc.invalidateQueries({ queryKey: ["admin-learning-path-modes"] });
    },
    onError: (error: unknown) => toast.error((error as ApiError).message || "Lưu bài test thất bại"),
  });

  function handleSaveTestConfig() {
    if (!testConfigModeId || !testTutorialId) {
      toast.error("Vui lòng chọn 1 hướng dẫn làm đề test.");
      return;
    }
    upsertTestMut.mutate({ modeId: testConfigModeId, tutorialId: testTutorialId, instructions: testInstructions.trim() || null });
  }

  // ── Submission review queue ───────────────────────────────────────────
  const [queueModeId, setQueueModeId] = useState("");
  const [queueStatus, setQueueStatus] = useState("Pending");
  const [queuePage, setQueuePage] = useState(1);
  const [enlargedPhoto, setEnlargedPhoto] = useState<string | null>(null);

  const { data: queueData, isLoading: queueLoading } = useQuery({
    queryKey: ["admin-mode-unlock-submissions", queueModeId, queueStatus, queuePage],
    queryFn: () =>
      learningPathModesApi.getSubmissionsAdmin(token, {
        modeId: queueModeId || undefined,
        status: queueStatus || undefined,
        page: queuePage,
        pageSize: 10,
      }),
    placeholderData: keepPreviousData,
  });

  const approveMut = useMutation({
    mutationFn: (id: string) => learningPathModesApi.approveSubmission(token, id),
    onSuccess: () => {
      toast.success("Đã duyệt — chế độ đã được mở khoá cho người dùng.");
      qc.invalidateQueries({ queryKey: ["admin-mode-unlock-submissions"] });
    },
    onError: (error: unknown) => toast.error((error as ApiError).message || "Lỗi duyệt bài nộp"),
  });

  const rejectMut = useMutation({
    mutationFn: (vars: { id: string; reason: string }) => learningPathModesApi.rejectSubmission(token, vars.id, vars.reason),
    onSuccess: () => {
      toast.success("Đã từ chối bài nộp.");
      qc.invalidateQueries({ queryKey: ["admin-mode-unlock-submissions"] });
    },
    onError: (error: unknown) => toast.error((error as ApiError).message || "Lỗi từ chối bài nộp"),
  });

  function handleReject(s: ModeUnlockSubmissionDto) {
    const reason = prompt("Nhập lý do từ chối (tối thiểu 5 ký tự):");
    if (!reason || reason.trim().length < 5) {
      if (reason !== null) toast.error("Lý do quá ngắn!");
      return;
    }
    rejectMut.mutate({ id: s.id, reason: reason.trim() });
  }

  return (
    <div>
      <div className="admin-page-header">
        <h1 className="admin-page-title">Chế độ lộ trình</h1>
        <p className="admin-page-desc">
          Quản lý các chế độ (Cơ bản/Nâng cao/...), bài test gấp giấy để mở khoá chế độ tiếp theo, và duyệt ảnh người dùng nộp.
        </p>
      </div>

      {/* ── Modes ── */}
      <div style={{ display: "grid", gridTemplateColumns: "1.6fr 1fr", gap: "1.5rem", alignItems: "start", marginBottom: "2.5rem" }} className="admin-categories-grid">
        <div className="card">
          <div className="admin-table-wrapper">
            <table className="admin-table">
              <thead>
                <tr>
                  <th style={{ width: 70 }}>Thứ tự</th>
                  <th>Tên chế độ</th>
                  <th>Trạng thái</th>
                  <th>Số lộ trình</th>
                  <th>Bài test</th>
                  <th style={{ textAlign: "right" }}>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {modesLoading ? (
                  <tr><td colSpan={6} className="admin-table-loading"><Loader2 className="animate-spin" size={28} style={{ margin: "0 auto" }} /></td></tr>
                ) : !modes || modes.length === 0 ? (
                  <tr><td colSpan={6} className="admin-table-empty"><Layers size={32} style={{ margin: "0 auto 0.5rem" }} /><p>Chưa có chế độ nào.</p></td></tr>
                ) : (
                  [...modes].sort((a, b) => a.sortOrder - b.sortOrder).map((m, idx) => (
                    <tr key={m.id}>
                      <td>#{m.sortOrder}</td>
                      <td style={{ fontWeight: 600 }}>{m.name}</td>
                      <td>
                        <span className={`badge ${m.isActive ? "badge-success" : "badge-neutral"}`}>
                          {m.isActive ? "Hoạt động" : "Đã tắt"}
                        </span>
                      </td>
                      <td>{m.pathCount}</td>
                      <td>
                        {idx === 0 ? (
                          <span style={{ fontSize: "0.8125rem", color: "var(--color-text-muted)" }}>Không cần (mở sẵn)</span>
                        ) : m.unlockTestTutorialTitle ? (
                          <span className="badge badge-success" title={m.unlockTestTutorialTitle}>Đã cấu hình</span>
                        ) : (
                          <span className="badge badge-neutral">Chưa có</span>
                        )}
                      </td>
                      <td>
                        <div style={{ display: "flex", gap: "0.5rem", justifyContent: "flex-end" }}>
                          {idx !== 0 && (
                            <button className="admin-icon-action" title="Cấu hình bài test" onClick={() => openTestConfig(m)}>
                              <Camera size={16} />
                            </button>
                          )}
                          <button className="admin-icon-action" title="Sửa" onClick={() => startEditMode(m)}>
                            <Pencil size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="card" style={{ padding: "1.25rem" }}>
          <h3 style={{ fontWeight: 700, fontSize: "1rem", marginBottom: "0.875rem" }}>
            {isEditingMode ? "Sửa chế độ" : "Thêm chế độ mới"}
          </h3>

          <div className="input-group">
            <label className="input-label">Tên chế độ *</label>
            <input
              type="text"
              className="input-field"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              placeholder="VD: Cơ bản, Nâng cao..."
              maxLength={100}
            />
          </div>

          <div className="input-group">
            <label className="input-label">Mô tả</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              rows={3}
              maxLength={500}
              className="input-field"
              style={{ width: "100%", resize: "vertical" }}
            />
          </div>

          <div className="input-group">
            <label className="input-label">Thứ tự *</label>
            <input
              type="number"
              min={1}
              className="input-field"
              value={form.sortOrder}
              onChange={(e) => setForm((f) => ({ ...f, sortOrder: Number(e.target.value) }))}
            />
          </div>

          {isEditingMode && (
            <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1rem", fontSize: "0.875rem", cursor: "pointer" }}>
              <input type="checkbox" checked={form.isActive} onChange={(e) => setForm((f) => ({ ...f, isActive: e.target.checked }))} />
              Đang hoạt động (hiện trên trang /lo-trinh)
            </label>
          )}

          <div style={{ display: "flex", gap: "0.625rem" }}>
            <button
              onClick={handleSubmitMode}
              disabled={createModeMut.isPending || updateModeMut.isPending || !form.name.trim()}
              className="btn btn-primary"
              style={{ flex: 1 }}
            >
              {createModeMut.isPending || updateModeMut.isPending ? (
                <Loader2 className="animate-spin" size={16} />
              ) : isEditingMode ? (
                "Lưu thay đổi"
              ) : (
                <><Plus size={16} /> Thêm chế độ</>
              )}
            </button>
            {isEditingMode && (
              <button onClick={() => setForm(EMPTY_MODE_FORM)} className="btn btn-outline">Huỷ</button>
            )}
          </div>
        </div>
      </div>

      {/* ── Test config modal ── */}
      {testConfigModeId && (
        <div
          style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 50, display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem" }}
          onClick={() => setTestConfigModeId(null)}
        >
          <div className="card" style={{ padding: "1.5rem", maxWidth: 520, width: "100%", maxHeight: "85vh", overflowY: "auto" }} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ fontWeight: 700, fontSize: "1.0625rem", marginBottom: "1rem" }}>Cấu hình bài test mở khoá</h3>

            {testTutorialId && testTutorialTitle && (
              <div style={{ padding: "0.625rem 0.875rem", borderRadius: "var(--radius-md)", background: "var(--color-surface-2)", marginBottom: "0.875rem", fontSize: "0.875rem" }}>
                Đề hiện tại: <strong>{testTutorialTitle}</strong>
              </div>
            )}

            <div style={{ display: "flex", gap: "0.5rem", marginBottom: "0.75rem" }}>
              <div className="input-with-icon" style={{ flex: 1 }}>
                <Search className="input-icon" size={16} />
                <input
                  type="text"
                  value={pickerSearchText}
                  onChange={(e) => setPickerSearchText(e.target.value)}
                  placeholder="Tìm hướng dẫn official đã xuất bản..."
                  className="input-field"
                />
              </div>
              <select
                value={pickerDifficulty}
                onChange={(e) => setPickerDifficulty(e.target.value)}
                style={{ padding: "0.625rem 0.75rem", borderRadius: "var(--radius-md)", border: "1.5px solid var(--color-border)", fontSize: "0.875rem", background: "var(--color-surface)", cursor: "pointer" }}
              >
                <option value="">Mọi độ khó</option>
                {DIFFICULTY_OPTIONS.map((d) => <option key={d.value} value={d.value}>{d.label}</option>)}
              </select>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", maxHeight: 220, overflowY: "auto", marginBottom: "1rem" }}>
              {pickerLoading ? (
                <div style={{ textAlign: "center", padding: "1rem" }}><Loader2 className="animate-spin" size={20} /></div>
              ) : pickerResults.length === 0 ? (
                <p style={{ textAlign: "center", color: "var(--color-text-muted)", fontSize: "0.875rem", padding: "0.5rem 0" }}>Không tìm thấy bài phù hợp.</p>
              ) : (
                pickerResults.map((t) => {
                  const selected = t.id === testTutorialId;
                  return (
                    <button
                      key={t.id}
                      onClick={() => { setTestTutorialId(t.id); setTestTutorialTitle(t.title); }}
                      style={{
                        display: "flex", alignItems: "center", gap: "0.625rem", padding: "0.5rem 0.625rem",
                        borderRadius: "var(--radius-md)", border: selected ? "1.5px solid var(--color-primary)" : "1.5px solid transparent",
                        background: "var(--color-surface-2)", textAlign: "left", cursor: "pointer",
                      }}
                    >
                      <span style={{ flex: 1, fontSize: "0.875rem", fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{t.title}</span>
                      <span className="badge badge-neutral" style={{ flexShrink: 0, fontSize: "0.75rem" }}>{diffLabel(t.difficulty)}</span>
                      {selected && <Check size={16} style={{ color: "var(--color-primary)", flexShrink: 0 }} />}
                    </button>
                  );
                })
              )}
            </div>

            <div className="input-group">
              <label className="input-label">Ghi chú cho người làm bài (không bắt buộc)</label>
              <textarea
                value={testInstructions}
                onChange={(e) => setTestInstructions(e.target.value)}
                rows={3}
                maxLength={1000}
                className="input-field"
                style={{ width: "100%", resize: "vertical" }}
              />
            </div>

            <div style={{ display: "flex", gap: "0.625rem", marginTop: "0.5rem" }}>
              <button onClick={handleSaveTestConfig} disabled={upsertTestMut.isPending || !testTutorialId} className="btn btn-primary" style={{ flex: 1 }}>
                {upsertTestMut.isPending ? <Loader2 className="animate-spin" size={16} /> : "Lưu bài test"}
              </button>
              <button onClick={() => setTestConfigModeId(null)} className="btn btn-outline">Đóng</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Submission review queue ── */}
      <div className="admin-toolbar">
        <div className="admin-page-header" style={{ marginBottom: 0 }}>
          <h2 className="admin-page-title" style={{ fontSize: "1.25rem" }}>Bài nộp chờ duyệt</h2>
          <p className="admin-page-desc">Ảnh nộp bài test — độc lập với thành tựu.</p>
        </div>
        <div style={{ display: "flex", gap: "0.75rem" }}>
          <select
            value={queueModeId}
            onChange={(e) => { setQueueModeId(e.target.value); setQueuePage(1); }}
            style={{ padding: "0.625rem 0.75rem", borderRadius: "var(--radius-md)", border: "1.5px solid var(--color-border)", fontSize: "0.875rem", background: "var(--color-surface)", cursor: "pointer" }}
          >
            <option value="">Tất cả chế độ</option>
            {modes?.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
          </select>
          <select
            value={queueStatus}
            onChange={(e) => { setQueueStatus(e.target.value); setQueuePage(1); }}
            style={{ padding: "0.625rem 0.75rem", borderRadius: "var(--radius-md)", border: "1.5px solid var(--color-border)", fontSize: "0.875rem", background: "var(--color-surface)", cursor: "pointer" }}
          >
            <option value="">Tất cả trạng thái</option>
            <option value="Pending">Chờ duyệt</option>
            <option value="Approved">Đã duyệt</option>
            <option value="Rejected">Đã từ chối</option>
          </select>
        </div>
      </div>

      <div className="card">
        <div className="admin-table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Người dùng</th>
                <th>Chế độ</th>
                <th>Đề bài</th>
                <th>Ảnh</th>
                <th>Trạng thái</th>
                <th>Ngày nộp</th>
                <th style={{ textAlign: "right" }}>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {queueLoading ? (
                <tr><td colSpan={7} className="admin-table-loading"><Loader2 className="animate-spin" size={28} style={{ margin: "0 auto" }} /></td></tr>
              ) : queueData?.items.length === 0 ? (
                <tr><td colSpan={7} className="admin-table-empty"><p>Không có bài nộp nào.</p></td></tr>
              ) : (
                queueData?.items.map((s) => (
                  <tr key={s.id}>
                    <td style={{ fontWeight: 600 }}>{s.userDisplayName}</td>
                    <td>{s.learningPathModeName}</td>
                    <td style={{ maxWidth: 200, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{s.tutorialTitle}</td>
                    <td>
                      {isValidImageUrl(s.photoUrl) && (
                        <button onClick={() => setEnlargedPhoto(s.photoUrl)} style={{ border: "none", background: "none", cursor: "pointer", padding: 0 }}>
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={s.photoUrl} alt="" style={{ width: 44, height: 44, borderRadius: "var(--radius-sm)", objectFit: "cover" }} />
                        </button>
                      )}
                    </td>
                    <td>
                      <span className={`badge ${STATUS_META[s.status]?.badge ?? "badge-neutral"}`}>
                        {STATUS_META[s.status]?.label ?? s.status}
                      </span>
                    </td>
                    <td>{format(new Date(s.createdAt), "dd/MM/yyyy HH:mm", { locale: vi })}</td>
                    <td>
                      {s.status === "Pending" ? (
                        <div style={{ display: "flex", gap: "0.5rem", justifyContent: "flex-end" }}>
                          <button className="btn btn-outline btn-sm" onClick={() => handleReject(s)} disabled={rejectMut.isPending || approveMut.isPending}>
                            <X size={14} /> Từ chối
                          </button>
                          <button className="btn btn-primary btn-sm" onClick={() => approveMut.mutate(s.id)} disabled={rejectMut.isPending || approveMut.isPending}>
                            {approveMut.isPending && approveMut.variables === s.id ? <Loader2 className="animate-spin" size={14} /> : <Check size={14} />} Duyệt
                          </button>
                        </div>
                      ) : (
                        <span style={{ fontSize: "0.8125rem", color: "var(--color-text-muted)" }} title={s.reviewNote ?? undefined}>
                          {s.reviewNote ? "Có ghi chú" : "—"}
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {queueData && queueData.totalPages > 1 && (
          <div className="admin-pagination">
            <span className="admin-pagination-info">Trang {queueData.page} / {queueData.totalPages}</span>
            <div style={{ display: "flex", gap: "0.5rem" }}>
              <button className="btn btn-outline btn-sm" disabled={queueData.page <= 1} onClick={() => setQueuePage((p) => p - 1)}>Trang trước</button>
              <button className="btn btn-outline btn-sm" disabled={queueData.page >= queueData.totalPages} onClick={() => setQueuePage((p) => p + 1)}>Trang sau</button>
            </div>
          </div>
        )}
      </div>

      {enlargedPhoto && (
        <div
          style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.8)", zIndex: 60, display: "flex", alignItems: "center", justifyContent: "center", padding: "2rem", cursor: "zoom-out" }}
          onClick={() => setEnlargedPhoto(null)}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={enlargedPhoto} alt="" style={{ maxWidth: "100%", maxHeight: "100%", borderRadius: "var(--radius-lg)" }} />
        </div>
      )}

      <style>{`
        @media (max-width: 960px) {
          .admin-categories-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}
