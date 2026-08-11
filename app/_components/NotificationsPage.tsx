"use client";

import Link from "next/link";
import { useState, useEffect, useCallback } from "react";
import Navbar from "./Navbar";
import Footer from "./Footer";
import { notificationsApi } from "@/lib/api/notifications";
import type { NotificationDto } from "@/lib/api/notifications";
import { getToken } from "@/lib/auth";

type Tab = "all" | "unread" | "like" | "comment" | "follow";

const TABS: { key: Tab; label: string }[] = [
  { key: "all", label: "Tất cả" },
  { key: "unread", label: "Chưa đọc" },
  { key: "like", label: "Lượt thích" },
  { key: "comment", label: "Bình luận" },
  { key: "follow", label: "Theo dõi" },
];

function getNotifIcon(type: string): string {
  switch (type?.toLowerCase()) {
    // case "like": return "❤️";
    // case "comment": return "💬";
    // case "follow": return "👤";
    case "like":
    case "newlike": 
      return "❤️";
    case "comment":
    case "newcomment": 
      return "💬";
    case "follow":
    case "newfollower": 
      return "👤";
    case "achievement": return "🏆";
    case "vip": return "💎";
    default: return "📢";
  }
}

function getNotifColor(type: string): string {
  switch (type?.toLowerCase()) {
    case "like": return "#D4713B";
    case "comment": return "#2D6A4F";
    case "follow": return "#2C7DA0";
    case "achievement": return "#F59F00";
    case "vip": return "#D4713B";
    default: return "#6B7280";
  }
}

function getRelativeTime(dateStr: string): string {
  const date = new Date(dateStr.endsWith("Z") ? dateStr : dateStr + "Z");
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return "Vừa xong";
  if (diffMin < 60) return `${diffMin} phút trước`;
  const diffH = Math.floor(diffMin / 60);
  if (diffH < 24) return `${diffH} giờ trước`;
  const diffD = Math.floor(diffH / 24);
  if (diffD < 7) return `${diffD} ngày trước`;
  return date.toLocaleDateString("vi-VN");
}

