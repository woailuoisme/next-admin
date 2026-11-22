"use client";

import { MousePointerClick } from "lucide-react";
import { useId, useState } from "react";

import { ActionList } from "@/components/actions";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AccessControlProvider } from "@/lib/resource";

import {
	buildArticleDataActions,
	buildArticleRowActions,
	buildGroupedDemos,
	buildModalDemos,
	type DemoArticle,
	INITIAL_DEMO_ARTICLES,
} from "./actionDemos";

export function ActionsShowcasePage() {
	const adminSwitchId = useId();
	const publishSwitchId = useId();
	const [articles, setArticles] = useState<DemoArticle[]>(INITIAL_DEMO_ARTICLES);
	const [isAdmin, setIsAdmin] = useState(true);
	const [allowPublish, setAllowPublish] = useState(true);
	const [lastEvent, setLastEvent] = useState<string>("等待交互...");

	const modalDemos = buildModalDemos(articles.length, setLastEvent);
	const groupedDemos = buildGroupedDemos(isAdmin, allowPublish, setLastEvent);
	const dataActions = buildArticleDataActions(articles, setArticles, setLastEvent);
	const rowActionEntries = buildArticleRowActions(setArticles, setLastEvent);

	return (
		<AccessControlProvider evaluator={() => isAdmin}>
			<div className="space-y-6">
				<div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
					<div>
						<div className="flex items-center gap-2">
							<span className="bg-primary/10 text-primary flex size-8 items-center justify-center rounded-lg">
								<MousePointerClick className="size-4" />
							</span>
							<h1 className="text-2xl font-bold tracking-tight">Filament v5 Actions 统一动作引擎</h1>
						</div>
						<p className="text-muted-foreground mt-1 text-xs">
							单一声明式抽象贯通 Page Header、Table Row、Batch Bar、SlideOver 抽屉、导入导出与软删生命周期。
						</p>
					</div>
					<Badge variant="outline" className="w-fit text-xs">
						最近状态：{lastEvent}
					</Badge>
				</div>

				<Tabs defaultValue="modals" className="space-y-4">
					<TabsList>
						<TabsTrigger value="modals" className="text-xs">
							Modals & SlideOver
						</TabsTrigger>
						<TabsTrigger value="grouping" className="text-xs">
							Grouping & RBAC
						</TabsTrigger>
						<TabsTrigger value="prebuilt" className="text-xs">
							Import / Export / Lifecycle
						</TabsTrigger>
					</TabsList>

					<TabsContent value="modals">
						<Card>
							<CardHeader>
								<CardTitle className="text-base">确认框、表单弹窗、SlideOver 与生命周期钩子</CardTitle>
								<CardDescription className="text-xs">
									所有交互均由 ActionModalHost 统一托管，无需业务组件手动维护 open 状态。
								</CardDescription>
							</CardHeader>
							<CardContent>
								<ActionList actions={modalDemos} surface="toolbar" />
							</CardContent>
						</Card>
					</TabsContent>

					<TabsContent value="grouping">
						<Card>
							<CardHeader>
								<CardTitle className="text-base">ActionGroup 分组与权限联动</CardTitle>
								<CardDescription className="text-xs">
									支持 ButtonGroup、DropdownMenu（含分割线与空分组自动折叠）与动态 RBAC 授权。
								</CardDescription>
							</CardHeader>
							<CardContent className="space-y-5">
								<div className="border-border/60 bg-muted/20 flex flex-wrap items-center gap-6 rounded-lg border p-3 text-xs">
									<label htmlFor={adminSwitchId} className="flex cursor-pointer items-center gap-2">
										<Switch id={adminSwitchId} checked={isAdmin} onCheckedChange={setIsAdmin} />
										<span>当前角色：管理员 (Admin)</span>
									</label>
									<label htmlFor={publishSwitchId} className="flex cursor-pointer items-center gap-2">
										<Switch id={publishSwitchId} checked={allowPublish} onCheckedChange={setAllowPublish} />
										<span>允许批量发布</span>
									</label>
								</div>
								<ActionList actions={groupedDemos} surface="toolbar" />
							</CardContent>
						</Card>
					</TabsContent>

					<TabsContent value="prebuilt">
						<Card>
							<CardHeader className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
								<div>
									<CardTitle className="text-base">Replicate / ForceDelete / Restore / Import / Export</CardTitle>
									<CardDescription className="text-xs">
										演示活动记录（复制 / 移入回收站）与软删记录（恢复 / 永久删除）的完整生命周期流转。
									</CardDescription>
								</div>
								<ActionList actions={dataActions} surface="toolbar" />
							</CardHeader>
							<CardContent>
								<div className="border-border/70 divide-border/60 divide-y rounded-lg border">
									{articles.map((article) => (
										<div
											key={article.id}
											className="flex flex-col justify-between gap-3 px-4 py-3 sm:flex-row sm:items-center"
										>
											<div className="space-y-1">
												<div className="flex items-center gap-2">
													<span className="text-sm font-medium">{article.title}</span>
													<Badge variant={article.deletedAt ? "destructive" : "secondary"} className="text-[10px]">
														{article.deletedAt ? "Trashed" : article.status}
													</Badge>
												</div>
												<p className="text-muted-foreground text-xs">
													{article.category} · {article.views} views
												</p>
											</div>
											<ActionList actions={rowActionEntries} payload={article} surface="cell" maxInline={3} />
										</div>
									))}
								</div>
							</CardContent>
						</Card>
					</TabsContent>
				</Tabs>
			</div>
		</AccessControlProvider>
	);
}
