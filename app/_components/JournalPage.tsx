"use client";

import Link from "next/link";
import { useState } from "react";
import Navbar from "./Navbar";
import Footer from "./Footer";

const JOURNAL_STATS = [
  { label: "Nhật ký", value: 24 },
  { label: "Thành tựu", value: 18 },
  { label: "Ngày liên tiếp", value: 7 },
  { label: "Tháng hoạt động", value: 8 },
];

const MONTHS = ["Tất cả", "Tháng 6/2026", "Tháng 5/2026", "Tháng 4/2026", "Tháng 3/2026"];

const ENTRIES = [
  {
    id: "entry-1",
    date: "21/06/2026",
    month: "Tháng 6/2026",
    title: "Hoàn thành 1000 con hạc giấy!",
    content: "Hôm nay tôi đã hoàn thành mục tiêu 1000 con hạc giấy sau 6 tháng kiên trì. Cảm giác này thật khó tả — vừa hạnh phúc vừa bồi hồi. Mỗi con hạc là một buổi sáng yên tĩnh, một sự tập trung hoàn toàn vào hiện tại...",
    emoji: "🦢",
    emojiColor: "#E8F5E8",
    tutorialRef: { title: "Hạc giấy nghệ thuật", id: "hac-giay-nghe-thuat" },
    isAchievement: true,
    achievementTitle: "1000 Hạc Giấy",
    mood: "😊",
    isPublic: true,
    likes: 47,
  },
  {
    id: "entry-2",
    date: "18/06/2026",
    month: "Tháng 6/2026",
    title: "Thử thách gấp trong 30 phút",
    content: "Hôm nay tôi thử gấp một con hạc trong 30 phút mà không nhìn hướng dẫn. Kết quả không hoàn hảo nhưng tôi nhận ra mình đã nhớ được các bước cơ bản. Đây là bằng chứng rằng luyện tập đều đặn thực sự có tác dụng!",
    emoji: "⏱️",
    emojiColor: "#FFFBF0",
    tutorialRef: null,
    isAchievement: false,
    achievementTitle: null,
    mood: "🤔",
    isPublic: false,
    likes: 0,
  },
  {
    id: "entry-3",
    date: "15/06/2026",
    month: "Tháng 6/2026",
    title: "Workshop hạc giấy với bạn bè",
    content: "Tổ chức workshop nhỏ cho 5 người bạn. Thú vị là mỗi người có cách tiếp cận khác nhau — người thì tỉ mỉ từng nếp gấp, người thì cứ gấp nhanh rồi chỉnh sau. Kết quả ai cũng có được một con hạc đẹp của riêng mình!",
    emoji: "👥",
    emojiColor: "#F0F8FF",
    tutorialRef: { title: "Hạc giấy nghệ thuật", id: "hac-giay-nghe-thuat" },
    isAchievement: true,
    achievementTitle: "Workshop Đầu Tiên",
    mood: "🎉",
    isPublic: true,
    likes: 23,
  },
  {
    id: "entry-4",
    date: "10/06/2026",
    month: "Tháng 6/2026",
    title: "Bắt đầu học Origami 3D",
    content: "Hôm nay bắt đầu bài hướng dẫn Rồng 3D của Quang Minh. Bước đầu tiên đã khó hơn mình nghĩ — giấy cần phải thật phẳng và đường gấp cần chính xác từ đầu. Sẽ cần nhiều thời gian hơn nhưng rất hứng thú!",
    emoji: "🐉",
    emojiColor: "#F0F0FF",
    tutorialRef: { title: "Rồng Origami 3D", id: "rong-origami-3d" },
    isAchievement: false,
    achievementTitle: null,
    mood: "😤",
    isPublic: true,
    likes: 12,
  },
  {
    id: "entry-5",
    date: "28/05/2026",
    month: "Tháng 5/2026",
    title: "900 hạc — gần đến đích!",
    content: "Đã đạt đến 900 con hạc! Chỉ còn 100 nữa thôi. Tốc độ gấp của mình đã tăng lên nhiều — từ 20 phút/con xuống còn 8 phút/con. Cơ thể đã nhớ các động tác một cách tự nhiên.",
    emoji: "🦢",
    emojiColor: "#E8F5E8",
    tutorialRef: null,
    isAchievement: true,
    achievementTitle: "900 Hạc Giấy",
    mood: "💪",
    isPublic: true,
    likes: 38,
  },
];

