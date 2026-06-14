'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import {
  Truck,
  Phone,
  Banknote,
  ClipboardList,
  Search,
  ShoppingCart,
  PackageCheck,
  ArrowRight,
  Loader2,
} from 'lucide-react';
import { useAllProductsInfinite } from '@/lib/hooks/useInfiniteProducts';
import ProductCard from '@/components/ProductCard';
import HeroCarousel from '@/components/HeroCarousel';
import CategoryCarousel from '@/components/CategoryCarousel';

export default function HomePage() {
  const infiniteScrollTrigger = useRef<HTMLDivElement>(null);
  const { data, isLoading, isFetchingNextPage, hasNextPage, fetchNextPage } =
    useAllProductsInfinite();

  const allProduct = data?.pages.flatMap((p) => p.products) ?? [];

  useEffect(() => {
    if (!infiniteScrollTrigger.current) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) fetchNextPage();
      },
      { threshold: 0.1 }
    );
    observer.observe(infiniteScrollTrigger.current);
    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const websiteSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'OusadBazar',
    url: 'https://ousadbazar.com',
    potentialAction: {
      '@type': 'SearchAction',
      target: 'https://ousadbazar.com/search?q={search_term_string}',
      'query-input': 'required name=search_term_string',
    },
  };

  return (
    <div className="px-3 md:px-0 bg-[#f9fafb]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
      />

      <div className="relative left-1/2 right-1/2 w-screen -translate-x-1/2">
        <HeroCarousel />
      </div>

      <div className="mt-4 md:mt-6 bg-gradient-to-b from-[#FFFFFF] to-[#EAEBF4] shadow-lg border-t border-gray-200 rounded-lg border">
        <div className="flex flex-wrap md:flex-nowrap items-center">
          <div className="w-1/2 md:flex-1 flex items-center gap-2 sm:gap-3 px-3 py-4 sm:px-4 sm:py-5 md:px-6 md:py-6">
            <Truck className="text-[#012068] shrink-0 w-7 h-7 sm:w-9 sm:h-9 md:w-10 md:h-10" />
            <div className="min-w-0">
              <h3 className="font-bold text-gray-800 text-xs sm:text-sm md:text-base">Quick Delivery</h3>
              <p className="text-[11px] sm:text-xs md:text-sm text-gray-500">Within 6 Hours in Dhaka City</p>
            </div>
          </div>
          <div className="hidden md:block border-l border-slate-300 h-20" />
          <div className="w-1/2 md:flex-1 flex items-center gap-2 sm:gap-3 px-3 py-4 sm:px-4 sm:py-5 md:px-6 md:py-6">
            <Phone className="text-[#012068] shrink-0 w-7 h-7 sm:w-8 sm:h-8 md:w-9 md:h-9" />
            <div className="min-w-0">
              <h3 className="font-bold text-gray-800 text-xs sm:text-sm md:text-base">24/7 Hour Service</h3>
              <p className="text-[11px] sm:text-xs md:text-sm text-gray-500">Pharmacists On Call 24/7</p>
            </div>
          </div>
          <div className="hidden md:block border-l border-slate-300 h-20" />
          <div className="w-1/2 md:flex-1 flex items-center gap-2 sm:gap-3 px-3 py-4 sm:px-4 sm:py-5 md:px-6 md:py-6">
            <Banknote className="text-[#012068] shrink-0 border-2 border-[#012068] rounded-full p-1 w-7 h-7 sm:w-9 sm:h-9 md:w-10 md:h-10" />
            <div className="min-w-0">
              <h3 className="font-bold text-gray-800 text-xs sm:text-sm md:text-base">Affordable Prices</h3>
              <p className="text-[11px] sm:text-xs md:text-sm text-gray-500">Buy At Low Price And Avail Discount</p>
            </div>
          </div>
          <div className="hidden md:block border-l border-slate-300 h-20" />
          <div className="w-1/2 md:flex-1 flex items-center gap-2 sm:gap-3 px-3 py-4 sm:px-4 sm:py-5 md:px-6 md:py-6">
            <ClipboardList className="text-[#012068] shrink-0 w-7 h-7 sm:w-9 sm:h-9 md:w-10 md:h-10" />
            <div className="min-w-0">
              <h3 className="font-bold text-gray-800 text-xs sm:text-sm md:text-base">E-Prescription</h3>
              <p className="text-[11px] sm:text-xs md:text-sm text-gray-500">E-Prescription Facility Through My Health</p>
            </div>
          </div>
        </div>
      </div>

      <div className="relative mt-4 overflow-hidden rounded-lg shadow-sm border border-gray-200 px-4 py-5 sm:px-6 sm:py-6 md:px-8 md:py-8 bg-gradient-to-br from-white via-[#f4f5f9] to-[#e7e9f5]">
        <span className="pointer-events-none absolute -top-10 -right-10 w-40 h-40 rounded-full bg-gradient-to-br from-[#012068]/15 to-transparent blur-2xl" />
        <span className="pointer-events-none absolute -bottom-12 -left-10 w-48 h-48 rounded-full bg-gradient-to-tr from-[#7c88c9]/15 to-transparent blur-2xl" />

        <div className="relative flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 lg:gap-6">
          <div className="shrink-0">
            <h2 className="text-base sm:text-lg md:text-xl font-bold bg-clip-text">
              How To Order
            </h2>
            <p className="text-xs md:text-sm text-gray-500 mt-1">Get your medicines in 3 simple steps</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3 flex-1 w-full lg:min-w-[260px]">
            {[
              { step: '01', icon: Search,        title: 'Search Medicine', desc: 'Find what you need',  card: 'from-[#eef0fb] to-[#dde2f6]', iconBg: 'from-[#012068] to-[#7c88c9]' },
              { step: '02', icon: ShoppingCart,  title: 'Add To Cart',     desc: 'Place your order',    card: 'from-[#e7f4f2] to-[#cfe7e2]', iconBg: 'from-[#2ea89a] to-[#57c7b7]' },
              { step: '03', icon: PackageCheck,  title: 'Get Delivery',    desc: 'At your doorstep',    card: 'from-[#fff2e3] to-[#ffe1c2]', iconBg: 'from-[#f59e0b] to-[#fbbf24]' },
            ].map((s) => (
              <div
                key={s.step}
                className={`relative flex items-center gap-2 sm:gap-3 px-3 py-3 sm:px-4 sm:py-4 rounded-lg bg-gradient-to-br ${s.card} border`}
              >
                <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-br ${s.iconBg} flex items-center justify-center shadow-md shrink-0 ring-2 ring-white`}>
                  <s.icon className="text-white w-5 h-5 sm:w-[26px] sm:h-[26px]" />
                </div>
                <div className="flex flex-col leading-tight min-w-0">
                  <span className="text-[10px] md:text-xs font-bold bg-gradient-to-r from-[#012068] to-[#8b96d1] bg-clip-text text-transparent">
                    STEP {s.step}
                  </span>
                  <span className="text-xs sm:text-sm md:text-base font-semibold text-gray-800 truncate">{s.title}</span>
                  <span className="text-[11px] md:text-xs text-gray-500 mt-0.5 truncate">{s.desc}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <CategoryCarousel />

      <div className="flex items-end justify-between gap-3 mt-10 md:mt-16 mb-5 md:mb-7">
        <div className="flex items-center gap-3">
          <span className="block w-1 h-8 md:h-10 rounded-full bg-gradient-to-b from-[#5360A7] to-[#012068]" />
          <div>
            <h2 className="text-base sm:text-lg md:text-2xl font-bold text-gray-900 capitalize leading-tight">
              Best Selling
            </h2>
            <p className="text-[11px] sm:text-xs md:text-sm text-gray-500 mt-0.5">
              Top picks loved by our customers
            </p>
          </div>
        </div>

        <Link
          href="/best-selling"
          className="group shrink-0 inline-flex items-center gap-1 text-xs sm:text-sm md:text-base font-semibold text-[#012068] hover:text-[#5360A7] transition-colors"
        >
          <span className="hidden sm:inline">View All</span>
          <span className="sm:hidden">All</span>
          <ArrowRight className="w-3.5 h-3.5 md:w-4 md:h-4 transition-transform duration-300 group-hover:translate-x-1" />
        </Link>
      </div>

      <div className="mb-3">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-6 gap-x-2 gap-y-4 capitalize place-items-center md:place-items-start">
          {isLoading &&
            Array.from({ length: 18 }, (_, n) => (
              <div
                key={`skeleton-${n}`}
                className="bg-white dark:bg-gray-800 mb-4 md:mb-6 border dark:border-gray-700 rounded-md overflow-hidden w-full max-w-[210px] animate-pulse"
              >
                <div className="w-full aspect-square bg-gray-200" />
                <div className="p-2 md:px-2 md:pb-2">
                  <div className="mb-1">
                    <div className="h-5 w-20 bg-gray-200 rounded-lg" />
                  </div>
                  <div className="h-[40px] space-y-1.5">
                    <div className="h-3 w-full bg-gray-200 rounded" />
                    <div className="h-3 w-3/4 bg-gray-200 rounded" />
                  </div>
                  <div className="flex items-center mt-1">
                    <div className="w-2 h-2 rounded-full bg-gray-200 mr-2" />
                    <div className="h-3 w-16 bg-gray-200 rounded" />
                  </div>
                  <div className="flex items-end justify-between mt-2">
                    <div className="space-y-1">
                      <div className="h-3 w-12 bg-gray-200 rounded" />
                      <div className="h-4 w-16 bg-gray-300 rounded" />
                    </div>
                    <div className="h-8 w-16 bg-gray-200 rounded" />
                  </div>
                </div>
              </div>
            ))}

          {allProduct.map((item) => (
            <ProductCard key={item.id} item={item} />
          ))}
        </div>

        <div ref={infiniteScrollTrigger} className="h-16 md:h-20 flex justify-center items-center px-2">
          {isFetchingNextPage && (
            <div className="flex items-center">
              <Loader2 className="h-7 w-7 md:h-10 md:w-10 animate-spin text-[#388072]" />
              <span className="ml-2 text-xs sm:text-sm md:text-base">Loading more products...</span>
            </div>
          )}
          {!hasNextPage && allProduct.length > 0 && (
            <div className="text-center text-xs sm:text-sm md:text-base text-gray-500 dark:text-gray-400">
              You&apos;ve reached the end of the products list.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
