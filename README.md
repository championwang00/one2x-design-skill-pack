# One2X Design Skill Pack

面向 One2X / Medeo 团队的 Cursor Skill 打包：包含 **前端实现规范**、**Figma MCP 工作流**、**设计 Token 落盘** 与 **动效补充规则**。

## 这是什么

这是一套给团队复用的 One2X 设计系统辅助包，目标是让同事在 **写前端页面**、**对齐 Figma**、**用 MCP 改 Figma** 时，遵循同一份设计规范与 Token 命名。

仓库内主要内容：

| 路径 | 作用 |
|------|------|
| `design.md` | One2X 设计系统唯一正文规范。 |
| `tokens/` | Web 侧设计 Token（颜色、字阶、间距、圆角）。 |
| `.cursor/skills/one2x-design-system/` | 前端页面实现 / Review 入口。 |
| `.cursor/skills/web-animation-design/` | 动效、过渡、缓动、可访问性补充。 |
| `.cursor/skills/one2x-figma-workflow/` | 在 Figma 里用 MCP 建稿 / 改稿入口。 |
| `.cursor/skills/figma-use/` | 官方 `use_figma` 必读规则。 |
| `.cursor/skills/figma-generate-design/` | 官方整页搭界面流程。 |

## 去哪里下载

Git 仓库地址：

- 仓库地址：`https://github.com/championwang00/one2x-design-skill-pack`
- 下载方式：
  1. 直接 `git clone https://github.com/championwang00/one2x-design-skill-pack.git`
  2. 或在 Git 页面下载 ZIP

如果这是公司内部仓库，也可以在团队文档里直接贴该仓库链接。

## 同事怎么用

### 1. 安装到项目

把以下内容放进目标项目：

- `design.md`
- `tokens/`
- `.cursor/skills/figma-use/`
- `.cursor/skills/figma-generate-design/`
- `.cursor/skills/one2x-design-system/`
- `.cursor/skills/web-animation-design/`
- `.cursor/skills/one2x-figma-workflow/`

若对方项目目录不同，需同步调整 skill 内指向 `design.md` 的相对路径。

### 2. 在什么场景用哪个 skill

| 场景 | 使用 |
|------|------|
| 写 One2X / Medeo 前端页面 | `one2x-design-system` |
| 页面里涉及动效、过渡、hover、入场出场 | `one2x-design-system` + `web-animation-design` |
| 用 MCP 在 Figma 里改稿、建稿、绑变量、拼整页 | `one2x-figma-workflow` |
| 直接写 `use_figma` 脚本 | `figma-use` |
| 在 Figma 里从设计系统拼整页 / 多区块 | `figma-use` + `figma-generate-design` |

### 3. 默认规则

- **前端实现**：以 `design.md` + `tokens/tokens.css` 为准。
- **颜色 / 字阶 / 字族**：`--color-*`、`--type-*`、`--font-family-*`。
- **圆角**：`--shape-radius-*`；Figma **`Shape`** · **`Corner/{px}`**（名字里的数字 **= 半径 px**）。
- **间距**：`--space-s0` … `--space-s10`；Figma **`Shape`** · **`space/s0`…`space/s10`**（**`s`** = 阶梯档，**≠** 像素；勿与圆角「名=px」混用）。详见 **`design.md` §2.4–§2.5**。
- **主行动按钮**：默认遵循 `design.md` §1.1。
- **涉及 Figma MCP**：需启用 Figma MCP，并确保账号可访问 **📖One2X Design System** 文件。

## 适用场景

适合这些情况：

- 从设计系统快速生成或实现新页面
- 让 Agent / 同事按统一 Token 写页面，不再手写裸 hex / px
- 从 Figma 对稿后，把代码收敛回 One2X 设计系统命名
- 用 MCP 在 Figma 中补变量、替换组件、拼整页
- 做动效时统一缓动、时长与 `prefers-reduced-motion`

不适合这些情况：

- 非 One2X / Medeo 体系项目
- 完全不使用 Cursor Skills 的团队
- 只想拿一个独立 CSS 文件，不打算带上规范与 skill

## 更新后去哪里看

当前建议统一在 Git 上看更新：

- **变更记录**：`CHANGELOG.md`
- **代码差异**：Git 提交记录 / Pull Request
- **规范更新**：`design.md`
- **Token 更新**：`tokens/tokens.css`
- **Skill 更新**：`.cursor/skills/`

- 更新记录：`https://github.com/championwang00/one2x-design-skill-pack/blob/main/CHANGELOG.md`
- 提交记录：`https://github.com/championwang00/one2x-design-skill-pack/commits/main`

## 推荐发布方式

首次发布建议至少做这几件事：

1. 将当前内容提交并推送到 `https://github.com/championwang00/one2x-design-skill-pack`。
2. 打一个初始版本标签，例如 `v0.1.0`。
3. 在 `CHANGELOG.md` 记录首发内容。
4. 在团队群或文档里发这 4 个信息：
   - 这是什么
   - 去哪里下载
   - 在什么场景用哪个 skill
   - 更新去哪里看

## 补充说明

- macOS 默认磁盘上 **`DESIGN.md` 与 `design.md` 视为同一文件**，请只维护 `design.md`。
- `.cursor/skills/README.md` 更偏 **skill 分工、Token 命名摘要、安装与排错**；同事首次接触时，优先看本 README，再按需打开该文件。
- 完整 Token 表与 Figma 对照：**`design.md`**（**Design scale**、**§2**）。
