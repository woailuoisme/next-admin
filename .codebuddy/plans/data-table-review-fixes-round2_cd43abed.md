---
name: data-table-review-fixes-round2
overview: 修复上一轮 data-table 代码评审中自查出的 3 个 Critical 回归、4 条 Warning 与 3 条 Suggestion：三元筛选文案错位、未指派判定与语言耦合、徽章状态色回退到仓库既有 chart-* 约定、ARIA valuerange 补全、补齐三条回归测试，并收敛 URL 页码与 inert 条件。
todos:
  - id: fix-copy-and-badge
    content: 修正三元筛选文案为 op_true/op_false，并将 BadgeCell 状态色回退到 chart-* 约定
    status: completed
  - id: fix-unassigned-and-aria
    content: UserCell 恢复未指派字面量兜底，补 aria-valuenow 默认值与 shortcut 注释
    status: completed
  - id: fix-adapter-and-placeholder
    content: 适配器收敛越界页码，FilterRegistry 消除 placeholder 重复，DataTable 补 inert 边界注释
    status: completed
  - id: add-regression-tests
    content: 补行点击忽略选择器、分页页码夹取、加载遮罩 inert 三条回归测试
    status: completed
    dependencies:
      - fix-copy-and-badge
      - fix-unassigned-and-aria
      - fix-adapter-and-placeholder
  - id: document-rowclick-api
    content: README 新增 DataTable 事件约定小节，说明 onRowClick 联合事件类型与行内交互放行规则
    status: completed
    dependencies:
      - add-regression-tests
  - id: verify-all
    content: 运行 typecheck、lint、test、fmt，并复核改动文件范围符合预期
    status: completed
    dependencies:
      - document-rowclick-api
---

## 需求概述

修复上一轮对 `src/components/data-table` 修复改动做二次评审时发现的全部问题：3 个 Critical 回归、4 条 Warning、3 条 Suggestion。范围已确认包含全部三档，并额外补齐回归测试与 README 说明。

## 待修复条目

### Critical（本轮改动引入的回归）

- **三元筛选布尔文案语义错位**：`FilterRegistry` 的 true/false 选项复用了 `table.boolean_yes/no`（"是 / 已启用"、"否 / 未启用"），该文案本是图标 tooltip 的组合语义，筛选项应显示 "是 / 否"。
- **未指派态判定与界面语言耦合**：`UserCell` 只与当前语言文案比对，跨语言脏数据（英文界面返回 `"未指派"`）会退化成"一个叫未指派的真实用户"。
- **徽章状态色语义合流**：`warning` 被映射到 `destructive`，与危险态同色；`info` 退化为 muted，与次要徽章无法区分。

### Warning

- 列宽手柄 `aria-valuenow` 可能缺失，导致 ARIA valuerange 只有 min/max 不完整。
- 三条行为改动（行点击忽略选择器、分页页码夹取、加载遮罩 inert）零回归测试。
- `onRowClick` 事件类型由 `MouseEvent` 收紧为联合类型，属公开 API 收缩，未文档化。
- 筛选推断的 200 行采样注释未按仓库 `shortcut:` 约定书写。

### Suggestion

- URL 适配器未在已知 `total` 时收敛越界页码，query 中会残留脏页码。
- 加载遮罩的 `inert` 条件可评估简化。
- 筛选下拉的 `placeholder` 与 `allLabel` 语义重复且实际不渲染。

## 预期结果

徽章恢复橙/绿/蓝三档区分（与仓库既有 `InfolistCallout` 状态色约定一致），筛选与用户单元格文案在各语言下语义正确，越界页码在适配器层被根治，三条关键行为有回归测试守护，README 有明确的 `onRowClick` 事件契约说明。全部改动通过类型检查、静态检查与测试。

## 技术栈

沿用现有实现，不引入任何新依赖：Next.js 16 + React 19 + TypeScript strict + Tailwind v4（语义令牌）+ next-intl + vitest / @testing-library。

## 实现方案

按「文案与配色 → 判定与 ARIA → 适配器与边界 → 测试 → 文档」五条独立链路推进，每条改动收敛在自身模块，避免交叉回归。

