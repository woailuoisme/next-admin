import { useTranslations } from "next-intl";
import { useMemoizedFn } from "ahooks";
import { Bookmark, Check, Plus, Trash2 } from "lucide-react";
import { type FormEvent, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "cn";

import type { DataTableSavedView } from "../../core/types";

export interface DataTableSavedViewsProps {
	views: DataTableSavedView[];
	activeViewId?: string | null;
	onApplyView: (viewId: string) => void;
	onSaveCurrentView: (name: string) => void;
	onDeleteView?: (viewId: string) => void;
	className?: string;
}

export function DataTableSavedViews({
	views,
	activeViewId,
	onApplyView,
	onSaveCurrentView,
	onDeleteView,
	className,
}: DataTableSavedViewsProps) {
	const t = useTranslations("table");
	const [open, setOpen] = useState(false);
	const [isCreating, setIsCreating] = useState(false);
	const [newViewName, setNewViewName] = useState("");

	const activeView = views.find((v) => v.id === activeViewId);

	const handleSave = useMemoizedFn((e: FormEvent) => {
		e.preventDefault();
		if (!newViewName.trim()) return;
		onSaveCurrentView(newViewName.trim());
		setNewViewName("");
		setIsCreating(false);
	});

	return (
		<Popover open={open} onOpenChange={setOpen}>
			<PopoverTrigger asChild>
				<Button
					type="button"
					variant="outline"
					size="sm"
					className={cn(
						"h-8 gap-1.5 text-xs text-muted-foreground hover:text-foreground",
						activeView && "border-primary/40 bg-primary/5 font-medium text-primary",
						className,
					)}
				>
					<Bookmark aria-hidden="true" className="size-3.5" />
					<span>{activeView ? activeView.name : t("views_title")}</span>
					{views.length > 0 ? (
						<Badge variant="secondary" className="px-1.5 py-0 font-mono text-[10px]">
							{views.length}
						</Badge>
					) : null}
				</Button>
			</PopoverTrigger>
			<PopoverContent align="start" className="w-64 p-3 shadow-lg">
				<div className="space-y-2.5">
					<div className="border-border/60 flex items-center justify-between border-b pb-2">
						<span className="text-foreground text-xs font-semibold">{t("views_saved_title")}</span>
						{!isCreating && (
							<Button
								type="button"
								variant="ghost"
								size="sm"
								className="text-muted-foreground hover:text-foreground h-6 gap-1 px-1.5 text-[11px]"
								onClick={() => setIsCreating(true)}
							>
								<Plus aria-hidden="true" className="size-3" />
								<span>{t("views_save_current")}</span>
							</Button>
						)}
					</div>

					{/* Create new view form */}
					{isCreating && (
						<form onSubmit={handleSave} className="bg-muted/40 space-y-1.5 rounded-md p-2">
							<Input
								type="text"
								autoFocus
								placeholder={t("views_name_placeholder")}
								value={newViewName}
								onChange={(e) => setNewViewName(e.target.value)}
								className="h-7 w-full text-xs"
							/>
							<div className="flex items-center justify-end gap-1.5 pt-1">
								<Button
									type="button"
									variant="ghost"
									size="sm"
									className="h-6 px-2 text-[11px]"
									onClick={() => {
										setIsCreating(false);
										setNewViewName("");
									}}
								>
									{t("views_cancel")}
								</Button>
								<Button type="submit" size="sm" disabled={!newViewName.trim()} className="h-6 px-2 text-[11px]">
									{t("views_save")}
								</Button>
							</div>
						</form>
					)}

					{/* Views List */}
					<div className="max-h-56 space-y-1 overflow-y-auto pr-0.5">
						{views.length === 0 ? (
							<div className="text-muted-foreground/60 py-3 text-center text-xs italic">{t("views_empty")}</div>
						) : (
							views.map((v) => {
								const isActive = v.id === activeViewId;
								return (
									<div
										key={v.id}
										className={cn(
											"group/view flex items-center justify-between gap-1 rounded-md px-1.5 py-1 text-xs transition-colors",
											isActive ? "bg-primary/10 font-medium text-primary" : "text-foreground hover:bg-muted/50",
										)}
									>
										<button
											type="button"
											onClick={() => {
												onApplyView(v.id);
												setOpen(false);
											}}
											className="focus-visible:ring-ring flex min-w-0 flex-1 cursor-pointer items-center gap-2 rounded-xs px-0.5 py-0.5 text-left focus-visible:ring-1 focus-visible:outline-hidden"
										>
											<Bookmark aria-hidden="true" className="size-3.5 shrink-0 opacity-60" />
											<span className="truncate">{v.name}</span>
											{v.isSystem ? (
												<Badge variant="secondary" className="px-1 py-0 text-[9px] uppercase">
													{t("views_default")}
												</Badge>
											) : null}
										</button>

										<div className="flex shrink-0 items-center gap-1">
											{isActive ? <Check aria-hidden="true" className="text-primary size-3.5" /> : null}
											{!v.isSystem && onDeleteView ? (
												<Button
													type="button"
													variant="ghost"
													size="icon"
													onClick={() => onDeleteView(v.id)}
													className="text-muted-foreground/50 hover:text-destructive size-5 rounded p-0.5 opacity-0 transition-opacity group-hover/view:opacity-100 focus-visible:opacity-100"
													title={t("views_delete_title")}
													aria-label={t("aria_delete_view", { name: v.name })}
												>
													<Trash2 aria-hidden="true" className="size-3" />
												</Button>
											) : null}
										</div>
									</div>
								);
							})
						)}
					</div>
				</div>
			</PopoverContent>
		</Popover>
	);
}
