import { Info, WarningCircle } from "@phosphor-icons/react";
import { Card, CardHeader } from "../../components/ui/Card";
import { EmptyState } from "../../components/ui/EmptyState";
import type { Insight } from "./insights";

export function InsightsCard({ insights }: { insights: Insight[] }) {
  return (
    <Card>
      <CardHeader title="Insights" />
      {insights.length === 0 ? (
        <EmptyState
          icon={<Info size={22} />}
          title="Not enough data yet"
          description="Insights will appear here once there's enough sales history to compare."
        />
      ) : (
        <ul className="flex flex-col gap-3">
          {insights.map((insight, i) => (
            <li key={i} className="flex items-start gap-2.5 text-[13px]">
              {insight.tone === "attention" ? (
                <WarningCircle size={16} className="mt-0.5 shrink-0 text-orange" />
              ) : (
                <Info size={16} className="mt-0.5 shrink-0 text-info" />
              )}
              <span className="text-text-primary">{insight.text}</span>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
