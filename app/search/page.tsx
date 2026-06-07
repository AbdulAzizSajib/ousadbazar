"use client";

import { Suspense, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useRouter } from "next/navigation";
import { Icon } from "@iconify/react";
import Link from "next/link";
import Image from "next/image";
import { useSearchProducts } from "@/lib/hooks/useProducts";
import { useSearchStore } from "@/stores/searchStore";
import { imgBasePharma, asset } from "@/lib/config";

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-gray-500">Loading...</div>}>
      <SearchContent />
    </Suspense>
  );
}

function SearchContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const query = searchParams.get("q") || "";
  const { data: searchData = [], isLoading } = useSearchProducts(query);
  const {
    search,
    searchHistory,
    saveSearchHistory,
    removeSearchHistory,
    clearSearchHistory,
  } = useSearchStore();

  useEffect(() => {
    search(query);
  }, [query, search]);

  useEffect(() => {
    const normalized = query.trim();
    if (!normalized) return;

    const timeout = setTimeout(() => {
      saveSearchHistory(normalized);
    }, 700);

    return () => clearTimeout(timeout);
  }, [query, saveSearchHistory]);

  return (
    <section className="w-full min-h-screen py-6 px-3 md:px-0">
      {query && !isLoading && (
        <div className="mb-4">
          <h2 className="text-lg text-gray-700">
            Showing results for <span className="font-bold text-gray-900">&quot;{query}&quot;</span>
            <span className="text-sm text-gray-500 ml-2">({searchData.length} items found)</span>
          </h2>
        </div>
      )}

      {isLoading && (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-6 gap-4">
          {Array.from({ length: 10 }, (_, n) => (
            <div key={`skeleton-${n}`} className="bg-white border rounded-lg overflow-hidden animate-pulse">
              <div className="w-full h-[180px] bg-gray-200" />
              <div className="p-3 space-y-2"><div className="h-4 w-20 bg-gray-200 rounded" /><div className="h-4 w-full bg-gray-200 rounded" /><div className="h-4 w-3/4 bg-gray-200 rounded" /></div>
            </div>
          ))}
        </div>
      )}

      {!isLoading && searchData.length > 0 && (
        <div className="flex flex-col gap-2 capitalize">
          {searchData.map((item: any) => (
            <Link
              key={item.id}
              href={`/product?id=${item?.id}`}
              className="group flex w-full items-center gap-4 overflow-hidden rounded-xl border border-gray-100 bg-white p-3 transition-all duration-300 hover:border-gray-200 hover:shadow-sm dark:border-gray-700 dark:bg-gray-800"
            >
              <div className="relative h-24 w-24 flex-shrink-0 overflow-hidden rounded-lg bg-gray-50 md:h-28 md:w-28 dark:bg-gray-700">
                <Image
                  width={112}
                  height={112}
                  loading="lazy"
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                  src={`${imgBasePharma}/${item?.path}`}
                  alt={item?.name}
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = asset("/images/placeholder.svg");
                  }}
                />
              </div>
              <div className="flex min-w-0 flex-1 flex-col gap-1">
                <div className="flex items-center gap-2">
                  <h3
                    className="line-clamp-1 text-[14px] font-semibold leading-snug text-gray-800 dark:text-gray-100"
                    title={item?.name}
                  >
                    {item?.name}
                  </h3>
                  {item?.category_name && (
                    <span className="rounded-full border border-gray-200 bg-[#F4F5F9] px-2 py-0.5 text-[10px] font-medium text-gray-600 dark:border-gray-600/60 dark:bg-gray-800/80 dark:text-gray-300">
                      {item.category_name}
                    </span>
                  )}
                </div>
                {item?.generic_name && (
                  <p className="line-clamp-1 text-[12px] text-gray-500 normal-case dark:text-gray-400">
                    {item.generic_name}
                  </p>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}

      {!isLoading && searchData.length === 0 && query && (
        <div className="flex flex-col items-center justify-center py-20">
          <Icon icon="mdi:magnify-close" className="w-16 h-16 text-gray-300 mb-4" />
          <p className="text-lg text-gray-500">No products found</p>
          <p className="text-sm text-gray-400 mt-1">Try a different search term</p>
        </div>
      )}

      {!query && (
        <div className="mx-auto w-full max-w-3xl rounded-2xl border border-gray-100 bg-white p-6 md:p-8">
          <div className="flex flex-col items-center justify-center text-center">
            <Icon icon="mingcute:search-line" className="mb-4 h-14 w-14 text-gray-300" />
            <p className="text-lg font-semibold text-gray-700">Search for products</p>
            <p className="mt-1 text-sm text-gray-500">Type a product name to get started</p>
          </div>

          <div className="mt-8 border-t border-gray-100 pt-5">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-gray-700">Recent searches</h3>
              {searchHistory.length > 0 && (
                <button
                  type="button"
                  onClick={clearSearchHistory}
                  className="text-xs font-medium text-gray-500 transition-colors hover:text-gray-700"
                >
                  Clear all
                </button>
              )}
            </div>

            {searchHistory.length === 0 ? (
              <p className="text-sm text-gray-400">Your recent searches will appear here.</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {searchHistory.map((term) => (
                  <div
                    key={term}
                    className="group inline-flex items-center gap-1 rounded-full border border-gray-200 bg-gray-50 px-3 py-1.5"
                  >
                    <button
                      type="button"
                      onClick={() => router.push(`/search?q=${encodeURIComponent(term)}`)}
                      className="text-sm text-gray-700 transition-colors hover:text-gray-900"
                    >
                      {term}
                    </button>
                    <button
                      type="button"
                      aria-label={`Remove ${term} from search history`}
                      onClick={() => removeSearchHistory(term)}
                      className="text-gray-400 transition-colors hover:text-gray-600"
                    >
                      <Icon icon="mdi:close" className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
