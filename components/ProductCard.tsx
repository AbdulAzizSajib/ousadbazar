"use client";

import { useState } from "react";
import Link from "next/link";
import { Dropdown } from "antd";
import { Icon } from "@iconify/react";
import { useCartStore } from "@/stores/cartStore";
import { formatNumber, imgBasePharma } from "@/lib/config";
import { stockQuantity } from "@/lib/stockUtils";
import type { Product } from "@/types";

interface ProductCardProps {
  item: Product;
}

export default function ProductCard({ item }: ProductCardProps) {
  const getCart = useCartStore((s) => s.getCart);
  const [loadingItemId, setLoadingItemId] = useState<string | number | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [noOfAvailablePack, setNoOfAvailablePack] = useState(0);

  const stock = stockQuantity(item);
  const packQty = item?.product_prices?.pack_quantity || 1;

  const calculateStockQuantity = () => {
    setNoOfAvailablePack(Math.floor(stock / packQty));
    setDropdownOpen(true);
  };

  const handleAddToCart = (quantity: number, singleQty: number) => {
    setLoadingItemId(item.id);
    try {
      getCart(item, quantity, singleQty);
      setDropdownOpen(false);
    } finally {
      setLoadingItemId(null);
    }
  };

  const menuItems = Array.from({ length: noOfAvailablePack }, (_, i) => ({
    key: i + 1,
    label: (
      <span className="text-xs">
        ({i + 1}{item?.product_prices?.ecom_pack_name?.name || " Pcs"})
        {" "}
        {item?.category?.name?.toLowerCase().includes("cap") || item?.category?.name?.toLowerCase().includes("tab")
          ? Number(packQty) * (i + 1)
          : Number(packQty)
        }
        {" "}{item?.category?.name}
        {" - ৳"}
        {Number((i + 1) * Number(item?.product_prices?.ecom_final_selling_price || 0) * Number(packQty)).toFixed(2)}
      </span>
    ),
    onClick: () => handleAddToCart((i + 1) * packQty, i + 1),
  }));

  return (
    <div className="group h-full w-full max-w-[210px] bg-white dark:bg-gray-800 mb-6 border dark:border-gray-700 rounded-md overflow-hidden transition-all duration-300 transform relative flex flex-col">
      {/* Discount Badge */}
      {item?.product_prices?.selling_price !== null &&
        item?.product_prices?.ecom_discount_percentage !== null &&
        item?.product_prices?.selling_price !== item?.product_prices?.ecom_discount_percentage && (
          <div className="absolute top-3 left-3 bg-gradient-to-r from-red-500 to-pink-500 text-white px-1.5 rounded-lg text-sm font-semibold z-10 uppercase">
            <p>{Number(item?.product_prices?.ecom_discount_percentage).toFixed(0)}% off</p>
          </div>
        )}

      <Link href={`/product/${item?.id}`} className="w-full block">
        <div className="relative bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800 flex items-center justify-center bg-white dark:bg-gray-800 aspect-square w-full overflow-hidden">
          <img
            width={209.53}
            height={209.53}
            loading="lazy"
            className="h-full w-full object-cover object-center"
            src={`${imgBasePharma}/${item?.path}`}
            alt={item?.name}
            onError={(e) => { (e.target as HTMLImageElement).src = "/ousadbazar/images/default.jpg"; }}
          />
        </div>
      </Link>

      <div className="flex flex-1 flex-col p-2 md:px-2 md:pb-2">
        <Link href={`/product/${item?.id}`} className="w-full block">
          <div className="mb-1 min-h-[28px]">
            <span className="inline-block bg-gradient-to-r from-blue-100 to-purple-100 text-blue-800 text-xs font-medium px-3 rounded-lg border border-blue-200" title={item?.category?.name}>
              {item?.category?.name}
            </span>
          </div>
          <h3 className="font-bold text-xs lg:text-sm text-gray-800 dark:text-gray-200 leading-tight transition-colors duration-300 min-h-[40px] line-clamp-2" title={item?.name}>
            {item?.name}
          </h3>
          <div className="flex items-center min-h-[24px]">
            <div className="flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full ${stock > 0 ? "bg-[#388072]" : "bg-red-600"}`} />
              {stock > 0 ? (
                <span className="md:text-sm text-[12px] font-medium dark:text-gray-200">
                  In Stock <span>({formatNumber(stock)})</span>
                </span>
              ) : (
                <span className="text-[12px] font-medium text-red-600 dark:text-gray-200">
                  Stock Out <span>({formatNumber(stock)})</span>
                </span>
              )}
            </div>
          </div>
        </Link>

        <div className="mt-auto flex items-end justify-between gap-2">
          <Link href={`/product/${item?.id}`} className="w-full block">
            <div className="flex min-h-[44px] flex-col justify-end">
              {item?.product_prices?.selling_price !== null &&
                item?.product_prices?.ecom_discount_percentage !== null &&
                item?.product_prices?.selling_price !== item?.product_prices?.ecom_discount_percentage && (
                  <span className="text-sm text-gray-400 line-through">
                    {Number(item?.product_prices?.selling_price).toFixed(2)} ৳
                  </span>
                )}
              <span className="text-base font-bold dark:text-gray-200">
                {Number(item?.product_prices?.ecom_final_selling_price).toFixed(2)} ৳
              </span>
            </div>
          </Link>

          <Dropdown
            menu={{ items: menuItems }}
            trigger={["click"]}
            open={dropdownOpen}
            onOpenChange={setDropdownOpen}
            placement="bottom"
            overlayClassName="my-dropdown"
          >
            <button
              className={`bg-[#388072] px-4 py-1.5 text-white w-full min-w-[76px] rounded uppercase flex items-center justify-center relative border-transparent transition-all duration-200 ${stock < packQty ? "opacity-50 cursor-not-allowed" : ""}`}
              disabled={stock < packQty}
              onClick={(e) => { e.preventDefault(); calculateStockQuantity(); }}
            >
              {loadingItemId === item?.id ? (
                <Icon className="animate-spin w-4 h-4" icon="mingcute:loading-line" />
              ) : (
                <span className="relative z-10 drop-shadow-sm tracking-wide md:text-xs font-light text-[12px]">Add</span>
              )}
            </button>
          </Dropdown>
        </div>
      </div>
    </div>
  );
}
