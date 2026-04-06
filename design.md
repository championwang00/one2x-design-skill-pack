# One2X Design System

> 规范仅此文件；技能说明见 `.cursor/skills/README.md`。（macOS 上勿用 `DESIGN.md` 当第二文件名，易与 `design.md` 冲突。）

**谁用**：团队共用的一份「事实来源」——你自己、同事、以及 Cursor 里的 Agent 都应对齐它；给同事拷贝仓库时带上本文件与 `tokens/`、`.cursor/skills/` 即可（详见 `.cursor/skills/README.md` §2）。

**两个带 One2X 的 Cursor skill 分别干什么**（不是「DISPATCH / WORKFLOW」两套规范）：**`one2x-design-system`** 管写代码/对稿；**`one2x-figma-workflow`** 管用 MCP 在 Figma 里改稿时叠加官方 `figma-use` / `figma-generate-design` 与本文档。若你在 Figma 左侧看到 **DISPATCH**、**WORKFLOW** 之类页面名，那是设计文件里的 **Page 命名**，和本 Markdown 里的章节标题不是同一套东西；本文件只列「尺度」与节选结构，**不会**逐页解释每个业务页名。

**Figma 源文件**（同一 `fileKey`，任选其一打开即可）：

- **整文件入口**（无 `node-id`，从目录/首页进入）：[📖One2X Design System](https://www.figma.com/design/wHNBqjzSQZM8a4DlyBIDqW/%F0%9F%93%96One2X-Design-System?m=auto&t=B0QwV6M00Yh5Mpct-6)
- **定位到某一帧**（URL 中带 `node-id`）：例如 [Share 区块](https://www.figma.com/design/wHNBqjzSQZM8a4DlyBIDqW/%F0%9F%93%96One2X-Design-System?node-id=79433-33267)、[🌈Styles](https://www.figma.com/design/wHNBqjzSQZM8a4DlyBIDqW/%F0%9F%93%96One2X-Design-System?node-id=49823-12141)

`fileKey`: `wHNBqjzSQZM8a4DlyBIDqW`。`?m=auto`、`t=` 等为 Figma 网页端参数，**不会**在链接里附带 Token 或组件数据；内容仍以云端文件为准。

**说明**：带 `node-id` 的链接只决定**默认聚焦哪一帧**；整文件含 Foundation、Components、Medeo 产品页等。**完整 Page 枚举见 [附录 A](#附录-afigma-文件结构全部-page-一览)**。**Figma 文件命名、图层与组件属性、Figma2code 协作、i18n 与字阶稿内规则见 [附录 C](#附录-cfigma-设计稿使用规范)**。实现界面时应对照对应页面与变量，而非仅依赖单一节点导出。

**MCP 若 504**：勿在超大文件里全 Page `findAll`；只用变量 API 或单页查询。详见 `.cursor/skills/README.md` §5。

---

## 目录

- [1. 视觉气质与关键特征](#1-视觉气质与关键特征)
- [2. One2X 尺度体系（Design scale）](#2-one2x-尺度体系design-scale)
- [3. 设计原则与参考](#3-设计原则与参考)
- [4. 设计 Token（Figma Variables）](#4-设计-tokenfigma-variables)
- [5. 字体排印（Typography）](#5-字体排印typography)
- [6. 核心组件](#6-核心组件)
- [7. 布局原则](#7-布局原则)
- [8. 深度与层级](#8-深度与层级)
- [9. 模式参考：Share / VideoShareDialog](#9-模式参考share--videosharedialog)
- [10. 代码映射与工程接入](#10-代码映射与工程接入)
- [11. Do's and Don'ts](#11-dos-and-donts)
- [12. 响应式与字阶模式](#12-响应式与字阶模式)
- [13. Agent Prompt Guide](#13-agent-prompt-guide)
- [附录 A：Figma 文件结构（全部 Page 一览）](#附录-afigma-文件结构全部-page-一览)
- [附录 C：Figma 设计稿使用规范](#附录-cfigma-设计稿使用规范)
- [附录 B：修订记录](#附录-b修订记录)

---

## 1. 视觉气质与关键特征

Medeo / One2X 产品界面建立在 **Material Design 3** 的组件语义之上，但品牌识别来自 **中性表面（Surface）上的少量紫色主行动点**：大面积灰白阶与清晰层级，让 **`Schemes/Primary`** 在关键操作上保持高辨识度。字面上是「工具型」效率界面，而非强装饰营销站——营销与 Hero 场景再交给 **`display/*` + Nohemi** 等档位完成叙事。

**Key characteristics**

- **双字族**：正文与 UI 用 **Manrope（Plain）**；品牌展示标题用 **Nohemi（Brand）**，与 Typescale 绑定。
- **品牌紫**：主 CTA 与关键焦点使用 **`Schemes/Primary`** + **`Schemes/On Primary`**，每屏主任务区通常只保留 **一个** 最高优先级 Primary（见 §3.1）。
- **变量驱动**：颜色、字阶、圆角、间距均来自 Figma **📖One2X** 变量；Web 以 **`tokens/tokens.css`** 的 **`--color-*`、`--type-*`、`--space-s*`、`--shape-radius-*`** 为准。
- **圆角 vs 间距命名**：圆角 **`Radius/{数字}`** = 半径 **px**；间距 **`space/s0`…`s10`** = **阶梯档**，不等于数字本身即 px（见 §4.4–§4.5）。
- **多模式 Color**：Medeo 产品以 **Medeo light / Medeo dark** 为主；Mebox 为另一套 Color 模式；实现时跟随主题与 `tokens.css`。
- **工程纪律**：避免裸 hex、魔法数字字号与间距；列表与表单优先 **库组件实例**（Figma）与 **token**（代码）。

---

## 2. One2X 尺度体系（Design scale）

把 Figma 里的变量与组件组织成可执行的「尺度」：写代码或 `use_figma` 时按层级选用。**固定文件**：`fileKey` **`wHNBqjzSQZM8a4DlyBIDqW`**（📖One2X Design System）。

| 层级 | 集合 / 来源 | 要点 |
|------|----------------|------|
| 色彩 | `Color`（Medeo / Mebox 各 Mode） | Medeo 产品用 **Medeo light / dark**；语义色 **`Schemes/*`**、表面 **`Surface/*`**、**`State Layers/*`**。**品牌感**主要靠少量 **`Schemes/Primary` + `On Primary`**（见 §3.1） |
| 字族 | `Typeface` | **Manrope（Plain）**、**Nohemi（Brand）** |
| 字阶 | `Typescale`（Baseline / mobile） | 响应式对齐两套模式 |
| 形状 | `Shape`（Baseline） | **`Radius/*`** 按**半径 px** 命名（`Radius/0`、`Radius/4` … `Radius/40`、`Radius/6`、`Radius/Full`），见 §4.4 |
| 间距 | **`Shape`** 集合内 **`space/s*`** | **阶梯代号** `space/s0`…`space/s10`（**非**像素名），见 §4.5 |
| 组件 | `Components`、Medeo 各页 | 优先 **库内组件实例**，见 §6 |

**团队约定（设计稿 + 代码都要对齐变量与组件）**

- **设计稿（Figma）**  
  - **颜色**：图层填色/描边绑 **📖One2X 的 Color 变量**（消费稿用库变量 `import` / 面板绑定，勿自建一套重复集合）。  
  - **字阶**：正文/标题用主库 **Text style**（`title/medium`、`label/large` 等），承接 **Typescale**；勿手写零散字号当长期方案。  
  - **形状与间距**：圆角用 **Shape**；间距用 **spacing** 或 Auto layout，与设计变量一致。  
  - **结构**：**能用组件就不用裸 Frame 冒充**——按钮、输入、列表等一律 **库组件实例**；详见 **`one2x-figma-workflow`**。  
- **前端（Web）**  
  - **颜色与排版**：以 **`tokens/tokens.css`** 的 **`--color-*`、`--type-*`、`--space-s*`、`--shape-radius-*`、`--font-*`** 为准；**禁止**裸 hex、无 token 的裸 `font-size` / 间距（细则见 **`one2x-design-system`**）。

---

## 3. 设计原则与参考

- **组件语义**：与 **Material Design 3** 对齐处，遵循 Figma 组件描述中的用法（例如 [Buttons](http://m3.material.io/components/buttons/overview)、[Icon buttons](https://m3.material.io/components/icon-buttons/overview)）。
- **强调层级**：主要操作用 **Filled Button**；次要/并列操作用 **Outlined** 或 **IconButton**；成组图标按钮保持同一密度与圆角。
- **文案与数字**：排版样式中启用 `font-feature-settings: 'zero' 1`（零宽数字等）时与设计稿一致。

### 3.1 品牌强调：Primary 主按钮（核心规则）

整页以 **Surface / 中性灰阶** 为主时，**品牌感**依赖**少量、高识别**的紫色触点，而不是满屏堆色。

| 规则 | 说明 |
|------|------|
| **何时用** | 每屏（或每个主任务区）通常只有 **一个** 最核心的 **主行动**（Primary CTA）。 |
| **样式** | 使用 **Filled** 按钮，填充色 **`Schemes/Primary`**（品牌紫），**不要**用 `Inverse Surface` 等反色块替代主 CTA 的品牌色，除非稿内明确为特殊场景。 |
| **文字与图标** | 按钮上文字与图标颜色 **`Schemes/On Primary`**，保证与紫底对比、可读。 |
| **网页** | **`background: var(--color-schemes-primary)`**，**`color: var(--color-schemes-on-primary)`**（图标同色）。 |

**为何重要**：**Primary** 用量少，但**最醒目**，用户由此把「品牌紫」与关键操作绑定；若主按钮误用灰底/反色而不用 Primary，品牌感会明显变弱。

---

## 4. 设计 Token（Figma Variables）

Figma 本地变量按 **Collection** 组织；下列与稿内 **Variables** 面板一致（`fileKey`: `wHNBqjzSQZM8a4DlyBIDqW`）。

### 4.0 变量集合一览

| 集合 | 模式（Modes） | 变量数 | 类型构成 |
|------|----------------|--------|-----------|
| **Color** | Medeo light、Medeo dark、Mebox light、Mebox dark | **320** | COLOR **319** + STRING **1** |
| **Typeface** | Baseline、Wireframe | **5** | STRING **5** |
| **Typescale** | Baseline、mobile | **88** | FLOAT **51** + STRING **37** |
| **Shape** | Baseline | **24** | FLOAT **24**（**`Radius/*`** 圆角 + **`space/s*`** 间距，见 §4.4–§4.5） |

- **Medeo 界面**以 **Medeo light / Medeo dark** 为准；Mebox 为另一套 Color 模式。

### 4.1 Surface（表面色）

| Token | 典型用途 | 参考值 |
|--------|-----------|--------|
| `Surface/Surface` | 页面/分区背景 | `#f4f4f5` |
| `Surface/Surface Container Lowest` | 卡片、模态、顶层表面 | `#ffffff` |
| `Surface/On Surface` | 主文本/图标（亮色表面） | `#09090b` |
| `Surface/On Surface Variant` | 次要文本、未选中 Tab | `#3f3f46` |
| `Surface/Outline` | 主边框、分隔 | `#d4d4d8` |
| `Surface/Outline Variant` | 轻边框（如图标按钮容器） | `#e4e4e7` |
| `Surface/Inverse Surface` | 深色填充按钮、反色条 | `#09090b` |
| `Surface/Inverse On Surface` | 深色按钮上的文字/图标 | `#ffffff` |

### 4.2 Schemes（语义色，节选）

| Token | 参考值 | 用途 |
|--------|--------|------|
| `Schemes/Primary` | `#863dfb` | **主色（品牌紫，Medeo light）**——主按钮、关键焦点、品牌强调 |
| `Schemes/On Primary` | `#ffffff` | 主色上的图标与文字 |
| `Schemes/Secondary Container` | `#2e5fff` | 次要强调容器（偏蓝，勿与 Primary 混用） |
| `Schemes/On Secondary Container` | `#ffffff` | 其上内容 |
| `Schemes/Error` | `#ba1a1a` | 错误 |
| `Schemes/On Error` | `#ffffff` | 错误色上的内容 |

> 口语里的「Primalist 紫」一般对应变量 **`Schemes/Primary`**，不是 `Secondary Container` 的蓝。

主行动 **Filled** 按钮：**fill = `Primary`**，**label/icon = `On Primary`**（见 §3.1）。**勿**用 `Secondary Container` 充当主 CTA 的品牌色。

### 4.3 State layers（状态蒙层，透明度叠加）

用于 hover/pressed/focus 等，与设计变量名一致，例如：

- `State Layers/On Surface/Opacity-08`、`Opacity-12`
- `State Layers/On Surface Variant/Opacity-08`、`Opacity-00`
- `State Layers/Inverse On Surface/Opacity-08`、`Opacity-12`
- `State Layers/On Secondary Container/Opacity-08`、`Opacity-12`
- `State Layers/On Error Container/Opacity-08`、`Opacity-12`

实现时映射为在基础色上叠加 **8% / 12%** 透明度的前景色，或项目中等效的 `color-mix` / 专用 state token。

### 4.4 圆角（Shape 集合）

**`Shape`** 集合中同时包含 **`Radius/*`**（本节）与 **`space/s*`**（§4.5）。**命名规则与间距不同**：圆角 **名中数字 = 半径 px**；间距 **名中 `s0`…`s10` = 阶梯档，≠ px**（见 §4.5 表）。

Figma（**`Shape`** · **Baseline**）圆角变量分组名为 **`Radius/*`**；Web 侧以 **`--shape-radius-*`** 对齐。Figma 变量作用域分类仍为 **Corner radius**（面板/作用域名，与分组前缀 `Radius` 不同）。名称**不**与组件高度（H24、H40 等）绑定，避免同心嵌套时产生误导。

| Figma 变量 | CSS 变量 | 半径 |
|------------|----------|------|
| `Radius/0` | `--shape-radius-0` | 0 |
| `Radius/4` | `--shape-radius-4` | 4px |
| `Radius/6` | `--shape-radius-6` | 6px（保留原档，非 4 步进） |
| `Radius/8` | `--shape-radius-8` | 8px |
| `Radius/12` | `--shape-radius-12` | 12px |
| `Radius/16` | `--shape-radius-16` | 16px |
| `Radius/20` | `--shape-radius-20` | 20px |
| `Radius/24` | `--shape-radius-24` | 24px |
| `Radius/28` | `--shape-radius-28` | 28px |
| `Radius/32` | `--shape-radius-32` | 32px |
| `Radius/36` | `--shape-radius-36` | 36px |
| `Radius/40` | `--shape-radius-40` | 40px |
| `Radius/Full` | `--shape-radius-full` | 全圆角（胶囊；`tokens.css` 中为 `1000px`） |

**历史**：此前稿内曾用 **`Corner/*`** 前缀（与上表同一套 px / Full）；已统一为 **`Radius/*`**。旧高度档名对照仍见 **`tokens.css`** 里 **`--shape-corner-*`** 别名。另见旧稿中的 `dimensions/radius/rounded-sm` 等，以节点绑定为准。

### 4.5 间距（`Shape` 集合内的 `space/s*`）

与 **§4.4 圆角**刻意区分：**圆角**用 **`Radius/{px}`**，名字里的数字 **就是** 像素；**间距**用 **阶梯代号** **`s0`…`s10`**，名字 **不是** 像素，避免把档名误认为 px（例如旧 **`spacing/4` = 16px**，与「4px」无关）。

变量与圆角同在 **`Shape`** 集合（**Baseline**），面板中 **`space/`** 分组；WEB **Code syntax** 为 **`var(--space-s0)`** … **`var(--space-s10)`**。

| Figma（阶梯） | 实际值 | 网页侧 CSS |
|----------------|--------|-------------|
| `space/s0` | 0 | **`--space-s0`** |
| `space/s1` | 4px | **`--space-s1`** |
| `space/s2` | 8px | **`--space-s2`** |
| `space/s3` | 12px | **`--space-s3`** |
| `space/s4` | 16px | **`--space-s4`** |
| `space/s5` | 20px | **`--space-s5`** |
| `space/s6` | 24px | **`--space-s6`** |
| `space/s7` | 32px | **`--space-s7`** |
| `space/s8` | 40px | **`--space-s8`** |
| `space/s9` | 48px | **`--space-s9`** |
| `space/s10` | 64px | **`--space-s10`** |

新页面的 **`gap` / `padding` / `margin`** 应优先用 **`var(--space-s*)`**，避免裸写 `16px`。

### 4.6 网页侧变量（与 Figma 对齐）

- **颜色**：Figma **`Color`** 共 **320** 项；网页 **`--color-*`**；**浅色 `:root`**，**深色** `prefers-color-scheme: dark` 或 `data-theme`。
- **圆角**：Figma **`Shape`** · **`Radius/*`**；网页 **`--shape-radius-*`**。`tokens.css` 中 **`--shape-corner-*`** 仅为与旧高度档/旧 **`Corner/*`** 名对照的别名，新稿以 **`Radius/{px}`** 与 **`--shape-radius-{px}`** 为准（§4.4）。
- **字阶 / 字族**：**`--font-family-*`**、**`--type-*`**，或组合类 **`.o2x-type-*`**（见 `tokens.css`）。
- **间距**：Figma **`Shape`** · **`space/s*`**；网页 **`--space-s*`**（§4.5）；**勿**与 **`Radius/{px}`** 的「名=像素」规则混用。

全文变量表见 **`tokens/tokens.css`**、**`tokens/README.md`**。

---

## 5. 字体排印（Typography）

### 5.1 Typeface 集合（Figma Variables）

| Token | 值（Baseline，STRING） |
|--------|-------------------------|
| `Brand` | Nohemi |
| `Plain` | Manrope |
| `Weight/Medium` | Medium |
| `Weight/Semibold` | SemiBold |
| `Weight/Bold` | Bold |

另有 **Wireframe** 模式；以稿内为准。

### 5.2 字阶样式（节选）

**Plain**：**Manrope**。**Brand**：**Nohemi**。

| 样式名 | 字重 | 字号 | 行高 | 字间距（约） |
|--------|------|------|------|----------------|
| **label/medium** | Medium 500 | 12px | 17px | 0.2px |
| **label/medium - prominent** | SemiBold 600 | 12px | 17px | 0.2px |
| **label/large** | Medium 500 | 14px | 20px | 0.1px |
| **label/large - prominent** | SemiBold 600 | 14px | 20px | 0.1px |
| **title/medium** | SemiBold 600 | 16px | 24px | 0.15px |
| **body-medium**（导出中使用的变量名） | SemiBold 600 | 14px | 20px | 0.1px |

**展示/营销标题**：部分模块使用 **Nohemi**（如 `headline-small`）。**Typescale** 共 **88** 个变量（Baseline / mobile）；上表为常用节选。

### 5.3 字阶语义与场景映射（Medeo）

以下映射用于统一设计与实现选型。优先按语义选字阶，不按“视觉看起来接近”临时改字号。

| 层级 | 当前档位（主库） | 推荐场景 | 不建议 |
|------|------------------|----------|--------|
| `display/*` | `display/large`、`display/medium`、`display/small` | 营销页 Hero 主标题、活动 KV、品牌叙事入口 | 常规业务弹窗标题、表单标题、正文段落 |
| `headline/*` | `headline/large`、`headline/medium`、`headline/small` | 页面主标题、章节开场标题、内容区一级分组标题 | 按钮文案、长段正文 |
| `title/*` | `title/large`、`title/medium`、`title/small` | Dialog/Drawer 标题、Card/Panel 标题、列表分组标题 | Hero 大标题、超小注释文本 |
| `body/*` | `body/large`、`body/medium`、`body/small`、`body/extra small` | 正文、说明、帮助文案、元信息/时间戳（extra small） | 主 CTA 文案、主导航标签 |
| `label/*` | `label/Extra Large`、`label/large`、`label/medium`、`label/small` | Button、Tab、Chip、Field label、紧凑工具条文案 | 段落正文、营销大标题 |

`prominent` 仅用于同层强调，不替代层级：

- `label/large - prominent`：主行动（Primary CTA）。
- `label/medium - prominent`：紧凑空间中的关键操作。
- `label/Extra Large prominent`：超大按钮场景下的最高强调。

### 5.4 Medeo 常见页面举例（可直接套用）

| 场景 | 推荐字阶 | 备注 |
|------|----------|------|
| 营销落地页 Hero 主标题 | `display/large`（或 `display/medium`） | 品牌叙事优先 |
| 活动页区块开场标题 | `headline/large` | 比 `display` 收敛，仍保持强层级 |
| 工作台页面主标题（Projects / Templates） | `headline/medium` | 信息结构一级标题 |
| Dialog 标题（Share / Export / Notification） | `title/medium` | 通用弹窗默认档 |
| Card/Panel 标题（Library 等） | `title/small` 或 `title/medium` | 按信息密度选择 |
| 表格正文 / 列表项主文案 | `body/medium` | 默认阅读层 |
| 辅助说明 / 时间戳 / 元信息 | `body/small` 或 `body/extra small` | 低层级信息 |
| 主按钮文案（Primary CTA） | `label/large - prominent` | 与 `Schemes/Primary` 搭配 |
| 次要按钮 / Tab / 输入标签 | `label/large` | 默认交互文案 |
| 紧凑工具条按钮 / 小 Chip | `label/medium`（关键操作用 `label/medium - prominent`） | 密集区域的平衡选择 |

执行约束：

1. 同一页面内，同一语义角色固定同一档位，避免局部“看着调”。  
2. `prominent` 仅给关键操作，避免全局滥用导致主次失效。  
3. 组件内部文字优先沿用库内样式，不在实例里逐个手改。  

**网页实现（必读）**：新建页面时 **`font-family`** 须为 **`var(--font-family-plain)`** 或 **`var(--font-family-brand)`**；**字号 / 行高 / 字间距 / 字重** 须来自 **`tokens.css`** 里对应 **`--type-*`**（或直接使用 **`.o2x-type-*`** 组合类），**禁止**随意写 `font-size: 14px` 等魔法数字。页面需 **加载 Manrope、Nohemi**（如 Google Fonts），否则变量仍会回退到系统字体。

---

## 6. 核心组件

实现 UI 时应优先复用或对照 Figma 中同名组件变体。

- **操作**：`Button`、`IconButton`、`IconButtonToggleable`、`InlineButton`、`ButtonBar`、`ButtonInCard`、`Clip button`、`generateButton` 等。
- **选择**：`Radio buttons`、`FilterChip`。
- **菜单**：`Menu`、`inlineButtonDropDownMenu`、`MoreDropDownMenu` 及各类业务 `*DropDownMenu`（密度多为 **0 Density**）。
- **列表**：`List item/List Item: 0 Density`。
- **表单**：`Field`、`TextFieldsIcon`、`buildingBlocks/promptDialog`。
- **结构与导航**：`BuildingBlocks/TopActions`、`BuidldingBlocks/ScrollButton` 等。

**组件描述要点（节选）**：

- **Button**：用于 Dialog、Modal、Form、Card、Toolbar 等处的可点击操作；详见 M3 Buttons。**全页最核心的一个主行动**应使用 **Filled + `Schemes/Primary` + `On Primary`**（§3.1），其余次要操作用 Outlined / Tonal 等，避免多个按钮抢同一品牌色。
- **IconButton**：紧凑操作；可成组或单独使用。
- **Outlined IconButton**：中等强调，常与 Filled 搭配表示替代操作。

---

## 7. 布局原则

### 7.1 间距与节奏

- **基础阶梯**：`space/s0`…`s10` 对应 0 → 64px 的离散档（见 §4.5）；**优先 4 的倍数**与 **`var(--space-s*)`**，与 Auto layout `gap` / `padding` 一致。
- **主信息区**：业务页常用 **`s4`–`s6`** 作为卡片内边距与区块间距起点；大留白用 **`s7`+**。

### 7.2 栅格与容器

- 具体最大宽度以稿为准；复杂工作台以 **侧栏 + 主内容** 与 Figma **Medeo** 各页为准。
- **分段与分区**：用 **Surface** 层级与 **Outline** 分隔，而非额外装饰线（除非组件规范要求）。

### 7.3 留白与层级

- **中性表面为主**：大面积 **`Surface/Surface`** / **`Surface Container Lowest`** 形成底色，再用字阶与 Primary 建立层级（见 §1、§3.1）。
- **避免**：无 token 依据的随意 `margin`、与字阶不一致的临时 `font-size`。

---

## 8. 深度与层级

- **Elevation Light/1**：多层 drop shadow（约 `0 1px`、`0 2px`、`0 4px`、`0 6px` 等组合，黑色低不透明度）。卡片与浮层与之一致（参见 §9 Share 模式）。
- **模糊**：`blur` — 背景模糊（如 `backdrop-blur`），用于浮层标题栏等需与设计数值一致。

**原则**：浅色 Medeo 上以 **细边框 + 轻阴影** 表达浮起；具体数值以节点与 `tokens.css` 为准，避免自造多层阴影栈。

---

## 9. 模式参考：Share / VideoShareDialog

从当前节点导出可归纳以下模式（实现其他产品界面时类比）：

1. **容器**：白底、细边框（约 0.5px）、大圆角（如 24px）、轻阴影（Elevation Light/1）。
2. **分段控件（Tabs）**：轨道背景 `Surface/Surface`，选中项 `Surface Container Lowest` + `On Surface`；未选中项降低对比度（`On Surface Variant`、opacity）。
3. **图标网格**：统一 **64×64** 点击区域、**12px** 圆角容器、`Outline Variant` 描边；下方 **label/medium** 平台名。
4. **主按钮（Copy link）**：`Inverse Surface` 填充 + `Inverse On Surface` 文字与图标；**12px** 圆角、`label/large`；左侧可放 **18px** 图标。
5. **加载态**：`title/medium` 标题 + 中央 **Spinner**（24px 区域）。

---

## 10. 代码映射与工程接入

本节不再重复维护另一份映射表。**实现侧单一数据源**为 **`tokens/tokens.css`**；Figma 命名与取值以 **§4.4 圆角**、**§4.5 间距**、**§4.6 网页侧变量**为准。

- **当前有效命名**：Figma 圆角为 **`Radius/*`**，间距为 **`space/s*`**；Web 分别对应 **`--shape-radius-*`**、**`--space-s*`**。
- **历史名仅作兼容说明**：**`Corner/*`**、**`spacing/*`**、**`--shape-corner-*`** 均不作为新稿或新实现命名依据。
- **新页面 / C2P 落地**：引入 `tokens.css`；字族与字阶使用 **`--font-family-*`**、**`--type-*`** 或 **`.o2x-type-*`**；`gap` / `padding` / `margin` 用 **`var(--space-s*)`**；圆角用 **`var(--shape-radius-*)`**；主行动按钮用 **`--color-schemes-primary`** + **`--color-schemes-on-primary`**（§3.1）。
- **工程接入**：Tailwind / shadcn 可将 `tokens.css` 变量挂入 `theme.extend`（`colors`、`spacing`、`fontSize`、`borderRadius` 等）。
- **变更来源**：以 Figma 与 `tokens.css` 同步结果为准；`design.md` 负责说明，不再单独衍生第二套配置。

---

## 11. Do's and Don'ts

### Do

- 使用 **`tokens/tokens.css`** 中的 **`--color-*`、`--type-*`、`--space-s*`、`--shape-radius-*`、`--font-*`** 实现颜色、字阶、间距与圆角。
- 主路径 CTA 使用 **`Schemes/Primary`** + **`On Primary`**（§3.1），与 **`label/large - prominent`** 等字阶搭配。
- 在 Figma 中绑定 **Color / Typescale / Shape** 变量；组件用 **库实例**。
- 按 **§5.3 / §5.4** 选择字阶；同一语义角色在同一页面内保持一致。
- 需要零宽数字时启用 **`font-feature-settings: 'zero' 1`**，与稿一致。
- 查阅 **`tokens/README.md`** 与 **`one2x-design-system`** skill 获取实现细则。

### Don't

- **不要**在代码中写裸 **hex**（除非稿与 token 明确尚未覆盖的临时情况，且应回写 token）。
- **不要**用 **`Schemes/Secondary Container`** 充当主品牌 CTA 色（§4.2）。
- **不要**把 **`Radius/*` 的 px 命名规则**与 **`space/s*`** 阶梯混淆（§4.4–§4.5）。
- **不要**在同一屏放多个同等视觉权重的 Primary Filled 主按钮（§3.1）。
- **不要**用 **`Inverse Surface`** 替代 Primary 表达品牌主行动，除非稿面明确要求。
- **不要**在超大 Figma 文件上对全文件 **`findAll`** 触发 MCP 过载（见文首 MCP 说明）。

---

## 12. 响应式与字阶模式

- **Typescale** 提供 **Baseline** 与 **mobile** 等模式；组件与页面应在对应断点下选用稿内与 **`tokens.css`** 一致的字阶。
- **默认策略**：以 Medeo 产品稿为准；营销页可更多使用 **`display/*` + Nohemi**（§5.3）。
- 具体断点数值以实现框架与项目约定为准；**字阶切换**须仍对应 **Typescale / `--type-*`**，避免手写断点专属像素。

---

## 13. Agent Prompt Guide

### 13.1 Quick reference（Medeo light 默认）

| 角色 | Token / 变量 |
|------|----------------|
| 页面背景 | `Surface/Surface` → `--color-surface-surface`（以 `tokens.css` 为准） |
| 卡片/顶层表面 | `Surface/Surface Container Lowest` |
| 主文本 | `Surface/On Surface` |
| 次要文本 | `Surface/On Surface Variant` |
| 主 CTA 背景 | `Schemes/Primary` → `--color-schemes-primary` |
| CTA 上文字 | `Schemes/On Primary` → `--color-schemes-on-primary` |
| 圆角（示例） | `Radius/12` → `var(--shape-radius-12)` |
| 间距（示例） | `space/s4` → `var(--space-s4)` |
| 正文字体 | `var(--font-family-plain)`，字阶来自 `--type-*` 或 `.o2x-type-*` |

### 13.2 Example prompts

- 「在 Medeo light 下做一个 Dialog：白底容器用 `Surface Container Lowest`，标题 `title/medium`，主按钮 **Filled** + `Schemes/Primary` / `On Primary`，次要操作为 Outlined；`gap` 与 `padding` 全部用 `var(--space-s*)`，圆角用 `var(--shape-radius-12)`。」
- 「做一列列表项：正文 `body/medium`，元信息 `body/small`，分隔线用 `Surface/Outline`；整页只有一个 Primary 主按钮。」
- 「营销区块 Hero：`display/large` + `font-family: var(--font-family-brand)`，副标题 `body/large`；下方主 CTA 单独使用 Primary，不要用 Secondary Container 当品牌色。」

### 13.3 Iteration checklist

1. 颜色与间距是否均可映射到 **`--color-*`** 与 **`--space-s*`**？
2. 是否只有一个「主层级」的 Primary CTA（§3.1）？
3. 圆角是否用了 **`--shape-radius-*`**，且未与 `space/s*` 混用规则？
4. 字阶是否落在 **§5.3** 的语义档位，而非临时 `font-size`？
5. Figma 侧是否优先 **实例化库组件**，而非手绘 Frame？

---

## 附录 A：Figma 文件结构（全部 Page 一览）

以下内容通过 Figma MCP `use_figma`（Plugin API）读取 `figma.root` 下 **Page** 列表得到，便于与文件内左侧页签对照。名称含 **🚧** 表示该页在稿内标注为施工中 / 未就绪。

| 顺序 | 页面名 |
|------|--------|
| 1 | Foundation |
| 2 | 📖Cover |
| 3 | 📄Table of contents |
| 4 | 🌈Styles |
| 5 | ⭕️Icon |
| 6 | 🏗️Structure |
| 7 | 🔷State layer |
| 8 | 🎁Assets |
| 9 | ↳Illustrator |
| 10 | ↳One2X product logo |
| 11 | 🚧表示施工中，not ready |
| 12 | ---------- |
| 13 | Components |
| 14 | ↳Alert |
| 15 | ↳Avartars🚧 |
| 16 | ↳Badges🚧 |
| 17 | ↳Buttons |
| 18 | ↳Checkbox🚧 |
| 19 | ↳Chips🚧 |
| 20 | ↳Dialog🚧 |
| 21 | ↳Document |
| 22 | ↳Dividers |
| 23 | ↳Drawer |
| 24 | ↳Input field |
| 25 | ↳Menu🚧 |
| 26 | ↳Media Cover🚧 |
| 27 | ↳Navigation🚧 |
| 28 | ↳Lists🚧 |
| 29 | ↳OTP Field |
| 30 | ↳Progress indicators🚧 |
| 31 | ↳Picture upload🚧 |
| 32 | ↳Radio buttons🚧 |
| 33 | ↳Tags🚧 |
| 34 | ↳Tabs |
| 35 | ↳Tooltips |
| 36 | ↳Slider🚧 |
| 37 | ↳Snackbars |
| 38 | ↳Spinner |
| 39 | ↳Suggestions🚧 |
| 40 | ↳Switch🚧 |
| 41 | ----- |
| 42 | Medeo |
| 43 | ↳💻Main pages |
| 44 | ↳AI style dialog |
| 45 | ↳AI style cover |
| 46 | ↳Audio Script Panel |
| 47 | ↳Assets panel |
| 48 | ↳Clip edit dialog🚧 |
| 49 | ↳Chat panel |
| 50 | ↳Command box |
| 51 | ↳Drag indicator🚧 |
| 52 | ↳Feeds🚧 |
| 53 | ↳Feed detail🚧 |
| 54 | ↳Library panel |
| 55 | ↳Notification dialog |
| 56 | ↳Queuing |
| 57 | ↳Onboarding dialog |
| 58 | ↳Other dialogs |
| 59 | ↳Player panel |
| 60 | ↳Pricing&Credit |
| 61 | ↳Projects |
| 62 | ↳Property panel🚧 |
| 63 | ↳Recipe |
| 64 | ↳Sign in |
| 65 | ↳User profile dialog |
| 66 | ↳Video Export & Share dialog |
| 67 | ↳Video thumbnail |
| 68 | ↳Timeline panel |
| 69 | ↳Title bar |
| 70 | ↳Templates |
| 71 | ↳Variant tabs |
| 72 | ↳VIP level tags |
| 73 | ↳Watermark |
| 74 | ↳Campaign |
| 75 | ↳ Medeo Rewards |
| 76 | --- |
| 77 | Mebox |
| 78 | ↳Clip button |
| 79 | ↳Popup panel |
| 80 | Side panel |
| 81 | ↳Time stamp |
| 82 | -- |
| 83 | 📥Archive |
| 84 | ↳微拟物设计探索 |
| 85 | ↳new explore |
| 86 | ↳AI media panel （with custom） |
| 87 | ↳Command box（before v1.03） |
| 88 | ↳Command box（before v2） |
| 89 | ↳Variant tabs abandon🚫 |

---

## 附录 C：Figma 设计稿使用规范

本附录标准化 One2X 内 **Figma 设计稿的文件命名、图层与组件组织**，保证团队阅读一致，并使 **Figma2code** 同步到代码侧时符合开发阅读习惯。

**与正文关系**：本附录侧重 **稿面结构与协作**；视觉尺度、Token、字阶语义仍以 **§1–§5** 与 **`tokens/tokens.css`** 为准。字阶适用场景（**C.6**）与 **§5.3** 一致，可互为对照。

**强制性说明**：*本附录不是 Figma2code 工具使用的强制前置条件*，而是 **使用该工具时的最佳实践**。

### C.1 总则：命名与交互状态

- **文件 / Frame / 图层命名**：完整层级格式由团队在 **Figma 库内**统一执行；本仓库不另附「命名总览」表。
- **交互状态属性**：以组件中**已实际使用**的属性为准；新增状态须在团队约定的 **对象/Item 状态** 中取**唯一**取值，并同步到组件说明。
- **结构属性**：描述组件结构维度（如 `hasStart`、布局类型等）；与 Component Property 命名关系见 **C.2 补充规则 B**。

### C.2 组件图层结构规则

组件（Component）与变体（Variants）的构建规则如下。

| 规则名称 | 规则详情 |
|----------|----------|
| **最小图层数量** | 用**最少图层**覆盖尽量多场景。低频且会显著增加图层时，优先用**外层 Frame 组合**承载，而非无限膨胀单一组件。 |
| **变体间图层数量一致** | 同一组件不同变体须**图层数量一致**；某变体不需要的元素应 **隐藏**，**不得**删图层导致结构不一致。若无法兼顾，应**拆成另一个组件**。 |
| **实例交换（Instance Swap）** | 对**可被替换**的子内容配置 **Property → Instance Swap**，便于 Figma2code 传递「可替换实例」；否则仅靠手改子图层，工具链难以同步给开发。不需要被替换的图层建议**锁定**。若 Boolean 名为 `hasXXX`，对应 Instance Swap 属性名一般为 **`XXX`**（无 `has` 前缀）。 |
| **文字属性（Text）** | 可替换文案须配置 **Text** 属性（理由同上）。 |

**补充规则 A：Component Property 类型选择**

| 内容类型 | Property 类型 | 适用场景 | 示例 |
|----------|-----------------|----------|------|
| 单个可替换组件（结构固定） | Instance Swap | 图标、头像等从预设列表选择 | Button 的 start icon |
| 可替换文字 | Text | 标签、标题等 | Button 的 label |
| 可自由组装的内容区（结构不可预测） | Slot | Dialog body、Drawer content 等 | Dialog 正文区 |
| 元素显隐 | Boolean | 控制某图层是否显示 | `hasStart`、`hasClose` |

- **Instance Swap vs Slot**：从预设里选一个 → **Instance Swap**；需自由组装 → **Slot**；仅显隐 → **Boolean**。

**补充规则 B：Boolean 命名**

- 统一 **`has` / `show` 前缀 + PascalCase**，如 `hasStart`、`hasClose`、`showRMBPrice`。
- 若 Boolean 控制某 Instance Swap 的显隐，且 Boolean 为 `hasXXX`，则对应 Instance Swap 名为 **`XXX`**（去掉 `has`）。  
  - ✅ `hasStart` + `start`  
  - ❌ `hasStart` + `startIcon`

**补充规则 C：Variant 属性值格式**

- 交互状态类（`state`、`selected`、`disabled`、`loading`）→ 全小写：`default`、`hovered`、`focused`、`pressed`、`true`、`false`。
- 布局 / 类型类（`type`、`layout`、`kind`）→ 全小写：`vertical`、`horizontal`、`filled`、`outline`。
- **禁止**同一 Variant 属性内大小写混用（如 `Default` 与 `hovered` 并存）。
- 布尔型 Variant → 使用 **`true` / `false`**，不用 `yes` / `no`。

**补充规则 D：拼写**

- 组件名、属性名、Variant 值须使用**正确英文**；发布前检查，避免 `increse`、`Iterm`、`currrent` 等错误进入库（修改成本极高）。

### C.3 组件命名与组织

**通用（基础 + 业务）**

- 组件名**全局唯一**；**PascalCase**：`ProfileDialog`、`ConfirmButton`。
- 子节点 **camelCase**，体现功能或角色，**不**用表现命名：✅ `confirmButton` ❌ `redButton`。

**基础组件（Atomic）**

- 子节点**严格唯一**，不可重复或模糊。  
- ✅ `Button` → `iconLeft`、`label`、`iconRight`  
- ❌ 多个同名 `icon`

**业务组件（Business）**

- 子节点可**语义化抽象**，但**禁止**拼接版本号式命名（如 `header_v1`）或重复同名子节点。  
- ✅ `ProfileDialog` → `header`、`body`、`confirmButton`、`cancelButton`  
- ❌ `header_v1`、`confirmButton_v1` 或三个 `confirmButton`

### C.4 Figma 文件与页面组织

**Page 命名**

- 基础组件子页：`↳` 前缀，如 `↳Buttons`、`↳Input field`。
- 施工中：名称后加 **🚧**，如 `↳Dialog🚧`。
- 分隔线：`----------` 或 `-----`。
- 产品页：产品名开头（如 `Medeo`、`Mebox`），子页用 `↳`。

**Page 内 Section**

- 用 **Section** 区分模块；名称语义化（如 `Credit`、`Pricing`）。
- 组件定义与 **demo/示例** 分区放置，避免混在一坨。

**Variant 数量**

- 基础组件（Button / Switch / Tag）：可用 Variants 管理交互状态，组合数可较多。
- 业务组件：Variant 维度建议 **≤ 3**；若组合 **> 12**，评估是否拆成多个组件。

### C.5 i18n 多语言设计规范

以下为设计稿侧规则（与产品侧本地化流程配合，架构细节以团队约定为准）。

#### C.5.1 文本容器弹性

| 英文源文案长度 | 预留膨胀 | 典型膨胀语言 |
|----------------|----------|----------------|
| ≤10 字符（短文案：按钮、标签） | +200% | 德语、芬兰语、希腊语 |
| 11–20 字符（菜单、Tab） | +100% | 法语、俄语、葡萄牙语 |
| 21–70 字符（提示、描述片段） | +40% | 大部分欧洲语言 |
| >70 字符（长文） | +30% | — |

日语、韩语、中文常比英语短，但**不得以之为由缩小容器**——以**最长语言**为基准。

**落地规则**

- 禁止 **固定宽 + 固定高** 同时卡死（至少一维可自适应）。
- Button、Chip、Tab 等短文案：**auto width**（`min-width` + padding）。
- Toast、Alert body、Dialog body 等：**高度自适应**，允许多行。

#### C.5.2 组件级 i18n 标注

每个组件 Spec / Anatomy 区建议增加 **i18n constraints** 标注：

| 标注项 | 说明 | 示例 |
|--------|------|------|
| maxLength | 源文案（英文）最大字符数 | max 24 chars (en) |
| overflow | 超长策略 | truncate、wrap、scale-down |
| width | 宽度策略 | auto (min 88px)、fixed 120px |
| lines | 最大行数 | 1 line、unlimited |
| icon-only fallback | 是否提供纯图标降级 | icon-only variant available |

**各组件建议值**（可按业务微调，稿内须明确）：

| 组件 | maxLength (en) | overflow | width | lines |
|------|----------------|----------|-------|-------|
| Button | 24 | truncate + tooltip | auto, min 88px | 1 |
| Chips | 20 | truncate | auto, max 200px | 1 |
| Tab | 16 | truncate | auto | 1 |
| Input label | 30 | wrap | follow container | 2 |
| Input placeholder | 40 | truncate | follow container | 1 |
| Input helper text | 60 | wrap | follow container | 2 |
| Dialog title | 40 | truncate | follow container | 1 |
| Dialog body | unlimited | wrap | follow container | unlimited |
| Dialog CTA | 24 | 同 Button | auto, min 88px | 1 |
| Toast / Snackbar | 80 | wrap | fixed max-width | 2 |
| Alert | unlimited | wrap | follow container | unlimited |
| Navigation label | 12 | truncate / wrap | auto | 2 |
| Tooltip | 60 | wrap | auto, max 240px | unlimited |
| Tag | 16 | truncate | auto, max 120px | 1 |
| Menu item | 30 | truncate | follow container | 1 |

#### C.5.3 设计稿文案

1. 源文案用**英文**；Text Property 默认值不用中文占位。  
2. 文案有语义：避免无意义 `Label`、`Text`，用真实文案（如 Save changes、Cancel）。  
3. 动态内容用 `{变量名}`，如 `Hello, {userName}`、`{count} items`。  
4. 含文字需本地化的素材：图层名后加 **🌐**。

#### C.5.4 布局弹性检查清单（评审用）

- [ ] 文本容器至少一维可自适应？  
- [ ] 短文案组件是否 auto width？  
- [ ] 是否标注 maxLength 与 overflow？  
- [ ] 固定宽布局中文案区是否支持 truncate + tooltip？  
- [ ] 图标+文字是否可用 Auto Layout 预留 RTL 镜像？  
- [ ] 多行 Alert / Toast 是否高度自适应？  
- [ ] 含文字素材是否标 🌐？

### C.6 Typography 字阶稿内使用

与 **§5.3 字阶语义与场景映射**一致；下表便于在 Figma 选档时自查。

| Token 层级 | ✅ 适用 | ❌ 不适用 |
|------------|---------|-----------|
| `display/*` | Landing Hero、Campaign KV | 表单标题、普通卡片标题 |
| `headline/*` | 页面主标题、章节起始 | 按钮文案、长段正文 |
| `title/*` | Dialog / Drawer / 卡片标题 | Hero、脚注 |
| `body/*` | 正文、说明、帮助 | 主 CTA 文案 |
| `label/*` | 按钮、Tab、Chip、输入标签 | 段落正文 |

**`*-prominent`**：同一层级内强调主操作 / 高优先级；**同一视图内** prominent 宜控制在 **1–2 个**元素；超过 **3 个**须重新梳理信息架构。

### C.7 补充规则：corner-shape 圆角标注

项目默认启用 **corner-shape（superellipse）**；设计稿圆角按此渲染。若某组件需要**标准全圆角（pill / 半圆弧）**而非 superellipse，须在 **Figma Dev Mode 注释或图层描述**中标注 **`corner-shape: round`**。

| 组件 | 原因 |
|------|------|
| Avatar | 圆形头像需标准 50% 圆弧 |
| Switch | 轨道需标准 pill 全圆角 |

其余组件用默认 corner-shape；新增场景在本表补充。

### C.8 小结

**一句话**：约束产生一致性，一致性产生效率。

- **命名**：组件 PascalCase 全局唯一；子节点 camelCase、语义化。  
- **图层**：最少图层 + 变体间结构一致 + 不用的图层隐藏不删。  
- **属性**：可替换内容暴露为 Property（Swap / Text / Slot / Boolean），类型见 **C.2 补充规则 A**。  
- **Variant**：值全小写；布尔 `true`/`false`；禁止大小写混用。  
- **拼写**：发布前检查。  
- **文件组织**：Page 与 Section 规则见 **C.4**；i18n 见 **C.5**；字阶稿内见 **C.6**；与 **§5** 对齐。

---

## 附录 B：修订记录

| 日期 | 说明 |
|------|------|
| 2026-04-06 | **结构**：按 Stitch 式重组（§1 视觉气质、目录、§7–§13、附录 A Page 表等）；**附录 C**：Figma 稿图层/Property、Figma2code 最佳实践、i18n、字阶稿内、corner-shape；已去掉对外部文档表格的依赖 |
| 2026-04-03 | Typography 增补 **§5.3 字阶语义与场景映射**、**§5.4 Medeo 常见页面举例**（原 §3.3 / §3.4），统一 `display/headline/title/body/label` 与 `prominent` 使用边界，避免 skill 与正文口径漂移 |
| 2026-03-31 | 精简 **代码映射**（现 §10）：去除与圆角/间距/`tokens.css` 重复的映射表描述，明确 **`tokens/tokens.css`** 为实现侧单一数据源；历史名仅作兼容说明 |
| 2026-03-25 | 基于 Figma MCP：`get_variable_defs`（Share、Button 节点）、`search_design_system`、`get_design_context`（VideoShareDialog）与组件描述整理 |
| 2026-03-25 | 补充整文件入口链接说明；用 `use_figma` 枚举全部 Page 页签写入「Figma 文件结构」表 |
| 2026-03-25 | 增补变量集合一览、Shape 圆角全表、Typeface；**Design scale** 与 **fileKey** 强调；恢复误覆盖的正文 |
| 2026-03-25 | **`tokens.css`**：补齐 **字阶 `--type-*`**、**字族**、**间距 `--space-*`**、**`--shape-corner-*` 历史别名**、**`.o2x-type-*`** 组合类；间距与网页侧变量、Typography、代码映射明确新页面须用变量 |
| 2026-03-25 | 圆角 CSS 改为 **`--shape-radius-{px}`**（4px 网格至 40），与高度档命名脱钩；`tokens.css` 同步 |
| 2026-03-25 | 新增 **Primary 主按钮**（现 §3.1）：主 CTA 用 **Filled + Primary + On Primary** 体现品牌感；Schemes、核心组件 Button 呼应 |
| 2026-03-25 | **Figma `Shape`**：圆角分组曾历经 **`Radius/*`** / **`Corner/*`** 调整；**按 px 命名** 并补全 **`…/24`…`…/40`**；变量集合、圆角、代码映射同步 |
| 2026-03-31 | **`Shape`** 圆角变量：Figma 分组前缀改为 **`Radius/*`**（替代 **`Corner/*`**）；`design.md`、`tokens/*`、skills 与圆角表同步；Figma 作用域名 **Corner radius** 不变 |
| 2026-03-25 | **Figma `spacing`** 集合：**`spacing/0`…`spacing/16`**（11 项）与 **`--space-*`** 对齐；Design scale、`tokens/README` 同步 |
| 2026-03-25 | **`spacing/*`** 并入 **`Shape`** 集合（原独立 **`spacing`** 集合已删）；Design scale、`tokens/README`、`tokens.css` 头注释同步 |
| 2026-03-25 | **间距命名**：Figma **`space/s0`…`space/s10`**、CSS **`--space-s0`…`--space-s10`**（**s** = 阶梯，≠ px）；与圆角 **`{px}`** 名规则区分；`tokens.css`、示例页、skills 同步 |
