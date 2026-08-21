import { Card } from "../../components/ui/Card";
import { Skeleton, SkeletonRow } from "../../components/ui/Skeleton";

export function DashboardSkeleton() {
  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-lg border border-border bg-surface p-4">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="mt-3 h-6 w-24" />
          </div>
        ))}
      </div>

      <Card>
        <Skeleton className="mb-4 h-4 w-32" />
        <Skeleton className="h-40 w-full" />
      </Card>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card padded={false} className="p-5">
          <Skeleton className="mb-4 h-4 w-28" />
          {Array.from({ length: 4 }).map((_, i) => (
            <SkeletonRow key={i} columns={4} />
          ))}
        </Card>
        <Card padded={false} className="p-5">
          <Skeleton className="mb-4 h-4 w-24" />
          {Array.from({ length: 4 }).map((_, i) => (
            <SkeletonRow key={i} columns={3} />
          ))}
        </Card>
      </div>
    </div>
  );
}
