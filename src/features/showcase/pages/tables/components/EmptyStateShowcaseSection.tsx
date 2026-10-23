import { useState } from "react";
import { Plus, RotateCcw, Sparkles } from "lucide-react";
import { toast } from "sonner";

import { DataTable, type DataTableColDef, TableEmptyState } from "@/components/data-table";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

import { getShowcaseRowId } from "../constants";
import type { ShowcaseItem } from "../types";

export interface EmptyStateShowcaseSectionProps {
  columns: DataTableColDef<ShowcaseItem>[];
}

export function EmptyStateShowcaseSection({ columns }: EmptyStateShowcaseSectionProps) {
  const [showEmptyData, setShowEmptyData] = useState(false);

  return (
    <Card className="border-border/60">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-semibold">Filament v5 Tables Empty State Architecture</CardTitle>
        <CardDescription className="text-xs">
          Pure UI Kit container and integrated DataTable overlay with dual typography, badge icons, action buttons, and
          semantic colors.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6 pt-0">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {/* Size: sm + primary */}
          <div className="border-border/50 bg-card flex flex-col justify-center rounded-xl border p-2">
            <TableEmptyState
              size="sm"
              iconColor="primary"
              heading="No active tasks"
              description="Create a new task to get started."
              actions={[
                {
                  label: "New Task",
                  icon: Plus,
                  onClick: () => toast.success("New Task clicked"),
                },
              ]}
            />
          </div>

          {/* Size: md + warning (Filtered / No Results state) */}
          <div className="border-border/50 bg-card flex flex-col justify-center rounded-xl border p-2">
            <TableEmptyState
              size="md"
              iconColor="warning"
              heading="No matching records"
              description="No records match your active filters or search criteria."
              actions={[
                {
                  label: "Reset filters",
                  icon: RotateCcw,
                  variant: "outline",
                  onClick: () => toast.info("Reset filters clicked"),
                },
              ]}
            />
          </div>

          {/* Size: sm + destructive */}
          <div className="border-border/50 bg-card flex flex-col justify-center rounded-xl border p-2">
            <TableEmptyState
              size="sm"
              iconColor="destructive"
              heading="Connection error"
              description="Failed to retrieve remote table data."
              actions={[
                {
                  label: "Retry",
                  variant: "outline",
                  onClick: () => toast.info("Retry clicked"),
                },
              ]}
            />
          </div>
        </div>

        {/* DataTable with custom emptyState configuration */}
        <div className="border-border/60 bg-muted/20 space-y-3 rounded-xl border p-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <h4 className="text-foreground text-xs font-semibold">DataTable with Empty State Simulation</h4>
              <p className="text-muted-foreground text-[11px]">
                Toggle empty dataset to preview integrated DataTable empty overlay with custom actions.
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="h-7 text-xs"
              onClick={() => setShowEmptyData(!showEmptyData)}
            >
              {showEmptyData ? "Hide Simulation" : "Simulate Empty Table"}
            </Button>
          </div>

          {showEmptyData && (
            <div className="border-border/60 bg-card overflow-hidden rounded-lg border">
              <DataTable
                rows={[]}
                columns={columns.slice(0, 5)}
                getRowId={getShowcaseRowId}
                hidePagination
                emptyState={{
                  iconColor: "primary",
                  heading: "No showcase records found",
                  description: "Get started by generating synthetic records or resetting query params.",
                  actions: [
                    {
                      label: "Restore Records",
                      icon: Sparkles,
                      onClick: () => {
                        setShowEmptyData(false);
                        toast.success("Showcase records restored!");
                      },
                    },
                  ],
                }}
              />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
