"use client";

import Link from "next/link";
import Navbar from "./Navbar";
import Footer from "./Footer";

const USER = {
  name: "Hoàng Nam",
  username: "@hoangnam.origami3d",
  color: "#2C7DA0",
  bio: "Chuyên gia Origami 3D. Chia sẻ hành trình học hỏi và sáng tạo mỗi ngày.",
  followers: "21.3K",
  tutorials: 61,
};

const PUBLIC_ENTRIES = [
  {
    id: "hn-entry-1",
    date: "20/06/2026",
    title: "Hoàn thành tháp modular 500 mảnh",
    content: "Sau 3 tuần lắp ráp từng chi tiết, tòa tháp modular 500 mảnh đã hoàn thành! Mỗi mảnh là một bông hoa nhỏ, ghép lại thành một công trình kiến trúc miniature. Đây là tác phẩm phức tạp nhất tôi từng làm...",
    emoji: "🏯",
    emojiColor: "#F0F4FF",
    isAchievement: true,
    achievementTitle: "Modular Master",
    mood: "🎉",
    likes: 234,
    tutorialRef: null,
  },
  {
    id: "hn-entry-2",
    date: "15/06/2026",
    title: "Khám phá kỹ thuật wet-folding",
    content: "Hôm nay thử nghiệm kỹ thuật wet-folding lần đầu tiên — làm ẩm giấy trước khi gấp để tạo hình cong mềm mại. Kết quả rất khác so với origami thông thường! Con cá này trông sống động hơn nhiều...",
    emoji: "🐟",
    emojiColor: "#E0F7FA",
    isAchievement: false,
    achievementTitle: null,
    mood: "🤔",
    likes: 156,
    tutorialRef: { title: "Cá biển Origami", id: "ca-bien-origami" },
  },
  {
    id: "hn-entry-3",
    date: "10/06/2026",
    title: "Dạy Origami cho lớp học buổi sáng",
    content: "Tình nguyện dạy Origami cho 20 bạn nhỏ tại trung tâm cộng đồng phường. Nhìn các em gấp được con thuyền đầu tiên rồi reo vui — khoảnh khắc đó khiến mình nhớ lại cảm giác lần đầu học Origami năm 10 tuổi.",
    emoji: "🌸",
    emojiColor: "#FFF0F5",
    isAchievement: true,
    achievementTitle: "Người Truyền Cảm Hứng",
    mood: "😊",
    likes: 312,
    tutorialRef: null,
  },
];

