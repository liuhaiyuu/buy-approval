import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"
  ),
  title: "买前审批 · 花钱之前先过老板这一关",
  description:
    "类 OA 审批的购买申请小程序：上传订单截图、填写购买原因，老板审批通过才能下单，还能打赏赞助对方。",
  keywords: ["买前审批", "OA审批", "购买审批", "打赏赞助", "小程序"],
  authors: [{ name: "Z.ai" }],
  // 微信 / 浏览器分享卡片
  manifest: "/manifest.webmanifest",
  applicationName: "买前审批",
  appleWebApp: {
    capable: true,
    title: "买前审批",
    statusBarStyle: "black-translucent",
  },
  icons: {
    icon: [
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180" }],
  },
  openGraph: {
    title: "买前审批 · 花钱之前先过老板这一关",
    description:
      "上传订单截图，老板审批通过才能下单，还能打赏赞助对方～",
    type: "website",
    locale: "zh_CN",
    siteName: "买前审批",
    images: [{ url: "/mascot-bear.png", width: 1024, height: 1024, alt: "买前审批小熊" }],
  },
  formatDetection: {
    telephone: false,
    email: false,
    address: false,
  },
};

// 手机端 viewport：禁止双指缩放，适配刘海屏
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: "#ff7a9d",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <head>
        {/* 微信 JSSDK 分享兜底（不引入完整 SDK，仅用基础 meta + 标题） */}
        <meta name="referrer" content="no-referrer" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
