# One2X Skill Visualizer

一个本地运行的**可视化预览器**（只读）。它不是编辑器：作用是把 One2X 设计技能在讲的东西——颜色、字阶、圆角、间距、动效——直接渲染成能亲眼看、可播放的真实样例。

数据实时读自仓库内的 `tokens/tokens.css` 与各 `.cursor/skills/*/SKILL.md`，所以预览始终与技能同步。

## 启动

需要 Node 18+，零依赖。在仓库根目录执行：

```bash
node skill-editor/server.mjs
```

然后打开终端里提示的地址（默认 `http://localhost:4178`）。换端口：`PORT=5000 node skill-editor/server.mjs`。

## 看得到什么

- **概览**：每个 Skill 的名称与描述卡片（读自 `SKILL.md` frontmatter）。
- **颜色**：按组渲染的色板，实时色值，支持浅 / 深色切换。
- **字体排印**：每个字阶的真实文字样例，标注字号 / 行高 / 字重。
- **圆角**：每个 `Radius/*` 用对应 token 画出真实方块，标注像素。
- **间距**：每个 `s0…s10` 画成真实长度的紫条并标注像素（强调 s 是阶梯档，不是像素）。
- **动效**：缓动曲线、入场 Before/After、时长尺度、reduced-motion，全部**真实播放**，进入视口自动演示，可点「重播」。

## 实现说明

- 后端只提供两个只读接口：`/api/list`（列文件）与 `/api/file`（读单个文件），并做了路径越界校验。
- `tokens.css` 被注入页面，预览自身也吃 One2X 变量（dogfooding）。
- 纯本地工具，监听 `localhost`，不要暴露公网。
