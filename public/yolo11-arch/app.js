// ===== 多版本数据从 versions.js 加载（必须在 app.js 之前加载）=====
// window.YOLO_VERSIONS: { v5, v8, v11, v26 }
// window.YOLO_SHARED: 共享常量（COLORS / NS / NODE / EXPANDED_SPECS_BASE / UNIT_INFO_BASE / UNIT_INNER_BASE / PARAM_GLOSSARY）
const VERSIONS = window.YOLO_VERSIONS;
const SHARED = window.YOLO_SHARED;

const NS = SHARED.NS;
const SVG_SIZE = SHARED.SVG_SIZE;
const NODE = SHARED.NODE;
const EXPANDED_DETECT = SHARED.EXPANDED_DETECT;
const DETECT_NODE = SHARED.DETECT_NODE;
const COLORS = SHARED.COLORS;
const PARAM_GLOSSARY = SHARED.PARAM_GLOSSARY;
const I18N_TEXT = SHARED.I18N_TEXT || {};
const DATA_TRANSLATIONS = SHARED.DATA_TRANSLATIONS || {};
const LANG_STORAGE_KEY = "yolo-arch-lang";

function getInitialLang() {
  try {
    const saved = window.localStorage.getItem(LANG_STORAGE_KEY);
    return saved === "en" ? "en" : "zh";
  } catch {
    return "zh";
  }
}

function i18nEntry(key) {
  return key.split(".").reduce((obj, part) => (obj && obj[part] !== undefined ? obj[part] : undefined), I18N_TEXT);
}

function interpolate(template, vars = {}) {
  return String(template).replace(/\{(\w+)\}/g, (_, name) => (vars[name] !== undefined ? vars[name] : `{${name}}`));
}

function translateFallback(value) {
  let output = DATA_TRANSLATIONS[value] || value;
  if (output !== value || !/[\u2e80-\u9fff]/.test(output)) return output;

  const fragments = [
    ["输入通道", "Input channels"],
    ["输出通道", "Output channels"],
    ["输出维度", "Output dimension"],
    ["重复次数", "Repeats"],
    ["空间尺寸", "Spatial size"],
    ["实际", "actual"],
    ["输入", "input"],
    ["输出", "output"],
    ["通道", "channels"],
    ["卷积核大小", "kernel size"],
    ["卷积步长", "stride"],
    ["边缘补零", "padding"],
    ["下采样", "downsampling"],
    ["特征融合", "feature fusion"],
    ["语义融合", "semantic fusion"],
    ["大目标", "large objects"],
    ["中目标", "medium objects"],
    ["小目标", "small objects"],
    ["残差连接", "residual connection"],
    ["残差相加", "residual add"],
    ["主路", "main path"],
    ["旁路", "bypass"],
    ["保留", "kept"],
    ["无参数", "no parameters"],
    ["推理无需 NMS", "NMS-free inference"],
    ["传统 NMS 流程", "traditional NMS path"],
    ["离散分布", "discrete distribution"],
    ["直接回归", "direct regression"],
    ["拼接", "concat"],
    ["检测输出", "detection output"],
    ["检测输入", "detection input"],
    ["连续池化扩大感受野", "Chained pooling expands receptive field"],
    ["YOLO26 新增残差连接", "YOLO26 adds a residual connection"],
    ["新增残差连接", "adds a residual connection"],
    ["一路保留，一路进入内部块", "One branch is kept; one enters inner blocks"],
    ["一路保留，一路串接 n 个 Bottleneck", "One branch is kept; one chains n Bottleneck blocks"],
    ["每个 C3k 内含 C3-style 结构和 2 个 Bottleneck(k=3)", "Each C3k contains a C3-style structure and two Bottleneck(k=3) blocks"],
    ["每个 Bottleneck 由两层 k=3 Conv 组成，串接输出", "Each Bottleneck has two k=3 Conv layers, with chained outputs"],
    ["每个 Bottleneck 由两层 k=3 Conv 组成", "Each Bottleneck has two k=3 Conv layers"],
    ["每个 Bottleneck：k=1 + k=3，可选 shortcut", "Each Bottleneck: k=1 + k=3, optional shortcut"],
    ["主路 + 旁路", "main path + bypass"],
    ["来源", "source"],
    ["串接", "chained"],
    ["尺度", "scale"],
    ["生成", "produce"],
    ["来自", "from"],
    ["无", "None"],
    ["有", "Yes"],
  ];

  fragments.sort((a, b) => b[0].length - a[0].length).forEach(([zh, en]) => {
    output = output.replaceAll(zh, en);
  });
  return output;
}

function pickLang(value) {
  if (Array.isArray(value)) return value.map((item) => pickLang(item));
  if (value && typeof value === "object") {
    if (!("zh" in value) && !("en" in value)) return value;
    const picked = state.lang === "en" ? value.en ?? value.zh : value.zh ?? value.en;
    return pickLang(picked ?? "");
  }
  if (state.lang !== "en" || typeof value !== "string") return value;
  return translateFallback(value);
}

function t(key, vars = {}) {
  const entry = i18nEntry(key);
  const value = entry === undefined ? key : pickLang(entry);
  return interpolate(value, vars);
}

function htmlLang() {
  return state.lang === "en" ? "en" : "zh-CN";
}

// 当前版本/规模的快捷访问
function currentVersion() {
  return VERSIONS[state.versionKey];
}
function currentScales() {
  return currentVersion().scales;
}
function currentScale() {
  return currentScales()[state.modelKey];
}
function currentRegMax() {
  return currentVersion().regMax;
}
function currentNc() {
  return currentVersion().nc;
}
function currentInputSize() {
  return currentVersion().inputSize;
}
// 合并版本特定 UNIT_INFO 与共享基类
function getUnitInfo(key) {
  const v = currentVersion();
  return (v.unitInfo && v.unitInfo[key]) || SHARED.UNIT_INFO_BASE[key] || null;
}
function getUnitInner(key) {
  const v = currentVersion();
  return (v.unitInnerStructure && v.unitInnerStructure[key]) || SHARED.UNIT_INNER_BASE[key] || [];
}
function getModuleDetails(moduleName) {
  return currentVersion().moduleDetails[moduleName];
}
function getExpandedSpecs() {
  return currentVersion().expandedSpecs;
}
function getNodePos(id) {
  return currentVersion().nodePos[id];
}
function getDetectX() {
  return currentVersion().detectX;
}
function getLayerDefs() {
  return currentVersion().layerDefs;
}
// 兼容旧引用：直接调用 currentXxx() 获取当前版本/规模下的值

let state = {
  lang: getInitialLang(),
  versionKey: "v11",
  modelKey: "n",
  zoom: 0.7,
  panX: 0,
  panY: 0,
  selectedId: 2,
  expandedId: null,
  detailOpen: false,
  viewMode: "diagram", // "diagram" | "compare"
  // 抽屉导航栈：栈顶 = 当前显示的内容
  // 每个元素形如：
  //   { kind: "layer", id, layer }
  //   { kind: "submodule", layerId, sub, depth }
  detailStack: [],
};
let currentCanvasWidth = SVG_SIZE.width;
let currentCanvasHeight = SVG_SIZE.height;
let panState = null;
let suppressCanvasClick = false;

const modelSwitch = document.querySelector("#modelSwitch");
const languageSwitch = document.querySelector("#languageSwitch");
const summaryStrip = document.querySelector("#summaryStrip");
const diagram = document.querySelector("#diagram");
const detailSection = document.querySelector("#detailSection");
const detailTitle = document.querySelector("#detailTitle");
const detailBody = document.querySelector("#detailBody");
const detailPanel = document.querySelector(".detail-panel");
const zoomRange = document.querySelector("#zoomRange");
const zoomReadout = document.querySelector("#zoomReadout");
const diagramScroll = document.querySelector("#diagramScroll");

function makeDivisible(value, divisor = 8) {
  return Math.ceil(value / divisor) * divisor;
}

function scaledChannels(baseChannels, model) {
  return makeDivisible(Math.min(baseChannels, model.maxChannels) * model.width, 8);
}

function scaledRepeats(repeat, model) {
  return repeat > 1 ? Math.max(Math.round(repeat * model.depth), 1) : repeat;
}

function stageInfo(stage) {
  if (stage === "P3/P4/P5") return { size: [80, 40, 20], stride: [8, 16, 32] };
  const match = stage.match(/P(\d)\/(\d+)/);
  const stride = match ? Number(match[2]) : 1;
  const size = Math.round(currentInputSize() / stride);
  return { size, stride };
}

function shapeText(size, channels) {
  if (Array.isArray(channels)) return channels.map((c, i) => `${size[i]}×${size[i]}×${c}`).join(" / ");
  return `${size}×${size}×${channels}`;
}

function resolveLayers(modelKey) {
  const model = currentScales()[modelKey];
  const layerDefs = getLayerDefs();
  const resolved = [];

  layerDefs.forEach((layer) => {
    const prev = resolved[layer.id - 1];
    const info = stageInfo(layer.stage);
    let channels;
    let inputChannels;
    let inputShape;

    if (layer.module === "Detect") {
      const inputs = layer.from.map((id) => resolved[id]);
      channels = inputs.map((item) => item.channels);
      inputChannels = channels.join(" / ");
      inputShape = inputs.map((item) => item.outShape).join(" / ");
    } else if (layer.module === "Concat") {
      const inputs = layer.from.map((ref) => resolved[ref === -1 ? layer.id - 1 : ref]);
      channels = inputs.reduce((sum, item) => sum + item.channels, 0);
      inputChannels = inputs.map((item) => item.channels).join(" + ");
      inputShape = inputs.map((item) => item.outShape).join(" + ");
    } else if (layer.module === "Upsample") {
      channels = prev.channels;
      inputChannels = prev.channels;
      inputShape = prev.outShape;
    } else {
      channels = scaledChannels(layer.args[0], model);
      inputChannels = prev ? prev.channels : 3;
      inputShape = prev ? prev.outShape : `${currentInputSize()}×${currentInputSize()}×3`;
    }

    let c3kEnabled = null;
    let c3kSource = "";
    if (layer.module === "C3k2") {
      const yamlC3k = Boolean(layer.args[1]);
      const scaleForcesC3k = ["m", "l", "x"].includes(modelKey);
      c3kEnabled = yamlC3k || scaleForcesC3k;
      c3kSource = yamlC3k ? "YAML=True" : scaleForcesC3k ? "scale=m/l/x" : "YAML=False";
    }

    const outShape =
      layer.module === "Detect"
        ? `P3/P4/P5 → ${(currentRegMax() * 4) + currentNc()} logits/anchor`
        : shapeText(info.size, channels);

    resolved.push({
      ...layer,
      channels,
      inputChannels,
      inputShape,
      outShape,
      outSize: info.size,
      stride: info.stride,
      repeats: scaledRepeats(layer.repeat, model),
      c3kEnabled,
      c3kSource,
      x: getNodePos(layer.id)[0],
      y: getNodePos(layer.id)[1],
    });
  });

  return resolved;
}

function isInlineExpandable(layer) {
  return Boolean(layer && (getExpandedSpecs()[layer.module] || layer.module === "Detect"));
}

function isLayoutExpandable(layer) {
  return Boolean(layer && getExpandedSpecs()[layer.module]);
}

function expandedSpec(layer) {
  return getExpandedSpecs()[layer.module] || { width: NODE.width, height: NODE.height, gap: 0 };
}

function layoutLayers(layers) {
  const expanded = layers.find((layer) => layer.id === state.expandedId && isLayoutExpandable(layer));
  if (!expanded) {
    return { layers, canvasWidth: SVG_SIZE.width, canvasHeight: SVG_SIZE.height, extraHeight: 0 };
  }

  const spec = expandedSpec(expanded);
  const extraHeight = spec.height - NODE.height + spec.gap;
  const baseX = expanded.x;
  const baseY = expanded.y;
  layers.forEach((layer) => {
    layer.baseX = layer.x;
    layer.baseY = layer.y;
    layer.width = NODE.width;
    layer.height = NODE.height;
    if (layer.x === baseX && layer.y > baseY) layer.y += extraHeight;
  });
  expanded.width = spec.width;
  expanded.height = spec.height;
  return {
    layers,
    canvasWidth: SVG_SIZE.width,
    canvasHeight: SVG_SIZE.height + extraHeight,
    extraHeight,
  };
}

function svgEl(tag, attrs = {}) {
  const el = document.createElementNS(NS, tag);
  Object.entries(attrs).forEach(([key, value]) => {
    if (value !== undefined && value !== null) el.setAttribute(key, value);
  });
  return el;
}

function addText(parent, lines, x, y, attrs = {}) {
  const text = svgEl("text", { x, y, ...attrs });
  const lineArray = Array.isArray(lines) ? lines : [lines];
  lineArray.forEach((line, index) => {
    const tspan = svgEl("tspan", { x, dy: index ? attrs.lineGap || 14 : 0 });
    tspan.textContent = line;
    text.appendChild(tspan);
  });
  parent.appendChild(text);
  return text;
}

function charUnits(char) {
  if (/[\u2e80-\u9fff]/.test(char)) return 1.75;
  if (char === " " || char === "," || char === ".") return 0.45;
  if (char === "×" || char === "→" || char === "/") return 0.95;
  return 1;
}

function textUnits(value) {
  return [...String(value)].reduce((sum, char) => sum + charUnits(char), 0);
}

function maxTextUnits(width, fontSize = 11) {
  return Math.max(8, Math.floor(width / (fontSize * 0.58)));
}

function trimToUnits(value, maxUnits) {
  const text = String(value);
  if (textUnits(text) <= maxUnits) return text;
  const limit = Math.max(4, maxUnits - 1.3);
  let output = "";
  let used = 0;
  for (const char of text) {
    const next = used + charUnits(char);
    if (next > limit) break;
    output += char;
    used = next;
  }
  return `${output.trimEnd()}…`;
}

