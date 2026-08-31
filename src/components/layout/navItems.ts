import {
  ChartBar,
  Gauge,
  Package,
  Receipt,
  Stack,
  Tag,
  Users,
  Wallet,
  type Icon,
} from "@phosphor-icons/react";
import type { Permission } from "../../types/permissions";

export interface NavItem {
  label: string;
  to: string;
  icon: Icon;
  permission?: Permission;
  adminOnly?: boolean;
}

export const primaryNavItems: NavItem[] = [
  { label: "Dashboard", to: "/admin/dashboard", icon: Gauge },
  { label: "Products", to: "/admin/products", icon: Package, permission: "products.view" },
  { label: "Categories", to: "/admin/categories", icon: Tag, permission: "categories.view" },
  { label: "Inventory", to: "/admin/inventory", icon: Stack, permission: "inventory.view" },
  { label: "Sales", to: "/admin/sales", icon: Receipt, permission: "sales.view" },
  { label: "Expenses", to: "/admin/expenses", icon: Wallet, permission: "expenses.view" },
  { label: "Users", to: "/admin/users", icon: Users, adminOnly: true },
  { label: "Reports", to: "/admin/reports", icon: ChartBar, permission: "reports.view" },
];