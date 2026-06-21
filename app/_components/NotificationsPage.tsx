"use client";

import Link from "next/link";
import { useState } from "react";
import Navbar from "./Navbar";
import Footer from "./Footer";

type NotifType = "like" | "comment" | "follow" | "achievement" | "system" | "vip";

interface Notif {
  id: number;
  type: NotifType;
  actor: string;
  actorColor: string;
  actorIcon?: string;
  message: string;
  subMessage?: string;
  time: string;
  isRead: boolean;
  link?: string;
  emoji?: string;
}

const NOTIFS: Notif[] = [
  { id: 1, type: "like", actor: "Thu Hương", actorColor: "#D4713B", message: "đã thích bài viết của bạn", subMessage: "\"Vừa hoàn thành con rồng Origami 3D...\"", time: "2 phút trước", isRead: false, link: "/cong-dong/post-1", emoji: "❤️" },
  { id: 2, type: "comment", actor: "Quang Minh", actorColor: "#2D6A4F", message: "đã bình luận về bài viết của bạn", subMessage: "\"Tuyệt vời! Bạn mua khung gỗ ở đâu...\"", time: "15 phút trước", isRead: false, link: "/cong-dong/post-3", emoji: "💬" },
  { id: 3, type: "follow", actor: "Hoàng Nam", actorColor: "#2C7DA0", message: "đã bắt đầu theo dõi bạn", time: "1 giờ trước", isRead: false, link: "/kenh/hoangnam.origami3d", emoji: "👤" },
  { id: 4, type: "achievement", actor: "", actorColor: "#F59F00", actorIcon: "🏆", message: "Bạn đã đạt thành tựu mới!", subMessage: "Hạc giấy nghệ thuật — Hoàn thành bài hướng dẫn đầu tiên", time: "3 giờ trước", isRead: false, link: "/ho-so/thanh-tich", emoji: "🏆" },
  { id: 5, type: "like", actor: "Lan Anh", actorColor: "#9B59B6", message: "và 12 người khác đã thích bài viết của bạn", time: "5 giờ trước", isRead: true, link: "/cong-dong/post-1", emoji: "❤️" },
  { id: 6, type: "vip", actor: "", actorColor: "#D4713B", actorIcon: "💎", message: "Gói VIP của bạn sẽ hết hạn trong 3 ngày", subMessage: "Gia hạn ngay để không bị gián đoạn", time: "1 ngày trước", isRead: true, link: "/vi-vip-subscriptions", emoji: "💎" },
  { id: 7, type: "comment", actor: "Minh Tâm", actorColor: "#E03131", message: "đã trả lời bình luận của bạn", subMessage: "\"Tôi cũng đang trong hành trình 1000 hạc...\"", time: "1 ngày trước", isRead: true, link: "/cong-dong/post-3", emoji: "💬" },
  { id: 8, type: "follow", actor: "Bảo Châu", actorColor: "#F59F00", message: "đã bắt đầu theo dõi bạn", time: "2 ngày trước", isRead: true, link: "/kenh/baochau.origami", emoji: "👤" },
  { id: 9, type: "system", actor: "", actorColor: "#2C7DA0", actorIcon: "📢", message: "OriGami vừa ra mắt tính năng Journal cá nhân!", subMessage: "Ghi lại hành trình Origami của bạn với Journal mới", time: "3 ngày trước", isRead: true, emoji: "📢" },
  { id: 10, type: "achievement", actor: "", actorColor: "#F59F00", actorIcon: "⭐", message: "Bạn đạt cột mốc 10 bài hướng dẫn đã xem!", subMessage: "Bạn đang trên đường trở thành chuyên gia Origami", time: "4 ngày trước", isRead: true, link: "/ho-so/thanh-tich", emoji: "⭐" },
];

type Tab = "all" | "unread" | "likes" | "comments" | "follows";

const TABS: { key: Tab; label: string }[] = [
  { key: "all", label: "Tất cả" },
  { key: "unread", label: "Chưa đọc" },
  { key: "likes", label: "Lượt thích" },
  { key: "comments", label: "Bình luận" },
  { key: "follows", label: "Theo dõi" },
];

function filterNotifs(notifs: Notif[], tab: Tab) {
  if (tab === "all") return notifs;
  if (tab === "unread") return notifs.filter((n) => !n.isRead);
  if (tab === "likes") return notifs.filter((n) => n.type === "like");
  if (tab === "comments") return notifs.filter((n) => n.type === "comment");
  if (tab === "follows") return notifs.filter((n) => n.type === "follow");
  return notifs;
}

