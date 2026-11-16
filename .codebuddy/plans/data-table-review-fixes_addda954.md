---
name: data-table-review-fixes
overview: 修复 src/components/data-table 代码审查中确认的 3 个 Critical 与全部 Warning 问题：行点击事件冲突、URL 历史语义、server 分页越界、a11y 缺口、事件类型断言、列定义与筛选面板的 memo 失效，并将 7 处硬编码文案迁入 next-intl。
todos:
  - id: fix-row-activation
    content: 修复行点击透传与事件类型：DataTableRow 按选择器拦截、MaskedCell 补 stopPropagation
    status: completed
  - id: fix-url-pagination
    content: URL 适配器翻页排序改用 replace，并收敛 server 页码上限与分页摘要边界
    status: completed
  - id: add-a11y
    content: 补齐无障碍：内联编辑 aria-label、分页下拉标签、列宽键盘调整、遮罩 inert
    status: completed
    dependencies:
      - fix-url-pagination
  - id: migrate-i18n
    content: 迁移 7 处硬编码文案到 next-intl 并同步 en/zh 消息文件
    status: completed
    dependencies:
      - fix-row-activation
  - id: fix-memo-tokens
    content: 筛选面板与推断依赖 memo 化，新增列定义封装，替换徽标语义色令牌
    status: completed
    dependencies:
      - fix-row-activation
  - id: verify-changes
    content: 运行 typecheck、lint、test 并人工键盘走查无障碍改动
    status: completed
    dependencies:
      - add-a11y
      - migrate-i18n
      - fix-memo-tokens
---

## 用户需求

修复 `src/components/data-table` 代码审查报告中确认的 **3 个 Critical + 10 个 Warning**。Suggestion 档不处理，唯一例外是审查中列出的硬编码文案，改为 next-intl 国际化。

## 核心修复项

### 正确性（Critical）

- **行点击冲突**：`<TableRow>` 的 `onClick` 无差别触发行回调，而键盘路径已用 `ROW_ACTIVATION_IGNORE_SELECTOR` 过滤；`MaskedCell` 的「查看明文 / 复制」按钮未阻断冒泡，点按钮会连带触发行跳转。
- **浏览器历史污染**：URL 适配器的翻页、排序、修改每页条数均使用 `push`，只有搜索用 `replace`，一次列表操作产生多条历史记录。
- **server 分页越界**：页码只做下限收敛，末页数据被删空后分页摘要出现 `21-3 / 3` 这类倒挂区间，表格空白但页码仍可点击。

### 可访问性（Warning）

- 内联编辑框用 placeholder（「点击编辑…」）充当可访问名称，读屏无法得知编辑的是哪个字段。
- 每页条数下拉无 `aria-label`，仅靠旁边的装饰性文字。
- 列宽拖拽手柄仅支持鼠标，键盘用户无法调整列宽。
- 加载遮罩为纯视觉覆盖层，遮罩期间按 Tab 仍能聚焦到被遮挡的行与工具栏按钮。
- 键盘激活行时，`KeyboardEvent` 被断言成 `MouseEvent` 传给回调；徽标键盘回调同样如此。

### 性能（Warning）

- 筛选面板每次渲染重建整个 body props 对象并展开给未缓存的子组件，面板内任意勾选都会重建全部下拉；下拉 options 数组在渲染循环中即时构造。
- 筛选推断依赖整行数组引用，服务端每次分页都触发一次全量去重计算。
- 列定义工厂每次调用都返回新对象与新的单元格渲染闭包，调用方若在组件体内建列会导致整表重渲染。提供稳定的声明方式，并明确约定。

### 文案国际化（Warning）

明文/隐藏、复制、开关、未指派、是否启用、走势图提示、进度条标签、保存视图删除按钮等 7 处硬编码中英文，统一迁入 next-intl，与现有 `table` 命名空间保持一致。

### 视觉一致性

徽标组件用图表色板（`chart-1/2/4`）冒充成功/警告/信息状态色，主题换色时语义漂移，改为语义令牌。

## 边界与约束

- 不新增第三方依赖；不修改 `src/components/ui/`；不硬编码任何颜色值。
- 保留现有组件 API 与导出，仅做必要的最小签名调整。
- 已核实的三个「疑似缺陷」不修：内联编辑 Enter 双提交、开关 readOnly 可切换、`<td>` 对齐失效。

## 技术栈

Next.js 16 + React 19 + TypeScript strict + Tailwind v4 + next-intl + ahooks（`useMemoizedFn`）+ TanStack Virtual。全部沿用现有实现，不引入新依赖。

## 实现方案

按「事件 → 状态 → 无障碍 → 文案 → 性能」五条独立链路推进，每条链路的改动收敛在自身模块内，避免交叉回归。

### 1. 行激活事件（`body/DataTableRow.tsx`）

`handleRowClick` 复用已有的 `ROW_ACTIVATION_IGNORE_SELECTOR` 判断 `e.target.closest(...)`，一处收敛即可覆盖所有未自行阻断冒泡的单元格；`MaskedCell` 再补 `stopPropagation` 作为防御。事件类型不再强转：在 `core/types.ts` 定义 `RowActivationEvent = React.MouseEvent<HTMLElement> | React.KeyboardEvent<HTMLElement>`，`onRowClick` / `onBadgeClick` 统一使用该联合类型。仓库内唯一消费方 `ResourceTable.tsx:328` 只取 `row`，无需改动。

### 2. URL 状态与分页边界

- 适配器：`handlePageChange` / `handlePageSizeChange` / `handleSortChange`（含清除排序分支）加 `{ replace: true }`。
- `core/DataTable.tsx:347`：server 模式也按 `totalPages` 收敛上限。
- `footer/DataTablePagination.tsx`：摘要用收敛后的页码计算 `from/to`，并对 `from > to` 兜底。
- 已知限制（写注释）：显示层收敛不会回写 URL，URL 中仍可能残留越界 `page`；需在下次交互时才被纠正，不在本次引入额外导航副作用。

