# Design tokens（`tokens/tokens.css`）

与 Figma **📖One2X Design System**（`fileKey` `wHNBqjzSQZM8a4DlyBIDqW`）对齐的网页落盘。**新建页面须用变量**，避免手写裸 `px` 字号或间距。

## 主题（深 / 浅）

- **默认**：`:root` = Medeo light；**`prefers-color-scheme: dark`** 且无 `data-theme="light"` 时切到 Medeo dark 色。
- **强制**：`<html data-theme="dark">` 或 `data-theme="light"` 覆盖系统。

## 颜色

| Figma | CSS 变量 |
|--------|----------|
| `Schemes/Primary` | `--color-schemes-primary` |
| `Schemes/On Primary` | `--color-schemes-on-primary` |
| `Surface/Surface` | `--color-surface-surface` |
| `Surface/On Surface` | `--color-surface-on-surface` |
| … | 见 `tokens.css` |

**主 CTA（Filled）**：`background: var(--color-schemes-primary)`，`color: var(--color-schemes-on-primary)`。详见根目录 **`design.md` §1.1**。

## 圆角

| Figma（`Shape`） | CSS |
|-------------------|-----|
| **`Corner/0`、`Corner/4` … `Corner/40`、`Corner/6`、`Corner/Full`** | `var(--shape-radius-0)` … `var(--shape-radius-full)`（名中数字 **= 半径 px**） |

稿内仅 **`Corner/*`** 这一组；**`Radius/*`** 不使用。

## 字族与字阶（Typescale 节选）

页面需 **加载 Manrope、Nohemi**（如 Google Fonts），否则仅回退到系统字体。

| Figma 样式 | CSS（节选） | 或组合类 |
|------------|-------------|----------|
| `label/medium` | `--type-label-medium-size` 等 | `.o2x-type-label-medium` |
| `label/large` | `--type-label-large-*` | `.o2x-type-label-large` |
| `title/medium` | `--type-title-medium-*` | `.o2x-type-title-medium` |

字族：**`--font-family-plain`**（Manrope）、**`--font-family-brand`**（Nohemi）。

## 间距（Figma **`Shape`** · **`space/s*`**）

**与圆角命名规则不同**：间距为 **阶梯代号**（**`s` = step**），**名中数字 ≠ px**。

| Figma | CSS | 实际值 |
|--------|-----|--------|
| `space/s0` | `--space-s0` | 0 |
| `space/s1` | `--space-s1` | 4px |
| `space/s2` | `--space-s2` | 8px |
| `space/s3` | `--space-s3` | 12px |
| `space/s4` | `--space-s4` | 16px |
| `space/s5` | `--space-s5` | 20px |
| `space/s6` | `--space-s6` | 24px |
| `space/s7` | `--space-s7` | 32px |
| `space/s8` | `--space-s8` | 40px |
| `space/s9` | `--space-s9` | 48px |
| `space/s10` | `--space-s10` | 64px |

### 消费稿里 Auto Layout 要绑 `space/s*` 时（库发布）

`importVariableByKeyAsync` **只能拉取「已发布到团队库」的变量**。若主库 **`Shape`** 集合里虽有 `space/s0`…`space/s10`，但**发布库时未包含间距变量**，其它文件里会出现 **间距无法 import、只能手写 px** 的现象。请在 📖One2X 主库 **发布库** 时把 **`Shape`** 中的 **`space/s*`** 一并纳入（与 `Corner/*` 同级），消费稿即可对 `padding*`、`itemSpacing` 等使用 **`setBoundVariable`** 绑定 FLOAT 变量。可用插件侧 `figma.teamLibrary.getVariablesInLibraryCollectionAsync(Shape 集合 key)` 核对发布结果里是否出现 `space/s*`。

## 全量 Figma 变量

`Color` 等集合有数百项；`tokens.css` 只收录实现常用子集。全量请用 Figma Variables 面板或 MCP `use_figma` 导出。
