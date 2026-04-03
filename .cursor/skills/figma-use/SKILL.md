---
name: figma-use
description: "**MANDATORY prerequisite** — 在每一次调用 `use_figma` 之前，都必须先加载这个 skill。NEVER 直接在未加载本 skill 的情况下调用 `use_figma`；否则很容易出现常见但难排查的失败。触发场景：凡是用户要在 Figma 文件上下文里执行需要 JavaScript 的写操作，或需要程序化读取的特殊读操作，例如 create/edit/delete nodes、set up variables or tokens、build components and variants、modify auto-layout or fills、bind variables to properties、或 inspect file structure programmatically。"
disable-model-invocation: false
---

# use_figma — Figma Plugin API Skill

通过 `use_figma` MCP 在 Figma 文件里用 Plugin API 执行 JavaScript。更详细的参考资料都在 `references/` 目录中。

**调用 `use_figma` 时始终传 `skillNames: "figma-use"`。** 这是一个用于记录 skill 使用情况的日志参数，**不会影响执行结果**。

**如果任务是从代码在 Figma 中搭建或更新整页、完整 screen，或多区块布局**，还要同时加载 [figma-generate-design](../figma-generate-design/SKILL.md)。它负责通过 `search_design_system` 发现设计系统组件、导入组件，并按增量方式拼装 screen。两个 skill 是配套使用的：这个 skill 负责 API 规则，那个 skill 负责整页构建流程。

开始前，先读 [plugin-api-standalone.index.md](references/plugin-api-standalone.index.md) 了解 API 能力范围。遇到需要写 plugin API 代码时，再基于这个索引去 grep [plugin-api-standalone.d.ts](references/plugin-api-standalone.d.ts) 中相关的类型、方法和属性。它是 API surface 的最终权威来源。这个 typings 文件很大，不要一次性全读，按需 grep 相关片段即可。

IMPORTANT：只要任务涉及 design system，就先从 [working-with-design-systems/wwds.md](references/working-with-design-systems/wwds.md) 开始，理解在 Figma 中处理设计系统的核心概念、流程和约束。之后再按需加载更具体的 components、variables、text styles、effect styles 参考文档。

## 1. 关键规则

