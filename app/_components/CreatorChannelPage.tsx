"use client";

import Link from "next/link";
import { useState } from "react";
import Navbar from "./Navbar";
import Footer from "./Footer";

const CREATOR = {
  name: "Quang Minh",
  username: "quangminh_origami",
  displayUsername: "@quangminh_origami",
  bio: "Đam mê nghệ thuật gấp giấy Origami từ năm 2015. Chuyên về Origami 3D và Modular Origami. Mình tin rằng mỗi tờ giấy đều có thể trở thành một tác phẩm nghệ thuật! 🐉",
  avatarColor: "#2D6A4F",
  coverGradient: "linear-gradient(135deg, #1B4332 0%, #2D6A4F 50%, #40916C 100%)",
  location: "Hà Nội, Việt Nam",
  website: "quangminh-origami.com",
  joinDate: "Tháng 3, 2022",
  isVip: true,
  isVerified: true,
  stats: {
    tutorials: 48,
    followers: 12400,
    following: 234,
    likes: 89600,
    completions: 3780,
  },
  badges: [
    { icon: "🏆", label: "Top Creator" },
    { icon: "⭐", label: "Verified" },
    { icon: "💎", label: "VIP Creator" },
    { icon: "🔥", label: "Trending" },
  ],
  vipPrice: "50.000₫/tháng",
  vipSubscribers: 234,
};

const TUTORIALS = [
  { id: "rong-origami-3d", title: "Rồng Origami 3D huyền thoại", emoji: "🐉", color: "#F0F0FF", difficulty: "Khó", type: "VIP", steps: 28, views: "8.7K", likes: 1203 },
  { id: "phuong-hoang-huyen-thoai", title: "Phượng hoàng huyền thoại", emoji: "🦅", color: "#FFF5F0", difficulty: "Khó", type: "VIP", steps: 30, views: "5.2K", likes: 876 },
  { id: "hac-giay-nghe-thuat", title: "Hạc giấy nghệ thuật", emoji: "🦢", color: "#E8F5E8", difficulty: "Trung bình", type: "Miễn phí", steps: 15, views: "3.1K", likes: 428 },
  { id: "ky-lan-giay", title: "Kỳ lân giấy thần thoại", emoji: "🦄", color: "#F5F0FF", difficulty: "Khó", type: "VIP", steps: 26, views: "6.4K", likes: 921 },
  { id: "buom-3d-modular", title: "Bướm 3D Modular", emoji: "🦋", color: "#FFFBF0", difficulty: "Trung bình", type: "Miễn phí", steps: 18, views: "2.9K", likes: 367 },
  { id: "ca-koi-don-gian", title: "Cá koi đơn giản", emoji: "🐟", color: "#F0F8FF", difficulty: "Dễ", type: "Miễn phí", steps: 10, views: "1.8K", likes: 241 },
];

function formatNumber(n: number) {
  if (n >= 1000) return (n / 1000).toFixed(1).replace(/\.0$/, "") + "K";
  return n.toString();
}

function getDiffClass(d: string) {
  if (d === "Dễ") return "badge-easy";
  if (d === "Trung bình") return "badge-medium";
  return "badge-hard";
}

