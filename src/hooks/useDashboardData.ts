import { useCallback, useEffect, useState } from "react";
import { listActiveProducts } from "../services/products";
import { listSalesSince } from "../services/sales";
import { getStockStatus, type Product } from "../types/product";
import type { Sale } from "../types/sale";

const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;
const DAY_MS = 24 * 60 * 60 * 1000;

export interface DailyTotal {
  dayStart: number;
  total: number;
}

export interface TopProduct {
  productId: string;
  productName: string;
  unitsSold: number;
  revenue: number;
}

export interface DashboardData {
  activeProductCount: number;
  lowStockProducts: Product[];
  salesToday: Sale[];
  revenueToday: number;
  recentSales: Sale[];
  dailyTotals: DailyTotal[];
  topProducts: TopProduct[];
}

type Status = "loading" | "success" | "error";

function startOfToday() {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  return now.getTime();
}

export function useDashboardData() {
  const [status, setStatus] = useState<Status>("loading");
  const [data, setData] = useState<DashboardData | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  const reload = useCallback(() => setReloadKey((k) => k + 1), []);

  useEffect(() => {
    let cancelled = false;
    setStatus("loading");

    async function load() {
      try {
        const todayStart = startOfToday();
        const rangeStart = todayStart - THIRTY_DAYS_MS;

        const [products, sales] = await Promise.all([
          listActiveProducts(),
          listSalesSince(rangeStart),
        ]);

        if (cancelled) return;

        const lowStockProducts = products
          .filter((p) => getStockStatus(p) !== "in-stock")
          .sort((a, b) => a.stock - b.stock);

        const salesToday = sales.filter((s) => s.createdAt >= todayStart);
        const revenueToday = salesToday.reduce(
          (sum, s) => sum + s.totalAmount,
          0,
        );

        const recentSales = sales.slice(0, 6);

        const dailyTotals: DailyTotal[] = Array.from({ length: 7 }).map(
          (_, i) => {
            const dayStart = todayStart - (6 - i) * DAY_MS;
            const dayEnd = dayStart + DAY_MS;
            const total = sales
              .filter((s) => s.createdAt >= dayStart && s.createdAt < dayEnd)
              .reduce((sum, s) => sum + s.totalAmount, 0);
            return { dayStart, total };
          },
        );

        const productTotals = new Map<string, TopProduct>();
        for (const sale of sales) {
          for (const item of sale.items) {
            const existing = productTotals.get(item.productId);
            if (existing) {
              existing.unitsSold += item.quantity;
              existing.revenue += item.lineTotal;
            } else {
              productTotals.set(item.productId, {
                productId: item.productId,
                productName: item.productName,
                unitsSold: item.quantity,
                revenue: item.lineTotal,
              });
            }
          }
        }
        const topProducts = Array.from(productTotals.values())
          .sort((a, b) => b.unitsSold - a.unitsSold)
          .slice(0, 5);

        setData({
          activeProductCount: products.length,
          lowStockProducts,
          salesToday,
          revenueToday,
          recentSales,
          dailyTotals,
          topProducts,
        });
        setStatus("success");
      } catch {
        if (!cancelled) setStatus("error");
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [reloadKey]);

  return { status, data, reload };
}