### 1. C1 三元筛选文案（`toolbar/filters/FilterRegistry.tsx`）

`selectOptionsByField` 的 `useMemo` 内，把 `t("boolean_yes")` / `t("boolean_no")` 换成同命名空间已存在的筛选算子文案 `t("op_true")`（"True" / "真 (True)"）与 `t("op_false")`（"False" / "假 (False)"）。不动 `boolean_yes/no` 现有定义（`IconCell` 仍在用）。`useMemo` 依赖已包含 `t`，结构无需调整。

### 2. C3 徽章状态色回退（`cells/display/BadgeCell.tsx`）

回退到改动前映射，并注释指向仓库既有约定（`InfolistCallout.tsx:50-65` 的 `info→chart-1 / success→chart-2 / warning→chart-4`）：

- `success`: `border-chart-2/30 bg-chart-2/10 text-chart-2 dark:bg-chart-2/20`
- `warning`: `border-chart-4/30 bg-chart-4/10 text-chart-4 dark:bg-chart-4/20`
- `info`: `border-chart-1/30 bg-chart-1/10 text-chart-1 dark:bg-chart-1/20`

`chart-*` 属主题令牌，不违反"禁止硬编码颜色"红线；不改 `globals.css`。影响面：`features/products/ui.tsx`、`features/users/ui.tsx` 等已用 `variant="warning"/"success"` 的表格恢复正常橙/绿观感。

### 3. C2 未指派判定（`cells/display/UserCell.tsx`）

模块级新增非本地化字面量集合，i18n 只负责展示：

```ts
/** 后端可能直接回传的未指派文案，与界面语言无关 */
const UNASSIGNED_LITERALS = new Set(["Unassigned", "未指派", "待分配"]);
```

判定改为 `isNil(name) || name === "" || name === resolvedUnassignedText || UNASSIGNED_LITERALS.has(String(name))`，`resolvedUnassignedText` 仍用于渲染。

### 4. W1 + W4 收尾

- `header/DataTableHeader.tsx`：`aria-valuenow={currentWidth ?? 120}`，与 `hooks/useDataTableResize.ts` 中 `handleResizeStep` 的 `?? 120` 兜底保持一致，保证 valuerange 三项同时成立。
- `toolbar/filters/hooks/useFilterInference.ts`：注释改写为约定格式 `// shortcut: 只采样前 200 行推导选项，超过 200 行且候选值仅出现在尾部时下拉会缺值，需要精确全量选项时改用显式 valueOptions`。

### 5. S1 越界页码在适配器层收敛（`adapters/useUrlTableStateAdapter.ts`）

`total` 在 `:295` 计算，`currentPage` 在 `:174` 派生。在 `total` 之后新增派生并替换 `state.page`（`:308`）与其依赖（`:323`）：

```ts
// URL 可能残留越界页码（末页数据被删空），已知 total 时收敛一次，避免表格空白但页码可点
const pageCount = Math.max(1, Math.ceil(total / currentPageSize));
const page = Math.min(currentPage, pageCount);
```

实施时先 `grep -n "currentPage"` 确认全部引用点（预期仅派生处与 `state.page`/依赖数组），避免遗漏。不新增导航副作用，仅收敛对外暴露的页码。

### 6. S2 inert 条件（评估结论：不改逻辑，补注释）

已核实 `body/DataTableBody.tsx:140-167` 的分支：`loading && pagedRows.length === 0` 时渲染 `DataTableLoadingOverlay` 或 `DataTableSkeletonRows`，其中允许消费方通过 `slots.loadingOverlay` 注入自定义内容，可能是可聚焦控件。若把条件简化为 `inert={loading}`，会连带禁用这些自定义遮罩控件。因此保留 `loading && pagedRows.length > 0`，在 `core/DataTable.tsx:589-594` 补一行注释说明该边界，避免后续被"顺手简化"。

### 7. S3 placeholder 去重（`FilterRegistry.tsx:269`）

`Select` 的 `value` 恒为 `String(value ?? "__all__")`，placeholder 不会渲染。抽一个局部常量消除重复表达式：