export default function CreatorChannelPage() {
  const [activeTab, setActiveTab] = useState<"tutorials" | "about" | "vip">("tutorials");
  const [isFollowing, setIsFollowing] = useState(false);
  const [filterType, setFilterType] = useState<"all" | "free" | "vip">("all");

  const filtered = TUTORIALS.filter((t) => {
    if (filterType === "free") return t.type === "Miễn phí";
    if (filterType === "vip") return t.type === "VIP";
    return true;
  });

  return (
    <>
      <Navbar />
      <main style={{ minHeight: "100vh", background: "var(--color-bg)" }}>

        {/* ── Cover ── */}
        <div style={{ background: CREATOR.coverGradient, height: "220px", position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.2)" }} />
          <div style={{ position: "absolute", bottom: 0, right: 0, fontSize: "12rem", opacity: 0.1, lineHeight: 1, userSelect: "none" }}>🐉</div>
        </div>

        <div className="container">
          {/* ── Profile Row ── */}
          <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginTop: "-3rem", marginBottom: "1.5rem", flexWrap: "wrap", gap: "1rem" }}>
            <div style={{ display: "flex", alignItems: "flex-end", gap: "1.25rem" }}>
              <div style={{ width: "6rem", height: "6rem", borderRadius: "50%", background: CREATOR.avatarColor, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "2rem", fontWeight: 800, color: "white", border: "4px solid var(--color-surface)", boxShadow: "var(--shadow-md)", flexShrink: 0 }}>
                {CREATOR.name.charAt(0)}
              </div>
              <div style={{ paddingBottom: "0.375rem" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", flexWrap: "wrap" }}>
                  <h1 style={{ fontWeight: 800, fontSize: "1.625rem", color: "var(--color-text-primary)", lineHeight: 1 }}>{CREATOR.name}</h1>
                  {CREATOR.isVerified && <span title="Đã xác minh">⭐</span>}
                  {CREATOR.isVip && <span className="badge badge-vip" style={{ fontSize: "0.7rem" }}>VIP Creator</span>}
                </div>
                <p style={{ color: "var(--color-text-muted)", fontSize: "0.875rem", marginTop: "0.25rem" }}>{CREATOR.displayUsername}</p>
              </div>
            </div>

            <div style={{ display: "flex", gap: "0.75rem", paddingBottom: "0.375rem" }}>
              <button className="btn btn-outline" style={{ padding: "0.625rem 1.25rem", fontSize: "0.875rem" }}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>
                Nhắn tin
              </button>
              <button
                onClick={() => setIsFollowing((v) => !v)}
                className={isFollowing ? "btn btn-outline" : "btn btn-primary"}
                style={{ padding: "0.625rem 1.5rem", fontSize: "0.875rem" }}>
                {isFollowing ? "✓ Đang theo dõi" : "+ Theo dõi"}
              </button>
            </div>
          </div>

          {/* ── Stats ── */}
          <div style={{ display: "flex", gap: "2rem", flexWrap: "wrap", marginBottom: "1.5rem", paddingBottom: "1.5rem", borderBottom: "1px solid var(--color-border)" }}>
            {[
              { label: "Bài hướng dẫn", value: CREATOR.stats.tutorials },
              { label: "Người theo dõi", value: formatNumber(CREATOR.stats.followers) },
              { label: "Đang theo dõi", value: CREATOR.stats.following },
              { label: "Lượt thích", value: formatNumber(CREATOR.stats.likes) },
              { label: "Hoàn thành bởi", value: formatNumber(CREATOR.stats.completions) },
            ].map((s) => (
              <div key={s.label} style={{ textAlign: "center" }}>
                <div style={{ fontWeight: 800, fontSize: "1.375rem", color: "var(--color-primary)", lineHeight: 1 }}>{s.value}</div>
                <div style={{ fontSize: "0.75rem", color: "var(--color-text-muted)", marginTop: "0.25rem" }}>{s.label}</div>
              </div>
            ))}
            <div style={{ display: "flex", gap: "0.375rem", alignItems: "center", marginLeft: "auto" }}>
              {CREATOR.badges.map((b) => (
                <span key={b.label} title={b.label} style={{ fontSize: "1.25rem" }}>{b.icon}</span>
              ))}
            </div>
          </div>

          {/* ── Tabs ── */}
          <div style={{ display: "flex", gap: "0", borderBottom: "2px solid var(--color-border)", marginBottom: "2rem" }}>
            {([["tutorials", "📚 Bài hướng dẫn"], ["vip", "💎 Gói VIP"], ["about", "👤 Giới thiệu"]] as const).map(([key, label]) => (
              <button key={key} onClick={() => setActiveTab(key)}
                style={{ padding: "0.875rem 1.5rem", border: "none", background: "none", borderBottom: `2.5px solid ${activeTab === key ? "var(--color-primary)" : "transparent"}`, marginBottom: "-2px", color: activeTab === key ? "var(--color-primary)" : "var(--color-text-muted)", fontWeight: activeTab === key ? 700 : 500, fontSize: "0.9375rem", cursor: "pointer", transition: "var(--transition-fast)" }}>
                {label}
              </button>
            ))}
          </div>

          {/* ── Tab Content ── */}
          {activeTab === "tutorials" && (
            <div>
              {/* Type filter */}
              <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1.5rem" }}>
                {([["all", "Tất cả"], ["free", "Miễn phí"], ["vip", "VIP"]] as const).map(([key, label]) => (
                  <button key={key} onClick={() => setFilterType(key)}
                    style={{ padding: "0.375rem 1rem", borderRadius: "var(--radius-full)", border: `1.5px solid ${filterType === key ? "var(--color-primary)" : "var(--color-border)"}`, background: filterType === key ? "var(--color-primary)" : "transparent", color: filterType === key ? "white" : "var(--color-text-secondary)", fontSize: "0.875rem", fontWeight: 500, cursor: "pointer" }}>
                    {label}
                  </button>
                ))}
                <span style={{ marginLeft: "auto", fontSize: "0.875rem", color: "var(--color-text-muted)", alignSelf: "center" }}>{filtered.length} bài</span>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px,1fr))", gap: "1.25rem", marginBottom: "3rem" }}>
                {filtered.map((t) => (
                  <article key={t.id} className="card" style={{ overflow: "hidden" }}>
                    <Link href={t.type === "VIP" ? `/huong-dan/${t.id}/vip` : `/huong-dan/${t.id}`} style={{ textDecoration: "none", color: "inherit", display: "block" }}>
                      <div style={{ aspectRatio: "4/3", background: t.color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "3rem", position: "relative" }}>
                        {t.emoji}
                        <div style={{ position: "absolute", top: "0.5rem", right: "0.5rem" }}>
                          <span className={`badge ${t.type === "VIP" ? "badge-vip" : "badge-free"}`}>{t.type}</span>
                        </div>
                      </div>
                      <div style={{ padding: "0.875rem" }}>
                        <h3 style={{ fontWeight: 700, fontSize: "0.9375rem", color: "var(--color-text-primary)", marginBottom: "0.5rem", lineHeight: 1.4 }}>{t.title}</h3>
                        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", flexWrap: "wrap" }}>
                          <span className={`badge ${getDiffClass(t.difficulty)}`}>{t.difficulty}</span>
                          <span style={{ fontSize: "0.75rem", color: "var(--color-text-muted)" }}>{t.steps} bước</span>
                          <span style={{ marginLeft: "auto", fontSize: "0.75rem", color: "var(--color-text-muted)" }}>❤️ {t.likes}</span>
                        </div>
                      </div>
                    </Link>
                  </article>
                ))}
              </div>
            </div>
          )}

          {activeTab === "vip" && (
            <div style={{ maxWidth: "600px", margin: "0 auto", paddingBottom: "3rem" }}>
              {/* VIP Card */}
              <div style={{ background: "linear-gradient(135deg, #1B4332 0%, #2D6A4F 100%)", borderRadius: "var(--radius-xl)", padding: "2rem", color: "white", textAlign: "center", marginBottom: "1.5rem" }}>
                <div style={{ fontSize: "2.5rem", marginBottom: "0.75rem" }}>💎</div>
                <h2 style={{ fontWeight: 800, fontSize: "1.5rem", marginBottom: "0.5rem" }}>{CREATOR.name} VIP</h2>
                <p style={{ color: "rgba(255,255,255,0.8)", fontSize: "0.9375rem", marginBottom: "1.25rem" }}>
                  Truy cập toàn bộ {TUTORIAL_COUNT} bài VIP của {CREATOR.name}
                </p>
                <div style={{ fontSize: "2rem", fontWeight: 800, color: "#F4A261", marginBottom: "0.25rem" }}>{CREATOR.vipPrice}</div>
                <p style={{ color: "rgba(255,255,255,0.6)", fontSize: "0.8125rem", marginBottom: "1.5rem" }}>{CREATOR.vipSubscribers} người đã đăng ký</p>
                <button className="btn" style={{ background: "linear-gradient(135deg, #D4713B 0%, #E8955F 100%)", color: "white", width: "100%", justifyContent: "center", padding: "0.875rem", fontSize: "1rem" }}>
                  Đăng ký VIP ngay
                </button>
              </div>

              {/* VIP Benefits */}
              <div style={{ background: "var(--color-surface)", borderRadius: "var(--radius-xl)", border: "1px solid var(--color-border)", padding: "1.5rem" }}>
                <h3 style={{ fontWeight: 700, fontSize: "1.0625rem", color: "var(--color-text-primary)", marginBottom: "1rem" }}>Quyền lợi VIP bao gồm:</h3>
                {[
                  "Toàn bộ bài hướng dẫn VIP của " + CREATOR.name,
                  "Video hướng dẫn từng bước HD",
                  "Bản PDF có thể tải về và in",
                  "Hỗ trợ trực tiếp từ creator",
                  "Ưu tiên tham gia workshop",
                  "Badge VIP Member trên profile",
                ].map((benefit) => (
                  <div key={benefit} style={{ display: "flex", alignItems: "center", gap: "0.75rem", padding: "0.5rem 0", borderBottom: "1px solid var(--color-border)" }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" strokeWidth="2.5"><path d="M20 6 9 17l-5-5" /></svg>
                    <span style={{ fontSize: "0.9375rem", color: "var(--color-text-secondary)" }}>{benefit}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "about" && (
            <div style={{ maxWidth: "640px", marginBottom: "3rem" }}>
              <div style={{ background: "var(--color-surface)", borderRadius: "var(--radius-xl)", border: "1px solid var(--color-border)", padding: "1.5rem", marginBottom: "1.25rem" }}>
                <h3 style={{ fontWeight: 700, fontSize: "1.0625rem", color: "var(--color-text-primary)", marginBottom: "0.875rem" }}>Về tôi</h3>
                <p style={{ color: "var(--color-text-secondary)", lineHeight: 1.75, fontSize: "0.9375rem" }}>{CREATOR.bio}</p>
              </div>
              <div style={{ background: "var(--color-surface)", borderRadius: "var(--radius-xl)", border: "1px solid var(--color-border)", padding: "1.5rem" }}>
                <h3 style={{ fontWeight: 700, fontSize: "1.0625rem", color: "var(--color-text-primary)", marginBottom: "0.875rem" }}>Thông tin</h3>
                {[
                  { icon: "📍", label: "Địa điểm", value: CREATOR.location },
                  { icon: "🌐", label: "Website", value: CREATOR.website, link: `https://${CREATOR.website}` },
                  { icon: "📅", label: "Tham gia", value: CREATOR.joinDate },
                ].map((info) => (
                  <div key={info.label} style={{ display: "flex", alignItems: "center", gap: "0.75rem", padding: "0.625rem 0", borderBottom: "1px solid var(--color-border)" }}>
                    <span style={{ fontSize: "1.125rem" }}>{info.icon}</span>
                    <span style={{ fontSize: "0.875rem", color: "var(--color-text-muted)", width: "5rem", flexShrink: 0 }}>{info.label}</span>
                    {info.link ? (
                      <a href={info.link} target="_blank" rel="noopener noreferrer" style={{ fontSize: "0.9375rem", color: "var(--color-primary)", fontWeight: 500, textDecoration: "none" }}>{info.value}</a>
                    ) : (
                      <span style={{ fontSize: "0.9375rem", color: "var(--color-text-primary)" }}>{info.value}</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}

const TUTORIAL_COUNT = TUTORIALS.filter((t) => t.type === "VIP").length;
