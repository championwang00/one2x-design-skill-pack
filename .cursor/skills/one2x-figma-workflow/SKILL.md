---
name: one2x-figma-workflow
description: >-
  Orchestrates One2X Design System (Figma fileKey wHNBqjzSQZM8a4DlyBIDqW) with
  Figma MCP: requires loading figma-use before use_figma, uses
  figma-generate-design for full-page screen assembly from the published DS, and
  applies workspace design.md and tokens/. Use when writing to Figma for
  Medeo/One2X, syncing UI to Figma, creating variables or components in the
  One2X file, or when the user wants official Plugin API rules plus One2X
  token and component constraints together.
---

# One2X × Figma 工作流（打包入口）

在官方 **[figma-use](../figma-use/SKILL.md)**（Plugin API 规则）与 **[figma-generate-design](../figma-generate-design/SKILL.md)**（整页从设计系统拼装）之上，**强制叠加 One2X 设计系统**，避免「会操作 Figma 但不符合 Medeo 色板与组件命名」。

## 复盘：为什么当时要「这样用」变量、文字样式和组件

| 现象 | 原因 | 正确做法 |
|------|------|----------|
| 消费稿里一开始只有「手画矩形 + 纯文本」 | 快速搭结构时最容易这样画，**还没接到设计系统** | 用 **`search_design_system` + `importComponent…`** 换成 **库组件**；颜色用 **`importVariableByKeyAsync`** 绑 **Color**，不要在本文件复制一整套变量。 |
| 颜色绑了变量，字阶看起来「没绑变量」 | Figma 里 **Typescale 多通过「文字样式」落在样式定义上**，单个 Text 上 `fontSize` 等 **不宜**当成与填色同级的 `setBoundVariable` 用法（见 **`figma-use`** api-reference） | 消费稿对独立文案图层：**`importStyleByKeyAsync` + `setTextStyleIdAsync`**，使用 **`title/medium`、`label/large`** 等主库样式，即与 Typescale 一致。 |
| **文字样式已挂，但「填充」上仍不显示 Color 变量**（对稿 / 检查时像「裸色」） | 字色往往写在 **文字样式** 或 **样式内嵌色** 上，图层 `fills` 未再绑 **库 Variable**；组件内文字同理由主库组件定义。 | 在 **消费稿** 中，对**非组件实例内**的 `TEXT`：在 **`setTextStyleIdAsync` 之后**，对 **`fills` 里的 `SOLID`** 使用 **`boundVariables: { color: figma.variables.createVariableAlias(await importVariableByKeyAsync(...)) }`**（与形状填色同一套 API），语义色按 **`Surface/On Surface`、`Surface/On Surface Variant`、`Schemes/Primary`** 选用。**不要**在消费稿里改 `Button`/`Field` 等内部文字（实例内 `TEXT` 跳过）。 |
| Untitled 里曾出现本地 `One2X · Color` | 脚本为演示绑定而 **临时复制**语义色，**会与主库双源漂移** | 已改为 **只引用库变量**；原则见下节「团队约定」。 |
| 为什么要 **组件化** | 交互状态、密度、无障碍与 **M3 语义** 都封装在 **Button / Field / …** 里，手绘矩形 **不可维护** | 界面结构 **一律库组件实例** 拼装；新物种先在主库演进或走变体，不在业务稿里发明新按钮。 |

## 团队约定：设计稿里「全变量 + 全组件」

与 **[`design.md`](../../../design.md) § Design scale 下「团队约定」** 一致，Agent 在 Figma 侧执行时默认：

1. **变量**  
   - **Color**：填色/描边绑 **📖One2X 库变量**（`importVariableByKeyAsync` 或 UI 启用库后绑定）。  
   - **Typescale**：通过 **Text style** 体现；独立 `TEXT` 图层必须挂 **`title/*`、`label/*`** 等主库样式，不长期用手写 `fontSize`。  
   - **Shape**（同一集合）：圆角绑 **`Corner/*`**（名=px），间距绑 **`space/s*`**（与 **`--space-s*`** 对齐，**s**=阶梯≠px），或 **与变量一致的 Auto layout**，避免任意 px。  
