'use client';

import { useEffect, useRef, useMemo, useState } from 'react';
import { Icon } from '@iconify/react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import ProductCard from '@/components/ProductCard';
import { useAllProductsInfinite } from '@/lib/hooks/useInfiniteProducts';
import { useCategories } from '@/lib/hooks/useCategories';

export default function CategoryClient() {
  const params = useParams();
  const rawId = params?.id;
  const categoryId = Number(Array.isArray(rawId) ? rawId[0] : rawId);
  const validCategoryId = Number.isFinite(categoryId) && categoryId > 0 ? categoryId : null;

  const [sortBy, setSortBy] = useState('asc');
  const infiniteScrollTrigger = useRef<HTMLDivElement>(null);

  const { data: apiCategories = [] } = useCategories();
  const categoryName = useMemo(() => {
    const match = apiCategories.find((c) => Number(c.id) === validCategoryId);
    return match?.name || '';
  }, [apiCategories, validCategoryId]);

  const { data, isLoading, isFetchingNextPage, hasNextPage, fetchNextPage } =
    useAllProductsInfinite(sortBy, { categoryId: validCategoryId });

  const allProduct = useMemo(() => data?.pages.flatMap((p) => p.products) ?? [], [data]);

  useEffect(() => {
    if (!infiniteScrollTrigger.current) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { rootMargin: '100px', threshold: 0.1 }
    );
    observer.observe(infiniteScrollTrigger.current);
    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  return (
    <section className="w-full px-3 md:px-0 py-3 min-h-screen container mx-auto">
      <nav className="flex items-center gap-2 text-xs md:text-sm mb-4" aria-label="Breadcrumb">
        <Link href="/" className="text-gray-500 hover:text-[#012068] transition-colors">
          Home
        </Link>
        <Icon icon="mdi:chevron-right" className="w-4 h-4 text-gray-300" />
        <span className="text-gray-900 font-medium">{categoryName || 'Category'}</span>
      </nav>

      <div className="bg-white border border-gray-200 rounded-xl px-3 py-2.5 mb-3 flex justify-between items-center gap-3">
        <h1 className="text-base md:text-lg font-semibold text-gray-900 truncate">
          {categoryName || 'Category'}
          {data?.pages[0]?.total ? (
            <span className="text-gray-500 font-normal text-sm ml-2">
              ({data.pages[0].total})
            </span>
          ) : null}
        </h1>
        <div className="flex gap-2 items-center">
          <label className="text-sm text-gray-600 whitespace-nowrap">Sort By:</label>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="bg-white text-gray-900 border border-gray-200 rounded-lg px-2 py-1 text-sm outline-none focus:border-[#012068]"
          >
            <option value="asc">Default</option>
            <option value="desc">Descending</option>
          </select>
        </div>
      </div>

      <div className="mb-3">
        {!isLoading && allProduct.length <= 0 && (
          <div className="flex justify-center items-center py-12">
            <p className="text-xl text-gray-500">No data Found!</p>
          </div>
        )}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 xl:grid-cols-5 gap-x-2 gap-y-4 capitalize lg:place-items-stretch">
          {isLoading &&
            Array.from({ length: 12 }, (_, n) => (
              <div
                key={`skeleton-${n}`}
                className="bg-white mb-6 border rounded-md overflow-hidden w-full max-w-[210px] animate-pulse"
              >
                <div className="w-full h-[209.53px] bg-gray-200" />
                <div className="p-2">
                  <div className="mb-3">
                    <div className="h-5 w-20 bg-gray-200 rounded-lg" />
                  </div>
                  <div className="h-[40px] space-y-1.5">
                    <div className="h-3 w-full bg-gray-200 rounded" />
                    <div className="h-3 w-3/4 bg-gray-200 rounded" />
                  </div>
                </div>
              </div>
            ))}
          {allProduct.map((item) => (
            <ProductCard key={item.id} item={item} />
          ))}
        </div>
        <div ref={infiniteScrollTrigger} className="h-20 flex justify-center items-center">
          {isFetchingNextPage && (
            <div className="flex items-center">
              <Icon
                icon="mingcute:loading-line"
                className="h-10 w-10 animate-spin text-[#012068]"
              />
              <span className="ml-2">Loading more products...</span>
            </div>
          )}
          {!hasNextPage && allProduct.length > 0 && (
            <div className="text-center text-gray-500">
              You&apos;ve reached the end of the products list.
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