export default function JournalPage() {
  const [activeMonth, setActiveMonth] = useState("Tất cả");
  const [showPublicOnly, setShowPublicOnly] = useState(false);

  const filtered = ENTRIES.filter((e) => {
    if (activeMonth !== "Tất cả" && e.month !== activeMonth) return false;
    if (showPublicOnly && !e.isPublic) return false;
    return true;
  });

  return (
    <>
      <Navbar />
      <main style={{ minHeight: "100vh", background: "var(--color-bg)", paddingTop: "2rem", paddingBottom: "4rem" }}>
        <div className="container">

          {/* Header */}
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "2rem", flexWrap: "wrap", gap: "1rem" }}>
            <div>
              <h1 className="text-heading" style={{ fontSize: "1.875rem", color: "var(--color-text-primary)", marginBottom: "0.375rem" }}>
                📔 Nhật ký cá nhân
              </h1>
              <p style={{ color: "var(--color-text-muted)", fontSize: "0.9375rem" }}>Ghi lại hành trình Origami của bạn</p>
            </div>
            <Link href="/nhat-ky/chinh-sua" className="btn btn-primary" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
              Viết nhật ký
            </Link>
          </div>

          {/* Stats */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "1rem", marginBottom: "2rem" }}>
            {JOURNAL_STATS.map((s) => (
              <div key={s.label} style={{ background: "var(--color-surface)", borderRadius: "var(--radius-lg)", border: "1px solid var(--color-border)", padding: "1.25rem", textAlign: "center", boxShadow: "var(--shadow-xs)" }}>
                <div style={{ fontWeight: 800, fontSize: "2rem", color: "var(--color-primary)", lineHeight: 1, marginBottom: "0.375rem" }}>{s.value}</div>
                <div style={{ fontSize: "0.8125rem", color: "var(--color-text-muted)" }}>{s.label}</div>
              </div>
            ))}
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "240px 1fr", gap: "2rem", alignItems: "start" }}>
            {/* Sidebar */}
            <aside>
              <div style={{ background: "var(--color-surface)", borderRadius: "var(--radius-lg)", border: "1px solid var(--color-border)", padding: "1.25rem", marginBottom: "1rem", boxShadow: "var(--shadow-sm)" }}>
                <h3 style={{ fontWeight: 700, fontSize: "0.9375rem", color: "var(--color-text-primary)", marginBottom: "1rem" }}>📅 Lọc theo tháng</h3>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
                  {MONTHS.map((m) => (
                    <button key={m} onClick={() => setActiveMonth(m)}
                      style={{ width: "100%", textAlign: "left", padding: "0.5rem 0.75rem", borderRadius: "var(--radius-md)", border: "none", background: activeMonth === m ? "rgba(45,106,79,0.08)" : "transparent", color: activeMonth === m ? "var(--color-primary)" : "var(--color-text-secondary)", fontWeight: activeMonth === m ? 700 : 400, fontSize: "0.875rem", cursor: "pointer" }}>
                      {m}
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ background: "var(--color-surface)", borderRadius: "var(--radius-lg)", border: "1px solid var(--color-border)", padding: "1.25rem", boxShadow: "var(--shadow-sm)" }}>
                <h3 style={{ fontWeight: 700, fontSize: "0.9375rem", color: "var(--color-text-primary)", marginBottom: "1rem" }}>⚙️ Hiển thị</h3>
                <label style={{ display: "flex", alignItems: "center", gap: "0.75rem", cursor: "pointer" }}>
                  <div onClick={() => setShowPublicOnly((v) => !v)}
                    style={{ width: "2.5rem", height: "1.375rem", borderRadius: "var(--radius-full)", background: showPublicOnly ? "var(--color-primary)" : "var(--color-border)", position: "relative", transition: "var(--transition-normal)", cursor: "pointer", flexShrink: 0 }}>
                    <div style={{ position: "absolute", top: "2px", left: showPublicOnly ? "calc(100% - 1.125rem)" : "2px", width: "1rem", height: "1rem", borderRadius: "50%", background: "white", transition: "var(--transition-normal)", boxShadow: "var(--shadow-xs)" }} />
                  </div>
                  <span style={{ fontSize: "0.875rem", color: "var(--color-text-secondary)" }}>Chỉ công khai</span>
                </label>
              </div>
            </aside>

            {/* Entries */}
            <div>
              {filtered.length === 0 ? (
                <div style={{ textAlign: "center", padding: "4rem 1rem", background: "var(--color-surface)", borderRadius: "var(--radius-xl)", border: "1px solid var(--color-border)" }}>
                  <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>📔</div>
                  <h3 style={{ fontWeight: 700, color: "var(--color-text-primary)", marginBottom: "0.5rem" }}>Chưa có nhật ký nào</h3>
                  <p style={{ color: "var(--color-text-muted)", marginBottom: "1.5rem" }}>Bắt đầu ghi lại hành trình Origami của bạn ngay hôm nay!</p>
                  <Link href="/nhat-ky/chinh-sua" className="btn btn-primary" style={{ textDecoration: "none" }}>Viết nhật ký đầu tiên</Link>
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
                  {filtered.map((entry) => (
                    <article key={entry.id} style={{ background: "var(--color-surface)", borderRadius: "var(--radius-xl)", border: "1px solid var(--color-border)", overflow: "hidden", boxShadow: "var(--shadow-sm)" }}>
                      <div style={{ display: "flex", gap: "1.25rem", padding: "1.5rem" }}>
                        {/* Date */}
                        <div style={{ flexShrink: 0, textAlign: "center", width: "3.5rem" }}>
                          <div style={{ fontSize: "1.5rem", lineHeight: 1 }}>{entry.mood}</div>
                          <div style={{ fontSize: "0.6875rem", color: "var(--color-text-muted)", marginTop: "0.375rem", lineHeight: 1.3 }}>{entry.date}</div>
                        </div>

                        <div style={{ flex: 1, minWidth: 0 }}>
                          {/* Tags */}
                          <div style={{ display: "flex", gap: "0.375rem", flexWrap: "wrap", marginBottom: "0.625rem" }}>
                            {entry.isAchievement && (
                              <span style={{ display: "inline-flex", alignItems: "center", gap: "0.25rem", background: "rgba(212,113,59,0.1)", color: "var(--color-accent)", borderRadius: "var(--radius-full)", padding: "0.2rem 0.625rem", fontSize: "0.75rem", fontWeight: 600 }}>
                                🏆 {entry.achievementTitle}
                              </span>
                            )}
                            {entry.isPublic ? (
                              <span style={{ display: "inline-flex", alignItems: "center", gap: "0.25rem", background: "rgba(45,106,79,0.08)", color: "var(--color-primary)", borderRadius: "var(--radius-full)", padding: "0.2rem 0.625rem", fontSize: "0.75rem", fontWeight: 500 }}>
                                🌍 Công khai
                              </span>
                            ) : (
                              <span style={{ display: "inline-flex", alignItems: "center", gap: "0.25rem", background: "var(--color-surface-2)", color: "var(--color-text-muted)", borderRadius: "var(--radius-full)", padding: "0.2rem 0.625rem", fontSize: "0.75rem", fontWeight: 500 }}>
                                🔒 Riêng tư
                              </span>
                            )}
                          </div>

                          <h2 style={{ fontWeight: 700, fontSize: "1.0625rem", color: "var(--color-text-primary)", marginBottom: "0.5rem", lineHeight: 1.4 }}>{entry.title}</h2>
                          <p style={{ fontSize: "0.9rem", color: "var(--color-text-secondary)", lineHeight: 1.65, marginBottom: "0.75rem", display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                            {entry.content}
                          </p>

                          {entry.tutorialRef && (
                            <Link href={`/huong-dan/${entry.tutorialRef.id}`} style={{ display: "inline-flex", alignItems: "center", gap: "0.375rem", background: "rgba(45,106,79,0.06)", border: "1px solid rgba(45,106,79,0.15)", borderRadius: "var(--radius-md)", padding: "0.375rem 0.75rem", textDecoration: "none", fontSize: "0.8125rem", color: "var(--color-primary)", fontWeight: 500, marginBottom: "0.75rem" }}>
                              📌 {entry.tutorialRef.title}
                            </Link>
                          )}

                          <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                            {entry.isPublic && (
                              <span style={{ fontSize: "0.8125rem", color: "var(--color-text-muted)" }}>❤️ {entry.likes} lượt thích</span>
                            )}
                            <div style={{ marginLeft: "auto", display: "flex", gap: "0.5rem" }}>
                              <Link href={`/nhat-ky/chinh-sua?id=${entry.id}`} style={{ padding: "0.375rem 0.75rem", borderRadius: "var(--radius-md)", border: "1.5px solid var(--color-border)", fontSize: "0.8125rem", color: "var(--color-text-secondary)", textDecoration: "none", fontWeight: 500 }}>Sửa</Link>
                            </div>
                          </div>
                        </div>

                        {/* Image */}
                        <div style={{ width: "5rem", height: "5rem", borderRadius: "var(--radius-lg)", background: entry.emojiColor, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "2.25rem", flexShrink: 0 }}>
                          {entry.emoji}
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />

      <style>{`
        @media (max-width: 768px) {
          .container > div:last-child { grid-template-columns: 1fr !important; }
          .container > div:last-child > aside { display: none; }
        }
        @media (max-width: 600px) {
          [style*="grid-template-columns: repeat(4"] { grid-template-columns: repeat(2, 1fr) !important; }
        }
      `}</style>
    </>
  );
}
