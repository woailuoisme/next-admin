import { Plus, Trash2 } from "lucide-react";
import React from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

import type {
  DataTableColDef,
  DataTableColType,
  DataTableFilterItem,
  DataTableFilterOperator,
} from "../../../core/types";

export interface QueryBuilderControlProps<TData = any> {
  filterableColumns: DataTableColDef<TData>[];
  rules: DataTableFilterItem[];
  onAddRule: (field: string, operator?: DataTableFilterOperator, value?: any) => void;
  onUpdateRule: (id: string, patch: Partial<DataTableFilterItem>) => void;
  onRemoveRule: (id: string) => void;
}

export function getOperatorsForColumn(
  type?: DataTableColType,
): Array<{ value: DataTableFilterOperator; label: string }> {
  switch (type) {
    case "number":
      return [
        { value: "equals", label: "= equals" },
        { value: "notEquals", label: "!= not equals" },
        { value: "greaterThan", label: "> greater than" },
        { value: "greaterThanOrEqual", label: ">= greater or equal" },
        { value: "lessThan", label: "< less than" },
        { value: "lessThanOrEqual", label: "<= less or equal" },
        { value: "isEmpty", label: "is empty" },
        { value: "isNotEmpty", label: "is not empty" },
      ];
    case "date":
    case "dateTime":
      return [
        { value: "equals", label: "is" },
        { value: "notEquals", label: "is not" },
        { value: "greaterThan", label: "after" },
        { value: "greaterThanOrEqual", label: "on or after" },
        { value: "lessThan", label: "before" },
        { value: "lessThanOrEqual", label: "on or before" },
        { value: "isEmpty", label: "is empty" },
        { value: "isNotEmpty", label: "is not empty" },
      ];
    case "boolean":
      return [
        { value: "equals", label: "equals" },
        { value: "isEmpty", label: "is empty" },
        { value: "isNotEmpty", label: "is not empty" },
      ];
    default:
      return [
        { value: "contains", label: "contains" },
        { value: "notContains", label: "doesn't contain" },
        { value: "equals", label: "equals" },
        { value: "notEquals", label: "doesn't equal" },
        { value: "startsWith", label: "starts with" },
        { value: "endsWith", label: "ends with" },
        { value: "isEmpty", label: "is empty" },
        { value: "isNotEmpty", label: "is not empty" },
      ];
  }
}

export const QueryBuilderControl: React.FC<QueryBuilderControlProps> = ({
  filterableColumns,
  rules,
  onAddRule,
  onUpdateRule,
  onRemoveRule,
}) => {
  const availableColumns = React.useMemo(
    () => filterableColumns.filter((col) => col.field && col.field !== "__actions"),
    [filterableColumns],
  );

  const handleAddClick = () => {
    if (availableColumns.length === 0) return;
    const firstCol = availableColumns[0];
    const defaultOp: DataTableFilterOperator =
      firstCol.type === "number" || firstCol.type === "boolean" ? "equals" : "contains";
    onAddRule(firstCol.field, defaultOp, "");
  };

  return (
    <div className="space-y-3 pt-2" data-testid="query-builder-control">
      <div className="flex items-center justify-between border-t pt-3">
        <div className="text-muted-foreground flex items-center gap-1.5 text-xs font-semibold">
          <span>Custom Conditions</span>
          {rules.length > 0 && (
            <span className="py-0.2 bg-primary/10 text-primary rounded-full px-1.5 font-mono text-[10px]">
              {rules.length}
            </span>
          )}
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="h-7 gap-1 px-2 text-xs"
          onClick={handleAddClick}
          disabled={availableColumns.length === 0}
          data-testid="query-builder-add-rule-btn"
        >
          <Plus className="h-3.5 w-3.5" />
          <span>Add condition</span>
        </Button>
      </div>

      {rules.length === 0 ? (
        <p className="text-muted-foreground py-1 text-xs italic">
          No custom conditions applied. Click &quot;Add condition&quot; to build dynamic rules.
        </p>
      ) : (
        <div className="space-y-2">
          {rules.map((rule) => {
            const currentCol = availableColumns.find((c) => c.field === rule.field);
            const operators = getOperatorsForColumn(currentCol?.type);
            const isNullCheck = rule.operator === "isEmpty" || rule.operator === "isNotEmpty";

            return (
              <div
                key={rule.id}
                className="bg-muted/30 flex flex-wrap items-center gap-2 rounded-md border p-2 sm:flex-nowrap"
                data-testid={`query-builder-rule-${rule.id}`}
              >
                {/* 1. Field Select */}
                <div className="w-[140px] shrink-0">
                  <Select
                    value={rule.field}
                    onValueChange={(newField) => {
                      const targetCol = availableColumns.find((c) => c.field === newField);
                      const newOps = getOperatorsForColumn(targetCol?.type);
                      const newOp = newOps.some((op) => op.value === rule.operator)
                        ? rule.operator
                        : newOps[0].value;
                      onUpdateRule(rule.id, {
                        field: newField,
                        operator: newOp,
                      });
                    }}
                  >
                    <SelectTrigger className="bg-background h-8 text-xs" aria-label="Rule column">
                      <SelectValue placeholder="Column" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableColumns.map((col) => (
                        <SelectItem key={col.field} value={col.field} className="text-xs">
                          {col.headerName || col.field}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* 2. Operator Select */}
                <div className="w-[130px] shrink-0">
                  <Select
                    value={rule.operator}
                    onValueChange={(newOp) =>
                      onUpdateRule(rule.id, {
                        operator: newOp as DataTableFilterOperator,
                      })
                    }
                  >
                    <SelectTrigger className="bg-background h-8 text-xs" aria-label="Rule operator">
                      <SelectValue placeholder="Operator" />
                    </SelectTrigger>
                    <SelectContent>
                      {operators.map((op) => (
                        <SelectItem key={op.value} value={op.value} className="text-xs">
                          {op.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* 3. Value Input */}
                <div className="min-w-[120px] flex-1">
                  {isNullCheck ? (
                    <div className="text-muted-foreground flex h-8 items-center px-2 text-xs italic">
                      (no value needed)
                    </div>
                  ) : currentCol?.type === "boolean" ? (
                    <Select
                      value={rule.value === undefined ? "" : String(rule.value)}
                      onValueChange={(val) => onUpdateRule(rule.id, { value: val === "true" })}
                    >
                      <SelectTrigger className="bg-background h-8 text-xs" aria-label="Rule boolean value">
                        <SelectValue placeholder="Select..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="true" className="text-xs">
                          True
                        </SelectItem>
                        <SelectItem value="false" className="text-xs">
                          False
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  ) : (
                    <Input
                      type={currentCol?.type === "number" ? "number" : "text"}
                      className="bg-background h-8 text-xs"
                      placeholder="Value..."
                      value={rule.value ?? ""}
                      onChange={(e) =>
                        onUpdateRule(rule.id, {
                          value:
                            currentCol?.type === "number"
                              ? e.target.value === ""
                                ? ""
                                : Number(e.target.value)
                              : e.target.value,
                        })
                      }
                      aria-label="Rule value"
                    />
                  )}
                </div>

                {/* 4. Delete Button */}
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="text-muted-foreground hover:text-destructive h-8 w-8 shrink-0"
                  onClick={() => onRemoveRule(rule.id)}
                  aria-label="Remove rule"
                  data-testid={`query-builder-remove-rule-${rule.id}`}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
