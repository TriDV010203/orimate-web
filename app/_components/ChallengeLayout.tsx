import Link from "next/link";
import React from "react";
import Navbar from "./Navbar";
import Footer from "./Footer";
import ImageUploadField from "./ImageUploadField";
import { Avatar, DIFFICULTY_META } from "./DailyChallengePage";
import type { UploadFolder } from "@/lib/api/uploads";

export interface ChallengeLayoutProps {
  challengeType: "daily" | "weekly";
  loading: boolean;
  notFound: boolean;
  error: string | null;
  onRetry: () => void;
  // Hero Props
  heroIcon: string;
  heroBadgeLabel: string;
  heroThemeLabel?: string;
  difficulty: string;
  title: string;
  authorName?: string;
  submissionCount: number;
  countdownLabel: string;
  countdownValue: string;
  tutorialSlug?: string;
  // Submissions Gallery
  submissions: any[];
  onToggleLike: (id: string) => void;
  onLoadMoreSubs?: () => void;
  subPage?: number;
  subTotalPages?: number;
  loadingSubs?: boolean;
  loadingMoreSubs?: boolean;
  // Form Props
  loggedIn: boolean;
  alreadySubmitted: boolean;
  streakOrPointsLabel: string;
  streakOrPointsValue: number | string;
  streakOrPointsIcon: string;
  streakOrPointsDesc: string;
  photoUrl: string;
  setPhotoUrl: (url: string) => void;
  note: string;
  setNote: (note: string) => void;
  submitting: boolean;
  submitError: string | null;
  onSubmit: (e: React.FormEvent) => void;
  token: string | null;
  folder: UploadFolder;
  // Sidebar
  leaderboardTitle: string;
  leaderboard: any[];
  howItWorksTitle: string;
  howItWorks: { icon: string; title: string; desc: string }[];
  ctaBanner?: React.ReactNode;
}

