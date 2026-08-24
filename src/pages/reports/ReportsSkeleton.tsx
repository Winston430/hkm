// pages/reports/ReportsSkeleton.tsx
import { Card } from "../../components/ui/Card";
import { Skeleton } from "../../components/ui/Skeleton";

/** Mirrors the real page structure (single-column report cards, then a
 *  two-column grid for the last two) so nothing jumps once data loads.
 *  Internal shapes are a best-effort approximation of each card's actual
 *  content — I don't have those components, so adjust per-card if the
 *  real layout differs meaningfully. */
export function ReportsSkeleton() {
  return (
    <div className="flex flex-col gap-6">
      <Card>
        <Skeleton className="mb-4 h-4 w-32" />
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex flex-col gap-2">
              <Skeleton className="h-3 w-16" />
              <Skeleton className="h-6 w-20" />
            </div>
          ))}
        </div>
      </Card>

      <Card>
        <Skeleton className="mb-4 h-4 w-36" />
        <Skeleton className="h-48 w-full" />
      </Card>

      <Card>
        <Skeleton className="mb-4 h-4 w-24" />
        <div className="flex flex-col gap-2.5">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-4 w-full" />
          ))}
        </div>
      </Card>

      <Card>
        <Skeleton className="mb-4 h-4 w-40" />
        <div className="flex flex-col gap-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-4 w-full" />
          ))}
        </div>
      </Card>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {Array.from({ length: 2 }).map((_, i) => (
          <Card key={i}>
            <Skeleton className="mb-4 h-4 w-32" />
            <div className="flex flex-col gap-2.5">
              {Array.from({ length: 4 }).map((_, j) => (
                <Skeleton key={j} className="h-4 w-full" />
              ))}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}