import { CaretLeft, CaretRight } from "@phosphor-icons/react";

export function Pagination({
  page,
  pageCount,
  onChange,
  totalItems,
  pageSize,
}: {
  page: number;
  pageCount: number;
  onChange: (page: number) => void;
  totalItems: number;
  pageSize: number;
}) {
  if (pageCount <= 1) return null;

  const start = (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, totalItems);

  return (
    <div className="flex items-center justify-between border-t border-border-light pt-3">
      <p className="text-[12px] text-text-muted">
        Showing {start}–{end} of {totalItems}
      </p>
      <div className="flex items-center gap-1">
        <button
          type="button"
          disabled={page <= 1}
          onClick={() => onChange(page - 1)}
          aria-label="Previous page"
          className="flex h-7 w-7 items-center justify-center rounded-md border border-border text-text-secondary disabled:cursor-not-allowed disabled:text-text-disabled enabled:hover:bg-surface-secondary"
        >
          <CaretLeft size={14} />
        </button>
        <span className="px-2 text-[12px] text-text-secondary">
          {page} / {pageCount}
        </span>
        <button
          type="button"
          disabled={page >= pageCount}
          onClick={() => onChange(page + 1)}
          aria-label="Next page"
          className="flex h-7 w-7 items-center justify-center rounded-md border border-border text-text-secondary disabled:cursor-not-allowed disabled:text-text-disabled enabled:hover:bg-surface-secondary"
        >
          <CaretRight size={14} />
        </button>
      </div>
    </div>
  );
}
