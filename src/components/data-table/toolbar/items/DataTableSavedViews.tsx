"use client";

import { useTranslations } from "next-intl";
import { Bookmark, Check, Plus, Trash2 } from "lucide-react";
import { type FormEvent, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
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

	const handleOpenChange = (nextOpen: boolean) => {
		setOpen(nextOpen);
		if (!nextOpen) {
			setIsCreating(false);
			setNewViewName("");
		}
	};

	const handleSave = (e: FormEvent) => {
		e.preventDefault();
		if (!newViewName.trim()) return;
		onSaveCurrentView(newViewName.trim());
		setNewViewName("");
		setIsCreating(false);
	};

	return (
		<Popover open={open} onOpenChange={handleOpenChange}>
			<PopoverTrigger asChild>
				<Button
					type="button"
					variant="outline"
					size="sm"
					className={cn(
						"h-8 text-xs text-muted-foreground hover:text-foreground",
						activeView && "border-primary/40 bg-primary/5 font-medium text-primary",
						className,
					)}
				>
					<Bookmark aria-hidden="true" data-icon="inline-start" />
					<span>{activeView ? activeView.name : t("views_title")}</span>
					{views.length > 0 ? (
						<Badge variant="secondary" className="px-1.5 py-0 font-mono text-[10px]">
							{views.length}
						</Badge>
					) : null}
				</Button>
			</PopoverTrigger>
			<PopoverContent align="start" className="w-64 p-3 shadow-lg">
				<div className="flex flex-col gap-2.5">
					<div className="flex items-center justify-between">
						<span className="text-foreground text-xs font-semibold">{t("views_saved_title")}</span>
						{!isCreating ? (
							<Button
								type="button"
								variant="ghost"
								size="xs"
								className="text-muted-foreground hover:text-foreground px-1.5 text-[11px]"
								onClick={() => setIsCreating(true)}
							>
								<Plus aria-hidden="true" data-icon="inline-start" />
								<span>{t("views_save_current")}</span>
							</Button>
						) : null}
					</div>

					<Separator />

					{/* Create new view form */}
					{isCreating ? (
						<form onSubmit={handleSave} className="bg-muted/40 flex flex-col gap-1.5 rounded-md p-2">
							<Input
								type="text"
								autoFocus
								placeholder={t("views_name_placeholder")}
								aria-label={t("views_name_placeholder")}
								value={newViewName}
								onChange={(e) => setNewViewName(e.target.value)}
								className="h-7 w-full text-xs"
							/>
							<div className="flex items-center justify-end gap-1.5 pt-1">
								<Button
									type="button"
									variant="ghost"
									size="xs"
									className="text-[11px]"
									onClick={() => {
										setIsCreating(false);
										setNewViewName("");
									}}
								>
									{t("views_cancel")}
								</Button>
								<Button type="submit" size="xs" disabled={!newViewName.trim()} className="text-[11px]">
									{t("views_save")}
								</Button>
							</div>
						</form>
					) : null}

					{/* Views List */}
					<div className="flex max-h-56 flex-col gap-1 overflow-y-auto pr-0.5">
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
										<Button
											type="button"
											variant="ghost"
											size="xs"
											onClick={() => {
												onApplyView(v.id);
												setOpen(false);
											}}
											className="h-auto min-w-0 flex-1 justify-start gap-2 rounded-xs px-0.5 py-0.5 text-left font-normal hover:bg-transparent"
										>
											<Bookmark aria-hidden="true" data-icon="inline-start" className="opacity-60" />
											<span className="truncate">{v.name}</span>
											{v.isSystem ? (
												<Badge variant="secondary" className="px-1 py-0 text-[9px] uppercase">
													{t("views_default")}
												</Badge>
											) : null}
										</Button>

										<div className="flex shrink-0 items-center gap-1">
											{isActive ? <Check aria-hidden="true" className="text-primary size-3.5" /> : null}
											{!v.isSystem && onDeleteView ? (
												<Button
													type="button"
													variant="ghost"
													size="icon-xs"
													onClick={() => onDeleteView(v.id)}
													className="text-muted-foreground/50 hover:text-destructive opacity-0 transition-opacity group-hover/view:opacity-100 focus-visible:opacity-100"
													title={t("views_delete_title")}
													aria-label={t("aria_delete_view", { name: v.name })}
												>
													<Trash2 aria-hidden="true" />
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