export default function NotificationsPage() {
  const [activeTab, setActiveTab] = useState<Tab>("all");
  const [notifs, setNotifs] = useState<NotificationDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [markingAll, setMarkingAll] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadNotifications = useCallback(async (pageNum = 1) => {
    const token = getToken();
    if (!token) {
      setLoading(false);
      setError("Vui lòng đăng nhập để xem thông báo.");
      return;
    }
    try {
      setLoading(true);
      const result = await notificationsApi.getNotifications(token, { page: pageNum, pageSize: 20 });
      if (pageNum === 1) {
        setNotifs(result.items);
      } else {
        setNotifs(prev => [...prev, ...result.items]);
      }
      setTotalPages(result.totalPages);
      setPage(pageNum);
    } catch (err: unknown) {
      const apiErr = err as { message?: string };
      setError(apiErr.message ?? "Không thể tải thông báo.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadNotifications(1);
  }, [loadNotifications]);

  const filtered = notifs.filter((n) => {
    if (activeTab === "all") return true;
    if (activeTab === "unread") return !n.isRead;
    return n.type?.toLowerCase() === activeTab;
  });

  const unreadCount = notifs.filter((n) => !n.isRead).length;

  async function markAllRead() {
    const token = getToken();
    if (!token) return;
    setMarkingAll(true);
    try {
      await notificationsApi.markAllAsRead(token);
      setNotifs(prev => prev.map(n => ({ ...n, isRead: true })));
    } catch {
      // ignore
    } finally {
      setMarkingAll(false);
    }
  }

  async function markRead(id: string) {
    if (notifs.find(n => n.id === id)?.isRead) return;
    const token = getToken();
    if (!token) return;
    try {
      await notificationsApi.markAsRead(token, id);
      setNotifs(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
    } catch {
      // ignore silently
    }
  }

  // function getNotifLink(notif: NotificationDto): string {
  //   if (!notif.relatedEntityType || !notif.relatedEntityId) return "#";
  //   switch (notif.relatedEntityType) {
  //     case "Tutorial": return `/huong-dan/${notif.relatedEntityId}`;
  //     case "CommunityPost": return `/cong-dong`;
  //     case "Achievement": return `/ho-so/thanh-tich`;
  //     default: return "#";
  //   }
  // }
  function getNotifLink(notif: NotificationDto): string {
  if (!notif.relatedEntityType || !notif.relatedEntityId) return "/thong-bao";
  
  switch (notif.relatedEntityType.toLowerCase()) {
    case "tutorial":
      return `/huong-dan/${notif.relatedEntityId}`;
    case "communitypost":
      return `/cong-dong/${notif.relatedEntityId}`; // Chuyển thẳng đến bài viết cộng đồng
    case "user":
      return `/kenh/${notif.relatedEntityId}`; // Chuyển đến trang cá nhân người theo dõi
    case "achievement":
      return `/ho-so/thanh-tich`;
    default:
      return "/thong-bao";
  }
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
              <button onClick={markAllRead} disabled={markingAll}
                style={{ background: "none", border: "1.5px solid var(--color-border)", borderRadius: "var(--radius-md)", padding: "0.5rem 1rem", fontSize: "0.875rem", color: "var(--color-text-secondary)", cursor: "pointer", fontWeight: 500, opacity: markingAll ? 0.6 : 1 }}>
                {markingAll ? "Đang xử lý…" : "Đánh dấu tất cả đã đọc"}
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

          {/* Error state */}
          {error && !loading && (
            <div style={{ textAlign: "center", padding: "3rem 1rem" }}>
              <div style={{ fontSize: "3rem", marginBottom: "0.75rem" }}>⚠️</div>
              <p style={{ fontWeight: 600, color: "var(--color-text-primary)", marginBottom: "0.25rem" }}>{error}</p>
              {error.includes("đăng nhập") && (
                <Link href="/dang-nhap" className="btn btn-primary" style={{ textDecoration: "none", display: "inline-flex", marginTop: "1rem" }}>Đăng nhập</Link>
              )}
            </div>
          )}

          {/* Loading */}
          {loading && (
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              {[1, 2, 3, 4, 5].map(i => (
                <div key={i} style={{ background: "var(--color-surface)", borderRadius: "var(--radius-lg)", padding: "1.125rem 1.25rem", display: "flex", gap: "1rem", alignItems: "center", border: "1px solid var(--color-border)", animation: "pulse 1.5s ease-in-out infinite" }}>
                  <div style={{ width: "2.75rem", height: "2.75rem", borderRadius: "50%", background: "var(--color-surface-2)" }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ height: "0.875rem", background: "var(--color-surface-2)", borderRadius: "4px", width: "70%", marginBottom: "0.5rem" }} />
                    <div style={{ height: "0.75rem", background: "var(--color-surface-2)", borderRadius: "4px", width: "40%" }} />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Notifications */}
          {!loading && !error && (
            <div style={{ background: "var(--color-surface)", borderRadius: "var(--radius-xl)", border: "1px solid var(--color-border)", overflow: "hidden", boxShadow: "var(--shadow-sm)" }}>
              {filtered.length === 0 ? (
                <div style={{ textAlign: "center", padding: "3rem 1rem" }}>
                  <div style={{ fontSize: "3rem", marginBottom: "0.75rem" }}>🔔</div>
                  <p style={{ fontWeight: 600, color: "var(--color-text-primary)", marginBottom: "0.25rem" }}>Không có thông báo</p>
                  <p style={{ fontSize: "0.875rem", color: "var(--color-text-muted)" }}>Bạn đã đọc hết rồi!</p>
                </div>
              ) : (
                filtered.map((notif, i) => (
                  <Link
                    key={notif.id}
                    href={getNotifLink(notif)}
                    onClick={() => markRead(notif.id)}
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      gap: "1rem",
                      padding: "1rem 1.25rem",
                      textDecoration: "none",
                      borderBottom: i < filtered.length - 1 ? "1px solid var(--color-border)" : "none",
                      background: notif.isRead ? "transparent" : "rgba(45,106,79,0.04)",
                      transition: "var(--transition-fast)",
                    }}>
                    {/* Avatar/Icon */}
                    <div style={{ position: "relative", flexShrink: 0 }}>
                      {notif.actorName ? (
                        notif.actorAvatarUrl ? (
                          <img src={notif.actorAvatarUrl} alt={notif.actorName}
                            style={{ width: "2.75rem", height: "2.75rem", borderRadius: "50%", objectFit: "cover" }} />
                        ) : (
                          <div style={{ width: "2.75rem", height: "2.75rem", borderRadius: "50%", background: getNotifColor(notif.type), display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.0625rem", fontWeight: 700, color: "white" }}>
                            {notif.actorName.charAt(0)}
                          </div>
                        )
                      ) : (
                        <div style={{ width: "2.75rem", height: "2.75rem", borderRadius: "50%", background: `${getNotifColor(notif.type)}18`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.25rem" }}>
                          {getNotifIcon(notif.type)}
                        </div>
                      )}
                      <div style={{ position: "absolute", bottom: "-2px", right: "-2px", width: "1.25rem", height: "1.25rem", borderRadius: "50%", background: "var(--color-surface)", border: "2px solid var(--color-surface)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.65rem" }}>
                        {getNotifIcon(notif.type)}
                      </div>
                    </div>

                    {/* Text */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: "0.9rem", color: "var(--color-text-primary)", lineHeight: 1.5 }}>
                        {notif.actorName && <strong>{notif.actorName} </strong>}
                        <span style={{ color: "var(--color-text-secondary)" }}>{notif.message}</span>
                      </p>
                      {notif.subMessage && (
                        <p style={{ fontSize: "0.8125rem", color: "var(--color-text-muted)", marginTop: "0.25rem", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{notif.subMessage}</p>
                      )}
                      <p style={{ fontSize: "0.75rem", color: notif.isRead ? "var(--color-text-muted)" : "var(--color-primary)", marginTop: "0.375rem", fontWeight: notif.isRead ? 400 : 600 }}>
                        {getRelativeTime(notif.createdAt)}
                      </p>
                    </div>

                    {/* Unread dot */}
                    {!notif.isRead && (
                      <div style={{ width: "0.625rem", height: "0.625rem", borderRadius: "50%", background: "var(--color-primary)", flexShrink: 0, marginTop: "0.375rem" }} />
                    )}
                  </Link>
                ))
              )}
            </div>
          )}

          {/* Load more */}
          {!loading && !error && page < totalPages && (
            <div style={{ textAlign: "center", marginTop: "1.5rem" }}>
              <button onClick={() => loadNotifications(page + 1)}
                style={{ background: "var(--color-surface)", border: "1.5px solid var(--color-border)", borderRadius: "var(--radius-md)", padding: "0.625rem 1.5rem", fontSize: "0.9rem", color: "var(--color-text-secondary)", cursor: "pointer", fontWeight: 500 }}>
                Tải thêm
              </button>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
