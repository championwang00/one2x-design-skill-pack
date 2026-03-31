# One2X 设计系统 · Cursor Skills

同事首次接触本包时，**优先看仓库根目录 `README.md`**（怎么用、去哪里下载、适用场景、更新去哪里看）；本文档只负责说明 **skill 内部分工**、**最小拷贝清单**、**安装与排错**。

---

## 1. Skill 分工

### Figma 官方（来自 [figma/mcp-server-guide](https://github.com/figma/mcp-server-guide/tree/main/skills)）

| 目录 | 用途 |
|------|------|
| **figma-use** | 任意 **`use_figma`** 调用前必读；Plugin API 规则与坑见 `references/`。 |
| **figma-generate-design** | **整页 / 多区块**从已发布设计系统搜组件、拼界面时用。 |

### One2X 自建

| 目录 | 用途 |
|------|------|
| **one2x-design-system** | 写代码、对稿、Review：读根目录 **`design.md`**，对齐 Token / 字体 / 组件；不强制改 Figma。 |
| **web-animation-design** | 过渡、动效、缓动、时长、`prefers-reduced-motion`；**与 one2x-design-system 配套**，涉及动效时一并加载。 |
| **one2x-figma-workflow** | 用 MCP **在 Figma 里建稿/改稿**：固定 **`fileKey` = `wHNBqjzSQZM8a4DlyBIDqW`**，并叠加官方 skill + **`design.md`**。 |

### Token 命名（与 `design.md` §2 一致，避免混用）

| 类别 | Figma（均在 **`Shape` · Baseline**） | Web（`tokens.css`） | 含义 |
|------|--------------------------------------|---------------------|------|
| 圆角 | **`Radius/{px}`**、**`Radius/Full`** | **`--shape-radius-{px}`**、**`full`** | 名中数字 **= 半径像素** |
| 间距 | **`space/s0`…`space/s10`** | **`--space-s0`…`--space-s10`** | **`s`** = 阶梯档，**≠** px；查表见 **`design.md` §2.5** |

新稿优先 **`--shape-radius-*`**、**`--space-s*`**。`tokens.css` 中 **`--shape-corner-*`** 仅为与旧 Figma 名对照的别名；**`--space-0` 式命名**已替换为 **`--space-s0`…**（见 §2.5）。

---

## 2. 给同事的最小拷贝清单

| 路径 | 说明 |
|------|------|
| `design.md` | 规范全文（链接、`fileKey`、Design scale、Token、组件）。 |
| `tokens/` | Web 与 Figma 对齐时用（`tokens.css`、`README.md`）。 |
| `.cursor/skills/figma-use/` | 官方，必带（若用 `use_figma`）。 |
| `.cursor/skills/figma-generate-design/` | 经常整屏搭进 Figma 时带。 |
| `.cursor/skills/one2x-design-system/` | One2X 规范入口。 |
| `.cursor/skills/web-animation-design/` | 动效（与 one2x-design-system 配套）。 |
| `.cursor/skills/one2x-figma-workflow/` | 在 Figma 里干活时的打包入口。 |

对方需在 Cursor **启用 Figma MCP**，且账号能访问 **📖One2X Design System** 文件。

---

## 3. 安装步骤（目标仓库）

1. 将上表中的 **`.cursor/skills/` 子目录** 合并到对方项目的 `.cursor/skills/`。  
2. 将 **`design.md`**、`tokens/` 放到对方仓库根目录（或约定路径；若改路径，需调整 skill 内指向 `design.md` 的相对链接）。  
3. **只维护 `design.md`（小写）**：在 macOS 默认磁盘上 **`DESIGN.md` 与 `design.md` 同一文件**，另存别名会覆盖正文。

---

## 4. 更新与同步

- Figma 大版本后：对照 Variables 面板或 **`use_figma`** 枚举 **`Color` / `Shape` / `Typescale` 等**；**`Shape`** 内含 **`Radius/*`**（圆角）与 **`space/s*`**（**勿**再单独建第二套圆角集合或离散的 **`spacing`** 集合）。同步 **`design.md`** §2.0、§2.4–§2.5 与 **`tokens/tokens.css`**。  
- 官方 skill 更新：从 [mcp-server-guide/skills](https://github.com/figma/mcp-server-guide/tree/main/skills) 覆盖 `figma-use`、`figma-generate-design`。

---

## 5. Figma MCP 返回 504？

| 原因 | 对策 |
|------|------|
| **`use_figma` 脚本过重** | 勿在超大文件里**全 Page `findAll`**；只用变量 API 或单页查询。 |
| 瞬时超时 | 稍后重试；先 **`whoami`** 确认 MCP 可用。 |

根目录 **`design.md`** 的 **Design scale** 节也有简要说明。
