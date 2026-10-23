import { Copy, Sparkles } from "lucide-react";
import { toast } from "sonner";

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
      <div className="border-border/50 bg-background/50 space-y-2 rounded-lg border p-3.5">
        <div className="flex items-center justify-between">
          <span className="text-foreground text-xs font-semibold">SKU & Batch Details</span>
          <Badge variant="outline" className="text-[10px] tracking-wider uppercase">
            {row.category}
          </Badge>
        </div>
        <div className="text-muted-foreground space-y-1 text-xs">
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
      <div className="border-border/50 bg-background/50 space-y-2 rounded-lg border p-3.5">
        <span className="text-foreground text-xs font-semibold">Integration & API Credentials</span>
        <div className="space-y-1.5">
          <p className="text-muted-foreground text-[11px]">Live Webhook Key</p>
          <div className="border-border/60 bg-muted/30 flex items-center gap-1.5 rounded-md border px-2 py-1 font-mono text-[11px]">
            <span className="truncate">{row.apiKey}</span>
            <Button
              variant="ghost"
              size="icon"
              aria-label="Copy API key"
              className="text-muted-foreground hover:text-foreground h-5 w-5 shrink-0"
              onClick={() => {
                navigator.clipboard.writeText(row.apiKey);
                toast.success("API key copied to clipboard!");
              }}
            >
              <Copy className="h-3 w-3" />
            </Button>
          </div>
        </div>
        <div className="text-muted-foreground pt-1 text-xs">
          <p className="text-foreground font-medium">Audit Notes:</p>
          <p className="bg-muted/20 text-muted-foreground mt-0.5 rounded p-1.5 text-[11px] italic">"{row.notes}"</p>
        </div>
      </div>

      {/* Column 3: Lead & Quick Actions */}
      <div className="border-border/50 bg-background/50 flex flex-col justify-between space-y-3 rounded-lg border p-3.5">
        <div className="space-y-2">
          <span className="text-foreground text-xs font-semibold">Author & Operations</span>
          <div className="flex items-center gap-2.5">
            <Avatar className="h-8 w-8">
              {row.author.avatarUrl && <AvatarImage src={row.author.avatarUrl} alt={row.author.name ?? "User"} />}
              <AvatarFallback className="bg-primary/10 text-primary text-xs font-bold">
                {row.author.name?.charAt(0) ?? "?"}
              </AvatarFallback>
            </Avatar>
            <div className="space-y-0.5 text-xs">
              <p className="text-foreground leading-none font-medium">{row.author.name ?? "Unassigned"}</p>
              <p className="text-muted-foreground text-[11px]">{row.author.subtitle ?? "Team Member"}</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 pt-2">
          <Button
            variant="outline"
            size="sm"
            className="h-7 flex-1 gap-1 text-xs"
            onClick={() => toast.info(`Restock triggered for ${row.id}`)}
          >
            <Sparkles className="text-primary h-3 w-3" />
            Restock
          </Button>
          <Button variant="secondary" size="sm" className="h-7 text-xs" onClick={collapse}>
            Collapse
          </Button>
        </div>
      </div>
    </div>
  );
}
