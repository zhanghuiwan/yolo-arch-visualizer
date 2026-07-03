# YOLO 网络结构动态图解 · 多版本对比网页

支持 **YOLOv5 / YOLOv8 / YOLO11 / YOLO26** 四版本、**n / s / m / l / x** 五规模切换的交互式网络结构可视化网页。

## 一、内容清单

```
yolo-arch-web/
├── README.md                       ← 本说明文件
├── src/
│   └── app/
│       ├── layout.tsx              ← Next.js 根布局（含 metadata）
│       ├── page.tsx                ← Next.js 主页（顶栏 + 画布 + 详情面板 + 知识库/对比弹窗）
│       └── globals.css             ← 全局样式（包含整套网页样式与 CSS 变量）
└── public/
    └── yolo11-arch/
        ├── app.js                  ← 主入口：版本路由 + SVG 渲染 + pan/zoom + 抽屉 UI
        ├── versions.js             ← 四版本 × 五规模的 YAML 数据与模块讲解
        └── styles.css              ← 备份样式（与 globals.css 同源，page.tsx 未显式引用）
```

## 二、技术栈

- **Next.js 16**（App Router）
- **React 19** + **TypeScript**
- **Tailwind CSS**（globals.css 中已包含全部自定义样式，不依赖额外 Tailwind 工具类）
- **vanilla JS**（SVG 渲染、pan/zoom、抽屉逻辑，全部封装在 app.js 内）

## 三、运行方式

### 方式 A：在已有 Next.js 项目中部署

1. 把 `src/app/` 下的三个文件复制到你的 Next.js 项目的 `src/app/` 目录（覆盖原有同名文件即可）。
2. 把 `public/yolo11-arch/` 整个目录复制到你的 Next.js 项目的 `public/` 下。
3. 启动开发服务器：
   ```bash
   npm run dev
   # 或 pnpm dev / yarn dev / bun dev
   ```
4. 浏览器打开 `http://localhost:3000` 即可。

### 方式 B：从零搭建

```bash
npx create-next-app@latest yolo-arch-web --typescript --app --no-tailwind
cd yolo-arch-web
# 然后把本压缩包里的 src/app/ 与 public/ 覆盖到对应位置
npm install
npm run dev
```

## 四、功能特性

| 特性                | 说明                                                                     |
| ------------------- | ------------------------------------------------------------------------ |
| 多版本切换          | 顶栏第一行选择 v5 / v8 / v11 / v26，画布立即重绘                         |
| 多规模切换          | 顶栏第二行选择 n / s / m / l / x，节点 channels / repeat 等参数动态更新  |
| 动态结构图          | 4 行布局（输入 → Backbone → Neck → Detect），节点按 layer 索引顺序连接   |
| 嵌套展开讲解        | 点击任意模块弹出抽屉，逐级展开子模块（如 C3k2 → C3k → Bottleneck）       |
| 跳跃连接可视化      | Concat / 拼接节点用虚线弧线连接到对应 Backbone 节点                      |
| 颜色编码            | 高度 = log2(channels)，DIFF 徽章标记检测头差异，×N 标记重复堆叠          |
| pan / zoom          | 鼠标拖拽平移、滚轮缩放、Shift+滚轮垂直平移、F 适屏、0 重置               |
| 版本对比弹窗        | 顶栏「版本对比」按钮 → 四版本演进时间线与关键差异矩阵                    |
| 知识库弹窗          | 顶栏「知识库」按钮 → YAML 计算公式、缩放规则表、术语词汇表               |
| 快捷键              | 1/2/3/4 切换版本，0 重置视图，F 适屏                                     |

## 五、数据来源

所有版本的网络结构均来自 **Ultralytics 官方源码**：

