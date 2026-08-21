import { Clock } from "@phosphor-icons/react";
import { PageHeader } from "../components/ui/PageHeader";
import { Card } from "../components/ui/Card";
import { EmptyState } from "../components/ui/EmptyState";

export function ComingSoon({ title }: { title: string }) {
  return (
    <div>
      <PageHeader title={title} />
      <Card>
        <EmptyState
          icon={<Clock size={22} />}
          title="Not built yet"
          description={`${title} will be available once this section is implemented.`}
        />
      </Card>
    </div>
  );
}
