"use client";

import Link from "next/link";
import { useState } from "react";
import Navbar from "./Navbar";
import Footer from "./Footer";

const FOLLOWING = [
  { id: "quangminh_origami", name: "Quang Minh", username: "@quangminh_origami", color: "#2D6A4F", tutorials: 48, followers: "12.4K", bio: "Origami 3D & Modular", isVip: true, isVerified: true, followedAt: "3 tháng trước" },
  { id: "thunguyen.craft", name: "Thu Hương", username: "@thunguyen.craft", color: "#D4713B", tutorials: 32, followers: "8.7K", bio: "Hoa & Nghệ thuật giấy", isVip: false, isVerified: true, followedAt: "5 tháng trước" },
  { id: "hoangnam.origami3d", name: "Hoàng Nam", username: "@hoangnam.origami3d", color: "#2C7DA0", tutorials: 61, followers: "21.3K", bio: "Chuyên gia Origami 3D phức tạp", isVip: true, isVerified: false, followedAt: "6 tháng trước" },
  { id: "lananh.papercraft", name: "Lan Anh", username: "@lananh.papercraft", color: "#9B59B6", tutorials: 27, followers: "6.2K", bio: "Origami cho trẻ em & người mới", isVip: false, isVerified: false, followedAt: "8 tháng trước" },
  { id: "minhtam.fold", name: "Minh Tâm", username: "@minhtam.fold", color: "#E03131", tutorials: 19, followers: "4.1K", bio: "Modular Origami & Kirigami", isVip: false, isVerified: false, followedAt: "1 năm trước" },
  { id: "baochau.origami", name: "Bảo Châu", username: "@baochau.origami", color: "#F59F00", tutorials: 14, followers: "2.8K", bio: "Origami truyền thống Nhật Bản", isVip: false, isVerified: false, followedAt: "1 năm trước" },
];

export default function FollowingListPage() {
  const [following, setFollowing] = useState(FOLLOWING.map((u) => u.id));
  const [search, setSearch] = useState("");

  const filtered = FOLLOWING.filter((u) => {
    if (!following.includes(u.id)) return false;
    if (search && !u.name.toLowerCase().includes(search.toLowerCase()) && !u.username.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  function unfollow(id: string) {
    setFollowing((prev) => prev.filter((f) => f !== id));
  }

  return (
    <>
      <Navbar />
      <main style={{ minHeight: "100vh", background: "var(--color-bg)", paddingTop: "2rem", paddingBottom: "4rem" }}>
        <div className="container-sm" style={{ maxWidth: "720px" }}>

          {/* Breadcrumb */}
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1.25rem", fontSize: "0.875rem", color: "var(--color-text-muted)" }}>
            <Link href="/ho-so" style={{ color: "var(--color-text-muted)", textDecoration: "none" }}>Trang cá nhân</Link>
            <span>/</span>
            <span style={{ color: "var(--color-text-primary)", fontWeight: 500 }}>Đang theo dõi</span>
          </div>

          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.5rem" }}>
            <div>
              <h1 className="text-heading" style={{ fontSize: "1.75rem", color: "var(--color-text-primary)", marginBottom: "0.25rem" }}>
                Đang theo dõi
              </h1>
              <p style={{ color: "var(--color-text-muted)", fontSize: "0.9rem" }}>{following.length} người bạn đang theo dõi</p>
            </div>
            <Link href="/ho-so/nguoi-theo-doi" style={{ color: "var(--color-primary)", fontWeight: 600, fontSize: "0.875rem", textDecoration: "none" }}>
              Xem người theo dõi →
            </Link>
          </div>

          {/* Search */}
          <div style={{ position: "relative", marginBottom: "1.5rem" }}>
            <svg style={{ position: "absolute", left: "1rem", top: "50%", transform: "translateY(-50%)", color: "var(--color-text-muted)" }} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" /></svg>
            <input type="text" placeholder="Tìm kiếm..." value={search} onChange={(e) => setSearch(e.target.value)}
              style={{ width: "100%", padding: "0.75rem 1rem 0.75rem 2.75rem", borderRadius: "var(--radius-full)", border: "1.5px solid var(--color-border)", background: "var(--color-surface)", fontSize: "0.9375rem", outline: "none" }} />
          </div>

          {/* List */}
          <div style={{ background: "var(--color-surface)", borderRadius: "var(--radius-xl)", border: "1px solid var(--color-border)", overflow: "hidden", boxShadow: "var(--shadow-sm)" }}>
            {filtered.length === 0 ? (
              <div style={{ textAlign: "center", padding: "3rem 1rem" }}>
                <div style={{ fontSize: "3rem", marginBottom: "0.75rem" }}>👥</div>
                <p style={{ fontWeight: 600, color: "var(--color-text-primary)", marginBottom: "0.25rem" }}>
                  {search ? "Không tìm thấy" : "Chưa theo dõi ai"}
                </p>
                <p style={{ fontSize: "0.875rem", color: "var(--color-text-muted)" }}>
                  {search ? "Thử từ khóa khác" : "Khám phá các creator Origami tài năng"}
                </p>
                {!search && (
                  <Link href="/huong-dan" className="btn btn-primary" style={{ textDecoration: "none", display: "inline-flex", marginTop: "1rem" }}>Khám phá</Link>
                )}
              </div>
            ) : (
              filtered.map((user, i) => (
                <div key={user.id} style={{ display: "flex", alignItems: "center", gap: "1rem", padding: "1rem 1.25rem", borderBottom: i < filtered.length - 1 ? "1px solid var(--color-border)" : "none" }}>
                  <Link href={`/kenh/${user.id}`} style={{ textDecoration: "none", flexShrink: 0 }}>
                    <div style={{ width: "3rem", height: "3rem", borderRadius: "50%", background: user.color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.125rem", fontWeight: 700, color: "white" }}>
                      {user.name.charAt(0)}
                    </div>
                  </Link>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.375rem", flexWrap: "wrap", marginBottom: "0.125rem" }}>
                      <Link href={`/kenh/${user.id}`} style={{ fontWeight: 700, fontSize: "0.9375rem", color: "var(--color-text-primary)", textDecoration: "none" }}>{user.name}</Link>
                      {user.isVerified && <span title="Đã xác minh" style={{ fontSize: "0.875rem" }}>⭐</span>}
                      {user.isVip && <span className="badge badge-vip" style={{ fontSize: "0.65rem" }}>VIP</span>}
                    </div>
                    <p style={{ fontSize: "0.8rem", color: "var(--color-text-muted)", marginBottom: "0.125rem" }}>{user.username}</p>
                    <p style={{ fontSize: "0.8125rem", color: "var(--color-text-secondary)" }}>{user.bio}</p>
                    <p style={{ fontSize: "0.75rem", color: "var(--color-text-muted)", marginTop: "0.125rem" }}>
                      {user.tutorials} bài · {user.followers} người theo dõi · Đã theo dõi {user.followedAt}
                    </p>
                  </div>
                  <div style={{ display: "flex", gap: "0.5rem", flexShrink: 0 }}>
                    <Link href={`/kenh/${user.id}`} className="btn btn-outline" style={{ padding: "0.375rem 0.875rem", fontSize: "0.8125rem", textDecoration: "none" }}>Xem kênh</Link>
                    <button onClick={() => unfollow(user.id)}
                      style={{ padding: "0.375rem 0.875rem", fontSize: "0.8125rem", border: "1.5px solid var(--color-border)", borderRadius: "var(--radius-full)", background: "transparent", color: "var(--color-text-muted)", cursor: "pointer", fontWeight: 500 }}>
                      Bỏ theo dõi
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