2. **组件**：凡属于设计系统已覆盖的控件，**禁止**用普通 Frame/Rectangle **冒充**；用 **`search_design_system`** 取 **Button、Field、Checkboxes** 等 **实例**。  
3. **主库文件** `wHNBqjzSQZM8a4DlyBIDqW` 内作稿：直接用本地变量与样式，无需 `import`。

## 与 `design.md`、设计系统的关系

- **要用设计系统**：Workflow 不是「只学 Plugin API」；**[`design.md`](../../../design.md)** 就是把 One2X 设计系统写清楚的**唯一正文**（Design scale、色板/字阶/形状、组件节选、§6 对稿清单）。在 Figma 里建稿时，Agent 仍须按此文约束变量名、模式与组件选用。
- **和 `one2x-design-system` 的差别**：两者**共用同一份** `design.md` + `tokens/`；**`one2x-design-system`** 面向**写前端代码**时的对齐，**本 skill** 面向 **`use_figma` 写回 Figma** 时的对齐。不是两套规范，是**同一规范的两条落地路径**。
- **Figma 文件 vs 文档**：📖One2X 文件里的变量/组件是**源**；`design.md` 是团队与 Agent 的**可读摘要与规则**；`tokens.css` 是**Web 落盘**。改 Figma 时以库里真实变量为准，但若与 `design.md` 冲突，应视为需同步或单独说明的例外。

## 固定上下文

| 项 | 值 |
|----|-----|
| **Figma 文件** | `fileKey`: **`wHNBqjzSQZM8a4DlyBIDqW`**（📖One2X Design System） |
| **规范全文** | 工作区根目录 [`design.md`](../../../design.md)（含 **Design scale**、Token、组件节选） |
| **网页 Token 落盘** | [`tokens/tokens.css`](../../../tokens/tokens.css)、[`tokens/README.md`](../../../tokens/README.md) |
| **仅实现代码、不写 Figma** | 用 **[one2x-design-system](../one2x-design-system/SKILL.md)**，不必走本 workflow |

## 加载顺序（必须）

1. **`figma-use`** — 在任意 **`use_figma`** 调用之前阅读；传 `skillNames: "figma-use"`（或与下条组合）。
2. **任务类型**  
   - **整页 / 多区块** 从设计系统搭界面：再读 **`figma-generate-design`**；`skillNames` 含 `figma-generate-design`（并与 `figma-use` 组合）。  
   - **小范围改节点 / 变量 / 组件**：`figma-use` 即可。
3. **One2X 约束** — 同时遵循 **`design.md`**：**Color / Typescale / Shape / Typeface** 的模式与命名（见 **Design scale**）；优先 **`search_design_system`** 找库内组件与变量，避免硬编码 hex。

## 变量：唯一事实来源（禁止在消费稿里「抄一本」）

📖One2X 里 **Color / Typeface / Typescale / Shape** 等已在主库文件定义完整。**其它 Figma 文件**（练习稿、产品副本、Untitled 等）：

| 必须 | 说明 |
|------|------|
| **不要**在本文件新建一套 `One2X · Color` 等重复集合来「对齐」主库 | 会造成双源漂移，与 `design.md` / `tokens/` 不一致。 |
| **要**使用 **已发布库里的变量** | 在插件里用 **`figma.variables.importVariableByKeyAsync(变量的 key)`** 引入后再绑定到 **`fills`/`strokes` 的 paint 上**：对 **`SOLID`** 使用 **`boundVariables: { color: figma.variables.createVariableAlias(variable) }`**（当前 API 对节点级 `setBoundVariable('fills', …)` 已收紧为 paint 直绑）；变量 `key` 可在主库文件用 `use_figma` 读取（见 **`figma-use`** [variable-patterns](../figma-use/references/variable-patterns.md) § Importing Library Variables）。 |
| **可选** | 在 Figma UI 中对该文件 **启用库的 Variables**，再用面板绑定（与 API 导入等价目标）。 |

