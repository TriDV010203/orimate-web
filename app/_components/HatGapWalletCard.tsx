"use client";

import { useEffect, useMemo, useState } from "react";
import { getToken } from "@/lib/auth";
import { gamificationApi, type StreakDto, type QuestProgressDto, type HatGapLevelDto } from "@/lib/api/gamification";

// ── Level curve (mirrors backend HatGapLevelCalculator: N×(N+1)/2×10) ────────
const LEVEL_STEP = 10;
function cumulativeForLevel(level: number) {
  return ((level * (level + 1)) / 2) * LEVEL_STEP;
}

// ── Daily Quest streak multiplier (mirrors backend HatGapEconomy) ────────────
const STREAK_TIERS: { minDays: number; multiplier: number }[] = [
  { minDays: 0, multiplier: 1.0 },
  { minDays: 7, multiplier: 1.2 },
  { minDays: 14, multiplier: 1.5 },
  { minDays: 30, multiplier: 2.0 },
];
const FREE_FOLD_DAY_CAP = 1.5;
const DAILY_QUEST_BASE = 1;

function getStreakMultiplier(currentStreak: number, isFreeFoldDay: boolean) {
  let multiplier = 1.0;
  for (const tier of STREAK_TIERS) {
    if (currentStreak >= tier.minDays) multiplier = tier.multiplier;
  }
  if (isFreeFoldDay && multiplier > FREE_FOLD_DAY_CAP) multiplier = FREE_FOLD_DAY_CAP;
  return multiplier;
}

function formatMultiplier(m: number) {
  return `×${m % 1 === 0 ? m.toFixed(1) : m}`;
}

const STREAK_MILESTONES = [
  { days: 7, reward: 5 },
  { days: 14, reward: 10 },
  { days: 30, reward: 20 },
];

const EARNING_SOURCES = [
  { icon: "📘", label: "Hoàn thành tutorial", detail: "Dễ +1 · Trung bình +2 · Khó +3 Hạt" },
  { icon: "🎯", label: "Daily Quest (1 lượt/ngày)", detail: "+1 Hạt × hệ số streak (tối đa ×2.0)" },
  { icon: "🔥", label: "Mốc streak", detail: "7 ngày +5 · 14 ngày +10 · 30 ngày +20 Hạt" },
  { icon: "🏆", label: "Personal Milestone", detail: "10→+15 · 30→+30 · 50→+60 · 100→+150 Hạt + Mẫu giấy" },
  { icon: "🗺️", label: "Hoàn thành lộ trình học", detail: "+5 Hạt / lộ trình" },
];

