"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Dropdown } from "antd";
import { Icon } from "@iconify/react";
import axios from "axios";
import { apiBasePharma, imgBasePharma } from "@/lib/config";
import { useCartStore } from "@/stores/cartStore";
import type { Product } from "@/types";

interface ProductDetailClientProps {
  id: string;
}

export default function ProductDetailClient({ id }: ProductDetailClientProps) {
  const [productDetail, setProductDetail] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [calculatedItems, setCalculatedItems] = useState<{ index: number; quantity: number }[]>([]);
  const getCart = useCartStore((s) => s.getCart);

  const stockQty = (item: Record<string, unknown> | null) => parseFloat(String(item?.balanced_quantity || 0));

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      try {
        const res = await axios.get(`${apiBasePharma}/products/${id}`);
        const data = Array.isArray(res?.data) ? res.data[0] : res.data;
        setProductDetail(data);
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchProduct();
  }, [id]);

  const handleDropdownClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDropdownOpen(false);
    const items = [];
    const maxPacks = Math.floor(stockQty(productDetail) / (Number(productDetail?.quantity) || 1));
    for (let i = 1; i <= maxPacks; i++) {
      items.push({ index: i, quantity: i * (Number(productDetail?.quantity) || 1) });
    }
    setCalculatedItems(items);
    setDropdownOpen(true);
  };

  const handleAddToCart = (quantity: number, index: number) => {
    if (!productDetail) return;
    const normalizedProduct: Product = {
      ...productDetail,
      id: productDetail.id as number,
      name: productDetail.name as string,
      product_prices: {
        selling_price: Number(productDetail.selling_price || 0),
        ecom_final_selling_price: Number(
          productDetail.ecom_final_selling_price || productDetail.selling_price || 0
        ),
        ecom_discount_percentage: (productDetail.ecom_discount_percentage as number) || null,
        pack_quantity: Number(productDetail.quantity || 1),
      },
      stock_batches: (productDetail.stock_batches as { balanced_quantity: number }[]) || [
        { balanced_quantity: Number(productDetail.balanced_quantity || 0) },
      ],
      product_images:
        (productDetail.product_images as { path: string }[]) ||
        (productDetail.path ? [{ path: productDetail.path as string }] : []),
    };
    getCart(normalizedProduct, quantity, index);
    setDropdownOpen(false);
  };

  if (loading || !productDetail) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Icon icon="mingcute:loading-line" className="w-10 h-10 animate-spin text-[#388072]" />
      </div>
    );
  }

  const menuItems = calculatedItems.map((item) => ({
    key: item.index,
    label: (
      <span className="text-xs">
        ({item.index} {String(productDetail?.packsize || "")}){" "}
        {String(productDetail?.category_name || "")
          .toLowerCase()
          .includes("cap") ||
        String(productDetail?.category_name || "")
          .toLowerCase()
          .includes("tab")
          ? Number(productDetail?.quantity || 0) * item.index
          : Number(productDetail?.quantity || 0)}{" "}
        {String(productDetail?.category_name || "")} - ৳
        {Number(item.index * Number(productDetail?.selling_price || 0) * Number(productDetail?.quantity || 1)).toFixed(2)}
      </span>
    ),
    onClick: () => handleAddToCart(item.quantity, item.index),
  }));

  return (
    <div className="min-h-screen px-3 md:px-0">
      <nav className="flex items-center space-x-2 text-xs py-3">
        <Link href="/" className="flex items-center text-gray-500 hover:text-[#388072] transition-colors">
          <Icon className="w-4 h-4 mr-1" icon="mdi:home" /> Home
        </Link>
        <Icon icon="mdi:chevron-right" className="w-4 h-4 text-gray-400" />
        <span className="text-gray-800 font-medium truncate">{String(productDetail?.name || "")}</span>
      </nav>

      <div className="md:flex gap-8 mb-8">
        <div className="md:w-[40%] mb-6 md:mb-0">
          <div className="bg-white border border-gray-200 rounded-2xl p-4 sticky top-4">
            <div className="relative overflow-hidden rounded-xl">
              <img
                className="w-full h-auto object-contain"
                src={productDetail?.path ? `${imgBasePharma}/${productDetail.path}` : "/ousadbazar/images/default.jpg"}
                alt={String(productDetail?.name || "")}
                onError={(e) => {
                  (e.target as HTMLImageElement).src = "/ousadbazar/images/default.jpg";
                }}
              />
            </div>
          </div>
        </div>

        <div className="md:w-[60%]">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 leading-tight mb-2">
            {String(productDetail?.name || "")}
          </h1>
          <div className="flex flex-wrap items-center gap-2 mb-5">
            {productDetail?.generic_name ? (
              <span className="inline-flex items-center gap-1.5 bg-[#388072]/10 text-[#388072] text-sm font-medium px-3 py-1 rounded-full">
                <Icon icon="mdi:pill" className="w-4 h-4" /> {String(productDetail.generic_name)}
              </span>
            ) : null}
            {productDetail?.category_name ? (
              <span className="inline-flex items-center gap-1.5 bg-gray-100 text-gray-700 text-sm font-medium px-3 py-1 rounded-full">
                <Icon icon="mdi:tag-outline" className="w-4 h-4" /> {String(productDetail.category_name)}
              </span>
            ) : null}
          </div>

          <div className="bg-gradient-to-r from-[#388072]/5 to-emerald-50 border border-[#388072]/20 rounded-xl p-2 mb-5">
            <p className="text-sm text-gray-500 mb-1">প্রতি ইউনিট মূল্য</p>
            <div className="flex items-baseline gap-3">
              <span className="text-3xl font-bold text-[#388072]">৳{Number(productDetail?.selling_price || 0).toFixed(2)}</span>
              {Number(productDetail?.tp || 0) > Number(productDetail?.selling_price || 0) && (
                <span className="bg-red-100 text-red-600 text-xs font-bold px-2 py-0.5 rounded-full">
                  {Math.round(
                    ((Number(productDetail?.tp) - Number(productDetail?.selling_price)) /
                      Number(productDetail?.tp)) *
                      100
                  )}
                  % ছাড়
                </span>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 mb-5">
            <div className="flex items-center gap-3 p-3 bg-white border border-gray-200 rounded-xl">
              <div
                className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                  stockQty(productDetail) > 0 ? "bg-green-100" : "bg-red-100"
                }`}
              >
                <Icon
                  icon={stockQty(productDetail) > 0 ? "mdi:check-circle" : "mdi:close-circle"}
                  className={`w-5 h-5 ${stockQty(productDetail) > 0 ? "text-green-600" : "text-red-600"}`}
                />
              </div>
              <div>
                <p className="text-xs text-gray-500">স্টক</p>
                <p className="font-bold text-gray-900">
                  {stockQty(productDetail)} <span className="text-xs font-normal text-gray-500">পিস</span>
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-white border border-gray-200 rounded-xl">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Icon icon="mdi:factory" className="w-5 h-5 text-blue-600" />
              </div>
              <div className="min-w-0">
                <p className="text-xs text-gray-500">সরবরাহকারী</p>
                <p className="font-bold text-gray-900 text-sm truncate">{String(productDetail?.company_name || "-")}</p>
              </div>
            </div>
          </div>

          <div className="mb-6">
            <Dropdown
              menu={{ items: menuItems }}
              trigger={["click"]}
              open={dropdownOpen}
              onOpenChange={setDropdownOpen}
            >
              <button
                className={`bg-[#388072] hover:bg-[#2d6a5a] py-4 text-white w-full rounded-xl font-bold uppercase transition-all duration-300 flex items-center justify-center gap-2 text-base shadow-lg shadow-[#388072]/20 active:scale-[0.98] ${
                  stockQty(productDetail) <= 0 ? "opacity-50 cursor-not-allowed" : ""
                }`}
                disabled={stockQty(productDetail) <= 0}
                onClick={handleDropdownClick}
              >
                <Icon icon="solar:cart-plus-bold" className="w-6 h-6" /> <span>Add To Cart</span>
              </button>
            </Dropdown>
          </div>

          <div className="border border-gray-200 rounded-xl overflow-hidden">
            <div className="flex items-center gap-2 px-5 py-3 bg-gray-50 border-b border-gray-200">
              <Icon icon="material-symbols-light:description-outline" className="w-5 h-5 text-[#388072]" />
              <h2 className="text-base font-bold text-gray-900">পণ্যের বিবরণ</h2>
            </div>
            <div className="p-5 space-y-3">
              <p className="text-gray-700">{String(productDetail?.name || "")}</p>
              {productDetail?.generic_name ? (
                <div className="flex items-start gap-2">
                  <span className="font-semibold text-gray-900 whitespace-nowrap">জেনেরিক:</span>
                  <span className="text-gray-700">{String(productDetail.generic_name)}</span>
                </div>
              ) : null}
              {productDetail?.company_name ? (
                <div className="flex items-start gap-2">
                  <span className="font-semibold text-gray-900 whitespace-nowrap">সরবরাহকারী:</span>
                  <span className="text-gray-700">{String(productDetail.company_name)}</span>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
