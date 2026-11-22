# 智能体工程与开发规范 (Agent Project Guidelines)

本规范定义了在当前仓库开发、重构与维护前端界面时的核心原则，重点固化 **CLI 生成代码冻结**、基础 UI 组件复用、设计系统主题令牌（Theme Tokens）规范、目录边界红线与静态检查 / 代码审核要求。

---

## 1. 核心三大红线 (Core Red Lines)

1. **CLI 生成代码严禁手动修改**：

   下列四套组件库全部由 shadcn CLI 及其 registry 生成与维护，**严禁任何手动篡改、格式改写或逻辑微调**（包括"只改一行样式"）：

   | 来源             | 生成命令                                        | 产物目录                                               |
   | :--------------- | :---------------------------------------------- | :----------------------------------------------------- |
   | shadcn/ui        | `bun x shadcn@latest add <component>`           | `src/components/ui/`                                   |
   | plate（富文本）  | `bun x shadcn@latest add @plate/<component>`    | `src/components/ui/`、`src/components/editor/plugins/` |
   | uploadcn（上传） | `bun x shadcn@latest add @uploadcn/<component>` | `src/components/ui/`                                   |
   | mapcn（地图）    | `bun x shadcn@latest add @mapcn/<component>`    | `src/components/ui/map.tsx`（基础图元）                |
   - registry 别名以 [`components.json`](file:///Users/seaside/Projects/frontend/nextjs/next-admin/components.json) 的 `registries` 为准；需要新增组件时只能用命令生成，禁止手写复制生成产物。
   - 功能不满足需求时，**严禁侵入生成源码**，必须在业务层（例如 [`src/components/`](file:///Users/seaside/Projects/frontend/nextjs/next-admin/src/components) 或具体 Feature 模块内）通过高阶组件、组合包装（Wrapper / Compound Pattern）或传递 Props 进行扩展。
   - [`src/components/map/`](file:///Users/seaside/Projects/frontend/nextjs/next-admin/src/components/map) 是自研包装层（底图预设、坐标系转换、Choropleth 计算），**可正常修改**；只有 mapcn 生成的基础图元属于冻结范围。
   - 重新生成/升级导致的产物变化，不得与业务改动放在同一提交。

2. **强制 UI 组件优先原则 (UI First)**：
   - 构建任何业务页面、抽屉表单、弹窗或状态展示时，**必须强制优先复用 [`src/components/ui/`](file:///Users/seaside/Projects/frontend/nextjs/next-admin/src/components/ui) 既有组件**，严禁重复造轮子或手写原生 HTML 替代。

3. **强制设计令牌规范，严禁硬编码色值 (Design Tokens Enforced)**：
   - 必须严格使用 [`src/app/globals.css`](file:///Users/seaside/Projects/frontend/nextjs/next-admin/src/app/globals.css) 与主题系统（`@theme inline`）定义的语义化 CSS / Tailwind 设计令牌。
   - **绝对严禁在代码中硬编码任何 HEX、RGB、HSL 颜色**（例如禁止 `style={{ color: '#333' }}` 或 `bg-[#f5f5f5]`），禁止脱离主题系统使用非语义化固定色阶。所有界面必须开箱原生适配浅色模式、深色模式（Dark Mode）以及全局动态换肤。

---

## 2. UI 组件复用与映射契约 (Component Map)

在编写功能时，必须首选以下已沉淀的标准组件：

| 业务场景           | 强制首选组件                                                | 导入路径                                             | 说明                                                                             |
| :----------------- | :---------------------------------------------------------- | :--------------------------------------------------- | :------------------------------------------------------------------------------- |
| **操作与按钮**     | `Button`                                                    | `@/components/ui/button`                             | 支持 `variant` (default, outline, secondary, ghost, destructive, link) 与 `size` |
| **下拉与动作面板** | `DropdownMenu`, `DropdownMenuItem`, `DropdownMenuTrigger`   | `@/components/ui/dropdown-menu`                      | 工具栏菜单、行操作菜单首选                                                       |
| **文字提示**       | `Tooltip`, `TooltipTrigger`, `TooltipContent`               | `@/components/ui/tooltip`                            | 紧凑信息提示，全局延迟已设为 0ms                                                 |
| **标签与徽标**     | `Badge`                                                     | `@/components/ui/badge`                              | 状态标签、计数标记                                                               |
| **文本输入**       | `Input`                                                     | `@/components/ui/input`                              | 单行输入框                                                                       |
| **下拉选择**       | `Select`, `SelectTrigger`, `SelectContent`, `SelectItem`    | `@/components/ui/select`                             | 标准单选下拉                                                                     |
| **高级下拉搜索**   | `Combobox`                                                  | `@/components/ui/combobox`                           | 基于 `@base-ui/react` 深度封装的带搜索下拉                                       |
| **开关与复选**     | `Checkbox`, `Switch`                                        | `@/components/ui/checkbox`, `@/components/ui/switch` | 布尔配置与多选                                                                   |
| **表单集成**       | `Form`, `FormField`, `FormItem`, `FormLabel`, `FormMessage` | `@/components/ui/form`                               | 深度集成 `react-hook-form` + `zod`                                               |
| **模态弹窗**       | `Dialog`, `DialogTrigger`, `DialogContent`, `DialogHeader`  | `@/components/ui/dialog`                             | 核心阻断式弹窗与确认框                                                           |
| **抽屉与侧边栏**   | `Sheet`, `SheetContent`, `SheetHeader`                      | `@/components/ui/sheet`                              | 侧滑详情页、复杂表单配置面板                                                     |
| **卡片与容器**     | `Card`, `CardHeader`, `CardTitle`, `CardContent`            | `@/components/ui/card`                               | 内容区块包裹卡片                                                                 |
| **表格系统**       | `DataTable`                                                 | `@/components/data-table`                            | 自研高性能中后台数据表格（虚拟化/列宽/导出/过滤）                                |
| **骨架屏与加载**   | `Skeleton`                                                  | `@/components/ui/skeleton`                           | 异步加载态骨架屏                                                                 |
| **全局轻提示**     | `toast` (Sonner)                                            | `sonner`                                             | 全局消息提示，严禁手写 alert                                                     |

---

## 3. 设计令牌 (Tokens) 与主题使用规范

样式必须完全依赖 Tailwind CSS v4 与 CSS 变量映射：

### 3.1 颜色语义令牌 (Color Tokens)

- **页面主体**：
  - 基础背景：`bg-background`，基础文本：`text-foreground`
  - 次级文本/图标：`text-muted-foreground`，次级弱化背景：`bg-muted`
- **卡片与面板**：
  - 卡片底色：`bg-card`，卡片文本：`text-card-foreground`
  - 浮层底色：`bg-popover`，浮层文本：`text-popover-foreground`
- **边框与分割**：
  - 常规边框：`border-border`，输入框边框：`border-input`
  - 焦点光环：`ring-ring`，分割线：`bg-border` 或 `<Separator />`
- **主交互与强调**：
  - 主品牌色：`bg-primary`，主品牌文本：`text-primary-foreground`
  - 次级强调：`bg-secondary`，次级文本：`text-secondary-foreground`
  - 悬浮强调：`hover:bg-accent`，强调前景：`text-accent-foreground`
- **危险与警示**：
  - 危险背景：`bg-destructive`，危险文本：`text-destructive`，柔和危险底色：`bg-destructive/10`
- **侧边栏 (Sidebar)**：
  - `bg-sidebar`, `text-sidebar-foreground`, `border-sidebar-border`, `bg-sidebar-accent`

### 3.2 圆角、间距与页面容器规范

- 统一使用主题圆角令牌：`rounded-lg` (标准组件), `rounded-xl` (卡片/大容器), `rounded-md` (小控件), `rounded-full` (头像/圆标)。
- 阴影统一使用：`shadow-xs`, `shadow-sm`, `shadow-md`，避免过重深色阴影。
- **页面根容器规范**：[`DashboardShell`](file:///Users/seaside/Projects/frontend/nextjs/next-admin/src/components/layout/DashboardShell.tsx) 唯一持有主内容区外层内边距（`p-4 md:p-6 lg:p-8`）；所有 `(app)` 路由组内的业务页面、详情/表单子页与加载骨架屏统一使用全宽 `space-y-6` 根容器，**严禁重复叠加 `p-4`/`p-6`/`p-8` 或 `mx-auto max-w-*`**。

---

## 4. 编码纪律与导入规范

1. **路径别名规范**：
   - 统一使用 `@/components/ui/<name>` 导入组件，严禁 `../../components/ui` 等深层相对路径。
   - 统一使用 `@/lib/utils` 或原生辅助函数。
2. **类名合并规范**：
   - 项目使用 shadcn 官方针对 Tailwind CSS v4 的编译包 `cn`：

     ```tsx
     import { cn } from "cn";
     ```

   - 严禁擅自引入 `clsx` 或 `tailwind-merge` 造成依赖膨胀。
3. **图标规范**：
   - 统一从 `lucide-react` 导入图标。
   - 图标尺寸建议使用统一类名：`size-3.5` (行内/小按钮), `size-4` (常规控件), `size-5` (标题/统计卡)。

---

## 5. React Compiler 与性能控制规范

本仓库已在 [`next.config.ts`](file:///Users/seaside/Projects/frontend/nextjs/next-admin/next.config.ts) 中启用 `reactCompiler: true`，以 **Compiler 编译期自动记忆化为主，手动 Memo 作为特殊场景的性能控制手段**：

1. **默认禁止手写手动 Memo**：
   - 编写新组件、新 Hook、业务页面与表单时，**禁止默认编写 `useMemo`、`useCallback`、`React.memo`（或 `memo`）**。
   - 简单派生表达式、常规配置数组/对象、普通事件回调与叶子展示组件一律交给 React Compiler 自动优化。
2. **允许使用手动 Memo 的特殊场景白名单**（使用时需简短注释说明原因）：
   - **高开销计算隔离**：万级数据集遍历、复杂矩阵/拓扑转换等明确昂贵的派生计算。
   - **第三方库引用稳定性契约**：向 `@tanstack/react-table`、`@tanstack/react-virtual`、`maplibre-gl` 等非 Compiler 感知的外部引擎传递配置、数据源或 Effect 依赖时。
   - **跨边界严格渲染控制**：通过单元测试显式锁定的行级/单元格渲染隔离边界（如 `DataTableRow`），或配合 `"use no memo"` 局部逃生舱使用。
   - **稳定事件回调引用**：跨 `useEffect` / 定时器 / 订阅监听器使用的回调，优先使用项目既有的 `useMemoizedFn`（`ahooks`）。
3. **逃生舱指令**：若极个别命令式组件与 Compiler 自动优化冲突，优先在该组件或 Hook 顶部添加 `"use no memo"` 指令做局部豁免，严禁关闭全局 `reactCompiler`。

---

## 6. 静态检查与代码审核 (Lint & Review)

1. **提交前必须全绿**：`bun run check`（`oxlint --fix` + `oxfmt` + `tsc --noEmit`）与 `bun run test`（vitest）必须全部通过，禁止提交带 lint / 类型错误 / 失败用例的代码。
2. **禁止静默绕过检查**：不得为了让报错消失而新增 `oxlint-disable` / `eslint-disable` / `@ts-ignore` / `@ts-expect-error`；确需抑制时限定单行并在同一行注明原因（`// eslint-disable-next-line <rule> -- <原因>`）。严禁通过放宽 `oxlint` 或 `tsconfig` 配置来消除报错。
3. **合并前必须代码审核**，按两条独立轴汇报，不得用一条掩盖另一条：
   - **Standards 轴**：是否符合本文件与仓库既有约定；**生成目录（见红线 1）被改动即视为违规**。
   - **Spec 轴**：是否忠实实现需求；未被要求的额外改动（scope creep）需单独列出。
4. **审核结论必须可定位**：每条问题给出 `文件:行`、对应规则条目与证据。工具已强制的项（格式化、未使用变量、类型错误）不重复报告，也不作为 review 通过与否的依据。

<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
