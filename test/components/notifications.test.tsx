import { describe, expect, it, vi } from "vitest";

import { NotificationItemRow } from "@/components/notifications/item/NotificationItemRow";
import { NotificationPopover } from "@/components/notifications/popover/NotificationPopover";
import { Popover } from "@/components/ui/popover";
import type { NotificationItem } from "@/features/notifications";

import { fireEvent, renderWithProviders, screen } from "test/test-utils";

const mockItemUnread: NotificationItem = {
  id: "notif-1",
  title: "新订单待发货 #ORD-2026-9042",
  description: "客户 Emily Watson 刚刚完成了 $1,289.00 的高定耳机订单",
  category: "order",
  severity: "info",
  read: false,
  createdAt: new Date().toISOString(),
  actionLabel: "查看订单",
  actionUrl: "/orders/1",
};

const mockItemRead: NotificationItem = {
  id: "notif-2",
  title: "系统维护提醒",
  description: "系统将在周日凌晨 02:00 进行例行维护升级",
  category: "system",
  severity: "warning",
  read: true,
  createdAt: new Date().toISOString(),
};

describe("Notification Components", () => {
  describe("NotificationItemRow", () => {
    it("renders unread item with indicator dot and title", () => {
      const handleItemClick = vi.fn();
      renderWithProviders(<NotificationItemRow item={mockItemUnread} onItemClick={handleItemClick} />);

      expect(screen.getByText("新订单待发货 #ORD-2026-9042")).toBeInTheDocument();
      expect(screen.getByTestId("notification-unread-dot")).toBeInTheDocument();
      expect(screen.getByText("查看订单")).toBeInTheDocument();
    });

    it("triggers onMarkAsRead when clicking the mark-as-read action button", () => {
      const handleItemClick = vi.fn();
      const handleMarkAsRead = vi.fn();

      renderWithProviders(
        <NotificationItemRow
          item={mockItemUnread}
          onItemClick={handleItemClick}
          onMarkAsRead={handleMarkAsRead}
        />,
      );

      const markReadBtn = screen.getByRole("button", { name: /标为已读|mark as read/i });
      fireEvent.click(markReadBtn);

      expect(handleMarkAsRead).toHaveBeenCalledWith("notif-1");
      expect(handleItemClick).not.toHaveBeenCalled();
    });

    it("triggers onDelete when clicking the delete button", () => {
      const handleItemClick = vi.fn();
      const handleDelete = vi.fn();

      renderWithProviders(
        <NotificationItemRow item={mockItemRead} onItemClick={handleItemClick} onDelete={handleDelete} />,
      );

      const deleteBtn = screen.getByRole("button", { name: /删除|delete/i });
      fireEvent.click(deleteBtn);

      expect(handleDelete).toHaveBeenCalledWith("notif-2");
      expect(handleItemClick).not.toHaveBeenCalled();
    });
  });

  describe("NotificationPopover", () => {
    it("renders popover with underline tabs, items, and total count", () => {
      const handleTabChange = vi.fn();
      const handleMarkAll = vi.fn();
      const handleItemClick = vi.fn();
      const handleGotoOverview = vi.fn();

      renderWithProviders(
        <Popover open={true}>
          <NotificationPopover
            unreadCount={1}
            totalCount={2}
            activeTab="all"
            items={[mockItemUnread, mockItemRead]}
            isLoading={false}
            isMarkingAllAsRead={false}
            onTabChange={handleTabChange}
            onMarkAllAsRead={handleMarkAll}
            onItemClick={handleItemClick}
            onGotoOverview={handleGotoOverview}
          />
        </Popover>,
      );

      expect(screen.getByText("新订单待发货 #ORD-2026-9042")).toBeInTheDocument();
      expect(screen.getByText("系统维护提醒")).toBeInTheDocument();

      // Check underline tabs
      expect(screen.getByRole("tab", { name: /全部|all/i })).toBeInTheDocument();
      expect(screen.getByRole("tab", { name: /未读|unread/i })).toBeInTheDocument();
      expect(screen.getByRole("tab", { name: /订单|orders/i })).toBeInTheDocument();
      expect(screen.getByRole("tab", { name: /系统|system/i })).toBeInTheDocument();
    });
  });
});
