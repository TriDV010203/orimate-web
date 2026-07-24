"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import Navbar from "./Navbar";
import Footer from "./Footer";

/**
 * BẢN THIẾT KẾ TĨNH (mock data only) — chưa nối API.
 * Mục tiêu: cho người dùng xem trước layout/UX của tính năng
 * "Thử thách gấp giấy hàng ngày" trước khi triển khai backend.
 */

// ── Mock data ─────────────────────────────────────────────────────────────────
const AVATAR_COLORS = ["#2D6A4F", "#D4713B", "#2C7DA0", "#9B59B6", "#E03131", "#F59F00", "#16A34A", "#7C3AED"];

export function colorFromSeed(seed: string) {
  let h = 0;
  for (const c of seed) h = (h * 31 + c.charCodeAt(0)) & 0xffff;
  return AVATAR_COLORS[h % AVATAR_COLORS.length];
}

export const TODAY_CHALLENGE = {
  dayNumber: 47,
  title: "Hạc giấy hoà bình",
  emoji: "🦢",
  description: "Cùng cả cộng đồng gấp một chú hạc giấy hôm nay — biểu tượng của hoà bình và may mắn. Đăng ảnh thành phẩm để nhận huy hiệu ngày!",
  difficulty: "Trung bình" as const,
  tutorialSlug: "hac-giay-co-dien",
  participantsToday: 238,
  submissionsToday: 156,
};

export const DIFFICULTY_COLOR: Record<string, { bg: string; fg: string; border: string }> = {
  "Dễ": { bg: "rgba(45,106,79,0.1)", fg: "#2D6A4F", border: "rgba(45,106,79,0.25)" },
  "Trung bình": { bg: "rgba(212,113,59,0.12)", fg: "#b85c2a", border: "rgba(212,113,59,0.3)" },
  "Khó": { bg: "rgba(192,57,43,0.1)", fg: "#c0392b", border: "rgba(192,57,43,0.25)" },
};

export const MOCK_SUBMISSIONS = [
  { id: "s1", name: "Minh Anh", likeCount: 42, timeAgo: "12 phút trước" },
  { id: "s2", name: "Gia Bảo", likeCount: 37, timeAgo: "28 phút trước" },
  { id: "s3", name: "Thu Hà", likeCount: 31, timeAgo: "1 giờ trước" },
  { id: "s4", name: "Đức Long", likeCount: 24, timeAgo: "1 giờ trước" },
  { id: "s5", name: "Ngọc Mai", likeCount: 19, timeAgo: "2 giờ trước" },
  { id: "s6", name: "Việt Hoàng", likeCount: 15, timeAgo: "3 giờ trước" },
];

const LEADERBOARD = [
  { rank: 1, name: "Thu Hà", streak: 34 },
  { rank: 2, name: "Minh Anh", streak: 29 },
  { rank: 3, name: "Gia Bảo", streak: 21 },
  { rank: 4, name: "Đức Long", streak: 18 },
  { rank: 5, name: "Ngọc Mai", streak: 12 },
];

const PAST_CHALLENGES = [
  { label: "T2", emoji: "🐸", done: true },
  { label: "T3", emoji: "🌸", done: true },
  { label: "T4", emoji: "⭐", done: true },
  { label: "T5", emoji: "🦋", done: false },
  { label: "T6", emoji: "🐟", done: false },
  { label: "T7", emoji: "🏠", done: false },
  { label: "CN", emoji: "🦢", done: false },
];

const HOW_IT_WORKS = [
  { icon: "📅", title: "Mỗi ngày một thử thách", desc: "9:00 sáng mỗi ngày, cả cộng đồng cùng nhận một mẫu gấp mới." },
  { icon: "📸", title: "Gấp & đăng ảnh", desc: "Hoàn thành mẫu gấp và chia sẻ ảnh thành phẩm trước khi hết giờ." },
  { icon: "🔥", title: "Giữ chuỗi ngày (streak)", desc: "Tham gia liên tục để giữ streak, mở khoá huy hiệu và lên bảng xếp hạng." },
];

