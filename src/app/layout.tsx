import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "YOLO Architecture Visualizer | YOLO 网络结构动态图解",
  description: "Interactive YOLO architecture visualizer for YOLOv5, YOLOv8, YOLO11, and YOLO26. 支持多版本、多模型规模、模块展开和 YAML 计算说明。",
  keywords: ["YOLO", "YOLOv5", "YOLOv8", "YOLO11", "YOLO26", "Ultralytics", "architecture visualizer", "网络结构", "深度学习", "目标检测"],
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
