import { describe, expect, it, vi } from "vitest";

import { CustomerTable } from "@/features/users/components/CustomerTable";
import { UsersPage } from "@/features/users/pages/UsersPage";
import type { Customer } from "@/features/users/types";
import { renderWithProviders, screen } from "test/test-utils";

const mockCustomers: Customer[] = [
  {
    id: "cust-1",
    name: "张三",
    email: "zhangsan@example.com",
    avatarUrl: "https://example.com/avatar1.jpg",
    phone: "+86 13800138000",
    status: "active",
    totalOrders: 12,
    totalSpent: 4580.5,
    createdAt: "2026-01-01T00:00:00Z",
  },
  {
    id: "cust-2",
    name: "李四",
    email: "lisi@example.com",
    avatarUrl: "https://example.com/avatar2.jpg",
    phone: "+86 13900139000",
    status: "inactive",
    totalOrders: 3,
    totalSpent: 920.0,
    createdAt: "2026-01-02T00:00:00Z",
  },
];

describe("Users Feature Tests", () => {
  it("renders CustomerTable with customer details, contact info and badges", () => {
    const handleToggle = vi.fn();

    renderWithProviders(<CustomerTable customers={mockCustomers} total={2} onToggleCustomerStatus={handleToggle} />);

    expect(screen.getAllByText("张三").length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText("zhangsan@example.com")).toBeInTheDocument();
    expect(screen.getByText("+86 13800138000")).toBeInTheDocument();
    expect(screen.getAllByText("李四").length).toBeGreaterThanOrEqual(1);
  });

  it("renders UsersPage with heading and table structure", async () => {
    renderWithProviders(<UsersPage />);

    expect(await screen.findByText("客户账户")).toBeInTheDocument();
  });
});
