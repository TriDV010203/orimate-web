"use client";

import { ThemeProvider } from "next-themes";
import { useEffect, useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

export function Providers({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);

  // Khởi tạo QueryClient 1 lần duy nhất để tránh bị re-render mất data
  const [queryClient] = useState(() => new QueryClient());

  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 0);
    return () => clearTimeout(timer);
  }, []);

  // QUAN TRỌNG: QueryClientProvider phải luôn bọc ở ngoài cùng mọi lúc.
  // Nếu bạn return <>{children}</> mà không có QueryClientProvider bọc ngoài ở lần render đầu tiên, ứng dụng sẽ báo lỗi.
  return (
    <QueryClientProvider client={queryClient}>
      {!mounted ? (
        <>{children}</>
      ) : (
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          {children}
        </ThemeProvider>
      )}
    </QueryClientProvider>
  );
}