- v5  : `ultralytics/cfg/models/v5/yolov5.yaml`  (YOLOv5 v6.0)
- v8  : `ultralytics/cfg/models/v8/yolov8.yaml`  (YOLOv8.0)
- v11 : `ultralytics/cfg/models/11/yolo11.yaml`  (YOLO11)
- v26 : `ultralytics/cfg/models/26/yolo26.yaml`  (YOLO26，end2end + reg_max=1)

源仓库：https://github.com/ultralytics/ultralytics

## 六、关键文件说明

### `app.js`（主入口，~2300 行）

- `state`：全局状态（当前版本、规模、缩放、平移、抽屉栈等）
- `VERSION_KEYS` / `MODEL_KEYS`：版本与规模常量
- `buildVersionSwitch()` / `buildModelSwitch()`：顶栏版本/规模按钮渲染
- `layoutLayers(model)`：4 行布局算法，计算每个节点的 x/y 坐标
- `renderDiagram()`：把当前 model 渲染成 SVG（节点 + 连接线 + 跳跃弧线）
- `applyTransform()`：应用 `translate(panX,panY) scale(zoom)` 变换
- `bindDrawer()`：抽屉嵌套展开逻辑（面包屑 + 子模块树）
- `init()`：初始化，绑定所有事件监听

### `versions.js`（多版本数据，~1100 行）

包含四版本各自：

- `meta`：版本元信息（发布年份、YAML URL、关键变化列表）
- `models`：五规模（n/s/m/l/x）的完整 layer 序列，每个节点带
  `{ idx, name, module, params, from, repeat, c_in, c_out, layer }`
- `unitInfo`：模块讲解（介绍 + 关键参数）
- `unitInnerStructure`：模块嵌套展开树
- `compare`：版本对比数据（演进时间线 + 差异矩阵）
- `yamlKnowledge`：YAML 知识库内容

## 七、版本差异速览

| 维度        | v5                  | v8                | v11               | v26                              |
| ----------- | ------------------- | ----------------- | ----------------- | -------------------------------- |
| 输入层      | Focus（切片）       | Conv              | Conv              | Conv                             |
| 主干模块    | C3                  | C2f               | C3k2 + C2PSA      | C3k2 + C2PSA（同 v11）           |
| 检测头      | Coupled（耦合头）   | Decoupled（解耦） | Decoupled         | Decoupled + end2end + reg_max=1  |
| objectness  | 有                  | 无                | 无                | 无                               |
| 注意力机制  | 无                  | 无                | C2PSA（PSA）      | C2PSA（PSA）                     |

## 八、注意事项

1. `page.tsx` 通过 `next/script` 的 `afterInteractive` 策略加载 `versions.js` 与 `app.js`，**两者必须按顺序加载**（versions.js 在前，app.js 在后）。
2. URL 中的 `?v=20260703n` 是缓存破坏参数，发布新版本时建议更新此值。
3. `globals.css` 与 `public/yolo11-arch/styles.css` 内容完全一致，前者由 Next.js 通过 `layout.tsx` 全局引入，后者仅作备份。
4. 网页所有交互均在前端完成，无后端依赖，无需 API Key。

## 九、部署到 GitHub Pages

本仓库已补充最小 Next.js 工程配置和 GitHub Pages workflow。推送到 GitHub 后，在仓库设置中开启 Pages：

1. GitHub 仓库页进入 `Settings → Pages`。
2. `Build and deployment` 的 `Source` 选择 `GitHub Actions`。
3. 本地提交并推送到 `main` 分支：
   ```bash
   git add .
   git commit -m "Deploy YOLO architecture web app"
   git branch -M main
   git remote add origin https://github.com/<你的用户名>/<仓库名>.git
   git push -u origin main
   ```
4. 等待 `Actions` 中的 `Deploy Next.js site to GitHub Pages` 工作流完成。
5. 在线链接通常为：
   ```text
   https://<你的用户名>.github.io/<仓库名>/
   ```

如果仓库名是 `<你的用户名>.github.io`，则链接为：

```text
https://<你的用户名>.github.io/
```
