import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import Providers from "./providers";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "OriGami — Nền tảng cộng đồng gấp giấy hàng đầu Việt Nam",
    template: "%s | OriGami",
  },
  description:
    "Khám phá hàng nghìn bài hướng dẫn gấp giấy Origami. Học hỏi từ cộng đồng, chia sẻ thành quả và tham gia các dự án gia đình sáng tạo.",
  keywords: ["origami", "gấp giấy", "hướng dẫn origami", "nghệ thuật giấy", "origami việt nam"],
  openGraph: {
    title: "OriGami — Nền tảng cộng đồng gấp giấy",
    description: "Học gấp giấy Origami cùng hàng nghìn người sáng tạo Việt Nam",
    type: "website",
    locale: "vi_VN",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" className={`${inter.variable} ${playfair.variable}`}>
      <body className="min-h-screen flex flex-col" suppressHydrationWarning>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