function wrapLineToUnits(value, maxUnits) {
  const lines = [];
  let current = "";
  for (const char of String(value)) {
    const candidate = current + char;
    if (current && textUnits(candidate) > maxUnits) {
      lines.push(current.trimEnd());
      current = char.trimStart();
    } else {
      current = candidate;
    }
  }
  if (current) lines.push(current.trimEnd());
  return lines.filter(Boolean);
}

function fitTextLines(lines, width, fontSize = 11, maxLines = 2) {
  const input = Array.isArray(lines) ? lines : [lines];
  const maxUnits = maxTextUnits(width, fontSize);
  const wrapped = input.flatMap((line) => wrapLineToUnits(line, maxUnits));
  if (wrapped.length <= maxLines) return wrapped;
  const visible = wrapped.slice(0, maxLines);
  visible[visible.length - 1] = trimToUnits(visible[visible.length - 1], maxUnits);
  if (!visible[visible.length - 1].endsWith("…")) visible[visible.length - 1] = trimToUnits(`${visible[visible.length - 1]}…`, maxUnits);
  return visible;
}

function addBox(parent, x, y, width, height, fill, stroke = COLORS.lineSoft, rx = 8, extra = {}) {
  const rect = svgEl("rect", { x, y, width, height, rx, fill, stroke, "stroke-width": 1.4, ...extra });
  parent.appendChild(rect);
  return rect;
}

function addDefs(svg) {
  const defs = svgEl("defs");
  [
    ["arrow", COLORS.line],
    ["skipArrow", "oklch(0.500 0.104 76)"],
  ].forEach(([id, fill]) => {
    const marker = svgEl("marker", {
      id,
      viewBox: "0 0 10 10",
      refX: 8,
      refY: 5,
      markerWidth: 7,
      markerHeight: 7,
      orient: "auto-start-reverse",
    });
    marker.appendChild(svgEl("path", { d: "M 0 0 L 10 5 L 0 10 z", fill }));
    defs.appendChild(marker);
  });
  svg.appendChild(defs);
}

function nodeFill(layer) {
  if (layer.module === "Conv") return COLORS.conv;
  if (layer.module === "C3k2" || layer.module === "C2f" || layer.module === "C3") return COLORS.csp;
  if (layer.module === "SPPF") return COLORS.sppf;
  if (layer.module === "C2PSA") return COLORS.psa;
  if (layer.module === "Upsample") return COLORS.upsample;
  if (layer.module === "Concat") return COLORS.concat;
  if (layer.module === "Detect") return COLORS.detect;
  return COLORS.panel;
}

function unitColor(kind) {
  if (kind === "conv") return "oklch(0.410 0.105 232)";
  if (kind === "norm" || kind === "split") return "oklch(0.350 0.052 176)";
  if (kind === "act" || kind === "inner") return "oklch(0.545 0.090 78)";
  if (kind === "concat") return "oklch(0.600 0.105 82)";
  if (kind === "pool") return "oklch(0.470 0.070 292)";
  if (kind === "upsample") return "oklch(0.420 0.092 150)";
  if (kind === "detect") return "oklch(0.530 0.092 92)";
  return "oklch(0.390 0.050 220)";
}

function edgeTop(layer) {
  const width = layer.width || NODE.width;
  return { x: layer.x + width / 2, y: layer.y };
}

function edgeBottom(layer) {
  const width = layer.width || NODE.width;
  const height = layer.height || NODE.height;
  return { x: layer.x + width / 2, y: layer.y + height };
}

function edgeLeft(layer) {
  const height = layer.height || NODE.height;
  return { x: layer.x, y: layer.y + height / 2 };
}

function edgeRight(layer) {
  const width = layer.width || NODE.width;
  const height = layer.height || NODE.height;
  return { x: layer.x + width, y: layer.y + height / 2 };
}

function addPath(parent, d, dashed = false, marker = "arrow", selected = false) {
  parent.appendChild(
    svgEl("path", {
      d,
      fill: "none",
      stroke: dashed ? "oklch(0.510 0.104 76)" : selected ? COLORS.selected : COLORS.line,
      "stroke-width": selected ? 2.4 : 1.55,
      "stroke-linecap": "round",
      "stroke-linejoin": "round",
      "stroke-dasharray": dashed ? "7 6" : "",
      "marker-end": `url(#${marker})`,
    }),
  );
}

function pathBetween(a, b, from = "bottom", to = "top") {
  const start = from === "right" ? edgeRight(a) : from === "left" ? edgeLeft(a) : from === "top" ? edgeTop(a) : edgeBottom(a);
  const end = to === "right" ? edgeRight(b) : to === "left" ? edgeLeft(b) : to === "bottom" ? edgeBottom(b) : edgeTop(b);
  if (Math.abs(start.x - end.x) < 8) return `M ${start.x} ${start.y} L ${end.x} ${end.y}`;
  const dx = Math.max(42, Math.abs(end.x - start.x) * 0.42);
  return `M ${start.x} ${start.y} C ${start.x + dx} ${start.y}, ${end.x - dx} ${end.y}, ${end.x} ${end.y}`;
}

function isEdgeSelected(a, b) {
  return state.selectedId === a || state.selectedId === b;
}

function convParams(layer) {
  const k = layer.args?.[1] ?? 1;
  const s = layer.args?.[2] ?? 1;
  // v5 首层 Conv 显式传入 p=2（args[3]），其他版本默认 p=floor(k/2)
  const p = layer.args?.[3] ?? Math.floor(k / 2);
  return { k, s, p };
}

function hiddenChannels(layer) {
  const e = layer.args[2] ?? 0.5;
  return Math.max(1, Math.floor(layer.channels * e));
}

function detectBranchChannels(layers) {
  // 找到 Detect 层（section === 'Detect'）
  const detect = layers.find((l) => l.section === "Detect");
  const first = detect.channels[0];
  const regMax = currentRegMax();
  const nc = currentNc();
  return {
    regMax,
    nc,
    no: nc + regMax * 4,
    box: Math.max(16, Math.floor(first / 4), regMax * 4),
    cls: Math.max(first, Math.min(nc, 100)),
  };
}

function moduleSubtitle(layer) {
  if (layer.module === "Conv") {
    const p = convParams(layer);
    return `k=${p.k}, s=${p.s}, p=${p.p}`;
  }
  if (layer.module === "C3k2") {
    return `n=${layer.repeats}, ${layer.c3kEnabled ? "C3k" : "Bottleneck"}, e=${layer.args[2] ?? 0.5}`;
  }
  if (layer.module === "C2f") return `n=${layer.repeats}, shortcut=${layer.args[1] ?? false}`;
  if (layer.module === "C3") return `n=${layer.repeats}, shortcut=${layer.args[1] ?? true}`;
  if (layer.module === "SPPF") {
    const shortcut = layer.args[3] === true;
    return `k=${layer.args[1]}, hidden=${Math.floor(Number(layer.inputChannels) / 2)}${shortcut ? ", shortcut=True" : ""}`;
  }
  if (layer.module === "C2PSA") return `n=${layer.repeats}, PSA`;
  if (layer.module === "Upsample") return `scale=2, nearest`;
  if (layer.module === "Concat") return `dim=1, c=${layer.channels}`;
  if (layer.module === "Detect") return `P3/P4/P5, nc=${currentNc()}, reg_max=${currentRegMax()}${currentVersion().end2end ? ", end2end" : ""}`;
  return "";
}

function shortShape(layer) {
  if (layer.module === "Detect") return `${currentRegMax() * 4} box + ${currentNc()} cls`;
  return layer.outShape;
}

function compactChannelValue(value) {
  return String(channelValue(value)).replaceAll(" + ", "+").replaceAll(" / ", "/");
}

function nodeMetaLine(layer) {
  const channels = `c ${compactChannelValue(layer.inputChannels)}→${compactChannelValue(layer.channels)}`;
  const subtitle = moduleSubtitle(layer);
  return subtitle ? `${subtitle} · ${channels}` : channels;
}

function renderStaticText() {
  document.documentElement.lang = htmlLang();
  document.title = t("meta.title");
  document.querySelectorAll("[data-i18n]").forEach((element) => {
    element.textContent = t(element.dataset.i18n);
  });
  document.querySelectorAll("[data-i18n-title]").forEach((element) => {
    element.setAttribute("title", t(element.dataset.i18nTitle));
  });
  document.querySelectorAll("[data-i18n-aria]").forEach((element) => {
    element.setAttribute("aria-label", t(element.dataset.i18nAria));
  });
}

function setLanguage(lang) {
  if (!["zh", "en"].includes(lang) || state.lang === lang) return;
  state.lang = lang;
  try {
    window.localStorage.setItem(LANG_STORAGE_KEY, lang);
  } catch {
    // Ignore storage failures; the in-memory language still updates.
  }
  render();
}

function renderLanguageSwitch() {
  if (!languageSwitch) return;
  languageSwitch.innerHTML = "";
  [
    ["zh", t("language.zh"), t("language.zhAria")],
    ["en", t("language.en"), t("language.enAria")],
  ].forEach(([lang, label, aria]) => {
    const button = document.createElement("button");
    button.className = `language-button${lang === state.lang ? " active" : ""}`;
    button.type = "button";
    button.textContent = label;
    button.setAttribute("aria-label", aria);
    button.setAttribute("aria-pressed", String(lang === state.lang));
    button.addEventListener("click", (event) => {
      event.stopPropagation();
      setLanguage(lang);
    });
    languageSwitch.appendChild(button);
  });
}

function renderModelSwitch() {
  modelSwitch.innerHTML = "";
  const scales = currentScales();
  Object.entries(scales).forEach(([key, model]) => {
    const button = document.createElement("button");
    button.className = `model-button${key === state.modelKey ? " active" : ""}`;
    button.type = "button";
    button.textContent = key;
    button.title = `${currentVersion().name}${key} · ${model.params} params · ${model.gflops} GFLOPs`;
    button.setAttribute("aria-label", state.lang === "en" ? `Choose ${currentVersion().name}${key}` : `选择 ${currentVersion().name}${key}`);
    button.addEventListener("click", () => {
      state.modelKey = key;
      state.expandedId = null;
      // 重置选中层到合理的默认（第 3 个 backbone 层，通常是第一个 CSP 块）
      const layers = resolveLayers(state.modelKey);
      state.selectedId = layers[2]?.id ?? 2;
      state.detailStack = [];
      render();
    });
    modelSwitch.appendChild(button);
  });
}

function renderVersionSwitch() {
  const versionSwitch = document.querySelector("#versionSwitch");
  if (!versionSwitch) return;
  versionSwitch.innerHTML = "";
  Object.values(VERSIONS).forEach((v) => {
    const button = document.createElement("button");
    button.className = `version-button${v.key === state.versionKey ? " active" : ""}`;
    button.type = "button";
    button.innerHTML = `<span class="version-label">${v.name}</span><span class="version-year">${v.year}</span>`;
    button.title = `${v.fullName} · reg_max=${v.regMax}${v.end2end ? " · end2end" : ""}`;
    button.setAttribute("aria-label", state.lang === "en" ? `Switch to ${v.fullName}` : `切换到 ${v.fullName}`);
    button.addEventListener("click", () => {
      if (state.versionKey === v.key) return;
      state.versionKey = v.key;
      state.expandedId = null;
      state.selectedId = 2;
      state.detailStack = [];
      state.detailOpen = false;
      render();
    });
    versionSwitch.appendChild(button);
  });
}

function renderSummary() {
  const model = currentScale();
  const version = currentVersion();
  const layers = resolveLayers(state.modelKey);
  const selected = layers.find((layer) => layer.id === state.selectedId) || layers[2];
  const metrics = [
    [t("summary.version"), version.fullName],
    [t("summary.selected"), `L${selected.id} ${selected.module}`],
    [t("summary.scale"), `${version.name}${state.modelKey}`],
    ["depth × width", `${model.depth} × ${model.width}`],
    ["parameters", model.params],
    ["GFLOPs @640", model.gflops],
  ];

  summaryStrip.innerHTML = metrics
    .map(
      ([label, value]) => `
        <div class="metric">
          <span>${label}</span>
          <strong>${value}</strong>
        </div>
      `,
    )
    .join("");
}

function currentDetectTargets(layers) {
  // 从 Detect 层的 from 字段动态获取 P3/P4/P5 来源层
  const detect = layers.find((l) => l.section === "Detect");
  const sourceIds = detect ? (detect.from || [16, 19, 22]) : [16, 19, 22];
  const labels = ["P3 · stride 8", "P4 · stride 16", "P5 · stride 32"];
  const shapes = ["80×80", "40×40", "20×20"];
  const height = state.expandedId === detect?.id ? EXPANDED_DETECT.height : DETECT_NODE.height;
  const width = state.expandedId === detect?.id ? EXPANDED_DETECT.width : DETECT_NODE.width;
  return sourceIds.map((source, i) => {
    const sourceLayer = layers[source];
    return {
      source,
      x: getDetectX(),
      y: sourceLayer.y + ((sourceLayer.height || NODE.height) - height) / 2,
      width,
      height,
      label: labels[i] || `P${i + 3}`,
      shape: shapes[i] || "",
    };
  });
}

