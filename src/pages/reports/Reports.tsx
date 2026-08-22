import { useMemo, useState } from "react";
import { PageHeader } from "../../components/ui/PageHeader";
import { Card } from "../../components/ui/Card";
import { Select } from "../../components/ui/Select";
import { ErrorState } from "../../components/ui/ErrorState";
import { Skeleton } from "../../components/ui/Skeleton";
import { useReportsData } from "../../hooks/useReportsData";
import { SalesReportCard } from "./SalesReportCard";
import { InventoryReportCard } from "./InventoryReportCard";
import { ProductPerformanceCard } from "./ProductPerformanceCard";
import { SalespersonPerformanceCard } from "./SalespersonPerformanceCard";

const DAY_MS = 24 * 60 * 60 * 1000;

const rangeOptions = [
  { value: "7", label: "Last 7 Days" },
  { value: "30", label: "Last 30 Days" },
  { value: "90", label: "Last 90 Days" },
  { value: "all", label: "All Time" },
];

export function Reports() {
  const { status, sales, products } = useReportsData();
  const [range, setRange] = useState("30");

  const scopedSales = useMemo(() => {
    if (range === "all") return sales;
    const days = Number(range);
    const cutoff = Date.now() - days * DAY_MS;
    return sales.filter((s) => s.createdAt >= cutoff);
  }, [sales, range]);

  return (
    <div>
      <PageHeader
        title="Reports"
        description="Business performance based on your recorded data"
        action={
          <div className="w-full max-w-[170px]">
            <Select value={range} onChange={(e) => setRange(e.target.value)}>
              {rangeOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </Select>
          </div>
        }
      />

      {status === "loading" && (
        <div className="flex flex-col gap-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i}>
              <Skeleton className="mb-4 h-4 w-40" />
              <Skeleton className="h-24 w-full" />
            </Card>
          ))}
        </div>
      )}

      {status === "error" && (
        <Card>
          <ErrorState title="Unable to load reports" />
        </Card>
      )}

      {status === "success" && (
        <div className="flex flex-col gap-6">
          <SalesReportCard sales={scopedSales} />
          <InventoryReportCard products={products} />
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <ProductPerformanceCard sales={scopedSales} />
            <SalespersonPerformanceCard sales={scopedSales} />
          </div>
        </div>
      )}
    </div>
  );
}
