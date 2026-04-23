'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Icon } from '@iconify/react';
import { useCartStore } from '@/stores/cartStore';
import { formatNumber, imgBasePharma, asset } from '@/lib/config';
import { getUnitInfo } from '@/lib/unitUtils';
import type { Product } from '@/types';
import Image from 'next/image';

interface ProductCardProps {
  item: Product;
}

export default function ProductCard({ item }: ProductCardProps) {
  const getCart = useCartStore((s) => s.getCart);
  const [loadingItemId, setLoadingItemId] = useState<string | number | null>(null);
  const [quantity, setQuantity] = useState(0); // 0 = not added yet

  const unit = getUnitInfo(item);
  const stock = unit.unitStock;
  const finalPrice = unit.unitPrice;
  const perUnitSellingPrice = unit.unitSellingPrice;
  const hasDiscount = perUnitSellingPrice > finalPrice;
  const discountPct = hasDiscount
    ? Math.round(((perUnitSellingPrice - finalPrice) / perUnitSellingPrice) * 100)
    : 0;
  const categoryName = item?.category?.name || item?.category_name || '';
  const stripLabel = item?.category_name || unit.unitLabelPlural;
  const totalPrice = (quantity * finalPrice).toFixed(2);
  const selectedPieces = quantity * unit.piecesPerUnit;
  const stripCountLabel = quantity > 1 ? 'strips' : 'strip';

  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    const newQty = 1;
    setQuantity(newQty);
    setLoadingItemId(item.id);
    try {
      getCart(item, newQty, newQty * unit.piecesPerUnit);
    } finally {
      setLoadingItemId(null);
    }
  };

  const handleIncrease = (e: React.MouseEvent) => {
    e.preventDefault();
    if (quantity >= stock) return;
    const newQty = quantity + 1;
    setQuantity(newQty);
    getCart(item, newQty, newQty * unit.piecesPerUnit);
  };

  const handleDecrease = (e: React.MouseEvent) => {
    e.preventDefault();
    if (quantity <= 1) {
      setQuantity(0);
      return;
    }
    const newQty = quantity - 1;
    setQuantity(newQty);
    getCart(item, newQty, newQty * unit.piecesPerUnit);
  };

  return (
    <div className="group relative flex h-full w-full max-w-[230px] flex-col overflow-hidden rounded-xl border border-gray-100 bg-white transition-all duration-300 hover:-translate-y-0.5 hover:border-gray-200 hover:shadow-sm dark:border-gray-700 dark:bg-gray-800 dark:hover:border-gray-600">
      {/* Image */}
      <Link href={`/product?id=${item?.id}`} className="block w-full">
        <div className="relative aspect-square w-full overflow-hidden bg-gray-50 dark:bg-gray-700">
          <Image
            width={220}
            height={220}
            loading="lazy"
            className="h-full w-full transition-transform duration-300 group-hover:scale-105"
            src={`${imgBasePharma}/${item?.path}`}
            alt={item?.name}
            onError={(e) => {
              (e.target as HTMLImageElement).src = asset('/images/default.jpg');
            }}
          />
          <span className="absolute left-2 top-2 rounded-full border border-gray-200 bg-[#F4F5F9] px-2.5 py-0.5 text-[10px] font-medium text-gray-600 backdrop-blur-sm dark:border-gray-600/60 dark:bg-gray-800/80 dark:text-gray-300">
            {categoryName}
          </span>
          {hasDiscount && (
            <span className="absolute right-2 top-2 rounded-full bg-red-500 px-2 py-0.5 text-[10px] font-semibold text-white">
              {discountPct}% off
            </span>
          )}
        </div>
      </Link>

      {/* Body */}
      <div className="flex flex-1 flex-col gap-2 px-3 pb-3 pt-2.5 border">
        <Link href={`/product?id=${item?.id}`} className="block">
          <h3
            className="line-clamp-2 min-h-[36px]  text-[13px] font-medium leading-snug text-gray-800 dark:text-gray-100"
            title={item?.name}
          >
            {item?.name} 
          </h3>
        

          <div className="mt-1.5 flex items-center gap-1.5">
            <span
              className={`h-1.5 w-1.5 flex-shrink-0 rounded-full ${stock > 0 ? 'bg-emerald-500' : 'bg-red-500'}`}
            />
            <span
              className={`text-[11px] ${stock > 0 ? 'text-gray-400 dark:text-gray-500' : 'text-red-500 dark:text-red-400'}`}
            >
              {stock > 0
                ? `In stock (${formatNumber(stock)} ${unit.unitLabelPlural})`
                : 'Out of stock'}
            </span>
          </div>

          
          {unit.sellsByStrip && (
            <div className="mt-0.5 text-sm  ">
              {/* 1 strip = {unit.piecesPerUnit} pcs */}
              {unit.piecesPerUnit} {stripLabel} (1 strip)
            </div>
          )}

          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="font-mono text-[15px] font-semibold tabular-nums tracking-tight text-gray-900 dark:text-gray-100">
              ৳ {finalPrice.toFixed(2)}
            </span>
          </div>
        </Link>

        {/* Add to cart / Counter */}
        <div className="mt-auto">
          {quantity === 0 ? (
            // Add to cart button
            <button
              disabled={stock < 1}
              onClick={handleAdd}
              className={`flex w-full items-center justify-center gap-1.5 rounded-lg py-1.5 text-[12px] font-medium tracking-wide transition-all duration-150
                ${
                  stock >= 1
                    ? 'border border-[#012068] text-[#012068] hover:bg-[#012068] hover:text-white active:scale-[0.98]'
                    : 'cursor-not-allowed bg-gray-100 text-gray-400 dark:bg-gray-700 dark:text-gray-500'
                }`}
            >
              {loadingItemId === item?.id ? (
                <Icon className="h-3.5 w-3.5 animate-spin" icon="mingcute:loading-line" />
              ) : stock >= 1 ? (
                <>
                  <Icon className="h-3.5 w-3.5" icon="mingcute:shopping-cart-1-line" />
                  Add to cart
                </>
              ) : (
                'Unavailable'
              )}
            </button>
          ) : (
            // Counter + price
            <div className="flex flex-col gap-1">
              {/* Total price */}
              <div className="flex items-center justify-between px-0.5">
                <span className="text-[11px] text-gray-400">Total</span>
                <span className="font-mono text-[13px] font-medium text-primary tabular-nums">
                  ৳{totalPrice}
                </span>
              </div>
              {/* Counter */}
              <div className="flex items-center justify-between rounded-lg border border-primary overflow-hidden">
                <button
                  onClick={handleDecrease}
                  className="flex h-8 w-8 items-center justify-center text-[#012068] hover:bg-[#012068] hover:text-white transition-colors"
                >
                  <Icon icon="tdesign:minus" className="h-3.5 w-3.5" />
                </button>
                <span className="flex-1 px-1 text-center text-[11px] font-medium leading-tight text-gray-800 dark:text-gray-100">
                  {selectedPieces} {stripLabel} <br className="block md:hidden" /> ({quantity} {stripCountLabel})
                </span>
                <button
                  onClick={handleIncrease}
                  disabled={quantity >= stock}
                  className="flex h-8 w-8 items-center justify-center text-[#012068] hover:bg-[#012068] hover:text-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <Icon icon="mingcute:add-line" className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