export default function HatGapWalletCard() {
  const [level, setLevel] = useState<HatGapLevelDto | null>(null);
  const [streak, setStreak] = useState<StreakDto | null>(null);
  const [quest, setQuest] = useState<QuestProgressDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [infoOpen, setInfoOpen] = useState(false);

  useEffect(() => {
    const token = getToken();
    if (!token) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setLoading(false);
      return;
    }
    Promise.all([
      gamificationApi.getLevel(token),
      gamificationApi.getStreak(token),
      gamificationApi.getQuestToday(token).catch(() => null),
    ])
      .then(([l, s, q]) => {
        setLevel(l);
        setStreak(s);
        setQuest(q);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const isFreeFoldDay = useMemo(() => new Date().getDay() === 0, []);
  const multiplier = getStreakMultiplier(streak?.currentStreak ?? 0, isFreeFoldDay);
  const questReward = Math.round(DAILY_QUEST_BASE * multiplier);

  const nextStreakMilestone = STREAK_MILESTONES.find((m) => m.days > (streak?.currentStreak ?? 0));

  // Close modals on Escape
  useEffect(() => {
    if (!previewOpen && !infoOpen) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") { setPreviewOpen(false); setInfoOpen(false); }
    }
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [previewOpen, infoOpen]);

  if (loading) {
    return (
      <div style={{ background: "var(--color-surface)", borderRadius: "var(--radius-xl)", border: "1px solid var(--color-border)", padding: "2rem", marginBottom: "2rem", display: "flex", alignItems: "center", justifyContent: "center", minHeight: "160px" }}>
        <div style={{ width: "2rem", height: "2rem", border: "3px solid var(--color-border)", borderTopColor: "var(--color-accent)", borderRadius: "50%", animation: "spin 0.7s linear infinite" }} />
      </div>
    );
  }

  if (!level || !streak) return null;

  const progressPct = Math.min(100, Math.max(0, Number(level.progressPercent)));

  return (
    <div className="animate-fade-in" style={{ marginBottom: "2rem" }}>
      {/* ── Hero Wallet Card ── */}
      <div
        style={{
          position: "relative",
          overflow: "hidden",
          borderRadius: "var(--radius-xl)",
          background: "linear-gradient(135deg, #1b4332 0%, #2d6a4f 55%, #d4713b 130%)",
          boxShadow: "var(--shadow-lg)",
          padding: "1.75rem 2rem",
          color: "white",
        }}
      >
        {/* decorative folded-paper motif */}
        <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: 0.1 }} viewBox="0 0 800 200" preserveAspectRatio="xMidYMid slice">
          <polygon points="80,10 140,110 20,110" fill="white" />
          <polygon points="700,20 760,120 640,120" fill="white" />
          <polygon points="420,-10 480,90 360,90" fill="white" opacity="0.6" />
        </svg>

        <div style={{ position: "relative", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "1.5rem" }}>
          {/* Balance */}
          <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
            <div style={{ width: "3.75rem", height: "3.75rem", borderRadius: "50%", background: "rgba(255,255,255,0.16)", backdropFilter: "blur(6px)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.875rem", border: "1px solid rgba(255,255,255,0.25)", flexShrink: 0 }}>
              🌰
            </div>
            <div>
              <div style={{ fontSize: "0.8125rem", color: "rgba(255,255,255,0.75)", fontWeight: 600, letterSpacing: "0.02em", textTransform: "uppercase" }}>
                Hạt Gấp của bạn
              </div>
              <div style={{ fontSize: "2rem", fontWeight: 800, lineHeight: 1.15, letterSpacing: "-0.02em" }}>
                {level.balance.toLocaleString("vi-VN")} <span style={{ fontSize: "1rem", fontWeight: 600, opacity: 0.85 }}>Hạt</span>
              </div>
            </div>
          </div>

          {/* Level badge */}
          <div style={{ display: "flex", alignItems: "center", gap: "0.875rem" }}>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: "0.8125rem", color: "rgba(255,255,255,0.75)", fontWeight: 600 }}>Cấp độ hiện tại</div>
              <div style={{ fontSize: "1.375rem", fontWeight: 800 }}>Cấp {level.level}</div>
            </div>
            <div style={{ width: "3rem", height: "3rem", borderRadius: "50%", background: "var(--gradient-accent)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.375rem", fontWeight: 800, boxShadow: "0 4px 16px rgba(212,113,59,0.5)", border: "2px solid rgba(255,255,255,0.5)" }}>
              {level.level}
            </div>
          </div>
        </div>

        {/* Progress bar to next level */}
        <div style={{ position: "relative", marginTop: "1.5rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.8125rem", color: "rgba(255,255,255,0.85)", marginBottom: "0.375rem", fontWeight: 600 }}>
            <span>Tiến trình lên Cấp {level.level + 1}</span>
            <span>{level.totalEarned.toLocaleString("vi-VN")} / {level.nextLevelThreshold.toLocaleString("vi-VN")} Hạt</span>
          </div>
          <div style={{ height: "0.625rem", borderRadius: "var(--radius-full)", background: "rgba(255,255,255,0.18)", overflow: "hidden" }}>
            <div
              style={{
                height: "100%",
                width: `${progressPct}%`,
                borderRadius: "var(--radius-full)",
                background: "linear-gradient(90deg, #e8955f 0%, #ffd28a 100%)",
                boxShadow: "0 0 12px rgba(255,210,138,0.6)",
                transition: "width 0.5s ease",
              }}
            />
          </div>
          <div style={{ marginTop: "0.5rem", fontSize: "0.8125rem", color: "rgba(255,255,255,0.85)" }}>
            Còn <strong>{level.hatGapToNextLevel.toLocaleString("vi-VN")} Hạt</strong> nữa để lên cấp tiếp theo ✨
          </div>
        </div>

        {/* Actions */}
        <div style={{ position: "relative", display: "flex", gap: "0.625rem", marginTop: "1.5rem", flexWrap: "wrap" }}>
          <button
            onClick={() => setPreviewOpen(true)}
            style={{ background: "rgba(255,255,255,0.16)", backdropFilter: "blur(6px)", border: "1px solid rgba(255,255,255,0.3)", borderRadius: "var(--radius-full)", padding: "0.5rem 1.125rem", color: "white", fontWeight: 700, fontSize: "0.8438rem", cursor: "pointer", display: "flex", alignItems: "center", gap: "0.4rem", transition: "background var(--transition-fast)" }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.28)")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.16)")}
          >
            🔮 Xem trước cấp độ
          </button>
          <button
            onClick={() => setInfoOpen(true)}
            style={{ background: "rgba(255,255,255,0.16)", backdropFilter: "blur(6px)", border: "1px solid rgba(255,255,255,0.3)", borderRadius: "var(--radius-full)", padding: "0.5rem 1.125rem", color: "white", fontWeight: 700, fontSize: "0.8438rem", cursor: "pointer", display: "flex", alignItems: "center", gap: "0.4rem", transition: "background var(--transition-fast)" }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.28)")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.16)")}
          >
            💡 Cách kiếm Hạt
          </button>
        </div>
      </div>

      {/* ── Streak + Quest mini row ── */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.25rem", marginTop: "1.25rem" }}>
        {/* Streak card */}
        <div style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)", borderRadius: "var(--radius-lg)", padding: "1.25rem 1.5rem", display: "flex", alignItems: "center", gap: "1rem" }}>
          <div style={{ width: "3rem", height: "3rem", borderRadius: "50%", background: "linear-gradient(135deg, #ff9a56 0%, #ff6b35 100%)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.5rem", flexShrink: 0, boxShadow: "0 4px 14px rgba(255,107,53,0.35)" }}>
            🔥
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontWeight: 800, fontSize: "1.0625rem", color: "var(--color-text-primary)" }}>
              {streak.currentStreak} ngày liên tiếp
            </div>
            <div style={{ fontSize: "0.8125rem", color: "var(--color-text-muted)" }}>
              Kỷ lục: {streak.longestStreak} ngày · ❄️ {streak.freezeCount}/2 Freeze
            </div>
            {nextStreakMilestone ? (
              <div style={{ fontSize: "0.75rem", color: "var(--color-accent-dark)", marginTop: "0.25rem", fontWeight: 600 }}>
                Còn {nextStreakMilestone.days - streak.currentStreak} ngày → mốc {nextStreakMilestone.days} ngày (+{nextStreakMilestone.reward} Hạt)
              </div>
            ) : (
              <div style={{ fontSize: "0.75rem", color: "var(--color-primary)", marginTop: "0.25rem", fontWeight: 600 }}>
                Đã đạt mọi mốc streak 🎉
              </div>
            )}
          </div>
        </div>

        {/* Daily quest card */}
        <div style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)", borderRadius: "var(--radius-lg)", padding: "1.25rem 1.5rem", display: "flex", alignItems: "center", gap: "1rem" }}>
          <div style={{ width: "3rem", height: "3rem", borderRadius: "50%", background: "var(--gradient-primary)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.5rem", flexShrink: 0, boxShadow: "0 4px 14px rgba(45,106,79,0.3)" }}>
            🎯
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            {quest ? (
              <>
                <div style={{ fontWeight: 800, fontSize: "1.0625rem", color: "var(--color-text-primary)" }}>
                  {quest.isCompleted ? "Đã hoàn thành hôm nay ✅" : `${quest.progress}/${quest.targetValue} — ${quest.title}`}
                </div>
                <div style={{ fontSize: "0.8125rem", color: "var(--color-text-muted)" }}>
                  Thưởng: {questReward} Hạt ({formatMultiplier(multiplier)} hệ số streak)
                </div>
                {isFreeFoldDay && (
                  <div style={{ fontSize: "0.75rem", color: "var(--color-accent-dark)", marginTop: "0.25rem", fontWeight: 600 }}>
                    🌤️ Hôm nay là Ngày Gấp Tự Do — hệ số tối đa ×1.5
                  </div>
                )}
              </>
            ) : (
              <div style={{ fontSize: "0.875rem", color: "var(--color-text-muted)" }}>Chưa có Daily Quest hôm nay.</div>
            )}
          </div>
        </div>
      </div>

      {/* ── Level preview modal ── */}
      {previewOpen && (
        <LevelPreviewModal currentLevel={level.level} totalEarned={level.totalEarned} onClose={() => setPreviewOpen(false)} />
      )}

      {/* ── Earning sources info modal ── */}
      {infoOpen && (
        <EarningSourcesModal onClose={() => setInfoOpen(false)} />
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

// ── Level preview modal ───────────────────────────────────────────────────
function LevelPreviewModal({ currentLevel, totalEarned, onClose }: { currentLevel: number; totalEarned: number; onClose: () => void }) {
  const rows = useMemo(() => {
    const list: { level: number; threshold: number; step: number }[] = [];
    const upTo = Math.max(currentLevel + 8, 12);
    for (let lv = 1; lv <= upTo; lv++) {
      list.push({ level: lv, threshold: cumulativeForLevel(lv), step: cumulativeForLevel(lv) - cumulativeForLevel(lv - 1) });
    }
    return list;
  }, [currentLevel]);

  return (
    <div
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      style={{ position: "fixed", inset: 0, background: "rgba(10,20,15,0.55)", backdropFilter: "blur(6px)", zIndex: 500, display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem", animation: "fadeIn 0.18s ease" }}
    >
      <div style={{ background: "var(--color-surface)", borderRadius: "var(--radius-xl)", boxShadow: "var(--shadow-xl)", width: "100%", maxWidth: "480px", maxHeight: "85vh", overflowY: "auto", animation: "slideUp 0.22s ease", border: "1px solid var(--color-border)" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "1.25rem 1.5rem", borderBottom: "1px solid var(--color-border)", position: "sticky", top: 0, background: "var(--color-surface)", zIndex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.625rem" }}>
            <div style={{ width: "2rem", height: "2rem", borderRadius: "var(--radius-md)", background: "var(--gradient-accent)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1rem" }}>🔮</div>
            <h2 style={{ fontWeight: 800, fontSize: "1.125rem", color: "var(--color-text-primary)" }}>Xem trước cấp độ</h2>
          </div>
          <button onClick={onClose} aria-label="Đóng" style={{ width: "2rem", height: "2rem", borderRadius: "50%", border: "none", background: "var(--color-surface-2)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--color-text-muted)", fontSize: "1.1rem" }}>✕</button>
        </div>

        <div style={{ padding: "1.25rem 1.5rem" }}>
          <p style={{ fontSize: "0.8125rem", color: "var(--color-text-muted)", marginBottom: "1rem" }}>
            Mỗi cấp cần thêm 10 Hạt so với cấp trước (tổng Hạt đã kiếm được — không tính Hạt đã tiêu).
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            {rows.map((r) => {
              const isCurrent = r.level === currentLevel + 1 && totalEarned < r.threshold && totalEarned >= cumulativeForLevel(currentLevel);
              const isPast = r.level <= currentLevel;
              return (
                <div
                  key={r.level}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "0.625rem 0.875rem",
                    borderRadius: "var(--radius-md)",
                    background: isCurrent ? "linear-gradient(135deg, #FFF8F0 0%, #FFF0E0 100%)" : isPast ? "var(--color-surface-2)" : "transparent",
                    border: isCurrent ? "1px solid var(--color-accent)" : "1px solid var(--color-border)",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "0.625rem" }}>
                    <div style={{ width: "1.75rem", height: "1.75rem", borderRadius: "50%", background: isPast ? "var(--gradient-primary)" : "var(--color-surface-2)", color: isPast ? "white" : "var(--color-text-muted)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.75rem", fontWeight: 800, border: isPast ? "none" : "1px solid var(--color-border)" }}>
                      {isPast ? "✓" : r.level}
                    </div>
                    <span style={{ fontWeight: 700, fontSize: "0.875rem", color: "var(--color-text-primary)" }}>Cấp {r.level}</span>
                    {isCurrent && <span style={{ fontSize: "0.6875rem", fontWeight: 700, color: "var(--color-accent-dark)" }}>← Mục tiêu tiếp theo</span>}
                  </div>
                  <span style={{ fontSize: "0.8125rem", color: "var(--color-text-muted)", fontWeight: 600 }}>{r.threshold.toLocaleString("vi-VN")} Hạt</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
      <style>{`
        @keyframes slideUp { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes fadeIn  { from { opacity: 0; } to { opacity: 1; } }
      `}</style>
    </div>
  );
}

// ── Earning sources info modal ────────────────────────────────────────────
function EarningSourcesModal({ onClose }: { onClose: () => void }) {
  return (
    <div
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      style={{ position: "fixed", inset: 0, background: "rgba(10,20,15,0.55)", backdropFilter: "blur(6px)", zIndex: 500, display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem", animation: "fadeIn 0.18s ease" }}
    >
      <div style={{ background: "var(--color-surface)", borderRadius: "var(--radius-xl)", boxShadow: "var(--shadow-xl)", width: "100%", maxWidth: "520px", maxHeight: "85vh", overflowY: "auto", animation: "slideUp 0.22s ease", border: "1px solid var(--color-border)" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "1.25rem 1.5rem", borderBottom: "1px solid var(--color-border)", position: "sticky", top: 0, background: "var(--color-surface)", zIndex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.625rem" }}>
            <div style={{ width: "2rem", height: "2rem", borderRadius: "var(--radius-md)", background: "var(--gradient-primary)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1rem" }}>💡</div>
            <h2 style={{ fontWeight: 800, fontSize: "1.125rem", color: "var(--color-text-primary)" }}>Cách kiếm Hạt Gấp</h2>
          </div>
          <button onClick={onClose} aria-label="Đóng" style={{ width: "2rem", height: "2rem", borderRadius: "50%", border: "none", background: "var(--color-surface-2)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--color-text-muted)", fontSize: "1.1rem" }}>✕</button>
        </div>

        <div style={{ padding: "1.25rem 1.5rem", display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          {EARNING_SOURCES.map((s) => (
            <div key={s.label} style={{ display: "flex", alignItems: "flex-start", gap: "0.875rem", padding: "0.75rem", borderRadius: "var(--radius-md)", background: "var(--color-surface-2)" }}>
              <div style={{ fontSize: "1.375rem", flexShrink: 0 }}>{s.icon}</div>
              <div>
                <div style={{ fontWeight: 700, fontSize: "0.875rem", color: "var(--color-text-primary)" }}>{s.label}</div>
                <div style={{ fontSize: "0.8125rem", color: "var(--color-text-muted)", marginTop: "0.125rem" }}>{s.detail}</div>
              </div>
            </div>
          ))}

          <div style={{ marginTop: "0.25rem", padding: "0.75rem 1rem", borderRadius: "var(--radius-md)", background: "linear-gradient(135deg, #FFF8F0 0%, #FFF0E0 100%)", border: "1px solid rgba(212,113,59,0.2)", fontSize: "0.75rem", color: "var(--color-text-secondary)", lineHeight: 1.6 }}>
            🌤️ <strong>Ngày Gấp Tự Do (Chủ nhật):</strong> hệ số streak của Daily Quest được giới hạn tối đa ×1.5 — dù streak của bạn đang cao hơn.
          </div>
        </div>
      </div>
      <style>{`
        @keyframes slideUp { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes fadeIn  { from { opacity: 0; } to { opacity: 1; } }
      `}</style>
    </div>
  );
}
