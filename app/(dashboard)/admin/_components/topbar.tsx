"use client";

import React, { useState } from "react";
import { Menu, Bell, LogOut, ChevronDown } from "lucide-react";

interface TopbarProps {
  onMenuClick: () => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  userRole: "admin" | "manager";
  setUserRole: (role: "admin" | "manager") => void;
}

export default function Topbar({ onMenuClick, userRole }: TopbarProps) {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  return (
    <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 shrink-0 z-20 sticky top-0">
      <div className="flex items-center gap-4 w-full max-w-md">
        <button
          onClick={onMenuClick}
          className="md:hidden p-2 rounded-lg hover:bg-slate-100 text-slate-500 transition-colors"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="relative w-full group"></div>
      </div>

      <div className="flex items-center gap-4 shrink-0">
        <button className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-50 relative transition-colors">
          <Bell className="w-4 h-4" />
          <span className="absolute top-2 right-2 w-1.5 h-1.5 bg-rose-500 rounded-full"></span>
        </button>

        <div className="w-px h-5 bg-slate-200"></div>

        <div className="relative">
          <button
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className="flex items-center gap-3 p-1.5 rounded-lg hover:bg-slate-50 transition-all text-left"
          >
            <div className="w-8 h-8 rounded-full bg-emerald-700 text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-sm">
              {userRole === "admin" ? "AD" : "MG"}
            </div>
            <div className="hidden sm:block min-w-0">
              <p className="text-xs font-semibold text-slate-900 leading-none">
                Administrator
              </p>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden sm:block" />
          </button>

          {isProfileOpen && (
            <div className="absolute right-0 mt-3 w-48 bg-[var(--color-surface)] border border-[var(--color-border)] shadow-xl py-1 z-50">
              <button className="w-full h-10 flex items-center justify-center text-sm font-medium text-[var(--color-text-primary)] hover:bg-[var(--color-surface-2)] transition-colors">
                Tài khoản
              </button>

              <button className="w-full h-10 flex items-center justify-center text-sm font-medium text-[var(--color-text-primary)] hover:bg-[var(--color-surface-2)] transition-colors">
                Cài đặt
              </button>

              <button className="w-full h-10 flex items-center justify-center gap-3 text-sm font-medium text-[var(--color-error)] hover:bg-[var(--color-surface-2)] border-t border-[var(--color-border)] transition-colors">
                <LogOut className="w-5 h-5" />
                Đăng xuất
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