1.  **用 `return` 把数据返回出来。** 返回值会自动做 JSON 序列化（objects、arrays、strings、numbers）。不要调用 `figma.closePlugin()`，也不要把代码包进 async IIFE，这些外层包装已经替你处理好了。
2.  **写普通 JavaScript，直接用顶层 `await` 和 `return`。** 代码会自动运行在 async context 里。不要再手动包 `(async () => { ... })()`。
3.  `figma.notify()` **会抛 `"not implemented"`**，不要使用。
3a. `getPluginData()` / `setPluginData()` 在 `use_figma` 中**不支持**，不要使用。改用 `getSharedPluginData()` / `setSharedPluginData()`（这两个支持），或者通过 `return` 返回 node IDs，在后续调用中继续传递。
4.  `console.log()` **不会返回给 agent**，输出请使用 `return`。
5.  **小步增量操作。** 大任务拆成多个 `use_figma` 调用，每一步之后都做验证。这是避免 bug 最重要的一条。
6.  颜色值使用 **0–1 区间**，不是 0–255：`{r: 1, g: 0, b: 0}` 表示红色。
7.  fills / strokes 是**只读数组**，要先 clone，再修改，再整体重新赋值。
8.  任何文字操作之前，**MUST 先加载字体**：`await figma.loadFontAsync({family, style})`
9.  **页面内容是增量加载的**，切页并加载内容必须用 `await figma.setCurrentPageAsync(page)`（见下方 Page Rules）。
10. `setBoundVariableForPaint` 返回的是一个**新的** paint，必须接住并重新赋值。
11. `createVariable` 可以接 collection **对象**或 **ID 字符串**，但更推荐传对象。
12. **`layoutSizingHorizontal/Vertical = 'FILL'` 必须在 `parent.appendChild(child)` 之后设置。** 提前设置会抛错。对非 auto-layout 节点上的 `'HUG'` 也一样。
13. **新的顶层节点不要放在 `(0,0)`。** 直接 append 到 page 的节点默认都会堆在 `(0,0)`。应扫描 `figma.currentPage.children`，找到一个空位置，例如放到当前最右侧节点的右边。这个规则只适用于 page 顶层节点；嵌套在 frame 或 auto-layout 容器里的节点由父级控制定位。详见 [Gotchas](references/gotchas.md)。
14. **`use_figma` 报错时，先停下，不要立刻重试。** 失败脚本是**原子性的**：一旦报错，整段脚本不会执行，文件也不会发生任何变更。先认真看报错，再修脚本，然后再试。见 [Error Recovery](#6-error-recovery--self-correction)。
15. **MUST `return` 所有创建或修改过的 node IDs。** 只要脚本创建了新节点或改动了画布上已有节点，就要把所有受影响的 node ID 收集起来，并以结构化对象返回（例如 `return { createdNodeIds: [...], mutatedNodeIds: [...] }`）。这样后续调用才能引用、校验、或清理这些节点。
16. **创建变量时始终显式设置 `variable.scopes`。** 默认的 `ALL_SCOPES` 会污染几乎所有属性选择器，通常都不是你想要的。应该使用具体 scope，比如背景色用 `["FRAME_FILL", "SHAPE_FILL"]`，文字颜色用 `["TEXT_FILL"]`，间距用 `["GAP"]`。完整列表见 [variable-patterns.md](references/variable-patterns.md)。
17. **每一个 Promise 都要 `await`。** 不要留下未 `await` 的异步调用。像 `figma.loadFontAsync(...)` 或 `figma.setCurrentPageAsync(page)` 如果不 `await`，就会变成 fire-and-forget，引发静默失败或竞争条件。脚本可能在异步操作完成前就提前 `return`，导致数据缺失或只执行了一半。

> 每条规则的 WRONG / CORRECT 详细示例见 [Gotchas & Common Mistakes](references/gotchas.md)。

## 2. 页面规则（Critical）

**`use_figma` 的每次调用之间，page context 都会重置。** 每次开始时，`figma.currentPage` 都会回到第一个 page。

### 切换页面

切换页面并加载该页面内容时，必须使用 `await figma.setCurrentPageAsync(page)`。同步写法 `figma.currentPage = page` 在 `use_figma` 运行时里**会直接报错**。

```js
// Switch to a specific page (loads its content)
const targetPage = figma.root.children.find((p) => p.name === "My Page");
await figma.setCurrentPageAsync(targetPage);
// targetPage.children is now populated

// Iterate over all pages
for (const page of figma.root.children) {
  await figma.setCurrentPageAsync(page);
  // page.children is now loaded — read or modify them here
}
```

### 跨脚本调用

每次新的 `use_figma` 调用开始时，`figma.currentPage` 都会重置到**第一个 page**。如果你的工作流需要跨多次调用，并且目标不是默认 page，那么每次调用开头都要先执行 `await figma.setCurrentPageAsync(page)`。

你可以多次调用 `use_figma`，基于当前文件状态做增量构建，或者先读信息、再写改动。例如先写一个只读脚本获取已有节点的 metadata，用 `return` 把结果带回来，再在下一次脚本里据此修改这些节点。

## 3. `return` 是唯一输出通道

agent **只能看到**你 `return` 的值，其他东西它都看不到。

- **返回 IDs（CRITICAL）**：任何创建或修改 canvas 节点的脚本都**必须**返回所有受影响的 node IDs，例如 `return { createdNodeIds: [...], mutatedNodeIds: [...] }`。这不是建议，而是硬性要求。
- **汇报进度**：`return { createdNodeIds: [...], count: 5, errors: [] }`
- **错误信息**：抛出的错误会自动被捕获并返回，直接让错误冒泡或显式 `throw` 即可。
- `console.log()` 输出**永远不会**返回给 agent。
- 始终返回可操作的数据，例如 IDs、counts、status，方便后续调用继续引用这些对象。

## 4. 编辑器模式

`use_figma` 工作在 **design mode**（`editorType` 为 `"figma"`，也是默认值）。FigJam（`"figjam"`）可用节点类型不同，大部分 design 节点在那里都不可用。

design mode 可用节点类型：Rectangle、Frame、Component、Text、Ellipse、Star、Line、Vector、Polygon、BooleanOperation、Slice、Page、Section、TextPath。

design mode **不可用**：Sticky、Connector、ShapeWithText、CodeBlock、Slide、SlideRow、Webpage。

## 5. 增量工作流（How to Avoid Bugs）

最常见的 bug 来源，是试图在一次 `use_figma` 调用里做太多事。**正确做法是小步前进，并且每一步之后都验证。**

### 推荐模式

1. **先 inspect。** 在创建任何东西之前，先跑一个只读的 `use_figma`，搞清楚文件里已经有什么：pages、components、variables、命名习惯等。先对齐现状，再开始写。
2. **每次调用只做一件事。** 这次建 variables，下次建 components，再下一次组装 layout。不要试图一段脚本做完整个 screen。
3. **每次都返回 IDs。** 每次调用都要把 created node IDs、variable IDs、collection IDs 等以对象形式 `return` 回来（例如 `return { createdNodeIds: [...] }`）。后续步骤会依赖这些数据。
4. **每一步后都验证。** 用 `get_metadata` 检查结构（数量、名称、层级、位置），在关键里程碑后用 `get_screenshot` 检查视觉结果。
5. **有问题先修，再继续。** 一旦验证发现问题，先修好再进入下一步，不要在坏基础上继续往上搭。

### 复杂任务的建议步骤

```
Step 1: Inspect file — discover existing pages, components, variables, conventions
Step 2: Create tokens/variables (if needed)
       → validate with get_metadata
Step 3: Create individual components
       → validate with get_metadata + get_screenshot
Step 4: Compose layouts from component instances
       → validate with get_screenshot
Step 5: Final verification
```

### 每一步应该验证什么

| 在什么之后 | 用 `get_metadata` 检查 | 用 `get_screenshot` 检查 |
|---|---|---|
| 创建 variables 后 | Collection 数量、variable 数量、mode 名称 | — |
| 创建 components 后 | 子节点数量、variant 名称、property 定义 | variants 是否可见、是否折叠、排列是否清晰 |
| 绑定 variables 后 | 节点属性是否体现绑定结果 | 颜色 / token 是否正确解析 |
| 组装 layouts 后 | instance 节点是否有 `mainComponent`、层级是否正确 | 是否有文字裁切、元素重叠、间距错误 |

## 6. 错误恢复与自我纠正

**`use_figma` 具有原子性，失败脚本不会产生部分执行。** 如果脚本报错，文件不会发生任何修改，状态与调用前完全一致。也就是说，不会留下半拉子节点，也不会生成失败脚本的 orphaned elements；修好后再重试是安全的。

### 当 `use_figma` 返回错误时

1. **先停下。** 不要立刻改代码重试。
2. **认真读错误信息。** 先搞清楚到底错在哪：API 用错、字体没加载、属性值非法，还是别的问题。
3. **如果错误信息不够清楚**，调用 `get_metadata` 或 `get_screenshot` 了解当前文件状态。
4. **根据错误信息修脚本。**
5. **再重试**修正后的脚本。

### 常见自我纠正模式

| 错误信息 | 可能原因 | 修法 |
|---|---|---|
| `"not implemented"` | 用了 `figma.notify()` | 删掉它，改用 `return` 输出 |
| `"node must be an auto-layout frame..."` | 在 append 到 auto-layout 父级前就设置了 `FILL` / `HUG` | 先 `appendChild`，再设置 `layoutSizingX = 'FILL'` |
| `"Setting figma.currentPage is not supported"` | 用了同步 page setter | 改用 `await figma.setCurrentPageAsync(page)` |
| Property value out of range | 颜色通道值 > 1（把 0–255 当成 0–1 用了） | 除以 255 |
| `"Cannot read properties of null"` | 节点不存在（ID 错了，或 page 不对） | 检查 page context，确认 ID |
| Script hangs / no response | 死循环，或 Promise 没处理完 | 查 `while(true)`、缺失的 `await`，确保脚本能终止 |
| `"The node with id X does not exist"` | 子节点执行 `detachInstance()` 时把父 instance 隐式 detach 了，导致 IDs 变化 | 从稳定的非 instance 父 frame 重新遍历发现节点 |

### 当脚本成功了，但结果看起来不对

1. 调用 `get_metadata` 检查结构是否正确（层级、数量、位置）。
2. 调用 `get_screenshot` 检查视觉是否正确。重点盯住文字裁切、行高截断、元素重叠等常见但容易漏掉的问题。
3. 判断偏差属于哪类问题：结构错误（层级不对、节点缺失）还是视觉错误（颜色不对、布局错位、内容裁切）。
4. 写一个**只修改问题部分**的定向修复脚本，不要整段推倒重来。

> 完整验证流程见 [Validation & Error Recovery](references/validation-and-recovery.md)。

## 7. 提交前检查清单

在提交任何 `use_figma` 调用前，确认：

- [ ] 代码使用 `return` 返回结果（不是 `figma.closePlugin()`）
- [ ] 代码**没有**再包一层 async IIFE（系统会自动包装）
- [ ] `return` 中带有结构化、可继续使用的信息（IDs、counts 等）
- [ ] 全文**没有**任何 `figma.notify()` 用法
- [ ] **没有**把 `console.log()` 当输出通道（请用 `return`）
- [ ] 所有颜色都使用 0–1 区间（不是 0–255）
- [ ] fills / strokes 是重新赋值的新数组（不是原地改）
- [ ] 切页使用 `await figma.setCurrentPageAsync(page)`（同步 setter 会报错）
- [ ] `layoutSizingVertical/Horizontal = 'FILL'` 是在 `parent.appendChild(child)` **之后**设置的
- [ ] 任何文本属性改动前都先调用了 `loadFontAsync()`
- [ ] `lineHeight` / `letterSpacing` 使用 `{unit, value}` 格式（不是裸数字）
- [ ] `resize()` 在设置 sizing modes **之前**调用（因为 `resize()` 会把 sizing 重置成 FIXED）
- [ ] 多步工作流里，上一步返回的 IDs 是作为字符串字面量传入后续调用的（不是依赖运行时变量）
- [ ] 新顶层节点不会堆在 `(0,0)` 与已有内容重叠
- [ ] 所有创建 / 修改过的 node IDs 都已经收集并包含在 `return` 中
- [ ] 每一个异步调用（`loadFontAsync`、`setCurrentPageAsync`、`importComponentByKeyAsync` 等）都已 `await`，不存在 fire-and-forget Promise

## 8. 创建前先发现文件约定

**在创建任何内容之前，先检查当前 Figma 文件。** 不同文件会有不同的命名规则、variable 结构和 component pattern。你的代码应该对齐文件现状，而不是强行引入新的命名和结构。

只要对命名、scope、结构有疑问，优先先查 Figma 文件，再查用户代码库。只有在两边都没有现成约定时，才退回到通用模式。

### 快速检查脚本

**列出所有 pages 与顶层节点：**
```js
const pages = figma.root.children.map(p => `${p.name} id=${p.id} children=${p.children.length}`);
return pages.join('\n');
```

**列出所有 pages 中已有的 components：**
```js
const results = [];
for (const page of figma.root.children) {
  await figma.setCurrentPageAsync(page);
  page.findAll(n => {
    if (n.type === 'COMPONENT' || n.type === 'COMPONENT_SET')
      results.push(`[${page.name}] ${n.name} (${n.type}) id=${n.id}`);
    return false;
  });
}
return results.join('\n');
```

**列出现有 variable collections 及其约定：**
```js
const collections = await figma.variables.getLocalVariableCollectionsAsync();
const results = collections.map(c => ({
  name: c.name, id: c.id,
  varCount: c.variableIds.length,
  modes: c.modes.map(m => m.name)
}));
return results;
```

## 9. 参考文档

根据任务内容按需加载这些文档：

| 文档 | 何时加载 | 内容 |
|-----|-------------|----------------|
| [gotchas.md](references/gotchas.md) | 任何 `use_figma` 之前 | 已知坑点总表，含 WRONG / CORRECT 代码示例 |
| [common-patterns.md](references/common-patterns.md) | 需要可直接套用的代码示例时 | 脚本骨架：shapes、text、auto-layout、variables、components、多步工作流 |
| [plugin-api-patterns.md](references/plugin-api-patterns.md) | 创建 / 编辑节点时 | fills、strokes、Auto Layout、effects、grouping、cloning、styles |
| [api-reference.md](references/api-reference.md) | 需要精确 API 范围时 | 节点创建、variables API、核心属性、哪些可用 / 不可用 |
| [validation-and-recovery.md](references/validation-and-recovery.md) | 多步写入或错误恢复时 | `get_metadata` 与 `get_screenshot` 的使用分工、强制错误恢复步骤 |
| [component-patterns.md](references/component-patterns.md) | 创建 components / variants 时 | `combineAsVariants`、component properties、`INSTANCE_SWAP`、variant 布局、发现现有组件、metadata 遍历 |
| [variable-patterns.md](references/variable-patterns.md) | 创建 / 绑定 variables 时 | collections、modes、scopes、aliasing、binding patterns、发现现有 variables |
| [text-style-patterns.md](references/text-style-patterns.md) | 创建 / 应用 text styles 时 | 字阶体系、字体探测、列出样式、将样式应用到节点 |
| [effect-style-patterns.md](references/effect-style-patterns.md) | 创建 / 应用 effect styles 时 | 阴影、列出样式、将样式应用到节点 |
| [plugin-api-standalone.index.md](references/plugin-api-standalone.index.md) | 需要理解完整 API 面时 | Plugin API 中所有类型、方法、属性的索引 |
| [plugin-api-standalone.d.ts](references/plugin-api-standalone.d.ts) | 需要精确类型签名时 | 完整 typings 文件，按符号 grep，不要一次全读 |

## 10. Snippet 示例

这套文档里会穿插很多 snippets。它们包含可复用的 plugin API 代码，可以直接拿来用，也可以作为起手模板。如果遇到某些关键概念，最适合用通用 snippet 来表达，就把它们整理出来并落盘，方便以后复用。
