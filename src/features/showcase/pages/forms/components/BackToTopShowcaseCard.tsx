"use client";

import { useMemoizedFn } from "ahooks";
import { Lightbulb } from "lucide-react";
import { useId, useRef, useState } from "react";

import { BackToTop } from "@/components/shared/BackToTop";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

import { LOCAL_SCROLL_ITEMS } from "../constants";

export function BackToTopShowcaseCard() {
	const checkboxId = useId();
	const localContainerRef = useRef<HTMLDivElement>(null);
	const [showProgress, setShowProgress] = useState(true);

	// Whitelist AGENTS.md §5.2: 保持传给 BackToTop 的滚动容器 getter 引用稳定，避免重订阅 scroll 监听
	const getLocalScrollTarget = useMemoizedFn(() => localContainerRef.current);

	return (
		<Card className="border-border/60">
			<CardHeader className="pb-3">
				<div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
					<div>
						<CardTitle className="text-sm font-semibold">BackToTop 返回顶部组件交互体验</CardTitle>
						<CardDescription className="text-xs">
							支持全屏主窗口与局部可滚动容器双重场景，具备 SVG 动态进度环与平滑回滚。
						</CardDescription>
					</div>
					<div className="flex items-center gap-2 select-none">
						<Label htmlFor={checkboxId} className="text-muted-foreground cursor-pointer text-xs font-normal">
							显示环形进度条
						</Label>
						<Checkbox
							id={checkboxId}
							checked={showProgress}
							onCheckedChange={(checked) => setShowProgress(Boolean(checked))}
							className="cursor-pointer"
						/>
					</div>
				</div>
			</CardHeader>
			<CardContent className="flex flex-col gap-4 text-xs">
				<p className="bg-muted/40 text-muted-foreground flex items-start gap-1.5 rounded-md p-2.5">
					<Lightbulb className="text-primary mt-0.5 size-3.5 shrink-0" aria-hidden="true" />
					<span>
						<strong>全局模式提示</strong>：向下滚动当前表单页面超过
						300px，页面右下角将自动浮现带有实时滚动进度环的全局返回顶部按钮。
					</span>
				</p>
				<div className="relative">
					<div className="text-foreground/80 mb-2 font-medium">
						局部容器模式演示（设置了 <code>threshold=60</code> 并绑定局部容器）：
					</div>
					<div
						ref={localContainerRef}
						className="border-border/70 bg-muted/20 relative flex h-44 flex-col gap-3 overflow-y-auto rounded-lg border p-4"
					>
						{LOCAL_SCROLL_ITEMS.map((item) => (
							<div key={item.id} className="border-border/50 bg-background/80 rounded-md border p-3 shadow-xs">
								<span className="text-primary font-semibold">{item.title}</span>
								<p className="text-muted-foreground mt-1 text-xs leading-relaxed">
									这里是局部可滚动容器内容。在长列表、聊天消息流或抽屉弹窗中，通过{" "}
									<code>target=&#123;() =&gt; containerRef.current&#125;</code> 即可让 BackToTop
									组件精准监听并回滚至该容器顶部。
								</p>
							</div>
						))}
						<BackToTop
							target={getLocalScrollTarget}
							threshold={60}
							showProgress={showProgress}
							className="absolute right-4 bottom-4"
						/>
					</div>
				</div>
			</CardContent>
		</Card>
	);
}
