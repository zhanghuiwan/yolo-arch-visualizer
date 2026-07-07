/**
 * versions.js — 多版本 YOLO 架构数据
 * 包含 YOLOv5 / YOLOv8 / YOLO11 / YOLO26 四个版本的：
 *   - 规模配置 (n/s/m/l/x 的 depth/width/maxChannels/params/gflops/layers)
 *   - 层定义 (layerDefs：从对应 YAML 直接翻译而来)
 *   - 模块说明 (moduleDetails)
 *   - 子模块卡片 (unitInfo / unitInnerStructure，按版本扩展)
 *   - 展开规格 (expandedSpecs)
 *   - 节点位置 (nodePos)
 *   - 元信息 (name, year, regMax, end2end, legacy, nc, inputSize, detectX, yamlUrl)
 *
 * 所有数据来源：
 *   v5  : ultralytics/cfg/models/v5/yolov5.yaml         (YOLOv5 v6.0)
 *   v8  : ultralytics/cfg/models/v8/yolov8.yaml         (YOLOv8.0)
 *   v11 : ultralytics/cfg/models/11/yolo11.yaml         (YOLO11)
 *   v26 : ultralytics/cfg/models/26/yolo26.yaml         (YOLO26，end2end + reg_max=1)
 *
 * 加载顺序：versions.js 必须在 app.js 之前加载。
 * app.js 通过 window.YOLO_VERSIONS 和 window.YOLO_SHARED 访问。
 */
