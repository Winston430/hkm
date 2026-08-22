import { useMemo } from "react";
import { Users } from "@phosphor-icons/react";
import { Card, CardHeader } from "../../components/ui/Card";
import { EmptyState } from "../../components/ui/EmptyState";
import { Table, TableHead, Th, Td, Tr } from "../../components/ui/Table";
import { formatCurrency } from "../../lib/format";
import type { Sale } from "../../types/sale";

export function SalespersonPerformanceCard({ sales }: { sales: Sale[] }) {
  const rows = useMemo(() => {
    const map = new Map<
      string,
      { salespersonName: string; transactions: number; revenue: number }
    >();
    for (const sale of sales) {
      if (sale.status !== "completed") continue;
      const entry = map.get(sale.salespersonId) ?? {
        salespersonName: sale.salespersonName,
        transactions: 0,
        revenue: 0,
      };
      entry.transactions += 1;
      entry.revenue += sale.totalAmount;
      map.set(sale.salespersonId, entry);
    }
    return Array.from(map.entries())
      .map(([salespersonId, data]) => ({ salespersonId, ...data }))
      .sort((a, b) => b.revenue - a.revenue);
  }, [sales]);

  return (
    <Card>
      <CardHeader title="Salesperson Performance" />
      {rows.length === 0 ? (
        <EmptyState
          icon={<Users size={22} />}
          title="No sales in this period"
          description="Performance by salesperson will appear here once sales are recorded."
        />
      ) : (
        <Table>
          <TableHead>
            <Th>Salesperson</Th>
            <Th>Transactions</Th>
            <Th>Revenue</Th>
          </TableHead>
          <tbody>
            {rows.map((row) => (
              <Tr key={row.salespersonId}>
                <Td className="font-medium">{row.salespersonName}</Td>
                <Td className="tabular-nums">{row.transactions}</Td>
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
