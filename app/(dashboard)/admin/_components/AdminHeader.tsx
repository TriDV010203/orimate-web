"use client";

import { useRouter } from "next/navigation";
import { getUser, clearSession, getToken } from "@/lib/auth";
import { authApi } from "@/lib/api";
import { Bell, LogOut } from "lucide-react";

export default function AdminHeader() {
  const router = useRouter();
  const user = getUser();

  const initials = user?.email ? user.email.charAt(0).toUpperCase() : "A";

  const handleLogout = async () => {
    const token = getToken();
    if (token) {
      try {
        await authApi.logout(token);
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (e) {}
    }
    clearSession();
    router.push("/dang-nhap");
  };

  return (
    <header className="h-20 flex-shrink-0 bg-white/70 backdrop-blur-xl border-b border-white/60 px-10 flex items-center justify-between z-40 sticky top-0 shadow-[0_4px_40px_rgba(0,0,0,0.02)]">
      <div className="flex items-center gap-3 text-gray-900 group cursor-default"></div>

      <div className="flex items-center gap-6">
        {/* Nút Thông báo */}
        <button className="w-12 h-12 rounded-full flex items-center justify-center text-gray-500 bg-white shadow-[0_2px_10px_rgba(0,0,0,0.03)] border border-gray-100 hover:border-gray-200 hover:shadow-md transition-all relative">
          <Bell className="w-5 h-5" />
          <span className="absolute top-3 right-3 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
        </button>

        <div className="h-10 w-px bg-gradient-to-b from-transparent via-gray-200 to-transparent"></div>

        {/* Thông tin cá nhân & Đăng xuất */}
        <div className="flex items-center gap-4 bg-white/50 pl-4 pr-2 py-2 rounded-full border border-gray-100 shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-bold text-gray-900 leading-tight">
              {user?.email?.split("@")[0] || "Quản trị viên"}
            </p>
            <p className="text-[10px] text-[#2d6a4f] font-extrabold uppercase tracking-widest mt-1">
              {user?.roles.includes("Admin") ? "Admin" : "Manager"}
            </p>
          </div>

          <div className="w-11 h-11 rounded-full bg-gradient-to-br from-[#2d6a4f] to-[#40916c] text-white flex items-center justify-center font-bold shadow-md shadow-[#2d6a4f]/20 text-lg border-2 border-white">
            {initials}
          </div>

          <button
            onClick={handleLogout}
            className="ml-1 w-10 h-10 rounded-full flex items-center justify-center text-red-400 hover:bg-red-50 hover:text-red-600 transition-colors"
            title="Đăng xuất khỏi hệ thống"
          >
            <LogOut className="w-5 h-5 ml-1" />
          </button>
        </div>
      </div>
    </header>
  );
}
