import { ArrowDownToLine, FileSpreadsheet, FileText, Printer } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import type { DataTableExportMenuProps } from "../types";

export function DataTableExportMenu({
  onExportExcel = () => {},
  onExportCsv = () => {},
  onExportJson = () => {},
  onPrint = () => {},
}: DataTableExportMenuProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="text-muted-foreground hover:text-foreground h-8 gap-1.5 text-xs"
        >
          <ArrowDownToLine className="size-3.5" />
          <span>Export</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-44">
        <DropdownMenuItem onClick={onExportExcel} className="gap-2 text-xs">
          <FileSpreadsheet className="text-muted-foreground size-3.5" />
          <span>Export Excel (.xlsx)</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={onExportCsv} className="gap-2 text-xs">
          <FileText className="text-muted-foreground size-3.5" />
          <span>Download CSV</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={onExportJson} className="gap-2 text-xs">
          <FileText className="text-muted-foreground size-3.5" />
          <span>Export JSON</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={onPrint} className="gap-2 text-xs">
          <Printer className="text-muted-foreground size-3.5" />
          <span>Print View</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
