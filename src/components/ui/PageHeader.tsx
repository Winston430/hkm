// components/ui/PageHeader.tsx
import type { ReactNode } from "react";
import { usePageHeader } from "../../context/PageHeaderContext";

interface PageHeaderProps {
  title: string;
  description?: string;
  action?: ReactNode;
}

export function PageHeader({ title, description, action }: PageHeaderProps) {
  usePageHeader(title, description);

  if (!action) return null;

  return (
    <div className="mb-4 flex justify-end">
      <div className="flex items-center gap-2">{action}</div>
    </div>
  );
}