**主库文件**（`fileKey`: `wHNBqjzSQZM8a4DlyBIDqW`）内作稿：直接用本地变量即可，无需 import。

## 字阶（Typescale）：用库「文字样式」承接变量

**为什么**图层上只看到「填色」接了 Color 变量，却看不到每个字号、行高都单独绑 FLOAT？因为在 Figma 里，**单个 Text 图层**上对 `fontSize` / `lineHeight` 等 **不能**像填色那样稳定地用 `setBoundVariable` 串 Typescale（见 **`figma-use`** [api-reference](../figma-use/references/api-reference.md) / [wwds-text-styles](../figma-use/references/working-with-design-systems/wwds-text-styles.md)）。**推荐做法**：

| 做法 | 说明 |
|------|------|
| **对已发布的 Text style** | 在主库里，文字样式可把 Typescale **绑在样式定义上**；消费稿用 **`await figma.importStyleByKeyAsync(样式的 key)`** 再 **`await textNode.setTextStyleIdAsync(style.id)`**，字阶即与 DS 一致，**右侧面板会显示该文字样式**（样式名即 `title/medium`、`label/large` 等）。 |
| **主库 style 的 key** | 在主库文件执行 `getLocalTextStylesAsync()`，按名称取 `name`（如 `title/medium`）与 `style.key`。 |

**组件内文字**（如 `Field`、`Button` 内 label）由 **主库组件定义** 承载，不在消费稿逐层绑 Typescale。

### 消费稿「字色」与 Color 变量：对稿可见性（可选但推荐）

- **字阶**仍由 **Text style** 解决；**字色**若要在面板里明确显示为 **库变量**（与 `design.md` / `tokens.css` 的 `--color-*` 对齐），对独立 `TEXT` 图层在应用样式后**再**把 **`fills[0]`**（`SOLID`）绑到 **`Surface/On Surface`** 或 **`Surface/On Surface Variant`** 等（按语义：`title/*` / 正文主色 → `On Surface`，次要说明、辅助行 → `On Surface Variant`，主色强调 → `Schemes/Primary`）。
- **API 形态**（与矩形填色一致）：`text.fills = [{ type: 'SOLID', color: {…}, boundVariables: { color: createVariableAlias(importedVar) } }]`；**勿**对 `text` 使用已废弃的 `setBoundVariable('fills', 0, 'color', …)` 路径。
- **实例内部**（`INSTANCE` 子树）的 `TEXT` **不要**在消费稿里改，避免与主库组件漂移；若需变量色，应在 **📖One2X 主库**里改对应组件/文字样式。

## Agent 执行要点

- **写 Figma 前**：在目标文件中用 **`search_design_system`**（`fileKey` 同上）查已有 **组件、变量、样式**，优先 **importComponentByKeyAsync** / **importVariableByKeyAsync**，与 **`figma-generate-design`** 流程一致。
- **尺度**：Medeo 界面以 **Medeo light / Medeo dark** + **Typescale Baseline（及 mobile）** + **Shape Baseline** 为准；不要用个人调色替代 **`Schemes/*` / `Surface/*`**。
- **与代码双向**：若用户从代码同步到 Figma，映射关系见 `design.md` §6；若从 Figma 生成代码，收敛到 **`one2x-design-system`** 与 `tokens.css` 命名。
- **失败重试**：`use_figma` 原子性失败见 `figma-use`；修正脚本前 **不要**堆叠未经校验的大段脚本。

## 同事安装本打包

将 **`figma-use`**、**`figma-generate-design`**（若需要整屏搭建）、**`one2x-design-system`**、**`one2x-figma-workflow`** 与根目录 **`design.md`**、`tokens/` 一并纳入仓库；说明与排错见 **[README.md](../README.md)**。
