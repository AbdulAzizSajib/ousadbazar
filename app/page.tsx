'use client';

import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import Link from 'next/link';
import { Icon } from '@iconify/react';
import axios from 'axios';
import { apiBasePharma, formatNumber, imgBasePharma } from '@/lib/config';
import { useCartStore } from '@/stores/cartStore';
import ProductCard from '@/components/ProductCard';
import HeroCarousel from '@/components/HeroCarousel';
import CategoryCarousel from '@/components/CategoryCarousel';
import type { Product } from '@/types';

export default function HomePage() {
  const [allProduct, setAllProduct] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const infiniteScrollTrigger = useRef<HTMLDivElement>(null);
  const pageRef = useRef(1);

  const getAllProduct = useCallback(async () => {
    if (loading || !hasMore) return;
    setLoading(true);
    try {
      const res = await axios.get(
        `${apiBasePharma}/products/best-selling-product?page=${pageRef.current}&paginate=20`
      );
      if (res.data) {
        const products: Product[] = (res.data.data || []).map((p: Record<string, unknown>) => ({
          ...p,
          category: { name: p.category_name as string },
          product_prices: {
            selling_price: p.selling_price as number,
            ecom_final_selling_price: p.selling_price as number,
            ecom_discount_percentage: null,
            pack_quantity: 1,
            ecom_pack_name: { name: ' Pcs' },
          },
          product_images: [],
          stock_batches: p.stock ? [{ balanced_quantity: p.stock as number }] : [],
        }));
        setAllProduct((prev) => (pageRef.current === 1 ? products : [...prev, ...products]));
        setHasMore(pageRef.current < (res.data.last_page || 1));
        pageRef.current++;
        setCurrentPage(pageRef.current);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    getAllProduct();
  }, []);

  useEffect(() => {
    if (!infiniteScrollTrigger.current) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !loading && hasMore) getAllProduct();
      },
      { threshold: 0.1 }
    );
    observer.observe(infiniteScrollTrigger.current);
    return () => observer.disconnect();
  }, [loading, hasMore, getAllProduct]);

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
      {/* Website JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
      />

      {/* Hero Carousel */}
      <div className="relative left-1/2 right-1/2 w-screen -translate-x-1/2">
        <HeroCarousel />  
      </div>

      {/* Feature Highlights */}
      <div className="mt-6 bg-gradient-to-b from-[#FFFFFF] to-[#EAEBF4] shadow-lg border-t border-gray-200  rounded-lg  border">
        <div className="flex flex-wrap md:flex-nowrap items-center">
          <div className="w-1/2 md:flex-1 flex items-center gap-3 px-10 py-10">
            <Icon icon="mdi:truck-fast" className="text-yellow-400 shrink-0" width={40} height={40} />
            <div>
              <h3 className="font-bold text-gray-800 text-sm md:text-base">Quick Delivery</h3>
              <p className="text-xs md:text-sm text-gray-500">Within 6 Hours in Dhaka City</p>
            </div>
          </div>
          <div className="hidden md:block border-l border-slate-300 h-20" />
          <div className="w-1/2 md:flex-1 flex items-center gap-3 px-4 py-4">
            <Icon icon="solar:phone-calling-bold" className="text-green-500 shrink-0" width={40} height={40} />
            <div>
              <h3 className="font-bold text-gray-800 text-sm md:text-base">24/7 Hour Service</h3>
              <p className="text-xs md:text-sm text-gray-500">Pharmacists On Call 24/7</p>
            </div>
          </div>
          <div className="hidden md:block border-l border-slate-300 h-20" />
          <div className="w-1/2 md:flex-1 flex items-center gap-3 px-4 py-4">
            <Icon icon="mdi:currency-bdt" className="text-blue-500 shrink-0 border-2 border-blue-500 rounded-full p-1" width={40} height={40} />
            <div>
              <h3 className="font-bold text-gray-800 text-sm md:text-base">Affordable Prices</h3>
              <p className="text-xs md:text-sm text-gray-500">Buy At Low Price And Avail Discount</p>
            </div>
          </div>
          <div className="hidden md:block border-l border-slate-300 h-20" />
          <div className="w-1/2 md:flex-1 flex items-center gap-3 px-4 py-4">
            <Icon icon="mdi:clipboard-text-outline" className="text-amber-600 shrink-0" width={40} height={40} />
            <div>
              <h3 className="font-bold text-gray-800 text-sm md:text-base">E-Prescription</h3>
              <p className="text-xs md:text-sm text-gray-500">E-Prescription Facility Through My Health</p>
            </div>
          </div>
        </div>
      </div>

      {/* How to Order */}
      <div className="relative mt-4 overflow-hidden rounded-lg shadow-sm border border-gray-200 px-6 py-6 md:px-8 md:py-8 bg-gradient-to-br from-white via-[#f4f5f9] to-[#e7e9f5]">
        <span className="pointer-events-none absolute -top-10 -right-10 w-40 h-40 rounded-full bg-gradient-to-br from-[#5360A7]/15 to-transparent blur-2xl" />
        <span className="pointer-events-none absolute -bottom-12 -left-10 w-48 h-48 rounded-full bg-gradient-to-tr from-[#7c88c9]/15 to-transparent blur-2xl" />

        <div className="relative flex items-center justify-between gap-6 flex-wrap">
          <div className="shrink-0">
            <h2 className="text-lg md:text-xl font-bold bg-clip-text">
              How To Order
            </h2>
            <p className="text-xs md:text-sm text-gray-500 mt-1">Get your medicines in 3 simple steps</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 flex-1 min-w-[260px]">
            {[
              { step: '01', icon: 'mdi:magnify',              title: 'Search Medicine', desc: 'Find what you need',  card: 'from-[#eef0fb] to-[#dde2f6]', iconBg: 'from-[#5360A7] to-[#7c88c9]' },
              { step: '02', icon: 'mdi:cart-outline',         title: 'Add To Cart',     desc: 'Place your order',    card: 'from-[#e7f4f2] to-[#cfe7e2]', iconBg: 'from-[#2ea89a] to-[#57c7b7]' },
              { step: '03', icon: 'mdi:truck-check-outline',  title: 'Get Delivery',    desc: 'At your doorstep',    card: 'from-[#fff2e3] to-[#ffe1c2]', iconBg: 'from-[#f59e0b] to-[#fbbf24]' },
            ].map((s) => (
              <div
                key={s.step}
                className={`relative flex items-center gap-3 px-4 py-4 rounded-lg bg-gradient-to-br ${s.card} border border-white/60 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all`}
              >
                <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${s.iconBg} flex items-center justify-center shadow-md shrink-0 ring-2 ring-white`}>
                  <Icon icon={s.icon} className="text-white" width={26} height={26} />
                </div>
                <div className="flex flex-col leading-tight">
                  <span className="text-[10px] md:text-xs font-bold bg-gradient-to-r from-[#5360A7] to-[#8b96d1] bg-clip-text text-transparent">
                    STEP {s.step}
                  </span>
                  <span className="text-sm md:text-base font-semibold text-gray-800">{s.title}</span>
                  <span className="text-[11px] md:text-xs text-gray-500 mt-0.5">{s.desc}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>



      {/* Category Carousel */}
      <CategoryCarousel />

      {/* Best Selling Products Header */}
      <div className="flex justify-between items-center mt-16  mb-8 text-primary">
        <h2 className="md:text-2xl font-bold text-black capitalize">Best Selling</h2>
        <Link href="/best-selling">
          <button className=" dark:bg-gray-800  font-semibold  px-2 md:px-6 py-0.5 md:py-2">
            See All <Icon icon="ant-design:arrow-right-outlined" className="inline align-middle" />
          </button>
        </Link>
      </div>

      {/* Products Grid */}
      <div className="mb-3">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 2xl:grid-cols-6 gap-x-0 gap-y-4 capitalize place-items-center md:place-items-start">
          {/* Skeleton */}
          {!loading &&
            currentPage === 1 &&
            Array.from({ length: 18 }, (_, n) => (
              <div
                key={`skeleton-${n}`}
                className="bg-white dark:bg-gray-800 mb-6 border dark:border-gray-700 rounded-md overflow-hidden w-full max-w-[210px] animate-pulse"
              >
                <div className="w-full h-[209.53px] bg-gray-200" />
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

        {/* Infinite Scroll Trigger */}
        <div ref={infiniteScrollTrigger} className="h-20 flex justify-center items-center">
          {loading && currentPage > 1 && (
            <div className="flex items-center">
              <Icon
                icon="mingcute:loading-line"
                className="h-10 w-10 animate-spin text-[#388072]"
              />
              <span className="ml-2">Loading more products...</span>
            </div>
          )}
          {!hasMore && allProduct.length > 0 && (
            <div className="text-center text-gray-500 dark:text-gray-400">
              You&apos;ve reached the end of the products list.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
