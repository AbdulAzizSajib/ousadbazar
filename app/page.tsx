"use client";

import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import Link from "next/link";
import { Icon } from "@iconify/react";
import axios from "axios";
import { apiBasePharma, formatNumber, imgBasePharma } from "@/lib/config";
import { useCartStore } from "@/stores/cartStore";
import ProductCard from "@/components/ProductCard";
import type { Product } from "@/types";

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
            ecom_pack_name: { name: " Pcs" },
          },
          product_images: [],
          stock_batches: p.stock ? [{ balanced_quantity: p.stock as number }] : [],
        }));
        setAllProduct((prev) => pageRef.current === 1 ? products : [...prev, ...products]);
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

  return (
    <div className="px-3 md:px-0">
      {/* Hero Banner */}
      <div className="relative overflow-hidden border bg-gradient-to-r from-[#2b5f55] via-[#388072] to-[#6bb7aa] p-5 md:p-8 lg:p-10 text-white shadow-lg mb-5">
        <div className="absolute -top-10 -right-10 w-40 h-40 md:w-56 md:h-56 rounded-full bg-white/10 blur-2xl" />
        <div className="absolute -bottom-12 -left-10 w-44 h-44 md:w-60 md:h-60 rounded-full bg-[#1f4c43]/40 blur-2xl" />
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="max-w-2xl">
            <p className="inline-block bg-white/15 backdrop-blur-sm border border-white/20 px-3 py-1 rounded-full text-xs md:text-sm font-medium mb-3">
              অনলাইন মেডিসিন ই-কমার্স
            </p>
            <h1 className="text-xl md:text-3xl lg:text-4xl font-extrabold leading-tight">
              আপনার বিশ্বস্ত অনলাইন ফার্মেসি, এখন আরও দ্রুত
            </h1>
            <p className="text-sm md:text-base text-white/90 mt-3 leading-relaxed">
              ঘরে বসেই অর্ডার করুন প্রয়োজনীয় ওষুধ, হেলথকেয়ার ও ওয়েলনেস পণ্য।
              সাশ্রয়ী দামে, সহজ পেমেন্টে এবং নির্ভরযোগ্য ডেলিভারিতে
              স্বাস্থ্যসেবাকে নিয়ে আসুন আপনার হাতের নাগালে।
            </p>
            <div className="flex flex-wrap items-center gap-2 mt-4 text-xs md:text-sm">
              <span className="bg-white/15 border border-white/20 px-3 py-1 rounded-full">অরিজিনাল পণ্য</span>
              <span className="bg-white/15 border border-white/20 px-3 py-1 rounded-full">দ্রুত ডেলিভারি</span>
              <span className="bg-white/15 border border-white/20 px-3 py-1 rounded-full">২৪/৭ সহায়তা</span>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row lg:flex-col xl:flex-row gap-3">
            <Link href="/all-medicines">
              <button className="w-full sm:w-auto bg-white text-[#2d6a5a] font-semibold px-5 py-2.5 rounded-lg hover:bg-[#e9f5f2] transition-colors">
                এখনই কেনাকাটা করুন
              </button>
            </Link>
            <Link href="/guest-order">
              <button className="w-full sm:w-auto bg-transparent border border-white/70 text-white font-semibold px-5 py-2.5 rounded-lg hover:bg-white/10 transition-colors">
                অর্ডার ট্র্যাক করুন
              </button>
            </Link>
          </div>
        </div>
      </div>

      {/* Best Selling Products Header */}
      <div className="flex justify-between items-center my-4">
        <h2 className="text-base md:text-xl font-bold capitalize !mb-0 text-[#388072]">
          Best Selling Products
        </h2>
        <Link href="/all-medicines">
          <button className="bg-white dark:bg-gray-800 border-primary text-primary hover:text-white hover:bg-[#388072] px-2 md:px-6 py-0.5 md:py-2 rounded">
            View All <Icon icon="ant-design:arrow-right-outlined" className="inline align-middle" />
          </button>
        </Link>
      </div>

      {/* Products Grid */}
      <div className="mb-3">
        {!loading && allProduct.length <= 0 && (
          <div className="flex justify-center items-center">
            <p className="text-xl">No data Found!</p>
          </div>
        )}

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-5 gap-x-5 gap-y-4 capitalize lg:place-items-stretch">
          {/* Skeleton */}
          {loading && currentPage === 1 &&
            Array.from({ length: 14 }, (_, n) => (
              <div key={`skeleton-${n}`} className="bg-white dark:bg-gray-800 mb-6 border dark:border-gray-700 rounded-md overflow-hidden w-full max-w-[210px] animate-pulse">
                <div className="w-full h-[209.53px] bg-gray-200" />
                <div className="p-2 md:px-2 md:pb-2">
                  <div className="mb-1"><div className="h-5 w-20 bg-gray-200 rounded-lg" /></div>
                  <div className="h-[40px] space-y-1.5"><div className="h-3 w-full bg-gray-200 rounded" /><div className="h-3 w-3/4 bg-gray-200 rounded" /></div>
                  <div className="flex items-center mt-1"><div className="w-2 h-2 rounded-full bg-gray-200 mr-2" /><div className="h-3 w-16 bg-gray-200 rounded" /></div>
                  <div className="flex items-end justify-between mt-2"><div className="space-y-1"><div className="h-3 w-12 bg-gray-200 rounded" /><div className="h-4 w-16 bg-gray-300 rounded" /></div><div className="h-8 w-16 bg-gray-200 rounded" /></div>
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
              <Icon icon="mingcute:loading-line" className="h-10 w-10 animate-spin text-[#388072]" />
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
