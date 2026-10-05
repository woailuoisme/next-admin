import { useMemoizedFn } from "ahooks";
import { Ban, Eye, UserCheck } from "lucide-react";
import { useMemo } from "react";

import {
  col,
  type DataTableColDef,
  type DataTableFilterDefinition,
  ResourceTable,
} from "@/components/data-table";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import type { AdminRole, AdminUser } from "../types";

import { useUpdateAdminUserMutation } from "../hooks";
import { adminUserQueries } from "../queries";

const ADMIN_USER_FILTERS: DataTableFilterDefinition[] = [
  {
    type: "select",
    field: "role",
    label: "Role",
    placeholder: "All roles",
    options: [
      { label: "Superadmin", value: "superadmin" },
      { label: "Admin", value: "admin" },
      { label: "Manager", value: "manager" },
      { label: "Auditor", value: "auditor" },
    ],
  },
  {
    type: "select",
    field: "status",
    label: "Status",
    placeholder: "All statuses",
    options: [
      { label: "Active", value: "active" },
      { label: "Inactive", value: "inactive" },
    ],
  },
];

const ROLE_BADGE_CONFIG: Record<
  AdminRole,
  { label: string; className?: string; variant?: "outline" }
> = {
  superadmin: {
    label: "Superadmin",
    className: "border-primary/30 bg-primary/15 text-[10px] text-primary font-medium",
  },
  admin: {
    label: "Admin",
    className:
      "border-foreground/20 bg-secondary text-[10px] text-secondary-foreground font-medium",
  },
  manager: {
    label: "Manager",
    className: "border-border bg-accent text-[10px] text-accent-foreground font-medium",
  },
  auditor: {
    label: "Auditor",
    variant: "outline",
    className: "text-[10px] text-muted-foreground",
  },
};

function getRoleBadge(role: AdminRole) {
  const config = ROLE_BADGE_CONFIG[role] ?? ROLE_BADGE_CONFIG.admin;
  return (
    <Badge variant={config.variant} className={config.className}>
      {config.label}
    </Badge>
  );
}

export interface AdminUserTableProps {
  adminUsers?: AdminUser[];
  loading?: boolean;
  total?: number;
  isUpdating?: boolean;
  onSelectAdmin: (admin: AdminUser) => void;
  onRoleChange?: (admin: AdminUser, newRole: AdminRole) => void;
  onToggleStatus?: (admin: AdminUser) => void;
}

export function AdminUserTable({
  adminUsers,
  loading,
  total,
  isUpdating: propIsUpdating,
  onSelectAdmin,
  onRoleChange,
  onToggleStatus,
}: AdminUserTableProps) {
  const fallbackMutation = useUpdateAdminUserMutation();
  const isUpdating = propIsUpdating ?? fallbackMutation.isPending;

  const handleRoleChange = useMemoizedFn((admin: AdminUser, newRole: AdminRole) => {
    if (onRoleChange) {
      onRoleChange(admin, newRole);
    } else {
      fallbackMutation.mutate({ id: admin.id, data: { role: newRole } });
    }
  });

  const handleToggleStatus = useMemoizedFn((admin: AdminUser) => {
    if (onToggleStatus) {
      onToggleStatus(admin);
    } else {
      const newStatus = admin.status === "active" ? "suspended" : "active";
      fallbackMutation.mutate({ id: admin.id, data: { status: newStatus } });
    }
  });

  const columns = useMemo<DataTableColDef<AdminUser>[]>(
    () => [
      col.avatar<AdminUser>("avatarUrl", "Staff Member", {
        width: 280,
        pinned: "left",
        name: (r) => r.name,
        subtext: (r) => r.email,
      }),
      {
        field: "role",
        headerName: "Role & Privileges",
        width: 220,
        renderCell: ({ row }) => (
          <div className="flex items-center gap-2">
            {getRoleBadge(row.role)}
            <Select
              value={row.role}
              onValueChange={(val) => handleRoleChange(row, val as AdminRole)}
              disabled={isUpdating}
            >
              <SelectTrigger
                className="h-6 w-24 p-1 text-[11px]"
                aria-label={`Change role for ${row.name}`}
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="superadmin">Superadmin</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="manager">Manager</SelectItem>
                <SelectItem value="auditor">Auditor</SelectItem>
              </SelectContent>
            </Select>
          </div>
        ),
      },
      col.badge<AdminUser>("status", "Status", {
        width: 120,
        dot: true,
        variantMap: {
          active: "success",
          suspended: "destructive",
        },
      }),
      col.date<AdminUser>("lastActiveAt", "Last Active", {
        width: 170,
      }),
      col.date<AdminUser>("createdAt", "Member Since", {
        width: 140,
      }),
      col.actions<AdminUser>({
        field: "__actions",
        headerName: "Actions",
        width: 120,
        pinned: "right",
        align: "center",
        headerAlign: "center",
        quickActions: [
          {
            id: "details",
            label: "Details",
            ariaLabel: "View Staff Details",
            icon: Eye,
            tooltip: "View Details",
            onClick: onSelectAdmin,
          },
          {
            id: "suspend",
            label: "Suspend",
            ariaLabel: "Suspend Staff",
            icon: Ban,
            destructive: true,
            tooltip: "Suspend Staff",
            disabled: isUpdating,
            hidden: (row) => row.status !== "active",
            onClick: handleToggleStatus,
          },
          {
            id: "reactivate",
            label: "Reactivate",
            ariaLabel: "Reactivate Staff",
            icon: UserCheck,
            tooltip: "Reactivate Staff",
            disabled: isUpdating,
            hidden: (row) => row.status === "active",
            onClick: handleToggleStatus,
          },
        ],
      }),
    ],
    [handleRoleChange, handleToggleStatus, isUpdating, onSelectAdmin],
  );

  return (
    <ResourceTable<AdminUser>
      queryOptions={!adminUsers ? adminUserQueries.list : undefined}
      data={adminUsers}
      loading={loading}
      total={total}
      columns={columns}
      getRowId={(a) => a.id}
      checkboxSelection
      paginationMode="client"
      pinnedColumns={{
        left: ["avatarUrl"],
        right: ["__actions"],
      }}
      summaryRow
      filters={ADMIN_USER_FILTERS}
      slotProps={{
        toolbar: {
          exportFileName: "staff-directory.csv",
          quickFilterPlaceholder: "Filter staff members...",
        },
      }}
      className="shadow-xs"
    />
  );
}
