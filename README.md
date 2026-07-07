# YOLO Architecture Visualizer

[中文](#中文) | [English](#english)

## 中文

一个用于学习和对比 YOLO 网络结构的交互式可视化网页，基于 Ultralytics 官方 YAML 展示 YOLOv5、YOLOv8、YOLO11、YOLO26 的 Backbone、Neck / PAN-FPN 和 Detect 结构。

### 在线地址

https://zhanghuiwan.github.io/yolo-arch-visualizer/

### 功能亮点

- 支持 YOLOv5、YOLOv8、YOLO11、YOLO26 多版本切换。
- 支持 `n / s / m / l / x` 五种模型规模切换。
- 使用可拖拽、可缩放的 SVG 画布展示完整网络链路。
- 点击模块可在图中展开底层结构，例如 `Conv2d -> BatchNorm2d -> SiLU`。
- 详情抽屉展示输入输出 shape、输入输出通道、repeat、hidden channel 和 YAML 缩放计算。
- 内置知识库解释 `k`、`s`、`p`、`c_in`、`c_out`、`depth`、`width`、`max_channels`、`DFL`、`reg_max` 等术语。
- 内置版本对比面板，帮助理解 YOLOv5 到 YOLO26 的结构演进。
- 支持中文 / English 双语言切换，并使用浏览器本地记忆语言选择。

### 技术栈

- Next.js 16
- React 19
- TypeScript
- GitHub Pages static export
- Vanilla JavaScript SVG renderer

### 本地运行

```bash
npm install
npm run dev
```

打开：

```text
http://localhost:3000
```

### 构建

```bash
npm run build
```

项目使用静态导出，可以通过 GitHub Pages 托管。

### GitHub Pages 部署

本仓库使用 GitHub Actions 构建并部署站点。

推送到 `main` 后，在 GitHub 仓库中开启：

```text
Settings -> Pages -> Build and deployment -> Source -> GitHub Actions
```

部署地址：

```text
https://zhanghuiwan.github.io/yolo-arch-visualizer/
```

### 数据来源

结构定义和模块说明参考 Ultralytics 官方源码：

- https://github.com/ultralytics/ultralytics/blob/main/ultralytics/cfg/models/v5/yolov5.yaml
- https://github.com/ultralytics/ultralytics/blob/main/ultralytics/cfg/models/v8/yolov8.yaml
- https://github.com/ultralytics/ultralytics/blob/main/ultralytics/cfg/models/11/yolo11.yaml
- https://github.com/ultralytics/ultralytics/blob/main/ultralytics/cfg/models/26/yolo26.yaml
- https://github.com/ultralytics/ultralytics/blob/main/ultralytics/nn/modules/block.py
- https://github.com/ultralytics/ultralytics/blob/main/ultralytics/nn/modules/head.py

### 项目结构

```text
.
├── public/yolo11-arch/
│   ├── app.js
│   ├── styles.css
│   └── versions.js
├── src/app/
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── next.config.mjs
└── package.json
```

## English

An interactive web app for learning, inspecting, and comparing YOLO network architectures. It visualizes Backbone, Neck / PAN-FPN, and Detect structures for YOLOv5, YOLOv8, YOLO11, and YOLO26 based on official Ultralytics YAML files.

### Live Demo

https://zhanghuiwan.github.io/yolo-arch-visualizer/

### Features

- Switch between YOLOv5, YOLOv8, YOLO11, and YOLO26.
- Compare `n / s / m / l / x` model scales.
- Explore the full architecture path in a draggable and zoomable SVG canvas.
- Click modules to expand primitive layers, such as `Conv2d -> BatchNorm2d -> SiLU`.
- Inspect input/output shapes, input/output channels, repeats, hidden channels, and YAML scaling formulas in the detail drawer.
- Learn terms such as `k`, `s`, `p`, `c_in`, `c_out`, `depth`, `width`, `max_channels`, `DFL`, and `reg_max` in the built-in knowledge base.
- Use the version comparison panel to understand architectural changes from YOLOv5 to YOLO26.
- Switch between Chinese and English. The selected language is remembered locally in the browser.

### Tech Stack

- Next.js 16
- React 19
- TypeScript
- GitHub Pages static export
- Vanilla JavaScript SVG renderer

### Getting Started

```bash
npm install
npm run dev
```

Open:

```text
http://localhost:3000
```

### Build

```bash
npm run build
```

The site is exported as static files and can be hosted by GitHub Pages.

### GitHub Pages Deployment

This repository uses GitHub Actions to build and deploy the site.

After pushing to `main`, enable Pages in:

```text
Settings -> Pages -> Build and deployment -> Source -> GitHub Actions
```

Deployed URL:

```text
https://zhanghuiwan.github.io/yolo-arch-visualizer/
```

### Data Sources

Architecture definitions and module references are based on the official Ultralytics source code:

- https://github.com/ultralytics/ultralytics/blob/main/ultralytics/cfg/models/v5/yolov5.yaml
- https://github.com/ultralytics/ultralytics/blob/main/ultralytics/cfg/models/v8/yolov8.yaml
- https://github.com/ultralytics/ultralytics/blob/main/ultralytics/cfg/models/11/yolo11.yaml
- https://github.com/ultralytics/ultralytics/blob/main/ultralytics/cfg/models/26/yolo26.yaml
- https://github.com/ultralytics/ultralytics/blob/main/ultralytics/nn/modules/block.py
- https://github.com/ultralytics/ultralytics/blob/main/ultralytics/nn/modules/head.py

### Project Structure

```text
.
├── public/yolo11-arch/
│   ├── app.js
│   ├── styles.css
│   └── versions.js
├── src/app/
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── next.config.mjs
└── package.json
```
