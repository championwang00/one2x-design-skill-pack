---
name: one2x-design-system
description: >-
  Applies One2X (📖One2X Design System) Figma tokens, typography (Manrope,
  Nohemi), Material-aligned components, and UI patterns. Use when building or
  reviewing Medeo/One2X interfaces, matching Figma exports, or when the user
  mentions One2X Design System, One2X DS, or the company design file. For
  transitions, motion, easing, or animation implementation/review, also load
  web-animation-design (sibling skill in .cursor/skills/).
---

# One2X Design System Skill

## When to use

- User or task references **One2X**、**One2X Design System**、**📖One2X Design System**，或 Figma 文件 `wHNBqjzSQZM8a4DlyBIDqW`。
- 需要与设计稿一致的 **颜色、圆角、间距、字体、按钮/图标按钮/菜单/列表** 行为。
- 从 Figma MCP 导出代码后，需要收敛到项目技术栈并保持视觉一致。
- **动效 / 过渡 / 入场出场 / hover 微交互 / 动效 Review**：除本 skill 外，**必读** **[web-animation-design](../web-animation-design/SKILL.md)**（Emil Kowalski / animations.dev 体系：缓动、时长、`prefers-reduced-motion`、仅 animating `transform`/`opacity` 等）。**层次**：视觉与 Token 仍服从 **`design.md`** 与 **`tokens.css`**；动效语义与可访问性按 **web-animation-design**。
- **要在 Figma 里改稿 / 用 `use_figma` 写入**时：改用打包入口 **[one2x-figma-workflow](../one2x-figma-workflow/SKILL.md)**（先 `figma-use`，整页再 `figma-generate-design`，并固定 One2X `fileKey`）。

## Required: read the canonical spec

1. **打开并遵循** 工作区根目录下的 [`design.md`](../../../design.md)（相对本文件：`../..` 到 `.cursor`，再 `..` 到工作区根）。
2. 若 `design.md` 路径不同，在用户工作区根目录查找 **`design.md`** 文件并以其为准。

全文规范（Token 表、组件清单、Share/VideoShareDialog 模式、代码映射）均在 `design.md` 中；本 skill 只保留执行要点。

## Figma 到代码：强制工作流

当实现来源是 Figma URL、Figma 节点或 Figma 截图时，必须按以下顺序执行。截图只能校验外观，不能替代结构与变量证据。

1. **锁定来源**：解析 `fileKey` 与 `nodeId`；没有具体节点时先取得当前选择或请用户提供 node-specific URL。记录目标 viewport、主题和需要覆盖的状态。
2. **同时获取结构与视觉证据**：调用 `get_design_context` 和 `get_screenshot`。复杂节点若上下文截断，先用 `get_metadata` 找出主要子节点，再逐个获取 `get_design_context`；不要根据截图猜 Auto Layout、约束或组件层级。
3. **读取规范证据**：对 token 敏感节点调用 `get_variable_defs`；用 `search_design_system` 查对应 One2X 组件、变量和样式。读取目标项目的 `design.md`、`tokens/tokens.css`、已有 UI 组件及其变体。
4. **先做映射，再写代码**：形成简短映射清单，至少覆盖 `Figma component -> project component/variant`、`Figma variable/style -> CSS token/text style`、`asset -> supplied asset source`。找不到映射时先查库和项目；仍不存在才新增 token/variant 或记录明确例外。
5. **按项目约定实现**：把 MCP 输出当设计结构证据，不直接照抄生成的 React/Tailwind。复用现有组件、状态和响应式模式；使用 Figma 返回的资源，不引入替代图标包或占位素材。
6. **渲染并对稿**：在目标 viewport 运行页面并与同一节点截图对比。优先修正结构、尺寸、间距、字体、颜色、圆角、描边、资产和交互状态；每轮从最大视觉差异开始。
7. **通过门槛后完成**：运行项目测试/构建，并完成下方验收。未进行实际渲染对比时，不得声称 1:1、pixel-perfect 或已完全匹配。

### 映射与冲突优先级

按以下顺序裁决，避免“设计稿优先”和“设计系统优先”互相打架：

1. **语义与组件身份**：One2X 已发布组件、变量、文字样式及 `design.md`。
2. **该节点的明确设计意图**：Figma 实例属性、变体、约束和视觉参考。
3. **项目实现约定**：现有组件 API、路由、状态、响应式和可访问性模式。
4. **局部补偿**：只在前三者不能表达设计时使用，并记录原因。

若 Figma 数值与已命名 One2X token 不一致，先判断是实例变体、过期设计还是缺失 token。不要静默取最近值，也不要直接硬编码。必要时采用设计稿值完成视觉修复，同时明确指出应同步更新的 `design.md` / `tokens.css` / Figma 库。

### 完成验收

