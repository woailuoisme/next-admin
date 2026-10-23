import { useMemo, useState } from "react";
import { useMemoizedFn } from "ahooks";
import { Archive, CheckCircle2, Clock } from "lucide-react";

import { DataTable, type DataTableTabItem } from "@/components/data-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

import { MASTER_DETAIL_COLUMNS } from "../columns";
import { getShowcaseRowId, SHOWCASE_SAVED_VIEWS } from "../constants";
import type { ShowcaseItem } from "../types";
import { MasterDetailRow } from "./MasterDetailRow";

export interface MasterDetailTableSectionProps {
  data: ShowcaseItem[];
}

export function MasterDetailTableSection({ data }: MasterDetailTableSectionProps) {
  const [singleExpand, setSingleExpand] = useState<boolean>(false);
  const [expandOnRowClick, setExpandOnRowClick] = useState<boolean>(false);

  const showcaseTabs = useMemo<DataTableTabItem[]>(() => {
    const statusCounts: Record<ShowcaseItem["status"], number> = {
      active: 0,
      draft: 0,
      archived: 0,
    };
    for (const row of data) {
      statusCounts[row.status] += 1;
    }

    return [
      { id: "all", label: "All Records", badge: data.length },
      {
        id: "active",
        label: "Active",
        icon: CheckCircle2,
        badge: statusCounts.active,
        filterModel: {
          items: [{ id: "tab-f1", field: "status", operator: "equals", value: "active" }],
        },
      },
      {
        id: "draft",
        label: "Drafts",
        icon: Clock,
        badge: statusCounts.draft,
        filterModel: {
          items: [{ id: "tab-f2", field: "status", operator: "equals", value: "draft" }],
        },
      },
      {
        id: "archived",
        label: "Archived",
        icon: Archive,
        badge: statusCounts.archived,
        filterModel: {
          items: [{ id: "tab-f3", field: "status", operator: "equals", value: "archived" }],
        },
      },
    ] satisfies DataTableTabItem[];
  }, [data]);

  const renderExpandedRow = useMemoizedFn(({ row, collapse }: { row: ShowcaseItem; collapse: () => void }) => (
    <MasterDetailRow row={row} collapse={collapse} />
  ));

  return (
    <Card className="border-border/60 max-w-full min-w-0 overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <CardTitle className="text-sm font-semibold">
              Enterprise Master-Detail & Saved Views Architecture (Linear & Airtable Pattern)
            </CardTitle>
            <CardDescription className="text-xs">
              Nested row expansion with smooth animations, accordion toggle, and row click mode, integrated with status
              segmented tabs and saved views management.
            </CardDescription>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSingleExpand(!singleExpand)}
              className="h-7 gap-1.5 text-xs"
            >
              <span>Accordion (Single Expand):</span>
              <Badge variant={singleExpand ? "default" : "secondary"} className="text-[10px]">
                {singleExpand ? "Enabled" : "Disabled"}
              </Badge>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setExpandOnRowClick(!expandOnRowClick)}
              className="h-7 gap-1.5 text-xs"
            >
              <span>Row Click Expand:</span>
              <Badge variant={expandOnRowClick ? "default" : "secondary"} className="text-[10px]">
                {expandOnRowClick ? "Enabled" : "Disabled"}
              </Badge>
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="max-w-full min-w-0 overflow-hidden p-0">
        <div className="w-full max-w-full min-w-0 overflow-hidden">
          <DataTable
            rows={data}
            columns={MASTER_DETAIL_COLUMNS}
            getRowId={getShowcaseRowId}
            paginationMode="client"
            pageSize={10}
            tabs={showcaseTabs}
            savedViews={SHOWCASE_SAVED_VIEWS}
            renderExpandedRow={renderExpandedRow}
            expansionProps={{
              singleExpand,
              expandOnRowClick,
            }}
          />
        </div>
      </CardContent>
    </Card>
  );
}
