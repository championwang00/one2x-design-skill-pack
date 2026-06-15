# Selection-Driven Property Naming Design

## Goal

将 One2X Naming 从固定配置表单改造成选择驱动的上下文工具，并增加对 Component / Component Set 的 Property 名与 Variant Value 的整组优化能力。

## Product Behavior

### Empty Selection

当 Figma 中没有选中对象时，插件保留现有批量入口：

- 当前 Page 优化。
- 整个文件优化。
- Page、Section、组件、实例与普通图层的批量命名分析。

批量入口是空状态下的主要内容，不在有选择时占用首屏空间。

### Selection-Driven Context

插件监听 `selectionchange`，根据当前选区实时计算可用能力。选择变化后，面板重新渲染对应能力卡片：

| 选中对象 | 显示能力 |
| --- | --- |
| Section | Section 名称、Section 内部图层 |
| Component Set | Component Set 名称、Property / Value、内部图层 |
| Component（独立） | Component 名称、Property、内部图层 |
| Component（Variant） | 自动提升到所属 Component Set；显示整组名称、Property / Value、内部图层 |
| Frame / Group / Text / Shape 等普通节点 | 当前节点名称、存在时的子图层 |
| 混合选择 | 合并所有适用能力；每类能力显示影响对象数 |

同一个 Component Set 即使通过多个 Variant 被重复选中，也只处理一次。

### Capability Controls

每种能力以独立卡片显示，默认勾选，用户可以在分析前关闭：

- 对象名称。
- Section 名称。
- Component Property / Value。
- 内部图层。

主操作仍为“分析命名”。分析结果沿用可逐条编辑的预览列表，统一应用并支持撤销最近一次批量操作。

## One2X Property Rules

### Property Names

- 通用 Property：`camelCase`，例如 `labelText`、`size`、`state`。
- Boolean 结构属性：`has` 或 `show` + PascalCase，例如 `hasStart`、`showRMBPrice`。
- Boolean 状态属性：直接使用状态语义，例如 `loading`、`disabled`。
- Instance Swap：若由 `hasXXX` 控制显隐，名称使用去掉 `has` 后的小驼峰，例如 `hasStart` 对应 `start`。
- 避免不明缩写；沿用现有缩写展开表。
- Property 名在同一 Component / Component Set 内必须唯一。

Figma 为 BOOLEAN、TEXT、INSTANCE_SWAP、SLOT Property 的内部 key 添加 `#...` 唯一后缀。规则引擎只规范化可见名称，执行时保留并使用完整旧 key 调用 `editComponentProperty`，不自行拼接后缀。

### Values

- Variant 状态值使用全小写：`default`、`hovered`、`focused`、`pressed`、`loading`、`disabled`。
- Variant 布局与类型值使用全小写：`vertical`、`horizontal`、`filled`、`outline`。
- Boolean Variant 仅使用 `true` / `false`，将 `yes` / `no` 规范化。
- 多词 Value 使用 `camelCase`，不混用空格、下划线和大小写。
- 同一 Property 的 Value 必须唯一；归一化后发生冲突时不自动应用，改为显示冲突警告。
- TEXT Property 的默认文案和 INSTANCE_SWAP 的组件引用不是枚举 Value，不进行语义改写。

### Component Set Scope

选中任一 Variant 时，Property 与 Value 优化始终提升到整个 Component Set：

1. 从选中 Component 向上找到 `COMPONENT_SET`。
2. 读取该 Set 的 `componentPropertyDefinitions`。
3. 读取全部 Variant Component 的组合名称与属性值。
4. 生成整组 Property / Value 变更计划。
5. 检查每个 Variant 组合在改名后仍唯一。

## Architecture

现有 `code.js` 同时负责选择解析、分析、应用和撤销，`ui.html` 同时负责固定配置与结果渲染。本次按职责拆分：

### `src/naming-core.mjs`

保留纯字符串规则，新增：

- `normalizePropertyName(name, type)`。
- `normalizeVariantValue(value, propertyName)`。
- `planComponentPropertyRenames(componentModel)`。
- Property / Value 冲突检测。

该模块不依赖 Figma API，可由 Node 测试直接覆盖。