- [ ] 已获取目标节点的 `get_design_context` 与 `get_screenshot`；截断内容已拆分读取。
- [ ] token 敏感实现已检查 `get_variable_defs`，并完成 Figma 到项目的组件/token 映射。
- [ ] 已复用项目组件和 One2X 语义 token；新增 primitive、variant 或 token 有明确理由。
- [ ] 没有用裸 hex、任意字号/行高/间距/圆角替代已有 token；例外均有注释或交付说明。
- [ ] 默认、hover、active、focus、disabled、loading 等设计中存在的状态已实现。
- [ ] 响应式行为来自 Figma constraints/Auto Layout 与项目断点，不是只匹配单张静态截图。
- [ ] 已在目标 viewport 实际渲染并对比参考图；布局、排版、颜色、资产和圆角描边无明显偏差。
- [ ] 构建、类型检查和相关测试通过；无法执行的检查已明确说明。

## Agent workflow

1. **优先对齐 Token**：`Surface/*`；**`Shape`** 集合内 **`Radius/*`** / **`--shape-radius-*`**（名=px）、**`Space/s*`** / **`--space-s*`**（**s**=阶梯档，≠px）；字样式 **`--type-*`** 与 **`--font-family-*`**；以及 `State Layers/*`、`Schemes/*`（见 `design.md`、`tokens/tokens.css`）。
2. **网页 / 静态页（强制）——「颜色与文字都用变量」**  
   - 若仓库有 **`tokens/tokens.css`**，**颜色**一律 **`var(--color-…)`**；**字号/行高/字间距**一律 **`var(--type-…)`**（及 **`--font-family-*`**）；**间距** **`--space-s*`**、**圆角** **`--shape-radius-*`**（或项目中等效 token 名）。  
   - **禁止**：裸 hex、任意 `font-size: 14px` / `margin: 12px` 等与 token 无关的魔法数，除非 **`design.md` 写明特例**。  
   - 与 **`design.md` § Design scale「团队约定」**、**`one2x-figma-workflow`** 中「设计稿全变量」**对表**：设计侧用 Figma 变量 + Text style，代码侧用 **`tokens.css`**。
3. **描边（默认）**：低强调容器、卡片、输入框、列表分隔和图标容器的描边，优先用 **`Surface/On Surface Variant`**（代码侧 `--color-surface-on-surface-variant`）+ **`0.5px`**。只有需要更弱层级、禁用态、分隔线层级或设计稿明确指定时，才改用 `Outline` / `Outline Variant` / 1px。
4. **Figma 组件写入（强制）——「不是只看数值，要看变量绑定」**
   - 写入或更新 One2X 组件时，Auto Layout 的 **`padding*` / `itemSpacing`** 必须绑定 Figma **`Shape/Space/s*`** 变量；四角半径必须绑定 **`Shape/Radius/*`** 变量。  
   - 只把数值设成 8、12、16、999 等，不算完成；右侧面板要能看到变量绑定。胶囊圆角用 **`Radius/Full`**，不要保留裸 `999px`。  
   - 具体 `use_figma` 绑定方式和验收脚本见 **[`one2x-figma-workflow`](../one2x-figma-workflow/SKILL.md)** 的 **Shape 绑定检查**。
5. **组件语义（代码侧也要「组件化」）**：优先使用 **与设计系统对齐的 UI 原语**（项目里已有的 Button、Field、封装好的区块），**不要**为每个页面手写一整块无复用的「假组件」。按钮层级（Filled vs Outlined vs IconButton）、菜单 **0 Density**、列表项变体以 Figma 为准；**全页最核心的主行动按钮**：**Filled**，背景 **`Schemes/Primary`**（`--color-schemes-primary`），文字/图标 **`Schemes/On Primary`**（`--color-schemes-on-primary`）— 见 `design.md` **§3.1**。
6. **实现**：映射到 **`tokens/tokens.css`** 已有变量；禁止无约定地硬编码与设计冲突的值。
7. **冲突处理**：按上方“映射与冲突优先级”裁决；不得用一句“Figma 为源”跳过 One2X 组件与 token 语义。
8. **Figma MCP（设计稿实现时强制）**：使用 `get_design_context`、`get_screenshot`、`get_variable_defs`、`search_design_system`（One2X `fileKey`: `wHNBqjzSQZM8a4DlyBIDqW`）。只有不以 Figma 为输入的纯代码任务才可跳过。
9. **动效**（有则执行）：阅读 **[web-animation-design](../web-animation-design/SKILL.md)**；需要细节时见同目录 **[PRACTICAL-TIPS.md](../web-animation-design/PRACTICAL-TIPS.md)**。Review 动效问题时按该 skill 要求使用 **Before / After 表格**输出。动效不替代 Token：例如 `transition` 的 `color` / `background-color` 仍用 **`var(--color-…)`**。

## 描边 / Stroke

描边默认是轻边界，不是装饰线。除非组件规范或设计稿另有说明：

- 颜色优先用 **`Surface/On Surface Variant`**；代码侧用 `var(--color-surface-on-surface-variant)`。
- 宽度优先用 **`0.5px`**；Figma 写入时设置 `strokeWeight = 0.5`，并把 `strokes` 的 paint 绑定到对应 Color 变量。
- 对容器类节点优先用 `strokeAlign: inside`，避免描边改变外部几何尺寸。
- 如果 0.5px 在目标渲染环境过淡或不可见，可以升到 1px，但要有明确原因；不要把 1px 当默认值。

