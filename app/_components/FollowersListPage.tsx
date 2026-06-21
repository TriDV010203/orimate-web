"use client";

import Link from "next/link";
import { useState } from "react";
import Navbar from "./Navbar";
import Footer from "./Footer";

const FOLLOWERS = [
  { id: "minhtam.fold", name: "Minh Tâm", username: "@minhtam.fold", color: "#E03131", tutorials: 19, followers: "4.1K", bio: "Modular Origami & Kirigami", isFollowingBack: true, joinedAt: "2 tháng trước" },
  { id: "baochau.origami", name: "Bảo Châu", username: "@baochau.origami", color: "#F59F00", tutorials: 14, followers: "2.8K", bio: "Origami truyền thống Nhật Bản", isFollowingBack: false, joinedAt: "3 tháng trước" },
  { id: "trangnt.craft", name: "Trang Ngọc", username: "@trangnt.craft", color: "#1098AD", tutorials: 8, followers: "1.2K", bio: "Đam mê Origami từ năm 2024", isFollowingBack: false, joinedAt: "4 tháng trước" },
  { id: "dungpv.origami", name: "Dũng Phạm", username: "@dungpv.origami", color: "#A9E34B", tutorials: 5, followers: "890", bio: "Người mới bắt đầu học Origami", isFollowingBack: true, joinedAt: "5 tháng trước" },
  { id: "mainh.paper", name: "Mai Nhung", username: "@mainh.paper", color: "#FF6B6B", tutorials: 12, followers: "3.4K", bio: "Hoa giấy & trang trí sự kiện", isFollowingBack: false, joinedAt: "6 tháng trước" },
  { id: "sonth.art", name: "Sơn Tùng", username: "@sonth.art", color: "#74C0FC", tutorials: 23, followers: "5.7K", bio: "Kirigami & Paper Art", isFollowingBack: false, joinedAt: "7 tháng trước" },
  { id: "hanglt.origami", name: "Hằng Lê", username: "@hanglt.origami", color: "#9B59B6", tutorials: 7, followers: "1.9K", bio: "Học Origami cùng con", isFollowingBack: true, joinedAt: "8 tháng trước" },
];

export default function FollowersListPage() {
  const [followingBack, setFollowingBack] = useState(
    FOLLOWERS.filter((f) => f.isFollowingBack).map((f) => f.id)
  );
  const [search, setSearch] = useState("");

  const filtered = FOLLOWERS.filter((u) => {
    if (search && !u.name.toLowerCase().includes(search.toLowerCase()) && !u.username.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  function toggleFollow(id: string) {
    setFollowingBack((prev) => prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id]);
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
            <span style={{ color: "var(--color-text-primary)", fontWeight: 500 }}>Người theo dõi</span>
          </div>

          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.5rem" }}>
            <div>
              <h1 className="text-heading" style={{ fontSize: "1.75rem", color: "var(--color-text-primary)", marginBottom: "0.25rem" }}>
                Người theo dõi
              </h1>
              <p style={{ color: "var(--color-text-muted)", fontSize: "0.9rem" }}>{FOLLOWERS.length} người đang theo dõi bạn</p>
            </div>
            <Link href="/ho-so/dang-theo-doi" style={{ color: "var(--color-primary)", fontWeight: 600, fontSize: "0.875rem", textDecoration: "none" }}>
              Đang theo dõi →
            </Link>
          </div>

          {/* Search */}
          <div style={{ position: "relative", marginBottom: "1.5rem" }}>
            <svg style={{ position: "absolute", left: "1rem", top: "50%", transform: "translateY(-50%)", color: "var(--color-text-muted)" }} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" /></svg>
            <input type="text" placeholder="Tìm kiếm người theo dõi..." value={search} onChange={(e) => setSearch(e.target.value)}
              style={{ width: "100%", padding: "0.75rem 1rem 0.75rem 2.75rem", borderRadius: "var(--radius-full)", border: "1.5px solid var(--color-border)", background: "var(--color-surface)", fontSize: "0.9375rem", outline: "none" }} />
          </div>

          {/* List */}
          <div style={{ background: "var(--color-surface)", borderRadius: "var(--radius-xl)", border: "1px solid var(--color-border)", overflow: "hidden", boxShadow: "var(--shadow-sm)" }}>
            {filtered.length === 0 ? (
              <div style={{ textAlign: "center", padding: "3rem 1rem" }}>
                <div style={{ fontSize: "3rem", marginBottom: "0.75rem" }}>👤</div>
                <p style={{ fontWeight: 600, color: "var(--color-text-primary)" }}>Chưa có người theo dõi</p>
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
                    <Link href={`/kenh/${user.id}`} style={{ fontWeight: 700, fontSize: "0.9375rem", color: "var(--color-text-primary)", textDecoration: "none", display: "block", marginBottom: "0.125rem" }}>{user.name}</Link>
                    <p style={{ fontSize: "0.8rem", color: "var(--color-text-muted)", marginBottom: "0.125rem" }}>{user.username}</p>
                    <p style={{ fontSize: "0.8125rem", color: "var(--color-text-secondary)" }}>{user.bio}</p>
                    <p style={{ fontSize: "0.75rem", color: "var(--color-text-muted)", marginTop: "0.125rem" }}>
                      {user.tutorials} bài · {user.followers} người theo dõi · Theo dõi bạn từ {user.joinedAt}
                    </p>
                  </div>
                  <button onClick={() => toggleFollow(user.id)}
                    className={followingBack.includes(user.id) ? "btn btn-outline" : "btn btn-primary"}
                    style={{ padding: "0.375rem 1rem", fontSize: "0.8125rem", flexShrink: 0 }}>
                    {followingBack.includes(user.id) ? "✓ Theo dõi lại" : "+ Theo dõi lại"}
                  </button>
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
