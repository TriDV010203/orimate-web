"use client";

import AdminSidebar from "./_components/AdminSidebar";
import { Bell, Search, UserCircle } from "lucide-react";
// 1. Import React Query
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { isLoggedIn, getUser } from "@/lib/auth";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // 2. Khởi tạo QueryClient 1 lần duy nhất trong Layout
  const [queryClient] = useState(() => new QueryClient());
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!isLoggedIn()) {
      router.push("/dang-nhap");
      return;
    }
    
    const user = getUser();
    // Kiểm tra xem có quyền Admin không, tuỳ vào cách định nghĩa role trong backend.
    // Nếu role là chuỗi "Admin" trong mảng roles.
    if (!user?.roles?.includes("Admin")) {
      router.push("/");
      return;
    }
    
    setIsLoading(false);
  }, [router]);

  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-[#f4f7f6]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2d6a4f]"></div>
      </div>
    );
  }

  return (
    // 3. Bọc QueryClientProvider ngoài cùng của Layout này
    <QueryClientProvider client={queryClient}>
      <div className="flex h-screen w-full bg-[#f4f7f6] font-sans overflow-hidden">
        {/* Sidebar bên trái */}
        <AdminSidebar />

        {/* Khu vực chính bên phải */}
        <div className="flex-1 flex flex-col h-full relative">
          {/* Header */}
          <header className="h-20 bg-white/80 backdrop-blur-md border-b border-gray-100 flex items-center justify-between px-8 z-10 sticky top-0">
            <div className="relative w-96 group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 transition-colors group-focus-within:text-[#2d6a4f]" />
              <input
                type="text"
                placeholder="Tìm kiếm..."
                className="w-full bg-gray-50/50 hover:bg-gray-100 focus:bg-white border border-transparent focus:border-[#2d6a4f]/30 rounded-[16px] py-2.5 pl-11 pr-4 text-[14px] outline-none transition-all duration-300"
              />
            </div>

            <div className="flex items-center gap-7">
              <button className="relative text-gray-400 hover:text-[#0f2a1d] transition-colors duration-300">
                <Bell className="w-[22px] h-[22px]" />
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-[#d4713b] rounded-full border-2 border-white"></span>
              </button>

              <div className="flex items-center gap-3 pl-7 border-l border-gray-200 cursor-pointer group">
                <div className="hidden md:block text-right">
                  <p className="text-[14px] font-bold text-[#0f2a1d]">
                    Admin User
                  </p>
                  <p className="text-[12px] text-gray-500 font-medium">
                    Quản trị viên
                  </p>
                </div>
                <UserCircle className="w-10 h-10 text-gray-300 group-hover:text-[#2d6a4f] transition-colors duration-300" />
              </div>
            </div>
          </header>

          {/* Nội dung trang */}
          <main className="flex-1 overflow-y-auto p-8 scrollbar-hide">
            <div className="bg-white rounded-[24px] shadow-[0_2px_20px_rgba(0,0,0,0.02)] border border-gray-50 min-h-full p-8">
              {children}
            </div>
          </main>
        </div>
      </div>
    </QueryClientProvider>
  );
}