```css
.surface-card {
  border: 0.5px solid var(--color-surface-on-surface-variant);
}
```

## 视觉补偿 / Optical Alignment

几何对齐不总是视觉对齐。遇到标题、label、hint、辅助说明与圆角矩形（Card、Input、Select、Media frame、Toolbar、Dialog surface）相邻时，不要只把文字左边缘和容器外边缘做 `x` 值相等；要根据圆角做少量内缩，让文字看起来和圆角形体的视觉重心对齐。

### 圆角矩形外部文字

当文字位于圆角容器上方或下方，并且表达上属于该容器时：

- **默认规则**：文字向内缩进约 `radius * 0.5`，再吸附到 `--space-s*` token；常见上限为 `12px`，避免标题看起来脱离卡片。
- **小圆角**：`Radius/0`、`Radius/4`、`Radius/6` 通常不需要补偿，或最多 `--space-s1`。
- **中等圆角**：`Radius/8`、`Radius/12` 通常用 `--space-s1`（4px）；如果是输入框 label、hint，且圆角明显，可以用 `--space-s2`（8px）。
- **大圆角**：`Radius/16` 通常用 `--space-s2`（8px）；`Radius/20`、`Radius/24` 通常用 `--space-s2` 到 `--space-s3`（8-12px）。
- **胶囊 / Full radius**：不要按 `1000px` 计算。按实际高度估算，取 `min(height * 0.1, 12px)`，再吸附到最近的 `--space-s*`。

示例：

```css
.field-label {
  margin-inline-start: var(--space-s2); /* 16px radius input -> 8px optical inset */
}
```

```tsx
<section>
  <h2 className="ml-[var(--space-s2)]">Upcoming sessions</h2>
  <div className="rounded-[var(--shape-radius-16)]">...</div>
</section>
```

### 何时不要补偿

- 文字属于页面网格，而不是某个圆角容器，例如页面主标题、列表大分组标题。
- 卡片本身已经有同一列的内部文字锚点，应优先对齐内部内容，而不是外轮廓。
- 多个相邻容器圆角不同，且标题控制一整个区域时，标题应对齐区域内容网格。
- 设计稿已明确使用几何对齐，或 Figma 主组件已有固定变量绑定。

### 圆角同心关系

任何元素只要使用圆角，就要检查它与内层、外层相邻圆角元素的同心关系。圆角元素嵌套时，内层不要直接复用外层圆角；为了让角落间距看起来均匀，使用同心圆角：

```css
.card {
  --card-radius: var(--shape-radius-24);
  --card-padding: var(--space-s2);
  border-radius: var(--card-radius);
  padding: var(--card-padding);
}

.card-media {
  border-radius: max(0px, calc(var(--card-radius) - var(--card-padding)));
}
```

规则：`inner radius = outer radius - gap/padding`。如果 padding 大于 radius，内层圆角归零。Figma 里同理：外层 `Radius/24` + 内距 `Space/s2` 时，内层优先用接近 16px 的 radius，而不是继续用 24px。

执行要求：

- 内层图片、媒体框、按钮组、输入框、浮层内容区等，只要贴近外层圆角容器，都按同心圆角计算。
- 外层包裹层若只是为了裁切内容，可以只在外层设置圆角并使用 `overflow: hidden` / `clip`，避免重复设置不一致的内层圆角。
- 多层嵌套时逐层计算，不要把最外层 radius 直接传给所有子元素。
- Figma 写入时同样要检查：外层 radius、padding、内层 radius 三者要能解释为同心关系。

## Typography 使用语义（实现侧速查）

对齐 One2X 当前字阶时，按语义选层级，不按“看起来接近”手动改字号：

- `display/*`：营销/品牌级大标题（Hero、活动 KV）；不要用于常规业务弹窗与表单。
- `headline/*`：页面或章节级标题（信息结构层）；不要用于按钮文本。
- `title/*`：组件和区块标题（Dialog、Card、List Section）；是日常业务界面主力标题层。
- `body/*`：阅读内容（正文、说明、元信息）；不要承担主操作强调。
- `label/*`：交互标签（Button、Tab、Chip、Field label）；不要用于正文段落。
- `*-prominent`：同语义加权（主 CTA/关键操作）；避免整屏普遍使用导致层级失真。

### Medeo 组件/页面快速映射

- 营销 Hero：`display/large` 或 `display/medium`。
- 页面主标题：`headline/medium`（强章节可用 `headline/large`）。
- Dialog/Drawer 标题：`title/medium`；小区块标题：`title/small`。
- 正文与说明：`body/medium`；辅助注释/时间戳：`body/small` 或 `body/extra small`。
- 交互文案默认：`label/large`；主 CTA：`label/large - prominent`；紧凑工具条：`label/medium`。

## Out of scope

- 不替代产品 PRD 或无障碍专项审计；a11y 在遵循设计系统基础上按平台规范补强。
- 不自动同步 Figma；大版本变更需人工或流水线更新 `design.md`。