(function () {
  "use strict";

  // ============ 共享常量 ============
  const NS = "http://www.w3.org/2000/svg";
  const INPUT_SIZE = 640;
  const NODE = { width: 290, height: 92 };
  const EXPANDED_DETECT = { width: 320, height: 220 };
  const DETECT_NODE = { width: 260, height: 84 };
  const SVG_SIZE = { width: 1720, height: 1600 };

  const COLORS = {
    canvas: "oklch(0.990 0.003 220)",
    panel: "oklch(0.964 0.006 220)",
    panelWarm: "oklch(0.968 0.018 86)",
    line: "oklch(0.560 0.026 220)",
    lineSoft: "oklch(0.752 0.024 220)",
    ink: "oklch(0.195 0.020 230)",
    muted: "oklch(0.455 0.022 230)",
    title: "oklch(0.330 0.088 228)",
    conv: "oklch(0.855 0.074 224)",
    csp: "oklch(0.908 0.070 88)",
    concat: "oklch(0.870 0.090 82)",
    upsample: "oklch(0.858 0.070 150)",
    detect: "oklch(0.875 0.088 92)",
    sppf: "oklch(0.840 0.064 242)",
    psa: "oklch(0.872 0.050 306)",
    selected: "oklch(0.410 0.120 232)",
  };

  const I18N_TEXT = {
    meta: {
      title: {
        zh: "YOLO 网络结构动态图解",
        en: "YOLO Architecture Visualizer",
      },
    },
    language: {
      switchLabel: { zh: "选择界面语言", en: "Choose interface language" },
      zh: { zh: "中文", en: "中文" },
      en: { zh: "EN", en: "EN" },
      zhAria: { zh: "切换到中文", en: "Switch to Chinese" },
      enAria: { zh: "切换到英文", en: "Switch to English" },
    },
    shell: {
      kicker: {
        zh: "Ultralytics YOLO · 多版本架构对比 · Detect P3/P4/P5",
        en: "Ultralytics YOLO · Multi-version architecture comparison · Detect P3/P4/P5",
      },
      title: { zh: "YOLO 网络结构动态图解", en: "YOLO Architecture Visualizer" },
      controlsAria: { zh: "版本、模型规模与语言控制", en: "Version, model scale, and language controls" },
      versionSwitchAria: { zh: "选择 YOLO 版本", en: "Choose YOLO version" },
      modelSwitchAria: { zh: "选择模型规模", en: "Choose model scale" },
      summaryAria: { zh: "当前模型摘要", en: "Current model summary" },
      legendAria: { zh: "图例", en: "Legend" },
    },
    legend: {
      backbone: { zh: "Backbone", en: "Backbone" },
      neck: { zh: "Neck / PAN-FPN", en: "Neck / PAN-FPN" },
      detect: { zh: "Detect", en: "Detect" },
      detail: { zh: "详情面板", en: "Detail drawer" },
      skip: { zh: "跨层拼接", en: "Skip concat" },
      repeat: { zh: "×N 模块重复堆叠", en: "×N repeated blocks" },
    },
    summary: {
      version: { zh: "当前版本", en: "Version" },
      selected: { zh: "选中模块", en: "Selected" },
      scale: { zh: "当前规模", en: "Scale" },
    },
    zoom: {
      toolsAria: { zh: "缩放画布", en: "Canvas zoom" },
      out: { zh: "缩小", en: "Zoom out" },
      in: { zh: "放大", en: "Zoom in" },
      rangeAria: { zh: "缩放比例", en: "Zoom level" },
      presetsAria: { zh: "缩放预设", en: "Zoom presets" },
      fit: { zh: "适屏", en: "Fit" },
      resetAria: { zh: "重置视图", en: "Reset view" },
      resetTitle: { zh: "重置视图 (按 0 键)", en: "Reset view (press 0)" },
    },
    diagram: {
      scrollAria: {
        zh: "YOLO 架构画布 · 鼠标拖拽平移 · 滚轮缩放 · Shift+滚轮垂直平移 · 按 F 适屏 · 按 1/2/3/4 切换版本",
        en: "YOLO architecture canvas · Drag to pan · Wheel to zoom · Shift+wheel to pan vertically · Press F to fit · Press 1/2/3/4 to switch versions",
      },
      title: { zh: "{version} 网络结构动态图", en: "{version} architecture diagram" },
      desc: {
        zh: "展示 {version} 从输入、Backbone、Head 到 P3/P4/P5 Detect 的链路。点击模块可在主图原位展开结构，并打开参数抽屉。",
        en: "Shows the path from input through Backbone and Head to P3/P4/P5 Detect for {version}. Click a module to expand it in place and open the parameter drawer.",
      },
      input: { zh: "输入", en: "Input" },
      expanded: { zh: "已展开", en: "Expanded" },
      collapseExpanded: { zh: "收起 Layer {id} {module} 的展开结构", en: "Collapse expanded structure for Layer {id} {module}" },
      nodeAria: {
        zh: "{action} Layer {id} {module} 的结构和参数",
        en: "{action} the structure and parameters of Layer {id} {module}",
      },
      detectAria: {
        zh: "{action} {label} Detect 检测头参数",
        en: "{action} {label} Detect head parameters",
      },
      actionExpand: { zh: "展开", en: "Expand" },
      actionCollapse: { zh: "收起", en: "Collapse" },
      actionView: { zh: "查看", en: "View" },
      unitAria: { zh: "查看 {title} 的说明", en: "View details for {title}" },
    },
    detail: {
      kicker: { zh: "模块详情", en: "Module details" },
      emptyTitle: { zh: "点击图中的模块", en: "Click a module in the diagram" },
      closeAria: { zh: "关闭模块详情", en: "Close module details" },
      noDescription: { zh: "暂无说明", en: "No description yet" },
      noSummary: { zh: "暂无简介", en: "No summary yet" },
      shape: { zh: "Shape 约定", en: "Shape convention" },
      channels: { zh: "输入 / 输出通道", en: "Input / output channels" },
      yamlMath: { zh: "本层 YAML 计算", en: "This layer's YAML math" },
      comparison: { zh: "n/s/m/l/x 对比", en: "n/s/m/l/x comparison" },
      internals: { zh: "模块内部结构", en: "Module internals" },
      formulasNote: {
        zh: "通用公式与缩放规则表已抽到「📚 知识库」中，点击顶部工具栏的按钮可随时查看。",
        en: "General formulas and scaling tables live in the Knowledge Base. Open it from the toolbar when needed.",
      },
      internalsNote: {
        zh: "点击展开图或上方流程中的小卡片，可查看该算子的简介与参数（在抽屉中嵌套展开）。",
        en: "Click a small card in the expanded graph or flow above to inspect that operator and its parameters inside the drawer.",
      },
      params: { zh: "参数", en: "Parameters" },
      ownerLayer: { zh: "所属层", en: "Parent layer" },
      innerClickable: { zh: "内部结构（点击查看）", en: "Inner structure (click to inspect)" },
      back: { zh: "← 返回上一级", en: "← Back" },
    },
    shape: {
      detect: {
        zh: "主图中 P3/P4/P5 仍按 HWC 理解空间尺度。Detect 是多尺度输出，不是一个单独的 HWC tensor；每个尺度会分别产生 box 分布通道和类别通道，右侧公式区展示 no=nc+4×reg_max 的计算方式。",
        en: "In the main diagram, P3/P4/P5 still use HWC to describe spatial scale. Detect is a multi-scale output, not one single HWC tensor. Each scale produces box distribution channels and class channels; the formula area shows no=nc+4×reg_max.",
      },
      standard: {
        zh: "主结构图统一使用 HWC：height×width×channel，便于从图像尺度理解网络。模块展开中的底层算子使用 PyTorch NCHW：N×channel×height×width，其中 N 表示 batch 维度（推理时 N=1，训练时 N 由 DataLoader 决定，是动态的）。例如 {hwc} 对应 {nchw}。",
        en: "The main diagram uses HWC: height×width×channel, which is easier to read from image scale. Expanded primitive operators use PyTorch NCHW: N×channel×height×width, where N is the batch dimension (N=1 for inference; during training it comes from the DataLoader and is dynamic). For example, {hwc} maps to {nchw}.",
      },
      reference: {
        zh: "主结构图统一使用 HWC：height × width × channel，便于从图像尺度理解网络。模块展开中的底层算子使用 PyTorch NCHW：N × channel × height × width，其中 N 表示 batch 维度（推理时 N=1，训练时 N 由 DataLoader 决定，是动态的）。例如 80×80×128 对应 N×128×80×80。",
        en: "The main diagram uses HWC: height × width × channel. Expanded primitive operators use PyTorch NCHW: N × channel × height × width. N is the batch dimension (N=1 for inference; during training it comes from the DataLoader and is dynamic). For example, 80×80×128 maps to N×128×80×80.",
      },
    },
    channels: {
      inputTitle: { zh: "输入通道 c_in={value}", en: "Input channels c_in={value}" },
      outputTitle: { zh: "输出通道 c_out={value}", en: "Output channels c_out={value}" },
      sourceInput: { zh: "来自输入图片，RGB 三个颜色通道，所以 c_in=3。", en: "Comes from the input image. RGB has three color channels, so c_in=3." },
      sourceConcat: { zh: "{sources}，Concat 后按通道相加。", en: "{sources}; after Concat, channels are summed along the channel dimension." },
      sourceDetect: { zh: "来自 Head 的 P3、P4、P5 三个输出特征，各尺度通道数分别进入独立检测分支。", en: "Comes from the Head outputs P3, P4, and P5. Each scale enters its own detection branch." },
      sourceUpsample: { zh: "来自上一层输出，上采样只改变 H/W，不改变通道数。", en: "Comes from the previous layer. Upsampling changes H/W only and keeps channels unchanged." },
      sourcePrev: { zh: "来自上一层输出通道数，作为当前模块的 c_in。", en: "Comes from the previous layer's output channels, used as this module's c_in." },
      sourceItem: { zh: "{label} 输出 {channels} 通道", en: "{label} outputs {channels} channels" },
      scaledOutput: { zh: "YAML 给出基础通道 {base}，当前 {model} 使用 width={width} 缩放后得到 c_out={channels}。", en: "YAML gives base channels {base}. Current {model} applies width={width}, resulting in c_out={channels}." },
      concatOutput: { zh: "输出通道等于输入通道求和：{input} = {channels}。", en: "Output channels equal the sum of input channels: {input} = {channels}." },
      upsampleOutput: { zh: "输出通道保持不变：c_out={channels}。", en: "Output channels stay unchanged: c_out={channels}." },
      detectOutput: { zh: "Detect 不把三路特征合成一个 c_out，每个位置输出 {box} 个 box 分布通道和 {cls} 个类别通道。", en: "Detect does not merge the three scales into one c_out. Each position outputs {box} box distribution channels and {cls} class channels." },
      simpleOutput: { zh: "输出通道为 {channels}。", en: "Output channels are {channels}." },
      convFilter: { zh: "对 Conv 来说，输出通道 c_out={channels} 也就是 filter 组数。当前层每组 filter 的权重形状是 {channels}×{input}×{k}×{k}，生成 {channels} 个输出特征通道。", en: "For Conv, output channels c_out={channels} are the number of filter groups. Each filter group has weight shape {channels}×{input}×{k}×{k}, producing {channels} output feature channels." },
    },
    reference: {
      button: { zh: "知识库", en: "Knowledge Base" },
      openAria: { zh: "打开知识库：YAML 计算方式与术语解释", en: "Open Knowledge Base: YAML formulas and term explanations" },
      closeAria: { zh: "关闭知识库", en: "Close Knowledge Base" },
      title: { zh: "知识库 · YAML 计算方式与术语", en: "Knowledge Base · YAML formulas and terms" },
      description: { zh: "通用公式、缩放规则表、参数词汇表与 Shape 约定，与具体层无关的固定解释集中在此。", en: "General formulas, scaling tables, parameter glossary, and shape conventions are grouped here." },
      yamlFormat: { zh: "YAML 行格式", en: "YAML row format" },
      yamlIntro: { zh: "每一层在 {yamlName} 中以一行 [from, repeat, module, args] 表示。例如：", en: "Each layer in {yamlName} is represented as one [from, repeat, module, args] row. Example:" },
      versionFeatures: { zh: "当前版本特性", en: "Current version features" },
      formulas: { zh: "通用计算公式", en: "Common formulas" },
      scaleRules: { zh: "{version} n / s / m / l / x 缩放规则", en: "{version} n / s / m / l / x scaling rules" },
      glossary: { zh: "参数词汇表", en: "Parameter glossary" },
      shapeConvention: { zh: "Shape 约定", en: "Shape convention" },
      version: { zh: "版本", en: "Version" },
      yamlSource: { zh: "YAML 源文件", en: "YAML source" },
      outputChannels: { zh: "输出通道", en: "Output channels" },
      actualRepeat: { zh: "实际重复", en: "Actual repeats" },
      convSpatial: { zh: "Conv 空间尺寸", en: "Conv spatial size" },
      detectOutputDim: { zh: "Detect 输出维度", en: "Detect output dimension" },
      formulasNote: {
        zh: "这些公式对所有层都适用，具体数值会因当前层的 base/repeat 与所选模型的 depth/width/max_channels 而不同。每层点击后右侧抽屉会展示带具体数值的计算过程。",
        en: "These formulas apply to all layers. Concrete values vary with the current layer's base/repeat and the selected model's depth/width/max_channels. Click any layer to see the numeric calculation in the drawer.",
      },
      scaleNote: {
        zh: "depth 控制 Bottleneck / C3k / PSABlock 等子块的重复次数；width 控制每层通道数；max_channels 是通道上限。同一个 C3k2 层在 YOLO11/26 的 m/l/x 规模下，内部子块类型也可能不同：n/s 用 Bottleneck，m/l/x 用 C3k。",
        en: "depth controls repeats for sub-blocks such as Bottleneck, C3k, and PSABlock. width controls channels, and max_channels caps them. For the same C3k2 layer in YOLO11/26, n/s use Bottleneck while m/l/x may use C3k.",
      },
      fromDesc: { zh: "输入来源。-1 表示上一层，[−1, 6] 表示同时取上一层和 Layer 6（用于 Concat）。", en: "Input source. -1 means the previous layer; [−1, 6] means the previous layer plus Layer 6, used by Concat." },
      repeatDesc: { zh: "YAML 中声明的重复次数。实际堆叠数 = max(round(repeat × depth), 1)。", en: "Repeat count declared in YAML. Actual stacked count = max(round(repeat × depth), 1)." },
      moduleDesc: { zh: "模块类名，如 {examples}。", en: "Module class name, for example {examples}." },
      argsDesc: { zh: "模块构造参数。第一个通常是输出通道数（base channels）。", en: "Module constructor arguments. The first value is usually output channels (base channels)." },
    },
    compare: {
      button: { zh: "版本对比", en: "Version compare" },
      openAria: { zh: "打开版本对比：v5 → v8 → v11 → v26 演进表", en: "Open version comparison: v5 → v8 → v11 → v26 evolution table" },
      closeAria: { zh: "关闭版本对比", en: "Close version comparison" },
      title: { zh: "版本对比 · YOLOv5 → v8 → v11 → v26", en: "Version Comparison · YOLOv5 → v8 → v11 → v26" },
      description: { zh: "四版本架构演进时间线与关键差异矩阵，数据均来自 Ultralytics 官方源码 YAML。", en: "Architecture timeline and key difference matrix for four versions, based on official Ultralytics YAML files." },
      timeline: { zh: "演进时间线", en: "Evolution timeline" },
      matrix: { zh: "关键差异矩阵", en: "Key difference matrix" },
      takeaways: { zh: "关键洞察", en: "Key takeaways" },
      yamlSources: { zh: "YAML 源文件", en: "YAML sources" },
      focus: { zh: "重点：{text}", en: "Focus: {text}" },
      dimension: { zh: "维度", en: "Dimension" },
      takeawaysHtml: {
        zh: [
          "<strong>Backbone 演进</strong>：YOLOv5 用 <code>C3</code> + 大核 <code>Conv k=6</code> 下采样；v8 改用 <code>C2f</code>（梯度流更短）；v11 引入 <code>C3k2</code>（可选 C3k 子块）+ <code>C2PSA</code> 注意力；v26 沿用 v11 backbone 但 SPPF 加 <code>shortcut=True</code> 残差。",
          "<strong>Head 演进</strong>：v5 head 用 <code>C3 (shortcut=False)</code>；v8 改 <code>C2f</code>；v11 用 <code>C3k2 (c3k=False)</code>；v26 全部改为 <code>C3k2 (c3k=True)</code>，精度更高但计算更重，P5 large 还额外启用 <code>e=0.5 + shortcut=True</code>。",
          "<strong>Detect 演进</strong>：v5/v8 用 <code>legacy=True</code> 纯 Conv 头；v11 改 <code>legacy=False</code> 用 DWConv+Conv 降参数；v26 关键突破：<code>reg_max=1</code>（DFL 退化为直接回归）+ <code>end2end=True</code>（推理无需 NMS）。",
          "<strong>规模缩放</strong>：v5/v8 沿用 <code>0.33/0.50/0.67/1.0/1.33</code> 的 depth 节奏；v11/v26 改为 <code>0.5/0.5/0.5/1.0/1.0</code>，n/s/m 共享 depth=0.5 让小模型也有足够深度。v11/v26 的 max_channels 在 m/l/x 截断到 512。",
          "<strong>参数量</strong>：v5n 2.6M → v8n 3.2M（精度提升但变重）→ v11n 2.6M（C3k2 + DWConv 让参数回落）→ v26n 2.6M（保持参数同时 end2end + reg_max=1 提升 AP）。",
        ],
        en: [
          "<strong>Backbone evolution</strong>: YOLOv5 uses <code>C3</code> plus large-kernel <code>Conv k=6</code> downsampling. v8 switches to <code>C2f</code> for shorter gradient flow. v11 adds <code>C3k2</code> with optional C3k sub-blocks and <code>C2PSA</code> attention. v26 keeps the v11 backbone but adds <code>shortcut=True</code> to SPPF.",
          "<strong>Head evolution</strong>: v5 uses <code>C3 (shortcut=False)</code> in the head; v8 uses <code>C2f</code>; v11 uses <code>C3k2 (c3k=False)</code>; v26 changes all head blocks to <code>C3k2 (c3k=True)</code>, heavier but more expressive. P5 large also enables <code>e=0.5 + shortcut=True</code>.",
          "<strong>Detect evolution</strong>: v5/v8 use <code>legacy=True</code> pure Conv heads. v11 switches to <code>legacy=False</code> with DWConv+Conv to reduce parameters. v26's key change is <code>reg_max=1</code> plus <code>end2end=True</code>, enabling NMS-free inference.",
          "<strong>Scale rules</strong>: v5/v8 follow the <code>0.33/0.50/0.67/1.0/1.33</code> depth rhythm. v11/v26 use <code>0.5/0.5/0.5/1.0/1.0</code>, so n/s/m keep enough depth. v11/v26 cap max_channels at 512 for m/l/x.",
          "<strong>Parameters</strong>: v5n 2.6M → v8n 3.2M, heavier for accuracy → v11n 2.6M, where C3k2 and DWConv bring parameters back down → v26n 2.6M with end2end and reg_max=1.",
        ],
      },
    },
    footer: {
      sources: { zh: "结构来源（Ultralytics 源码）：", en: "Sources (Ultralytics code):" },
      shortcuts: { zh: "鼠标拖拽平移 · 滚轮缩放 · Shift+滚轮垂直平移 · F 适屏 · 0 重置 · 1/2/3/4 切换版本", en: "Drag to pan · Wheel to zoom · Shift+wheel to pan vertically · F fit · 0 reset · 1/2/3/4 switch versions" },
    },
    tables: {
      scaleAria: { zh: "模型缩放规则", en: "Model scaling rules" },
      modelCompareAria: { zh: "不同模型大小下当前层变化", en: "Current layer changes across model sizes" },
      model: { zh: "model", en: "model" },
      depth: { zh: "depth", en: "depth" },
      width: { zh: "width", en: "width" },
      maxChannels: { zh: "max ch", en: "max ch" },
      hiddenBranch: { zh: "hidden/branch", en: "hidden/branch" },
    },
    yaml: {
      outputChannels: { zh: "输出通道", en: "Output channels" },
      outputDim: { zh: "输出维度", en: "Output dimension" },
      repeats: { zh: "重复次数", en: "Repeats" },
      spatial: { zh: "空间尺寸", en: "Spatial size" },
      noDepthScale: { zh: "repeat=1 时不做 depth 放缩。", en: "repeat=1 is not depth-scaled." },
      spatialFormula: {
        zh: "H_out = floor(({h} + 2×{p} - {k}) / {s}) + 1 = {out}，所以 {ih}×{iw} → {oh}×{ow}",
        en: "H_out = floor(({h} + 2×{p} - {k}) / {s}) + 1 = {out}, so {ih}×{iw} → {oh}×{ow}",
      },
    },
  };

  const DATA_TRANSLATIONS = {
    "二维卷积。在输入特征图上滑动 k×k 的卷积核，做加权求和得到输出。": "2D convolution. A k×k kernel slides over the input feature map and computes weighted sums to produce the output.",
    "提取局部空间特征并完成通道变换。stride=2 时同时完成下采样，是网络的主干算子。": "Extracts local spatial features and changes channel count. With stride=2, it also downsamples and acts as a core backbone operator.",
    "批归一化。对每个通道在 batch 维度上做 (x-μ)/√(σ²+ε)·γ+β。": "Batch normalization. For each channel, it normalizes over the batch dimension with (x-μ)/√(σ²+ε)·γ+β.",
    "稳定训练分布、加速收敛、减少对初始化的敏感度，推理时融合到 Conv 权重里几乎零开销。": "Stabilizes training distributions, speeds convergence, and reduces sensitivity to initialization. At inference it is fused into Conv weights with almost no extra cost.",
    "SiLU 激活函数：x · sigmoid(x)。": "SiLU activation: x · sigmoid(x).",
    "比 ReLU 更平滑、有下界负值，梯度更稳定，YOLO 系列默认激活函数。": "Smoother than ReLU, allows bounded negative values, and provides more stable gradients. It is the default activation in YOLO.",
    "无参数（纯函数）": "No parameters (pure function)",
    "残差瓶颈块：两层 3×3 卷积 + 可选残差 shortcut。": "Residual bottleneck block: two 3×3 convolutions plus an optional residual shortcut.",
    "在保留通道数的前提下做更深的特征变换，shortcut 缓解梯度消失。": "Applies deeper feature transformation while preserving channel count. The shortcut helps mitigate vanishing gradients.",
    "CSP-style 子块。结构：cv1 Conv → chunk(2) → 2× Bottleneck(k=3, shortcut=True) → Concat → cv2 Conv。": "CSP-style sub-block: cv1 Conv → chunk(2) → 2× Bottleneck(k=3, shortcut=True) → Concat → cv2 Conv.",
    "比单层 Bottleneck 表达力更强。C3k2 在 m/l/x 规模上启用 c3k=True 以提升精度，n/s 规模用 Bottleneck 节省参数。": "More expressive than a single Bottleneck. C3k2 enables c3k=True for m/l/x to improve accuracy, while n/s use Bottleneck to save parameters.",
    "Attention + FFN 子块，类似 Transformer Encoder。": "Attention + FFN sub-block, similar to a Transformer Encoder.",
    "在 P5 高层语义上建模全局依赖，提升大目标识别能力，是 YOLO11/26 引入的关键模块。": "Models global dependencies on high-level P5 semantics and improves large-object recognition. This is a key module introduced in YOLO11/26.",
    "最大值池化。在 k×k 邻域取最大值作为输出。": "Max pooling. Takes the maximum value in each k×k neighborhood as the output.",
    "扩大感受野并保留最强响应。SPPF 中串联 3 次以获得多尺度上下文而不改变尺寸。": "Expands the receptive field and keeps the strongest responses. SPPF chains it three times for multi-scale context without changing spatial size.",
    "按指定维度拼接多个张量。YOLO 中常用 dim=1（通道维）拼接。": "Concatenates tensors along a chosen dimension. YOLO usually uses dim=1, the channel dimension.",
    "融合不同来源或不同感受野的特征，拼接后通道数相加，再由后续 1×1 Conv 融合。": "Fuses features from different sources or receptive fields. Channels are summed after concatenation, then a later 1×1 Conv mixes them.",
    "沿通道维度把张量分成多份（PyTorch 的 chunk 或 split）。": "Splits a tensor into multiple parts along the channel dimension, using PyTorch chunk or split.",
    "C3/C2f/C3k2/C2PSA 的 CSP 设计：一部分走旁路保留原始特征，一部分进入内部块做变换。": "CSP design for C3/C2f/C3k2/C2PSA: one part bypasses to preserve original features, while another enters inner blocks for transformation.",
    "最近邻上采样。每个像素被复制成 scale×scale 的块。": "Nearest-neighbor upsampling. Each pixel is copied into a scale×scale block.",
    "FPN 自顶向下放大特征图，速度最快、无参数，比双线性更符合检测任务习惯。": "Upscales features in the top-down FPN path. It is fast, parameter-free, and commonly used for detection.",
    "PyTorch 的张量拼接 API，等价于 Concat 模块。": "PyTorch tensor concatenation API, equivalent to the Concat module.",
    "在 Concat 模块中实际调用，按通道维拼接多个来源的特征。": "The API called inside Concat, joining features from multiple sources along the channel dimension.",
    "标记 Concat 的多个输入来源（上一层 + 跳跃连接的层）。": "Marks the multiple input sources for Concat, usually the previous layer plus a skip-connected layer.",
    "可视化 CSP/FPN/PAN 中的多源融合，每个输入的通道数会被加总。": "Visualizes multi-source fusion in CSP/FPN/PAN. Channels from each input are summed.",
    "检测头的边框回归分支。3 层 Conv 后输出 4×reg_max 个分布值。": "Box regression branch of the detection head. After three Conv layers it outputs 4×reg_max distribution values.",
    "用 DFL 离散分布预测每条边相对锚点的偏移，比直接回归 4 个连续值更精确。YOLO26 的 reg_max=1 退化为直接回归 4 个连续偏移。": "Uses DFL discrete distributions to predict each side's offset from an anchor point, usually more precise than direct regression. In YOLO26, reg_max=1 degenerates to direct regression of four continuous offsets.",
    "检测头的分类分支。YOLOv5/v8 用纯 Conv 提取类别证据；YOLO11/26 用 DWConv+Conv 降低参数量。": "Classification branch of the detection head. YOLOv5/v8 use pure Conv for class evidence; YOLO11/26 use DWConv+Conv to reduce parameters.",
    "输出每个位置的类别分布，最后生成 nc=80 个类别分数。": "Outputs class distributions at each location, finally producing nc=80 class scores.",
    "DWConv k=3 + Conv k=1 ×2 → Conv k=1 输出 nc=80 (v11/v26) 或 纯 Conv ×2 → nc (v5/v8)": "DWConv k=3 + Conv k=1 ×2 → Conv k=1 outputs nc=80 (v11/v26), or pure Conv ×2 → nc (v5/v8)",
    "模块入口的 1×1 卷积。把输入通道变换到 hidden×2（hidden 由 e 决定）。": "The module entry 1×1 Conv. It maps input channels to hidden×2, where hidden is controlled by e.",
    "压缩通道并为后续 Split 做准备，是 CSP 结构的标准入口。": "Compresses channels and prepares for the following Split. This is the standard entry of CSP-style blocks.",
    "模块出口的 1×1 卷积。把 Concat 后的通道融合回 c_out。": "The module exit 1×1 Conv. It fuses concatenated channels back to c_out.",
    "整合多路特征并把通道数对齐到 YAML 期望的输出通道。": "Integrates multi-branch features and aligns channels to the YAML-defined output channel count.",
    "残差连接": "Residual connection",
    "残差相加": "Residual add",
    "对 cv1 输出做残差变换": "Apply residual transformation to cv1 output",
    "cv2 旁路 + n 个输出": "cv2 bypass + n outputs",
    "沿通道分两半": "Split into two halves along channels",
    "串接 n 个 Bottleneck": "Chain n Bottleneck blocks",
    "每个 k=(3,3), shortcut 可选": "Each uses k=(3,3), optional shortcut",
    "保留 + n 个输出": "Kept branch + n outputs",
    "对其中一半做残差变换": "Apply residual transformation to one half",
    "另一半 + 2 个输出": "Other half + 2 outputs",
    "Conv 是 YOLO 中最基础的算子组合：Conv2d 负责局部特征提取和通道变换，BatchNorm2d 稳定训练，SiLU 提供非线性。stride=2 时会把特征图宽高减半。": "Conv is the basic operator stack in YOLO: Conv2d extracts local features and changes channels, BatchNorm2d stabilizes training, and SiLU adds nonlinearity. With stride=2, spatial width and height are halved.",
    "Conv 是 YOLO 中最基础的算子组合：Conv2d 负责局部特征提取和通道变换，BatchNorm2d 稳定训练，SiLU 提供非线性。stride=2 时会把特征图宽高减半。YOLOv5 的首层使用 k=6 大核以替代 Focus 切片操作。": "Conv is the basic operator stack in YOLO: Conv2d extracts local features and changes channels, BatchNorm2d stabilizes training, and SiLU adds nonlinearity. With stride=2, spatial width and height are halved. YOLOv5 uses a k=6 first layer as a replacement for the old Focus slicing operation.",
    "C3（CSP Bottleneck with 3 convolutions）：cv1 1×1 Conv 切分通道，一路走 n 个 Bottleneck，另一路 cv2 1×1 Conv 保留，最后 Concat + cv3 1×1 Conv 融合。是 YOLOv5 的核心 CSP 模块。": "C3 (CSP Bottleneck with 3 convolutions): cv1 1×1 Conv transforms one branch through n Bottleneck blocks, while cv2 1×1 Conv keeps a bypass branch. The branches are fused by Concat + cv3 1×1 Conv. It is the core CSP module in YOLOv5.",
    "SPPF 在 P5 上连续执行三次 MaxPool2d(k=5)，把不同感受野的上下文拼接在一起，再用 1×1 Conv 融合。YOLOv5 版本无 shortcut 连接。": "SPPF applies MaxPool2d(k=5) three times on P5, concatenates contexts with different receptive fields, then fuses them with a 1×1 Conv. The YOLOv5 version has no shortcut.",
    "SPPF 在 P5 上连续执行三次 MaxPool2d(k=5)，把不同感受野的上下文拼接在一起，再用 1×1 Conv 融合。": "SPPF applies MaxPool2d(k=5) three times on P5, concatenates contexts with different receptive fields, then fuses them with a 1×1 Conv.",
    "Upsample 使用 nearest x2，只改变特征图宽高，不改变通道数，用于 FPN 自顶向下对齐浅层特征。": "Upsample uses nearest x2. It changes only feature-map height and width, not channels, and aligns shallow features in the top-down FPN path.",
    "Concat 按通道维 dim=1 拼接同分辨率特征。拼接后通道数相加，后续 C3 再负责融合。": "Concat joins same-resolution features along channel dimension dim=1. Channels are summed, then C3 fuses them.",
    "Concat 按通道维 dim=1 拼接同分辨率特征。拼接后通道数相加，后续 C2f 再负责融合。": "Concat joins same-resolution features along channel dimension dim=1. Channels are summed, then C2f fuses them.",
    "Concat 按通道维 dim=1 拼接同分辨率特征。拼接后通道数相加，后续 C3k2 再负责融合。": "Concat joins same-resolution features along channel dimension dim=1. Channels are summed, then C3k2 fuses them.",
    "Detect 接收 P3/P4/P5 三个尺度。YOLOv5 使用 legacy 检测头：cv2/cv3 都是纯 Conv（无 DWConv），box 分支输出 4×reg_max=64 的分布，再经 DFL 解码为边框偏移。": "Detect receives three scales: P3/P4/P5. YOLOv5 uses the legacy head, where cv2/cv3 are pure Conv without DWConv. The box branch outputs 4×reg_max=64 distribution channels, decoded by DFL into box offsets.",
    "C3 = CSP Bottleneck with 3 convolutions。结构：cv1 1×1 Conv → n× Bottleneck → Concat(cv2 旁路, 主路输出) → cv3 1×1 Conv。": "C3 = CSP Bottleneck with 3 convolutions. Structure: cv1 1×1 Conv → n× Bottleneck → Concat(cv2 bypass, main path output) → cv3 1×1 Conv.",
    "YOLOv5 的核心 CSP 模块，比 YOLOv4 的 C3 路径更紧凑。head 中的 C3 使用 shortcut=False（无内部残差），backbone 中的 C3 默认 shortcut=True。": "The core CSP module in YOLOv5, more compact than the YOLOv4 C3 path. C3 in the head uses shortcut=False, while C3 in the backbone defaults to shortcut=True.",
    "C2f（CSP Bottleneck with 2 convolutions, faster）是 YOLOv8 的核心模块。相比 YOLOv5 的 C3，C2f 用单个 cv1 输出 2×hidden 通道，split 后一路保留、一路串接 n 个 Bottleneck 输出，最后 Concat 2+n 路再 cv2 融合。结构更紧凑、梯度流更短。": "C2f (CSP Bottleneck with 2 convolutions, faster) is the core module in YOLOv8. Compared with YOLOv5 C3, C2f uses one cv1 to output 2×hidden channels, then keeps one split branch and chains n Bottleneck outputs on the other. It concatenates 2+n branches and fuses with cv2, giving a more compact structure and shorter gradient flow.",
    "Detect 接收 P3/P4/P5 三个尺度。YOLOv8 使用 legacy 检测头：cv2/cv3 都是纯 Conv（无 DWConv），box 分支输出 4×reg_max=64 的分布，再经 DFL 解码为边框偏移。相比 YOLOv5 移除了 objectness 分支，更接近 anchor-free 设计。": "Detect receives P3/P4/P5. YOLOv8 uses the legacy head where cv2/cv3 are pure Conv without DWConv. The box branch outputs 4×reg_max=64 distribution channels, decoded by DFL into offsets. Compared with YOLOv5, the objectness branch is removed, moving closer to an anchor-free design.",
    "C2f = CSP Bottleneck with 2 convolutions, faster。结构：cv1 1×1 Conv → split(2) → 一路保留 + 一路串接 n 个 Bottleneck → Concat(2+n 路) → cv2 1×1 Conv。": "C2f = CSP Bottleneck with 2 convolutions, faster. Structure: cv1 1×1 Conv → split(2) → one kept branch + one branch chaining n Bottleneck blocks → Concat(2+n branches) → cv2 1×1 Conv.",
    "相比 YOLOv5 的 C3，C2f 把所有 Bottleneck 输出都接到 Concat，梯度流更短，精度更高且速度更快。": "Compared with YOLOv5 C3, C2f sends all Bottleneck outputs to Concat, shortening gradient flow and improving both accuracy and speed.",
    "C3k2 继承 C2f 的两卷积 CSP 结构。cv1 先扩展并切分通道，一路保留，一路经过 n 个 Bottleneck 或 C3k 子块，最后 concat 后用 cv2 融合。c3k=True 时使用更深的 C3k 子块（C3-style + 2 个 Bottleneck），m/l/x 规模自动启用。": "C3k2 inherits the two-convolution CSP structure of C2f. cv1 expands and splits channels; one branch is kept while the other passes through n Bottleneck or C3k sub-blocks, then concat and cv2 fuse the result. With c3k=True, it uses the deeper C3k sub-block (C3-style + 2 Bottlenecks), enabled automatically for m/l/x.",
    "C2PSA 把通道一分为二，其中一路经过堆叠的 PSABlock 注意力和前馈层，再与旁路拼接，强化高层语义。是 YOLO11 在 SPPF 后引入的关键模块。": "C2PSA splits channels into two parts. One branch passes through stacked PSABlock attention and feed-forward layers, then concatenates with the bypass branch to strengthen high-level semantics. It is a key module added after SPPF in YOLO11.",
    "Detect 接收 P3/P4/P5 三个尺度。YOLO11 使用 legacy=False 检测头：cv3 用 DWConv+Conv 结构降低参数量，box 分支输出 4×reg_max=64 的分布，再经 DFL 解码为边框偏移。": "Detect receives P3/P4/P5. YOLO11 uses legacy=False: cv3 uses DWConv+Conv to reduce parameters, and the box branch outputs 4×reg_max=64 distribution channels decoded by DFL into box offsets.",
    "C3k2 继承 C2f 的两卷积 CSP 结构。YOLO26 在 Head 中全部使用 c3k=True（比 YOLO11 的 c3k=False 更重，精度更高）；P5 large 还额外启用 e=0.5 和 shortcut=True。m/l/x 规模同样会强制 c3k=True。": "C3k2 inherits C2f's two-convolution CSP structure. In YOLO26, all Head C3k2 blocks use c3k=True, heavier but more accurate than YOLO11's c3k=False. P5 large also enables e=0.5 and shortcut=True. m/l/x scales also force c3k=True.",
    "YOLO26 的 SPPF 在原有结构上增加 shortcut=True：当输入输出通道相等时，把输入直接加到 SPPF 输出上，形成残差连接，提升梯度流和特征复用。": "YOLO26 adds shortcut=True to SPPF. When input and output channels match, the input is added directly to the SPPF output, forming a residual connection that improves gradient flow and feature reuse.",
    "C2PSA 把通道一分为二，其中一路经过堆叠的 PSABlock 注意力和前馈层，再与旁路拼接，强化高层语义。结构与 YOLO11 完全一致。": "C2PSA splits channels in two. One branch passes through stacked PSABlock attention and feed-forward layers, then concatenates with the bypass branch to strengthen high-level semantics. The structure is identical to YOLO11.",
    "Detect 接收 P3/P4/P5 三个尺度。YOLO26 的关键差异：end2end=True 同时训练 one2many（传统 NMS 流程）+ one2one（一对一匹配，推理无需 NMS）；reg_max=1 让 DFL 退化为直接回归 4 个连续边框偏移；推理 fuse() 后只保留 one2one 头。": "Detect receives P3/P4/P5. YOLO26's key changes are end2end=True, which trains one2many for the traditional NMS path plus one2one for NMS-free inference; reg_max=1 makes DFL degenerate to direct regression of four continuous box offsets; after fuse(), only the one2one head is kept for inference.",
    "检测头的边框回归分支。3 层 Conv 后输出 4×reg_max 个值。YOLO26 的 reg_max=1，等价于直接回归 4 个连续边框偏移，无需 DFL 解码。": "Box regression branch of the detection head. After three Conv layers it outputs 4×reg_max values. In YOLO26, reg_max=1 equals direct regression of four continuous box offsets without DFL decoding.",
    "传统 reg_max=16 用 DFL 离散分布预测每条边相对锚点的偏移；YOLO26 简化为 reg_max=1，减少参数和计算量，配合 end2end 训练保持精度。": "Traditional reg_max=16 uses DFL distributions to predict each side's offset from the anchor point. YOLO26 simplifies this to reg_max=1, reducing parameters and compute while keeping accuracy with end2end training.",
    "Conv(k=3,s=1) → Conv(k=3,s=1) → Conv(k=1) → 4×reg_max=4 (v26) 或 4×16=64 (v5/v8/v11)": "Conv(k=3,s=1) → Conv(k=3,s=1) → Conv(k=1) → 4×reg_max=4 (v26), or 4×16=64 (v5/v8/v11)",
    "kernel size，卷积核大小。k=3 表示每次看 3×3 邻域，k=1 常用于通道变换。": "kernel size. k=3 looks at a 3×3 neighborhood; k=1 is often used for channel transformation.",
    "stride，卷积步长。s=2 会把特征图宽高减半，s=1 保持当前分辨率。": "stride. s=2 halves feature-map width and height; s=1 keeps the current resolution.",
    "padding，边缘补零。常见 p=k//2，用来让 s=1 的卷积保持宽高不变。": "padding. Commonly p=k//2, which keeps width and height unchanged when s=1.",
    "进入当前模块的特征通道数。第一层是 RGB 的 3 通道，后续通常来自上一层输出或 Concat 的通道求和。": "Number of feature channels entering the current module. The first layer has 3 RGB channels; later layers usually use the previous output or the channel sum after Concat.",
    "当前模块生成的特征通道数。对 Conv 来说，它也等于 filter 组数，每个输出通道对应一组 c_in×k×k 权重。": "Number of feature channels produced by the current module. For Conv, this also equals the number of filter groups; each output channel corresponds to one c_in×k×k weight group.",
    "YAML 中的重复次数会乘 depth，再四舍五入且至少为 1。C3/C2f/C3k2/C2PSA 的 repeat 是模块内部子块数。": "The YAML repeat count is multiplied by depth, rounded, and kept at least 1. For C3/C2f/C3k2/C2PSA, repeat means the number of inner sub-blocks.",
    "Ultralytics 的复合缩放规则：通道先受 max_channels 截断，再乘 width 并对齐到 8；repeat 受 depth 影响。": "Ultralytics compound scaling: channels are clipped by max_channels, multiplied by width, then aligned to 8; repeat is scaled by depth.",
    "三个检测尺度，对应 stride 8/16/32。输入 640 时空间尺寸分别为 80×80、40×40、20×20。": "Three detection scales at strides 8/16/32. With 640 input, spatial sizes are 80×80, 40×40, and 20×20.",
    "DFL 将每个边框边的离散分布转成连续偏移。reg_max=16 时 box logits 为 4×16=64 通道；YOLO26 的 reg_max=1 退化为直接回归 4 个连续值。": "DFL converts a discrete distribution for each box side into a continuous offset. With reg_max=16, box logits have 4×16=64 channels; YOLO26 reg_max=1 degenerates to direct regression of four continuous values.",
    "类别数。这里按 COCO 默认 nc=80 展示，所以分类分支最后输出 80 通道。": "Number of classes. This page uses the COCO default nc=80, so the classification branch outputs 80 channels.",
    "YOLO26 默认 end2end=True：训练时同时学 one2many（一对多，传统 NMS 流程）+ one2one（一对一，推理无需 NMS）。推理 fuse() 后只保留 one2one 头。": "YOLO26 defaults to end2end=True: training learns one2many for the traditional NMS path and one2one for NMS-free inference. After fuse(), only the one2one head is kept.",
    "工程化与易用性": "Engineering and usability",
    "Anchor-free 与解耦头": "Anchor-free and decoupled head",
    "高效注意力": "Efficient attention",
    "End-to-end 与极简回归": "End-to-end and minimal regression",
    "Focus 切片下采样 → Conv k=6 替代；C3 模块成为 CSP 主力；SPPF 串联池化；耦合检测头（含 objectness）。": "Focus slicing downsampling is replaced by Conv k=6; C3 becomes the main CSP module; SPPF chains pooling; coupled detection head includes objectness.",
    "C2f 替代 C3（梯度流更短）；移除 objectness 分支；解耦 box/cls 头；Mosaic 关闭在最后 epoch。": "C2f replaces C3 for shorter gradient flow; objectness branch is removed; box/cls heads are decoupled; Mosaic is disabled in the final epochs.",
    "C3k2 替代 C2f（可选 C3k 子块）；SPPF 后增加 C2PSA 注意力；Detect cv3 用 DWConv+Conv 降参数。": "C3k2 replaces C2f with optional C3k sub-blocks; C2PSA attention is added after SPPF; Detect cv3 uses DWConv+Conv to reduce parameters.",
    "SPPF 加 shortcut；Head C3k2 全部 c3k=True；reg_max=1 退化为直接回归；end2end=True 推理无需 NMS。": "SPPF adds shortcut; all Head C3k2 blocks use c3k=True; reg_max=1 degenerates to direct regression; end2end=True enables NMS-free inference.",
    "Stem 下采样": "Stem downsampling",
    "Backbone CSP 模块": "Backbone CSP module",
    "Backbone 子块": "Backbone sub-block",
    "SPPF 后注意力": "Attention after SPPF",
    "Head CSP 模块": "Head CSP module",
    "FPN 入口 1×1 Conv": "FPN entry 1×1 Conv",
    "P5 large 额外参数": "P5 large extra args",
    "objectness 分支": "objectness branch",
    "DFL 解码": "DFL decoding",
    "推理 NMS": "Inference NMS",
    "默认 scales n/s/m/l/x depth": "Default scales n/s/m/l/x depth",
    "默认 scales n/s/m/l/x width": "Default scales n/s/m/l/x width",
    "默认 max_channels": "Default max_channels",
    "n 参数量": "n params",
    "n GFLOPs": "n GFLOPs",
    "无": "None",
    "有 (Layer 10, 14)": "Yes (Layer 10, 14)",
    "有 (4×16 分布)": "Yes (4×16 distribution)",
    "退化 (直接回归 4 值)": "Degenerated (direct 4-value regression)",
    "需要": "Required",
    "不需要 (one2one)": "Not required (one2one)",
    "1024 (全部)": "1024 (all)",
    "无 (v5u 已移除)": "None (removed in v5u)",
  };

  // 通用 EXPANDED_SPECS 基类（v5/v8/v11/v26 共用）
  const EXPANDED_SPECS_BASE = {
    Conv: { width: 340, height: 440, gap: 44 },
    SPPF: { width: 360, height: 660, gap: 44 },
    Upsample: { width: 320, height: 240, gap: 36 },
    Concat: { width: 340, height: 270, gap: 36 },
  };

  // 通用 UNIT_INFO（四版本共享的底层算子说明）
  const UNIT_INFO_BASE = {
    Conv2d: {
      what: "二维卷积。在输入特征图上滑动 k×k 的卷积核，做加权求和得到输出。",
      why: "提取局部空间特征并完成通道变换。stride=2 时同时完成下采样，是网络的主干算子。",
      params: "k (kernel), s (stride), p (padding), c_in → c_out",
    },
    BatchNorm2d: {
      what: "批归一化。对每个通道在 batch 维度上做 (x-μ)/√(σ²+ε)·γ+β。",
      why: "稳定训练分布、加速收敛、减少对初始化的敏感度，推理时融合到 Conv 权重里几乎零开销。",
      params: "num_features=c_out, eps=1e-5, momentum=0.1",
    },
    SiLU: {
      what: "SiLU 激活函数：x · sigmoid(x)。",
      why: "比 ReLU 更平滑、有下界负值，梯度更稳定，YOLO 系列默认激活函数。",
      params: "无参数（纯函数）",
    },
    Bottleneck: {
      what: "残差瓶颈块：两层 3×3 卷积 + 可选残差 shortcut。",
      why: "在保留通道数的前提下做更深的特征变换，shortcut 缓解梯度消失。",
      params: "k=3, c_in=c_out=hidden, shortcut=True/False",
    },
    C3k: {
      what: "CSP-style 子块。结构：cv1 Conv → chunk(2) → 2× Bottleneck(k=3, shortcut=True) → Concat → cv2 Conv。",
      why: "比单层 Bottleneck 表达力更强。C3k2 在 m/l/x 规模上启用 c3k=True 以提升精度，n/s 规模用 Bottleneck 节省参数。",
      params: "c_in=c_out=hidden, n=2, shortcut=True",
    },
    PSABlock: {
      what: "Attention + FFN 子块，类似 Transformer Encoder。",
      why: "在 P5 高层语义上建模全局依赖，提升大目标识别能力，是 YOLO11/26 引入的关键模块。",
      params: "num_heads=max(c//64, 1)",
    },
    MaxPool2d: {
      what: "最大值池化。在 k×k 邻域取最大值作为输出。",
      why: "扩大感受野并保留最强响应。SPPF 中串联 3 次以获得多尺度上下文而不改变尺寸。",
      params: "k=5, s=1, p=2",
    },
    Concat: {
      what: "按指定维度拼接多个张量。YOLO 中常用 dim=1（通道维）拼接。",
      why: "融合不同来源或不同感受野的特征，拼接后通道数相加，再由后续 1×1 Conv 融合。",
      params: "dim=1 (channel)",
    },
    Split: {
      what: "沿通道维度把张量分成多份（PyTorch 的 chunk 或 split）。",
      why: "C3/C2f/C3k2/C2PSA 的 CSP 设计：一部分走旁路保留原始特征，一部分进入内部块做变换。",
      params: "dim=1, chunks=2",
    },
    "Nearest Upsample": {
      what: "最近邻上采样。每个像素被复制成 scale×scale 的块。",
      why: "FPN 自顶向下放大特征图，速度最快、无参数，比双线性更符合检测任务习惯。",
      params: "scale_factor=2, mode='nearest'",
    },
    "torch.cat": {
      what: "PyTorch 的张量拼接 API，等价于 Concat 模块。",
      why: "在 Concat 模块中实际调用，按通道维拼接多个来源的特征。",
      params: "tensors=[...], dim=1",
    },
    Inputs: {
      what: "标记 Concat 的多个输入来源（上一层 + 跳跃连接的层）。",
      why: "可视化 CSP/FPN/PAN 中的多源融合，每个输入的通道数会被加总。",
      params: "layer.from = [-1, N]",
    },
    "Box branch": {
      what: "检测头的边框回归分支。3 层 Conv 后输出 4×reg_max 个分布值。",
      why: "用 DFL 离散分布预测每条边相对锚点的偏移，比直接回归 4 个连续值更精确。YOLO26 的 reg_max=1 退化为直接回归 4 个连续偏移。",
      params: "Conv(k=3,s=1) → Conv(k=3,s=1) → Conv(k=1) → 4×reg_max",
    },
    "Cls branch": {
      what: "检测头的分类分支。YOLOv5/v8 用纯 Conv 提取类别证据；YOLO11/26 用 DWConv+Conv 降低参数量。",
      why: "输出每个位置的类别分布，最后生成 nc=80 个类别分数。",
      params: "DWConv k=3 + Conv k=1 ×2 → Conv k=1 输出 nc=80 (v11/v26) 或 纯 Conv ×2 → nc (v5/v8)",
    },
    "cv1 Conv": {
      what: "模块入口的 1×1 卷积。把输入通道变换到 hidden×2（hidden 由 e 决定）。",
      why: "压缩通道并为后续 Split 做准备，是 CSP 结构的标准入口。",
      params: "k=1, s=1, p=0, c_in → hidden×2",
    },
    "cv2 Conv": {
      what: "模块出口的 1×1 卷积。把 Concat 后的通道融合回 c_out。",
      why: "整合多路特征并把通道数对齐到 YAML 期望的输出通道。",
      params: "k=1, s=1, p=0, hidden×(2+N) → c_out",
    },
  };

  // 通用子模块内部结构（四版本共享）
  const UNIT_INNER_BASE = {
    Bottleneck: [
      { title: "Conv 1×1", kind: "conv", lines: ["c_in → c_in", "k=1, s=1, p=0"], infoKey: "Conv2d" },
      { title: "Conv 3×3", kind: "conv", lines: ["c_in → c_in", "k=3, s=1, p=1"], infoKey: "Conv2d" },
      { title: "Shortcut (add)", kind: "inner", lines: ["input + output", "残差连接"], infoKey: "Bottleneck" },
    ],
    PSABlock: [
      { title: "Attention", kind: "inner", lines: ["Q/K/V via 1×1 Conv", "Softmax(MatMul)"], infoKey: "PSABlock" },
      { title: "FFN", kind: "conv", lines: ["1×1 Conv → SiLU → 1×1", "c → 2c → c"], infoKey: "PSABlock" },
      { title: "残差相加", kind: "inner", lines: ["input + Attention+FFN"], infoKey: "PSABlock" },
    ],
  };

  const PARAM_GLOSSARY = [
    ["k", "kernel size，卷积核大小。k=3 表示每次看 3×3 邻域，k=1 常用于通道变换。"],
    ["s", "stride，卷积步长。s=2 会把特征图宽高减半，s=1 保持当前分辨率。"],
    ["p", "padding，边缘补零。常见 p=k//2，用来让 s=1 的卷积保持宽高不变。"],
    ["输入通道", "进入当前模块的特征通道数。第一层是 RGB 的 3 通道，后续通常来自上一层输出或 Concat 的通道求和。"],
    ["输出通道", "当前模块生成的特征通道数。对 Conv 来说，它也等于 filter 组数，每个输出通道对应一组 c_in×k×k 权重。"],
    ["repeat", "YAML 中的重复次数会乘 depth，再四舍五入且至少为 1。C3/C2f/C3k2/C2PSA 的 repeat 是模块内部子块数。"],
    ["width/depth/max_channels", "Ultralytics 的复合缩放规则：通道先受 max_channels 截断，再乘 width 并对齐到 8；repeat 受 depth 影响。"],
    ["P3/P4/P5", "三个检测尺度，对应 stride 8/16/32。输入 640 时空间尺寸分别为 80×80、40×40、20×20。"],
    ["DFL/reg_max", "DFL 将每个边框边的离散分布转成连续偏移。reg_max=16 时 box logits 为 4×16=64 通道；YOLO26 的 reg_max=1 退化为直接回归 4 个连续值。"],
    ["nc", "类别数。这里按 COCO 默认 nc=80 展示，所以分类分支最后输出 80 通道。"],
    ["end2end", "YOLO26 默认 end2end=True：训练时同时学 one2many（一对多，传统 NMS 流程）+ one2one（一对一，推理无需 NMS）。推理 fuse() 后只保留 one2one 头。"],
  ];

  // ============ 各版本数据 ============

  // ---- YOLOv5 v6.0 ----
  const V5 = {
    key: "v5",
    name: "YOLOv5",
    fullName: "YOLOv5 v6.0",
    year: 2020,
    regMax: 16,
    end2end: false,
    legacy: true,
    nc: 80,
    inputSize: INPUT_SIZE,
    detectX: 1320,
    yamlUrl: "https://github.com/ultralytics/ultralytics/blob/main/ultralytics/cfg/models/v5/yolov5.yaml",
    scales: {
      n: { depth: 0.33, width: 0.25, maxChannels: 1024, params: "2,600,000", gflops: "7.7", layers: 162 },
      s: { depth: 0.33, width: 0.50, maxChannels: 1024, params: "9,100,000", gflops: "24.0", layers: 224 },
      m: { depth: 0.67, width: 0.75, maxChannels: 1024, params: "25,100,000", gflops: "64.2", layers: 295 },
      l: { depth: 1.00, width: 1.00, maxChannels: 1024, params: "53,200,000", gflops: "135.0", layers: 367 },
      x: { depth: 1.33, width: 1.25, maxChannels: 1024, params: "97,200,000", gflops: "246.4", layers: 404 },
    },
    layerDefs: [
      // Backbone (10 层)
      { id: 0, section: "Backbone", from: -1, repeat: 1, module: "Conv", args: [64, 6, 2, 2], stage: "P1/2", note: "Stem：k=6,s=2,p=2 大核下采样到 stride 2" },
      { id: 1, section: "Backbone", from: -1, repeat: 1, module: "Conv", args: [128, 3, 2], stage: "P2/4", note: "下采样到 P2 尺度" },
      { id: 2, section: "Backbone", from: -1, repeat: 3, module: "C3", args: [128], stage: "P2/4", note: "P2 CSP 特征融合" },
      { id: 3, section: "Backbone", from: -1, repeat: 1, module: "Conv", args: [256, 3, 2], stage: "P3/8", note: "生成 P3 尺度特征" },
      { id: 4, section: "Backbone", from: -1, repeat: 6, module: "C3", args: [256], stage: "P3/8", note: "P3 浅层语义融合" },
      { id: 5, section: "Backbone", from: -1, repeat: 1, module: "Conv", args: [512, 3, 2], stage: "P4/16", note: "生成 P4 尺度特征" },
      { id: 6, section: "Backbone", from: -1, repeat: 9, module: "C3", args: [512], stage: "P4/16", note: "P4 中尺度语义融合" },
      { id: 7, section: "Backbone", from: -1, repeat: 1, module: "Conv", args: [1024, 3, 2], stage: "P5/32", note: "生成 P5 尺度特征" },
      { id: 8, section: "Backbone", from: -1, repeat: 3, module: "C3", args: [1024], stage: "P5/32", note: "P5 深层大感受野融合" },
      { id: 9, section: "Backbone", from: -1, repeat: 1, module: "SPPF", args: [1024, 5], stage: "P5/32", note: "快速空间金字塔池化（无 shortcut）" },
      // Head (14 层)
      { id: 10, section: "Head", from: -1, repeat: 1, module: "Conv", args: [512, 1, 1], stage: "P5/32", note: "FPN 入口 1×1 Conv 降通道到 512" },
      { id: 11, section: "Head", from: -1, repeat: 1, module: "Upsample", args: [null, 2, "nearest"], stage: "P4/16", note: "自顶向下放大到 P4 尺度" },
      { id: 12, section: "Head", from: [-1, 6], repeat: 1, module: "Concat", args: [1], stage: "P4/16", note: "拼接 Backbone P4 特征" },
      { id: 13, section: "Head", from: -1, repeat: 3, module: "C3", args: [512, false], stage: "P4/16", note: "FPN 的 P4 特征融合（shortcut=False）" },
      { id: 14, section: "Head", from: -1, repeat: 1, module: "Conv", args: [256, 1, 1], stage: "P4/16", note: "FPN 中间 1×1 Conv 降通道到 256" },
      { id: 15, section: "Head", from: -1, repeat: 1, module: "Upsample", args: [null, 2, "nearest"], stage: "P3/8", note: "自顶向下放大到 P3 尺度" },
      { id: 16, section: "Head", from: [-1, 4], repeat: 1, module: "Concat", args: [1], stage: "P3/8", note: "拼接 Backbone P3 特征" },
      { id: 17, section: "Head", from: -1, repeat: 3, module: "C3", args: [256, false], stage: "P3/8", note: "P3 小目标检测输入（shortcut=False）" },
      { id: 18, section: "Head", from: -1, repeat: 1, module: "Conv", args: [256, 3, 2], stage: "P4/16", note: "PAN 自底向上回到 P4" },
      { id: 19, section: "Head", from: [-1, 14], repeat: 1, module: "Concat", args: [1], stage: "P4/16", note: "拼接 FPN P4 (Layer 14) 特征" },
      { id: 20, section: "Head", from: -1, repeat: 3, module: "C3", args: [512, false], stage: "P4/16", note: "P4 中目标检测输入" },
      { id: 21, section: "Head", from: -1, repeat: 1, module: "Conv", args: [512, 3, 2], stage: "P5/32", note: "PAN 自底向上回到 P5" },
      { id: 22, section: "Head", from: [-1, 10], repeat: 1, module: "Concat", args: [1], stage: "P5/32", note: "拼接 FPN P5 (Layer 10) 特征" },
      { id: 23, section: "Head", from: -1, repeat: 3, module: "C3", args: [1024, false], stage: "P5/32", note: "P5 大目标检测输入" },
      // Detect
      { id: 24, section: "Detect", from: [17, 20, 23], repeat: 1, module: "Detect", args: ["nc"], stage: "P3/P4/P5", note: "三尺度检测输出（legacy=True, reg_max=16）" },
    ],
    moduleDetails: {
      Conv: "Conv 是 YOLO 中最基础的算子组合：Conv2d 负责局部特征提取和通道变换，BatchNorm2d 稳定训练，SiLU 提供非线性。stride=2 时会把特征图宽高减半。YOLOv5 的首层使用 k=6 大核以替代 Focus 切片操作。",
      C3: "C3（CSP Bottleneck with 3 convolutions）：cv1 1×1 Conv 切分通道，一路走 n 个 Bottleneck，另一路 cv2 1×1 Conv 保留，最后 Concat + cv3 1×1 Conv 融合。是 YOLOv5 的核心 CSP 模块。",
      SPPF: "SPPF 在 P5 上连续执行三次 MaxPool2d(k=5)，把不同感受野的上下文拼接在一起，再用 1×1 Conv 融合。YOLOv5 版本无 shortcut 连接。",
      Upsample: "Upsample 使用 nearest x2，只改变特征图宽高，不改变通道数，用于 FPN 自顶向下对齐浅层特征。",
      Concat: "Concat 按通道维 dim=1 拼接同分辨率特征。拼接后通道数相加，后续 C3 再负责融合。",
      Detect: "Detect 接收 P3/P4/P5 三个尺度。YOLOv5 使用 legacy 检测头：cv2/cv3 都是纯 Conv（无 DWConv），box 分支输出 4×reg_max=64 的分布，再经 DFL 解码为边框偏移。",
    },
    expandedSpecs: {
      ...EXPANDED_SPECS_BASE,
      C3: { width: 360, height: 600, gap: 44 },
    },
    unitInfo: {
      C3: {
        what: "C3 = CSP Bottleneck with 3 convolutions。结构：cv1 1×1 Conv → n× Bottleneck → Concat(cv2 旁路, 主路输出) → cv3 1×1 Conv。",
        why: "YOLOv5 的核心 CSP 模块，比 YOLOv4 的 C3 路径更紧凑。head 中的 C3 使用 shortcut=False（无内部残差），backbone 中的 C3 默认 shortcut=True。",
        params: "c_in, c_out, n=repeats, shortcut=True/False, e=0.5",
      },
    },
    unitInnerStructure: {
      C3: [
        { title: "cv1 Conv 1×1", kind: "conv", lines: ["c_in → c_", "k=1, s=1, p=0"], infoKey: "cv1 Conv" },
        { title: "cv2 Conv 1×1", kind: "conv", lines: ["c_in → c_ (旁路)", "k=1, s=1, p=0"], infoKey: "cv2 Conv" },
        { title: "n× Bottleneck", kind: "inner", lines: ["对 cv1 输出做残差变换", "k=(1,3), shortcut=True"], infoKey: "Bottleneck" },
        { title: "Concat", kind: "concat", lines: ["cv2 旁路 + n 个输出", "→ c_×(n+1)"], infoKey: "Concat" },
        { title: "cv3 Conv 1×1", kind: "conv", lines: ["c_×(n+1) → c_out", "k=1, s=1, p=0"], infoKey: "cv2 Conv" },
      ],
    },
    nodePos: {
      0: [78, 150], 1: [78, 275], 2: [78, 400], 3: [78, 525], 4: [78, 650],
      5: [78, 775], 6: [78, 900], 7: [78, 1025], 8: [78, 1150], 9: [78, 1275],
      // FPN 8 层 (id 10-17)：从下往上
      10: [500, 1265], 11: [500, 1140], 12: [500, 1015], 13: [500, 890],
      14: [500, 765], 15: [500, 640], 16: [500, 515], 17: [500, 390],
      // PAN 6 层 (id 18-23)：从上往下
      18: [900, 515], 19: [900, 665], 20: [900, 815], 21: [900, 965], 22: [900, 1115], 23: [900, 1265],
      // Detect
      24: [1320, 890],
    },
  };

  // ---- YOLOv8.0 ----
  const V8 = {
    key: "v8",
    name: "YOLOv8",
    fullName: "YOLOv8.0",
    year: 2023,
    regMax: 16,
    end2end: false,
    legacy: true,
    nc: 80,
    inputSize: INPUT_SIZE,
    detectX: 1320,
    yamlUrl: "https://github.com/ultralytics/ultralytics/blob/main/ultralytics/cfg/models/v8/yolov8.yaml",
    scales: {
      n: { depth: 0.33, width: 0.25, maxChannels: 1024, params: "3,157,200", gflops: "8.9", layers: 129 },
      s: { depth: 0.33, width: 0.50, maxChannels: 1024, params: "11,166,560", gflops: "28.8", layers: 129 },
      m: { depth: 0.67, width: 0.75, maxChannels: 768, params: "25,902,640", gflops: "79.3", layers: 169 },
      l: { depth: 1.00, width: 1.00, maxChannels: 512, params: "43,691,520", gflops: "165.7", layers: 209 },
      x: { depth: 1.00, width: 1.25, maxChannels: 512, params: "68,229,648", gflops: "258.5", layers: 209 },
    },
    layerDefs: [
      // Backbone (10 层)
      { id: 0, section: "Backbone", from: -1, repeat: 1, module: "Conv", args: [64, 3, 2], stage: "P1/2", note: "Stem，下采样到 stride 2" },
      { id: 1, section: "Backbone", from: -1, repeat: 1, module: "Conv", args: [128, 3, 2], stage: "P2/4", note: "继续下采样，进入 P2 尺度" },
      { id: 2, section: "Backbone", from: -1, repeat: 3, module: "C2f", args: [128, true], stage: "P2/4", note: "P2 CSP 特征融合（shortcut=True）" },
      { id: 3, section: "Backbone", from: -1, repeat: 1, module: "Conv", args: [256, 3, 2], stage: "P3/8", note: "生成 P3 尺度特征" },
      { id: 4, section: "Backbone", from: -1, repeat: 6, module: "C2f", args: [256, true], stage: "P3/8", note: "P3 浅层语义融合" },
      { id: 5, section: "Backbone", from: -1, repeat: 1, module: "Conv", args: [512, 3, 2], stage: "P4/16", note: "生成 P4 尺度特征" },
      { id: 6, section: "Backbone", from: -1, repeat: 6, module: "C2f", args: [512, true], stage: "P4/16", note: "P4 中尺度语义融合" },
      { id: 7, section: "Backbone", from: -1, repeat: 1, module: "Conv", args: [1024, 3, 2], stage: "P5/32", note: "生成 P5 尺度特征" },
      { id: 8, section: "Backbone", from: -1, repeat: 3, module: "C2f", args: [1024, true], stage: "P5/32", note: "P5 深层大感受野融合" },
      { id: 9, section: "Backbone", from: -1, repeat: 1, module: "SPPF", args: [1024, 5], stage: "P5/32", note: "快速空间金字塔池化" },
      // Head (12 层)
      { id: 10, section: "Head", from: -1, repeat: 1, module: "Upsample", args: [null, 2, "nearest"], stage: "P4/16", note: "自顶向下放大到 P4 尺度" },
      { id: 11, section: "Head", from: [-1, 6], repeat: 1, module: "Concat", args: [1], stage: "P4/16", note: "拼接 Backbone P4 特征" },
      { id: 12, section: "Head", from: -1, repeat: 3, module: "C2f", args: [512], stage: "P4/16", note: "FPN 的 P4 特征融合（shortcut=False）" },
      { id: 13, section: "Head", from: -1, repeat: 1, module: "Upsample", args: [null, 2, "nearest"], stage: "P3/8", note: "自顶向下放大到 P3 尺度" },
      { id: 14, section: "Head", from: [-1, 4], repeat: 1, module: "Concat", args: [1], stage: "P3/8", note: "拼接 Backbone P3 特征" },
      { id: 15, section: "Head", from: -1, repeat: 3, module: "C2f", args: [256], stage: "P3/8", note: "P3 小目标检测输入" },
      { id: 16, section: "Head", from: -1, repeat: 1, module: "Conv", args: [256, 3, 2], stage: "P4/16", note: "PAN 自底向上回到 P4" },
      { id: 17, section: "Head", from: [-1, 12], repeat: 1, module: "Concat", args: [1], stage: "P4/16", note: "拼接 FPN P4 特征" },
      { id: 18, section: "Head", from: -1, repeat: 3, module: "C2f", args: [512], stage: "P4/16", note: "P4 中目标检测输入" },
      { id: 19, section: "Head", from: -1, repeat: 1, module: "Conv", args: [512, 3, 2], stage: "P5/32", note: "PAN 自底向上回到 P5" },
      { id: 20, section: "Head", from: [-1, 9], repeat: 1, module: "Concat", args: [1], stage: "P5/32", note: "拼接 Backbone 高层特征" },
      { id: 21, section: "Head", from: -1, repeat: 3, module: "C2f", args: [1024], stage: "P5/32", note: "P5 大目标检测输入" },
      // Detect
      { id: 22, section: "Detect", from: [15, 18, 21], repeat: 1, module: "Detect", args: ["nc"], stage: "P3/P4/P5", note: "三尺度检测输出（legacy=True, reg_max=16）" },
    ],
    moduleDetails: {
      Conv: "Conv 是 YOLO 中最基础的算子组合：Conv2d 负责局部特征提取和通道变换，BatchNorm2d 稳定训练，SiLU 提供非线性。stride=2 时会把特征图宽高减半。",
      C2f: "C2f（CSP Bottleneck with 2 convolutions, faster）是 YOLOv8 的核心模块。相比 YOLOv5 的 C3，C2f 用单个 cv1 输出 2×hidden 通道，split 后一路保留、一路串接 n 个 Bottleneck 输出，最后 Concat 2+n 路再 cv2 融合。结构更紧凑、梯度流更短。",
      SPPF: "SPPF 在 P5 上连续执行三次 MaxPool2d(k=5)，把不同感受野的上下文拼接在一起，再用 1×1 Conv 融合。",
      Upsample: "Upsample 使用 nearest x2，只改变特征图宽高，不改变通道数，用于 FPN 自顶向下对齐浅层特征。",
      Concat: "Concat 按通道维 dim=1 拼接同分辨率特征。拼接后通道数相加，后续 C2f 再负责融合。",
      Detect: "Detect 接收 P3/P4/P5 三个尺度。YOLOv8 使用 legacy 检测头：cv2/cv3 都是纯 Conv（无 DWConv），box 分支输出 4×reg_max=64 的分布，再经 DFL 解码为边框偏移。相比 YOLOv5 移除了 objectness 分支，更接近 anchor-free 设计。",
    },
    expandedSpecs: {
      ...EXPANDED_SPECS_BASE,
      C2f: { width: 360, height: 600, gap: 44 },
    },
    unitInfo: {
      C2f: {
        what: "C2f = CSP Bottleneck with 2 convolutions, faster。结构：cv1 1×1 Conv → split(2) → 一路保留 + 一路串接 n 个 Bottleneck → Concat(2+n 路) → cv2 1×1 Conv。",
        why: "相比 YOLOv5 的 C3，C2f 把所有 Bottleneck 输出都接到 Concat，梯度流更短，精度更高且速度更快。",
        params: "c_in, c_out, n=repeats, shortcut=True/False, e=0.5",
      },
    },
    unitInnerStructure: {
      C2f: [
        { title: "cv1 Conv 1×1", kind: "conv", lines: ["c_in → c_×2", "k=1, s=1, p=0"], infoKey: "cv1 Conv" },
        { title: "Split / chunk(2)", kind: "split", lines: ["沿通道分两半", "→ 2 × c_"], infoKey: "Split" },
        { title: "n× Bottleneck", kind: "inner", lines: ["串接 n 个 Bottleneck", "每个 k=(3,3), shortcut 可选"], infoKey: "Bottleneck" },
        { title: "Concat", kind: "concat", lines: ["保留 + n 个输出", "→ c_×(n+2)"], infoKey: "Concat" },
        { title: "cv2 Conv 1×1", kind: "conv", lines: ["c_×(n+2) → c_out", "k=1, s=1, p=0"], infoKey: "cv2 Conv" },
      ],
    },
    nodePos: {
      0: [78, 150], 1: [78, 275], 2: [78, 400], 3: [78, 525], 4: [78, 650],
      5: [78, 775], 6: [78, 900], 7: [78, 1025], 8: [78, 1150], 9: [78, 1275],
      10: [500, 1265], 11: [500, 1130], 12: [500, 995], 13: [500, 860], 14: [500, 725], 15: [500, 590],
      16: [900, 725], 17: [900, 860], 18: [900, 995], 19: [900, 1130], 20: [900, 1265], 21: [900, 1400],
      22: [1320, 995],
    },
  };

  // ---- YOLO11 ----
  const V11 = {
    key: "v11",
    name: "YOLO11",
    fullName: "YOLO11",
    year: 2024,
    regMax: 16,
    end2end: false,
    legacy: false,
    nc: 80,
    inputSize: INPUT_SIZE,
    detectX: 1320,
    yamlUrl: "https://github.com/ultralytics/ultralytics/blob/main/ultralytics/cfg/models/11/yolo11.yaml",
    scales: {
      n: { depth: 0.50, width: 0.25, maxChannels: 1024, params: "2,624,080", gflops: "6.6", layers: 181 },
      s: { depth: 0.50, width: 0.50, maxChannels: 1024, params: "9,458,752", gflops: "21.7", layers: 181 },
      m: { depth: 0.50, width: 1.00, maxChannels: 512, params: "20,114,688", gflops: "68.5", layers: 231 },
      l: { depth: 1.00, width: 1.00, maxChannels: 512, params: "25,372,160", gflops: "87.6", layers: 357 },
      x: { depth: 1.00, width: 1.50, maxChannels: 512, params: "56,966,176", gflops: "196.0", layers: 357 },
    },
    layerDefs: [
      // Backbone (11 层)
      { id: 0, section: "Backbone", from: -1, repeat: 1, module: "Conv", args: [64, 3, 2], stage: "P1/2", note: "Stem，下采样到 stride 2" },
      { id: 1, section: "Backbone", from: -1, repeat: 1, module: "Conv", args: [128, 3, 2], stage: "P2/4", note: "继续下采样，进入 P2 尺度" },
      { id: 2, section: "Backbone", from: -1, repeat: 2, module: "C3k2", args: [256, false, 0.25], stage: "P2/4", note: "早期 CSP 特征融合（c3k=False, e=0.25）" },
      { id: 3, section: "Backbone", from: -1, repeat: 1, module: "Conv", args: [256, 3, 2], stage: "P3/8", note: "生成 P3 尺度特征" },
      { id: 4, section: "Backbone", from: -1, repeat: 2, module: "C3k2", args: [512, false, 0.25], stage: "P3/8", note: "小目标相关的浅层语义融合" },
      { id: 5, section: "Backbone", from: -1, repeat: 1, module: "Conv", args: [512, 3, 2], stage: "P4/16", note: "生成 P4 尺度特征" },
      { id: 6, section: "Backbone", from: -1, repeat: 2, module: "C3k2", args: [512, true], stage: "P4/16", note: "中尺度语义融合（c3k=True）" },
      { id: 7, section: "Backbone", from: -1, repeat: 1, module: "Conv", args: [1024, 3, 2], stage: "P5/32", note: "生成 P5 尺度特征" },
      { id: 8, section: "Backbone", from: -1, repeat: 2, module: "C3k2", args: [1024, true], stage: "P5/32", note: "深层大感受野特征融合" },
      { id: 9, section: "Backbone", from: -1, repeat: 1, module: "SPPF", args: [1024, 5], stage: "P5/32", note: "快速空间金字塔池化" },
      { id: 10, section: "Backbone", from: -1, repeat: 2, module: "C2PSA", args: [1024], stage: "P5/32", note: "P5 语义特征注意力增强" },
      // Head (12 层)
      { id: 11, section: "Head", from: -1, repeat: 1, module: "Upsample", args: [null, 2, "nearest"], stage: "P4/16", note: "自顶向下放大到 P4 尺度" },
      { id: 12, section: "Head", from: [-1, 6], repeat: 1, module: "Concat", args: [1], stage: "P4/16", note: "拼接 Backbone P4 特征" },
      { id: 13, section: "Head", from: -1, repeat: 2, module: "C3k2", args: [512, false], stage: "P4/16", note: "FPN 的 P4 特征融合（c3k=False）" },
      { id: 14, section: "Head", from: -1, repeat: 1, module: "Upsample", args: [null, 2, "nearest"], stage: "P3/8", note: "自顶向下放大到 P3 尺度" },
      { id: 15, section: "Head", from: [-1, 4], repeat: 1, module: "Concat", args: [1], stage: "P3/8", note: "拼接 Backbone P3 特征" },
      { id: 16, section: "Head", from: -1, repeat: 2, module: "C3k2", args: [256, false], stage: "P3/8", note: "P3 小目标检测输入" },
      { id: 17, section: "Head", from: -1, repeat: 1, module: "Conv", args: [256, 3, 2], stage: "P4/16", note: "PAN 自底向上回到 P4" },
      { id: 18, section: "Head", from: [-1, 13], repeat: 1, module: "Concat", args: [1], stage: "P4/16", note: "拼接 FPN P4 特征" },
      { id: 19, section: "Head", from: -1, repeat: 2, module: "C3k2", args: [512, false], stage: "P4/16", note: "P4 中目标检测输入" },
      { id: 20, section: "Head", from: -1, repeat: 1, module: "Conv", args: [512, 3, 2], stage: "P5/32", note: "PAN 自底向上回到 P5" },
      { id: 21, section: "Head", from: [-1, 10], repeat: 1, module: "Concat", args: [1], stage: "P5/32", note: "拼接 Backbone 高层特征" },
      { id: 22, section: "Head", from: -1, repeat: 2, module: "C3k2", args: [1024, true], stage: "P5/32", note: "P5 大目标检测输入" },
      // Detect
      { id: 23, section: "Detect", from: [16, 19, 22], repeat: 1, module: "Detect", args: ["nc"], stage: "P3/P4/P5", note: "三尺度检测输出（legacy=False, reg_max=16）" },
    ],
    moduleDetails: {
      Conv: "Conv 是 YOLO 中最基础的算子组合：Conv2d 负责局部特征提取和通道变换，BatchNorm2d 稳定训练，SiLU 提供非线性。stride=2 时会把特征图宽高减半。",
      C3k2: "C3k2 继承 C2f 的两卷积 CSP 结构。cv1 先扩展并切分通道，一路保留，一路经过 n 个 Bottleneck 或 C3k 子块，最后 concat 后用 cv2 融合。c3k=True 时使用更深的 C3k 子块（C3-style + 2 个 Bottleneck），m/l/x 规模自动启用。",
      SPPF: "SPPF 在 P5 上连续执行三次 MaxPool2d(k=5)，把不同感受野的上下文拼接在一起，再用 1×1 Conv 融合。",
      C2PSA: "C2PSA 把通道一分为二，其中一路经过堆叠的 PSABlock 注意力和前馈层，再与旁路拼接，强化高层语义。是 YOLO11 在 SPPF 后引入的关键模块。",
      Upsample: "Upsample 使用 nearest x2，只改变特征图宽高，不改变通道数，用于 FPN 自顶向下对齐浅层特征。",
      Concat: "Concat 按通道维 dim=1 拼接同分辨率特征。拼接后通道数相加，后续 C3k2 再负责融合。",
      Detect: "Detect 接收 P3/P4/P5 三个尺度。YOLO11 使用 legacy=False 检测头：cv3 用 DWConv+Conv 结构降低参数量，box 分支输出 4×reg_max=64 的分布，再经 DFL 解码为边框偏移。",
    },
    expandedSpecs: {
      ...EXPANDED_SPECS_BASE,
      C3k2: { width: 360, height: 660, gap: 44 },
      C2PSA: { width: 360, height: 640, gap: 44 },
    },
    unitInfo: {},
    unitInnerStructure: {
      C3k: [
        { title: "cv1 Conv 1×1", kind: "conv", lines: ["c_in → c_×2", "k=1, s=1, p=0"], infoKey: "cv1 Conv" },
        { title: "Split / chunk(2)", kind: "split", lines: ["沿通道分两半", "→ 2 × c_"], infoKey: "Split" },
        { title: "2× Bottleneck", kind: "inner", lines: ["对其中一半做残差变换", "k=3, shortcut=True"], infoKey: "Bottleneck" },
        { title: "Concat", kind: "concat", lines: ["另一半 + 2 个输出", "→ c_×3"], infoKey: "Concat" },
        { title: "cv2 Conv 1×1", kind: "conv", lines: ["c_×3 → c_out", "k=1, s=1, p=0"], infoKey: "cv2 Conv" },
      ],
    },
    nodePos: {
      0: [78, 150], 1: [78, 275], 2: [78, 400], 3: [78, 525], 4: [78, 650],
      5: [78, 775], 6: [78, 900], 7: [78, 1025], 8: [78, 1150], 9: [78, 1275], 10: [78, 1400],
      11: [500, 1265], 12: [500, 1130], 13: [500, 995], 14: [500, 860], 15: [500, 725], 16: [500, 590],
      17: [900, 725], 18: [900, 860], 19: [900, 995], 20: [900, 1130], 21: [900, 1265], 22: [900, 1400],
      23: [1320, 995],
    },
  };

  // ---- YOLO26 ----
  // YOLO26 与 YO11 在拓扑上完全一致（11 backbone + 12 head + 1 detect），
  // 关键差异在：
  //   1. SPPF 多了 shortcut=True（args = [1024, 5, 3, True]），增加残差连接
  //   2. Head 中 C3k2 全部使用 c3k=True（YOLO11 是 False），计算更重
  //   3. P5 large C3k2 多了 e=0.5 和 shortcut=True 参数
  //   4. reg_max=1（DFL 退化为直接回归 4 个连续值）
  //   5. end2end=True：训练时同时学 one2many + one2one，推理 fuse() 后只保留 one2one 头（无需 NMS）
  //   6. Detect cv3 使用 DWConv+Conv 结构（legacy=False，与 YO11 相同）
  const V26 = {
    key: "v26",
    name: "YOLO26",
    fullName: "YOLO26",
    year: 2026,
    regMax: 1,
    end2end: true,
    legacy: false,
    nc: 80,
    inputSize: INPUT_SIZE,
    detectX: 1320,
    yamlUrl: "https://github.com/ultralytics/ultralytics/blob/main/ultralytics/cfg/models/26/yolo26.yaml",
    scales: {
      n: { depth: 0.50, width: 0.25, maxChannels: 1024, params: "2,572,280", gflops: "6.1", layers: 260 },
      s: { depth: 0.50, width: 0.50, maxChannels: 1024, params: "10,009,784", gflops: "22.8", layers: 260 },
      m: { depth: 0.50, width: 1.00, maxChannels: 512, params: "21,896,248", gflops: "75.4", layers: 280 },
      l: { depth: 1.00, width: 1.00, maxChannels: 512, params: "26,299,704", gflops: "93.8", layers: 392 },
      x: { depth: 1.00, width: 1.50, maxChannels: 512, params: "58,993,368", gflops: "209.5", layers: 392 },
    },
    layerDefs: [
      // Backbone (11 层) — 与 YOLO11 相同结构
      { id: 0, section: "Backbone", from: -1, repeat: 1, module: "Conv", args: [64, 3, 2], stage: "P1/2", note: "Stem，下采样到 stride 2" },
      { id: 1, section: "Backbone", from: -1, repeat: 1, module: "Conv", args: [128, 3, 2], stage: "P2/4", note: "继续下采样，进入 P2 尺度" },
      { id: 2, section: "Backbone", from: -1, repeat: 2, module: "C3k2", args: [256, false, 0.25], stage: "P2/4", note: "早期 CSP 特征融合（c3k=False, e=0.25）" },
      { id: 3, section: "Backbone", from: -1, repeat: 1, module: "Conv", args: [256, 3, 2], stage: "P3/8", note: "生成 P3 尺度特征" },
      { id: 4, section: "Backbone", from: -1, repeat: 2, module: "C3k2", args: [512, false, 0.25], stage: "P3/8", note: "小目标相关的浅层语义融合" },
      { id: 5, section: "Backbone", from: -1, repeat: 1, module: "Conv", args: [512, 3, 2], stage: "P4/16", note: "生成 P4 尺度特征" },
      { id: 6, section: "Backbone", from: -1, repeat: 2, module: "C3k2", args: [512, true], stage: "P4/16", note: "中尺度语义融合（c3k=True）" },
      { id: 7, section: "Backbone", from: -1, repeat: 1, module: "Conv", args: [1024, 3, 2], stage: "P5/32", note: "生成 P5 尺度特征" },
      { id: 8, section: "Backbone", from: -1, repeat: 2, module: "C3k2", args: [1024, true], stage: "P5/32", note: "深层大感受野特征融合" },
      // SPPF 增加 shortcut=True（YOLO26 特有）
      { id: 9, section: "Backbone", from: -1, repeat: 1, module: "SPPF", args: [1024, 5, 3, true], stage: "P5/32", note: "SPPF + shortcut=True（YOLO26 新增残差连接）" },
      { id: 10, section: "Backbone", from: -1, repeat: 2, module: "C2PSA", args: [1024], stage: "P5/32", note: "P5 语义特征注意力增强" },
      // Head (12 层) — C3k2 全部 c3k=True（YOLO11 是 False）
      { id: 11, section: "Head", from: -1, repeat: 1, module: "Upsample", args: [null, 2, "nearest"], stage: "P4/16", note: "自顶向下放大到 P4 尺度" },
      { id: 12, section: "Head", from: [-1, 6], repeat: 1, module: "Concat", args: [1], stage: "P4/16", note: "拼接 Backbone P4 特征" },
      { id: 13, section: "Head", from: -1, repeat: 2, module: "C3k2", args: [512, true], stage: "P4/16", note: "FPN 的 P4 特征融合（c3k=True，比 v11 更重）" },
      { id: 14, section: "Head", from: -1, repeat: 1, module: "Upsample", args: [null, 2, "nearest"], stage: "P3/8", note: "自顶向下放大到 P3 尺度" },
      { id: 15, section: "Head", from: [-1, 4], repeat: 1, module: "Concat", args: [1], stage: "P3/8", note: "拼接 Backbone P3 特征" },
      { id: 16, section: "Head", from: -1, repeat: 2, module: "C3k2", args: [256, true], stage: "P3/8", note: "P3 小目标检测输入（c3k=True）" },
      { id: 17, section: "Head", from: -1, repeat: 1, module: "Conv", args: [256, 3, 2], stage: "P4/16", note: "PAN 自底向上回到 P4" },
      { id: 18, section: "Head", from: [-1, 13], repeat: 1, module: "Concat", args: [1], stage: "P4/16", note: "拼接 FPN P4 特征" },
      { id: 19, section: "Head", from: -1, repeat: 2, module: "C3k2", args: [512, true], stage: "P4/16", note: "P4 中目标检测输入（c3k=True）" },
      { id: 20, section: "Head", from: -1, repeat: 1, module: "Conv", args: [512, 3, 2], stage: "P5/32", note: "PAN 自底向上回到 P5" },
      { id: 21, section: "Head", from: [-1, 10], repeat: 1, module: "Concat", args: [1], stage: "P5/32", note: "拼接 Backbone 高层特征" },
      // P5 large C3k2 多了 e=0.5 和 shortcut=True
      { id: 22, section: "Head", from: -1, repeat: 1, module: "C3k2", args: [1024, true, 0.5, true], stage: "P5/32", note: "P5 大目标检测输入（c3k=True, e=0.5, shortcut=True）" },
      // Detect — end2end=True, reg_max=1
      { id: 23, section: "Detect", from: [16, 19, 22], repeat: 1, module: "Detect", args: ["nc"], stage: "P3/P4/P5", note: "三尺度检测输出（end2end=True, reg_max=1, legacy=False）" },
    ],
    moduleDetails: {
      Conv: "Conv 是 YOLO 中最基础的算子组合：Conv2d 负责局部特征提取和通道变换，BatchNorm2d 稳定训练，SiLU 提供非线性。stride=2 时会把特征图宽高减半。",
      C3k2: "C3k2 继承 C2f 的两卷积 CSP 结构。YOLO26 在 Head 中全部使用 c3k=True（比 YOLO11 的 c3k=False 更重，精度更高）；P5 large 还额外启用 e=0.5 和 shortcut=True。m/l/x 规模同样会强制 c3k=True。",
      SPPF: "YOLO26 的 SPPF 在原有结构上增加 shortcut=True：当输入输出通道相等时，把输入直接加到 SPPF 输出上，形成残差连接，提升梯度流和特征复用。",
      C2PSA: "C2PSA 把通道一分为二，其中一路经过堆叠的 PSABlock 注意力和前馈层，再与旁路拼接，强化高层语义。结构与 YOLO11 完全一致。",
      Upsample: "Upsample 使用 nearest x2，只改变特征图宽高，不改变通道数，用于 FPN 自顶向下对齐浅层特征。",
      Concat: "Concat 按通道维 dim=1 拼接同分辨率特征。拼接后通道数相加，后续 C3k2 再负责融合。",
      Detect: "Detect 接收 P3/P4/P5 三个尺度。YOLO26 的关键差异：end2end=True 同时训练 one2many（传统 NMS 流程）+ one2one（一对一匹配，推理无需 NMS）；reg_max=1 让 DFL 退化为直接回归 4 个连续边框偏移；推理 fuse() 后只保留 one2one 头。",
    },
    expandedSpecs: {
      ...EXPANDED_SPECS_BASE,
      C3k2: { width: 360, height: 660, gap: 44 },
      C2PSA: { width: 360, height: 640, gap: 44 },
    },
    unitInfo: {
      // 覆盖 Box branch 说明，强调 reg_max=1
      "Box branch": {
        what: "检测头的边框回归分支。3 层 Conv 后输出 4×reg_max 个值。YOLO26 的 reg_max=1，等价于直接回归 4 个连续边框偏移，无需 DFL 解码。",
        why: "传统 reg_max=16 用 DFL 离散分布预测每条边相对锚点的偏移；YOLO26 简化为 reg_max=1，减少参数和计算量，配合 end2end 训练保持精度。",
        params: "Conv(k=3,s=1) → Conv(k=3,s=1) → Conv(k=1) → 4×reg_max=4 (v26) 或 4×16=64 (v5/v8/v11)",
      },
    },
    unitInnerStructure: {
      C3k: [
        { title: "cv1 Conv 1×1", kind: "conv", lines: ["c_in → c_×2", "k=1, s=1, p=0"], infoKey: "cv1 Conv" },
        { title: "Split / chunk(2)", kind: "split", lines: ["沿通道分两半", "→ 2 × c_"], infoKey: "Split" },
        { title: "2× Bottleneck", kind: "inner", lines: ["对其中一半做残差变换", "k=3, shortcut=True"], infoKey: "Bottleneck" },
        { title: "Concat", kind: "concat", lines: ["另一半 + 2 个输出", "→ c_×3"], infoKey: "Concat" },
        { title: "cv2 Conv 1×1", kind: "conv", lines: ["c_×3 → c_out", "k=1, s=1, p=0"], infoKey: "cv2 Conv" },
      ],
    },
    nodePos: {
      // 与 YO11 完全一致（拓扑相同）
      0: [78, 150], 1: [78, 275], 2: [78, 400], 3: [78, 525], 4: [78, 650],
      5: [78, 775], 6: [78, 900], 7: [78, 1025], 8: [78, 1150], 9: [78, 1275], 10: [78, 1400],
      11: [500, 1265], 12: [500, 1130], 13: [500, 995], 14: [500, 860], 15: [500, 725], 16: [500, 590],
      17: [900, 725], 18: [900, 860], 19: [900, 995], 20: [900, 1130], 21: [900, 1265], 22: [900, 1400],
      23: [1320, 995],
    },
  };

  // ============ 版本对比内容 ============
  const VERSION_COMPARISON = {
    timeline: [
      { version: "v5", year: 2020, headline: "YOLOv5 v6.0", focus: "工程化与易用性", highlight: "Focus 切片下采样 → Conv k=6 替代；C3 模块成为 CSP 主力；SPPF 串联池化；耦合检测头（含 objectness）。" },
      { version: "v8", year: 2023, headline: "YOLOv8.0", focus: "Anchor-free 与解耦头", highlight: "C2f 替代 C3（梯度流更短）；移除 objectness 分支；解耦 box/cls 头；Mosaic 关闭在最后 epoch。" },
      { version: "v11", year: 2024, headline: "YOLO11", focus: "高效注意力", highlight: "C3k2 替代 C2f（可选 C3k 子块）；SPPF 后增加 C2PSA 注意力；Detect cv3 用 DWConv+Conv 降参数。" },
      { version: "v26", year: 2026, headline: "YOLO26", focus: "End-to-end 与极简回归", highlight: "SPPF 加 shortcut；Head C3k2 全部 c3k=True；reg_max=1 退化为直接回归；end2end=True 推理无需 NMS。" },
    ],
    matrix: [
      // [维度, v5, v8, v11, v26]
      ["Stem 下采样", "Conv k=6,s=2,p=2", "Conv k=3,s=2", "Conv k=3,s=2", "Conv k=3,s=2"],
      ["Backbone CSP 模块", "C3", "C2f", "C3k2", "C3k2"],
      ["Backbone 子块", "Bottleneck(k=(1,3))", "Bottleneck(k=(3,3))", "Bottleneck / C3k (m/l/x)", "Bottleneck / C3k (m/l/x)"],
      ["SPPF", "[1024, 5]", "[1024, 5]", "[1024, 5]", "[1024, 5, 3, True] (shortcut)"],
      ["SPPF 后注意力", "无", "无", "C2PSA × 2", "C2PSA × 2"],
      ["Head CSP 模块", "C3 (shortcut=False)", "C2f (shortcut=False)", "C3k2 (c3k=False)", "C3k2 (c3k=True)"],
      ["FPN 入口 1×1 Conv", "有 (Layer 10, 14)", "无", "无", "无"],
      ["P5 large 额外参数", "—", "—", "—", "e=0.5, shortcut=True"],
      ["Detect head", "legacy=True (纯 Conv)", "legacy=True (纯 Conv)", "legacy=False (DWConv+Conv)", "legacy=False (DWConv+Conv)"],
      ["objectness 分支", "无 (v5u 已移除)", "无", "无", "无"],
      ["reg_max", "16", "16", "16", "1"],
      ["DFL 解码", "有 (4×16 分布)", "有 (4×16 分布)", "有 (4×16 分布)", "退化 (直接回归 4 值)"],
      ["end2end", "False", "False", "False", "True (one2many + one2one)"],
      ["推理 NMS", "需要", "需要", "需要", "不需要 (one2one)"],
      ["默认 scales n/s/m/l/x depth", "0.33/0.33/0.67/1.0/1.33", "0.33/0.33/0.67/1.0/1.0", "0.5/0.5/0.5/1.0/1.0", "0.5/0.5/0.5/1.0/1.0"],
      ["默认 scales n/s/m/l/x width", "0.25/0.50/0.75/1.0/1.25", "0.25/0.50/0.75/1.0/1.25", "0.25/0.50/1.0/1.0/1.5", "0.25/0.50/1.0/1.0/1.5"],
      ["默认 max_channels", "1024 (全部)", "1024/1024/768/512/512", "1024/1024/512/512/512", "1024/1024/512/512/512"],
      ["n 参数量", "2.6M", "3.2M", "2.6M", "2.6M"],
      ["n GFLOPs", "7.7", "8.9", "6.6", "6.1"],
    ],
  };

  // ============ 导出 ============
  window.YOLO_VERSIONS = { v5: V5, v8: V8, v11: V11, v26: V26 };
  window.YOLO_SHARED = {
    NS,
    INPUT_SIZE,
    NODE,
    EXPANDED_DETECT,
    DETECT_NODE,
    SVG_SIZE,
    COLORS,
    I18N_TEXT,
    DATA_TRANSLATIONS,
    EXPANDED_SPECS_BASE,
    UNIT_INFO_BASE,
    UNIT_INNER_BASE,
    PARAM_GLOSSARY,
    VERSION_COMPARISON,
  };
})();