function drawPanelLabels(svg, layers, canvasHeight) {
  const panelHeight = canvasHeight - 78;
  addBox(svg, 24, 42, 392, panelHeight, "oklch(0.964 0.006 220)", "oklch(0.850 0.018 220)", 8);
  addBox(svg, 446, 42, 804, panelHeight, "oklch(0.978 0.004 220)", "oklch(0.850 0.018 220)", 8);
  addBox(svg, 1284, 42, 416, panelHeight, COLORS.panelWarm, "oklch(0.852 0.040 86)", 8);

  addText(svg, "Backbone", 50, 80, { fill: COLORS.title, "font-size": 26, "font-weight": 880 });
  addText(svg, "Head · FPN / PAN", 472, 80, { fill: COLORS.title, "font-size": 26, "font-weight": 880 });
  addText(svg, "Detect", 1310, 80, { fill: "oklch(0.390 0.090 82)", "font-size": 26, "font-weight": 880 });

  const inputX = getNodePos(0)[0] + NODE.width / 2;
  addText(svg, [t("diagram.input"), `${currentInputSize()}×${currentInputSize()}×3`], inputX, 106, {
    fill: COLORS.muted,
    "font-size": 14.4,
    "font-weight": 720,
    "text-anchor": "middle",
    lineGap: 18,
  });
  addPath(svg, `M ${inputX} 118 L ${inputX} 146`, false);

  currentDetectTargets(layers).forEach((target) => {
    const midY = target.y + target.height / 2;
    svg.appendChild(svgEl("line", { x1: 446, y1: midY, x2: 1680, y2: midY, stroke: "oklch(0.872 0.018 220)", "stroke-width": 1, "stroke-dasharray": "7 9" }));
    addText(svg, target.label.replace(" · ", " / "), 1262, midY - 10, { fill: COLORS.muted, "font-size": 13.8, "font-weight": 750, "text-anchor": "end" });
  });
}

function drawBasicUnitCard(parent, x, y, width, height, title, color, lines, clipId, stepData, layerId) {
  // 用一个 <g class="unit-card"> 包裹整张卡片，让小卡片本身可点击查看说明
  const card = svgEl("g", { class: "unit-card" });
  const hasInfo = stepData && stepData.info;
  const displayTitle = pickLang(title);
  const displayLines = pickLang(lines);
  if (hasInfo) {
    card.classList.add("is-clickable");
    card.setAttribute("role", "button");
    card.setAttribute("tabindex", "0");
    card.setAttribute("aria-label", t("diagram.unitAria", { title: displayTitle }));
  }

  const headerHeight = height < 56 ? 26 : 32;
  const fontSize = height < 58 ? 11 : 12.4;
  const lineGap = height < 58 ? 13.5 : 15.6;
  const maxBodyLines = Math.max(1, Math.floor((height - headerHeight - 26) / lineGap) + 1);
  const fittedLines = fitTextLines(displayLines, width - 24, fontSize, maxBodyLines);
  addBox(card, x, y, width, height, "oklch(0.997 0 0)", "oklch(0.514 0.030 165)", 8);
  const clip = svgEl("clipPath", { id: clipId });
  clip.appendChild(svgEl("rect", { x, y, width, height: headerHeight, rx: 8 }));
  card.appendChild(clip);
  const bodyClip = svgEl("clipPath", { id: `${clipId}-body` });
  bodyClip.appendChild(svgEl("rect", { x: x + 1, y: y + headerHeight, width: width - 2, height: height - headerHeight - 2 }));
  card.appendChild(bodyClip);
  card.appendChild(svgEl("rect", { x, y, width, height: headerHeight, fill: color, "clip-path": `url(#${clipId})` }));
  addText(card, trimToUnits(displayTitle, maxTextUnits(width - 22, 14.4)), x + 12, y + (headerHeight === 26 ? 19 : 22), {
    fill: "oklch(0.990 0.002 160)",
    "font-size": 14.4,
    "font-weight": 830,
  });
  const bodyText = addText(card, fittedLines, x + 12, y + headerHeight + 18, {
    fill: COLORS.ink,
    "font-size": fontSize,
    "font-weight": 680,
    lineGap,
  });
  bodyText.setAttribute("clip-path", `url(#${clipId}-body)`);

  // 点击小卡片：把子模块信息 push 到抽屉栈，让抽屉显示其详情（嵌套展开）
  // 注意：SVG 中展开的子卡片都是当前 Layer 的直接子模块，所以点击时重置栈为 [Layer, Submodule]，
  // 避免在浏览深层子模块（如 C3k 内的 Bottleneck）后点击同 Layer 的其他子卡片造成错误嵌套。
  if (hasInfo) {
    const handleCardClick = (event) => {
      if (event) event.stopPropagation();
      // 找到栈底的 Layer 项作为根
      const rootLayer = state.detailStack.find((s) => s.kind === "layer");
      const newStack = rootLayer ? [rootLayer] : [];
      newStack.push({
        kind: "submodule",
        layerId: layerId,
        sub: stepData,
      });
      state.detailStack = newStack;
      state.detailOpen = true;
      renderDetail();
    };
    card.addEventListener("click", handleCardClick);
    card.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        event.stopPropagation();
        handleCardClick();
      }
    });
  }

  parent.appendChild(card);
  return card;
}

function drawExpandedModuleNode(svg, layer, layers) {
  const steps = moduleExpansionSteps(layer, layers);
  if (!steps.length) return;
  const group = svgEl("g", {
    class: "node-hit is-selected is-expanded",
    tabindex: "0",
    role: "button",
    "aria-label": t("diagram.collapseExpanded", { id: layer.id, module: layer.module }),
  });
  group.dataset.id = layer.id;

  const x = layer.x;
  const y = layer.y;
  const width = layer.width || NODE.width;
  const height = layer.height || NODE.height;
  const mid = x + width / 2;
  const usableY = y + 80;
  const bottomPad = 38;
  const gap = steps.length > 1 ? 16 : 0;
  const cardHeight = (height - 80 - bottomPad - gap * (steps.length - 1)) / steps.length;

  addBox(group, x, y, width, height, "oklch(0.995 0.002 160)", COLORS.selected, 8, {
    "stroke-width": 2.6,
  });
  addText(group, state.lang === "en" ? `Layer ${layer.id} ${layer.module} expanded` : `Layer ${layer.id} ${layer.module} 展开`, x + 16, y + 26, {
    fill: COLORS.title,
    "font-size": 15.4,
    "font-weight": 870,
  });
  addText(group, trimToUnits(`in ${batchShape(layer.inputShape)}`, maxTextUnits(width - 32, 12.4)), mid, y + 54, {
    fill: COLORS.ink,
    "font-size": 12.4,
    "font-weight": 760,
    "text-anchor": "middle",
  });
  addPath(group, `M ${mid} ${y + 62} L ${mid} ${usableY}`, false);

  steps.forEach((item, index) => {
    const cardY = usableY + index * (cardHeight + gap);
    drawBasicUnitCard(
      group,
      x + 16,
      cardY,
      width - 32,
      cardHeight,
      item.title,
      unitColor(item.kind),
      pickLang(item.lines),
      `unit-clip-${layer.id}-${index}`,
      item,
      layer.id,
    );
    if (index < steps.length - 1) {
      addPath(group, `M ${mid} ${cardY + cardHeight} L ${mid} ${cardY + cardHeight + gap}`, false);
    }
  });

  addText(group, trimToUnits(`out ${batchShape(layer.outShape)}`, maxTextUnits(width - 32, 12.4)), mid, y + height - 14, {
    fill: COLORS.ink,
    "font-size": 12.4,
    "font-weight": 760,
    "text-anchor": "middle",
  });

  group.addEventListener("click", (event) => {
    event.stopPropagation();
    selectLayer(layer.id);
  });
  group.addEventListener("keydown", (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      selectLayer(layer.id);
    }
  });
  svg.appendChild(group);
}

function drawLayerNode(svg, layer) {
  const isExpanded = layer.id === state.expandedId;
  if (isExpanded && isLayoutExpandable(layer)) {
    drawExpandedModuleNode(svg, layer, resolveLayers(state.modelKey));
    return;
  }

  // 是否需要绘制模块重复堆叠指示器（C3k2 / C2PSA 的 repeats 会随 depth_multiple 缩放）
  const hasRepeatViz = (layer.module === "C3k2" || layer.module === "C2PSA") && layer.repeats > 1;
  const repeatCount = layer.repeats || 1;

  const group = svgEl("g", {
    class: `node-hit${layer.id === state.selectedId ? " is-selected" : ""}${isExpanded ? " is-expanded" : ""}`,
    tabindex: "0",
    role: "button",
    "aria-label": t("diagram.nodeAria", {
      action: layer.module === "Conv" ? (isExpanded ? t("diagram.actionCollapse") : t("diagram.actionExpand")) : t("diagram.actionView"),
      id: layer.id,
      module: layer.module,
    }),
  });
  group.dataset.id = layer.id;

  // 当 repeats > 1 时，先在右下方画 N-1 个偏移矩形，模拟"堆叠卡片"效果
  if (hasRepeatViz) {
    for (let i = repeatCount - 1; i >= 1; i--) {
      const offset = i * 3;
      addBox(
        group,
        layer.x + offset,
        layer.y + offset,
        NODE.width,
        NODE.height,
        nodeFill(layer),
        "oklch(0.610 0.034 220)",
        8,
        { opacity: 0.35 - i * 0.08, "stroke-width": 1 },
      );
    }
  }

  addBox(group, layer.x, layer.y, NODE.width, NODE.height, nodeFill(layer), layer.id === state.selectedId ? COLORS.selected : "oklch(0.610 0.034 220)", 8, {
    "stroke-width": layer.id === state.selectedId ? 2.8 : 1.35,
  });
  group.appendChild(svgEl("line", { x1: layer.x + NODE.width - 56, y1: layer.y, x2: layer.x + NODE.width - 56, y2: layer.y + NODE.height, stroke: "oklch(0.620 0.030 220)", "stroke-width": 1 }));
  const contentWidth = NODE.width - 78;
  addText(group, trimToUnits(layer.module, maxTextUnits(contentWidth, 20)), layer.x + 16, layer.y + 28, {
    fill: COLORS.ink,
    "font-size": 20,
    "font-weight": 860,
  });
  addText(group, fitTextLines(nodeMetaLine(layer), contentWidth, 13, 1), layer.x + 16, layer.y + 54, {
    fill: COLORS.ink,
    "font-size": 13,
    "font-weight": 680,
  });
  addText(group, fitTextLines(`out ${shortShape(layer)}`, contentWidth, 12.5, 1), layer.x + 16, layer.y + 78, {
    fill: COLORS.ink,
    "font-size": 12.5,
    "font-weight": 650,
  });

  // 模块重复堆叠条 + ×N 徽章（仅当 repeats > 1 时显示）
  if (hasRepeatViz) {
    const stackY = layer.y + NODE.height - 6;
    const stackX0 = layer.x + 16;
    const blockW = 14;
    const blockH = 4;
    const blockGap = 2;
    const fillColor = nodeFill(layer);
    for (let i = 0; i < repeatCount; i++) {
      group.appendChild(svgEl("rect", {
        x: stackX0 + i * (blockW + blockGap),
        y: stackY,
        width: blockW,
        height: blockH,
        rx: 1,
        fill: fillColor,
        opacity: 0.55 + i * 0.18,
        stroke: "oklch(0.380 0.030 220)",
        "stroke-width": 0.6,
      }));
    }
    // ×N 徽章
    const badgeX = stackX0 + repeatCount * (blockW + blockGap) + 6;
    group.appendChild(svgEl("rect", {
      x: badgeX,
      y: stackY - 3,
      width: 26,
      height: 10,
      rx: 5,
      fill: "oklch(0.392 0.095 232)",
    }));
    addText(group, `×${repeatCount}`, badgeX + 13, stackY + 5, {
      fill: "oklch(0.985 0.003 220)",
      "font-size": 9.5,
      "font-weight": 880,
      "text-anchor": "middle",
    });
  }

  if (isExpanded) {
    addText(group, t("diagram.expanded"), layer.x + NODE.width - 28, layer.y + 78, {
      fill: COLORS.selected,
      "font-size": 12,
      "font-weight": 850,
      "text-anchor": "middle",
    });
  }
  addText(group, [`${layer.id}`, layer.stage], layer.x + NODE.width - 28, layer.y + 26, {
    fill: COLORS.ink,
    "font-size": 13.2,
    "font-weight": 850,
    "text-anchor": "middle",
    lineGap: 24,
  });

  group.addEventListener("click", (event) => {
    event.stopPropagation();
    selectLayer(layer.id);
  });
  group.addEventListener("keydown", (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      selectLayer(layer.id);
    }
  });
  svg.appendChild(group);
}

function drawDetectNode(svg, detectLayer, target) {
  const isExpanded = state.expandedId === detectLayer.id;
  const pseudo = { ...detectLayer, x: target.x, y: target.y, width: target.width || DETECT_NODE.width, height: target.height || DETECT_NODE.height };
  const group = svgEl("g", {
    class: `node-hit${detectLayer.id === state.selectedId ? " is-selected" : ""}${isExpanded ? " is-expanded" : ""}`,
    tabindex: "0",
    role: "button",
    "aria-label": t("diagram.detectAria", {
      action: isExpanded ? t("diagram.actionCollapse") : t("diagram.actionExpand"),
      label: target.label,
    }),
  });
  group.dataset.id = detectLayer.id;

  addBox(group, pseudo.x, pseudo.y, pseudo.width, pseudo.height, COLORS.detect, detectLayer.id === state.selectedId ? COLORS.selected : "oklch(0.610 0.040 165)", 8, {
    "stroke-width": detectLayer.id === state.selectedId ? 2.8 : 1.35,
  });
  if (isExpanded) {
    const branch = detectBranchChannels(resolveLayers(state.modelKey));
    const sourceLayer = resolveLayers(state.modelKey)[target.source];
    addText(group, state.lang === "en" ? `${target.label} Detect expanded` : `${target.label} Detect 展开`, pseudo.x + 14, pseudo.y + 24, { fill: COLORS.ink, "font-size": 14, "font-weight": 850 });
    addText(group, `in ${batchShape(sourceLayer.outShape)}`, pseudo.x + 14, pseudo.y + 48, { fill: COLORS.ink, "font-size": 12, "font-weight": 720 });
    drawBasicUnitCard(group, pseudo.x + 14, pseudo.y + 62, pseudo.width - 28, 52, "Box branch", unitColor("detect"), [
      `${sourceLayer.channels} → ${branch.box} → ${branch.regMax * 4}`,
      `out ${target.shape}×${branch.regMax * 4}`,
    ], `detect-clip-${target.source}-box`, { title: "Box branch", kind: "detect", infoKey: "Box branch", info: getUnitInfo("Box branch") }, detectLayer.id);
    drawBasicUnitCard(group, pseudo.x + 14, pseudo.y + 122, pseudo.width - 28, 52, "Cls branch", unitColor("conv"), [
      `${sourceLayer.channels} → ${branch.cls} → ${branch.nc}`,
      `out ${target.shape}×${branch.nc}`,
    ], `detect-clip-${target.source}-cls`, { title: "Cls branch", kind: "conv", infoKey: "Cls branch", info: getUnitInfo("Cls branch") }, detectLayer.id);
  } else {
    addText(group, target.label, pseudo.x + 16, pseudo.y + 24, { fill: COLORS.ink, "font-size": 13.8, "font-weight": 760 });
    addText(group, "Detect", pseudo.x + 16, pseudo.y + 50, { fill: COLORS.ink, "font-size": 22, "font-weight": 880 });
    addText(group, target.shape, pseudo.x + pseudo.width - 16, pseudo.y + 50, { fill: COLORS.ink, "font-size": 14.4, "font-weight": 820, "text-anchor": "end" });
  }

  group.addEventListener("click", (event) => {
    event.stopPropagation();
    selectLayer(detectLayer.id);
  });
  group.addEventListener("keydown", (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      selectLayer(detectLayer.id);
    }
  });
  svg.appendChild(group);
  return pseudo;
}

