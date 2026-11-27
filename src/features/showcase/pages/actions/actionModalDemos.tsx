"use client";

import { CheckCircle2, ExternalLink, Layers, Pencil, ShieldAlert, Sparkles, Wand2 } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";

import { action, type ActionEntry } from "@/components/actions";
import { s } from "@/components/schema";

const noteModalSchema = z.object({
	reviewer: z.string().min(2),
	priority: z.enum(["low", "normal", "urgent"]),
	note: z.string().min(4),
});

export function buildModalDemos(articlesCount: number, setLastEvent: (msg: string) => void): ActionEntry<void>[] {
	return [
		action.custom({
			id: "simple-confirm",
			label: "确认弹窗 (Confirm)",
			icon: CheckCircle2,
			color: "primary",
			confirm: {
				title: "发布全部待审核文章？",
				description: "确认后将立即把当前草稿状态变更并推送通知。",
				confirmText: "立即执行",
				color: "primary",
			},
			handler: () => setLastEvent("执行了常规确认弹窗动作"),
			successMessage: "常规确认操作已执行",
		}),
		action.custom({
			id: "keyword-confirm",
			label: "高危关键词核验",
			icon: ShieldAlert,
			color: "destructive",
			confirm: {
				title: "清空所有归档缓存？",
				description: "高危操作不可逆，请输入 CONFIRM 后继续。",
				requireConfirmKeyword: "CONFIRM",
				confirmText: "确认清空",
				autoFocusInput: true,
			},
			handler: () => setLastEvent("通过关键词 CONFIRM 核验并执行"),
			successMessage: "高危缓存清理完成",
		}),
		action.custom<void, z.infer<typeof noteModalSchema>>({
			id: "form-dialog",
			label: "表单弹窗 (Dialog Form)",
			icon: Pencil,
			color: "default",
			modal: {
				variant: "dialog",
				size: "md",
				title: "提交审核备注",
				description: "基于 TanStack Form + Zod schema 自动校验字段。",
				schema: noteModalSchema,
				defaultValues: { reviewer: "Alice", priority: "normal", note: "" },
				fields: [
					s.text("reviewer", { label: "审核人", required: true }),
					s.select("priority", {
						label: "优先级",
						options: [
							{ label: "低 (Low)", value: "low" },
							{ label: "普通 (Normal)", value: "normal" },
							{ label: "紧急 (Urgent)", value: "urgent" },
						],
					}),
					s.textarea("note", { label: "审核意见", required: true, rows: 3 }),
				],
			},
			handler: ({ data }) => setLastEvent(`Dialog 表单提交：${data.reviewer} [${data.priority}] - ${data.note}`),
			successMessage: (_res, { data }) => `已提交 ${data.reviewer} 的审核备注`,
		}),
		action.custom<void, { title: string; publishNow: boolean }>({
			id: "slideover-drawer",
			label: "SlideOver 抽屉表单",
			icon: Sparkles,
			color: "warning",
			modal: {
				variant: "sheet",
				size: "lg",
				allowFullscreen: true,
				title: "SlideOver 侧滑配置抽屉",
				description: "与居中 Dialog 共享同一套 FormDialog 状态机与脏检查守卫。",
				schema: z.object({ title: z.string().min(2), publishNow: z.boolean() }),
				defaultValues: { title: "New Filament Feature", publishNow: true },
				fields: [
					s.text("title", { label: "公告标题", required: true }),
					s.switch("publishNow", { label: "保存后立即公开" }),
				],
			},
			handler: ({ data }) => setLastEvent(`SlideOver 提交：${data.title} (publish=${String(data.publishNow)})`),
			successMessage: "SlideOver 配置已保存",
		}),
		action.custom({
			id: "content-preview",
			label: "自定义内容 + Footer 动作",
			icon: Layers,
			modal: {
				variant: "dialog",
				size: "md",
				title: "Action 自定义内容视图",
				description: "支持任意 JSX 预览及底部附加 Action 触发。",
				renderContent: ({ payload: _p }) => (
					<div className="border-border/70 bg-muted/30 flex flex-col gap-2 rounded-lg border p-4 text-xs">
						<p className="font-semibold">当前演示文章总数：{articlesCount}</p>
						<p className="text-muted-foreground">内容弹窗适合用于日志预览、差异对比或嵌入式 Infolist 卡片展示。</p>
					</div>
				),
				footerActions: [
					action.custom({
						id: "inner-ping",
						label: "触发内部联动",
						color: "primary",
						handler: ({ payload }) => {
							toast.success("触发了 Content Modal 内部动作");
							payload.close();
						},
					}),
				],
			},
		}),
		action.custom({
			id: "halt-before",
			label: "前置拦截 (before -> false)",
			icon: Wand2,
			before: () => {
				toast.warning("before() 返回 false：已中断后续 handler 执行");
				setLastEvent("被 before() 钩子安全拦截");
				return false;
			},
			handler: () => toast.error("不应执行到这里"),
		}),
	];
}

export function buildGroupedDemos(
	isAdmin: boolean,
	allowPublish: boolean,
	setLastEvent: (msg: string) => void,
): ActionEntry<void>[] {
	return [
		action.group(
			[
				action.custom({ id: "bg-copy", label: "复制配置", handler: () => setLastEvent("点击 ButtonGroup: 复制配置") }),
				action.custom({ id: "bg-link", label: "外链文档", icon: ExternalLink, href: "/overview" }),
				action.custom({
					id: "bg-admin-only",
					label: "仅管理员可见",
					authorize: () => isAdmin,
					color: "destructive",
					confirm: true,
					handler: () => setLastEvent("管理员专属动作已触发"),
				}),
			],
			{ id: "demo-btn-group", layout: "button-group" },
		),
		action.group(
			[
				action.custom({
					id: "dd-publish",
					label: "批量发布",
					hidden: () => !allowPublish,
					handler: () => setLastEvent("点击 Dropdown Group: 批量发布"),
					successMessage: "批量发布已触发",
				}),
				action.custom({
					id: "dd-archive",
					label: "归档旧记录",
					separator: true,
					color: "destructive",
					authorize: () => isAdmin,
					confirm: true,
					handler: () => setLastEvent("点击 Dropdown Group: 归档旧记录"),
					successMessage: "归档完成",
				}),
			],
			{ id: "demo-dropdown-group", label: "分组菜单 (ActionGroup)" },
		),
		action.group(
			[
				action.custom({
					id: "auto-hide-child",
					label: "权限不足自动隐藏整组",
					authorize: () => false,
					handler: () => {},
				}),
			],
			{ id: "empty-hidden-group", label: "不应出现的分组" },
		),
	];
}
