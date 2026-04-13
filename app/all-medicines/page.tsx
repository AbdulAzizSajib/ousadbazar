"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { Icon } from "@iconify/react";
import { formatNumber } from "@/lib/config";
import ProductCard from "@/components/ProductCard";
import { useAllProductsInfinite } from "@/lib/hooks/useInfiniteProducts";
import type { Product } from "@/types";

export default function AllMedicinesPage() {
  const [sortBy, setSortBy] = useState("asc");
  const [isFilterOpen, setIsFilterOpen] = useState(true);
  const [selectedSuppliers, setSelectedSuppliers] = useState<string[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [minPrice, setMinPrice] = useState<number | null>(null);
  const [maxPrice, setMaxPrice] = useState<number | null>(null);
  const infiniteScrollTrigger = useRef<HTMLDivElement>(null);

  // Use TanStack Query for infinite pagination
  const { data, isLoading, isFetchingNextPage, hasNextPage, fetchNextPage } = 
    useAllProductsInfinite(sortBy);

  // Flatten all products from pages
  const allProduct = useMemo(
    () => data?.pages.flatMap((page) => page.products) ?? [],
    [data]
  );

  const totalProducts = useMemo(
    () => data?.pages[0]?.total ?? 0,
    [data]
  );

  const supplierOptions = useMemo(() => {
    const suppliers = allProduct
      .map((item) => item?.supplier?.company_name)
      .filter(Boolean) as string[];
    return [...new Set(suppliers)].sort((a, b) => a.localeCompare(b));
  }, [allProduct]);

  const categoryOptions = useMemo(() => {
    const categories = allProduct
      .map((item) => item?.category?.name)
      .filter(Boolean) as string[];
    return [...new Set(categories)].sort((a, b) => a.localeCompare(b));
  }, [allProduct]);

  const filteredProducts = useMemo(() => {
    return allProduct.filter((item) => {
      const supplier = item?.supplier?.company_name;
      const category = item?.category?.name;
      const price = Number(item?.product_prices?.ecom_final_selling_price || 0);
      const bySupplier =
        selectedSuppliers.length === 0 ||
        (supplier && selectedSuppliers.includes(supplier));
      const byCategory =
        selectedCategories.length === 0 ||
        (category && selectedCategories.includes(category));
      const byMinPrice = minPrice === null || price >= minPrice;
      const byMaxPrice = maxPrice === null || price <= maxPrice;
      return bySupplier && byCategory && byMinPrice && byMaxPrice;
    });
  }, [allProduct, selectedSuppliers, selectedCategories, minPrice, maxPrice]);

  const clearFilters = () => {
    setSelectedSuppliers([]);
    setSelectedCategories([]);
    setMinPrice(null);
    setMaxPrice(null);
  };

  // Intersection observer for infinite scroll
  useEffect(() => {
    if (!infiniteScrollTrigger.current) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { rootMargin: "100px", threshold: 0.1 }
    );
    observer.observe(infiniteScrollTrigger.current);
    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  return (
    <section className="w-full rounded-lg px-3 md:px-0 py-3">
      <div className="grid grid-cols-1 md:grid-cols-[320px_1fr] xl:grid-cols-[290px_1fr] gap-4">
        {/* Filters Sidebar */}
        <aside className="h-fit max-h-[78vh] overflow-hidden md:sticky md:top-[84px] md:max-h-[calc(100vh-96px)]">
          <div className="border border-[#d7e9e5] p-4 md:p-5 max-h-[78vh] overflow-y-auto md:min-h-[calc(100vh-96px)] md:max-h-[calc(100vh-96px)]">
            <div className="flex justify-between items-center mb-3">
              <h2 className="m-0 text-lg md:text-xl font-medium text-[#2b5e55]">Filter Medicines</h2>
              <button type="button" className="border border-[#8fbdb4] text-[#2d6f63] bg-[#ecf6f4] rounded-full px-3.5 py-2 text-sm" onClick={clearFilters}>Clear</button>
            </div>
            <div className="mb-3 md:hidden">
              <button type="button" className="border border-[#8fbdb4] text-[#2d6f63] bg-[#ecf6f4] rounded-full px-3.5 py-2 text-sm" onClick={() => setIsFilterOpen(!isFilterOpen)}>
                {isFilterOpen ? "Hide Filters" : "Show Filters"}
              </button>
            </div>
            <div className={`${isFilterOpen ? "block" : "hidden"} md:block`}>
              {/* Supplier filter */}
              <div className="border-t border-dashed border-[#cde0dc] pt-3 mt-3">
                <h3 className="m-0 mb-2 text-sm md:text-base font-medium text-[#2b5e55]">Supplier</h3>
                <div className="grid gap-2 max-h-[220px] overflow-y-auto pr-1">
                  {supplierOptions.map((supplier) => (
                    <label key={supplier} className="flex items-center gap-2 text-[#3d5f58] text-sm">
                      <input type="checkbox" checked={selectedSuppliers.includes(supplier)} onChange={(e) => setSelectedSuppliers(e.target.checked ? [...selectedSuppliers, supplier] : selectedSuppliers.filter((s) => s !== supplier))} className="h-4 w-4 accent-[#388072]" />
                      <span>{supplier}</span>
                    </label>
                  ))}
                </div>
              </div>
              {/* Category filter */}
              <div className="border-t border-dashed border-[#cde0dc] pt-3 mt-3">
                <h3 className="m-0 mb-2 text-sm md:text-base font-medium text-[#2b5e55]">Category</h3>
                <div className="grid gap-2 max-h-[220px] overflow-y-auto pr-1">
                  {categoryOptions.map((category) => (
                    <label key={category} className="flex items-center gap-2 text-[#3d5f58] text-sm">
                      <input type="checkbox" checked={selectedCategories.includes(category)} onChange={(e) => setSelectedCategories(e.target.checked ? [...selectedCategories, category] : selectedCategories.filter((c) => c !== category))} className="h-4 w-4 accent-[#388072]" />
                      <span>{category}</span>
                    </label>
                  ))}
                </div>
              </div>
              {/* Price Range */}
              <div className="border-t border-dashed border-[#cde0dc] pt-3 mt-3">
                <h3 className="m-0 mb-2 text-sm md:text-base font-medium text-[#2b5e55]">Price Range (৳)</h3>
                <div className="grid grid-cols-2 gap-2">
                  <label className="grid gap-1 text-sm text-[#3d5f58]">Min
                    <input value={minPrice ?? ""} onChange={(e) => setMinPrice(e.target.value ? Number(e.target.value) : null)} type="number" className="w-full border border-[#b9d4ce] rounded-lg px-2.5 py-2 outline-none focus:border-[#388072]" min="0" placeholder="0" />
                  </label>
                  <label className="grid gap-1 text-sm text-[#3d5f58]">Max
                    <input value={maxPrice ?? ""} onChange={(e) => setMaxPrice(e.target.value ? Number(e.target.value) : null)} type="number" className="w-full border border-[#b9d4ce] rounded-lg px-2.5 py-2 outline-none focus:border-[#388072]" min="0" placeholder="2000" />
                  </label>
                </div>
              </div>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <div className="overflow-y-auto flex-1">
          <div className="p-2 flex justify-between items-center">
            <div className="flex gap-2 items-center">
              <h2 className="text-gray-700">Sort By:</h2>
              <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="bg-white text-gray-900 border rounded">
                <option value="asc">Ascending</option>
                <option value="desc">Descending</option>
              </select>
            </div>
            <h2 className="text-gray-700 text-sm md:text-base text-right">
              <span className="font-semibold text-gray-900">{filteredProducts.length}</span> Filtered
              <span className="mx-1">/</span>
              <span className="font-semibold text-gray-900">{totalProducts}</span> Total
            </h2>
          </div>

          <div className="mb-3">
            {!isLoading && filteredProducts.length <= 0 && <div className="flex justify-center items-center"><p className="text-xl">No data Found!</p></div>}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 gap-x-2 gap-y-4 capitalize lg:place-items-stretch">
              {isLoading && Array.from({ length: 12 }, (_, n) => (
                <div key={`skeleton-${n}`} className="bg-white mb-6 border rounded-md overflow-hidden w-full max-w-[210px] animate-pulse">
                  <div className="w-full h-[209.53px] bg-gray-200" />
                  <div className="p-2"><div className="mb-3"><div className="h-5 w-20 bg-gray-200 rounded-lg" /></div><div className="h-[40px] space-y-1.5"><div className="h-3 w-full bg-gray-200 rounded" /><div className="h-3 w-3/4 bg-gray-200 rounded" /></div></div>
                </div>
              ))}
              {filteredProducts.map((item) => <ProductCard key={item.id} item={item} />)}
            </div>
            <div ref={infiniteScrollTrigger} className="h-20 flex justify-center items-center">
              {isFetchingNextPage && <div className="flex items-center"><Icon icon="mingcute:loading-line" className="h-10 w-10 animate-spin text-[#388072]" /><span className="ml-2">Loading more products...</span></div>}
              {!hasNextPage && allProduct.length > 0 && <div className="text-center text-gray-500">You&apos;ve reached the end of the products list.</div>}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