export default function OtherUserJournalPage() {
  return (
    <>
      <Navbar />
      <main style={{ minHeight: "100vh", background: "var(--color-bg)", paddingTop: "2rem", paddingBottom: "4rem" }}>
        <div className="container-sm" style={{ maxWidth: "720px" }}>

          {/* User Mini Profile */}
          <div style={{ background: "var(--color-surface)", borderRadius: "var(--radius-xl)", border: "1px solid var(--color-border)", padding: "1.5rem", marginBottom: "1.5rem", boxShadow: "var(--shadow-sm)", display: "flex", alignItems: "center", gap: "1.25rem" }}>
            <div style={{ width: "4rem", height: "4rem", borderRadius: "50%", background: USER.color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.5rem", fontWeight: 700, color: "white", flexShrink: 0 }}>
              {USER.name.charAt(0)}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", flexWrap: "wrap", marginBottom: "0.25rem" }}>
                <h2 style={{ fontWeight: 700, fontSize: "1.125rem", color: "var(--color-text-primary)" }}>{USER.name}</h2>
                <span style={{ fontSize: "0.875rem", color: "var(--color-text-muted)" }}>{USER.username}</span>
              </div>
              <p style={{ fontSize: "0.875rem", color: "var(--color-text-secondary)", marginBottom: "0.5rem" }}>{USER.bio}</p>
              <span style={{ fontSize: "0.8125rem", color: "var(--color-text-muted)" }}>{USER.tutorials} bài hướng dẫn · {USER.followers} người theo dõi</span>
            </div>
            <div style={{ display: "flex", gap: "0.625rem", flexShrink: 0 }}>
              <Link href={`/kenh/${USER.username.replace("@", "")}`} className="btn btn-outline" style={{ textDecoration: "none", padding: "0.5rem 1rem", fontSize: "0.875rem" }}>Xem kênh</Link>
              <button className="btn btn-primary" style={{ padding: "0.5rem 1rem", fontSize: "0.875rem" }}>Theo dõi</button>
            </div>
          </div>

          {/* Header */}
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1.5rem" }}>
            <div style={{ width: "2rem", height: "2rem", borderRadius: "50%", background: USER.color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.875rem", fontWeight: 700, color: "white" }}>{USER.name.charAt(0)}</div>
            <div>
              <h1 style={{ fontWeight: 700, fontSize: "1.25rem", color: "var(--color-text-primary)" }}>
                Nhật ký công khai của {USER.name}
              </h1>
              <p style={{ fontSize: "0.8125rem", color: "var(--color-text-muted)" }}>{PUBLIC_ENTRIES.length} bài nhật ký công khai</p>
            </div>
          </div>

          {/* Notice */}
          <div style={{ background: "rgba(44,125,160,0.06)", border: "1.5px solid rgba(44,125,160,0.15)", borderRadius: "var(--radius-md)", padding: "0.875rem 1rem", marginBottom: "1.5rem", display: "flex", alignItems: "center", gap: "0.625rem" }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--color-info)" strokeWidth="2"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
            <span style={{ fontSize: "0.8125rem", color: "var(--color-text-secondary)" }}>Chỉ hiển thị các bài nhật ký được đặt công khai bởi {USER.name}</span>
          </div>

          {/* Entries */}
          <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
            {PUBLIC_ENTRIES.map((entry) => (
              <article key={entry.id} style={{ background: "var(--color-surface)", borderRadius: "var(--radius-xl)", border: "1px solid var(--color-border)", overflow: "hidden", boxShadow: "var(--shadow-sm)" }}>
                <div style={{ display: "flex", gap: "1.25rem", padding: "1.5rem" }}>
                  <div style={{ flexShrink: 0, textAlign: "center", width: "3.5rem" }}>
                    <div style={{ fontSize: "1.5rem", lineHeight: 1 }}>{entry.mood}</div>
                    <div style={{ fontSize: "0.6875rem", color: "var(--color-text-muted)", marginTop: "0.375rem", lineHeight: 1.3 }}>{entry.date}</div>
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", gap: "0.375rem", flexWrap: "wrap", marginBottom: "0.625rem" }}>
                      {entry.isAchievement && (
                        <span style={{ display: "inline-flex", alignItems: "center", gap: "0.25rem", background: "rgba(212,113,59,0.1)", color: "var(--color-accent)", borderRadius: "var(--radius-full)", padding: "0.2rem 0.625rem", fontSize: "0.75rem", fontWeight: 600 }}>
                          🏆 {entry.achievementTitle}
                        </span>
                      )}
                      <span style={{ display: "inline-flex", alignItems: "center", gap: "0.25rem", background: "rgba(45,106,79,0.08)", color: "var(--color-primary)", borderRadius: "var(--radius-full)", padding: "0.2rem 0.625rem", fontSize: "0.75rem", fontWeight: 500 }}>
                        🌍 Công khai
                      </span>
                    </div>
                    <h2 style={{ fontWeight: 700, fontSize: "1.0625rem", color: "var(--color-text-primary)", marginBottom: "0.5rem" }}>{entry.title}</h2>
                    <p style={{ fontSize: "0.9rem", color: "var(--color-text-secondary)", lineHeight: 1.65, marginBottom: "0.75rem", display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                      {entry.content}
                    </p>
                    {entry.tutorialRef && (
                      <Link href={`/huong-dan/${entry.tutorialRef.id}`} style={{ display: "inline-flex", alignItems: "center", gap: "0.375rem", background: "rgba(45,106,79,0.06)", border: "1px solid rgba(45,106,79,0.15)", borderRadius: "var(--radius-md)", padding: "0.375rem 0.75rem", textDecoration: "none", fontSize: "0.8125rem", color: "var(--color-primary)", fontWeight: 500, marginBottom: "0.75rem" }}>
                        📌 {entry.tutorialRef.title}
                      </Link>
                    )}
                    <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                      <button style={{ background: "none", border: "none", cursor: "pointer", fontSize: "0.8125rem", color: "var(--color-text-muted)", display: "flex", alignItems: "center", gap: "0.375rem" }}>
                        🤍 {entry.likes} thích
                      </button>
                    </div>
                  </div>
                  <div style={{ width: "5rem", height: "5rem", borderRadius: "var(--radius-lg)", background: entry.emojiColor, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "2.25rem", flexShrink: 0 }}>
                    {entry.emoji}
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