```ts
const allLabel = def.type === "select" ? t("filter_all_option") : "-";
// ...
placeholder={def.placeholder ?? allLabel}
allLabel={allLabel}
```

### 8. W2 回归测试（新增 `test/components/dataTableRowActivation.test.tsx` 等）

复用 `test/test-utils` 的 `renderWithProviders` / `screen` / `fireEvent`（参考 `test/components/dataTableCellsContract.test.tsx:15`），不新造 wrapper。

- **行点击忽略选择器**：渲染单行 `DataTable`，配置 `onRowClick`，单元格内放一个 `<Button>`。点击按钮断言 `onRowClick` 未调用；点击行内纯文本单元格断言被调用且事件对象为 `MouseEvent`。
- **分页页码夹取**：渲染 `DataTablePagination`，`paginationModel={{ page: 5, pageSize: 10 }}`、`rowCount={3}`，断言摘要展示 `1-3`（不出现 `41-3` 之类倒挂区间），且页码高亮为第 1 页。
- **加载遮罩 inert**：`loading` 且有行时断言 `<table>` 带 `inert` 属性；`loading` 且无行时断言不带（固化当前条件，防止被误简化）。

### 9. W3 README 契约说明（`README.md`）

README 目前只有「特性」要点列表（`:3-9`），**不存在**逐项 API 段落。在「特性」之后新增简短小节 `## DataTable 事件约定`，说明：

- `onRowClick(row, event)` 的 `event` 类型为 `React.MouseEvent<HTMLElement> | React.KeyboardEvent<HTMLElement>`（键盘 Enter/Space 激活时传入键盘事件），消费方读取鼠标专有字段前需先窄化。
- 单元格内交互元素（`button/a/input/select/textarea/[role="button"]/[role="checkbox"]`）不会触发行回调。

## 架构与目录

无新增目录，改动集中在 8 个文件 + 1~2 个测试文件 + README：

```
src/components/data-table/
├── toolbar/filters/FilterRegistry.tsx            # [MODIFY] C1 文案、S3 placeholder 去重
├── cells/display/BadgeCell.tsx                   # [MODIFY] C3 回退 chart-* 并注释约定
├── cells/display/UserCell.tsx                    # [MODIFY] C2 字面量集合兜底
├── header/DataTableHeader.tsx                    # [MODIFY] W1 aria-valuenow 兜底
├── toolbar/filters/hooks/useFilterInference.ts   # [MODIFY] W4 shortcut 注释
├── adapters/useUrlTableStateAdapter.ts           # [MODIFY] S1 越界页码收敛
└── core/DataTable.tsx                            # [MODIFY] S2 补 inert 边界注释
test/components/
├── dataTableRowActivation.test.tsx               # [NEW] 行点击忽略选择器
└── dataTablePaginationClamp.test.tsx             # [NEW] 页码夹取 + inert 双断言
README.md                                         # [MODIFY] W3 事件契约小节
```

测试文件也可合并为单个 `dataTableRegression.test.tsx`，若三条用例的渲染前置差异较大（如需要 `DataTable` 与 `DataTablePagination` 两套 props）则拆为两个文件更清晰。

## 性能与可靠性

- S1 的 `pageCount` 计算为 O(1)，在既有 `state` 的 `useMemo` 内完成，不新增渲染次数；夹取只作用于对外暴露的页码，不回写 URL，避免引入额外导航。
- C3 仅替换常量映射，零运行时开销。
- W1 补默认值不改变任何拖拽/持久化行为。
- 全部改动向后兼容：`DataTablePagination`、`DataTableHeader`、`BadgeCell` 的公开 props 签名不变。

## 验证

```
bun run typecheck   # 主要拦截 UserCell 判定与 adapter 类型
bun run lint        # oxlint，0 warning / 0 error
bun run test        # 基线 69 文件 / 438 用例，新增 3 条后应 ≥ 441 全绿
bun run fmt         # 最后执行，随后 git status 确认无预期外文件改动
```

注意仓库当前存在上一轮已暂存的改动，`bun run fmt` 后需用 `git diff --stat` 复核本次仅触及上表所列文件。