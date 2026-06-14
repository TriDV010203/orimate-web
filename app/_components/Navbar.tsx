"use client";

import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { isLoggedIn, getUser, clearSession, type StoredUser } from "../../lib/auth";
import { useRouter, usePathname } from "next/navigation";

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [loggedIn, setLoggedIn] = useState(false);
  const [user, setUser] = useState<StoredUser | null>(null);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Khởi tạo và cập nhật trạng thái đăng nhập phía client
  function refreshAuth() {
    const ok = isLoggedIn();
    setLoggedIn(ok);
    setUser(ok ? getUser() : null);
  }

  useEffect(() => {
    refreshAuth();
    window.addEventListener("storage", refreshAuth);
    window.addEventListener("authChange", refreshAuth);
    return () => {
      window.removeEventListener("storage", refreshAuth);
      window.removeEventListener("authChange", refreshAuth);
    };
  // Re-check khi pathname thay đổi (navigate sau login)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  // Đóng dropdown khi click ngoài
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setUserDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function handleLogout() {
    clearSession();
    setLoggedIn(false);
    setUser(null);
    setUserDropdownOpen(false);
    router.push("/");
  }

  // Lấy chữ cái đầu của email để hiển thị avatar
  const initials = user?.email
    ? user.email.charAt(0).toUpperCase()
    : "U";


  return (
    <header className="navbar">
      <div className="container">
        <nav
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            height: "4rem",
          }}
        >
          {/* Logo */}
          <Link
            href="/"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              textDecoration: "none",
              flexShrink: 0,
            }}
          >
            <div
              style={{
                width: "2.25rem",
                height: "2.25rem",
                background: "var(--gradient-primary)",
                borderRadius: "10px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="white"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M2 20l10-16 10 16H2z" />
                <path d="M12 4L6 14h12L12 4z" />
              </svg>
            </div>
            <span
              style={{
                fontFamily: "var(--font-playfair), Georgia, serif",
                fontWeight: 700,
                fontSize: "1.375rem",
                color: "var(--color-primary-dark)",
                letterSpacing: "-0.01em",
              }}
            >
              Ori<span style={{ color: "var(--color-accent)" }}>Gami</span>
            </span>
          </Link>

          {/* Center Nav Links */}
          <div
            className="nav-links"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.25rem",
            }}
          >
            {[
              { href: "/huong-dan", label: "Thư viện" },
              { href: "/cong-dong", label: "Cộng đồng" },
              { href: "/gia-dinh", label: "Gia đình" },
            ].map((link) => (
              <Link
                key={link.href}
                href={link.href}
                style={{
                  padding: "0.5rem 0.875rem",
                  borderRadius: "var(--radius-full)",
                  textDecoration: "none",
                  color: "var(--color-text-secondary)",
                  fontSize: "0.9375rem",
                  fontWeight: 500,
                  transition: "all var(--transition-fast)",
                }}
                onMouseEnter={(e) => {
                  (e.target as HTMLAnchorElement).style.background =
                    "var(--color-surface-2)";
                  (e.target as HTMLAnchorElement).style.color =
                    "var(--color-text-primary)";
                }}
                onMouseLeave={(e) => {
                  (e.target as HTMLAnchorElement).style.background =
                    "transparent";
                  (e.target as HTMLAnchorElement).style.color =
                    "var(--color-text-secondary)";
                }}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Right Actions */}
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            {/* Search */}
            <button
              id="nav-search-btn"
              onClick={() => setSearchOpen(!searchOpen)}
              className="btn btn-ghost btn-sm"
              style={{ borderRadius: "50%", padding: "0.5rem" }}
              aria-label="Tìm kiếm"
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.35-4.35" />
              </svg>
            </button>

            {loggedIn ? (
              <>
                {/* Notification bell */}
                <button
                  id="nav-notif-btn"
                  className="btn btn-ghost btn-sm"
                  style={{
                    borderRadius: "50%",
                    padding: "0.5rem",
                    position: "relative",
                  }}
                  aria-label="Thông báo"
                >
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                    <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                  </svg>
                  <span className="notif-dot" />
                </button>

                {/* User Avatar + Email Dropdown */}
                <div ref={dropdownRef} style={{ position: "relative" }}>
                  <button
                    id="nav-avatar-btn"
                    onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                    aria-label="Menu tài khoản"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.5rem",
                      padding: "0.25rem 0.75rem 0.25rem 0.25rem",
                      borderRadius: "var(--radius-full)",
                      background: userDropdownOpen ? "var(--color-surface-2)" : "transparent",
                      border: "1.5px solid var(--color-border)",
                      cursor: "pointer",
                      transition: "all var(--transition-fast)",
                      boxShadow: userDropdownOpen ? "0 0 0 3px rgba(45,106,79,0.15)" : "none",
                    }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLButtonElement).style.background = "var(--color-surface-2)";
                      (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 0 0 3px rgba(45,106,79,0.15)";
                    }}
                    onMouseLeave={(e) => {
                      if (!userDropdownOpen) {
                        (e.currentTarget as HTMLButtonElement).style.background = "transparent";
                        (e.currentTarget as HTMLButtonElement).style.boxShadow = "none";
                      }
                    }}
                  >
                    {/* Avatar circle */}
                    <div
                      style={{
                        width: "1.875rem",
                        height: "1.875rem",
                        borderRadius: "50%",
                        background: "var(--gradient-primary)",
                        color: "white",
                        fontWeight: 700,
                        fontSize: "0.8rem",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                      }}
                    >
                      {initials}
                    </div>
                    {/* Email label */}
                    <span
                      style={{
                        fontSize: "0.8125rem",
                        fontWeight: 600,
                        color: "var(--color-text-primary)",
                        maxWidth: "120px",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {user?.email ?? "Tài khoản"}
                    </span>
                    {/* Chevron */}
                    <svg
                      width="12"
                      height="12"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      style={{
                        color: "var(--color-text-muted)",
                        transform: userDropdownOpen ? "rotate(180deg)" : "rotate(0deg)",
                        transition: "transform var(--transition-fast)",
                        flexShrink: 0,
                      }}
                    >
                      <path d="m6 9 6 6 6-6" />
                    </svg>
                  </button>

                  {/* Dropdown menu */}
                  {userDropdownOpen && (
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
                      {/* User info header */}
                      <div
                        style={{
                          padding: "1rem",
                          borderBottom: "1px solid var(--color-border)",
                          background: "var(--color-surface-2)",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "0.75rem",
                          }}
                        >
                          <div
                            style={{
                              width: "2.5rem",
                              height: "2.5rem",
                              borderRadius: "50%",
                              background: "var(--gradient-primary)",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              color: "white",
                              fontWeight: 700,
                              fontSize: "1rem",
                              flexShrink: 0,
                            }}
                          >
                            {initials}
                          </div>
                          <div style={{ minWidth: 0 }}>
                            <div
                              style={{
                                fontWeight: 700,
                                fontSize: "0.9rem",
                                color: "var(--color-text-primary)",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                whiteSpace: "nowrap",
                              }}
                            >
                              {user?.email?.split("@")[0] ?? "Người dùng"}
                            </div>
                            <div
                              style={{
                                fontSize: "0.75rem",
                                color: "var(--color-text-muted)",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                whiteSpace: "nowrap",
                              }}
                            >
                              {user?.email}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Menu items */}
                      <div style={{ padding: "0.375rem" }}>
                        <DropdownItem
                          href="/ho-so"
                          icon="👤"
                          label="Trang cá nhân"
                          onClick={() => setUserDropdownOpen(false)}
                        />
                        <DropdownItem
                          href="/ho-so/chinh-sua"
                          icon="✏️"
                          label="Chỉnh sửa hồ sơ"
                          onClick={() => setUserDropdownOpen(false)}
                        />
                        <DropdownItem
                          href="/ho-so/thanh-tich"
                          icon="🏅"
                          label="Thành tựu của tôi"
                          onClick={() => setUserDropdownOpen(false)}
                        />
                        <DropdownItem
                          href="/huong-dan/cua-toi"
                          icon="📚"
                          label="Bài hướng dẫn của tôi"
                          onClick={() => setUserDropdownOpen(false)}
                        />
                        <div
                          style={{
                            height: "1px",
                            background: "var(--color-border)",
                            margin: "0.375rem 0",
                          }}
                        />
                        <button
                          id="nav-logout-btn"
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
                            transition: "background var(--transition-fast)",
                          }}
                          onMouseEnter={(e) =>
                            ((e.currentTarget as HTMLButtonElement).style.background = "#FFF5F5")
                          }
                          onMouseLeave={(e) =>
                            ((e.currentTarget as HTMLButtonElement).style.background = "transparent")
                          }
                        >
                          <span>🚪</span>
                          <span>Đăng xuất</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                {/* Notification (guest) */}
                <button
                  id="nav-notif-btn"
                  className="btn btn-ghost btn-sm"
                  style={{
                    borderRadius: "50%",
                    padding: "0.5rem",
                    position: "relative",
                  }}
                  aria-label="Thông báo"
                >
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                    <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                  </svg>
                  <span className="notif-dot" />
                </button>

                <Link href="/dang-nhap" className="btn btn-ghost btn-sm">
                  Đăng nhập
                </Link>
                <Link href="/dang-ky" className="btn btn-primary btn-sm">
                  Đăng ký
                </Link>
              </>
            )}

            {/* Mobile menu */}
            <button
              id="nav-mobile-menu"
              className="btn btn-ghost btn-sm mobile-only"
              style={{
                borderRadius: "50%",
                padding: "0.5rem",
                display: "none",
              }}
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Menu"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                {mobileOpen ? (
                  <>
                    <path d="M18 6 6 18" />
                    <path d="m6 6 12 12" />
                  </>
                ) : (
                  <>
                    <line x1="4" x2="20" y1="12" y2="12" />
                    <line x1="4" x2="20" y1="6" y2="6" />
                    <line x1="4" x2="20" y1="18" y2="18" />
                  </>
                )}
              </svg>
            </button>
          </div>
        </nav>

        {/* Search Dropdown */}
        {searchOpen && (
          <div
            style={{
              padding: "0.75rem 0 1rem",
              borderTop: "1px solid var(--color-border)",
            }}
          >
            <div className="search-bar" style={{ maxWidth: "100%" }}>
              <svg
                className="search-icon"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.35-4.35" />
              </svg>
              <input
                id="nav-search-input"
                type="search"
                placeholder="Tìm kiếm bài hướng dẫn, chủ đề, tác giả..."
                autoFocus
              />
            </div>
          </div>
        )}
      </div>

      <style>{`
        @media (max-width: 768px) {
          .nav-links { display: none !important; }
          .mobile-only { display: flex !important; }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-6px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </header>
  );
}

// ── Dropdown menu item helper ────────────────────────────────────────────────
function DropdownItem({
  href,
  icon,
  label,
  onClick,
}: {
  href: string;
  icon: string;
  label: string;
  onClick?: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      style={{
        display: "flex",
        alignItems: "center",
        gap: "0.625rem",
        padding: "0.625rem 0.75rem",
        borderRadius: "var(--radius-md)",
        textDecoration: "none",
        fontSize: "0.875rem",
        fontWeight: 500,
        color: "var(--color-text-primary)",
        transition: "background var(--transition-fast)",
      }}
      onMouseEnter={(e) =>
        ((e.currentTarget as HTMLAnchorElement).style.background = "var(--color-surface-2)")
      }
      onMouseLeave={(e) =>
        ((e.currentTarget as HTMLAnchorElement).style.background = "transparent")
      }
    >
      <span>{icon}</span>
      <span>{label}</span>
    </Link>
  );
}
