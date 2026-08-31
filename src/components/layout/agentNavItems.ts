// components/layout/agentNavItems.ts
import type { Icon } from "@phosphor-icons/react";
import { ShoppingCart, Package, Tag, Stack, Receipt, ChartBar, Wallet } from "@phosphor-icons/react";
import type { Permission } from "../../types/permissions";

interface AgentNavItem {
  to: string;
  label: string;
  icon: Icon;
  permission?: Permission;
  end?: boolean;
}

export const agentNavItems: AgentNavItem[] = [
  { to: "/agent", label: "Record Sale", icon: ShoppingCart, end: true },
  { to: "/agent/products", label: "Products", icon: Package, permission: "products.view" },
  { to: "/agent/categories", label: "Categories", icon: Tag, permission: "categories.view" },
  { to: "/agent/inventory", label: "Inventory", icon: Stack, permission: "inventory.view" },
  { to: "/agent/sales", label: "Sales", icon: Receipt, permission: "sales.view" },
  { to: "/agent/reports", label: "Reports", icon: ChartBar, permission: "reports.view" },
  { to: "/agent/expenses", label: "Expenses", icon: Wallet, permission: "expenses.view" },
];