"use client";

import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { notificationsApi, type NotificationDto } from "@/lib/api/notifications";
import { getToken, isLoggedIn } from "@/lib/auth";
import { Check } from "lucide-react";

// ── Hàm tiện ích (Đồng bộ với NotificationsPage) ──
function getNotifIcon(type: string): string {
  switch (type?.toLowerCase()) {
    case "like": return "❤️";
    case "comment": return "💬";
    case "follow": return "👤";
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

function getNotifLink(notif: NotificationDto): string {
  if (!notif.relatedEntityType || !notif.relatedEntityId) return "#";
  switch (notif.relatedEntityType) {
    case "Tutorial": return `/huong-dan/${notif.relatedEntityId}`;
    case "CommunityPost": return `/cong-dong`;
    case "Achievement": return `/ho-so/thanh-tich`;
    default: return "#";
  }
}

// ── Component Chính ──
export default function NotificationPopover({ className = "btn btn-ghost btn-sm" }: { className?: string }) {
  const qc = useQueryClient();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const token = getToken();
  const isAuth = isLoggedIn();

  // Đóng khi click ngoài vùng Popover
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Lấy 5 thông báo mới nhất
  const { data, isLoading } = useQuery({
    queryKey: ["notifications", "popover"],
    queryFn: () => notificationsApi.getNotifications(token!, { page: 1, pageSize: 5 }),
    enabled: isAuth && !!token,
    refetchInterval: 30000, // Tự động làm mới mỗi 30s
  });

  const notifications = data?.items || [];
  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const markAsReadMut = useMutation({
    mutationFn: (id: string) => notificationsApi.markAsRead(token!, id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["notifications"] }),
  });

  const markAllReadMut = useMutation({
    mutationFn: () => notificationsApi.markAllAsRead(token!),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["notifications"] }),
  });

  if (!isAuth) return null;

  return (
    <div ref={menuRef} style={{ position: "relative" }}>
      {/* Nút Chuông */}
      <button
        id="nav-notif-btn"
        className={className}
        onClick={() => setIsOpen(!isOpen)}
        style={{ borderRadius: "50%", padding: "0.5rem", position: "relative" }}
        aria-label="Thông báo"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.73 21a2 2 0 0 1-3.46 0" />
        </svg>
        {unreadCount > 0 && (
          <span style={{
            position: "absolute", top: "4px", right: "6px", width: "8px", height: "8px",
            background: "#E03131", borderRadius: "50%", border: "2px solid var(--color-surface, white)"
          }} />
        )}
      </button>

      {/* Box Popover */}
      {isOpen && (
        <div style={{
          position: "absolute", top: "calc(100% + 0.625rem)", right: 0,
          background: "var(--color-surface)", border: "1px solid var(--color-border)",
          borderRadius: "var(--radius-lg)", boxShadow: "var(--shadow-xl)",
          width: "340px", zIndex: 200, animation: "fadeIn 0.15s ease",
          display: "flex", flexDirection: "column"
        }}>
          {/* Header */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "1rem", borderBottom: "1px solid var(--color-border)", background: "var(--color-surface-2)" }}>
            <h3 style={{ fontSize: "0.9375rem", fontWeight: 700, margin: 0, color: "var(--color-text-primary)" }}>Thông báo</h3>
            {unreadCount > 0 && (
              <button 
                onClick={() => markAllReadMut.mutate()} 
                style={{ background: "none", border: "none", color: "var(--color-primary)", fontSize: "0.75rem", fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: "0.25rem" }}
              >
                <Check size={14} /> Đánh dấu đã đọc
              </button>
            )}
          </div>

          {/* Danh sách */}
          <div style={{ maxHeight: "360px", overflowY: "auto" }}>
            {isLoading ? (
              <div style={{ padding: "2rem", textAlign: "center", color: "var(--color-text-muted)", fontSize: "0.875rem" }}>Đang tải...</div>
            ) : notifications.length === 0 ? (
              <div style={{ padding: "2rem", textAlign: "center", color: "var(--color-text-muted)", fontSize: "0.875rem" }}>Bạn chưa có thông báo nào.</div>
            ) : (
              notifications.map((n) => (
                <div 
                  key={n.id}
                  onClick={() => {
                    if (!n.isRead) markAsReadMut.mutate(n.id);
                    setIsOpen(false);
                    const link = getNotifLink(n);
                    if (link !== "#") router.push(link);
                  }}
                  style={{
                    display: "flex", gap: "0.75rem", padding: "1rem", cursor: "pointer",
                    background: n.isRead ? "transparent" : "rgba(45,106,79,0.04)",
                    borderBottom: "1px solid var(--color-border)", transition: "background 0.2s"
                  }}
                >
                  <div style={{ position: "relative", flexShrink: 0 }}>
                    {n.actorName ? (
                      n.actorAvatarUrl ? (
                        <img src={n.actorAvatarUrl} alt="" style={{ width: "2.5rem", height: "2.5rem", borderRadius: "50%", objectFit: "cover" }} />
                      ) : (
                        <div style={{ width: "2.5rem", height: "2.5rem", borderRadius: "50%", background: getNotifColor(n.type), display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1rem", fontWeight: 700, color: "white" }}>
                          {n.actorName.charAt(0).toUpperCase()}
                        </div>
                      )
                    ) : (
                      <div style={{ width: "2.5rem", height: "2.5rem", borderRadius: "50%", background: `${getNotifColor(n.type)}18`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.25rem" }}>
                        {getNotifIcon(n.type)}
                      </div>
                    )}
                    <div style={{ position: "absolute", bottom: "-2px", right: "-2px", width: "1rem", height: "1rem", borderRadius: "50%", background: "var(--color-surface)", border: "2px solid var(--color-surface)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.55rem" }}>
                      {getNotifIcon(n.type)}
                    </div>
                  </div>
                  
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ margin: 0, fontSize: "0.875rem", color: "var(--color-text-primary)", fontWeight: n.isRead ? 400 : 600, lineHeight: 1.4 }}>
                      {n.actorName && <strong style={{fontWeight: 700}}>{n.actorName} </strong>}
                      <span style={{ color: "var(--color-text-secondary)" }}>{n.message}</span>
                    </p>
                    {n.subMessage && (
                      <p style={{ fontSize: "0.8125rem", color: "var(--color-text-muted)", marginTop: "0.25rem", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{n.subMessage}</p>
                    )}
                    <span style={{ fontSize: "0.75rem", color: n.isRead ? "var(--color-text-muted)" : "var(--color-primary)", marginTop: "0.25rem", display: "block", fontWeight: n.isRead ? 400 : 600 }}>
                      {getRelativeTime(n.createdAt)}
                    </span>
                  </div>
                  {!n.isRead && (
                    <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: "var(--color-primary)", marginTop: "0.375rem", flexShrink: 0 }} />
                  )}
                </div>
              ))
            )}
          </div>

          <Link href="/thong-bao" onClick={() => setIsOpen(false)} style={{ display: "block", textAlign: "center", padding: "0.875rem", borderTop: "1px solid var(--color-border)", color: "var(--color-primary)", fontSize: "0.875rem", fontWeight: 600, textDecoration: "none", background: "var(--color-surface-2)" }}>
            Xem tất cả thông báo
          </Link>
        </div>
      )}
    </div>
  );
}