function drawMainDiagram(svg, layers, canvasHeight) {
  drawPanelLabels(svg, layers, canvasHeight);
  const detectTargets = currentDetectTargets(layers);

  // 按 section 分组
  const backboneIds = layers.filter((l) => l.section === "Backbone").map((l) => l.id);
  const headIds = layers.filter((l) => l.section === "Head").map((l) => l.id);
  const detectIds = layers.filter((l) => l.section === "Detect").map((l) => l.id);
  const detectId = detectIds[0];

  // 在 head 内部区分 FPN / PAN：FPN 是首个 s=2 Conv 之前的所有层
  let panStartIdx = headIds.findIndex((id) => {
    const l = layers[id];
    return l.module === "Conv" && l.args[2] === 2; // s=2 表示下采样
  });
  if (panStartIdx < 0) panStartIdx = headIds.length;
  const fpnIds = headIds.slice(0, panStartIdx);
  const panIds = headIds.slice(panStartIdx);

  // Backbone 链（从上到下）
  backboneIds.forEach((id, i) => {
    if (i > 0) {
      const prev = backboneIds[i - 1];
      addPath(svg, pathBetween(layers[prev], layers[id]), false, "arrow", isEdgeSelected(prev, id));
    }
  });

  // Backbone → FPN 转场（右 → 左）
  if (fpnIds.length > 0 && backboneIds.length > 0) {
    const lastBackbone = backboneIds[backboneIds.length - 1];
    const firstFpn = fpnIds[0];
    addPath(svg, pathBetween(layers[lastBackbone], layers[firstFpn], "right", "left"), false, "arrow", isEdgeSelected(lastBackbone, firstFpn));
  }

  // FPN 链（从下到上，top→bottom）
  fpnIds.forEach((id, i) => {
    if (i > 0) {
      const prev = fpnIds[i - 1];
      addPath(svg, pathBetween(layers[prev], layers[id], "top", "bottom"), false, "arrow", isEdgeSelected(prev, id));
    }
  });

  // FPN → PAN 转场（右 → 左）
  if (fpnIds.length > 0 && panIds.length > 0) {
    const lastFpn = fpnIds[fpnIds.length - 1];
    const firstPan = panIds[0];
    addPath(svg, pathBetween(layers[lastFpn], layers[firstPan], "right", "left"), false, "arrow", isEdgeSelected(lastFpn, firstPan));
  }

  // PAN 链（从上到下，bottom→top）
  panIds.forEach((id, i) => {
    if (i > 0) {
      const prev = panIds[i - 1];
      addPath(svg, pathBetween(layers[prev], layers[id], "bottom", "top"), false, "arrow", isEdgeSelected(prev, id));
    }
  });

  // 跳跃连接（head 中任何 from 为数组的层，除 -1 外都是跨层连接）
  headIds.forEach((id) => {
    const layer = layers[id];
    if (Array.isArray(layer.from)) {
      layer.from.forEach((ref) => {
        if (ref === -1) return;
        const sourceLayer = layers[ref];
        if (!sourceLayer) return;
        addPath(svg, pathBetween(sourceLayer, layer, "right", "left"), true, "skipArrow", state.selectedId === ref || state.selectedId === id);
      });
    }
  });

  // Detect 目标连接
  detectTargets.forEach((target) => {
    const pseudo = { ...layers[detectId], x: target.x, y: target.y, width: target.width || DETECT_NODE.width, height: target.height || DETECT_NODE.height };
    addPath(svg, pathBetween(layers[target.source], pseudo, "right", "left"), false, "arrow", state.selectedId === target.source || state.selectedId === detectId);
  });

  // 绘制所有节点
  [...backboneIds, ...headIds].forEach((id) => drawLayerNode(svg, layers[id]));
  detectTargets.forEach((target) => drawDetectNode(svg, layers[detectId], target));
}

function yamlArgs(layer) {
  const formatted = layer.args
    .map((arg) => {
      if (arg === null) return "None";
      if (arg === true) return "True";
      if (arg === false) return "False";
      if (typeof arg === "string") return arg === "nearest" ? '"nearest"' : arg;
      return arg;
    })
    .join(", ");
  const from = Array.isArray(layer.from) ? `[${layer.from.join(", ")}]` : layer.from;
  const moduleName = layer.module === "Upsample" ? "nn.Upsample" : layer.module;
  return `[${from}, ${layer.repeat}, ${moduleName}, [${formatted}]]`;
}

function formatFrom(layer) {
  return Array.isArray(layer.from) ? `[${layer.from.join(", ")}]` : String(layer.from);
}