### `src/selection-context.mjs`

接收纯节点模型，输出去重后的上下文：

- `mode: "empty" | "selection"`。
- `sections`。
- `componentSets`。
- `standaloneComponents`。
- `layers`。
- 可用 capability 与影响数量。

Figma 节点到纯模型的转换留在主线程适配层，确保上下文规则可测试。

### `src/change-planner.mjs`

根据选择上下文和启用的 capability 合并变更：

- Node rename。
- Component Property rename。
- Variant Value rename。
- Warning / conflict。

统一 proposal 结构：

```js
{
  kind: 'NODE_NAME' | 'COMPONENT_PROPERTY' | 'VARIANT_VALUE',
  ownerId: 'component-or-set-id',
  targetId: 'node-id-or-property-key',
  before: 'oldName',
  after: 'newName',
  reason: 'One2X rule',
}
```

### `src/figma-adapter.js`

负责所有 Figma 写操作：

- 解析当前选区并定位 Component Set。
- 调用 `editComponentProperty` 重命名 Property。
- 重写 Component Set 内 Variant Component 的组合名称以更新 Value。
- 修改普通节点 `name`。
- 记录撤销快照。

Property 改名使用 `editComponentProperty` 返回的新完整 key。Variant Value 通过解析并重建各 Variant 的 `property=value` 组合名处理，因为 `variantProperties` 为只读。

### `src/code.js`

缩减为消息编排：

- 发布选择上下文。
- 请求 planner 分析。
- 请求 adapter 应用或撤销。
- 向 UI 发布结果和错误。

### `src/ui.html`

由固定表单改为动态上下文面板：

- 空选择渲染批量配置。
- 有选择渲染 capability 卡片。
- 混合选择合并能力和数量。
- 预览列表支持 Node、Property、Value 三种类型。

UI 继续使用仓库 `tokens/tokens.css`，低强调边框使用 `Surface/On Surface Variant` 0.5px，圆角和间距使用 One2X token。

## Apply Ordering And Undo

应用顺序：

1. 验证所有 proposal，阻止空名称、重复 Property 和重复 Variant 组合。
2. 保存 Component / Component Set 的 Property 定义与全部 Variant 原始名称快照。
3. 重命名 Property，并记录 `editComponentProperty` 返回的新 key。
4. 基于当前 Property 名重建 Variant 组合名称并写入 Value。
5. 应用普通节点名称。

任一步失败时停止后续写入，并使用当前批次快照回滚已应用内容。最近一次成功应用仍可通过面板“撤销”恢复。

## Error Handling

- 选中的 Instance 不直接修改主组件 Property；仅作为普通实例图层命名处理。
- 选中远程库实例无法编辑主组件时，显示只读提示。
- Property / Value 归一化冲突时，冲突 proposal 保留在预览但默认禁用应用，并展示原因。
- Component Set 中存在无法解析的 Variant 名时，不执行 Value 批量改名，只允许安全的 Property 与节点改名。
- Figma API 写入失败时展示具体对象名称，不吞掉错误。

## Testing

### Unit Tests

- Property camelCase。
- Boolean `has/show + PascalCase`。
- 状态、布局、类型和 Boolean Value。
- 多词 Value camelCase。
- Property / Value 冲突。
- Variant 选择提升到 Component Set 并去重。
- Section、Component、普通图层和混合选择的 capability 计算。
- 变更计划合并与禁用 capability。

### Adapter Tests

使用最小 fake Figma nodes 验证：

- Property 使用完整旧 key 调用 `editComponentProperty`。
- Variant 组合名正确重建。
- 应用顺序与撤销快照。
- API 失败时回滚。

### Visual Verification

- 420 × 680 插件窗口。
- 空选择批量模式。
- 单独 Section。
- 单独 Component / Variant。
- 混合选择。
- Property / Value 预览与冲突警告。

## Out Of Scope

- 不自动创建、删除或改变 Property 类型。
- 不修改 TEXT 默认文案、INSTANCE_SWAP 引用或 preferred values。
- 不追踪远程库主组件并跨文件写入。
- 不通过 AI 猜测完全不明确的业务语义。
