"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  BookOpen,
  MessageSquare,
  AlertTriangle,
  Users,
  ChevronLeft,
} from "lucide-react";

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  userRole: "admin" | "manager";
}

export default function Sidebar({ isOpen, setIsOpen, userRole }: SidebarProps) {
  const pathname = usePathname();

  const menuItems = [
    {
      id: "dashboard",
      label: "Tổng quan hệ thống",
      icon: LayoutDashboard,
      roles: ["admin", "manager"],
      href: "/admin",
    },
    {
      id: "tutorials",
      label: "Quản lý bài viết",
      icon: BookOpen,
      roles: ["admin", "manager"],
      href: "/admin/tutorials",
    },
    {
      id: "users",
      label: "Quản lý thành viên",
      icon: Users,
      roles: ["admin", "manager"],
      href: "/admin/users",
    },
    {
      id: "comments",
      label: "Quản lý bình luận",
      icon: MessageSquare,
      roles: ["admin", "manager"],
      href: "/admin/comments",
    },
    {
      id: "reports",
      label: "Báo cáo vi phạm",
      icon: AlertTriangle,
      roles: ["admin", "manager"],
      href: "/admin/reports",
    },
  ];

  return (
    <aside
      className={`bg-white border-r border-slate-200 flex flex-col justify-between transition-all duration-300 ease-in-out z-30 sticky top-0 h-screen shrink-0 ${isOpen ? "w-64" : "w-20"}`}
    >
      <div>
        <div className="h-16 flex items-center justify-between px-4 border-b border-slate-100">
          <div className="flex items-center gap-3 overflow-hidden">
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
                  flexShrink: 0,
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

              {isOpen && (
                <span
                  style={{
                    fontFamily: "var(--font-playfair), Georgia, serif",
                    fontWeight: 700,
                    fontSize: "1.375rem",
                    color: "var(--color-primary-dark)",
                    letterSpacing: "-0.01em",
                    whiteSpace: "nowrap",
                  }}
                >
                  Ori<span style={{ color: "var(--color-accent)" }}>Mate</span>
                </span>
              )}
            </Link>
          </div>
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="hidden md:flex p-1.5 rounded-md hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
          >
            <ChevronLeft
              className={`w-4 h-4 transition-transform duration-300 ${!isOpen ? "rotate-180" : ""}`}
            />
          </button>
        </div>

        <nav className="p-3 flex flex-col gap-1">
          {menuItems.map((item) => {
            if (!item.roles.includes(userRole)) return null;

            const isActive = pathname === item.href;

            return (
              <Link
                key={item.id}
                href={item.href}
                className={`w-full h-10 flex items-center justify-between rounded-lg text-sm font-medium transition-all group px-3 ${
                  isActive
                    ? "bg-emerald-50 text-emerald-700 font-semibold shadow-sm"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <item.icon
                    className={`w-4 h-4 shrink-0 transition-colors ${
                      isActive
                        ? "text-emerald-600"
                        : "text-slate-400 group-hover:text-slate-600"
                    }`}
                  />
                  {isOpen && (
                    <span className="truncate text-left whitespace-nowrap">
                      {item.label}
                    </span>
                  )}
                </div>
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="p-4 text-center text-[11px] text-slate-300 font-medium select-none">
        {isOpen && <span>OriGami CMS © 2026</span>}
      </div>
    </aside>
  );
}