export function useCountdownToMidnight() {
  const [label, setLabel] = useState("--:--:--");
  useEffect(() => {
    function tick() {
      const now = new Date();
      const next = new Date(now);
      next.setHours(24, 0, 0, 0);
      const diff = Math.max(0, next.getTime() - now.getTime());
      const h = String(Math.floor(diff / 3_600_000)).padStart(2, "0");
      const m = String(Math.floor((diff % 3_600_000) / 60_000)).padStart(2, "0");
      const s = String(Math.floor((diff % 60_000) / 1000)).padStart(2, "0");
      setLabel(`${h}:${m}:${s}`);
    }
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);
  return label;
}

// ── Avatar circle (mock, no photo) ───────────────────────────────────────────
export function Avatar({ name, size = 2.5 }: { name: string; size?: number }) {
  const initial = name.trim().split(" ").slice(-1)[0][0]?.toUpperCase() ?? "?";
  return (
    <div
      style={{
        width: `${size}rem`, height: `${size}rem`, borderRadius: "50%",
        background: colorFromSeed(name), color: "white", fontWeight: 700,
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: `${size * 0.4}rem`, flexShrink: 0, border: "2px solid var(--color-surface)",
      }}
    >
      {initial}
    </div>
  );
}

export default function DailyChallengePage() {
  const countdown = useCountdownToMidnight();
  const diffStyle = DIFFICULTY_COLOR[TODAY_CHALLENGE.difficulty];

  return (
    <>
      <Navbar />
      <main style={{ minHeight: "100vh", background: "var(--color-bg)", paddingBottom: "4rem" }}>
        {/* ── Hero: Today's challenge ── */}
        <section style={{ background: "var(--gradient-hero)", borderBottom: "1px solid var(--color-border)", padding: "2.5rem 0 2rem" }}>
          <div className="container">
            <div style={{ display: "grid", gridTemplateColumns: "auto 1fr auto", gap: "1.75rem", alignItems: "center" }} className="challenge-hero-grid">
              {/* Icon */}
              <div style={{
                width: "6rem", height: "6rem", borderRadius: "var(--radius-xl)", background: "var(--color-surface)",
                display: "flex", alignItems: "center", justifyContent: "center", fontSize: "3rem",
                boxShadow: "var(--shadow-lg)", flexShrink: 0,
              }}>
                {TODAY_CHALLENGE.emoji}
              </div>

              {/* Info */}
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: "0.625rem", marginBottom: "0.5rem", flexWrap: "wrap" }}>
                  <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--color-primary-dark)", background: "rgba(45,106,79,0.1)", padding: "0.2rem 0.625rem", borderRadius: "99px", textTransform: "uppercase", letterSpacing: "0.04em" }}>
                    Thử thách ngày #{TODAY_CHALLENGE.dayNumber}
                  </span>
                  <span style={{ fontSize: "0.75rem", fontWeight: 700, color: diffStyle.fg, background: diffStyle.bg, border: `1px solid ${diffStyle.border}`, padding: "0.2rem 0.625rem", borderRadius: "99px" }}>
                    {TODAY_CHALLENGE.difficulty}
                  </span>
                </div>
                <h1 className="text-display" style={{ fontSize: "1.875rem", color: "var(--color-text-primary)", marginBottom: "0.5rem" }}>
                  {TODAY_CHALLENGE.title}
                </h1>
                <p style={{ color: "var(--color-text-secondary)", fontSize: "0.9375rem", maxWidth: "560px", lineHeight: 1.6 }}>
                  {TODAY_CHALLENGE.description}
                </p>

                <div style={{ display: "flex", alignItems: "center", gap: "1.5rem", marginTop: "1rem", flexWrap: "wrap" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    <div style={{ display: "flex" }}>
                      {MOCK_SUBMISSIONS.slice(0, 4).map((s, i) => (
                        <div key={s.id} style={{ marginLeft: i === 0 ? 0 : "-0.625rem" }}>
                          <Avatar name={s.name} size={1.75} />
                        </div>
                      ))}
                    </div>
                    <span style={{ fontSize: "0.8125rem", color: "var(--color-text-muted)", fontWeight: 600 }}>
                      {TODAY_CHALLENGE.participantsToday} người đang tham gia
                    </span>
                  </div>
                </div>
              </div>

              {/* Countdown + CTA */}
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.875rem", minWidth: "200px" }}>
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontSize: "0.75rem", color: "var(--color-text-muted)", fontWeight: 600, marginBottom: "0.25rem" }}>Kết thúc sau</div>
                  <div style={{ fontFamily: "monospace", fontSize: "1.5rem", fontWeight: 700, color: "var(--color-accent-dark)", letterSpacing: "0.05em" }}>
                    {countdown}
                  </div>
                </div>
                <Link
                  id="btn-submit-challenge"
                  href={`/cong-dong/tao-bai?type=achievement&challenge=${TODAY_CHALLENGE.tutorialSlug}`}
                  className="btn btn-accent"
                  style={{ textDecoration: "none", width: "100%", justifyContent: "center" }}
                >
                  📸 Nộp bài hôm nay
                </Link>
                <Link
                  href={`/huong-dan/${TODAY_CHALLENGE.tutorialSlug}`}
                  style={{ fontSize: "0.8125rem", color: "var(--color-primary)", fontWeight: 600, textDecoration: "none" }}
                >
                  Xem hướng dẫn gấp →
                </Link>
              </div>
            </div>
          </div>
        </section>

        <div className="container" style={{ marginTop: "2rem" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: "2rem", alignItems: "start" }} className="challenge-grid">
            {/* ── Main column ── */}
            <div>
              {/* Personal streak card */}
              <div style={{
                display: "flex", alignItems: "center", justifyContent: "space-between", gap: "1rem",
                background: "var(--gradient-card)", border: "1px solid var(--color-border)", borderRadius: "var(--radius-lg)",
                padding: "1.25rem 1.5rem", marginBottom: "1.5rem", boxShadow: "var(--shadow-card)",
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.875rem" }}>
                  <div style={{ fontSize: "2rem" }}>🔥</div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: "1.0625rem", color: "var(--color-text-primary)" }}>Chuỗi ngày của bạn: 7 ngày</div>
                    <div style={{ fontSize: "0.8125rem", color: "var(--color-text-muted)" }}>Hoàn thành hôm nay để giữ streak — đừng để đứt mạch!</div>
                  </div>
                </div>
                <div style={{ display: "flex", gap: "0.375rem" }}>
                  {PAST_CHALLENGES.map((d) => (
                    <div key={d.label} title={d.label} style={{
                      width: "2rem", height: "2rem", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: "0.9rem", background: d.done ? "var(--gradient-primary)" : "var(--color-surface-2)",
                      border: d.done ? "none" : "1px dashed var(--color-border-dark)", opacity: d.done ? 1 : 0.5,
                    }}>
                      {d.done ? "✓" : d.emoji}
                    </div>
                  ))}
                </div>
              </div>

              {/* Submissions gallery header */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1rem" }}>
                <h2 className="text-heading" style={{ fontSize: "1.25rem", color: "var(--color-text-primary)" }}>
                  Bài nộp hôm nay ({TODAY_CHALLENGE.submissionsToday})
                </h2>
                <span style={{ fontSize: "0.8125rem", color: "var(--color-text-muted)" }}>Sắp xếp theo lượt thích</span>
              </div>

              {/* Submissions grid (mock cards, no photos yet) */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1rem" }} className="submission-grid">
                {MOCK_SUBMISSIONS.map((s) => (
                  <div key={s.id} style={{
                    background: "var(--color-surface)", borderRadius: "var(--radius-lg)", border: "1px solid var(--color-border)",
                    overflow: "hidden", boxShadow: "var(--shadow-card)",
                  }}>
                    <div style={{
                      aspectRatio: "1/1", background: `linear-gradient(145deg, ${colorFromSeed(s.name)}22, ${colorFromSeed(s.name)}55)`,
                      display: "flex", alignItems: "center", justifyContent: "center", fontSize: "2.5rem",
                    }}>
                      {TODAY_CHALLENGE.emoji}
                    </div>
                    <div style={{ padding: "0.75rem 0.875rem" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.375rem" }}>
                        <Avatar name={s.name} size={1.5} />
                        <span style={{ fontWeight: 600, fontSize: "0.8125rem", color: "var(--color-text-primary)" }}>{s.name}</span>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                        <span style={{ fontSize: "0.75rem", color: "var(--color-text-muted)" }}>{s.timeAgo}</span>
                        <span style={{ display: "flex", alignItems: "center", gap: "0.25rem", fontSize: "0.8125rem", color: "#E03131", fontWeight: 600 }}>
                          ❤ {s.likeCount}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div style={{ textAlign: "center", marginTop: "2rem" }}>
                <button className="btn btn-outline" style={{ padding: "0.75rem 2.5rem" }}>Xem thêm bài nộp</button>
              </div>
            </div>

            {/* ── Sidebar ── */}
            <aside style={{ position: "sticky", top: "5rem", display: "flex", flexDirection: "column", gap: "1.25rem" }}>
              {/* Leaderboard */}
              <div style={{ background: "var(--color-surface)", borderRadius: "var(--radius-lg)", border: "1px solid var(--color-border)", padding: "1.25rem", boxShadow: "var(--shadow-sm)" }}>
                <h3 style={{ fontWeight: 700, fontSize: "1rem", color: "var(--color-text-primary)", marginBottom: "1rem" }}>🏆 Bảng xếp hạng streak</h3>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.625rem" }}>
                  {LEADERBOARD.map((u) => (
                    <div key={u.rank} style={{ display: "flex", alignItems: "center", gap: "0.625rem" }}>
                      <span style={{
                        width: "1.5rem", fontWeight: 700, fontSize: "0.8125rem", textAlign: "center",
                        color: u.rank <= 3 ? "var(--color-accent-dark)" : "var(--color-text-muted)",
                      }}>
                        {u.rank === 1 ? "🥇" : u.rank === 2 ? "🥈" : u.rank === 3 ? "🥉" : u.rank}
                      </span>
                      <Avatar name={u.name} size={1.75} />
                      <span style={{ flex: 1, fontSize: "0.875rem", fontWeight: 600, color: "var(--color-text-primary)" }}>{u.name}</span>
                      <span style={{ fontSize: "0.8125rem", color: "var(--color-text-muted)", fontWeight: 600 }}>🔥{u.streak}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* How it works */}
              <div style={{ background: "var(--color-surface)", borderRadius: "var(--radius-lg)", border: "1px solid var(--color-border)", padding: "1.25rem", boxShadow: "var(--shadow-sm)" }}>
                <h3 style={{ fontWeight: 700, fontSize: "0.9375rem", color: "var(--color-text-primary)", marginBottom: "1rem" }}>ℹ️ Cách thức hoạt động</h3>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.875rem" }}>
                  {HOW_IT_WORKS.map((step) => (
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
              <div style={{ background: "var(--gradient-primary)", borderRadius: "var(--radius-lg)", padding: "1.5rem", textAlign: "center", color: "white" }}>
                <div style={{ fontSize: "2rem", marginBottom: "0.75rem" }}>🎯</div>
                <p style={{ fontWeight: 700, marginBottom: "0.5rem", fontSize: "1rem" }}>Đừng bỏ lỡ thử thách!</p>
                <p style={{ fontSize: "0.8125rem", opacity: 0.85, marginBottom: "1rem" }}>Bật thông báo để nhận nhắc nhở mỗi khi thử thách mới bắt đầu.</p>
                <button className="btn" style={{ background: "white", color: "var(--color-primary)", width: "100%", justifyContent: "center" }}>
                  🔔 Bật nhắc nhở
                </button>
              </div>
            </aside>
          </div>
        </div>
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