function inputSources(layers, layer) {
  if (!Array.isArray(layer.from)) return [{ label: layer.from === -1 ? `Layer ${layer.id - 1}` : `Layer ${layer.from}`, layer: layers[layer.from === -1 ? layer.id - 1 : layer.from] }].filter((item) => item.layer);
  return layer.from.map((ref) => {
    const id = ref === -1 ? layer.id - 1 : ref;
    return { label: ref === -1 ? `Layer ${layer.id - 1}` : `Layer ${ref}`, layer: layers[id] };
  });
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function detailShape(size, channels) {
  return `${size}×${size}×${channels}`;
}

function parseShape(shape) {
  const match = String(shape).match(/(\d+)×(\d+)×(\d+)/);
  if (!match) return null;
  return {
    h: Number(match[1]),
    w: Number(match[2]),
    c: Number(match[3]),
  };
}

function batchShape(shape) {
  const parsed = parseShape(shape);
  // 用 N 表示 batch 维度，与 PyTorch NCHW 命名一致，比 ONNX 的 ? 更具教学意义
  return parsed ? `N×${parsed.c}×${parsed.h}×${parsed.w}` : shape;
}

function shapePair(shape) {
  return `HWC ${shape} / NCHW ${batchShape(shape)}`;
}

function convOutSize(inputSize, params) {
  return Math.floor((inputSize + 2 * params.p - params.k) / params.s) + 1;
}

function hasScaledOutputChannels(layer) {
  return ["Conv", "C3", "C2f", "C3k2", "SPPF", "C2PSA"].includes(layer.module);
}

function step(title, kind, lines, infoKey) {
  const info = infoKey ? (getUnitInfo(infoKey) || null) : null;
  return { title, kind, lines, infoKey, info };
}

function moduleExpansionSteps(layer, layers) {
  const size = layer.outSize;

  if (layer.module === "Conv") {
    const p = convParams(layer);
    return [
      step("Conv2d", "conv", [
        `in ${batchShape(layer.inputShape)}`,
        `out ${batchShape(layer.outShape)}`,
        `Filter <${layer.channels}×${layer.inputChannels}×${p.k}×${p.k}>`,
      ], "Conv2d"),
      step("BatchNorm2d", "norm", [
        `in ${batchShape(layer.outShape)}`,
        `out ${batchShape(layer.outShape)}`,
        `Bias/Mean/Scale/Var (${layer.channels})`,
      ], "BatchNorm2d"),
      step("SiLU", "act", [
        `in ${batchShape(layer.outShape)}`,
        `out ${batchShape(layer.outShape)}`,
      ], "SiLU"),
    ];
  }

  if (layer.module === "C2f") {
    const hidden = Math.floor(layer.channels * (layer.args[2] ?? 0.5));
    const shortcut = layer.args[1] === true;
    const concatChannels = hidden * (2 + layer.repeats);
    return [
      step("cv1 Conv", "conv", [
        `in ${batchShape(layer.inputShape)}`,
        `out N×${hidden * 2}×${size}×${size}`,
        "k=1, s=1, p=0",
      ], "cv1 Conv"),
      step("Split / chunk(2)", "split", [
        `N×${hidden * 2}×${size}×${size}`,
        `2 × N×${hidden}×${size}×${size}`,
      ], "Split"),
      step(`${layer.repeats}× Bottleneck`, "inner", [
        `in N×${hidden}×${size}×${size}`,
        `out N×${hidden}×${size}×${size}`,
        `串接，shortcut=${shortcut}`,
      ], "Bottleneck"),
      step("Concat", "concat", [
        `in 保留 + ${layer.repeats} block outputs`,
        `out N×${concatChannels}×${size}×${size}`,
      ], "Concat"),
      step("cv2 Conv", "conv", [
        `in N×${concatChannels}×${size}×${size}`,
        `out ${batchShape(layer.outShape)}`,
        "k=1, s=1, p=0",
      ], "cv2 Conv"),
    ];
  }

  if (layer.module === "C3") {
    const hidden = Math.floor(layer.channels * (layer.args[2] ?? 0.5));
    const shortcut = layer.args[1] !== false;
    const concatChannels = hidden * 2;
    return [
      step("cv1 Conv", "conv", [
        `in ${batchShape(layer.inputShape)}`,
        `out N×${hidden}×${size}×${size}`,
        "k=1, s=1, p=0 (主路)",
      ], "cv1 Conv"),
      step("cv2 Conv", "conv", [
        `in ${batchShape(layer.inputShape)}`,
        `out N×${hidden}×${size}×${size}`,
        "k=1, s=1, p=0 (旁路)",
      ], "cv2 Conv"),
      step(`${layer.repeats}× Bottleneck`, "inner", [
        `in N×${hidden}×${size}×${size}`,
        `out N×${hidden}×${size}×${size}`,
        `k=(1,3), shortcut=${shortcut}`,
      ], "Bottleneck"),
      step("Concat", "concat", [
        `主路 + 旁路`,
        `out N×${concatChannels}×${size}×${size}`,
      ], "Concat"),
      step("cv3 Conv", "conv", [
        `in N×${concatChannels}×${size}×${size}`,
        `out ${batchShape(layer.outShape)}`,
        "k=1, s=1, p=0",
      ], "cv2 Conv"),
    ];
  }

  if (layer.module === "C3k2") {
    const hidden = hiddenChannels(layer);
    const branch = layer.c3kEnabled ? "C3k" : "Bottleneck";
    const concatChannels = hidden * (2 + layer.repeats);
    return [
      step("cv1 Conv", "conv", [
        `in ${batchShape(layer.inputShape)}`,
        `out N×${hidden * 2}×${size}×${size}`,
        "k=1, s=1, p=0",
      ], "cv1 Conv"),
      step("Split", "split", [
        `N×${hidden * 2}×${size}×${size}`,
        `2 × N×${hidden}×${size}×${size}`,
      ], "Split"),
      step(`${layer.repeats}× ${branch}`, "inner", [
        `in N×${hidden}×${size}×${size}`,
        `out N×${hidden}×${size}×${size}`,
        layer.c3kSource,
      ], branch),
      step("Concat", "concat", [
        `in kept + ${layer.repeats} block outputs`,
        `out N×${concatChannels}×${size}×${size}`,
      ], "Concat"),
      step("cv2 Conv", "conv", [
        `in N×${concatChannels}×${size}×${size}`,
        `out ${batchShape(layer.outShape)}`,
        "k=1, s=1, p=0",
      ], "cv2 Conv"),
    ];
  }

  if (layer.module === "SPPF") {
    const hidden = Math.floor(Number(layer.inputChannels) / 2);
    const hasShortcut = layer.args[3] === true;
    return [
      step("cv1 Conv", "conv", [
        `in ${batchShape(layer.inputShape)}`,
        `out N×${hidden}×${size}×${size}`,
        "k=1, s=1, p=0",
      ], "cv1 Conv"),
      step("MaxPool2d #1", "pool", [
        "k=5, s=1, p=2",
        `out N×${hidden}×${size}×${size}`,
      ], "MaxPool2d"),
      step("MaxPool2d #2/#3", "pool", [
        "连续池化扩大感受野",
        `each out N×${hidden}×${size}×${size}`,
      ], "MaxPool2d"),
      step("Concat", "concat", [
        `4 branches × ${hidden}`,
        `out N×${hidden * 4}×${size}×${size}`,
      ], "Concat"),
      step("cv2 Conv", "conv", [
        `in N×${hidden * 4}×${size}×${size}`,
        `out ${batchShape(layer.outShape)}`,
      ], "cv2 Conv"),
      ...(hasShortcut ? [step("Shortcut (add)", "inner", [
        `input + cv2 output`,
        `YOLO26 新增残差连接`,
      ], "Bottleneck")] : []),
    ];
  }

  if (layer.module === "C2PSA") {
    const hidden = Math.floor(layer.channels / 2);
    return [
      step("cv1 Conv", "conv", [
        `in ${batchShape(layer.inputShape)}`,
        `out N×${hidden * 2}×${size}×${size}`,
      ], "cv1 Conv"),
      step("Split a/b", "split", [
        `a N×${hidden}×${size}×${size}`,
        `b N×${hidden}×${size}×${size}`,
      ], "Split"),
      step(`${layer.repeats}× PSABlock`, "inner", [
        `in N×${hidden}×${size}×${size}`,
        `out N×${hidden}×${size}×${size}`,
      ], "PSABlock"),
      step("Concat", "concat", [
        `a + b = ${hidden * 2} channels`,
        `out N×${hidden * 2}×${size}×${size}`,
      ], "Concat"),
      step("cv2 Conv", "conv", [
        `in N×${hidden * 2}×${size}×${size}`,
        `out ${batchShape(layer.outShape)}`,
      ], "cv2 Conv"),
    ];
  }

  if (layer.module === "Upsample") {
    return [
      step("Nearest x2", "upsample", [
        `in ${shapePair(layer.inputShape)}`,
        `out ${shapePair(layer.outShape)}`,
        "channels unchanged",
      ], "Nearest Upsample"),
    ];
  }

  if (layer.module === "Concat") {
    const sources = inputSources(layers, layer);
    return [
      step("Inputs", "split", sources.map((source) => `${source.label}: ${source.layer.outShape}`), "Inputs"),
      step("torch.cat(dim=1)", "concat", [
        `c_in ${layer.inputChannels}`,
        `out ${shapePair(layer.outShape)}`,
      ], "torch.cat"),
    ];
  }

  return [];
}

const MODULE_EXPLAINERS = {
  Conv(layer) {
    const p = convParams(layer);
    return [
      step("Conv2d", "conv", [
        `k=${p.k}, s=${p.s}, p=${p.p}`,
        `c_in=${layer.inputChannels}, c_out=${layer.channels}`,
        `in: ${layer.inputShape}`,
        `out: ${layer.outShape}`,
      ]),
      step("BatchNorm2d", "norm", [
        `num_features=${layer.channels}`,
        `in/out: ${layer.outShape}`,
      ]),
      step("SiLU", "act", [
        "activation: x * sigmoid(x)",
        `out: ${layer.outShape}`,
      ]),
    ];
  },
  C3k2(layer) {
    const hidden = hiddenChannels(layer);
    const size = layer.outSize;
    const branch = layer.c3kEnabled ? "C3k" : "Bottleneck";
    const concatChannels = hidden * (2 + layer.repeats);
    return [
      step("cv1 Conv", "conv", [
        "k=1, s=1, p=0",
        `c_in=${layer.inputChannels}, c_out=${hidden * 2}`,
        `in: ${layer.inputShape}`,
        `out: ${detailShape(size, hidden * 2)}`,
      ]),
      step("Split / chunk", "split", [
        `2 tensors: ${detailShape(size, hidden)} + ${detailShape(size, hidden)}`,
        "一路保留，一路进入内部块",
      ]),
      step(`${layer.repeats}× ${branch}`, "inner", [
        branch === "C3k" ? "每个 C3k 内含 C3-style 结构和 2 个 Bottleneck(k=3)" : "每个 Bottleneck 由两层 k=3 Conv 组成",
        `c=${hidden} → ${hidden}`,
        `in/out: ${detailShape(size, hidden)}`,
        `来源: ${layer.c3kSource}`,
      ]),
      step("Concat", "concat", [
        `channels=(2 + repeat) × hidden = ${concatChannels}`,
        `out: ${detailShape(size, concatChannels)}`,
      ]),
      step("cv2 Conv", "conv", [
        "k=1, s=1, p=0",
        `c_in=${concatChannels}, c_out=${layer.channels}`,
        `out: ${layer.outShape}`,
      ]),
    ];
  },
  C2f(layer) {
    const hidden = Math.floor(layer.channels * (layer.args[2] ?? 0.5));
    const size = layer.outSize;
    const shortcut = layer.args[1] === true;
    const concatChannels = hidden * (2 + layer.repeats);
    return [
      step("cv1 Conv", "conv", [
        "k=1, s=1, p=0",
        `c_in=${layer.inputChannels}, c_out=${hidden * 2}`,
        `out: ${detailShape(size, hidden * 2)}`,
      ]),
      step("Split / chunk", "split", [
        `2 tensors: ${detailShape(size, hidden)} + ${detailShape(size, hidden)}`,
        "一路保留，一路串接 n 个 Bottleneck",
      ]),
      step(`${layer.repeats}× Bottleneck`, "inner", [
        "每个 Bottleneck 由两层 k=3 Conv 组成，串接输出",
        `shortcut=${shortcut}`,
        `c=${hidden} → ${hidden}`,
        `in/out: ${detailShape(size, hidden)}`,
      ]),
      step("Concat", "concat", [
        `channels=(2 + repeat) × hidden = ${concatChannels}`,
        `out: ${detailShape(size, concatChannels)}`,
      ]),
      step("cv2 Conv", "conv", [
        "k=1, s=1, p=0",
        `c_in=${concatChannels}, c_out=${layer.channels}`,
        `out: ${layer.outShape}`,
      ]),
    ];
  },
  C3(layer) {
    const hidden = Math.floor(layer.channels * (layer.args[2] ?? 0.5));
    const size = layer.outSize;
    const shortcut = layer.args[1] !== false;
    const concatChannels = hidden * 2;
    return [
      step("cv1 Conv (主路)", "conv", [
        "k=1, s=1, p=0",
        `c_in=${layer.inputChannels}, c_out=${hidden}`,
        `out: ${detailShape(size, hidden)}`,
      ]),
      step("cv2 Conv (旁路)", "conv", [
        "k=1, s=1, p=0",
        `c_in=${layer.inputChannels}, c_out=${hidden}`,
        `out: ${detailShape(size, hidden)}`,
      ]),
      step(`${layer.repeats}× Bottleneck`, "inner", [
        "每个 Bottleneck：k=1 + k=3，可选 shortcut",
        `shortcut=${shortcut}`,
        `c=${hidden} → ${hidden}`,
        `in/out: ${detailShape(size, hidden)}`,
      ]),
      step("Concat", "concat", [
        `主路 + 旁路 = ${concatChannels}`,
        `out: ${detailShape(size, concatChannels)}`,
      ]),
      step("cv3 Conv", "conv", [
        "k=1, s=1, p=0",
        `c_in=${concatChannels}, c_out=${layer.channels}`,
        `out: ${layer.outShape}`,
      ]),
    ];
  },
  SPPF(layer) {
    const inputChannels = Number(layer.inputChannels);
    const hidden = Math.floor(inputChannels / 2);
    const size = layer.outSize;
    const hasShortcut = layer.args[3] === true;
    return [
      step("cv1 Conv", "conv", [
        "k=1, s=1, p=0",
        `c_in=${inputChannels}, c_out=${hidden}`,
        `out: ${detailShape(size, hidden)}`,
      ]),
      step("MaxPool2d #1", "pool", [
        "k=5, s=1, p=2",
        `in/out: ${detailShape(size, hidden)}`,
      ]),
      step("MaxPool2d #2", "pool", [
        "k=5, s=1, p=2",
        `in/out: ${detailShape(size, hidden)}`,
      ]),
      step("MaxPool2d #3", "pool", [
        "k=5, s=1, p=2",
        `in/out: ${detailShape(size, hidden)}`,
      ]),
      step("Concat", "concat", [
        `4 branches × ${hidden} = ${hidden * 4} channels`,
        `out: ${detailShape(size, hidden * 4)}`,
      ]),
      step("cv2 Conv", "conv", [
        "k=1, s=1, p=0",
        `c_in=${hidden * 4}, c_out=${layer.channels}`,
        `out: ${layer.outShape}`,
      ]),
      ...(hasShortcut ? [step("Shortcut (add)", "inner", [
        "input + cv2 output",
        "YOLO26 新增残差连接，当 c_in == c_out 时生效",
      ])] : []),
    ];
  },
  C2PSA(layer) {
    const hidden = Math.floor(layer.channels / 2);
    const size = layer.outSize;
    return [
      step("cv1 Conv", "conv", [
        "k=1, s=1, p=0",
        `c_in=${layer.inputChannels}, c_out=${hidden * 2}`,
        `out: ${detailShape(size, hidden * 2)}`,
      ]),
      step("Split a/b", "split", [
        `a=${detailShape(size, hidden)}`,
        `b=${detailShape(size, hidden)}`,
      ]),
      step(`${layer.repeats}× PSABlock`, "inner", [
        "Attention(c) + FFN(c → 2c → c)",
        `num_heads=max(${hidden}//64, 1)`,
        `in/out: ${detailShape(size, hidden)}`,
      ]),
      step("Concat", "concat", [
        `a + b = ${hidden * 2} channels`,
        `out: ${detailShape(size, hidden * 2)}`,
      ]),
      step("cv2 Conv", "conv", [
        "k=1, s=1, p=0",
        `c_in=${hidden * 2}, c_out=${layer.channels}`,
        `out: ${layer.outShape}`,
      ]),
    ];
  },
  Upsample(layer) {
    return [
      step("Nearest Upsample", "upsample", [
        "scale_factor=2, mode=nearest",
        `in: ${layer.inputShape}`,
        `out: ${layer.outShape}`,
      ]),
    ];
  },
  Concat(layer, layers) {
    const sources = inputSources(layers, layer);
    return [
      step("Inputs", "split", sources.map((source) => `${source.label}: ${source.layer.outShape}`)),
      step("torch.cat", "concat", [
        `dim=${layer.args[0]}`,
        `c_in=${layer.inputChannels}`,
        `c_out=${layer.channels}`,
        `out: ${layer.outShape}`,
      ]),
    ];
  },
};

function renderFlowSteps(steps) {
  return `
    <div class="module-flow">
      ${steps
        .map(
          (item, index) => `
            <div class="flow-step ${item.kind}">
              <div class="flow-title">
                <span>${index + 1}</span>
                <strong>${escapeHtml(pickLang(item.title))}</strong>
              </div>
              <ul>
                ${pickLang(item.lines).map((line) => `<li>${escapeHtml(line)}</li>`).join("")}
              </ul>
            </div>
            ${index < steps.length - 1 ? '<div class="flow-arrow">↓</div>' : ""}
          `,
        )
        .join("")}
    </div>
  `;
}

function renderDetectFlow(layers) {
  const branch = detectBranchChannels(layers);
  // 动态获取 Detect 来源层（P3/P4/P5）
  const detect = layers.find((l) => l.section === "Detect");
  const sourceIds = detect ? (detect.from || []) : [];
  const sources = sourceIds.map((id) => layers[id]).filter(Boolean);
  const version = currentVersion();
  const clsConv = version.legacy ? "Conv k=3 + Conv k=1" : "DWConv k=3 + Conv k=1";
  const noteText = version.end2end
    ? (state.lang === "en"
      ? `YOLO26 enables end2end mode: training learns one2many (traditional NMS path) plus one2one matching. After fuse(), inference keeps only the one2one head and does not need NMS. reg_max=${branch.regMax} makes DFL degenerate to direct regression of ${branch.regMax * 4} continuous values.`
      : `YOLO26 启用 end2end 模式：训练时同时学 one2many（一对多，传统 NMS 流程）+ one2one（一对一匹配），推理 fuse() 后只保留 one2one 头，无需 NMS。reg_max=${branch.regMax} 让 DFL 退化为直接回归 ${branch.regMax * 4} 个连续值。`)
    : (state.lang === "en"
      ? `Detect first produces ${branch.no} logits per location: ${branch.regMax * 4} box distribution channels plus ${branch.nc} class scores. During inference, DFL converts the box distribution into four continuous offsets, then decodes them with grid points and stride.`
      : `Detect 每个位置先得到 ${branch.no} 个 logits：${branch.regMax * 4} 个 box 分布 + ${branch.nc} 个类别分数。推理时 DFL 把 box 分布转成 4 个连续边框偏移，再结合网格点和 stride 解码。`);
  return `
    <div class="detect-scale-grid">
      ${sources
        .map((source, index) => {
          const size = source.outSize;
          const label = state.lang === "en" ? ["P3 small objects", "P4 medium objects", "P5 large objects"][index] : ["P3 小目标", "P4 中目标", "P5 大目标"][index];
          return `
            <article class="detect-scale">
              <h4>${label} · Layer ${source.id}</h4>
              <p>${source.outShape}</p>
              <div class="branch-block">
                <strong>Box branch</strong>
                <ol>
                  <li>Conv k=3,s=1,p=1 · ${source.channels} → ${branch.box} · ${detailShape(size, branch.box)}</li>
                  <li>Conv k=3,s=1,p=1 · ${branch.box} → ${branch.box} · ${detailShape(size, branch.box)}</li>
                  <li>Conv2d k=1,s=1,p=0 · ${branch.box} → ${branch.regMax * 4} · ${detailShape(size, branch.regMax * 4)}</li>
                </ol>
              </div>
              <div class="branch-block">
                <strong>Cls branch</strong>
                <ol>
                  <li>${clsConv} · ${source.channels} → ${branch.cls} · ${detailShape(size, branch.cls)}</li>
                  <li>${clsConv} · ${branch.cls} → ${branch.cls} · ${detailShape(size, branch.cls)}</li>
                  <li>Conv2d k=1,s=1,p=0 · ${branch.cls} → ${branch.nc} · ${detailShape(size, branch.nc)}</li>
                </ol>
              </div>
            </article>
          `;
        })
        .join("")}
    </div>
    <div class="note">${noteText}</div>
  `;
}

function renderModuleFlow(layers, layer) {
  if (layer.module === "Detect") return renderDetectFlow(layers);
  const explainer = MODULE_EXPLAINERS[layer.module];
  if (!explainer) return "";
  return renderFlowSteps(explainer(layer, layers));
}

function renderKeyGrid(layer) {
  const values = [
    ["from", formatFrom(layer)],
    [state.lang === "en" ? "Input shape (HWC)" : "输入 shape (HWC)", layer.inputShape],
    [state.lang === "en" ? "Output shape (HWC)" : "输出 shape (HWC)", layer.outShape],
    ["c_in", layer.inputChannels],
    ["c_out", Array.isArray(layer.channels) ? layer.channels.join(" / ") : layer.channels],
    ["repeat", state.lang === "en" ? `YAML ${layer.repeat} → actual ${layer.repeats}` : `YAML ${layer.repeat} → 实际 ${layer.repeats}`],
  ];

  if (layer.module === "C3k2") {
    values.push(["hidden", hiddenChannels(layer)]);
    values.push([state.lang === "en" ? "inner block" : "内部块", layer.c3kEnabled ? `C3k (${layer.c3kSource})` : "Bottleneck"]);
  }
  if (layer.module === "Detect") {
    const branch = detectBranchChannels(resolveLayers(state.modelKey));
    values.push(["reg_max / nc", `${branch.regMax} / ${branch.nc}`]);
    values.push(["box / cls hidden", `${branch.box} / ${branch.cls}`]);
  }

  return `
    <div class="kv-grid">
      ${values
        .map(
          ([label, value]) => `
            <div class="kv">
              <span>${escapeHtml(label)}</span>
              <strong>${escapeHtml(value)}</strong>
            </div>
          `,
        )
        .join("")}
    </div>
  `;
}

function renderShapeConvention(layer) {
  if (layer.module === "Detect") {
    return `
      <div class="note">
        ${escapeHtml(t("shape.detect"))}
      </div>
    `;
  }
  return `
    <div class="note">
      ${escapeHtml(t("shape.standard", { hwc: layer.outShape, nchw: batchShape(layer.outShape) }))}
    </div>
  `;
}

function channelValue(value) {
  return Array.isArray(value) ? value.join(" / ") : value;
}

function renderChannelExplanation(layers, layer) {
  const inputSource = (() => {
    if (layer.id === 0) return t("channels.sourceInput");
    if (layer.module === "Concat") {
      const sources = inputSources(layers, layer)
        .map((source) => t("channels.sourceItem", { label: source.label, channels: source.layer.channels }))
        .join(state.lang === "en" ? "; " : "，");
      return t("channels.sourceConcat", { sources });
    }
    if (layer.module === "Detect") return t("channels.sourceDetect");
    if (layer.module === "Upsample") return t("channels.sourceUpsample");
    return t("channels.sourcePrev");
  })();

  const outputRule = (() => {
    if (hasScaledOutputChannels(layer)) {
      const base = layer.args[0];
      const model = currentScale();
      return t("channels.scaledOutput", { base, model: `${currentVersion().name}${state.modelKey}`, width: model.width, channels: layer.channels });
    }
    if (layer.module === "Concat") return t("channels.concatOutput", { input: layer.inputChannels, channels: layer.channels });
    if (layer.module === "Upsample") return t("channels.upsampleOutput", { channels: layer.channels });
    if (layer.module === "Detect") return t("channels.detectOutput", { box: currentRegMax() * 4, cls: currentNc() });
    return t("channels.simpleOutput", { channels: channelValue(layer.channels) });
  })();

  const convFilter = layer.module === "Conv"
    ? `<div class="note">${escapeHtml(t("channels.convFilter", { channels: layer.channels, input: layer.inputChannels, k: convParams(layer).k }))}</div>`
    : "";

  return `
    <div class="channel-explain">
      <div>
        <strong>${escapeHtml(t("channels.inputTitle", { value: layer.inputChannels }))}</strong>
        <span>${escapeHtml(inputSource)}</span>
      </div>
      <div>
        <strong>${escapeHtml(t("channels.outputTitle", { value: channelValue(layer.channels) }))}</strong>
        <span>${escapeHtml(outputRule)}</span>
      </div>
    </div>
    ${convFilter}
  `;
}

function renderYamlMath(layers, layer) {
  const model = currentScale();
  const rows = [["YAML", yamlArgs(layer)]];

  if (hasScaledOutputChannels(layer)) {
    const base = layer.args[0];
    const clipped = Math.min(base, model.maxChannels);
    const raw = clipped * model.width;
    rows.push([
      t("yaml.outputChannels"),
      `c_out = make_divisible(min(${base}, ${model.maxChannels}) × ${model.width}, 8) = make_divisible(${raw}, 8) = ${layer.channels}`,
    ]);
  } else if (layer.module === "Concat") {
    rows.push([t("yaml.outputChannels"), `c_out = sum(${layer.inputChannels}) = ${layer.channels}`]);
  } else if (layer.module === "Upsample") {
    rows.push([t("yaml.outputChannels"), `c_out = c_in = ${layer.channels}`]);
  } else if (layer.module === "Detect") {
    const nc = currentNc();
    const regMax = currentRegMax();
    rows.push([t("yaml.outputDim"), `no = nc + 4 × reg_max = ${nc} + 4 × ${regMax} = ${nc + 4 * regMax}`]);
  }

  if (layer.repeat > 1) {
    rows.push([t("yaml.repeats"), `repeat_actual = max(round(${layer.repeat} × depth ${model.depth}), 1) = ${layer.repeats}`]);
  } else {
    rows.push([t("yaml.repeats"), t("yaml.noDepthScale")]);
  }

  if (layer.module === "Conv") {
    const p = convParams(layer);
    const input = parseShape(layer.inputShape);
    const output = parseShape(layer.outShape);
    if (input && output) {
      rows.push([
        t("yaml.spatial"),
        t("yaml.spatialFormula", { h: input.h, p: p.p, k: p.k, s: p.s, out: convOutSize(input.h, p), ih: input.h, iw: input.w, oh: output.h, ow: output.w }),
      ]);
    }
  }

  return `
    <div class="formula-panel">
      ${rows
        .map(
          ([label, value]) => `
            <div class="formula-row">
              <span>${escapeHtml(label)}</span>
              <code>${escapeHtml(value)}</code>
            </div>
          `,
        )
        .join("")}
    </div>
  `;
}

function renderScaleTable() {
  return `
    <div class="scale-table" aria-label="${escapeHtml(t("tables.scaleAria"))}">
      <div class="scale-row scale-head"><span>${escapeHtml(t("tables.model"))}</span><span>${escapeHtml(t("tables.depth"))}</span><span>${escapeHtml(t("tables.width"))}</span><span>${escapeHtml(t("tables.maxChannels"))}</span></div>
      ${Object.entries(currentScales())
        .map(
          ([key, model]) => `
            <div class="scale-row${key === state.modelKey ? " active" : ""}">
              <span>${key}</span><span>${model.depth}</span><span>${model.width}</span><span>${model.maxChannels}</span>
            </div>
          `,
        )
        .join("")}
    </div>
  `;
}

function renderModelComparison(layer) {
  const rows = Object.keys(currentScales()).map((key) => {
    const candidate = resolveLayers(key)[layer.id];
    const cOut = channelValue(candidate.channels);
    const hidden = candidate.module === "C3k2" ? hiddenChannels(candidate) : candidate.module === "C2PSA" ? Math.floor(candidate.channels / 2) : candidate.module === "C2f" || candidate.module === "C3" ? Math.floor(candidate.channels * (candidate.args[2] ?? 0.5)) : "n/a";
    const branch = candidate.module === "C3k2" ? (candidate.c3kEnabled ? "C3k" : "Bottleneck") : candidate.repeats;
    return { key, cOut, repeat: candidate.repeats, hidden, branch };
  });
  return `
    <div class="compare-table" aria-label="${escapeHtml(t("tables.modelCompareAria"))}">
      <div class="compare-row compare-head"><span>${escapeHtml(t("tables.model"))}</span><span>c_out</span><span>repeat</span><span>${escapeHtml(t("tables.hiddenBranch"))}</span></div>
      ${rows
        .map(
          (row) => `
            <div class="compare-row${row.key === state.modelKey ? " active" : ""}">
              <span>${row.key}</span>
              <span>${escapeHtml(row.cOut)}</span>
              <span>${escapeHtml(row.repeat)}</span>
              <span>${escapeHtml(row.hidden === "n/a" ? row.branch : `${row.hidden} / ${row.branch}`)}</span>
            </div>
          `,
        )
        .join("")}
    </div>
  `;
}

function renderGlossary() {
  return `
    <div class="glossary-list">
      ${PARAM_GLOSSARY.map(([term, desc]) => `<div class="term"><strong>${escapeHtml(pickLang(term))}</strong><span>${escapeHtml(pickLang(desc))}</span></div>`).join("")}
    </div>
  `;
}

function renderDiagram() {
  const { layers, canvasWidth, canvasHeight } = layoutLayers(resolveLayers(state.modelKey));
  currentCanvasWidth = canvasWidth;
  currentCanvasHeight = canvasHeight;
  zoomRange.value = Math.round(state.zoom * 100);
  zoomReadout.textContent = `${Math.round(state.zoom * 100)}%`;
  diagram.innerHTML = "";
  diagram.setAttribute("viewBox", `0 0 ${canvasWidth} ${canvasHeight}`);
  diagram.setAttribute("width", canvasWidth);
  diagram.setAttribute("height", canvasHeight);
  applyTransform();

  const title = svgEl("title", { id: "diagramTitle" });
  title.textContent = t("diagram.title", { version: currentVersion().fullName });
  const desc = svgEl("desc", { id: "diagramDesc" });
  desc.textContent = t("diagram.desc", { version: currentVersion().fullName });
  diagram.append(title, desc);

  addDefs(diagram);
  diagram.appendChild(svgEl("rect", { x: 0, y: 0, width: canvasWidth, height: canvasHeight, rx: 10, fill: COLORS.canvas, stroke: "oklch(0.858 0.018 160)", "stroke-width": 1.6 }));
  drawMainDiagram(diagram, layers, canvasHeight);
  updateActiveZoomPreset();
}

/**
 * 将当前 panX/panY/zoom 应用到 #diagram 元素。
 * 缩放通过 SVG width/height 完成，让文字保持矢量重绘；transform 只负责整数像素平移。
 * panX/panY 为屏幕像素坐标，transform-origin 固定在 (0,0)。
 */
function applyTransform() {
  const scaledWidth = Math.max(1, Math.round(currentCanvasWidth * state.zoom));
  const scaledHeight = Math.max(1, Math.round(currentCanvasHeight * state.zoom));
  diagram.setAttribute("width", scaledWidth);
  diagram.setAttribute("height", scaledHeight);
  diagram.style.transformOrigin = "0 0";
  diagram.style.transform = `translate(${Math.round(state.panX)}px, ${Math.round(state.panY)}px)`;
}

function renderDetail() {
  // 如果栈为空（例如关闭抽屉后再次点击同层），根据 selectedId 重建栈
  if (state.detailStack.length === 0) {
    const fallbackLayer = resolveLayers(state.modelKey).find((l) => l.id === state.selectedId) || resolveLayers(state.modelKey)[2];
    state.detailStack = [{ kind: "layer", id: fallbackLayer.id, layer: fallbackLayer }];
  }
  const top = state.detailStack[state.detailStack.length - 1];
  const layers = resolveLayers(state.modelKey);

  // 抽屉打开状态 + 方位（避免被 Detect 节点遮挡）
  const refLayer = top.kind === "layer" ? top.layer : layers.find((l) => l.id === top.layerId);
  const shouldDockLeft = refLayer && (refLayer.module === "Detect" || refLayer.x > 620);
  detailPanel.classList.toggle("is-open", state.detailOpen);
  detailPanel.classList.toggle("is-left", shouldDockLeft);
  detailPanel.setAttribute("aria-hidden", String(!state.detailOpen));

  // 顶部面包屑 + 标题
  renderDetailBreadcrumb(top);
  if (top.kind === "layer") {
    renderLayerDetailBody(top.layer);
  } else {
    renderSubmoduleDetailBody(top);
  }
}

function renderDetailBreadcrumb(top) {
  const crumbs = state.detailStack.map((item, index) => {
    let label;
    if (item.kind === "layer") {
      label = `Layer ${item.id} · ${item.layer.module}`;
    } else {
      label = pickLang(item.sub.title);
    }
    const isLast = index === state.detailStack.length - 1;
    return `<button type="button" class="detail-crumb${isLast ? " is-current" : ""}" data-jump="${index}">
      ${escapeHtml(label)}
    </button>`;
  });
  detailSection.innerHTML = `<div class="detail-breadcrumb">${crumbs.join('<span class="detail-crumb-sep">›</span>')}</div>`;

  // 标题：取栈顶的"短标题"
  let title;
  if (top.kind === "layer") {
    title = `Layer ${top.id}: ${top.layer.module}`;
  } else {
    title = pickLang(top.sub.title);
  }
  detailTitle.textContent = title;

  // 绑定面包屑跳转
  detailSection.querySelectorAll(".detail-crumb").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      const idx = Number(btn.dataset.jump);
      jumpToDetail(idx);
    });
  });
}

