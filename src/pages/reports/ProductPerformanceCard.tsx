import { useMemo } from "react";
import { ChartBar } from "@phosphor-icons/react";
import { Card, CardHeader } from "../../components/ui/Card";
import { EmptyState } from "../../components/ui/EmptyState";
import { Table, TableHead, Th, Td, Tr } from "../../components/ui/Table";
import { formatCurrency } from "../../lib/format";
import type { Sale } from "../../types/sale";

export function ProductPerformanceCard({ sales }: { sales: Sale[] }) {
  const rows = useMemo(() => {
    const map = new Map<
      string,
      { productId: string; productName: string; unitsSold: number; revenue: number }
    >();
    for (const sale of sales) {
      if (sale.status !== "completed") continue;
      for (const item of sale.items) {
        const entry = map.get(item.productId) ?? {
          productId: item.productId,
          productName: item.productName,
          unitsSold: 0,
          revenue: 0,
        };
        entry.unitsSold += item.quantity;
        entry.revenue += item.lineTotal;
        map.set(item.productId, entry);
      }
    }
    return Array.from(map.values())
      .sort((a, b) => b.unitsSold - a.unitsSold)
      .slice(0, 10);
  }, [sales]);

  return (
    <Card>
      <CardHeader title="Product Performance" />
      {rows.length === 0 ? (
        <EmptyState
          icon={<ChartBar size={22} />}
          title="No product activity in this period"
          description="Product sales performance will appear here once sales are recorded."
        />
      ) : (
        <Table>
          <TableHead>
            <Th>Product</Th>
            <Th>Units Sold</Th>
            <Th>Revenue</Th>
          </TableHead>
          <tbody>
            {rows.map((row) => (
              <Tr key={row.productId}>
                <Td className="font-medium">{row.productName}</Td>
                <Td className="tabular-nums">{row.unitsSold}</Td>
                <Td className="tabular-nums font-medium">
                  {formatCurrency(row.revenue)}
                </Td>
              </Tr>
            ))}
          </tbody>
        </Table>
      )}
    </Card>
  );
}