export default function ChallengeLayout(props: ChallengeLayoutProps) {
  const diffStyle = DIFFICULTY_META[props.difficulty] ?? DIFFICULTY_META.Beginner;
  
  return (
    <>
      <Navbar />
      <main style={{ minHeight: "100vh", background: "var(--color-bg)", paddingBottom: "4rem" }}>
        {/* ── Tabs Navigation ── */}
        <div style={{ background: "var(--color-surface)", borderBottom: "1px solid var(--color-border)" }}>
          <div className="container">
            <div style={{ display: "flex", gap: "2rem" }}>
              <Link href="/thach-thuc" style={{ padding: "1rem 0", color: props.challengeType === "daily" ? "var(--color-primary)" : "var(--color-text-muted)", fontWeight: props.challengeType === "daily" ? 700 : 600, borderBottom: props.challengeType === "daily" ? "2px solid var(--color-primary)" : "none", textDecoration: "none" }}>
                Thử thách Ngày
              </Link>
              <Link href="/thach-thuc-tuan" style={{ padding: "1rem 0", color: props.challengeType === "weekly" ? "var(--color-primary)" : "var(--color-text-muted)", fontWeight: props.challengeType === "weekly" ? 700 : 600, borderBottom: props.challengeType === "weekly" ? "2px solid var(--color-primary)" : "none", textDecoration: "none" }}>
                Thử thách Tuần
              </Link>
            </div>
          </div>
        </div>

        {/* ── Hero ── */}
        <section style={{ 
          background: props.challengeType === "daily" ? "var(--gradient-hero)" : "linear-gradient(135deg, rgba(44,125,160,0.1) 0%, rgba(155,89,182,0.1) 100%)", 
          borderBottom: "1px solid var(--color-border)", padding: "2.5rem 0 2rem" 
        }}>
          <div className="container">
            {props.loading ? (
              <div style={{ textAlign: "center", padding: "2rem", color: "var(--color-text-muted)" }}>Đang tải thử thách...</div>
            ) : props.notFound ? (
              <div style={{ textAlign: "center", padding: "1.5rem" }}>
                <div style={{ fontSize: "2.5rem", marginBottom: "0.5rem" }}>🗓️</div>
                <h1 className="text-display" style={{ fontSize: "1.5rem", color: "var(--color-text-primary)", marginBottom: "0.5rem" }}>
                  Hiện chưa có thử thách
                </h1>
                <p style={{ color: "var(--color-text-secondary)" }}>Quay lại sau nhé — Admin/Manager đang chuẩn bị thử thách mới.</p>
              </div>
            ) : props.error ? (
              <div style={{ background: "rgba(192,57,43,0.08)", border: "1.5px solid rgba(192,57,43,0.3)", borderRadius: "var(--radius-md)", padding: "1rem 1.25rem", color: "var(--color-error)", textAlign: "center" }}>
                {props.error}
                <button onClick={props.onRetry} style={{ marginLeft: "1rem", background: "none", border: "1px solid currentColor", borderRadius: "var(--radius-md)", padding: "0.25rem 0.75rem", cursor: "pointer", color: "var(--color-error)", fontSize: "0.8125rem" }}>Thử lại</button>
              </div>
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: "auto 1fr auto", gap: "1.75rem", alignItems: "center" }} className="challenge-hero-grid">
                {/* Icon */}
                <div style={{
                  width: "6rem", height: "6rem", borderRadius: "var(--radius-xl)", background: "var(--color-surface)",
                  display: "flex", alignItems: "center", justifyContent: "center", fontSize: "3rem",
                  boxShadow: "var(--shadow-lg)", flexShrink: 0,
                  border: props.challengeType === "weekly" ? "2px solid rgba(155,89,182,0.3)" : "none"
                }}>
                  {props.heroIcon}
                </div>

                {/* Info */}
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.625rem", marginBottom: "0.5rem", flexWrap: "wrap" }}>
                    <span style={{ 
                      fontSize: "0.75rem", fontWeight: 700, 
                      color: props.challengeType === "daily" ? "var(--color-primary-dark)" : "#9B59B6", 
                      background: props.challengeType === "daily" ? "rgba(45,106,79,0.1)" : "rgba(155,89,182,0.1)", 
                      padding: "0.2rem 0.625rem", borderRadius: "99px", textTransform: "uppercase", letterSpacing: "0.04em" 
                    }}>
                      {props.heroBadgeLabel}
                    </span>
                    {props.heroThemeLabel && (
                      <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--color-primary-dark)", background: "rgba(44,125,160,0.1)", padding: "0.2rem 0.625rem", borderRadius: "99px" }}>
                        Chủ đề: {props.heroThemeLabel}
                      </span>
                    )}
                    <span style={{ fontSize: "0.75rem", fontWeight: 700, color: diffStyle.fg, background: diffStyle.bg, border: `1px solid ${diffStyle.border}`, padding: "0.2rem 0.625rem", borderRadius: "99px" }}>
                      {diffStyle.label}
                    </span>
                  </div>
                  <h1 className="text-display" style={{ fontSize: "1.875rem", color: "var(--color-text-primary)", marginBottom: "0.5rem" }}>
                    {props.title}
                  </h1>
                  {props.authorName && (
                    <p style={{ color: "var(--color-text-muted)", fontSize: "0.8125rem" }}>
                      Hướng dẫn bởi {props.authorName}
                    </p>
                  )}

                  <div style={{ display: "flex", alignItems: "center", gap: "1.5rem", marginTop: "1rem", flexWrap: "wrap" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                      {props.submissions.length > 0 && (
                        <div style={{ display: "flex" }}>
                          {props.submissions.slice(0, 4).map((s, i) => (
                            <div key={s.id} style={{ marginLeft: i === 0 ? 0 : "-0.625rem" }}>
                              <Avatar name={s.userDisplayName ?? "?"} avatarUrl={s.userAvatarUrl} size={1.75} />
                            </div>
                          ))}
                        </div>
                      )}
                      <span style={{ fontSize: "0.8125rem", color: "var(--color-text-muted)", fontWeight: 600 }}>
                        {props.submissionCount} người đã tham gia
                      </span>
                    </div>
                  </div>
                </div>

                {/* Countdown + CTA */}
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.875rem", minWidth: "200px" }}>
                  <div style={{ textAlign: "center" }}>
                    <div style={{ fontSize: "0.75rem", color: "var(--color-text-muted)", fontWeight: 600, marginBottom: "0.25rem" }}>{props.countdownLabel}</div>
                    <div style={{ fontFamily: "monospace", fontSize: "1.5rem", fontWeight: 700, color: props.challengeType === "weekly" ? "#9B59B6" : "var(--color-accent-dark)", letterSpacing: "0.05em" }}>
                      {props.countdownValue}
                    </div>
                  </div>
                  {!props.loggedIn ? (
                    <Link href="/dang-nhap" className="btn" style={{ background: props.challengeType === "weekly" ? "#9B59B6" : "var(--gradient-accent)", color: "white", textDecoration: "none", width: "100%", justifyContent: "center" }}>
                      Đăng nhập để tham gia
                    </Link>
                  ) : props.alreadySubmitted ? (
                    <div className="btn" style={{ width: "100%", justifyContent: "center", background: "var(--color-success, #2D6A4F)", color: "white", cursor: "default" }}>
                      ✅ Đã nộp bài
                    </div>
                  ) : (
                    <a href="#nop-bai" className="btn" style={{ background: props.challengeType === "weekly" ? "#9B59B6" : "var(--gradient-accent)", color: "white", textDecoration: "none", width: "100%", justifyContent: "center" }}>
                      📸 Nộp bài ngay
                    </a>
                  )}
                  {props.tutorialSlug && (
                    <Link href={`/huong-dan/${props.tutorialSlug}`} style={{ fontSize: "0.8125rem", color: "var(--color-primary)", fontWeight: 600, textDecoration: "none" }}>
                      Xem hướng dẫn gấp →
                    </Link>
                  )}
                </div>
              </div>
            )}
          </div>
        </section>

        {!props.loading && !props.notFound && !props.error && (
          <div className="container" style={{ marginTop: "2rem" }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: "2rem", alignItems: "start" }} className="challenge-grid">
              {/* ── Main column ── */}
              <div>
                {/* Personal streak / submit card */}
                <div id="nop-bai" style={{
                  background: "var(--gradient-card)", border: "1px solid var(--color-border)", borderRadius: "var(--radius-lg)",
                  padding: "1.25rem 1.5rem", marginBottom: "1.5rem", boxShadow: "var(--shadow-card)",
                }}>
                  {!props.loggedIn ? (
                    <div style={{ textAlign: "center", padding: "0.5rem" }}>
                      <p style={{ fontWeight: 700, color: "var(--color-text-primary)", marginBottom: "0.5rem" }}>Đăng nhập để giữ chuỗi thử thách của bạn 🔥</p>
                      <Link href="/dang-nhap" className="btn btn-primary" style={{ textDecoration: "none" }}>Đăng nhập</Link>
                    </div>
                  ) : (
                    <>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.875rem", marginBottom: props.alreadySubmitted ? 0 : "1.25rem" }}>
                        <div style={{ fontSize: "2rem" }}>{props.streakOrPointsIcon}</div>
                        <div>
                          <div style={{ fontWeight: 700, fontSize: "1.0625rem", color: "var(--color-text-primary)" }}>
                            {props.streakOrPointsLabel}: {props.streakOrPointsValue}
                          </div>
                          <div style={{ fontSize: "0.8125rem", color: "var(--color-text-muted)" }}>
                            {props.streakOrPointsDesc}
                          </div>
                        </div>
                      </div>

                      {!props.alreadySubmitted && (
                        <form onSubmit={props.onSubmit} style={{ marginTop: "0.5rem" }}>
                          <ImageUploadField
                            value={props.photoUrl}
                            onChange={props.setPhotoUrl}
                            token={props.token ?? ""}
                            folder={props.folder}
                            label="Ảnh thành phẩm"
                            variant="compact"
                          />
                          <div style={{ marginTop: "0.875rem" }}>
                            <label className="input-label" style={{ marginBottom: "0.375rem", display: "block" }}>Ghi chú (tuỳ chọn)</label>
                            <textarea
                              value={props.note}
                              onChange={(e) => props.setNote(e.target.value)}
                              maxLength={500}
                              rows={2}
                              placeholder="Cảm nhận của bạn về mẫu gấp hôm nay..."
                              className="input-field"
                              style={{ width: "100%", resize: "vertical", fontFamily: "inherit" }}
                            />
                          </div>
                          {props.submitError && (
                            <p style={{ color: "var(--color-error)", fontSize: "0.8125rem", marginTop: "0.5rem" }}>{props.submitError}</p>
                          )}
                          <button type="submit" disabled={props.submitting || !props.photoUrl} className="btn" style={{ marginTop: "0.875rem", background: props.challengeType === "weekly" ? "#9B59B6" : "var(--gradient-accent)", color: "white" }}>
                            {props.submitting ? "Đang nộp..." : "Nộp bài thử thách"}
                          </button>
                        </form>
                      )}
                    </>
                  )}
                </div>

                {/* Submissions gallery header */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1rem" }}>
                  <h2 className="text-heading" style={{ fontSize: "1.25rem", color: "var(--color-text-primary)" }}>
                    Bài nộp ({props.submissionCount})
                  </h2>
                  <span style={{ fontSize: "0.8125rem", color: "var(--color-text-muted)" }}>Sắp xếp theo lượt thích</span>
                </div>

                {props.loadingSubs ? (
                  <div style={{ textAlign: "center", padding: "2rem", color: "var(--color-text-muted)" }}>Đang tải bài nộp...</div>
                ) : props.submissions.length === 0 ? (
                  <div style={{ textAlign: "center", padding: "2rem", color: "var(--color-text-muted)", background: "var(--color-surface)", borderRadius: "var(--radius-lg)", border: "1px dashed var(--color-border)" }}>
                    Chưa có ai nộp bài — hãy là người đầu tiên!
                  </div>
                ) : (
                  <>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1rem" }} className="submission-grid">
                      {props.submissions.map((s) => (
                        <div key={s.id} style={{
                          background: "var(--color-surface)", borderRadius: "var(--radius-lg)", border: "1px solid var(--color-border)",
                          overflow: "hidden", boxShadow: "var(--shadow-card)",
                        }}>
                          <div style={{ aspectRatio: "1/1", background: "var(--color-surface-2)" }}>
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={s.photoUrl} alt={s.note ?? "Bài nộp thử thách"} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                          </div>
                          <div style={{ padding: "0.75rem 0.875rem" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.375rem" }}>
                              <Avatar name={s.userDisplayName ?? "Ẩn danh"} avatarUrl={s.userAvatarUrl} size={1.5} />
                              <span style={{ fontWeight: 600, fontSize: "0.8125rem", color: "var(--color-text-primary)" }}>{s.userDisplayName ?? "Ẩn danh"}</span>
                              {s.finalRank && s.finalRank <= 3 && (
                                <span style={{ fontSize: "0.9rem" }}>{s.finalRank === 1 ? "🥇" : s.finalRank === 2 ? "🥈" : "🥉"}</span>
                              )}
                            </div>
                            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                              <span style={{ fontSize: "0.75rem", color: "var(--color-text-muted)" }}>
                                {new Date(s.createdAt.endsWith("Z") ? s.createdAt : s.createdAt + "Z").toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })}
                              </span>
                              <button
                                onClick={() => props.onToggleLike(s.id)}
                                disabled={!props.loggedIn}
                                style={{
                                  display: "flex", alignItems: "center", gap: "0.25rem", fontSize: "0.8125rem",
                                  color: s.isLikedByCurrentUser ? "#E03131" : "var(--color-text-muted)", fontWeight: 600,
                                  background: "none", border: "none", cursor: props.loggedIn ? "pointer" : "default", padding: 0,
                                }}
                              >
                                {s.isLikedByCurrentUser ? "❤" : "🤍"} {s.likeCount}
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {props.subPage && props.subTotalPages && props.subPage < props.subTotalPages && (
                      <div style={{ textAlign: "center", marginTop: "2rem" }}>
                        <button onClick={props.onLoadMoreSubs} disabled={props.loadingMoreSubs} className="btn btn-outline" style={{ padding: "0.75rem 2.5rem" }}>
                          {props.loadingMoreSubs ? "Đang tải..." : "Xem thêm bài nộp"}
                        </button>
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* ── Sidebar ── */}
              <aside style={{ position: "sticky", top: "5rem", display: "flex", flexDirection: "column", gap: "1.25rem" }}>
                {/* Leaderboard */}
                <div style={{ background: "var(--color-surface)", borderRadius: "var(--radius-lg)", border: "1px solid var(--color-border)", padding: "1.25rem", boxShadow: "var(--shadow-sm)" }}>
                  <h3 style={{ fontWeight: 700, fontSize: "1rem", color: "var(--color-text-primary)", marginBottom: "1rem" }}>{props.leaderboardTitle}</h3>
                  {props.leaderboard.length === 0 ? (
                    <p style={{ fontSize: "0.8125rem", color: "var(--color-text-muted)" }}>Chưa có ai lên bảng xếp hạng.</p>
                  ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: "0.625rem" }}>
                      {props.leaderboard.map((u) => (
                        <div key={u.userId} style={{ display: "flex", alignItems: "center", gap: "0.625rem" }}>
                          <span style={{
                            width: "1.5rem", fontWeight: 700, fontSize: "0.8125rem", textAlign: "center",
                            color: u.rank <= 3 ? (props.challengeType === "weekly" ? "#9B59B6" : "var(--color-accent-dark)") : "var(--color-text-muted)",
                          }}>
                            {u.rank === 1 ? "🥇" : u.rank === 2 ? "🥈" : u.rank === 3 ? "🥉" : u.rank}
                          </span>
                          <Avatar name={u.displayName ?? "?"} avatarUrl={u.avatarUrl} size={1.75} />
                          <span style={{ flex: 1, fontSize: "0.875rem", fontWeight: 600, color: "var(--color-text-primary)" }}>{u.displayName ?? "Ẩn danh"}</span>
                          <span style={{ fontSize: "0.8125rem", color: "var(--color-text-muted)", fontWeight: 600 }}>
                            🔥{u.currentStreak}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* How it works */}
                <div style={{ background: "var(--color-surface)", borderRadius: "var(--radius-lg)", border: "1px solid var(--color-border)", padding: "1.25rem", boxShadow: "var(--shadow-sm)" }}>
                  <h3 style={{ fontWeight: 700, fontSize: "0.9375rem", color: "var(--color-text-primary)", marginBottom: "1rem" }}>{props.howItWorksTitle}</h3>
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.875rem" }}>
                    {props.howItWorks.map((step) => (
                      <div key={step.title} style={{ display: "flex", gap: "0.625rem" }}>
                        <span style={{ fontSize: "1.125rem" }}>{step.icon}</span>
                        <div>
                          <div style={{ fontWeight: 700, fontSize: "0.8125rem", color: "var(--color-text-primary)" }}>{step.title}</div>
                          <div style={{ fontSize: "0.75rem", color: "var(--color-text-muted)", lineHeight: 1.5 }}>{step.desc}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* CTA card */}
                {props.ctaBanner}
              </aside>
            </div>
          </div>
        )}
      </main>
      <Footer />
      <style>{`
        @media (max-width: 900px) {
          .challenge-grid { grid-template-columns: 1fr !important; }
          .challenge-hero-grid { grid-template-columns: 1fr !important; text-align: center; }
          .challenge-hero-grid > div:first-child { margin: 0 auto; }
          aside { position: static !important; }
        }
        @media (max-width: 640px) {
          .submission-grid { grid-template-columns: repeat(2, 1fr) !important; }
        }
      `}</style>
    </>
  );
}
