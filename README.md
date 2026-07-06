# YOLO Architecture Visualizer

An interactive web app for exploring YOLO network architectures across multiple Ultralytics versions.

## Live Demo

https://zhanghuiwan.github.io/yolo-arch-visualizer/

## Features

- Compare YOLOv5, YOLOv8, YOLO11, and YOLO26 architectures.
- Switch between `n / s / m / l / x` model scales.
- Visualize Backbone, Neck / PAN-FPN, and Detect paths in an interactive SVG canvas.
- Click modules to inspect nested structure, tensor shapes, channels, repeats, and YAML scaling rules.
- Pan and zoom the graph with mouse interactions.
- Open built-in knowledge panels for version comparison and YAML terminology.

## Tech Stack

- Next.js 16
- React 19
- TypeScript
- Static export for GitHub Pages
- Vanilla JavaScript SVG renderer for the architecture graph

## Getting Started

```bash
npm install
npm run dev
```

Open:

```text
http://localhost:3000
```

## Build

```bash
npm run build
```

The site is exported as static files and can be hosted by GitHub Pages.

## GitHub Pages

This repository uses GitHub Actions to build and deploy the site.

After pushing to `main`, enable Pages in:

```text
Settings -> Pages -> Build and deployment -> Source -> GitHub Actions
```

The deployed URL is:

```text
https://zhanghuiwan.github.io/yolo-arch-visualizer/
```

## Data Sources

Architecture definitions and module references are based on the Ultralytics source code:

- https://github.com/ultralytics/ultralytics/blob/main/ultralytics/cfg/models/v5/yolov5.yaml
- https://github.com/ultralytics/ultralytics/blob/main/ultralytics/cfg/models/v8/yolov8.yaml
- https://github.com/ultralytics/ultralytics/blob/main/ultralytics/cfg/models/11/yolo11.yaml
- https://github.com/ultralytics/ultralytics/blob/main/ultralytics/cfg/models/26/yolo26.yaml

## Project Structure

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
