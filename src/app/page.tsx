"use client";

import { useEffect, useRef } from "react";
import Script from "next/script";

export default function Home() {
  const containerRef = useRef<HTMLDivElement>(null);
  const assetBase = process.env.NEXT_PUBLIC_BASE_PATH || "";

  // Load app.js after the DOM is hydrated. The script attaches event listeners
  // and calls render() at the end which manipulates the DOM elements below.
  useEffect(() => {
    // The script will be loaded by next/script below; once it loads, it runs
    // immediately and initializes the diagram.
  }, []);

  return (
    <>
      <div ref={containerRef}>
        <header className="topbar">
          <div className="title-block">
            <p className="source-label" data-i18n="shell.kicker">Ultralytics YOLO · 多版本架构对比 · Detect P3/P4/P5</p>
            <h1 data-i18n="shell.title">YOLO 网络结构动态图解</h1>
          </div>

          <div className="control-cluster" aria-label="版本、模型规模与语言控制" data-i18n-aria="shell.controlsAria">
            <div className="language-switch" id="languageSwitch" aria-label="选择界面语言" data-i18n-aria="language.switchLabel"></div>
            <div className="version-switch" id="versionSwitch" aria-label="选择 YOLO 版本" data-i18n-aria="shell.versionSwitchAria"></div>
            <div className="model-switch" id="modelSwitch" aria-label="选择模型规模" data-i18n-aria="shell.modelSwitchAria"></div>
          </div>
        </header>

        <main className="app-shell">
          <section className="summary-strip" id="summaryStrip" aria-label="当前模型摘要" data-i18n-aria="shell.summaryAria"></section>

          <section className="workspace">
            <div className="diagram-panel">
              <div className="diagram-toolbar">
                <div className="legend" aria-label="图例" data-i18n-aria="shell.legendAria">
                  <span><i className="legend-dot backbone"></i><span data-i18n="legend.backbone">Backbone</span></span>
                  <span><i className="legend-dot neck"></i><span data-i18n="legend.neck">Neck / PAN-FPN</span></span>
                  <span><i className="legend-dot detect"></i><span data-i18n="legend.detect">Detect</span></span>
                  <span><i className="legend-dot inner"></i><span data-i18n="legend.detail">详情面板</span></span>
                  <span><i className="legend-line"></i><span data-i18n="legend.skip">跨层拼接</span></span>
                  <span><i className="legend-stack" aria-hidden="true"></i><span data-i18n="legend.repeat">×N 模块重复堆叠</span></span>
                </div>
                <div className="toolbar-actions">
                  <div className="zoom-tools" aria-label="缩放画布" data-i18n-aria="zoom.toolsAria">
                    <button className="icon-button" id="zoomOut" type="button" title="缩小" aria-label="缩小" data-i18n-title="zoom.out" data-i18n-aria="zoom.out">−</button>
                    <input id="zoomRange" type="range" min="45" max="220" defaultValue={70} aria-label="缩放比例" data-i18n-aria="zoom.rangeAria" />
                    <button className="icon-button" id="zoomIn" type="button" title="放大" aria-label="放大" data-i18n-title="zoom.in" data-i18n-aria="zoom.in">+</button>
                    <div className="zoom-presets" id="zoomPresets" aria-label="缩放预设" data-i18n-aria="zoom.presetsAria">
                      <button className="preset-button" type="button" data-zoom="0.6">60%</button>
                      <button className="preset-button" type="button" data-zoom="1">100%</button>
                      <button className="preset-button" type="button" data-zoom="1.6">160%</button>
                      <button className="preset-button" id="zoomFit" type="button" data-i18n="zoom.fit">适屏</button>
                    </div>
                    <button className="icon-button" id="zoomReset" type="button" title="重置视图 (按 0 键)" aria-label="重置视图" data-i18n-title="zoom.resetTitle" data-i18n-aria="zoom.resetAria">↺</button>
                  </div>
                  <button id="compareTrigger" className="reference-trigger" type="button" aria-label="打开版本对比：v5 → v8 → v11 → v26 演进表" data-i18n-aria="compare.openAria">
                    <span aria-hidden="true">↔</span> <span data-i18n="compare.button">版本对比</span>
                  </button>
                  <button id="referenceTrigger" className="reference-trigger" type="button" aria-label="打开知识库：YAML 计算方式与术语解释" data-i18n-aria="reference.openAria">
                    <span aria-hidden="true">📚</span> <span data-i18n="reference.button">知识库</span>
                  </button>
                  <span className="zoom-readout" id="zoomReadout">70%</span>
                </div>
              </div>
              <div className="diagram-scroll" id="diagramScroll" tabIndex={0} aria-label="YOLO 架构画布 · 鼠标拖拽平移 · 滚轮缩放 · Shift+滚轮垂直平移 · 按 F 适屏 · 按 1/2/3/4 切换版本" data-i18n-aria="diagram.scrollAria">
                <svg id="diagram" role="img" aria-labelledby="diagramTitle diagramDesc"></svg>
              </div>
            </div>

            <aside className="detail-panel" aria-live="polite">
              <div className="detail-head">
                <div className="detail-title-area">
                  <p className="panel-kicker" id="detailSection" data-i18n="detail.kicker">模块详情</p>
                  <h2 id="detailTitle" data-i18n="detail.emptyTitle">点击图中的模块</h2>
                </div>
                <button className="detail-close" type="button" aria-label="关闭模块详情" title="关闭模块详情" data-i18n-aria="detail.closeAria" data-i18n-title="detail.closeAria">×</button>
              </div>
              <div id="detailBody" className="detail-body"></div>
            </aside>
          </section>
        </main>

        <div id="referenceModal" className="reference-modal" aria-hidden="true" role="dialog" aria-labelledby="referenceTitle">
          <div className="reference-modal-card">
            <div className="reference-modal-head">
              <div>
                <h2 id="referenceTitle" data-i18n="reference.title">知识库 · YAML 计算方式与术语</h2>
                <p data-i18n="reference.description">通用公式、缩放规则表、参数词汇表与 Shape 约定，与具体层无关的固定解释集中在此。</p>
              </div>
              <button className="reference-close" type="button" aria-label="关闭知识库" data-i18n-aria="reference.closeAria">×</button>
            </div>
            <div id="referenceBody" className="reference-body"></div>
          </div>
        </div>

        <div id="compareModal" className="reference-modal" aria-hidden="true" role="dialog" aria-labelledby="compareTitle">
          <div className="reference-modal-card">
            <div className="reference-modal-head">
              <div>
                <h2 id="compareTitle" data-i18n="compare.title">版本对比 · YOLOv5 → v8 → v11 → v26</h2>
                <p data-i18n="compare.description">四版本架构演进时间线与关键差异矩阵，数据均来自 Ultralytics 官方源码 YAML。</p>
              </div>
              <button className="reference-close" type="button" aria-label="关闭版本对比" data-i18n-aria="compare.closeAria">×</button>
            </div>
            <div id="compareBody" className="reference-body"></div>
          </div>
        </div>

        <footer className="sources">
          <span data-i18n="footer.sources">结构来源（Ultralytics 源码）：</span>
          <a href="https://github.com/ultralytics/ultralytics/blob/main/ultralytics/cfg/models/v5/yolov5.yaml" target="_blank" rel="noreferrer">yolov5.yaml</a>
          <a href="https://github.com/ultralytics/ultralytics/blob/main/ultralytics/cfg/models/v8/yolov8.yaml" target="_blank" rel="noreferrer">yolov8.yaml</a>
          <a href="https://github.com/ultralytics/ultralytics/blob/main/ultralytics/cfg/models/11/yolo11.yaml" target="_blank" rel="noreferrer">yolo11.yaml</a>
          <a href="https://github.com/ultralytics/ultralytics/blob/main/ultralytics/cfg/models/26/yolo26.yaml" target="_blank" rel="noreferrer">yolo26.yaml</a>
          <a href="https://github.com/ultralytics/ultralytics/blob/main/ultralytics/nn/modules/block.py" target="_blank" rel="noreferrer">block.py</a>
          <a href="https://github.com/ultralytics/ultralytics/blob/main/ultralytics/nn/modules/head.py" target="_blank" rel="noreferrer">head.py</a>
          <span className="ml-auto opacity-60" data-i18n="footer.shortcuts">鼠标拖拽平移 · 滚轮缩放 · Shift+滚轮垂直平移 · F 适屏 · 0 重置 · 1/2/3/4 切换版本</span>
        </footer>
      </div>

      <Script
        src={`${assetBase}/yolo11-arch/versions.js?v=20260707a`}
        strategy="afterInteractive"
      />
      <Script
        src={`${assetBase}/yolo11-arch/app.js?v=20260707a`}
        strategy="afterInteractive"
      />
    </>
  );
}
