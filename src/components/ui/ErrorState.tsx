import { WarningCircle } from "@phosphor-icons/react";
import { Button } from "./Button";

export function ErrorState({
  title = "Unable to load data",
  description = "Check your connection or permissions and try again.",
  onRetry,
}: {
  title?: string;
  description?: string;
  onRetry?: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 px-6 py-12 text-center">
      <WarningCircle size={22} weight="regular" className="mb-1 text-danger" />
      <p className="text-[13px] font-semibold text-text-primary">{title}</p>
      <p className="max-w-xs text-[12px] text-text-muted">{description}</p>
      {onRetry && (
        <Button variant="secondary" size="sm" className="mt-3" onClick={onRetry}>
          Try Again
        </Button>
      )}
    </div>
  );
}
