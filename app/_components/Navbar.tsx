"use client";

import Link from "next/link";
import { useState } from "react";

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

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
              { href: "/tutorials", label: "Thư viện" },
              { href: "/community", label: "Cộng đồng" },
              { href: "/family", label: "Gia đình" },
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

            {/* Notification (logged in example) */}
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

            <Link href="/login" className="btn btn-ghost btn-sm">
              Đăng nhập
            </Link>
            <Link href="/register" className="btn btn-primary btn-sm">
              Đăng ký
            </Link>

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
      `}</style>
    </header>
  );
}
