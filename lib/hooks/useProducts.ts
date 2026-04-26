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
    queryKey: ["searchProducts", query, page],
    queryFn: async () => {
      if (!query) return [];
      const res = await axios.get(
        `${apiBasePharma}/products/search?q=${query}&page=${page}`
      );
      const data = Array.isArray(res?.data)
        ? res.data
        : Array.isArray(res?.data?.data)
          ? res.data.data
          : [];
      return data;
    },
    enabled: !!query,
    staleTime: 5 * 60 * 1000,
  });
};
