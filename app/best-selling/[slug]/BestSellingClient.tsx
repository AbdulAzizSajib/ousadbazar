'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import { Icon } from '@iconify/react';
import { Drawer, Slider } from 'antd';
import ProductCard from '@/components/ProductCard';
import { useAllProductsInfinite } from '@/lib/hooks/useInfiniteProducts';
import { useChildCategories } from '@/lib/hooks/useChildCategories';
import Link from 'next/link';
import { useParams } from 'next/navigation';

type OptionItem = { id: number; name: string };

const PRICE_SLIDER_MAX = 5000;

const prettifySlug = (text: string) =>
  text
    .replace(/-/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/\b\w/g, (c) => c.toUpperCase());

export default function BestSellingClient() {

  const params = useParams();

  const slug = (params?.slug as string) || '';
  const slugParts = slug.split('-');
  const parsedParentId = Number(slugParts[slugParts.length - 1]);
  const parentEcomCatId = Number.isFinite(parsedParentId) && parsedParentId > 0 ? parsedParentId : null;
  const parentNameFromSlug = useMemo(
    () => (slugParts.length > 1 ? prettifySlug(slugParts.slice(0, -1).join('-')) : ''),
    [slug]
  );

  const [sortBy, setSortBy] = useState('asc');
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const [selectedSupplierId, setSelectedSupplierId] = useState<number | null>(null);
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
  const [minPrice, setMinPrice] = useState<number | null>(null);
  const [maxPrice, setMaxPrice] = useState<number | null>(null);
  // Price input drafts (debounced before firing API)
  const [minPriceInput, setMinPriceInput] = useState<string>('');
  const [maxPriceInput, setMaxPriceInput] = useState<string>('');

  // Persisted supplier options (so options don't shrink when a filter is applied)
  const [supplierOptions, setSupplierOptions] = useState<OptionItem[]>([]);

  // Child categories for this parent — fetched from /all-category/{parentEcomCatId}
  const { data: childCategories = [], isLoading: isLoadingChildren } = useChildCategories(
    parentEcomCatId ?? 0
  );

  const categoryOptions = useMemo<OptionItem[]>(() => {
    return childCategories
      .filter((c) => c?.id && c?.name)
      .map((c) => ({ id: Number(c.id), name: c.name }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [childCategories]);

  const infiniteScrollTrigger = useRef<HTMLDivElement>(null);

  // When no child is selected, filter products by the parent ecom_cat_id so only
  // this parent's products load. Once a child is picked, filter by its id.
  const effectiveCategoryId = selectedCategoryId ?? parentEcomCatId;

  const { data, isLoading, isFetchingNextPage, hasNextPage, fetchNextPage } =
    useAllProductsInfinite(sortBy, {
      categoryId: effectiveCategoryId,
      supplierId: selectedSupplierId,
      minPrice,
      maxPrice,
    });

  const allProduct = useMemo(() => data?.pages.flatMap((page) => page.products) ?? [], [data]);

  const totalProducts = useMemo(() => data?.pages[0]?.total ?? 0, [data]);

  // Reset child selection when the parent (URL) changes
  useEffect(() => {
    setSelectedCategoryId(null);
  }, [parentEcomCatId]);

  // Accumulate supplier options across requests (dedupe by id, keep stable sorted list).
  // Category options come from useChildCategories, not from product responses.
  useEffect(() => {
    if (allProduct.length === 0) return;
    setSupplierOptions((prev) => {
      const map = new Map(prev.map((o) => [o.id, o]));
      for (const p of allProduct) {
        const id = p?.supplier?.id;
        const name = p?.supplier?.company_name;
        if (id && name && !map.has(id)) map.set(id, { id, name });
      }
      return [...map.values()].sort((a, b) => a.name.localeCompare(b.name));
    });
  }, [allProduct]);

  // Debounce price inputs → commit to filter after 500ms idle
  useEffect(() => {
    const t = setTimeout(() => {
      setMinPrice(minPriceInput ? Number(minPriceInput) : null);
    }, 500);
    return () => clearTimeout(t);
  }, [minPriceInput]);
  useEffect(() => {
    const t = setTimeout(() => {
      setMaxPrice(maxPriceInput ? Number(maxPriceInput) : null);
    }, 500);
    return () => clearTimeout(t);
  }, [maxPriceInput]);

  // Server handles filtering — just use what came back
  const filteredProducts = allProduct;

  const activeFilterCount =
    (selectedSupplierId !== null ? 1 : 0) +
    (selectedCategoryId !== null ? 1 : 0) +
    (minPrice !== null ? 1 : 0) +
    (maxPrice !== null ? 1 : 0);

  const clearFilters = () => {
    setSelectedSupplierId(null);
    setSelectedCategoryId(null);
    setMinPrice(null);
    setMaxPrice(null);
    setMinPriceInput('');
    setMaxPriceInput('');
  };

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

  const FilterPanel = (
    <div className="flex flex-col h-full">
      {/* Supplier */}
      <div className="pb-4 border-b border-gray-100">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-gray-900">Supplier</h3>
          {selectedSupplierId !== null && (
            <button
              type="button"
              onClick={() => setSelectedSupplierId(null)}
              className="text-[11px] text-[#388072] hover:text-[#2d6a5a] font-medium"
            >
              Clear
            </button>
          )}
        </div>
        <div className="grid gap-2 max-h-[220px] overflow-y-auto pr-1">
          {supplierOptions.length === 0 && (
            <p className="text-xs text-gray-400">No suppliers available</p>
          )}
          {supplierOptions.map((supplier) => (
            <label
              key={supplier.id}
              className="flex items-center gap-2.5 text-gray-700 text-sm cursor-pointer hover:text-[#388072]"
            >
              <input
                type="radio"
                name="supplier-filter"
                checked={selectedSupplierId === supplier.id}
                onChange={() => setSelectedSupplierId(supplier.id)}
                className="h-4 w-4 accent-[#388072]"
              />
              <span className="truncate">{supplier.name}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Category */}
      <div className="py-4 border-b border-gray-100">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-gray-900">Category</h3>
          {selectedCategoryId !== null && (
            <button
              type="button"
              onClick={() => setSelectedCategoryId(null)}
              className="text-[11px] text-[#388072] hover:text-[#2d6a5a] font-medium"
            >
              Clear
            </button>
          )}
        </div>
        <div className="grid gap-2 max-h-[220px] overflow-y-auto pr-1">
          {isLoadingChildren && (
            <p className="text-xs text-gray-400">Loading categories…</p>
          )}
          {!isLoadingChildren && categoryOptions.length === 0 && (
            <p className="text-xs text-gray-400">No categories available</p>
          )}
          {categoryOptions.map((category) => (
            <label
              key={category.id}
              className="flex items-center gap-2.5 text-gray-700 text-sm cursor-pointer hover:text-[#388072]"
            >
              <input
                type="radio"
                name="category-filter"
                checked={selectedCategoryId === category.id}
                onChange={() => setSelectedCategoryId(category.id)}
                className="h-4 w-4 accent-[#388072]"
              />
              <span className="truncate">{category.name}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Price Range */}
      <div className="py-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-gray-900">Price Range (৳)</h3>
          {(minPrice !== null || maxPrice !== null) && (
            <button
              type="button"
              onClick={() => {
                setMinPriceInput('');
                setMaxPriceInput('');
              }}
              className="text-[11px] text-[#388072] hover:text-[#2d6a5a] font-medium"
            >
              Clear
            </button>
          )}
        </div>
        <div className="px-1.5 mb-3">
          <Slider
            range
            min={0}
            max={PRICE_SLIDER_MAX}
            step={50}
            value={[
              minPriceInput ? Math.min(Number(minPriceInput), PRICE_SLIDER_MAX) : 0,
              maxPriceInput ? Math.min(Number(maxPriceInput), PRICE_SLIDER_MAX) : PRICE_SLIDER_MAX,
            ]}
            onChange={(value) => {
              const [min, max] = value as number[];
              setMinPriceInput(min > 0 ? String(min) : '');
              setMaxPriceInput(max < PRICE_SLIDER_MAX ? String(max) : '');
            }}
            tooltip={{ formatter: (v) => `৳${v}` }}
            styles={{ track: { backgroundColor: '#388072' }, handle: { borderColor: '#388072' } }}
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <label className="grid gap-1 text-xs text-gray-500">
            Min
            <input
              value={minPriceInput}
              onChange={(e) => setMinPriceInput(e.target.value)}
              type="number"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-[#388072] focus:ring-1 focus:ring-[#388072]/20"
              min="0"
              placeholder="0"
            />
          </label>
          <label className="grid gap-1 text-xs text-gray-500">
            Max
            <input
              value={maxPriceInput}
              onChange={(e) => setMaxPriceInput(e.target.value)}
              type="number"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-[#388072] focus:ring-1 focus:ring-[#388072]/20"
              min="0"
              placeholder="2000"
            />
          </label>
        </div>
      </div>
    </div>
  );

  return (
    <section className="w-full px-3 md:px-0 py-3 min-h-screen">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs md:text-sm mb-4" aria-label="Breadcrumb">
        <Link href="/" className="text-gray-500 hover:text-[#012068] transition-colors">
          Home
        </Link>
        <Icon icon="mdi:chevron-right" className="w-4 h-4 text-gray-300" />
        <Link href="/best-selling" className="text-gray-500 hover:text-[#012068] transition-colors">
          Best Selling
        </Link>
        {parentNameFromSlug && (
          <>
            <Icon icon="mdi:chevron-right" className="w-4 h-4 text-gray-300" />
            <span className={selectedCategoryId ? 'text-gray-500' : 'text-gray-900 font-medium'}>
              {parentNameFromSlug}
            </span>
          </>
        )}
        {selectedCategoryId && (
          <>
            <Icon icon="mdi:chevron-right" className="w-4 h-4 text-gray-300" />
            <span className="text-gray-900 font-medium">
              {categoryOptions.find((c) => c.id === selectedCategoryId)?.name || 'Category'}
            </span>
          </>
        )}
      </nav>

      <div className="grid grid-cols-1 md:grid-cols-[290px_1fr] xl:grid-cols-[290px_1fr] gap-4 items-start">
        {/* Desktop Sidebar */}
        <aside className="hidden md:block self-start sticky top-[156px]">
          <div className="bg-white border border-gray-200 rounded-xl md:max-h-[calc(100vh-168px)] overflow-hidden flex flex-col">
            <div className="flex justify-between items-center px-5 py-4 border-b border-gray-100">
              <h2 className="m-0 text-base font-semibold text-gray-900">Filter Medicines</h2>
              {activeFilterCount > 0 && (
                <button
                  type="button"
                  className="text-xs text-[#388072] hover:text-[#2d6a5a] font-medium"
                  onClick={clearFilters}
                >
                  Clear ({activeFilterCount})
                </button>
              )}
            </div>
            <div className="px-5 py-2 overflow-y-auto">{FilterPanel}</div>
          </div>
        </aside>

        {/* Main Content */}
        <div className="flex-1 min-w-0 ">
          {/* Top controls bar */}
          <div className="bg-white border border-gray-200 rounded-xl px-3 py-2.5 mb-3 flex justify-between items-center gap-3 md:hidden">
            {/* Mobile filter button */}
            <button
              type="button"
              onClick={() => setMobileFilterOpen(true)}
              className="md:hidden inline-flex items-center gap-2 px-3 py-1.5 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:border-[#388072] hover:text-[#388072] transition-colors relative"
            >
              <Icon icon="mdi:filter-variant" className="w-4 h-4" />
              Filter
              {activeFilterCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-[#388072] text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center">
                  {activeFilterCount}
                </span>
              )}
            </button>

            <div className="flex gap-2 items-center">
              <label className="text-sm text-gray-600 whitespace-nowrap">Sort By:</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-white text-gray-900 border border-gray-200 rounded-lg px-2 py-1 text-sm outline-none focus:border-[#388072]"
              >
                <option value="asc">Default</option>
                <option value="desc">Descending</option>
              </select>
            </div>

            {/* <div className="hidden sm:block text-sm text-gray-600 text-right">
              <span className="font-semibold text-gray-900">
                {filteredProducts.length}
              </span>{" "}
              /{" "}
              <span className="font-semibold text-gray-900">{totalProducts}</span>{" "}
              Total
            </div> */}
          </div>

          <div className="mb-3">
            {!isLoading && filteredProducts.length <= 0 && (
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
              {filteredProducts.map((item) => (
                <ProductCard key={item.id} item={item} />
              ))}
            </div>
            <div ref={infiniteScrollTrigger} className="h-20 flex justify-center items-center">
              {isFetchingNextPage && (
                <div className="flex items-center">
                  <Icon
                    icon="mingcute:loading-line"
                    className="h-10 w-10 animate-spin text-[#388072]"
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
        </div>
      </div>

      {/* Mobile Filter Drawer */}
      <Drawer
        title={
          <div className="flex items-center gap-2">
            <Icon icon="mdi:filter-variant" className="w-5 h-5 text-[#388072]" />
            <span className="font-semibold">Filter Medicines</span>
            {activeFilterCount > 0 && (
              <span className="bg-[#388072] text-white text-xs font-bold px-2 py-0.5 rounded-full">
                {activeFilterCount}
              </span>
            )}
          </div>
        }
        placement="left"
        closable
        open={mobileFilterOpen}
        onClose={() => setMobileFilterOpen(false)}
        width={typeof window !== 'undefined' && window.innerWidth < 768 ? '85%' : 360}
        footer={
          <div className="flex gap-2">
            <button
              type="button"
              onClick={clearFilters}
              className="flex-1 border border-gray-200 text-gray-700 rounded-lg py-2.5 text-sm font-medium hover:bg-gray-50"
            >
              Clear All
            </button>
            <button
              type="button"
              onClick={() => setMobileFilterOpen(false)}
              className="flex-1 bg-[#388072] hover:bg-[#2d6a5a] text-white rounded-lg py-2.5 text-sm font-semibold"
            >
              Show {filteredProducts.length} Results
            </button>
          </div>
        }
      >
        {FilterPanel}
      </Drawer>
    </section>
  );
}