function renderLayerDetailBody(layer) {
  const layers = resolveLayers(state.modelKey);
  detailBody.innerHTML = `
    <p class="detail-summary">${escapeHtml(pickLang(getModuleDetails(layer.module) || t("detail.noDescription")))}</p>
    ${renderKeyGrid(layer)}
    <section class="detail-section">
      <h3>${escapeHtml(t("detail.shape"))}</h3>
      ${renderShapeConvention(layer)}
    </section>
    <section class="detail-section">
      <h3>${escapeHtml(t("detail.channels"))}</h3>
      ${renderChannelExplanation(layers, layer)}
    </section>
    <section class="detail-section">
      <h3>${escapeHtml(t("detail.yamlMath"))}</h3>
      <pre class="code-block"><code>${escapeHtml(yamlArgs(layer))}</code></pre>
      ${renderYamlMath(layers, layer)}
      <p class="note">${escapeHtml(t("detail.formulasNote"))}</p>
    </section>
    <section class="detail-section">
      <h3>${escapeHtml(t("detail.comparison"))}</h3>
      ${renderModelComparison(layer)}
    </section>
    <section class="detail-section">
      <h3>${escapeHtml(t("detail.internals"))}</h3>
      ${renderModuleFlow(layers, layer)}
      <p class="note">${escapeHtml(t("detail.internalsNote"))}</p>
    </section>
  `;
}

