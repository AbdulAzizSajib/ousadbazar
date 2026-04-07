import type { Product } from "@/types";

export const stockQuantity = (item: Product | null | undefined): number => {
  if (!item?.stock_batches?.length) return 0;
  return (
    item.stock_batches.reduce(
      (sum, batch) => sum + parseFloat(String(batch.balanced_quantity || 0)),
      0
    ) || 0
  );
};

export const calculateStock = (item: Product | null | undefined): number => {
  if (!item?.stock_batches?.length) return 0;
  return (
    item.stock_batches.reduce(
      (sum, batch) => sum + parseFloat(String(batch.balanced_quantity || 0)),
      0
    ) || 0
  );
};
