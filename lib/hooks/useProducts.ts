import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import axios from "axios";
import { apiBasePharma } from "@/lib/config";

// Product queries
export const useProduct = (id: string | number) => {
  return useQuery({
    queryKey: ["product", id],
    queryFn: async () => {
      const res = await axios.get(`${apiBasePharma}/products/${id}`);
      const data = Array.isArray(res?.data) ? res.data[0] : res.data;
      return data;
    },
    enabled: !!id,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};

export const useAllProducts = (page: number = 1, paginate: number = 100) => {
  return useQuery({
    queryKey: ["products", page, paginate],
    queryFn: async () => {
      const res = await axios.get(
        `${apiBasePharma}/products/all-products-paginated?page=${page}&paginate=${paginate}`
      );
      const data = Array.isArray(res?.data)
        ? res.data
        : Array.isArray(res?.data?.data)
          ? res.data.data
          : Array.isArray(res?.data?.products)
            ? res.data.products
            : [];
      return data;
    },
    staleTime: 10 * 60 * 1000,
  });
};

export const useProductIds = (maxPages: number = 500) => {
  return useQuery({
    queryKey: ["productIds", maxPages],
    queryFn: async () => {
      const ids = new Set<string>();
      let page = 1;

      while (page <= maxPages) {
        try {
          const res = await axios.get(
            `${apiBasePharma}/products/all-products-paginated?page=${page}&paginate=100`
          );

          const data = Array.isArray(res?.data)
            ? res.data
            : Array.isArray(res?.data?.data)
              ? res.data.data
              : Array.isArray(res?.data?.products)
                ? res.data.products
                : [];

          if (data.length === 0) break;

          for (const item of data) {
            if (item?.id !== undefined && item?.id !== null) {
              ids.add(String(item.id));
            }
          }

          page += 1;
        } catch {
          break;
        }
      }

      return Array.from(ids);
    },
    staleTime: 60 * 60 * 1000, // 1 hour for static generation
  });
};

export const useProductsByGeneric = (
  genericId: string | number | undefined | null,
  perPage: number = 10
) => {
  return useInfiniteQuery({
    queryKey: ["productsByGeneric", genericId, perPage],
    queryFn: async ({ pageParam = 1 }) => {
      const res = await axios.get(
        `${apiBasePharma}/products/product-generic-wise/${genericId}?page=${pageParam}&per_page=${perPage}`
      );
      const payload = res?.data ?? {};
      const data = Array.isArray(payload?.data)
        ? payload.data
        : Array.isArray(payload)
          ? payload
          : [];
      return {
        data,
        currentPage: Number(payload?.current_page ?? pageParam),
        lastPage: Number(payload?.last_page ?? pageParam),
        total: Number(payload?.total ?? data.length),
      };
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage.currentPage < lastPage.lastPage ? lastPage.currentPage + 1 : undefined,
    enabled: !!genericId,
    staleTime: 10 * 60 * 1000,
  });
};

export const useSearchProducts = (query: string, page: number = 1) => {
  return useQuery({
    queryKey: ["searchProducts", query],
    queryFn: async () => {
      const res = await axios.get(
        `${apiBasePharma}/products/search?q=${encodeURIComponent(query)}`
      );
      const results = Array.isArray(res.data)
        ? res.data
        : res.data?.products || res.data?.data || [];

      return results.map((item: Record<string, unknown>) => {
        const p = (item._source as Record<string, unknown>) || item;
        const apiDiscountPct =
          (p.ecom_discount_percentage as number | null | undefined) ??
          (p.product_prices as { ecom_discount_percentage?: number })?.ecom_discount_percentage ??
          null;
        return {
          id: p.id,
          name: p.name,
          generic_name: p.generic_name,
          category: { name: p.category_name || (p.category as { name?: string })?.name || "N/A" },
          category_name: p.category_name,
          supplier: { company_name: p.company_name || (p.supplier as { company_name?: string })?.company_name || "N/A" },
          selling_price: p.selling_price,
          ecom_discount_percentage: apiDiscountPct,
          packsize_quantity: p.packsize_quantity,
          packsize_name: p.packsize_name,
          stripe_qty: p.stripe_qty,
          product_prices: {
            selling_price: p.selling_price || (p.product_prices as { selling_price?: number })?.selling_price || 0,
            ecom_final_selling_price: p.selling_price || (p.product_prices as { ecom_final_selling_price?: number })?.ecom_final_selling_price || 0,
            ecom_discount_percentage: apiDiscountPct,
            pack_quantity: p.packsize_quantity || (p.product_prices as { pack_quantity?: number })?.pack_quantity || 1,
            ecom_pack_name: (p.product_prices as { ecom_pack_name?: { name: string } })?.ecom_pack_name || { name: (p.packsize_name as string) || "Pcs" },
          },
          product_images: (p.product_images as { path: string }[]) || [],
          path: (p.path as string) || null,
          stock_batches: p.stock
            ? [{ balanced_quantity: p.stock as number }]
            : (p.stock_batches as { balanced_quantity: number }[]) || [],
        };
      });
    },
    enabled: !!query && query.trim().length > 0,
    staleTime: 5 * 60 * 1000,
  });
};
