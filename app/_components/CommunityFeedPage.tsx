"use client";

import Link from "next/link";
import { useState } from "react";
import Navbar from "./Navbar";
import Footer from "./Footer";

const TRENDING_TAGS = ["#OrigamiViệtNam", "#HạcGiấy", "#Origami3D", "#TrẻEm", "#ModularOrigami", "#HoaGiấy", "#NghệThuậtGấp"];

const POSTS = [
  {
    id: "post-1",
    author: "Quang Minh",
    authorColor: "#2D6A4F",
    username: "@quangminh_origami",
    time: "2 giờ trước",
    content: "Vừa hoàn thành con rồng Origami 3D sau 3 tuần thực hành! 🐉 Gồm 28 bước, mỗi chi tiết đều được xếp tay từng tờ giấy. Cảm giác đạt được thành tựu này thật tuyệt vời!",
    image: "🐉",
    imageColor: "#F0F0FF",
    tutorialRef: { title: "Rồng Origami 3D", id: "rong-origami-3d" },
    likes: 234,
    comments: 42,
    shares: 18,
    tags: ["#Origami3D", "#RồngGiấy", "#ThànhTựu"],
    isLiked: false,
    isSaved: false,
  },
  {
    id: "post-2",
    author: "Thu Hương",
    authorColor: "#D4713B",
    username: "@thunguyen.craft",
    time: "5 giờ trước",
    content: "Workshop gấp hoa sen cho các em nhỏ hôm nay thật vui! 🌸 Các em rất chăm chỉ và sáng tạo. Ai muốn tham gia workshop lần sau thì đăng ký nhé!",
    image: "🌸",
    imageColor: "#FFF0F5",
    tutorialRef: null,
    likes: 189,
    comments: 67,
    shares: 25,
    tags: ["#Workshop", "#HoaSen", "#TrẻEm"],
    isLiked: true,
    isSaved: false,
  },
  {
    id: "post-3",
    author: "Hoàng Nam",
    authorColor: "#2C7DA0",
    username: "@hoangnam.origami3d",
    time: "1 ngày trước",
    content: "Bộ sưu tập 1000 con hạc giấy của tôi sau 6 tháng kiên trì! 🦢✨ Mỗi con hạc mang một ước nguyện. Theo truyền thuyết Nhật Bản, ai gấp được 1000 con hạc sẽ được một điều ước. Bạn muốn ước điều gì?",
    image: "🦢",
    imageColor: "#E8F5E8",
    tutorialRef: { title: "Hạc giấy nghệ thuật", id: "hac-giay-nghe-thuat" },
    likes: 512,
    comments: 93,
    shares: 47,
    tags: ["#1000HạcGiấy", "#SenNhặt", "#Origami"],
    isLiked: false,
    isSaved: true,
  },
  {
    id: "post-4",
    author: "Lan Anh",
    authorColor: "#9B59B6",
    username: "@lananh.papercraft",
    time: "2 ngày trước",
    content: "Tip nhỏ cho người mới: Khi gấp giấy hãy đảm bảo mỗi nếp gấp thật thẳng và sắc nét. Dùng móng tay hoặc xương gấp để nhấn đường gấp sẽ cho kết quả đẹp hơn nhiều nhé! 💡",
    image: "💡",
    imageColor: "#FFFBF0",
    tutorialRef: null,
    likes: 345,
    comments: 28,
    shares: 89,
    tags: ["#Tips", "#NhậpMôn", "#OrigamiTips"],
    isLiked: false,
    isSaved: false,
  },
  {
    id: "post-5",
    author: "Minh Tâm",
    authorColor: "#E03131",
    username: "@minhtam.fold",
    time: "3 ngày trước",
    content: "Tác phẩm mới: Đình làng Việt Nam thu nhỏ từ giấy! 🏯 Mất gần 2 tháng để hoàn thành. Gồm hơn 500 chi tiết modular ghép lại. Đây là niềm tự hào lớn nhất của tôi trong hành trình Origami.",
    image: "🏯",
    imageColor: "#FFF5F5",
    tutorialRef: null,
    likes: 891,
    comments: 156,
    shares: 203,
    tags: ["#ModularOrigami", "#ĐìnhLàng", "#NghệThuật"],
    isLiked: true,
    isSaved: false,
  },
];

const COMMUNITY_STATS = [
  { label: "Thành viên", value: "52.4K" },
  { label: "Bài đăng hôm nay", value: "847" },
  { label: "Đang online", value: "1.2K" },
];

