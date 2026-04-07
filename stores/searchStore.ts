import { create } from "zustand";
import axios from "axios";
import debounce from "lodash.debounce";
import { apiBasePharma } from "@/lib/config";
import type { Product } from "@/types";

interface SearchState {
  searchQuery: string;
  searchData: Product[];
  searchLoading: boolean;
  hasSearched: boolean;
  search: (query: string) => void;
  clearSearch: () => void;
}

const debouncedSearch = debounce(
  async (
    query: string,
    set: (state: Partial<SearchState>) => void
  ) => {
    if (!query || query.trim() === "") {
      set({ searchData: [], searchLoading: false });
      return;
    }

    set({ searchLoading: true, hasSearched: true });

    try {
      const res = await axios.get(
        `${apiBasePharma}/products/search?q=${encodeURIComponent(query)}`
      );

      if (res?.data) {
        const results = Array.isArray(res.data)
          ? res.data
          : res.data.products || res.data.data || [];

        const searchData: Product[] = results.map(
          (item: Record<string, unknown>) => {
            const product =
              (item._source as Record<string, unknown>) || item;
            return {
              id: product.id,
              name: product.name,
              generic_name: product.generic_name,
              category: {
                name:
                  product.category_name ||
                  (product.category as { name?: string })?.name ||
                  "N/A",
              },
              supplier: {
                company_name:
                  product.company_name ||
                  (product.supplier as { company_name?: string })
                    ?.company_name ||
                  "N/A",
              },
              product_prices: {
                selling_price:
                  product.selling_price ||
                  (product.product_prices as { selling_price?: number })
                    ?.selling_price ||
                  0,
                ecom_final_selling_price:
                  product.selling_price ||
                  (
                    product.product_prices as {
                      ecom_final_selling_price?: number;
                    }
                  )?.ecom_final_selling_price ||
                  0,
                ecom_discount_percentage:
                  (
                    product.product_prices as {
                      ecom_discount_percentage?: number;
                    }
                  )?.ecom_discount_percentage || null,
                pack_quantity:
                  (product.product_prices as { pack_quantity?: number })
                    ?.pack_quantity || 1,
                ecom_pack_name: (
                  product.product_prices as {
                    ecom_pack_name?: { name: string };
                  }
                )?.ecom_pack_name || { name: "Pcs" },
              },
              product_images:
                (product.product_images as { path: string }[]) || [],
              path: (product.path as string) || null,
              stock_batches: product.stock
                ? [{ balanced_quantity: product.stock as number }]
                : (product.stock_batches as { balanced_quantity: number }[]) ||
                  [],
            } as Product;
          }
        );

        set({ searchData, searchLoading: false });
      }
    } catch {
      set({ searchData: [], searchLoading: false });
    }
  },
  400
);

export const useSearchStore = create<SearchState>((set) => ({
  searchQuery: "",
  searchData: [],
  searchLoading: false,
  hasSearched: false,

  search: (query: string) => {
    set({ searchQuery: query });
    debouncedSearch(query, set);
  },

  clearSearch: () => {
    set({
      searchQuery: "",
      searchData: [],
      hasSearched: false,
    });
  },
}));
