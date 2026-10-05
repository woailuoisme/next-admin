"use client";

import { useMemoizedFn } from "ahooks";
import { Plus } from "lucide-react";
import { useMemo } from "react";

import { useResourceManagement } from "@/components/data-table";
import { DataList, type DataListItem, ViewDialog } from "@/components/dialogs";
import { Button } from "@/components/ui/button";

import type { AdminRole, AdminUser, AdminUserSearchParams } from "../types";

import { AdminUserDialog } from "../components/AdminUserDialog";
import { AdminUserTable } from "../components/AdminUserTable";
import { useUpdateAdminUserMutation } from "../hooks";
import { adminUserQueries } from "../queries";

export interface AdminUsersPageProps {
  search?: AdminUserSearchParams;
}

export function AdminUsersPage({ search = {} }: AdminUsersPageProps) {
  const {
    rows,
    total,
    isLoading,
    modal,
    activeViewItem: selectedAdmin,
    handleViewOpenChange,
    handleFormOpenChange: handleCreateOpenChange,
  } = useResourceManagement<AdminUser, AdminUserSearchParams>({
    search,
    queryOptions: adminUserQueries.list,
    modalKeys: {
      createKey: "createStaff",
      viewKey: "staffId",
    },
  });

  const { mutate: updateAdmin, isPending: isUpdating } = useUpdateAdminUserMutation();

  const handleRoleChange = useMemoizedFn((admin: AdminUser, newRole: AdminRole) => {
    updateAdmin({ id: admin.id, data: { role: newRole } });
  });

  const handleToggleStatus = useMemoizedFn((admin: AdminUser) => {
    const newStatus = admin.status === "active" ? "suspended" : "active";
    updateAdmin({ id: admin.id, data: { status: newStatus } });
  });

  const handleSelectAdmin = useMemoizedFn((admin: AdminUser) => {
    modal.openView(admin.id);
  });

  const adminDetailsItems: DataListItem[] = useMemo(
    () =>
      selectedAdmin
        ? [
            { label: "Account ID", value: selectedAdmin.id, copyable: true },
            { label: "Full Name", value: selectedAdmin.name },
            {
              label: "Email Address",
              value: selectedAdmin.email,
              copyable: true,
            },
            {
              label: "Security Role",
              value: selectedAdmin.role.toUpperCase(),
              badge: true,
              badgeVariant: selectedAdmin.role === "superadmin" ? "default" : "secondary",
            },
            {
              label: "Account Status",
              value: selectedAdmin.status.toUpperCase(),
              badge: true,
              badgeVariant: selectedAdmin.status === "active" ? "outline" : "destructive",
            },
            {
              label: "Last Active",
              value: new Date(selectedAdmin.lastActiveAt).toLocaleString(),
            },
            {
              label: "Created Date",
              value: new Date(selectedAdmin.createdAt).toLocaleDateString(),
            },
          ]
        : [],
    [selectedAdmin],
  );

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Staff & Role Privileges</h1>
          <p className="text-muted-foreground mt-0.5 text-xs">
            Manage administrative team members, assign operational roles, and enforce security
            policies.
          </p>
        </div>
        <Button onClick={modal.openCreate} className="h-9 gap-1.5 text-xs font-semibold shadow-xs">
          <Plus className="size-4" /> Add Staff Member
        </Button>
      </div>

      {/* Enterprise AdminUserTable */}
      <AdminUserTable
        adminUsers={rows}
        total={total}
        loading={isLoading}
        isUpdating={isUpdating}
        onSelectAdmin={handleSelectAdmin}
        onRoleChange={handleRoleChange}
        onToggleStatus={handleToggleStatus}
      />

      {/* Create Dialog */}
      <AdminUserDialog open={modal.isCreateOpen} onOpenChange={handleCreateOpenChange} />

      {/* View Details Dialog */}
      <ViewDialog
        open={modal.isViewOpen}
        onOpenChange={handleViewOpenChange}
        title="Staff Member Profile"
        description={`Privilege configuration and audit details for ${selectedAdmin?.name ?? "staff member"}`}
        widthClassName="sm:max-w-xl"
      >
        <DataList items={adminDetailsItems} />
      </ViewDialog>
    </div>
  );
}
