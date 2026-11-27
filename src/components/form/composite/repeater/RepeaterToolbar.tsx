"use client";

import { ChevronsDownUp, ChevronsUpDown } from "lucide-react";
import { useTranslations } from "next-intl";
import type { ReactNode } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface RepeaterToolbarProps {
	itemCount: number;
	maxItems?: number;
	showCollapseControls: boolean;
	onExpandAll: () => void;
	onCollapseAll: () => void;
	extraActions?: ReactNode;
}

export function RepeaterToolbar({
	itemCount,
	maxItems,
	showCollapseControls,
	onExpandAll,
	onCollapseAll,
	extraActions,
}: RepeaterToolbarProps) {
	const t = useTranslations("form");

	if (itemCount === 0 && !showCollapseControls && !extraActions) {
		return null;
	}

	return (
		<div className="flex min-h-6 items-center justify-between gap-2">
			<div className="flex items-center gap-1.5">
				{itemCount > 0 ? (
					<Badge variant="secondary" className="h-5 px-1.5 text-xs font-normal">
						<span>{t("repeater_count", { count: itemCount })}</span>
						{maxItems !== undefined ? <span className="text-muted-foreground/80">/ {maxItems}</span> : null}
					</Badge>
				) : null}
			</div>

			<div className="flex items-center gap-1">
				{showCollapseControls ? (
					<>
						<Button
							type="button"
							variant="ghost"
							size="xs"
							onClick={onExpandAll}
							className="text-muted-foreground hover:text-foreground h-6 gap-1 text-xs"
							title={t("repeater_expand_all")}
						>
							<ChevronsUpDown aria-hidden="true" className="size-3" />
							<span>{t("repeater_expand_all")}</span>
						</Button>
						<Button
							type="button"
							variant="ghost"
							size="xs"
							onClick={onCollapseAll}
							className="text-muted-foreground hover:text-foreground h-6 gap-1 text-xs"
							title={t("repeater_collapse_all")}
						>
							<ChevronsDownUp aria-hidden="true" className="size-3" />
							<span>{t("repeater_collapse_all")}</span>
						</Button>
					</>
				) : null}

				{extraActions}
			</div>
		</div>
	);
}
