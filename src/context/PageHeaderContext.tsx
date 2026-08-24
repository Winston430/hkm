import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

interface PageHeaderState {
  title: string;
  description?: string;
}

interface PageHeaderContextValue {
  header: PageHeaderState | null;
  setHeader: (header: PageHeaderState | null) => void;
}

const PageHeaderContext =
  createContext<PageHeaderContextValue | null>(null);

export function PageHeaderProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [header, setHeader] =
    useState<PageHeaderState | null>(null);

  const value = useMemo(
    () => ({
      header,
      setHeader,
    }),
    [header],
  );

  useEffect(() => {
    document.title = header?.title
      ? `${header.title} | Stationery Manager`
      : "Stationery Manager";
  }, [header]);

  return (
    <PageHeaderContext.Provider value={value}>
      {children}
    </PageHeaderContext.Provider>
  );
}

export function usePageHeaderContext() {
  const ctx = useContext(PageHeaderContext);

  if (!ctx) {
    throw new Error(
      "usePageHeaderContext must be used within PageHeaderProvider",
    );
  }

  return ctx;
}

/**
 * Called by <PageHeader /> to publish the current page's
 * title and description.
 */
export function usePageHeader(
  title: string,
  description?: string,
) {
  const { setHeader } = usePageHeaderContext();

  useEffect(() => {
    setHeader({
      title,
      description,
    });

    return () => {
      setHeader(null);
    };
  }, [title, description, setHeader]);
}