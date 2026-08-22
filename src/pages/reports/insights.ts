import { getStockStatus, type Product } from "../../types/product";
import type { PaymentMethod, Sale } from "../../types/sale";

export interface Insight {
  tone: "info" | "attention";
  text: string;
}

const paymentLabel: Record<PaymentMethod, string> = {
  cash: "Cash",
  card: "Card",
  "mobile-money": "Mobile Money",
};

/**
 * Generates a short list of data-driven observations from real sales and
 * product records. Every insight is derived from the numbers actually
 * passed in — nothing here is a placeholder or fabricated statistic. An
 * insight is only included when the underlying data clears a threshold
 * meant to filter out noise (e.g. a 1% revenue wobble isn't worth a line).
 */
export function generateInsights(params: {
  currentSales: Sale[];
  previousSales: Sale[] | null;
  products: Product[];
}): Insight[] {
  const { currentSales, previousSales, products } = params;
  const completed = currentSales.filter((s) => s.status === "completed");
  const insights: Insight[] = [];

  if (previousSales !== null) {
    const prevCompleted = previousSales.filter((s) => s.status === "completed");
    const currentRevenue = completed.reduce((sum, s) => sum + s.totalAmount, 0);
    const prevRevenue = prevCompleted.reduce((sum, s) => sum + s.totalAmount, 0);

    if (prevRevenue > 0) {
      const change = ((currentRevenue - prevRevenue) / prevRevenue) * 100;
      if (Math.abs(change) >= 1) {
        insights.push({
          tone: change < 0 ? "attention" : "info",
          text: `Revenue is ${change >= 0 ? "up" : "down"} ${Math.abs(
            Math.round(change),
          )}% compared to the previous period.`,
        });
      }
    } else if (currentRevenue > 0) {
      insights.push({
        tone: "info",
        text: "Revenue this period, versus none in the previous period.",
      });
    }
  }

  const productTotals = new Map<
    string,
    { name: string; units: number; revenue: number }
  >();
  for (const sale of completed) {
    for (const item of sale.items) {
      const entry = productTotals.get(item.productId) ?? {
        name: item.productName,
        units: 0,
        revenue: 0,
      };
      entry.units += item.quantity;
      entry.revenue += item.lineTotal;
      productTotals.set(item.productId, entry);
    }
  }
  const totalRevenue = completed.reduce((sum, s) => sum + s.totalAmount, 0);
  const sortedByUnits = Array.from(productTotals.entries()).sort(
    (a, b) => b[1].units - a[1].units,
  );

  if (sortedByUnits.length > 0 && totalRevenue > 0) {
    const [, top] = sortedByUnits[0];
    const share = (top.revenue / totalRevenue) * 100;
    if (share >= 25) {
      insights.push({
        tone: "info",
        text: `${top.name} accounts for ${Math.round(share)}% of your revenue this period.`,
      });
    }
  }

  const productById = new Map(products.map((p) => [p.id, p]));
  for (const [productId, data] of sortedByUnits.slice(0, 5)) {
    const product = productById.get(productId);
    if (product && getStockStatus(product) !== "in-stock") {
      const stockStatus = getStockStatus(product);
      insights.push({
        tone: "attention",
        text: `${data.name} is selling well but ${
          stockStatus === "out-of-stock"
            ? "is out of stock"
            : `only has ${product.stock} units left`
        } — consider restocking.`,
      });
      break;
    }
  }

  const soldProductIds = new Set(productTotals.keys());
  const neverSold = products.filter(
    (p) => p.active && p.stock > 0 && !soldProductIds.has(p.id),
  );
  if (neverSold.length >= 3) {
    insights.push({
      tone: "info",
      text: `${neverSold.length} active products had no sales in this period.`,
    });
  }

  if (completed.length >= 3) {
    const byPayment = new Map<PaymentMethod, number>();
    for (const s of completed) {
      byPayment.set(s.paymentMethod, (byPayment.get(s.paymentMethod) ?? 0) + 1);
    }
    const [method, count] = Array.from(byPayment.entries()).sort(
      (a, b) => b[1] - a[1],
    )[0];
    const pct = Math.round((count / completed.length) * 100);
    if (pct >= 50) {
      insights.push({
        tone: "info",
        text: `${paymentLabel[method]} is used in ${pct}% of sales this period.`,
      });
    }
  }

  return insights.slice(0, 4);
}
