// Component chính của trang chủ — được import vào app/page.tsx
// Đây là Server Component (không cần "use client")

import Link from "next/link";
import Image from "next/image";
import Navbar from "./Navbar";
import Footer from "./Footer";
import AdBanner from "./AdBanner";

const TUTORIALS = [
  { id: 1, title: "Hạc giấy truyền thống", difficulty: "Dễ", diffClass: "badge-easy", type: "Miễn phí", typeClass: "badge-free", steps: 8, views: "2.4K", likes: 312, author: "Minh Châu", emoji: "🦢", color: "#E8F5E8" },
  { id: 2, title: "Hoa sen nghệ thuật", difficulty: "Trung bình", diffClass: "badge-medium", type: "Miễn phí", typeClass: "badge-free", steps: 15, views: "1.8K", likes: 241, author: "Thu Hương", emoji: "🌸", color: "#FFF0F5" },
  { id: 3, title: "Rồng Origami 3D", difficulty: "Khó", diffClass: "badge-hard", type: "VIP", typeClass: "badge-vip", steps: 28, views: "5.2K", likes: 876, author: "Quang Minh", emoji: "🐉", color: "#F0F0FF" },
  { id: 4, title: "Bướm mùa xuân", difficulty: "Dễ", diffClass: "badge-easy", type: "Miễn phí", typeClass: "badge-free", steps: 6, views: "987", likes: 154, author: "Lan Anh", emoji: "🦋", color: "#FFFBF0" },
  { id: 5, title: "Cá koi may mắn", difficulty: "Trung bình", diffClass: "badge-medium", type: "Miễn phí", typeClass: "badge-free", steps: 12, views: "3.1K", likes: 428, author: "Đức Tuấn", emoji: "🐟", color: "#F0F8FF" },
  { id: 6, title: "Ngôi sao 5 cánh", difficulty: "Dễ", diffClass: "badge-easy", type: "Miễn phí", typeClass: "badge-free", steps: 5, views: "1.2K", likes: 198, author: "Thảo Linh", emoji: "⭐", color: "#FFFDF0" },
  { id: 7, title: "Phượng hoàng huyền thoại", difficulty: "Khó", diffClass: "badge-hard", type: "VIP", typeClass: "badge-vip", steps: 30, views: "8.7K", likes: 1203, author: "Hoàng Nam", emoji: "🦅", color: "#FFF5F0" },
  { id: 8, title: "Gấu trúc dễ thương", difficulty: "Trung bình", diffClass: "badge-medium", type: "Miễn phí", typeClass: "badge-free", steps: 14, views: "2.9K", likes: 367, author: "Mai Chi", emoji: "🐼", color: "#F5F5F5" },
];

const CREATORS = [
  { name: "Quang Minh", tutorials: 48, followers: "12.4K", color: "#2D6A4F", initial: "QM", tag: "Origami Nâng cao" },
  { name: "Thu Hương", tutorials: 32, followers: "8.7K", color: "#D4713B", initial: "TH", tag: "Hoa & Nghệ thuật" },
  { name: "Hoàng Nam", tutorials: 61, followers: "21.3K", color: "#2C7DA0", initial: "HN", tag: "Origami 3D" },
  { name: "Lan Anh", tutorials: 27, followers: "6.2K", color: "#9B59B6", initial: "LA", tag: "Origami trẻ em" },
];

const STATS = [
  { num: "10K+", label: "Bài hướng dẫn" },
  { num: "50K+", label: "Thành viên" },
  { num: "500+", label: "Nhà sáng tạo" },
  { num: "4.9★", label: "Đánh giá" },
];

const CATEGORIES = ["Tất cả", "Động vật", "Hoa & Lá", "Đồ chơi", "Trang trí", "Lễ hội", "Origami trẻ em"];

