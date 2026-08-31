import { useEffect, useState } from "react";
import { listAllProducts } from "../services/products";
import { listAllSales } from "../services/sales";
import type { Product } from "../types/product";
import type { Sale } from "../types/sale";

type Status = "loading" | "success" | "error";

export function useReportsData() {
  const [status, setStatus] = useState<Status>("loading");
  const [sales, setSales] = useState<Sale[]>([]);
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    let cancelled = false;
    setStatus("loading");

    Promise.all([listAllSales(), listAllProducts()])
      .then(([saleList, productList]) => {
        if (cancelled) return;
        setSales(saleList);
        setProducts(productList);
        setStatus("success");
      })
      .catch(() => {
        if (!cancelled) setStatus("error");
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return { status, sales, products };
}
