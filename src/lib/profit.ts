// lib/profit.ts
import type { Product } from "../types/product";
import type { Sale } from "../types/sale";

export interface ProfitSummary {
  revenue: number;
  cogs: number;
  grossProfit: number;
  marginPercent: number;
  /** Sale line items whose product no longer exists — cost couldn't be
   *  looked up, so they're treated as zero-cost. Surfaced in the UI so
   *  the profit figure is never silently overstated without explanation. */
  itemsWithUnknownCost: number;
}

/** Current cost price per product. Historical cost at time of sale isn't
 *  tracked — see the caveat surfaced in ProfitReportCard. */
export function buildCostLookup(products: Product[]): Map<string, number> {
  return new Map(products.map((p) => [p.id, p.costPrice]));
}

export function saleCogs(
  sale: Sale,
  costById: Map<string, number>,
): { cogs: number; unknownCostItems: number } {
  let cogs = 0;
  let unknownCostItems = 0;
  for (const item of sale.items) {
    const costPrice = costById.get(item.productId);
    if (costPrice === undefined) {
      unknownCostItems++;
      continue;
    }
    cogs += costPrice * item.quantity;
  }
  return { cogs, unknownCostItems };
}

export function calculateProfitSummary(sales: Sale[], products: Product[]): ProfitSummary {
  const costById = buildCostLookup(products);
  let revenue = 0;
  let cogs = 0;
  let itemsWithUnknownCost = 0;

  for (const sale of sales) {
    if (sale.status !== "completed") continue;
    revenue += sale.totalAmount;
    const result = saleCogs(sale, costById);
    cogs += result.cogs;
    itemsWithUnknownCost += result.unknownCostItems;
  }

  const grossProfit = revenue - cogs;
  const marginPercent = revenue > 0 ? (grossProfit / revenue) * 100 : 0;

  return { revenue, cogs, grossProfit, marginPercent, itemsWithUnknownCost };
}