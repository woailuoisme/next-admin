import { useMemoizedFn } from "ahooks";
import {
  Activity,
  AlertCircle,
  Check,
  Database,
  Plus,
  RefreshCw,
  RotateCcw,
  Trash2,
  Zap,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import { col, DataTable, type DataTableColDef } from "@/components/data-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { createCollection, localOnlyCollectionOptions, useLiveQuery } from "@/lib/db";

export interface ReactiveProductItem {
  id: string;
  title: string;
  category: string;
  status: "active" | "draft";
  price: number;
  stock: number;
}

const INITIAL_DB_ITEMS: ReactiveProductItem[] = [
  {
    id: "prod-101",
    title: "Ergonomic Mechanical Keyboard",
    category: "Hardware",
    status: "active",
    price: 189.99,
    stock: 45,
  },
  {
    id: "prod-102",
    title: "Wireless Precision Mouse",
    category: "Hardware",
    status: "active",
    price: 79.5,
    stock: 120,
  },
  {
    id: "prod-103",
    title: 'Ultra-Wide Gaming Monitor 34"',
    category: "Displays",
    status: "draft",
    price: 599.0,
    stock: 12,
  },
  {
    id: "prod-104",
    title: "Noise-Cancelling Studio Headphones",
    category: "Audio",
    status: "active",
    price: 249.99,
    stock: 28,
  },
  {
    id: "prod-105",
    title: "Magnetic USB-C Charging Dock",
    category: "Accessories",
    status: "draft",
    price: 49.99,
    stock: 64,
  },
];

/**
 * KPI 卡片图标配色（业务功能色统一收敛于此表）
 */
const KPI_ICON_CLASSES = {
  success: "text-emerald-500",
  info: "text-blue-500",
} as const;

// Local simulation flag for showcase demo mutations
let isSimulateErrorActive = false;

export function TanStackDbShowcase() {
  const [simulateError, setSimulateError] = useState(false);

  useEffect(() => {
    return () => {
      isSimulateErrorActive = false;
    };
  }, []);

  // In-memory TanStack DB Collection with differential dataflow and optimistic rollback
  const collection = useMemo(() => {
    return createCollection(
      localOnlyCollectionOptions({
        getKey: (item: ReactiveProductItem) => item.id,
        initialData: INITIAL_DB_ITEMS,
        onUpdate: async () => {
          // Simulate server latency
          await new Promise((resolve) => setTimeout(resolve, 300));
          if (isSimulateErrorActive) {
            throw new Error("Server mutation rejected: [500] Database lock timeout");
          }
        },
        onDelete: async () => {
          await new Promise((resolve) => setTimeout(resolve, 300));
          if (isSimulateErrorActive) {
            throw new Error("Server delete rejected: [403] Insufficient permission");
          }
        },
      }),
    );
  }, []);

  // Live Query subscription: automatically updates with <1ms latency on any changes
  const { data: items = [] } = useLiveQuery((q) => q.from({ item: collection }));

  // Reactive KPI Computations driven by Differential Dataflow
  const totalCount = items.length;
  const activeCount = items.filter((i) => i.status === "active").length;
  const totalStock = items.reduce((sum, i) => sum + i.stock, 0);
  const totalValuation = items.reduce((sum, i) => sum + i.price * i.stock, 0);

  const handleToggleStatus = useMemoizedFn(async (item: ReactiveProductItem) => {
    const nextStatus = item.status === "active" ? "draft" : "active";
    try {
      // Instant 0ms optimistic mutation in memory
      collection.update(item.id, (draft) => {
        draft.status = nextStatus;
      });
      if (!isSimulateErrorActive) {
        toast.success(`Updated "${item.title}" status to ${nextStatus}`);
      }
    } catch {
      toast.error("Auto-Rollback Triggered! Reverted back to original status.");
    }
  });

  const handleAdjustStock = useMemoizedFn(async (item: ReactiveProductItem, delta: number) => {
    try {
      collection.update(item.id, (draft) => {
        draft.stock = Math.max(0, draft.stock + delta);
      });
    } catch {
      toast.error("Auto-Rollback Triggered! Reverted stock value.");
    }
  });

  const handleDelete = useMemoizedFn(async (item: ReactiveProductItem) => {
    try {
      collection.delete(item.id);
      if (!isSimulateErrorActive) {
        toast.success(`Deleted "${item.title}"`);
      }
    } catch {
      toast.error("Auto-Rollback Triggered! Restored item.");
    }
  });

  const handleAddProduct = () => {
    const randomId = `prod-${Math.floor(100 + Math.random() * 900)}`;
    collection.insert({
      id: randomId,
      title: `Smart Device (${randomId})`,
      category: "Gadgets",
      status: "active",
      price: 99.0,
      stock: 25,
    });
    toast.success(`Inserted new product ${randomId}`);
  };

  const handleReset = () => {
    // Re-insert initial items
    for (const item of INITIAL_DB_ITEMS) {
      collection.insert(item);
    }
    toast.info("Reset collection dataset");
  };

  const columns = useMemo<DataTableColDef<ReactiveProductItem>[]>(
    () => [
      col.text<ReactiveProductItem>("title", "Product Title", {
        description: (r) => `SKU: ${r.id}`,
        weight: "semibold",
        flex: 1,
      }),
      col.badge<ReactiveProductItem>("category", "Category", {
        variant: "outline",
        width: 130,
      }),
      {
        field: "stock",
        headerName: "Stock (Live Edit)",
        width: 170,
        renderCell: ({ row }) => (
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="h-6 w-6 p-0 font-mono text-xs"
              onClick={() => handleAdjustStock(row, -1)}
              disabled={row.stock <= 0}
            >
              -
            </Button>
            <span className="min-w-8 text-center font-mono text-xs font-semibold">{row.stock}</span>
            <Button
              variant="outline"
              size="sm"
              className="h-6 w-6 p-0 font-mono text-xs"
              onClick={() => handleAdjustStock(row, 1)}
            >
              +
            </Button>
          </div>
        ),
      },
      col.currency<ReactiveProductItem>("price", "Price", {
        currency: "USD",
        locale: "en-US",
        width: 130,
      }),
      {
        field: "status",
        headerName: "Status (0ms Toggle)",
        width: 160,
        renderCell: ({ row }) => (
          <Button
            variant={row.status === "active" ? "default" : "secondary"}
            size="sm"
            className="h-7 gap-1.5 text-xs"
            onClick={() => handleToggleStatus(row)}
          >
            {row.status === "active" ? (
              <>
                <Check className="h-3 w-3" /> Active
              </>
            ) : (
              "Draft"
            )}
          </Button>
        ),
      },
      {
        field: "actions",
        headerName: "Actions",
        width: 80,
        align: "center",
        renderCell: ({ row }) => (
          <Button
            variant="ghost"
            size="sm"
            className="text-muted-foreground hover:text-destructive h-7 w-7 p-0"
            onClick={() => handleDelete(row)}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        ),
      },
    ],
    [handleToggleStatus, handleAdjustStock, handleDelete],
  );

  return (
    <Card className="border-border/60 max-w-full min-w-0 overflow-hidden shadow-xs">
      <CardHeader className="pb-3">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="border-primary/20 bg-primary/10 text-primary rounded-md border p-1">
                <Database className="h-4 w-4" />
              </div>
              <CardTitle className="text-base font-semibold">
                TanStack DB 响应式客户端数据库展示 (Reactive Live Grid)
              </CardTitle>
              <Badge variant="outline" className="border-primary/20 bg-primary/10 text-primary text-[10px]">
                Beta v0.5
              </Badge>
            </div>
            <CardDescription className="text-xs">
              基于 <strong>Differential Dataflow（差异数据流）</strong> 与内存 Collection。 实现 0ms
              乐观更新、跨组件极速响应与服务端报错自动原子回滚。
            </CardDescription>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant={simulateError ? "destructive" : "outline"}
              size="sm"
              className="h-8 gap-1.5 text-xs"
              onClick={() => {
                const next = !simulateError;
                isSimulateErrorActive = next;
                setSimulateError(next);
                if (next) {
                  toast.warning("已开启「模拟网络报错」：修改操作将在 300ms 后失败并自动回滚！");
                } else {
                  toast.info("已关闭「模拟网络报错」：修改操作将正常持久化。");
                }
              }}
            >
              <AlertCircle className="h-3.5 w-3.5" />
              {simulateError ? "模拟报错中 (回滚生效)" : "开启模拟报错测试"}
            </Button>

            <Button variant="outline" size="sm" className="h-8 gap-1.5 text-xs" onClick={handleAddProduct}>
              <Plus className="h-3.5 w-3.5" />
              添加商品
            </Button>

            <Button
              variant="ghost"
              size="sm"
              className="text-muted-foreground hover:text-foreground h-8 text-xs"
              onClick={handleReset}
            >
              <RotateCcw className="h-3.5 w-3.5" />
              重置数据
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="max-w-full min-w-0 space-y-4 overflow-hidden">
        {/* Reactive Real-time KPI Cards (Live computed via useLiveQuery) */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="border-border/50 bg-muted/20 rounded-lg border p-3">
            <div className="text-muted-foreground flex items-center justify-between text-xs">
              <span>总 SKU 数量</span>
              <Zap className="text-primary h-3.5 w-3.5" />
            </div>
            <div className="text-foreground mt-1 font-mono text-xl font-bold tracking-tight">
              {totalCount}
            </div>
            <p className="text-muted-foreground mt-0.5 text-[10px]">0ms 实时增量统计</p>
          </div>

          <div className="border-border/50 bg-muted/20 rounded-lg border p-3">
            <div className="text-muted-foreground flex items-center justify-between text-xs">
              <span>正常在售 SKU</span>
              <Activity className={`h-3.5 w-3.5 ${KPI_ICON_CLASSES.success}`} />
            </div>
            <div className="text-foreground mt-1 font-mono text-xl font-bold tracking-tight">
              {activeCount}
            </div>
            <p className="text-muted-foreground mt-0.5 text-[10px]">点击右侧按钮瞬间切换</p>
          </div>

          <div className="border-border/50 bg-muted/20 rounded-lg border p-3">
            <div className="text-muted-foreground flex items-center justify-between text-xs">
              <span>全库件数总量</span>
              <RefreshCw className={`h-3.5 w-3.5 ${KPI_ICON_CLASSES.info}`} />
            </div>
            <div className="text-foreground mt-1 font-mono text-xl font-bold tracking-tight">
              {totalStock}
            </div>
            <p className="text-muted-foreground mt-0.5 text-[10px]">加减库存动态汇总</p>
          </div>

          <div className="border-border/50 bg-muted/20 rounded-lg border p-3">
            <div className="text-muted-foreground flex items-center justify-between text-xs">
              <span>库存总资产估值</span>
              <span className="text-primary font-mono text-xs">$</span>
            </div>
            <div className="text-foreground mt-1 font-mono text-xl font-bold tracking-tight">
              $
              {totalValuation.toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </div>
            <p className="text-muted-foreground mt-0.5 text-[10px]">单价 × 库存实时乘积</p>
          </div>
        </div>

        {/* TanStack DB Driven DataTable */}
        <div className="border-border/60 bg-card max-w-full min-w-0 overflow-hidden rounded-lg border">
          <DataTable rows={items} columns={columns} getRowId={(row) => row.id} hidePagination />
        </div>
      </CardContent>
    </Card>
  );
}