function PostCard({ post }: { post: typeof POSTS[0] }) {
  const [liked, setLiked] = useState(post.isLiked);
  const [saved, setSaved] = useState(post.isSaved);
  const [likeCount, setLikeCount] = useState(post.likes);

  function handleLike() {
    setLiked((v) => !v);
    setLikeCount((c) => liked ? c - 1 : c + 1);
  }

  return (
    <article style={{ background: "var(--color-surface)", borderRadius: "var(--radius-lg)", border: "1px solid var(--color-border)", boxShadow: "var(--shadow-sm)", overflow: "hidden", transition: "var(--transition-normal)" }}>
      {/* Header */}
      <div style={{ padding: "1.125rem 1.25rem 0.75rem", display: "flex", alignItems: "center", gap: "0.75rem" }}>
        <Link href={`/kenh/${post.username.replace("@", "")}`}>
          <div style={{ width: "2.5rem", height: "2.5rem", borderRadius: "50%", background: post.authorColor, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1rem", fontWeight: 700, color: "white", flexShrink: 0, textDecoration: "none" }}>
            {post.author.charAt(0)}
          </div>
        </Link>
        <div style={{ flex: 1 }}>
          <Link href={`/kenh/${post.username.replace("@", "")}`} style={{ textDecoration: "none" }}>
            <span style={{ fontWeight: 700, fontSize: "0.9375rem", color: "var(--color-text-primary)" }}>{post.author}</span>
          </Link>
          <div style={{ fontSize: "0.8rem", color: "var(--color-text-muted)" }}>{post.username} · {post.time}</div>
        </div>
        <button style={{ background: "none", border: "none", cursor: "pointer", color: "var(--color-text-muted)", padding: "0.25rem" }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="5" r="1" /><circle cx="12" cy="12" r="1" /><circle cx="12" cy="19" r="1" /></svg>
        </button>
      </div>

      {/* Content */}
      <div style={{ padding: "0 1.25rem 0.875rem" }}>
        <p style={{ fontSize: "0.9375rem", color: "var(--color-text-primary)", lineHeight: 1.65, marginBottom: "0.75rem" }}>{post.content}</p>
        {post.tags.map((tag) => (
          <Link key={tag} href={`/tim-kiem?q=${encodeURIComponent(tag)}`} style={{ display: "inline-block", fontSize: "0.8125rem", color: "var(--color-primary)", fontWeight: 500, marginRight: "0.5rem", textDecoration: "none" }}>{tag}</Link>
        ))}
      </div>

      {/* Image placeholder */}
      <div style={{ background: post.imageColor, display: "flex", alignItems: "center", justifyContent: "center", height: "220px", fontSize: "5rem", position: "relative" }}>
        {post.image}
        {post.tutorialRef && (
          <Link href={`/huong-dan/${post.tutorialRef.id}`} style={{ position: "absolute", bottom: "0.75rem", left: "0.75rem", background: "rgba(45,106,79,0.92)", color: "white", padding: "0.375rem 0.875rem", borderRadius: "var(--radius-full)", fontSize: "0.8125rem", fontWeight: 600, textDecoration: "none", display: "flex", alignItems: "center", gap: "0.375rem", backdropFilter: "blur(4px)" }}>
            📌 {post.tutorialRef.title}
          </Link>
        )}
      </div>

      {/* Actions */}
      <div style={{ padding: "0.875rem 1.25rem", display: "flex", alignItems: "center", gap: "0.25rem", borderTop: "1px solid var(--color-border)" }}>
        <button onClick={handleLike} style={{ display: "flex", alignItems: "center", gap: "0.375rem", background: "none", border: "none", cursor: "pointer", padding: "0.5rem 0.875rem", borderRadius: "var(--radius-md)", color: liked ? "var(--color-error)" : "var(--color-text-muted)", fontWeight: 500, fontSize: "0.875rem", transition: "var(--transition-fast)" }}>
          <svg width="17" height="17" viewBox="0 0 24 24" fill={liked ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" /></svg>
          {likeCount}
        </button>
        <Link href={`/cong-dong/${post.id}`} style={{ display: "flex", alignItems: "center", gap: "0.375rem", background: "none", border: "none", cursor: "pointer", padding: "0.5rem 0.875rem", borderRadius: "var(--radius-md)", color: "var(--color-text-muted)", fontWeight: 500, fontSize: "0.875rem", textDecoration: "none" }}>
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>
          {post.comments}
        </Link>
        <button style={{ display: "flex", alignItems: "center", gap: "0.375rem", background: "none", border: "none", cursor: "pointer", padding: "0.5rem 0.875rem", borderRadius: "var(--radius-md)", color: "var(--color-text-muted)", fontWeight: 500, fontSize: "0.875rem" }}>
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" /><line x1="8.59" y1="13.51" x2="15.42" y2="17.49" /><line x1="15.41" y1="6.51" x2="8.59" y2="10.49" /></svg>
          {post.shares}
        </button>
        <button onClick={() => setSaved((v) => !v)} style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: "0.375rem", background: "none", border: "none", cursor: "pointer", padding: "0.5rem 0.875rem", borderRadius: "var(--radius-md)", color: saved ? "var(--color-accent)" : "var(--color-text-muted)", fontWeight: 500, fontSize: "0.875rem" }}>
          <svg width="17" height="17" viewBox="0 0 24 24" fill={saved ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2"><path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z" /></svg>
        </button>
      </div>
    </article>
  );
}

export default function CommunityFeedPage() {
  const [activeTab, setActiveTab] = useState<"hot" | "new" | "following">("hot");

  return (
    <>
      <Navbar />
      <main style={{ minHeight: "100vh", background: "var(--color-bg)", paddingTop: "1.5rem", paddingBottom: "4rem" }}>
        <div className="container">
          <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: "2rem", alignItems: "start" }}>

            {/* ── Main Feed ── */}
            <div>
              {/* Header */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.5rem" }}>
                <div>
                  <h1 className="text-heading" style={{ fontSize: "1.625rem", color: "var(--color-text-primary)", marginBottom: "0.25rem" }}>Cộng đồng 🌿</h1>
                  <p style={{ color: "var(--color-text-muted)", fontSize: "0.9375rem" }}>Chia sẻ tác phẩm và kết nối với cộng đồng Origami</p>
                </div>
                <Link href="/cong-dong/tao-bai" className="btn btn-primary" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
                  Tạo bài viết
                </Link>
              </div>

              {/* Tabs */}
              <div style={{ display: "flex", gap: "0", background: "var(--color-surface)", borderRadius: "var(--radius-full)", padding: "0.25rem", border: "1px solid var(--color-border)", marginBottom: "1.5rem", width: "fit-content" }}>
                {([["hot", "🔥 Nổi bật"], ["new", "✨ Mới nhất"], ["following", "👥 Đang theo dõi"]] as const).map(([key, label]) => (
                  <button key={key} onClick={() => setActiveTab(key)}
                    style={{ padding: "0.5rem 1.25rem", borderRadius: "var(--radius-full)", border: "none", background: activeTab === key ? "var(--color-primary)" : "transparent", color: activeTab === key ? "white" : "var(--color-text-muted)", fontWeight: 600, fontSize: "0.875rem", cursor: "pointer", transition: "var(--transition-fast)" }}>
                    {label}
                  </button>
                ))}
              </div>

              {/* Post Composer Mini */}
              <div style={{ background: "var(--color-surface)", borderRadius: "var(--radius-lg)", border: "1px solid var(--color-border)", padding: "1rem 1.25rem", marginBottom: "1.25rem", display: "flex", alignItems: "center", gap: "0.875rem", boxShadow: "var(--shadow-xs)" }}>
                <div style={{ width: "2.5rem", height: "2.5rem", borderRadius: "50%", background: "var(--gradient-primary)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, color: "white", flexShrink: 0, fontSize: "1rem" }}>U</div>
                <Link href="/cong-dong/tao-bai" style={{ flex: 1, padding: "0.625rem 1rem", background: "var(--color-surface-2)", borderRadius: "var(--radius-full)", color: "var(--color-text-muted)", fontSize: "0.9375rem", cursor: "text", textDecoration: "none", display: "block" }}>
                  Chia sẻ tác phẩm Origami của bạn...
                </Link>
                <Link href="/cong-dong/tao-bai" style={{ padding: "0.5rem", borderRadius: "var(--radius-md)", color: "var(--color-primary)", background: "rgba(45,106,79,0.06)", display: "flex", textDecoration: "none" }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21 15 16 10 5 21" /></svg>
                </Link>
              </div>

              {/* Feed */}
              <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
                {POSTS.map((post) => <PostCard key={post.id} post={post} />)}
              </div>

              {/* Load more */}
              <div style={{ textAlign: "center", marginTop: "2rem" }}>
                <button className="btn btn-outline" style={{ padding: "0.75rem 2.5rem" }}>Xem thêm bài viết</button>
              </div>
            </div>

            {/* ── Sidebar ── */}
            <aside style={{ position: "sticky", top: "5rem", display: "flex", flexDirection: "column", gap: "1.25rem" }}>

              {/* Community Stats */}
              <div style={{ background: "var(--color-surface)", borderRadius: "var(--radius-lg)", border: "1px solid var(--color-border)", padding: "1.25rem", boxShadow: "var(--shadow-sm)" }}>
                <h3 style={{ fontWeight: 700, fontSize: "1rem", color: "var(--color-text-primary)", marginBottom: "1rem" }}>📊 Thống kê cộng đồng</h3>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                  {COMMUNITY_STATS.map((stat) => (
                    <div key={stat.label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ fontSize: "0.875rem", color: "var(--color-text-secondary)" }}>{stat.label}</span>
                      <span style={{ fontWeight: 700, color: "var(--color-primary)", fontSize: "1rem" }}>{stat.value}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Trending Tags */}
              <div style={{ background: "var(--color-surface)", borderRadius: "var(--radius-lg)", border: "1px solid var(--color-border)", padding: "1.25rem", boxShadow: "var(--shadow-sm)" }}>
                <h3 style={{ fontWeight: 700, fontSize: "1rem", color: "var(--color-text-primary)", marginBottom: "1rem" }}>🔥 Chủ đề hot</h3>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                  {TRENDING_TAGS.map((tag, i) => (
                    <Link key={tag} href={`/tim-kiem?q=${encodeURIComponent(tag)}`} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0.5rem 0", borderBottom: i < TRENDING_TAGS.length - 1 ? "1px solid var(--color-border)" : "none", textDecoration: "none" }}>
                      <span style={{ fontSize: "0.875rem", color: "var(--color-primary)", fontWeight: 500 }}>{tag}</span>
                      <span style={{ fontSize: "0.75rem", color: "var(--color-text-muted)" }}>{Math.floor(Math.random() * 400 + 50)} bài</span>
                    </Link>
                  ))}
                </div>
              </div>

              {/* Suggested Creators */}
              <div style={{ background: "var(--color-surface)", borderRadius: "var(--radius-lg)", border: "1px solid var(--color-border)", padding: "1.25rem", boxShadow: "var(--shadow-sm)" }}>
                <h3 style={{ fontWeight: 700, fontSize: "1rem", color: "var(--color-text-primary)", marginBottom: "1rem" }}>👥 Gợi ý theo dõi</h3>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.875rem" }}>
                  {[
                    { name: "Quang Minh", username: "@quangminh_origami", followers: "12.4K", color: "#2D6A4F" },
                    { name: "Thu Hương", username: "@thunguyen.craft", followers: "8.7K", color: "#D4713B" },
                    { name: "Hoàng Nam", username: "@hoangnam.origami3d", followers: "21.3K", color: "#2C7DA0" },
                  ].map((creator) => (
                    <div key={creator.username} style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                      <div style={{ width: "2.25rem", height: "2.25rem", borderRadius: "50%", background: creator.color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.875rem", fontWeight: 700, color: "white", flexShrink: 0 }}>
                        {creator.name.charAt(0)}
                      </div>
                      <div style={{ flex: 1 }}>
                        <Link href={`/kenh/${creator.username.replace("@", "")}`} style={{ fontWeight: 600, fontSize: "0.875rem", color: "var(--color-text-primary)", textDecoration: "none", display: "block" }}>{creator.name}</Link>
                        <span style={{ fontSize: "0.75rem", color: "var(--color-text-muted)" }}>{creator.followers} người theo dõi</span>
                      </div>
                      <button className="btn btn-outline" style={{ padding: "0.25rem 0.75rem", fontSize: "0.75rem", flexShrink: 0 }}>Theo dõi</button>
                    </div>
                  ))}
                </div>
              </div>

            </aside>
          </div>
        </div>
      </main>
      <Footer />

      <style>{`
        @media (max-width: 900px) {
          .container > div { grid-template-columns: 1fr !important; }
          aside { position: static !important; }
        }
      `}</style>
    </>
  );
}
