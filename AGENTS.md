# 智能体工程与开发规范 (Agent Project Guidelines)

本规范定义了在当前仓库开发、重构与维护前端界面时的核心原则，重点固化基础 UI 组件复用、设计系统主题令牌（Theme Tokens）规范与目录边界红线。

---

## 1. 核心三大红线 (Core Red Lines)

1. **`src/components/ui` 严禁手动修改**：
   - [`src/components/ui/`](file:///Users/seaside/Projects/react/nextjs/next-sn-admin/src/components/ui) 目录为基础 UI 组件库，**完全由 shadcn CLI 工具链生成与维护，严格禁止任何手动篡改、格式改写或逻辑微调**。
   - 若功能不满足需求，**严禁侵入修改底层 ui 源码**，必须在业务层（例如 [`src/components/`](file:///Users/seaside/Projects/react/nextjs/next-sn-admin/src/components) 或具体 Feature 模块内）通过高阶组件、组合包装（Wrapper / Compound Pattern）或传递 Props 进行扩展。
   - 若需新增基础组件，统一使用命令生成：`bun x shadcn@latest add <component>`。

2. **强制 UI 组件优先原则 (UI First)**：
   - 构建任何业务页面、抽屉表单、弹窗或状态展示时，**必须强制优先复用 [`src/components/ui/`](file:///Users/seaside/Projects/react/nextjs/next-sn-admin/src/components/ui) 既有组件**，严禁重复造轮子或手写原生 HTML 替代。

3. **强制设计令牌规范，严禁硬编码色值 (Design Tokens Enforced)**：
   - 必须严格使用 [`src/app/globals.css`](file:///Users/seaside/Projects/react/nextjs/next-sn-admin/src/app/globals.css) 与主题系统（`@theme inline`）定义的语义化 CSS / Tailwind 设计令牌。
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

### 3.2 圆角与间距规范

- 统一使用主题圆角令牌：`rounded-lg` (标准组件), `rounded-xl` (卡片/大容器), `rounded-md` (小控件), `rounded-full` (头像/圆标)。
- 阴影统一使用：`shadow-xs`, `shadow-sm`, `shadow-md`，避免过重深色阴影。

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