/**
 * 渲染子模块详情（用户点击展开图中的小卡片后调用）
 * 信息格式按用户要求：简单介绍 + 参数即可，不再使用「是什么 / 为什么 / 典型参数」三段式。
 * 如果该子模块自身还有内部结构（如 C3k 内含 cv1/Bottleneck/Concat/cv2），
 * 也会在抽屉里列出可点击的子卡片，支持继续嵌套展开。
 */
function renderSubmoduleDetailBody(item) {
  const info = item.sub.info || {};
  const layer = resolveLayers(state.modelKey).find((l) => l.id === item.layerId);
  const inner = getUnitInner(item.sub.infoKey) || [];

  // 简介一句话
  const summary = pickLang(info.what || t("detail.noSummary"));

  // 参数列表（从 info.params 字符串里拆出来逐项展示）
  const paramLines = String(pickLang(info.params || ""))
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  detailBody.innerHTML = `
    <div class="sub-detail">
      <div class="sub-detail-head">
        <span class="sub-detail-kind kind-${item.sub.kind || "default"}">${escapeHtml(item.sub.kind || "unit")}</span>
        <strong>${escapeHtml(pickLang(item.sub.title))}</strong>
      </div>
      <p class="sub-detail-summary">${escapeHtml(summary)}</p>

      ${paramLines.length > 0 ? `
        <div class="sub-detail-section">
          <h4>${escapeHtml(t("detail.params"))}</h4>
          <div class="sub-detail-params">
            ${paramLines.map((p) => `<code>${escapeHtml(p)}</code>`).join("")}
          </div>
        </div>
      ` : ""}

      ${layer ? `
        <div class="sub-detail-section">
          <h4>${escapeHtml(t("detail.ownerLayer"))}</h4>
          <p class="sub-detail-meta">Layer ${layer.id} · ${escapeHtml(layer.module)} · ${escapeHtml(layer.stage)}</p>
        </div>
      ` : ""}

      ${inner.length > 0 ? `
        <div class="sub-detail-section">
          <h4>${escapeHtml(t("detail.innerClickable"))}</h4>
          <div class="sub-detail-inner">
            ${inner.map((step, i) => `
              <button type="button" class="sub-detail-step flow-step ${step.kind}" data-info-key="${escapeHtml(step.infoKey)}" data-title="${escapeHtml(step.title)}" data-kind="${escapeHtml(step.kind)}" data-inner-index="${i}">
                <div class="flow-title">
                  <span>${i + 1}</span>
                  <strong>${escapeHtml(pickLang(step.title))}</strong>
                </div>
                <ul>${pickLang(step.lines).map((l) => `<li>${escapeHtml(l)}</li>`).join("")}</ul>
              </button>
              ${i < inner.length - 1 ? '<div class="flow-arrow">↓</div>' : ""}
            `).join("")}

          </div>
        </div>
      ` : ""}

      ${state.detailStack.length > 1 ? `
        <button type="button" class="sub-detail-back">${escapeHtml(t("detail.back"))}</button>
      ` : ""}
    </div>
  `;

  // 绑定内部卡片的点击（嵌套 push）
  detailBody.querySelectorAll(".sub-detail-step").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      const infoKey = btn.dataset.infoKey;
      const title = btn.dataset.title;
      const kind = btn.dataset.kind;
      const innerInfo = getUnitInfo(infoKey);
      if (!innerInfo) return;
      // 取出该 inner 步骤的 lines
      const innerStep = (getUnitInner(item.sub.infoKey) || [])[Number(btn.dataset.innerIndex)] || (getUnitInner(item.sub.infoKey) || []).find((s) => s.infoKey === infoKey && s.title === title);
      pushDetail({
        kind: "submodule",
        layerId: item.layerId,
        sub: {
          title,
          kind,
          lines: innerStep ? innerStep.lines : [],
          infoKey,
          info: innerInfo,
        },
      });
    });
  });

  // 绑定返回按钮
  const backBtn = detailBody.querySelector(".sub-detail-back");
  if (backBtn) {
    backBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      popDetail();
    });
  }
}

function selectLayer(id) {
  const layers = resolveLayers(state.modelKey);
  const layer = layers.find((item) => item.id === id);
  state.expandedId = isInlineExpandable(layer) ? (state.expandedId === id ? null : id) : null;
  state.selectedId = id;
  state.detailOpen = true;
  // 重置抽屉栈：仅保留当前 layer 作为根
  state.detailStack = [{ kind: "layer", id, layer }];
  renderSummary();
  renderDiagram();
  renderDetail();
}

// 抽屉导航：进入子模块（push 一项到栈顶）
function pushDetail(item) {
  state.detailStack.push(item);
  state.detailOpen = true;
  renderDetail();
}

// 返回上一级
function popDetail() {
  if (state.detailStack.length > 1) {
    state.detailStack.pop();
    renderDetail();
  }
}

// 跳到栈中某一级（点击面包屑）
function jumpToDetail(index) {
  if (index < 0 || index >= state.detailStack.length) return;
  state.detailStack = state.detailStack.slice(0, index + 1);
  renderDetail();
}

function closeDetailDrawer() {
  if (!state.detailOpen) return;
  state.detailOpen = false;
  renderDetail();
}

function clampZoom(value) {
  return Math.min(2.2, Math.max(0.45, value));
}

/**
 * 以容器中心为锚点缩放。
 * shouldCenter=true 时重置 panX/panY 到 0（即画布左上角对齐容器左上角）。
 */
function updateZoom(value, shouldCenter = false) {
  const rect = diagramScroll.getBoundingClientRect();
  const oldZoom = state.zoom;
  // 容器中心在屏幕坐标系中的位置（相对于 diagramScroll 左上角）
  const centerX = rect.width / 2;
  const centerY = rect.height / 2;
  // 容器中心在画布坐标系中的位置（缩放前）
  const canvasX = (centerX - state.panX) / oldZoom;
  const canvasY = (centerY - state.panY) / oldZoom;
  state.zoom = clampZoom(value);
  if (shouldCenter) {
    // 重置：让画布左上角对齐容器左上角（不居中），方便用户用抓手拖动
    state.panX = 0;
    state.panY = 0;
  } else {
    // 保持容器中心指向同一画布点
    state.panX = centerX - canvasX * state.zoom;
    state.panY = centerY - canvasY * state.zoom;
  }
  zoomRange.value = Math.round(state.zoom * 100);
  zoomReadout.textContent = `${Math.round(state.zoom * 100)}%`;
  applyTransform();
  updateActiveZoomPreset();
}

/**
 * 以鼠标位置（屏幕坐标 clientX/clientY）为锚点缩放。
 */
function updateZoomAt(value, clientX, clientY) {
  const rect = diagramScroll.getBoundingClientRect();
  const anchorX = clientX ?? rect.left + rect.width / 2;
  const anchorY = clientY ?? rect.top + rect.height / 2;
  // 鼠标在容器内的局部坐标
  const localX = anchorX - rect.left;
  const localY = anchorY - rect.top;
  const oldZoom = state.zoom;
  // 鼠标在画布坐标系中的位置
  const canvasX = (localX - state.panX) / oldZoom;
  const canvasY = (localY - state.panY) / oldZoom;
  state.zoom = clampZoom(value);
  // 调整 pan 让鼠标位置保持指向同一画布点
  state.panX = localX - canvasX * state.zoom;
  state.panY = localY - canvasY * state.zoom;
  zoomRange.value = Math.round(state.zoom * 100);
  zoomReadout.textContent = `${Math.round(state.zoom * 100)}%`;
  applyTransform();
  updateActiveZoomPreset();
}

function updateActiveZoomPreset() {
  document.querySelectorAll("[data-zoom]").forEach((button) => {
    const zoom = Number(button.dataset.zoom);
    button.classList.toggle("active", Math.abs(zoom - state.zoom) < 0.01);
  });
}

function fitDiagram() {
  const w = diagramScroll.clientWidth - 32;
  const h = diagramScroll.clientHeight - 32;
  const nextZoom = Math.min(1.2, Math.max(0.45, Math.min(w / currentCanvasWidth, h / currentCanvasHeight)));
  // 适屏：先重置 pan，再缩放，最后让画布居中显示在容器内
  state.zoom = clampZoom(nextZoom);
  const scaledW = currentCanvasWidth * state.zoom;
  const scaledH = currentCanvasHeight * state.zoom;
  state.panX = Math.max(0, (diagramScroll.clientWidth - scaledW) / 2);
  state.panY = Math.max(0, (diagramScroll.clientHeight - scaledH) / 2);
  zoomRange.value = Math.round(state.zoom * 100);
  zoomReadout.textContent = `${Math.round(state.zoom * 100)}%`;
  applyTransform();
  updateActiveZoomPreset();
}

function bindZoom() {
  document.querySelector("#zoomOut").addEventListener("click", () => updateZoom(state.zoom - 0.12));
  document.querySelector("#zoomIn").addEventListener("click", () => updateZoom(state.zoom + 0.12));
  document.querySelector("#zoomReset").addEventListener("click", () => updateZoom(0.7, true));
  document.querySelector("#zoomFit").addEventListener("click", fitDiagram);
  document.querySelectorAll("[data-zoom]").forEach((button) => {
    button.addEventListener("click", () => updateZoom(Number(button.dataset.zoom), true));
  });
  zoomRange.addEventListener("input", (event) => updateZoom(Number(event.target.value) / 100));
  diagramScroll.addEventListener(
    "wheel",
    (event) => {
      // 滚轮直接缩放（以鼠标位置为锚点）；如果用户按住 Shift 则改为平移（垂直方向）
      // 这样符合"鼠标滚轮缩放、抓手拖动平移"的常见画布交互
      if (event.shiftKey) {
        // Shift+滚轮 = 垂直平移
        event.preventDefault();
        state.panY -= event.deltaY;
        applyTransform();
        return;
      }
      event.preventDefault();
      const factor = Math.exp(-event.deltaY * 0.0015);
      updateZoomAt(state.zoom * factor, event.clientX, event.clientY);
    },
    { passive: false },
  );
  document.addEventListener("keydown", (event) => {
    if (event.target.tagName === "INPUT" || event.target.tagName === "TEXTAREA") return;
    if (event.key === "0") { event.preventDefault(); updateZoom(0.7, true); }
    else if (event.key === "f" || event.key === "F") { event.preventDefault(); fitDiagram(); }
    else if (event.key === "+" || event.key === "=") { event.preventDefault(); updateZoom(state.zoom + 0.12); }
    else if (event.key === "-") { event.preventDefault(); updateZoom(state.zoom - 0.12); }
  });
}

function bindCanvasPan() {
  // 基于 transform 的平移：pointerdown 记录起点和当前 pan，pointermove 直接更新 panX/panY。
  // 不依赖 diagramScroll 的滚动空间，因此即使画布小于容器也能正常拖动。
  diagramScroll.addEventListener("pointerdown", (event) => {
    if (event.button !== 0) return;
    // 点击在节点上、子卡片上、抽屉里都不触发 pan
    if (event.target.closest?.(".node-hit")) return;
    if (event.target.closest?.(".unit-card")) return;
    if (event.target.closest?.(".zoom-tools")) return;
    panState = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      panX: state.panX,
      panY: state.panY,
      moved: false,
    };
    diagramScroll.classList.add("is-panning");
    // 阻止浏览器原生 drag 行为（比如 SVG 元素被拖拽）
    event.preventDefault();
  });

  window.addEventListener("pointermove", (event) => {
    if (!panState || panState.pointerId !== event.pointerId) return;
    const dx = event.clientX - panState.startX;
    const dy = event.clientY - panState.startY;
    if (Math.abs(dx) + Math.abs(dy) > 4) panState.moved = true;
    state.panX = panState.panX + dx;
    state.panY = panState.panY + dy;
    applyTransform();
    if (panState.moved) event.preventDefault();
  });

  const finishPan = (event) => {
    if (!panState) return;
    if (event && event.pointerId != null && panState.pointerId !== event.pointerId) return;
    suppressCanvasClick = panState.moved;
    panState = null;
    diagramScroll.classList.remove("is-panning");
    if (suppressCanvasClick) window.setTimeout(() => { suppressCanvasClick = false; }, 0);
  };

  window.addEventListener("pointerup", finishPan);
  window.addEventListener("pointercancel", finishPan);
}

function bindDrawer() {
  const detailClose = detailPanel.querySelector(".detail-close");
  if (detailClose) {
    detailClose.addEventListener("click", (event) => {
      event.stopPropagation();
      closeDetailDrawer();
    });
  }

  // 点击画布空白处（非节点、非子卡片）：如果发生了拖动则忽略，否则关闭抽屉
  diagram.addEventListener("click", (event) => {
    if (suppressCanvasClick) {
      event.stopPropagation();
      return;
    }
    // 点击到子卡片（已展开模块内的小卡片）不关闭抽屉，让其走 push 逻辑
    if (event.target.closest?.(".unit-card")) return;
    closeDetailDrawer();
  });
  detailPanel.addEventListener("click", (event) => event.stopPropagation());
  document.addEventListener("click", (event) => {
    if (!state.detailOpen) return;
    if (detailPanel.contains(event.target)) return;
    if (event.target.closest?.(".node-hit")) return;
    if (event.target.closest?.(".unit-card")) return;
    closeDetailDrawer();
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      // 优先级：先返回抽屉上一级，已在根级则关闭抽屉
      if (state.detailStack.length > 1) {
        popDetail();
      } else {
        closeDetailDrawer();
      }
      closeReferenceModal();
      closeCompareModal();
    }
  });
}

