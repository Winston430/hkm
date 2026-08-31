import { Receipt } from "@phosphor-icons/react";
import { Card, CardHeader } from "../../components/ui/Card";
import { Badge } from "../../components/ui/Badge";
import { EmptyState } from "../../components/ui/EmptyState";
import { Table, TableHead, Th, Td, Tr } from "../../components/ui/Table";
import { formatCurrency } from "../../lib/format";
import type { Sale, SaleStatus } from "../../types/sale";

const statusVariant: Record<SaleStatus, "success" | "warning" | "danger"> = {
  completed: "success",
  refunded: "warning",
  cancelled: "danger",
};

const paymentLabel: Record<Sale["paymentMethod"], string> = {
  cash: "Cash",
  card: "Card",
  "mobile-money": "Mobile Money",
};

export function RecentSalesCard({ sales }: { sales: Sale[] }) {
  return (
    <Card>
      <CardHeader title="Recent Sales" />
      {sales.length === 0 ? (
        <EmptyState
          icon={<Receipt size={22} />}
          title="No sales yet"
          description="Completed sales will appear here as they come in."
        />
      ) : (
        <Table>
          <TableHead>
            <Th>Invoice</Th>
            <Th>Agent</Th>
            <Th>Amount</Th>
            <Th>Payment</Th>
            <Th>Status</Th>
          </TableHead>
          <tbody>
            {sales.map((sale) => (
              <Tr key={sale.id}>
                <Td className="font-medium">{sale.invoiceNumber}</Td>
                <Td className="text-text-secondary">
                  {sale.agentName}
                </Td>
                <Td className="font-medium tabular-nums">
                  {formatCurrency(sale.totalAmount)}
                </Td>
                <Td className="text-text-secondary">
                  {paymentLabel[sale.paymentMethod]}
                </Td>
                <Td>
                  <Badge variant={statusVariant[sale.status]}>
                    {sale.status.charAt(0).toUpperCase() + sale.status.slice(1)}
                  </Badge>
                </Td>
              </Tr>
            ))}
          </tbody>
        </Table>
      )}
    </Card>
  );
}