### 3. 无障碍

- 内联编辑：`TextInputCell` 新增可选 `fieldLabel`，`textInputCol` 传入 `headerName`；`InlineEditInput` 的 `aria-label` 改用 `t("aria_edit_field", { name: fieldLabel })`，placeholder 仅作为视觉提示。
- 分页：`SelectTrigger` 补 `aria-label={t("pagination_page_size_label")}`。
- 列宽键盘调整：`useDataTableResize` 新增 `handleResizeStep(field, delta)`（基于 `latestRef` 取当前宽度，按列 `minWidth/maxWidth` 夹取后 `setColumnWidths`，复用既有持久化副作用），经 `DataTableContext` 暴露；`DataTableHeader` 的手柄补 `tabIndex`、`aria-valuenow/aria-valuemin/aria-valuemax`，`ArrowLeft` / `ArrowRight` 步进 16px。
- 遮罩：加载时给表格容器加 `inert`（React 19 原生支持）并保留 `role="status"`，移除重复播报风险。

### 4. 文案国际化

`src/messages/{en,zh}.json` 的 `table` 命名空间新增 key（`aria_reveal_value`、`aria_hide_value`、`auto_hide_countdown`、`copy_value`、`aria_toggle_state`、`unassigned`、`boolean_yes/no`、`icon_state_on/off`、`inline_edit_placeholder`、`aria_edit_field`、`pagination_page_size_label`、`sparkline_*`、`progress_total/segments/target`、`saved_views_delete_title/label`、`filter_sheet_description`）。优先复用已存在的 `filter_empty`、`filter_all_option`、`aria_resize_column`，不重复造 key。涉及组件：`MaskedCell`、`ToggleCell`、`UserCell`、`IconCell`、`SparklineCell`、`ProgressCell`、`DataTableSavedViews`、`TextInputCell`。

### 5. 性能与令牌

- `FilterRegistry`：`sharedBodyProps` 改 `useMemo`，`FilterRegistryBody` 加 `memo`；`select` 的 options 与 `onChange` 用 `useMemo` 按 `resolvedFilters` 预计算映射表，消除渲染循环内的对象构造。
- `useFilterInference`：把候选列的取值采样从 `data` 引用的依赖改为内容签名（`data.length` + 首尾行该列取值），避免翻页引用抖动触发全量重算；加 `shortcut:` 注释说明采样上限。
- 列定义稳定性：`columns/index.ts` 导出 `useColumnDefs(factory, deps)` 薄封装（内部 `useMemo`），并在模块注释写明「列定义必须在模块级或 memo 内创建」。不改 `DataTable` 的列归一化逻辑 —— 按签名做 memo 会让 `renderCell` 闭包陈旧，风险高于收益。
- `BadgeCell`：`chart-1/2/4` 改为语义令牌；若主题不存在 success/warning 令牌，降级为 `primary` / `destructive` / `muted-foreground` 三档，不改 `globals.css`。

## 架构与目录

改动集中在 6 个模块，无新增目录：

```
src/components/data-table/
├── core/
│   ├── types.ts                    # [MODIFY] RowActivationEvent 联合类型
│   ├── DataTableContext.tsx        # [MODIFY] 暴露 handleResizeStep
│   └── DataTable.tsx               # [MODIFY] server 页码上限收敛、遮罩 inert
├── body/DataTableRow.tsx           # [MODIFY] 点击目标过滤、事件类型
├── adapters/useUrlTableStateAdapter.ts  # [MODIFY] 翻页/排序改 replace
├── footer/DataTablePagination.tsx  # [MODIFY] 摘要边界收敛、Select aria-label
├── header/DataTableHeader.tsx      # [MODIFY] 手柄键盘可达 + aria-valuenow
├── hooks/useDataTableResize.ts     # [MODIFY] handleResizeStep
├── overlays/DataTableOverlays.tsx  # [MODIFY] 加载态语义
├── cells/
│   ├── display/{MaskedCell,BadgeCell,UserCell,IconCell,SparklineCell,ProgressCell,types}.tsx|ts  # [MODIFY]
│   └── interactive/{ToggleCell,types,text-input/TextInputCell,text-input/InlineEditInput}.tsx|ts  # [MODIFY]
├── columns/{interactive.tsx,index.ts}  # [MODIFY] fieldLabel 透传、useColumnDefs
└── toolbar/
    ├── filters/FilterRegistry.tsx          # [MODIFY] memo + options 预计算
    ├── filters/hooks/useFilterInference.ts # [MODIFY] 依赖收敛
    └── items/DataTableSavedViews.tsx       # [MODIFY] 删除按钮文案
src/messages/{en,zh}.json           # [MODIFY] table 命名空间新增 key
```

## 关键类型

```ts
// core/types.ts
export type RowActivationEvent = React.MouseEvent<HTMLElement> | React.KeyboardEvent<HTMLElement>;

// hooks/useDataTableResize.ts
export interface UseDataTableResizeResult {
  columnWidths: Record<string, number>;
  handleResizeStart: (field: string, initialWidth: number, e: React.MouseEvent) => void;
  handleResizeStep: (field: string, delta: number) => void; // 键盘步进，复用持久化副作用
}
```

## 验证

`bun run typecheck`（事件类型变更与新增必填项的主要拦截点，`ResourceTable.tsx`、`features/*/resource.ts` 为回归观察对象）→ `bun run lint` → `bun run test`。a11y 改动需人工键盘走查：Tab 到列宽手柄后按左右方向键、遮罩出现时 Tab 是否被拦截。
