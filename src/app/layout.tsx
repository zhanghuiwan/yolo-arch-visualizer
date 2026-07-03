import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "YOLO 网络结构动态图解 · v5/v8/v11/v26 多版本对比",
  description: "YOLOv5 / YOLOv8 / YOLO11 / YOLO26 四版本网络结构动态图解 · 支持 n / s / m / l / x 五规模切换 · 基于 Ultralytics 官方源码",
  keywords: ["YOLO", "YOLOv5", "YOLOv8", "YOLO11", "YOLO26", "Ultralytics", "网络结构", "深度学习", "目标检测"],
  authors: [{ name: "Ultralytics YOLO" }],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <body>{children}</body>
    </html>
  );
}
