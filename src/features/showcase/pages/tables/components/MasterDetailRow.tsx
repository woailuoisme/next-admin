import { Sparkles } from "lucide-react";
import { toast } from "sonner";

import { CopyButton } from "@/components/shared/CopyButton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

import type { ShowcaseItem } from "../types";

export interface MasterDetailRowProps {
	row: ShowcaseItem;
	collapse: () => void;
}

export function MasterDetailRow({ row, collapse }: MasterDetailRowProps) {
	return (
		<div className="grid grid-cols-1 gap-4 p-4 md:grid-cols-3">
			{/* Column 1: Inventory & Specs */}
			<div className="border-border/50 bg-background/50 flex flex-col gap-2 rounded-lg border p-3.5">
				<div className="flex items-center justify-between">
					<span className="text-foreground text-xs font-semibold">SKU & Batch Details</span>
					<Badge variant="outline" className="text-[10px] tracking-wider uppercase">
						{row.category}
					</Badge>
				</div>
				<div className="text-muted-foreground flex flex-col gap-1 text-xs">
					<p className="flex justify-between">
						<span>Item ID:</span> <span className="text-foreground font-mono">{row.id}</span>
					</p>
					<p className="flex justify-between">
						<span>Unit Price:</span> <span className="text-foreground font-medium">${row.price.toFixed(2)}</span>
					</p>
					<p className="flex justify-between">
						<span>Available Stock:</span>{" "}
						<span className={row.stock < 20 ? "text-destructive font-bold" : "text-foreground"}>{row.stock} units</span>
					</p>
					<p className="flex justify-between">
						<span>Quality Rating:</span> <span className="text-foreground">⭐ {row.rating} / 5.0</span>
					</p>
				</div>
				<div className="pt-1">
					<p className="text-muted-foreground mb-1 text-[11px] font-medium">Product Tags</p>
					<div className="flex flex-wrap gap-1">
						{row.tags.map((tag) => (
							<Badge key={tag} variant="secondary" className="px-1.5 py-0 text-[10px]">
								{tag}
							</Badge>
						))}
					</div>
				</div>
			</div>

			{/* Column 2: API Keys & Integration */}
			<div className="border-border/50 bg-background/50 flex flex-col gap-2 rounded-lg border p-3.5">
				<span className="text-foreground text-xs font-semibold">Integration & API Credentials</span>
				<div className="flex flex-col gap-1.5">
					<p className="text-muted-foreground text-[11px]">Live Webhook Key</p>
					<div className="border-border/60 bg-muted/30 flex items-center justify-between gap-1.5 rounded-md border px-2 py-1 font-mono text-[11px]">
						<span className="truncate">{row.apiKey}</span>
						<CopyButton
							text={row.apiKey}
							title="Copy API key"
							successMessage="API key copied to clipboard!"
							className="shrink-0"
						/>
					</div>
				</div>
				<div className="text-muted-foreground pt-1 text-xs">
					<p className="text-foreground font-medium">Audit Notes:</p>
					<p className="bg-muted/20 text-muted-foreground mt-0.5 rounded p-1.5 text-[11px] italic">"{row.notes}"</p>
				</div>
			</div>

			{/* Column 3: Lead & Quick Actions */}
			<div className="border-border/50 bg-background/50 flex flex-col justify-between gap-3 rounded-lg border p-3.5">
				<div className="flex flex-col gap-2">
					<span className="text-foreground text-xs font-semibold">Author & Operations</span>
					<div className="flex items-center gap-2.5">
						<Avatar className="size-8">
							{row.author.avatarUrl && <AvatarImage src={row.author.avatarUrl} alt={row.author.name ?? "User"} />}
							<AvatarFallback className="bg-primary/10 text-primary text-xs font-bold">
								{row.author.name?.charAt(0) ?? "?"}
							</AvatarFallback>
						</Avatar>
						<div className="flex flex-col gap-0.5 text-xs">
							<p className="text-foreground leading-none font-medium">{row.author.name ?? "Unassigned"}</p>
							<p className="text-muted-foreground text-[11px]">{row.author.subtitle ?? "Team Member"}</p>
						</div>
					</div>
				</div>

				<div className="flex items-center gap-2 pt-2">
					<Button
						type="button"
						variant="outline"
						size="sm"
						className="flex-1 text-xs"
						onClick={() => toast.info(`Restock triggered for ${row.id}`)}
					>
						<Sparkles data-icon="inline-start" className="text-primary" aria-hidden="true" />
						Restock
					</Button>
					<Button type="button" variant="secondary" size="sm" className="text-xs" onClick={collapse}>
						Collapse
					</Button>
				</div>
			</div>
		</div>
	);
}
