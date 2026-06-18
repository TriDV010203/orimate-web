"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { isLoggedIn, getUser } from "@/lib/auth";
import AdminSidebar from "./_components/AdminSidebar";
import AdminHeader from "./_components/AdminHeader";
import { Toaster } from "react-hot-toast";
import { Loader2 } from "lucide-react";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { refetchOnWindowFocus: false, retry: 1 },
  },
});

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const verifyAccess = () => {
      if (!isLoggedIn()) return router.replace("/dang-nhap");
      const user = getUser();
      if (!user?.roles.includes("Admin") && !user?.roles.includes("Manager")) {
        return router.replace("/");
      }
      setIsChecking(false);
    };
    verifyAccess();
  }, [router]);

  if (isChecking) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-4 text-emerald-700">
          <Loader2 className="w-8 h-8 animate-spin" />
          <p className="font-medium tracking-tight">
            Đang khởi tạo không gian quản trị...
          </p>
        </div>
      </div>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: { borderRadius: "12px", fontSize: "14px", fontWeight: 500 },
        }}
      />

      <div className="flex h-screen overflow-hidden bg-slate-50 text-slate-900 font-sans selection:bg-emerald-100 selection:text-emerald-900">
        <AdminSidebar />
        <div className="flex flex-1 flex-col overflow-hidden relative">
          <AdminHeader />
          <main className="flex-1 overflow-y-auto p-6 md:p-8 lg:p-10">
            <div className="relative z-10 max-w-7xl mx-auto h-full">
              {children}
            </div>
          </main>
        </div>
      </div>
    </QueryClientProvider>
  );
}
