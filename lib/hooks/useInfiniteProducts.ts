import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { apiBasePharma } from '@/lib/config';
import type { Product } from '@/types';

export interface ProductFilters {
  categoryId?: number | null;
  supplierId?: number | null;
  minPrice?: number | null;
  maxPrice?: number | null;
}

export const useAllProductsInfinite = (sortBy: string = 'asc', filters: ProductFilters = {}) => {
  const { categoryId, supplierId, minPrice, maxPrice } = filters;

  return useInfiniteQuery({
    queryKey: ['allProducts', sortBy, categoryId ?? null, supplierId ?? null, minPrice ?? null, maxPrice ?? null],
    queryFn: async ({ pageParam = 1 }) => {
      const params = new URLSearchParams({
        page: String(pageParam),
        paginate: '20',
        sort_by: sortBy,
      });
      if (categoryId != null) params.set('category_id', String(categoryId));
      if (supplierId != null) params.set('supplier_id', String(supplierId));
      if (minPrice != null) params.set('min_price', String(minPrice));
      if (maxPrice != null) params.set('max_price', String(maxPrice));

      const res = await axios.get(
        `${apiBasePharma}/products/best-selling-product?${params.toString()}`
      );

      const newProducts: Product[] = (res.data?.data || []).map((p: Record<string, unknown>) => ({
        ...p,
        category: { id: p.category_id as number, name: p.category_name as string },
        supplier: { id: p.supplier_id as number, company_name: p.company_name as string },
        product_prices: {
          selling_price: p.selling_price as number,
          ecom_final_selling_price:
            (p.ecom_final_selling_price as number) || (p.selling_price as number),
          ecom_discount_percentage: (p.ecom_discount_percentage as number) || null,
          pack_quantity: 1,
          ecom_pack_name: { name: ' Pcs' },
        },
        product_images: [],
        stock_batches: p.stock ? [{ balanced_quantity: p.stock as number }] : [],
      }));

      return {
        products: newProducts,
        nextPage: pageParam + 1,
        hasMore: pageParam < (res.data?.last_page || 1),
        total: res.data?.total || 0,
      };
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) => (lastPage.hasMore ? lastPage.nextPage : undefined),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};
