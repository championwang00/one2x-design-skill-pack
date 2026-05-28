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

## Agent workflow

1. **优先对齐 Token**：`Surface/*`；**`Shape`** 集合内 **`Radius/*`** / **`--shape-radius-*`**（名=px）、**`Space/s*`** / **`--space-s*`**（**s**=阶梯档，≠px）；字样式 **`--type-*`** 与 **`--font-family-*`**；以及 `State Layers/*`、`Schemes/*`（见 `design.md`、`tokens/tokens.css`）。
2. **网页 / 静态页（强制）——「颜色与文字都用变量」**  
   - 若仓库有 **`tokens/tokens.css`**，**颜色**一律 **`var(--color-…)`**；**字号/行高/字间距**一律 **`var(--type-…)`**（及 **`--font-family-*`**）；**间距** **`--space-s*`**、**圆角** **`--shape-radius-*`**（或项目中等效 token 名）。  
   - **禁止**：裸 hex、任意 `font-size: 14px` / `margin: 12px` 等与 token 无关的魔法数，除非 **`design.md` 写明特例**。  
   - 与 **`design.md` § Design scale「团队约定」**、**`one2x-figma-workflow`** 中「设计稿全变量」**对表**：设计侧用 Figma 变量 + Text style，代码侧用 **`tokens.css`**。
3. **Figma 组件写入（强制）——「不是只看数值，要看变量绑定」**  
   - 写入或更新 One2X 组件时，Auto Layout 的 **`padding*` / `itemSpacing`** 必须绑定 Figma **`Shape/Space/s*`** 变量；四角半径必须绑定 **`Shape/Radius/*`** 变量。  
   - 只把数值设成 8、12、16、999 等，不算完成；右侧面板要能看到变量绑定。胶囊圆角用 **`Radius/Full`**，不要保留裸 `999px`。  
   - 具体 `use_figma` 绑定方式和验收脚本见 **[`one2x-figma-workflow`](../one2x-figma-workflow/SKILL.md)** 的 **Shape 绑定检查**。
4. **组件语义（代码侧也要「组件化」）**：优先使用 **与设计系统对齐的 UI 原语**（项目里已有的 Button、Field、封装好的区块），**不要**为每个页面手写一整块无复用的「假组件」。按钮层级（Filled vs Outlined vs IconButton）、菜单 **0 Density**、列表项变体以 Figma 为准；**全页最核心的主行动按钮**：**Filled**，背景 **`Schemes/Primary`**（`--color-schemes-primary`），文字/图标 **`Schemes/On Primary`**（`--color-schemes-on-primary`）— 见 `design.md` **§3.1**。
5. **实现**：映射到 **`tokens/tokens.css`** 已有变量；禁止无约定地硬编码与设计冲突的值。
6. **Figma 为源**：冲突时以 **Figma** 为准，并提醒更新 **`design.md`** 与 **`tokens.css`**。
7. **可选**：**Figma MCP** 的 `get_design_context` / `get_variable_defs` / `search_design_system`（`fileKey`: `wHNBqjzSQZM8a4DlyBIDqW`）。
8. **动效**（有则执行）：阅读 **[web-animation-design](../web-animation-design/SKILL.md)**；需要细节时见同目录 **[PRACTICAL-TIPS.md](../web-animation-design/PRACTICAL-TIPS.md)**。Review 动效问题时按该 skill 要求使用 **Before / After 表格**输出。动效不替代 Token：例如 `transition` 的 `color` / `background-color` 仍用 **`var(--color-…)`**。

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