export default function HomePage() {
  return (
    <>
      <Navbar />
      <main>
        {/* ===== HERO ===== */}
        <section className="hero-section" style={{ padding: "5rem 0 4rem" }}>
          <div className="container">
            <div className="hero-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "3rem", alignItems: "center" }}>
              {/* Left */}
              <div className="animate-fade-in">
                <div className="section-tag">
                  <span>✦</span> Nền tảng Origami #1 Việt Nam
                </div>
                <h1 className="text-display" style={{ fontSize: "clamp(2rem, 4.5vw, 3.25rem)", marginBottom: "1.25rem", color: "var(--color-text-primary)" }}>
                  Khám phá nghệ thuật{" "}
                  <span style={{ color: "var(--color-primary)", position: "relative" }}>
                    gấp giấy
                    <svg style={{ position: "absolute", bottom: "-6px", left: 0, width: "100%", height: "8px" }} viewBox="0 0 200 8" preserveAspectRatio="none">
                      <path d="M0 6 Q50 0 100 5 Q150 10 200 3" stroke="var(--color-accent)" strokeWidth="2.5" fill="none" strokeLinecap="round" />
                    </svg>
                  </span>{" "}
                  Origami
                </h1>
                <p style={{ fontSize: "1.0625rem", color: "var(--color-text-secondary)", lineHeight: 1.75, marginBottom: "2rem", maxWidth: "480px" }}>
                  Tham gia cộng đồng hơn <strong>50.000 người</strong> yêu thích Origami. Học từ hàng nghìn bài hướng dẫn, chia sẻ thành quả và kết nối với các nhà sáng tạo tài năng.
                </p>
                <div style={{ display: "flex", gap: "0.875rem", flexWrap: "wrap" }}>
                  <Link href="/dang-ky" className="btn btn-primary btn-lg">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
                    Bắt đầu miễn phí
                  </Link>
                  <Link href="/huong-dan" className="btn btn-outline btn-lg">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="5 3 19 12 5 21 5 3" /></svg>
                    Xem hướng dẫn
                  </Link>
                </div>

                {/* Stats */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "1rem", marginTop: "2.5rem", paddingTop: "2rem", borderTop: "1px solid var(--color-border)" }}>
                  {STATS.map((s) => (
                    <div key={s.label} className="stat-card" style={{ padding: "0.75rem 0", textAlign: "left" }}>
                      <div className="stat-number" style={{ fontSize: "1.5rem" }}>{s.num}</div>
                      <div className="stat-label">{s.label}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right — Hero Image */}
              <div className="animate-fade-in delay-200" style={{ position: "relative" }}>
                <div style={{ position: "relative", borderRadius: "var(--radius-xl)", overflow: "hidden", boxShadow: "var(--shadow-xl)", aspectRatio: "5/4" }}>
                  <Image src="/origami-hero.png" alt="Nghệ thuật gấp giấy Origami" fill sizes="(max-width: 900px) 100vw, 50vw" style={{ objectFit: "cover" }} priority />
                </div>
                {/* Floating badge */}
                <div style={{ position: "absolute", bottom: "1.5rem", left: "-1.5rem", background: "white", borderRadius: "var(--radius-lg)", padding: "0.875rem 1.125rem", boxShadow: "var(--shadow-lg)", display: "flex", alignItems: "center", gap: "0.75rem", border: "1px solid var(--color-border)" }}>
                  <div style={{ width: "2.5rem", height: "2.5rem", background: "var(--gradient-primary)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.25rem" }}>🏆</div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: "0.9375rem", color: "var(--color-text-primary)" }}>Bài hot nhất tuần</div>
                    <div style={{ fontSize: "0.8125rem", color: "var(--color-text-muted)" }}>Rồng Origami 3D · 8.7K lượt xem</div>
                  </div>
                </div>
                <div style={{ position: "absolute", top: "1.25rem", right: "-1rem", background: "white", borderRadius: "var(--radius-lg)", padding: "0.75rem 1rem", boxShadow: "var(--shadow-lg)", border: "1px solid var(--color-border)" }}>
                  <div style={{ fontSize: "0.8125rem", color: "var(--color-text-muted)", marginBottom: "0.25rem" }}>Thành viên mới hôm nay</div>
                  <div style={{ fontWeight: 700, color: "var(--color-primary)", fontSize: "1.125rem" }}>+124 người</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ===== AD SLOT 1: LEADERBOARD — sau Hero ===== */}
        {/* Vị trí: Banner ngang 728×90 nằm ngay dưới hero, trước thư viện tutorial */}
        {/* Kích thước chuẩn IAB Leaderboard. Thay bằng script AdSense khi go-live. */}
        <div
          style={{
            padding: "1.25rem 0",
            background: "var(--color-surface-2)",
            borderTop: "1px solid var(--color-border)",
            borderBottom: "1px solid var(--color-border)",
          }}
        >
          <div className="container">
            <AdBanner size="leaderboard" slotId="ad-leaderboard-hero" />
          </div>
        </div>

        {/* ===== TUTORIALS SECTION ===== */}
        <section style={{ padding: "4rem 0", background: "var(--color-bg)" }}>
          <div className="container">
            <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: "1.5rem", flexWrap: "wrap", gap: "1rem" }}>
              <div>
                <div className="section-tag"><span>📚</span> Học ngay</div>
                <h2 className="section-title">Thư viện Origami</h2>
                <p className="section-subtitle">Hàng nghìn bài hướng dẫn từ cơ bản đến nâng cao</p>
              </div>
              <Link href="/huong-dan" className="btn btn-outline btn-sm">
                Xem tất cả
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
              </Link>
            </div>

            {/* Filter chips */}
            <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", marginBottom: "2rem" }}>
              {CATEGORIES.map((cat, i) => (
                <button key={cat} className={`filter-chip${i === 0 ? " active" : ""}`} id={`filter-${cat}`}>
                  {cat}
                </button>
              ))}
            </div>

            {/* Cards grid */}
            <div className="tutorials-grid" style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "1.25rem" }}>
              {TUTORIALS.map((t) => (
                <article key={t.id} className="card tutorial-card" style={{ cursor: "pointer" }}>
                  <div style={{ position: "relative", overflow: "hidden", aspectRatio: "4/3", background: t.color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "4rem" }}>
                    {t.emoji}
                    <div style={{ position: "absolute", top: "0.625rem", left: "0.625rem", display: "flex", gap: "0.375rem" }}>
                      <span className={`badge ${t.diffClass}`}>{t.difficulty}</span>
                    </div>
                    <div style={{ position: "absolute", top: "0.625rem", right: "0.625rem" }}>
                      <span className={`badge ${t.typeClass}`}>{t.type}</span>
                    </div>
                  </div>
                  <div style={{ padding: "1rem" }}>
                    <h3 style={{ fontWeight: 700, fontSize: "0.9375rem", marginBottom: "0.625rem", color: "var(--color-text-primary)", lineHeight: 1.3 }}>{t.title}</h3>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.75rem" }}>
                      <div style={{ width: "1.75rem", height: "1.75rem", borderRadius: "50%", background: "var(--gradient-primary)", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontSize: "0.6875rem", fontWeight: 700, flexShrink: 0 }}>
                        {t.author.split(" ").map((n) => n[0]).slice(-2).join("")}
                      </div>
                      <span style={{ fontSize: "0.8125rem", color: "var(--color-text-secondary)", fontWeight: 500 }}>{t.author}</span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", color: "var(--color-text-muted)", fontSize: "0.8125rem", marginBottom: "0.875rem" }}>
                      <span>👁 {t.views}</span>
                      <span>❤️ {t.likes}</span>
                      <span>📋 {t.steps} bước</span>
                    </div>
                    <Link href={`/huong-dan/${t.id}`} className="btn btn-primary btn-sm" style={{ width: "100%", justifyContent: "center" }}>
                      Xem ngay
                    </Link>
                  </div>
                </article>
              ))}
            </div>

            {/* ===== AD SLOT 2: RECTANGLE — trong tutorial grid, sau hàng đầu ===== */}
            {/* Vị trí: Inline wide banner 300×250 nằm ngay dưới lưới tutorial */}
            {/* Có thể chuyển thành native ad hoặc sponsored content sau này */}
            <div
              style={{
                marginTop: "1.5rem",
                padding: "1.25rem",
                background: "var(--color-surface-2)",
                borderRadius: "var(--radius-xl)",
                border: "1px solid var(--color-border)",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: "1rem",
                flexWrap: "wrap",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", flexShrink: 0 }}>
                <span style={{ fontSize: "1.25rem" }}>📢</span>
                <span style={{ fontSize: "0.8125rem", fontWeight: 600, color: "var(--color-text-muted)", textTransform: "uppercase", letterSpacing: "0.06em" }}>Được tài trợ</span>
              </div>
              <div style={{ flex: 1, minWidth: "200px" }}>
                <AdBanner size="inline-wide" slotId="ad-inline-tutorials" />
              </div>
            </div>
          </div>
        </section>

        {/* ===== COMMUNITY BANNER ===== */}
        <section style={{ background: "var(--color-primary-dark)", padding: "5rem 0" }}>
          <div className="container" style={{ textAlign: "center" }}>
            <div className="section-tag" style={{ background: "rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.9)", marginBottom: "1rem", display: "inline-flex" }}>
              <span>🌟</span> Cộng đồng
            </div>
            <h2 style={{ fontSize: "clamp(1.75rem, 3.5vw, 2.5rem)", fontWeight: 800, color: "white", marginBottom: "1rem", letterSpacing: "-0.01em" }}>
              Tham gia cộng đồng OriGami
            </h2>
            <p style={{ color: "rgba(255,255,255,0.7)", fontSize: "1.0625rem", maxWidth: "540px", margin: "0 auto 3rem", lineHeight: 1.7 }}>
              Chia sẻ thành quả, học hỏi từ nhau và tạo nên những kỷ niệm đặc biệt cùng gia đình qua nghệ thuật gấp giấy.
            </p>
            <div className="community-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "1.5rem", marginBottom: "3rem" }}>
              {[
                { icon: "🖼️", title: "Chia sẻ thành quả", desc: "Đăng ảnh/video những tác phẩm Origami bạn đã hoàn thành và nhận phản hồi từ cộng đồng." },
                { icon: "👥", title: "Follow nhà sáng tạo", desc: "Theo dõi các NST yêu thích và không bỏ lỡ bất kỳ bài hướng dẫn mới nào của họ." },
                { icon: "👨‍👩‍👧‍👦", title: "Dự án gia đình", desc: "Tạo dự án Origami chung cùng gia đình, cùng nhau hoàn thành từng bước và lưu giữ kỷ niệm." },
              ].map((f) => (
                <div key={f.title} style={{ background: "rgba(255,255,255,0.06)", borderRadius: "var(--radius-lg)", padding: "2rem", border: "1px solid rgba(255,255,255,0.1)", textAlign: "left" }}>
                  <div style={{ fontSize: "2rem", marginBottom: "0.875rem" }}>{f.icon}</div>
                  <h3 style={{ color: "white", fontWeight: 700, fontSize: "1.0625rem", marginBottom: "0.5rem" }}>{f.title}</h3>
                  <p style={{ color: "rgba(255,255,255,0.65)", fontSize: "0.9rem", lineHeight: 1.65 }}>{f.desc}</p>
                </div>
              ))}
            </div>
            <Link href="/dang-ky" className="btn btn-accent btn-lg">
              Tham gia ngay — Miễn phí
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
            </Link>
          </div>
        </section>

        {/* ===== AD SLOT 3: BILLBOARD — giữa Community và Featured Creators ===== */}
        {/* Vị trí chiến lược: người dùng vừa đọc xong section cộng đồng, trước khi tiếp tục cuộn */}
        {/* Billboard 970×250 — CTR cao nhất theo nghiên cứu IAB */}
        <div
          style={{
            padding: "2rem 0",
            background: "var(--color-bg)",
          }}
        >
          <div className="container">
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.75rem", opacity: 0.5 }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2" /><path d="M3 9h18" /></svg>
              <span style={{ fontSize: "0.6875rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--color-text-muted)" }}>Quảng cáo</span>
            </div>
            <AdBanner size="billboard" slotId="ad-billboard-mid" />
          </div>
        </div>

        {/* ===== FEATURED CREATORS ===== */}
        <section style={{ padding: "4rem 0", background: "var(--color-surface-2)" }}>
          <div className="container">
            <div style={{ textAlign: "center", marginBottom: "2.5rem" }}>
              <div className="section-tag" style={{ display: "inline-flex" }}><span>✨</span> Nổi bật</div>
              <h2 className="section-title">Nhà sáng tạo nổi bật</h2>
              <p className="section-subtitle">Những nhà sáng tạo được yêu thích nhất trên OriGami</p>
            </div>
            <div className="creators-grid" style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "1.25rem" }}>
              {CREATORS.map((c) => (
                <div key={c.name} className="card" style={{ padding: "1.5rem", textAlign: "center" }}>
                  <div style={{ width: "4rem", height: "4rem", borderRadius: "50%", background: c.color, display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontWeight: 800, fontSize: "1.125rem", margin: "0 auto 1rem", boxShadow: `0 4px 16px ${c.color}40` }}>
                    {c.initial}
                  </div>
                  <h3 style={{ fontWeight: 700, fontSize: "1rem", marginBottom: "0.25rem" }}>{c.name}</h3>
                  <span className="badge badge-category" style={{ marginBottom: "1rem", display: "inline-block" }}>{c.tag}</span>
                  <div style={{ display: "flex", justifyContent: "center", gap: "1.5rem", marginBottom: "1.125rem" }}>
                    <div style={{ textAlign: "center" }}>
                      <div style={{ fontWeight: 700, fontSize: "1rem", color: "var(--color-text-primary)" }}>{c.tutorials}</div>
                      <div style={{ fontSize: "0.75rem", color: "var(--color-text-muted)" }}>Bài viết</div>
                    </div>
                    <div style={{ textAlign: "center" }}>
                      <div style={{ fontWeight: 700, fontSize: "1rem", color: "var(--color-text-primary)" }}>{c.followers}</div>
                      <div style={{ fontSize: "0.75rem", color: "var(--color-text-muted)" }}>Người theo dõi</div>
                    </div>
                  </div>
                  <button className="btn btn-outline btn-sm" style={{ width: "100%" }} id={`follow-${c.name.replace(/\s/g, "-")}`}>
                    + Theo dõi
                  </button>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ===== COLLECTION CTA ===== */}
        <section style={{ padding: "4rem 0" }}>
          <div className="container">
            <div style={{ borderRadius: "var(--radius-xl)", overflow: "hidden", position: "relative", height: "320px", boxShadow: "var(--shadow-xl)" }}>
              <Image src="/origami-collection.png" alt="Bộ sưu tập Origami" fill sizes="100vw" style={{ objectFit: "cover" }} />
              <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to right, rgba(27,67,50,0.85) 0%, rgba(27,67,50,0.3) 60%, transparent 100%)", display: "flex", alignItems: "center", padding: "3rem" }}>
                <div>
                  <h2 style={{ color: "white", fontSize: "clamp(1.5rem,3vw,2.25rem)", fontWeight: 800, marginBottom: "0.75rem" }}>
                    Bộ sưu tập Origami<br />của bạn bắt đầu từ đây
                  </h2>
                  <p style={{ color: "rgba(255,255,255,0.8)", marginBottom: "1.5rem", fontSize: "1rem" }}>
                    Lưu những bài hướng dẫn yêu thích vào Wishlist cá nhân
                  </p>
                  <Link href="/dang-ky" className="btn" style={{ background: "white", color: "var(--color-primary-dark)", fontWeight: 700 }}>
                    Tạo tài khoản miễn phí
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ===== AD SLOT 4: LEADERBOARD BOTTOM — trước Footer ===== */}
        {/* Vị trí: cuối trang, người dùng vừa xem xong toàn bộ nội dung */}
        {/* Phù hợp với retargeting ads hoặc newsletter signup ads */}
        <div
          style={{
            padding: "2rem 0 1.5rem",
            background: "var(--color-surface-2)",
            borderTop: "1px solid var(--color-border)",
          }}
        >
          <div className="container" style={{ textAlign: "center" }}>
            <div style={{ marginBottom: "0.5rem", opacity: 0.45 }}>
              <span style={{ fontSize: "0.6875rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--color-text-muted)" }}>Quảng cáo</span>
            </div>
            <AdBanner size="leaderboard" slotId="ad-leaderboard-bottom" />
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
