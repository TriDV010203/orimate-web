"use client";

import AdminSidebar from "./_components/AdminSidebar";
import { Bell, Sun, Moon, User, KeyRound, LogOut } from "lucide-react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState, useEffect, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import { Toaster } from "react-hot-toast";
import Link from "next/link";
import { isLoggedIn, getUser, getToken, clearSession } from "@/lib/auth";
import { authApi } from "@/lib/api";
import NotificationPopover from "../../_components/NotificationPopover";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [queryClient] = useState(() => new QueryClient());
  const router = useRouter();
  const pathname = usePathname();
  const [isLoading, setIsLoading] = useState(true);
  const { resolvedTheme, setTheme } = useTheme();
  const user = getUser();
  const [avatarMenuOpen, setAvatarMenuOpen] = useState(false);
  const avatarMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (avatarMenuRef.current && !avatarMenuRef.current.contains(e.target as Node)) {
        setAvatarMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  async function handleLogout() {
    const token = getToken();
    if (token) {
      try {
        await authApi.logout(token);
      } catch {
        // Tiếp tục đăng xuất phía client dù server có lỗi
      }
    }
    clearSession();
    setAvatarMenuOpen(false);
    router.push("/dang-nhap");
  }

  useEffect(() => {
    if (!isLoggedIn()) {
      router.push("/dang-nhap");
      return;
    }

    const currentUser = getUser();
    const isAdmin = currentUser?.roles?.includes("Admin") ?? false;
    const isManager = currentUser?.roles?.includes("Manager") ?? false;
    if (!isAdmin && !isManager) {
      router.push("/");
      return;
    }

    // Manager quản lý mọi mục trừ "Người dùng" — chặn truy cập trực tiếp bằng URL.
    if (!isAdmin && pathname.startsWith("/admin/users")) {
      router.push("/admin");
      return;
    }

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsLoading(false);
  }, [router, pathname]);

  if (isLoading) {
    return (
      <div className="admin-loading-screen">
        <div className="admin-spinner"></div>
      </div>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <Toaster position="top-right" />
      <div className="admin-shell">
        <AdminSidebar />

        <div className="admin-main">
          <header className="admin-header">
            <div className="admin-header-actions">
              <button
                onClick={() =>
                  setTheme(resolvedTheme === "dark" ? "light" : "dark")
                }
                className="admin-icon-btn"
                title="Đổi giao diện"
              >
                {resolvedTheme === "dark" ? (
                  <Sun size={18} />
                ) : (
                  <Moon size={18} />
                )}
              </button>

              {/* <button className="admin-icon-btn">
                <Bell size={18} />
              </button> */}
              <NotificationPopover className="admin-icon-btn" />

              <div ref={avatarMenuRef} style={{ position: "relative" }}>
                <button
                  className="admin-avatar"
                  title={user?.email}
                  onClick={() => setAvatarMenuOpen((v) => !v)}
                >
                  {(user?.email ?? "A").charAt(0).toUpperCase()}
                </button>

                {avatarMenuOpen && (
                  <div
                    style={{
                      position: "absolute",
                      top: "calc(100% + 0.625rem)",
                      right: 0,
                      background: "var(--color-surface)",
                      border: "1px solid var(--color-border)",
                      borderRadius: "var(--radius-lg)",
                      boxShadow: "var(--shadow-xl)",
                      minWidth: "220px",
                      zIndex: 200,
                      overflow: "hidden",
                      animation: "fadeIn 0.15s ease",
                    }}
                  >
                    <div
                      style={{
                        padding: "1rem",
                        borderBottom: "1px solid var(--color-border)",
                        background: "var(--color-surface-2)",
                        fontSize: "0.8125rem",
                        fontWeight: 600,
                        color: "var(--color-text-primary)",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {user?.email}
                    </div>

                    <div style={{ padding: "0.375rem" }}>
                      <Link
                        href="/ho-so"
                        onClick={() => setAvatarMenuOpen(false)}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "0.625rem",
                          padding: "0.625rem 0.75rem",
                          borderRadius: "var(--radius-md)",
                          fontSize: "0.875rem",
                          fontWeight: 500,
                          color: "var(--color-text-primary)",
                          textDecoration: "none",
                        }}
                      >
                        <User size={16} />
                        Trang cá nhân
                      </Link>
                      <Link
                        href="/ho-so/doi-mat-khau"
                        onClick={() => setAvatarMenuOpen(false)}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "0.625rem",
                          padding: "0.625rem 0.75rem",
                          borderRadius: "var(--radius-md)",
                          fontSize: "0.875rem",
                          fontWeight: 500,
                          color: "var(--color-text-primary)",
                          textDecoration: "none",
                        }}
                      >
                        <KeyRound size={16} />
                        Đổi mật khẩu
                      </Link>

                      <div
                        style={{
                          height: "1px",
                          background: "var(--color-border)",
                          margin: "0.375rem 0",
                        }}
                      />

                      <button
                        onClick={handleLogout}
                        style={{
                          width: "100%",
                          display: "flex",
                          alignItems: "center",
                          gap: "0.625rem",
                          padding: "0.625rem 0.75rem",
                          borderRadius: "var(--radius-md)",
                          border: "none",
                          background: "transparent",
                          cursor: "pointer",
                          fontSize: "0.875rem",
                          fontWeight: 500,
                          color: "#E03131",
                          textAlign: "left",
                        }}
                      >
                        <LogOut size={16} />
                        Đăng xuất
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </header>

          <main className="admin-content">{children}</main>
        </div>
      </div>
    </QueryClientProvider>
  );
}
