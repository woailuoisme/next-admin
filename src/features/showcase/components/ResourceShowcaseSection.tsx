import { BadgeCheck, Code2, Eye, Layers, Pencil, Plus, Sparkles } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import type { ResourcePresentation } from "@/components/resource";
import { CopyButton } from "@/components/shared/CopyButton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "cn";

import {
	buildCustomerSampleCode,
	INITIAL_CUSTOMER,
	type SampleCustomer,
	SHOWCASE_ACCENT_CLASSES,
} from "./resourceShowcaseData";
import { ResourceShowcaseModals } from "./ResourceShowcaseModals";

const PRESENTATION_MODES = [
	{ key: "dialog", label: "🪟 Dialog (弹窗)" },
	{ key: "drawer", label: "📑 Drawer (抽屉)" },
	{ key: "page", label: "📄 Page (独立页)" },
] as const;

function createNewCustomerDefaults(): SampleCustomer {
	return {
		id: `cust-${Math.floor(1000 + Math.random() * 9000)}`,
		name: "",
		email: "",
		company: "",
		tier: "pro",
		isActive: true,
		notes: "",
	};
}

export function ResourceShowcaseSection() {
	const [presentation, setPresentation] = useState<ResourcePresentation>("dialog");
	const [customer, setCustomer] = useState<SampleCustomer>(INITIAL_CUSTOMER);
	const [activeMode, setActiveMode] = useState<"create" | "edit" | "view" | null>(null);

	const [newCustomerDefaults, setNewCustomerDefaults] = useState<SampleCustomer>(createNewCustomerDefaults);

	const sampleCode = buildCustomerSampleCode(presentation);

	const openCreate = () => {
		setNewCustomerDefaults(createNewCustomerDefaults());
		setActiveMode("create");
		toast.info(`Triggered Create operation in [${presentation}] presentation mode`);
	};

	const openEdit = (id: string) => {
		setActiveMode("edit");
		toast.info(`Triggered Edit operation for #${id} in [${presentation}] mode`);
	};

	const openView = (id: string) => {
		setActiveMode("view");
		toast.info(`Triggered View operation for #${id} in [${presentation}] mode`);
	};

	return (
		<Card className="border-border/70 overflow-hidden shadow-xs">
			<CardHeader className="border-border/60 bg-muted/20 border-b pb-4">
				<div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
					<div>
						<div className="flex items-center gap-2">
							<span className="bg-primary/10 text-primary flex size-7 items-center justify-center rounded-lg">
								<Layers className="size-4" aria-hidden="true" />
							</span>
							<CardTitle className="text-base font-semibold">Filament v5 工业级 Resource CRUD 宿主架构</CardTitle>
							<Badge variant="outline" className="border-primary/30 text-primary text-[11px]">
								Dialog · Drawer · Page
							</Badge>
						</div>
						<CardDescription className="mt-1 text-xs">
							对标 Laravel Filament v5 体系设计。同一套表单和详情视图，支持在居中模态框 (Dialog)、右侧滑动抽屉
							(Drawer/SlideOver) 与独立路由页面 (Page) 三种工业级形态之间零成本无缝切换。
						</CardDescription>
					</div>

					<div className="border-border/70 bg-background/80 flex items-center gap-1 rounded-lg border p-1 shadow-xs">
						{PRESENTATION_MODES.map((item) => (
							<Button
								key={item.key}
								type="button"
								variant={presentation === item.key ? "default" : "ghost"}
								size="xs"
								aria-pressed={presentation === item.key}
								onClick={() => setPresentation(item.key)}
								className={cn(
									"px-2.5 text-xs font-medium",
									presentation !== item.key && "text-muted-foreground hover:text-foreground",
								)}
							>
								{item.label}
							</Button>
						))}
					</div>
				</div>
			</CardHeader>

			<CardContent className="flex flex-col gap-6 p-6">
				<div className="border-border/60 bg-muted/15 flex flex-col justify-between gap-4 rounded-xl border p-4 sm:flex-row sm:items-center">
					<div className="flex flex-col gap-1">
						<div className="text-foreground text-sm font-medium">
							当前演示形态：<span className="text-primary ml-1 font-semibold capitalize">{presentation} Mode</span>
						</div>
						<div className="text-muted-foreground text-xs">
							点击下方操作按钮，直接预览在当前形态下唤起的表单与详情视图：
						</div>
					</div>

					<div className="flex flex-wrap items-center gap-2.5">
						<Button type="button" size="sm" onClick={openCreate} className="text-xs shadow-xs">
							<Plus data-icon="inline-start" aria-hidden="true" />
							<span>新建客户 (Create)</span>
						</Button>
						<Button
							type="button"
							variant="outline"
							size="sm"
							onClick={() => openEdit(customer.id)}
							className="text-xs shadow-xs"
						>
							<Pencil data-icon="inline-start" aria-hidden="true" />
							<span>编辑客户 (Edit)</span>
						</Button>
						<Button
							type="button"
							variant="secondary"
							size="sm"
							onClick={() => openView(customer.id)}
							className="text-xs shadow-xs"
						>
							<Eye data-icon="inline-start" aria-hidden="true" />
							<span>查看详情 (View)</span>
						</Button>
					</div>
				</div>

				<div className="grid grid-cols-1 gap-4 md:grid-cols-3">
					<div className="border-border/60 bg-card flex flex-col gap-2 rounded-lg border p-4">
						<div className="text-foreground flex items-center gap-2 text-xs font-semibold">
							<BadgeCheck className={`size-4 shrink-0 ${SHOWCASE_ACCENT_CLASSES.success}`} aria-hidden="true" />
							<span>100% 视图与逻辑零冗余复用</span>
						</div>
						<p className="text-muted-foreground text-xs leading-relaxed">
							表单控件、校验规则、提交变更与详情展示结构只需定义一次。无论嵌入弹窗、滑出抽屉还是全屏路由，UI
							与状态机完全同构。
						</p>
					</div>

					<div className="border-border/60 bg-card flex flex-col gap-2 rounded-lg border p-4">
						<div className="text-foreground flex items-center gap-2 text-xs font-semibold">
							<BadgeCheck className={`size-4 shrink-0 ${SHOWCASE_ACCENT_CLASSES.info}`} aria-hidden="true" />
							<span>双轨路由与搜索参数自动适配</span>
						</div>
						<p className="text-muted-foreground text-xs leading-relaxed">
							生产级 <code>ResourceScaffold</code> 会自动同步 <code>?create=true</code>、<code>?editId=xxx</code> 与详情
							URL 参数；页面模式自动接入 Next.js App Router 子路由跳转。
						</p>
					</div>

					<div className="border-border/60 bg-card flex flex-col gap-2 rounded-lg border p-4">
						<div className="text-foreground flex items-center gap-2 text-xs font-semibold">
							<BadgeCheck className={`size-4 shrink-0 ${SHOWCASE_ACCENT_CLASSES.warning}`} aria-hidden="true" />
							<span>吸底操作栏与未保存拦截守卫</span>
						</div>
						<p className="text-muted-foreground text-xs leading-relaxed">
							包含 Filament
							标志性的“保存并继续编辑”操作、页面离开前未保存修改脏检查警告，以及负外边距中和与精确滚动穿透控制。
						</p>
					</div>
				</div>

				{presentation === "page" ? (
					<div className="border-primary/30 bg-primary/5 flex flex-col gap-3 rounded-xl border-2 border-dashed p-4">
						<div className="flex items-center justify-between">
							<div className="text-primary flex items-center gap-2 text-xs font-semibold">
								<Sparkles className="size-4" aria-hidden="true" />
								<span>Page 模式运行机制</span>
							</div>
							<Badge variant="outline" className="border-primary/40 bg-background text-[10px]">
								Full Route Page
							</Badge>
						</div>
						<p className="text-muted-foreground text-xs leading-relaxed">
							在生产项目中，Page 模式通常直接映射到独立 App Router 页面（如 <code>/customers/create</code> 或{" "}
							<code>/customers/[id]/edit</code>）。
						</p>
					</div>
				) : null}

				<div className="border-border/60 bg-muted/40 relative rounded-lg border p-4 font-mono text-xs">
					<div className="border-border/50 text-muted-foreground flex items-center justify-between border-b pb-2 text-[11px]">
						<span className="flex items-center gap-1.5">
							<Code2 className="size-3.5" aria-hidden="true" />
							<span>标准业务集成范例 (Resource Form / View Host)</span>
						</span>
						<CopyButton text={sampleCode} title="复制代码片段" />
					</div>
					<pre className="text-foreground overflow-x-auto pt-3 text-[11px] leading-relaxed">{sampleCode}</pre>
				</div>
			</CardContent>

			<ResourceShowcaseModals
				presentation={presentation}
				customer={customer}
				onSaveCustomer={setCustomer}
				isCreateOpen={activeMode === "create"}
				isEditOpen={activeMode === "edit"}
				isViewOpen={activeMode === "view"}
				isEditing={activeMode === "edit"}
				newCustomerDefaults={newCustomerDefaults}
				onCloseForm={() => setActiveMode(null)}
				onCloseView={() => setActiveMode(null)}
				onOpenEdit={openEdit}
			/>
		</Card>
	);
}
