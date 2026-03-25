# One2X Design System

> 规范仅此文件；技能说明见 `.cursor/skills/README.md`。（macOS 上勿用 `DESIGN.md` 当第二文件名，易与 `design.md` 冲突。）

**谁用**：团队共用的一份「事实来源」——你自己、同事、以及 Cursor 里的 Agent 都应对齐它；给同事拷贝仓库时带上本文件与 `tokens/`、`.cursor/skills/` 即可（详见 `.cursor/skills/README.md` §2）。

**两个带 One2X 的 Cursor skill 分别干什么**（不是「DISPATCH / WORKFLOW」两套规范）：**`one2x-design-system`** 管写代码/对稿；**`one2x-figma-workflow`** 管用 MCP 在 Figma 里改稿时叠加官方 `figma-use` / `figma-generate-design` 与本文档。若你在 Figma 左侧看到 **DISPATCH**、**WORKFLOW** 之类页面名，那是设计文件里的 **Page 命名**，和本 Markdown 里的章节标题不是同一套东西；本文件只列「尺度」与节选结构，**不会**逐页解释每个业务页名。

**Figma 源文件**（同一 `fileKey`，任选其一打开即可）：

- **整文件入口**（无 `node-id`，从目录/首页进入）：[📖One2X Design System](https://www.figma.com/design/wHNBqjzSQZM8a4DlyBIDqW/%F0%9F%93%96One2X-Design-System?m=auto&t=B0QwV6M00Yh5Mpct-6)
- **定位到某一帧**（URL 中带 `node-id`）：例如 [Share 区块](https://www.figma.com/design/wHNBqjzSQZM8a4DlyBIDqW/%F0%9F%93%96One2X-Design-System?node-id=79433-33267)、[🌈Styles](https://www.figma.com/design/wHNBqjzSQZM8a4DlyBIDqW/%F0%9F%93%96One2X-Design-System?node-id=49823-12141)

`fileKey`: `wHNBqjzSQZM8a4DlyBIDqW`。`?m=auto`、`t=` 等为 Figma 网页端参数，**不会**在链接里附带 Token 或组件数据；内容仍以云端文件为准。

**说明**：带 `node-id` 的链接只决定**默认聚焦哪一帧**；整文件含 Foundation、Components、Medeo 产品页等（见下节）。实现界面时应对照对应页面与变量，而非仅依赖单一节点导出。

---

## Design scale（One2X 尺度体系）

把 Figma 里的变量与组件组织成可执行的「尺度」：写代码或 `use_figma` 时按层级选用。**固定文件**：`fileKey` **`wHNBqjzSQZM8a4DlyBIDqW`**（📖One2X Design System）。

| 层级 | 集合 / 来源 | 要点 |
|------|----------------|------|
| 色彩 | `Color`（Medeo / Mebox 各 Mode） | Medeo 产品用 **Medeo light / dark**；语义色 **`Schemes/*`**、表面 **`Surface/*`**、**`State Layers/*`**。**品牌感**主要靠少量 **`Schemes/Primary` + `On Primary`**（见 §1.1） |
| 字族 | `Typeface` | **Manrope（Plain）**、**Nohemi（Brand）** |
| 字阶 | `Typescale`（Baseline / mobile） | 响应式对齐两套模式 |
| 形状 | `Shape`（Baseline） | **`Corner/*`** 按**半径 px** 命名（`Corner/0`、`Corner/4` … `Corner/40`、`Corner/6`、`Corner/Full`），见 §2.4 |
| 间距 | **`Shape`** 集合内 **`space/s*`** | **阶梯代号** `space/s0`…`space/s10`（**非**像素名），见 §2.5 |
| 组件 | `Components`、Medeo 各页 | 优先 **库内组件实例**，见 §4 |

**团队约定（设计稿 + 代码都要对齐变量与组件）**

- **设计稿（Figma）**  
  - **颜色**：图层填色/描边绑 **📖One2X 的 Color 变量**（消费稿用库变量 `import` / 面板绑定，勿自建一套重复集合）。  
  - **字阶**：正文/标题用主库 **Text style**（`title/medium`、`label/large` 等），承接 **Typescale**；勿手写零散字号当长期方案。  
  - **形状与间距**：圆角用 **Shape**；间距用 **spacing** 或 Auto layout，与设计变量一致。  
  - **结构**：**能用组件就不用裸 Frame 冒充**——按钮、输入、列表等一律 **库组件实例**；详见 **`one2x-figma-workflow`**。  
- **前端（Web）**  
  - **颜色与排版**：以 **`tokens/tokens.css`** 的 **`--color-*`、`--type-*`、`--space-s*`、`--shape-radius-*`、`--font-*`** 为准；**禁止**裸 hex、无 token 的裸 `font-size` / 间距（细则见 **`one2x-design-system`**）。

**MCP 若 504**：勿在超大文件里全 Page `findAll`；只用变量 API 或单页查询。详见 `.cursor/skills/README.md` §5。

---

## Figma 文件结构（全部 Page 一览）

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

## 1. 设计原则与参考

- **组件语义**：与 **Material Design 3** 对齐处，遵循 Figma 组件描述中的用法（例如 [Buttons](http://m3.material.io/components/buttons/overview)、[Icon buttons](https://m3.material.io/components/icon-buttons/overview)）。
- **强调层级**：主要操作用 **Filled Button**；次要/并列操作用 **Outlined** 或 **IconButton**；成组图标按钮保持同一密度与圆角。
- **文案与数字**：排版样式中启用 `font-feature-settings: 'zero' 1`（零宽数字等）时与设计稿一致。

### 1.1 品牌强调：Primary 主按钮（核心规则）

整页以 **Surface / 中性灰阶** 为主时，**品牌感**依赖**少量、高识别**的紫色触点，而不是满屏堆色。

| 规则 | 说明 |
|------|------|
| **何时用** | 每屏（或每个主任务区）通常只有 **一个** 最核心的 **主行动**（Primary CTA）。 |
| **样式** | 使用 **Filled** 按钮，填充色 **`Schemes/Primary`**（品牌紫），**不要**用 `Inverse Surface` 等反色块替代主 CTA 的品牌色，除非稿内明确为特殊场景。 |
| **文字与图标** | 按钮上文字与图标颜色 **`Schemes/On Primary`**，保证与紫底对比、可读。 |
| **网页** | **`background: var(--color-schemes-primary)`**，**`color: var(--color-schemes-on-primary)`**（图标同色）。 |

**为何重要**：**Primary** 用量少，但**最醒目**，用户由此把「品牌紫」与关键操作绑定；若主按钮误用灰底/反色而不用 Primary，品牌感会明显变弱。

---

## 2. 设计 Token（Figma Variables）

Figma 本地变量按 **Collection** 组织；下列与稿内 **Variables** 面板一致（`fileKey`: `wHNBqjzSQZM8a4DlyBIDqW`）。

### 2.0 变量集合一览

| 集合 | 模式（Modes） | 变量数 | 类型构成 |
|------|----------------|--------|-----------|
| **Color** | Medeo light、Medeo dark、Mebox light、Mebox dark | **320** | COLOR **319** + STRING **1** |
| **Typeface** | Baseline、Wireframe | **5** | STRING **5** |
| **Typescale** | Baseline、mobile | **88** | FLOAT **51** + STRING **37** |
| **Shape** | Baseline | **24** | FLOAT **24**（**`Corner/*`** 圆角 + **`space/s*`** 间距，见 §2.4–§2.5） |

- **Medeo 界面**以 **Medeo light / Medeo dark** 为准；Mebox 为另一套 Color 模式。

### 2.1 Surface（表面色）

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

### 2.2 Schemes（语义色，节选）

| Token | 参考值 | 用途 |
|--------|--------|------|
| `Schemes/Primary` | `#863dfb` | **主色（品牌紫，Medeo light）**——主按钮、关键焦点、品牌强调 |
| `Schemes/On Primary` | `#ffffff` | 主色上的图标与文字 |
| `Schemes/Secondary Container` | `#2e5fff` | 次要强调容器（偏蓝，勿与 Primary 混用） |
| `Schemes/On Secondary Container` | `#ffffff` | 其上内容 |
| `Schemes/Error` | `#ba1a1a` | 错误 |
| `Schemes/On Error` | `#ffffff` | 错误色上的内容 |

> 口语里的「Primalist 紫」一般对应变量 **`Schemes/Primary`**，不是 `Secondary Container` 的蓝。

主行动 **Filled** 按钮：**fill = `Primary`**，**label/icon = `On Primary`**（见 §1.1）。**勿**用 `Secondary Container` 充当主 CTA 的品牌色。

### 2.3 State layers（状态蒙层，透明度叠加）

用于 hover/pressed/focus 等，与设计变量名一致，例如：

- `State Layers/On Surface/Opacity-08`、`Opacity-12`
- `State Layers/On Surface Variant/Opacity-08`、`Opacity-00`
- `State Layers/Inverse On Surface/Opacity-08`、`Opacity-12`
- `State Layers/On Secondary Container/Opacity-08`、`Opacity-12`
- `State Layers/On Error Container/Opacity-08`、`Opacity-12`

实现时映射为在基础色上叠加 **8% / 12%** 透明度的前景色，或项目中等效的 `color-mix` / 专用 state token。

### 2.4 圆角（Shape 集合）

**`Shape`** 集合中同时包含 **`Corner/*`**（本节）与 **`space/s*`**（§2.5），勿再建独立 **`Radius`** 集合。**命名规则与间距不同**：圆角 **名中数字 = 半径 px**；间距 **名中 `s0`…`s10` = 阶梯档，≠ px**（见 §2.5 表）。

**网页侧（CSS）**以 **半径像素值** 命名；主梯度 **4px 步进** 至 **40**，另含 **`--shape-radius-6`** 与 Figma **`Corner/6`** 对齐。名称**不**与组件高度（H24、H40 等）绑定，避免同心嵌套时产生误导。

| CSS 变量 | 半径 |
|----------|------|
| `--shape-radius-0` | 0 |
| `--shape-radius-4` | 4px |
| `--shape-radius-6` | 6px（与 `Corner/6` 一致） |
| `--shape-radius-8` | 8px |
| `--shape-radius-12` | 12px |
| `--shape-radius-16` | 16px |
| `--shape-radius-20` | 20px |
| `--shape-radius-24` | 24px |
| `--shape-radius-28` | 28px |
| `--shape-radius-32` | 32px |
| `--shape-radius-36` | 36px |
| `--shape-radius-40` | 40px |
| `--shape-radius-full` | 全圆角（胶囊，见 `tokens/tokens.css`） |

**Figma（`Shape` · Baseline）** 仅使用 **`Corner/*`**（**不**再单独建 `Radius/*` 分组）。变量名为 **半径像素**（或 **`Corner/Full`** = 胶囊），作用域 **Corner radius**，WEB **Code syntax** 为 `var(--shape-radius-…)`，与上表一致。

| Figma 变量 | 半径 |
|-------------|------|
| `Corner/0` | 0 |
| `Corner/4` | 4px |
| `Corner/6` | 6px（保留原档，非 4 步进） |
| `Corner/8` | 8px |
| `Corner/12` | 12px |
| `Corner/16` | 16px |
| `Corner/20` | 20px |
| `Corner/24` | 24px |
| `Corner/28` | 28px |
| `Corner/32` | 32px |
| `Corner/36` | 36px |
| `Corner/40` | 40px |
| `Corner/Full` | 全圆角（与 `tokens.css` 中 `1000px` 一致） |

**旧名 → 新名**（仅作历史文档对照）：`Corner/None`→`Corner/0`，`Extra Small-H24`→`Corner/4`，`Medium Small-H32`→`Corner/6`，`Small-H40`→`Corner/8`，`Medium-H48`→`Corner/12`，`Large-H56`→`Corner/16`，`Extra Large`→`Corner/20`，`Corner/Full` 不变。另见旧稿中的 `dimensions/radius/rounded-sm` 等，以节点绑定为准。

### 2.5 间距（`Shape` 集合内的 `space/s*`）

与 **§2.4 圆角**刻意区分：**圆角**用 **`Corner/{px}`**，名字里的数字 **就是** 像素；**间距**用 **阶梯代号** **`s0`…`s10`**，名字 **不是** 像素，避免把档名误认为 px（例如旧 **`spacing/4` = 16px**，与「4px」无关）。

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

### 2.6  elevation

- **Elevation Light/1**：多层 drop shadow（约 `0 1px`、`0 2px`、`0 4px`、`0 6px` 等组合，黑色低不透明度）。卡片与浮层与之一致。

### 2.7 模糊

- `blur`：背景模糊（如 `backdrop-blur`），用于浮层标题栏等需与设计数值一致。

### 2.8 网页侧变量（与 Figma 对齐）

- **颜色**：Figma **`Color`** 共 **320** 项；网页 **`--color-*`**；**浅色 `:root`**，**深色** `prefers-color-scheme: dark` 或 `data-theme`。
- **圆角**：Figma **`Shape`** · **`Corner/*`**；网页 **`--shape-radius-*`**。`tokens.css` 中 **`--shape-corner-*`** 仅为与旧 Figma 名对照的别名，新稿以 **`Corner/{px}`** 与 **`--shape-radius-{px}`** 为准（§2.4）。
- **字阶 / 字族**：**`--font-family-*`**、**`--type-*`**，或组合类 **`.o2x-type-*`**（见 `tokens.css`）。
- **间距**：Figma **`Shape`** · **`space/s*`**；网页 **`--space-s*`**（§2.5）；**勿**与 **`Corner/{px}`** 的「名=像素」规则混用。

全文变量表见 **`tokens/tokens.css`**、**`tokens/README.md`**。

---

## 3. 字体排印（Typography）

### 3.1 Typeface 集合（Figma Variables）

| Token | 值（Baseline，STRING） |
|--------|-------------------------|
| `Brand` | Nohemi |
| `Plain` | Manrope |
| `Weight/Medium` | Medium |
| `Weight/Semibold` | SemiBold |
| `Weight/Bold` | Bold |

另有 **Wireframe** 模式；以稿内为准。

### 3.2 字阶样式（节选）

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

**网页实现（必读）**：新建页面时 **`font-family`** 须为 **`var(--font-family-plain)`** 或 **`var(--font-family-brand)`**；**字号 / 行高 / 字间距 / 字重** 须来自 **`tokens.css`** 里对应 **`--type-*`**（或直接使用 **`.o2x-type-*`** 组合类），**禁止**随意写 `font-size: 14px` 等魔法数字。页面需 **加载 Manrope、Nohemi**（如 Google Fonts），否则变量仍会回退到系统字体。

---

## 4. 核心组件（库内命名，节选）

实现 UI 时应优先复用或对照 Figma 中同名组件变体。

- **操作**：`Button`、`IconButton`、`IconButtonToggleable`、`InlineButton`、`ButtonBar`、`ButtonInCard`、`Clip button`、`generateButton` 等。
- **选择**：`Radio buttons`、`FilterChip`。
- **菜单**：`Menu`、`inlineButtonDropDownMenu`、`MoreDropDownMenu` 及各类业务 `*DropDownMenu`（密度多为 **0 Density**）。
- **列表**：`List item/List Item: 0 Density`。
- **表单**：`Field`、`TextFieldsIcon`、`buildingBlocks/promptDialog`。
- **结构与导航**：`BuildingBlocks/TopActions`、`BuidldingBlocks/ScrollButton` 等。

**组件描述要点（节选）**：

- **Button**：用于 Dialog、Modal、Form、Card、Toolbar 等处的可点击操作；详见 M3 Buttons。**全页最核心的一个主行动**应使用 **Filled + `Schemes/Primary` + `On Primary`**（§1.1），其余次要操作用 Outlined / Tonal 等，避免多个按钮抢同一品牌色。
- **IconButton**：紧凑操作；可成组或单独使用。
- **Outlined IconButton**：中等强调，常与 Filled 搭配表示替代操作。

---

## 5. 模式参考：Share / VideoShareDialog

从当前节点导出可归纳以下模式（实现其他产品界面时类比）：

1. **容器**：白底、细边框（约 0.5px）、大圆角（如 24px）、轻阴影（Elevation Light/1）。
2. **分段控件（Tabs）**：轨道背景 `Surface/Surface`，选中项 `Surface Container Lowest` + `On Surface`；未选中项降低对比度（`On Surface Variant`、opacity）。
3. **图标网格**：统一 **64×64** 点击区域、**12px** 圆角容器、`Outline Variant` 描边；下方 **label/medium** 平台名。
4. **主按钮（Copy link）**：`Inverse Surface` 填充 + `Inverse On Surface` 文字与图标；**12px** 圆角、`label/large`；左侧可放 **18px** 图标。
5. **加载态**：`title/medium` 标题 + 中央 **Spinner**（24px 区域）。

---

## 6. 代码映射建议

- **单一数据源**：实现以 **`tokens/tokens.css`** 为准 — **`--color-*`**、**`--shape-radius-*`**、**`--type-*`**、**`--space-s*`**、**`--font-family-*`**。
- **新页面/C2P 清单**：① 引入 `tokens.css`；② **`body`** 或根节点设 **`font-family: var(--font-family-plain)`**；③ 标题/正文用 **`--type-*`** 或 **`.o2x-type-*`**；④ **`gap` / `padding` / `margin`** 用 **`var(--space-s*)`**（阶梯档，见 §2.5）；⑤ 圆角用 **`var(--shape-radius-12)`** 等（与 Figma **`Corner/12`**，**12 = 12px**）；⑥ **主行动按钮**用 **`--color-schemes-primary` + `--color-schemes-on-primary`**（§1.1）。
- **Tailwind / shadcn**：把 `tokens.css` 变量挂入 `theme.extend`（`colors`、`spacing`、`fontSize`、`borderRadius` 等）。
- **变更来源**：以 **Figma** 为准；`tokens.css` 与 `design.md` 随大版本同步。

---

## 7. 修订记录

| 日期 | 说明 |
|------|------|
| 2026-03-25 | 基于 Figma MCP：`get_variable_defs`（Share、Button 节点）、`search_design_system`、`get_design_context`（VideoShareDialog）与组件描述整理 |
| 2026-03-25 | 补充整文件入口链接说明；用 `use_figma` 枚举全部 Page 页签写入「Figma 文件结构」表 |
| 2026-03-25 | 增补 §2.0、Shape 圆角全表、§3.1 Typeface；**Design scale** 与 **fileKey** 强调；恢复误覆盖的正文 |
| 2026-03-25 | **`tokens.css`**：补齐 **字阶 `--type-*`**、**字族**、**间距 `--space-*`**、**Corner 别名**、**`.o2x-type-*`** 组合类；§2.5 / §2.8 / §3 / §6 明确新页面须用变量 |
| 2026-03-25 | 圆角 CSS 改为 **`--shape-radius-{px}`**（4px 网格至 40），与高度档命名脱钩；§2.4、§6、`tokens.css` 同步 |
| 2026-03-25 | 新增 **§1.1**：主 CTA 用 **Filled + Primary + On Primary** 体现品牌感；§2.2、§4 Button 呼应 |
| 2026-03-25 | **Figma `Shape`**：曾新增 **`Radius/*`** 后已移除；**`Corner/*`** 改为按 px 命名并补 **`Corner/24`…`Corner/40`**；§2.0、§2.4、§6 同步 |
| 2026-03-25 | **Figma `spacing`** 集合：**`spacing/0`…`spacing/16`**（11 项）与 **`--space-*`** 对齐；§2.0、§2.5、Design scale、`tokens/README` 同步 |
| 2026-03-25 | **`spacing/*`** 并入 **`Shape`** 集合（原独立 **`spacing`** 集合已删）；§2.0、§2.5、Design scale、`tokens/README`、`tokens.css` 头注释同步 |
| 2026-03-25 | **间距命名**：Figma **`space/s0`…`space/s10`**、CSS **`--space-s0`…`--space-s10`**（**s** = 阶梯，≠ px）；与 **`Corner/{px}`** 规则区分；§2.4–§2.8、§6、`tokens.css`、示例页、skills 同步 |