// ====== 子模块说明已迁移到右侧抽屉（栈式导航）======
// 原 popover 浮窗机制已删除：点击小卡片直接 push 到 detailStack，在抽屉中显示信息。

let referenceReturnFocus = null;
let compareReturnFocus = null;

function modalFocusableElements(modal) {
  return [...modal.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])')]
    .filter((el) => !el.disabled && el.getAttribute("aria-hidden") !== "true");
}

function focusModal(modal) {
  window.requestAnimationFrame(() => {
    const target = modal.querySelector(".reference-close") || modalFocusableElements(modal)[0];
    if (target) target.focus({ preventScroll: true });
  });
}

function trapModalFocus(event, modal) {
  if (event.key !== "Tab" || !modal.classList.contains("is-open")) return;
  const focusables = modalFocusableElements(modal);
  if (!focusables.length) {
    event.preventDefault();
    return;
  }
  const first = focusables[0];
  const last = focusables[focusables.length - 1];
  if (event.shiftKey && document.activeElement === first) {
    event.preventDefault();
    last.focus();
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault();
    first.focus();
  }
}

// ====== 知识库 modal（YAML 计算方式 + 固定解释） ======
const referenceModal = () => document.querySelector("#referenceModal");
const referenceBody = () => document.querySelector("#referenceBody");

function renderReferenceModal() {
  const body = referenceBody();
  if (!body) return;
  const v = currentVersion();
  const yamlName = v.key === "v5" ? "yolov5.yaml" : v.key === "v8" ? "yolov8.yaml" : v.key === "v11" ? "yolo11.yaml" : "yolo26.yaml";
  const moduleExamples = v.key === "v5"
    ? "Conv / C3 / SPPF / Upsample / Concat / Detect"
    : v.key === "v8"
    ? "Conv / C2f / SPPF / Upsample / Concat / Detect"
    : "Conv / C3k2 / SPPF / C2PSA / Upsample / Concat / Detect";
  body.innerHTML = `
    <section class="ref-section">
      <h3>${escapeHtml(t("reference.yamlFormat"))}</h3>
      <p class="ref-intro">${escapeHtml(t("reference.yamlIntro", { yamlName })).replace("[from, repeat, module, args]", "<code>[from, repeat, module, args]</code>")}</p>
      <pre class="code-block"><code>[[-1, 1, Conv, [64, 3, 2]]  # Layer 0</code></pre>
      <ul class="ref-list">
        <li><strong>from</strong>: ${escapeHtml(t("reference.fromDesc")).replaceAll("-1", "<code>-1</code>").replaceAll("[−1, 6]", "<code>[−1, 6]</code>")}</li>
        <li><strong>repeat</strong>: ${escapeHtml(t("reference.repeatDesc")).replace("max(round(repeat × depth), 1)", "<code>max(round(repeat × depth), 1)</code>")}</li>
        <li><strong>module</strong>: ${escapeHtml(t("reference.moduleDesc", { examples: moduleExamples }))}</li>
        <li><strong>args</strong>: ${escapeHtml(t("reference.argsDesc"))}</li>
      </ul>
    </section>

    <section class="ref-section">
      <h3>${escapeHtml(t("reference.versionFeatures"))}</h3>
      <div class="formula-panel">
        <div class="formula-row">
          <span>${escapeHtml(t("reference.version"))}</span>
          <code>${v.fullName} (${v.year})</code>
        </div>
        <div class="formula-row">
          <span>reg_max</span>
          <code>${v.regMax}${v.regMax === 1 ? (state.lang === "en" ? " (DFL direct regression)" : " (DFL 退化为直接回归)") : (state.lang === "en" ? " (DFL discrete distribution)" : " (DFL 离散分布)")}</code>
        </div>
        <div class="formula-row">
          <span>end2end</span>
          <code>${v.end2end ? (state.lang === "en" ? "True (one2many + one2one, NMS-free inference)" : "True (one2many + one2one, 推理无需 NMS)") : (state.lang === "en" ? "False (traditional NMS path)" : "False (传统 NMS 流程)")}</code>
        </div>
        <div class="formula-row">
          <span>Detect head</span>
          <code>${v.legacy ? (state.lang === "en" ? "legacy=True (pure Conv cv2/cv3)" : "legacy=True (纯 Conv cv2/cv3)") : "legacy=False (DWConv+Conv cv3)"}</code>
        </div>
        <div class="formula-row">
          <span>${escapeHtml(t("reference.yamlSource"))}</span>
          <code><a href="${v.yamlUrl}" target="_blank" rel="noreferrer">${yamlName}</a></code>
        </div>
      </div>
    </section>

    <section class="ref-section">
      <h3>${escapeHtml(t("reference.formulas"))}</h3>
      <div class="formula-panel">
        <div class="formula-row">
          <span>${escapeHtml(t("reference.outputChannels"))}</span>
          <code>c_out = make_divisible(min(base, max_channels) × width, 8)</code>
        </div>
        <div class="formula-row">
          <span>${escapeHtml(t("reference.actualRepeat"))}</span>
          <code>repeat_actual = max(round(repeat × depth), 1)</code>
        </div>
        <div class="formula-row">
          <span>${escapeHtml(t("reference.convSpatial"))}</span>
          <code>H_out = floor((H_in + 2·p − k) / s) + 1</code>
        </div>
        <div class="formula-row">
          <span>${escapeHtml(t("reference.detectOutputDim"))}</span>
          <code>no = nc + 4 × reg_max = ${v.nc} + 4 × ${v.regMax} = ${v.nc + 4 * v.regMax}</code>
        </div>
        <div class="formula-row">
          <span>make_divisible</span>
          <code>make_divisible(v, d=8) = ceil(v / d) × d  # ${state.lang === "en" ? "align to multiples of 8" : "对齐到 8 的倍数"}</code>
        </div>
      </div>
      <p class="note">${escapeHtml(t("reference.formulasNote"))}</p>
    </section>

    <section class="ref-section">
      <h3>${escapeHtml(t("reference.scaleRules", { version: v.name }))}</h3>
      ${renderScaleTable()}
      <p class="note">${escapeHtml(t("reference.scaleNote"))}</p>
    </section>

    <section class="ref-section">
      <h3>${escapeHtml(t("reference.glossary"))}</h3>
      ${renderGlossary()}
    </section>

    <section class="ref-section">
      <h3>${escapeHtml(t("reference.shapeConvention"))}</h3>
      <p class="note">${escapeHtml(t("shape.reference"))}</p>
    </section>
  `;
}

function openReferenceModal(trigger = document.querySelector("#referenceTrigger")) {
  const modal = referenceModal();
  if (!modal) return;
  referenceReturnFocus = trigger || document.activeElement;
  renderReferenceModal();
  modal.classList.add("is-open");
  modal.setAttribute("aria-hidden", "false");
  modal.setAttribute("aria-modal", "true");
  focusModal(modal);
}

function closeReferenceModal({ restoreFocus = true } = {}) {
  const modal = referenceModal();
  if (!modal) return;
  const wasOpen = modal.classList.contains("is-open");
  modal.classList.remove("is-open");
  modal.setAttribute("aria-hidden", "true");
  modal.removeAttribute("aria-modal");
  if (wasOpen && restoreFocus && referenceReturnFocus) {
    referenceReturnFocus.focus({ preventScroll: true });
  }
}

function bindReferenceModal() {
  const trigger = document.querySelector("#referenceTrigger");
  const modal = referenceModal();
  if (!trigger || !modal) return;
  trigger.addEventListener("click", (event) => {
    event.stopPropagation();
    if (modal.classList.contains("is-open")) closeReferenceModal();
    else openReferenceModal(trigger);
  });
  modal.addEventListener("keydown", (event) => trapModalFocus(event, modal));
  modal.addEventListener("click", (event) => {
    if (event.target === modal) closeReferenceModal();
  });
  const closeBtn = modal.querySelector(".reference-close");
  if (closeBtn) {
    closeBtn.addEventListener("click", closeReferenceModal);
  }
}

// ====== 版本对比 modal ======
const compareModal = () => document.querySelector("#compareModal");
const compareBody = () => document.querySelector("#compareBody");

function renderCompareModal() {
  const body = compareBody();
  if (!body) return;
  const cmp = SHARED.VERSION_COMPARISON;
  const versionKeys = ["v5", "v8", "v11", "v26"];
  const versions = versionKeys.map((k) => VERSIONS[k]);

  body.innerHTML = `
    <section class="ref-section">
      <h3>${escapeHtml(t("compare.timeline"))}</h3>
      <div class="compare-timeline">
        ${cmp.timeline.map((item) => `
          <article class="timeline-item ${item.version === state.versionKey ? "is-current" : ""}">
            <div class="timeline-head">
              <span class="timeline-version">${VERSIONS[item.version].name}</span>
              <span class="timeline-year">${item.year}</span>
            </div>
            <h4>${item.headline}</h4>
            <p class="timeline-focus">${escapeHtml(t("compare.focus", { text: pickLang(item.focus) }))}</p>
            <p class="timeline-highlight">${escapeHtml(pickLang(item.highlight))}</p>
          </article>
        `).join("")}
      </div>
    </section>

    <section class="ref-section">
      <h3>${escapeHtml(t("compare.matrix"))}</h3>
      <div class="compare-matrix-wrap">
        <table class="compare-matrix">
          <thead>
            <tr>
              <th>${escapeHtml(t("compare.dimension"))}</th>
              ${versions.map((v) => `<th class="${v.key === state.versionKey ? "is-current" : ""}">${v.name}</th>`).join("")}
            </tr>
          </thead>
          <tbody>
            ${cmp.matrix.map((row) => `
              <tr>
                <td class="matrix-dim">${escapeHtml(pickLang(row[0]))}</td>
                ${row.slice(1).map((cell, i) => `<td class="${versionKeys[i] === state.versionKey ? "is-current" : ""}">${escapeHtml(pickLang(String(cell)))}</td>`).join("")}
              </tr>
            `).join("")}
          </tbody>
        </table>
      </div>
    </section>

    <section class="ref-section">
      <h3>${escapeHtml(t("compare.takeaways"))}</h3>
      <ul class="ref-list">
        ${pickLang(i18nEntry("compare.takeawaysHtml")).map((item) => `<li>${item}</li>`).join("")}
      </ul>
    </section>

    <section class="ref-section">
      <h3>${escapeHtml(t("compare.yamlSources"))}</h3>
      <ul class="ref-list">
        ${versions.map((v) => `<li><strong>${v.name}</strong> (${v.year})：<a href="${v.yamlUrl}" target="_blank" rel="noreferrer">${v.yamlUrl.split("/").pop()}</a></li>`).join("")}
      </ul>
    </section>
  `;
}

function openCompareModal(trigger = document.querySelector("#compareTrigger")) {
  const modal = compareModal();
  if (!modal) return;
  compareReturnFocus = trigger || document.activeElement;
  renderCompareModal();
  modal.classList.add("is-open");
  modal.setAttribute("aria-hidden", "false");
  modal.setAttribute("aria-modal", "true");
  focusModal(modal);
}

function closeCompareModal({ restoreFocus = true } = {}) {
  const modal = compareModal();
  if (!modal) return;
  const wasOpen = modal.classList.contains("is-open");
  modal.classList.remove("is-open");
  modal.setAttribute("aria-hidden", "true");
  modal.removeAttribute("aria-modal");
  if (wasOpen && restoreFocus && compareReturnFocus) {
    compareReturnFocus.focus({ preventScroll: true });
  }
}

function bindCompareModal() {
  const trigger = document.querySelector("#compareTrigger");
  const modal = compareModal();
  if (!trigger || !modal) return;
  trigger.addEventListener("click", (event) => {
    event.stopPropagation();
    if (modal.classList.contains("is-open")) closeCompareModal();
    else openCompareModal(trigger);
  });
  modal.addEventListener("keydown", (event) => trapModalFocus(event, modal));
  modal.addEventListener("click", (event) => {
    if (event.target === modal) closeCompareModal();
  });
  const closeBtn = modal.querySelector(".reference-close");
  if (closeBtn) {
    closeBtn.addEventListener("click", closeCompareModal);
  }
}

function bindVersionSwitch() {
  // 版本切换器在 renderVersionSwitch() 中绑定，这里无需额外事件
  // 但监听键盘 1/2/3/4 快速切换版本
  document.addEventListener("keydown", (event) => {
    if (event.target.tagName === "INPUT" || event.target.tagName === "TEXTAREA") return;
    const versionKeys = ["v5", "v8", "v11", "v26"];
    const num = parseInt(event.key, 10);
    if (num >= 1 && num <= 4) {
      event.preventDefault();
      const targetKey = versionKeys[num - 1];
      if (state.versionKey !== targetKey) {
        state.versionKey = targetKey;
        state.expandedId = null;
        state.selectedId = 2;
        state.detailStack = [];
        state.detailOpen = false;
        render();
      }
    }
  });
}

function render() {
  renderStaticText();
  renderLanguageSwitch();
  renderVersionSwitch();
  renderModelSwitch();
  renderSummary();
  renderDiagram();
  renderDetail();
  if (referenceModal()?.classList.contains("is-open")) renderReferenceModal();
  if (compareModal()?.classList.contains("is-open")) renderCompareModal();
}

bindZoom();
bindCanvasPan();
bindDrawer();
bindReferenceModal();
bindCompareModal();
bindVersionSwitch();
render();
window.requestAnimationFrame(() => fitDiagram());
// 窗口大小变化时仅刷新缩放显示，不强制适屏（避免破坏用户已设定的缩放与位置）
let resizeTimer;
window.addEventListener("resize", () => {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(() => {
    zoomRange.value = Math.round(state.zoom * 100);
    zoomReadout.textContent = `${Math.round(state.zoom * 100)}%`;
  }, 200);
});
