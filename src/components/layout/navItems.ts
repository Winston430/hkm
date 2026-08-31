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

export interface NavItem {
  label: string;
  to: string;
  icon: Icon;
}

export const primaryNavItems: NavItem[] = [
  { label: "Dashboard", to: "/admin/dashboard", icon: Gauge },
  { label: "Products", to: "/admin/products", icon: Package },
  { label: "Categories", to: "/admin/categories", icon: Tag },
  { label: "Inventory", to: "/admin/inventory", icon: Stack },
  { label: "Sales", to: "/admin/sales", icon: Receipt },
  { label: "Expenses", to: "/admin/expenses", icon: Wallet },
  { label: "Users", to: "/admin/users", icon: Users },
  { label: "Reports", to: "/admin/reports", icon: ChartBar },
];