export default function NotificationsPage() {
  const [activeTab, setActiveTab] = useState<Tab>("all");
  const [notifs, setNotifs] = useState(NOTIFS);

  const displayed = filterNotifs(notifs, activeTab);
  const unreadCount = notifs.filter((n) => !n.isRead).length;

  function markAllRead() {
    setNotifs((prev) => prev.map((n) => ({ ...n, isRead: true })));
  }

  function markRead(id: number) {
    setNotifs((prev) => prev.map((n) => n.id === id ? { ...n, isRead: true } : n));
  }

  return (
    <>
      <Navbar />
      <main style={{ minHeight: "100vh", background: "var(--color-bg)", paddingTop: "2rem", paddingBottom: "4rem" }}>
        <div className="container-sm" style={{ maxWidth: "720px" }}>
          {/* Header */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.5rem" }}>
            <div>
              <h1 className="text-heading" style={{ fontSize: "1.75rem", color: "var(--color-text-primary)", marginBottom: "0.25rem" }}>
                Thông báo
                {unreadCount > 0 && (
                  <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: "1.75rem", height: "1.75rem", borderRadius: "50%", background: "var(--color-error)", color: "white", fontSize: "0.75rem", fontWeight: 700, marginLeft: "0.625rem", verticalAlign: "middle" }}>{unreadCount}</span>
                )}
              </h1>
              <p style={{ color: "var(--color-text-muted)", fontSize: "0.9rem" }}>Cập nhật từ cộng đồng của bạn</p>
            </div>
            {unreadCount > 0 && (
              <button onClick={markAllRead} style={{ background: "none", border: "1.5px solid var(--color-border)", borderRadius: "var(--radius-md)", padding: "0.5rem 1rem", fontSize: "0.875rem", color: "var(--color-text-secondary)", cursor: "pointer", fontWeight: 500 }}>
                Đánh dấu tất cả đã đọc
              </button>
            )}
          </div>

          {/* Tabs */}
          <div style={{ display: "flex", gap: "0", background: "var(--color-surface)", borderRadius: "var(--radius-full)", padding: "0.25rem", border: "1px solid var(--color-border)", marginBottom: "1.5rem", overflowX: "auto" }}>
            {TABS.map((tab) => {
              const count = tab.key === "unread" ? unreadCount : undefined;
              return (
                <button key={tab.key} onClick={() => setActiveTab(tab.key)}
                  style={{ padding: "0.5rem 1.125rem", borderRadius: "var(--radius-full)", border: "none", background: activeTab === tab.key ? "var(--color-primary)" : "transparent", color: activeTab === tab.key ? "white" : "var(--color-text-muted)", fontWeight: activeTab === tab.key ? 700 : 500, fontSize: "0.875rem", cursor: "pointer", whiteSpace: "nowrap", display: "flex", alignItems: "center", gap: "0.375rem" }}>
                  {tab.label}
                  {count ? <span style={{ background: "rgba(255,255,255,0.25)", borderRadius: "var(--radius-full)", padding: "0.1rem 0.4rem", fontSize: "0.7rem" }}>{count}</span> : null}
                </button>
              );
            })}
          </div>

          {/* Notifications */}
          <div style={{ background: "var(--color-surface)", borderRadius: "var(--radius-xl)", border: "1px solid var(--color-border)", overflow: "hidden", boxShadow: "var(--shadow-sm)" }}>
            {displayed.length === 0 ? (
              <div style={{ textAlign: "center", padding: "3rem 1rem" }}>
                <div style={{ fontSize: "3rem", marginBottom: "0.75rem" }}>🔔</div>
                <p style={{ fontWeight: 600, color: "var(--color-text-primary)", marginBottom: "0.25rem" }}>Không có thông báo</p>
                <p style={{ fontSize: "0.875rem", color: "var(--color-text-muted)" }}>Bạn đã đọc hết rồi!</p>
              </div>
            ) : (
              displayed.map((notif, i) => (
                <Link
                  key={notif.id}
                  href={notif.link || "#"}
                  onClick={() => markRead(notif.id)}
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: "1rem",
                    padding: "1rem 1.25rem",
                    textDecoration: "none",
                    borderBottom: i < displayed.length - 1 ? "1px solid var(--color-border)" : "none",
                    background: notif.isRead ? "transparent" : "rgba(45,106,79,0.04)",
                    transition: "var(--transition-fast)",
                  }}>
                  {/* Avatar/Icon */}
                  <div style={{ position: "relative", flexShrink: 0 }}>
                    {notif.actor ? (
                      <div style={{ width: "2.75rem", height: "2.75rem", borderRadius: "50%", background: notif.actorColor, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.0625rem", fontWeight: 700, color: "white" }}>
                        {notif.actor.charAt(0)}
                      </div>
                    ) : (
                      <div style={{ width: "2.75rem", height: "2.75rem", borderRadius: "50%", background: `${notif.actorColor}18`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.25rem" }}>
                        {notif.actorIcon}
                      </div>
                    )}
                    <div style={{ position: "absolute", bottom: "-2px", right: "-2px", width: "1.25rem", height: "1.25rem", borderRadius: "50%", background: "var(--color-surface)", border: "2px solid var(--color-surface)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.65rem" }}>
                      {notif.emoji}
                    </div>
                  </div>

                  {/* Text */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: "0.9rem", color: "var(--color-text-primary)", lineHeight: 1.5 }}>
                      {notif.actor && <strong>{notif.actor} </strong>}
                      <span style={{ color: "var(--color-text-secondary)" }}>{notif.message}</span>
                    </p>
                    {notif.subMessage && (
                      <p style={{ fontSize: "0.8125rem", color: "var(--color-text-muted)", marginTop: "0.25rem", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{notif.subMessage}</p>
                    )}
                    <p style={{ fontSize: "0.75rem", color: notif.isRead ? "var(--color-text-muted)" : "var(--color-primary)", marginTop: "0.375rem", fontWeight: notif.isRead ? 400 : 600 }}>{notif.time}</p>
                  </div>

                  {/* Unread dot */}
                  {!notif.isRead && (
                    <div style={{ width: "0.625rem", height: "0.625rem", borderRadius: "50%", background: "var(--color-primary)", flexShrink: 0, marginTop: "0.375rem" }} />
                  )}
                </Link>
              ))
            )}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
