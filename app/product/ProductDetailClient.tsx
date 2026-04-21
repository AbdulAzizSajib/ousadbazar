"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Dropdown } from "antd";
import { Icon } from "@iconify/react";
import { imgBasePharma, asset } from "@/lib/config";
import { useCartStore } from "@/stores/cartStore";
import { useProduct } from "@/lib/hooks/useProducts";
import type { Product } from "@/types";

interface ProductDetailClientProps {
  id: string;
}

export default function ProductDetailClient({ id }: ProductDetailClientProps) {
  const { data: productDetail, isLoading: loading } = useProduct(id);
  const getCart = useCartStore((s) => s.getCart);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [calculatedItems, setCalculatedItems] = useState<{ index: number; quantity: number }[]>([]);
  const [activeTab, setActiveTab] = useState<"description" | "details" | "faq">("description");
  const [zoomed, setZoomed] = useState(false);
  const [loadingItemId, setLoadingItemId] = useState<string | number | null>(null);
  const [quantity, setQuantity] = useState(0); // 0 = not added yet

  const stockQty = (item: Record<string, unknown> | null | undefined) =>
    parseFloat(String(item?.balanced_quantity || 0));

  const packQty = productDetail?.quantity || 1;
  const packPrice = Number(productDetail?.ecom_final_selling_price || productDetail?.selling_price || 0);
  const finalPrice = packPrice / Number(packQty);
  const perPieceSellingPrice = Number(productDetail?.selling_price || 0) / Number(packQty);
  const hasDiscount = false; // Will be calculated after loading
  const discountPct = 0; // Will be calculated after loading
  const totalPrice = (quantity * finalPrice).toFixed(2);

  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    const newQty = 1;
    setQuantity(newQty);
    setLoadingItemId(id);
    try {
      if (productDetail) {
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
        getCart(normalizedProduct, newQty, newQty);
      }
    } finally {
      setLoadingItemId(null);
    }
  };

  const handleIncrease = (e: React.MouseEvent) => {
    e.preventDefault();
    if (quantity >= stock) return;
    const newQty = quantity + 1;
    setQuantity(newQty);
    if (productDetail) {
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
      getCart(normalizedProduct, newQty, newQty);
    }
  };

  const handleDecrease = (e: React.MouseEvent) => {
    e.preventDefault();
    if (quantity <= 1) {
      setQuantity(0);
      return;
    }
    const newQty = quantity - 1;
    setQuantity(newQty);
    if (productDetail) {
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
      getCart(normalizedProduct, newQty, newQty);
    }
  };

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
    setQuantity(quantity);
    getCart(normalizedProduct, quantity, index);
    setDropdownOpen(false);
  };

  const productName = String(productDetail?.name || "");
  const productSize = String(productDetail?.packsize || productDetail?.category_name || "");

  useEffect(() => {
    if (!productDetail) return;
    const title = `Buy ${productName} ${productSize} Price in Bangladesh | OusadBazar`.slice(0, 60);
    document.title = title;

    const description = `Order ${productName} ${productSize} online in Bangladesh from OusadBazar at the best price. Enjoy fast delivery, 100% genuine products & easy online ordering across Aftab Nagar.`.slice(0, 160);
    let metaDesc = document.querySelector('meta[name="description"]');
    if (!metaDesc) {
      metaDesc = document.createElement("meta");
      metaDesc.setAttribute("name", "description");
      document.head.appendChild(metaDesc);
    }
    metaDesc.setAttribute("content", description);
  }, [productDetail, productName, productSize]);

  const faqItems = productDetail
    ? [
        {
          question: `What is the price of ${productName} in Bangladesh?`,
          answer: `The latest price of ${productName} in Bangladesh is available on OusadBazar. Prices may vary depending on offers.`,
        },
        {
          question: `Is ${productName} original?`,
          answer: `Yes, OusadBazar provides 100% authentic and genuine products.`,
        },
        {
          question: `How long does delivery take?`,
          answer: `Delivery usually takes 24–48 hours inside Aftab Nagar depending on location.`,
        },
        {
          question: `Can I return or replace the product?`,
          answer: `Yes, if the product is damaged, expired, or incorrect, you can request a return or replacement as per our return policy.`,
        },
        {
          question: `How can I order ${productName} online?`,
          answer: `You can order ${productName} directly from OusadBazar by adding it to your cart and completing the checkout process.`,
        },
      ]
    : [];

  const faqJsonLd = productDetail
    ? {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: faqItems.map((faq) => ({
          "@type": "Question",
          name: faq.question,
          acceptedAnswer: { "@type": "Answer", text: faq.answer },
        })),
      }
    : null;

  const productJsonLd = productDetail
    ? {
        "@context": "https://schema.org/",
        "@type": "Product",
        name: productName,
        image: [
          productDetail?.path
            ? `${imgBasePharma}/${productDetail.path}`
            : "https://ousadbazar.com/ousadbazar/images/default.jpg",
        ],
        description: `Order ${productName} ${productSize} online in Bangladesh from OusadBazar at the best price. Enjoy fast delivery, 100% genuine products & easy online ordering.`,
        sku: String(productDetail?.sku || productDetail?.id || ""),
        brand: {
          "@type": "Brand",
          name: String(productDetail?.company_name || "OusadBazar"),
        },
        offers: {
          "@type": "Offer",
          url: `https://ousadbazar.com/product/?id=${id}`,
          priceCurrency: "BDT",
          price: Number(productDetail?.selling_price || 0).toFixed(2),
          availability:
            stockQty(productDetail) > 0
              ? "https://schema.org/InStock"
              : "https://schema.org/OutOfStock",
          itemCondition: "https://schema.org/NewCondition",
        },
      }
    : null;

  if (loading || !productDetail) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-4 w-48 bg-gray-200 rounded mb-6" />
            <div className="grid md:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)] gap-8">
              <div className="aspect-square bg-gray-200 rounded-2xl" />
              <div className="space-y-4">
                <div className="h-8 w-3/4 bg-gray-200 rounded" />
                <div className="flex gap-2">
                  <div className="h-6 w-24 bg-gray-200 rounded-full" />
                  <div className="h-6 w-20 bg-gray-200 rounded-full" />
                </div>
                <div className="h-24 bg-gray-200 rounded-xl" />
                <div className="h-20 bg-gray-200 rounded-xl" />
                <div className="h-14 bg-gray-200 rounded-xl" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const stock = stockQty(productDetail);
  const imageSrc = productDetail?.path
    ? `${imgBasePharma}/${productDetail.path}`
    : asset("/images/default.jpg");

  const sellingPrice = Number(productDetail?.selling_price || 0);
  const tp = Number(productDetail?.tp || 0);
  const hasDiscountTp = tp > sellingPrice;
  const discountPctTp = hasDiscountTp ? Math.round(((tp - sellingPrice) / tp) * 100) : 0;

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
        {Number(item.index * sellingPrice * Number(productDetail?.quantity || 1)).toFixed(2)}
      </span>
    ),
    onClick: () => handleAddToCart(item.quantity, item.index),
  }));

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-3 md:px-6 py-4 md:py-6">
        {/* Breadcrumb */}
        <nav className="flex items-center flex-wrap gap-1.5 text-xs md:text-sm mb-4 md:mb-6" aria-label="Breadcrumb">
          <Link href="/" className="inline-flex items-center gap-1 text-gray-500 hover:text-[#012068] transition-colors">
            <Icon className="w-4 h-4" icon="mdi:home-outline" />
            <span>Home</span>
          </Link>
          <Icon icon="mdi:chevron-right" className="w-4 h-4 text-gray-300" />
          <Link href="/all-medicines" className="text-gray-500 hover:text-[#012068] transition-colors">
            All Medicines
          </Link>
          {productDetail?.category_name ? (
            <>
              <Icon icon="mdi:chevron-right" className="w-4 h-4 text-gray-300" />
              <span className="text-gray-500">{String(productDetail.category_name)}</span>
            </>
          ) : null}
          <Icon icon="mdi:chevron-right" className="w-4 h-4 text-gray-300" />
          <span className="text-gray-900 font-medium truncate max-w-[180px] md:max-w-none">
            {productName}
          </span>
        </nav>

        {/* Main Product Section */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-6">
          <div className="grid md:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
            {/* Image Section */}
            <div className="p-4 md:p-6 border-b md:border-b-0 md:border-r border-gray-100 bg-gradient-to-br from-gray-50 to-white">
              <div className="sticky top-4">
                <div
                  className="relative aspect-square rounded-xl overflow-hidden bg-white border border-gray-100 cursor-zoom-in group"
                  onClick={() => setZoomed(true)}
                >
                  <img
                    className="w-full h-full object-contain p-6 transition-transform duration-500 group-hover:scale-105"
                    src={imageSrc}
                    alt={productName}
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = asset("/images/default.jpg");
                    }}
                  />
                  <div className="absolute bottom-3 right-3 bg-white/90 backdrop-blur border border-gray-200 rounded-lg p-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Icon icon="mdi:magnify-plus-outline" className="w-4 h-4 text-gray-600" />
                  </div>
                  {hasDiscountTp && (
                    <span className="absolute top-3 left-3 z-10 bg-red-500 text-white text-xs font-bold px-2.5 py-1 rounded-md shadow-md">
                      -{discountPctTp}% OFF
                    </span>
                  )}
                  <span
                    className={`absolute top-3 right-3 z-10 text-[10px] font-semibold px-2 py-1 rounded-md shadow-sm ${
                      stock > 0
                        ? "bg-green-50 text-green-700 border border-green-200"
                        : "bg-red-50 text-red-700 border border-red-200"
                    }`}
                  >
                    {stock > 0 ? "● In Stock" : "● Out of Stock"}
                  </span>
                </div>

                {/* Trust badges */}
                <div className="grid grid-cols-3 gap-2 mt-4">
                  <div className="flex flex-col items-center gap-1 p-2 bg-white border border-gray-100 rounded-lg">
                    <Icon icon="mdi:shield-check-outline" className="w-5 h-5 text-[#012068]" />
                    <span className="text-[10px] text-center text-gray-600 font-medium">100% Genuine</span>
                  </div>
                  <div className="flex flex-col items-center gap-1 p-2 bg-white border border-gray-100 rounded-lg">
                    <Icon icon="mdi:truck-fast-outline" className="w-5 h-5 text-[#012068]" />
                    <span className="text-[10px] text-center text-gray-600 font-medium">Fast Delivery</span>
                  </div>
                  <div className="flex flex-col items-center gap-1 p-2 bg-white border border-gray-100 rounded-lg">
                    <Icon icon="mdi:cash-refund" className="w-5 h-5 text-[#012068]" />
                    <span className="text-[10px] text-center text-gray-600 font-medium">Easy Return</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Details Section */}
            <div className="p-5 md:p-8">
              {/* Category */}
              {productDetail?.category_name ? (
                <p className="text-xs font-semibold uppercase tracking-wider text-[#012068] mb-2">
                  {String(productDetail.category_name)}
                </p>
              ) : null}

              {/* Title */}
              <h1 className="text-xl md:text-2xl lg:text-3xl font-bold text-gray-900 leading-snug mb-3">
                {productName}
              </h1>

              {/* Generic + supplier pills */}
              <div className="flex flex-wrap items-center gap-2 mb-4">
                {productDetail?.generic_name ? (
                  <span className="inline-flex items-center gap-1.5 bg-[#012068]/10 text-[#012068] text-xs font-medium px-2.5 py-1 rounded-md">
                    <Icon icon="mdi:pill" className="w-3.5 h-3.5" />
                    {String(productDetail.generic_name)}
                  </span>
                ) : null}
                {productDetail?.company_name ? (
                  <span className="inline-flex items-center gap-1.5 bg-gray-100 text-gray-700 text-xs font-medium px-2.5 py-1 rounded-md">
                    <Icon icon="mdi:factory" className="w-3.5 h-3.5" />
                    {String(productDetail.company_name)}
                  </span>
                ) : null}
                {productDetail?.packsize ? (
                  <span className="inline-flex items-center gap-1.5 bg-gray-100 text-gray-700 text-xs font-medium px-2.5 py-1 rounded-md">
                    <Icon icon="mdi:package-variant-closed" className="w-3.5 h-3.5" />
                    {String(productDetail.packsize)}
                  </span>
                ) : null}
              </div>

              {/* Rating placeholder */}
              <div className="flex items-center gap-2 mb-5 pb-5 border-b border-gray-100">
                <div className="flex items-center gap-0.5 text-amber-400">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <Icon key={n} icon="mdi:star" className="w-4 h-4" />
                  ))}
                </div>
                <span className="text-xs text-gray-500">Trusted by 10k+ customers</span>
              </div>

              {/* Price */}
              <div className="mb-5">
                <p className="text-xs text-gray-500 mb-1">প্রতি ইউনিট মূল্য / Price per unit</p>
                <div className="flex items-baseline flex-wrap gap-3">
                  <span className="text-3xl md:text-4xl font-bold text-[#012068]">
                    ৳{sellingPrice.toFixed(2)}
                  </span>
                  {hasDiscountTp && (
                    <>
                      <span className="text-lg text-gray-400 line-through">৳{tp.toFixed(2)}</span>
                      <span className="bg-red-50 text-red-600 text-xs font-bold px-2 py-1 rounded-md border border-red-100">
                        Save {discountPctTp}%
                      </span>
                    </>
                  )}
                </div>
                <p className="text-[11px] text-gray-400 mt-1">Inclusive of all taxes</p>
              </div>

              {/* Meta Info cards */}
              <div className="grid grid-cols-2 gap-3 mb-6">
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                  <div
                    className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
                      stock > 0 ? "bg-green-100" : "bg-red-100"
                    }`}
                  >
                    <Icon
                      icon={stock > 0 ? "mdi:check-circle-outline" : "mdi:close-circle-outline"}
                      className={`w-5 h-5 ${stock > 0 ? "text-green-600" : "text-red-600"}`}
                    />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[11px] text-gray-500">Availability</p>
                    <p className="font-semibold text-gray-900 text-sm">
                      {stock}{" "}
                      <span className="text-xs font-normal text-gray-500">units</span>
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center shrink-0">
                    <Icon icon="mdi:truck-delivery-outline" className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[11px] text-gray-500">Delivery</p>
                    <p className="font-semibold text-gray-900 text-sm truncate">24–48 hrs</p>
                  </div>
                </div>
              </div>

              {/* CTA buttons */}
              <div className="flex gap-3 mb-5">
                {quantity === 0 ? (
                  // Add to cart button
                  <Dropdown
                    menu={{ items: menuItems }}
                    trigger={["click"]}
                    open={dropdownOpen}
                    onOpenChange={setDropdownOpen}
                  >
                    <button
                      className={`flex-1 bg-[#012068] hover:bg-[#012068]/80 py-3.5 text-white rounded-xl font-semibold transition-all duration-300 flex items-center justify-center gap-2 text-sm shadow-md shadow-[#012068]/20 active:scale-[0.98] ${
                        stock < 1 ? "opacity-50 cursor-not-allowed" : ""
                      }`}
                      disabled={stock < 1}
                      onClick={handleAdd}
                    >
                      {loadingItemId === id ? (
                        <Icon className="w-5 h-5 animate-spin" icon="mingcute:loading-line" />
                      ) : (
                        <>
                          <Icon icon="solar:cart-plus-bold" className="w-5 h-5" />
                          <span>Add To Cart</span>
                        </>
                      )}
                    </button>
                  </Dropdown>
                ) : (
                  // Counter + price
                  <div className="flex-1 flex flex-col gap-1">
                    {/* Total price */}
                    <div className="flex items-center justify-between px-1">
                      <span className="text-xs text-gray-500">Total</span>
                      <span className="font-mono text-lg font-medium text-[#012068] tabular-nums">
                        ৳{totalPrice}
                      </span>
                    </div>
                    {/* Counter */}
                    <div className="flex items-center justify-between rounded-xl border-2 border-[#012068] overflow-hidden">
                      <button
                        onClick={handleDecrease}
                        className="flex h-12 w-12 items-center justify-center text-[#012068] hover:bg-[#012068] hover:text-white transition-colors"
                      >
                        <Icon icon="tdesign:minus" className="w-4 h-4" />
                      </button>
                      <span className="flex-1 text-center text-lg font-medium text-gray-800">
                        {quantity}
                      </span>
                      <button
                        onClick={handleIncrease}
                        disabled={quantity >= stock}
                        className="flex h-12 w-12 items-center justify-center text-[#012068] hover:bg-[#012068] hover:text-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        <Icon icon="mingcute:add-line" className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}
                <button
                  className="w-12 h-12 bg-white border border-gray-200 hover:border-[#012068] hover:text-[#012068] rounded-xl transition-colors flex items-center justify-center text-gray-600"
                  aria-label="Add to wishlist"
                >
                  <Icon icon="mdi:heart-outline" className="w-5 h-5" />
                </button>
                <button
                  className="w-12 h-12 bg-white border border-gray-200 hover:border-[#012068] hover:text-[#012068] rounded-xl transition-colors flex items-center justify-center text-gray-600"
                  aria-label="Share"
                  onClick={() => {
                    if (navigator.share) {
                      navigator.share({ title: productName, url: window.location.href }).catch(() => {});
                    } else {
                      navigator.clipboard?.writeText(window.location.href);
                    }
                  }}
                >
                  <Icon icon="mdi:share-variant-outline" className="w-5 h-5" />
                </button>
              </div>

              {/* Benefits list */}
              <div className="bg-gradient-to-br from-[#012068]/5 to-emerald-50/50 border border-[#012068]/15 rounded-xl p-4 space-y-2.5">
                <div className="flex items-start gap-2.5">
                  <Icon icon="mdi:check-decagram" className="w-4 h-4 text-[#012068] shrink-0 mt-0.5" />
                  <span className="text-xs text-gray-700">
                    Authentic product sourced directly from manufacturer
                  </span>
                </div>
                <div className="flex items-start gap-2.5">
                  <Icon icon="mdi:check-decagram" className="w-4 h-4 text-[#012068] shrink-0 mt-0.5" />
                  <span className="text-xs text-gray-700">
                    Cash on delivery available across Aftab Nagar
                  </span>
                </div>
                <div className="flex items-start gap-2.5">
                  <Icon icon="mdi:check-decagram" className="w-4 h-4 text-[#012068] shrink-0 mt-0.5" />
                  <span className="text-xs text-gray-700">
                    Secure packaging & temperature-controlled storage
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs Section */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="flex border-b border-gray-100 overflow-x-auto">
            {[
              { key: "description", label: "Description", icon: "material-symbols-light:description-outline" },
              { key: "details", label: "Specifications", icon: "mdi:clipboard-list-outline" },
              { key: "faq", label: "FAQ", icon: "mdi:frequently-asked-questions" },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as typeof activeTab)}
                className={`flex items-center gap-2 px-5 md:px-6 py-4 text-sm font-medium whitespace-nowrap transition-colors border-b-2 ${
                  activeTab === tab.key
                    ? "text-[#012068] border-[#012068] bg-[#012068]/5"
                    : "text-gray-600 border-transparent hover:text-gray-900 hover:bg-gray-50"
                }`}
              >
                <Icon icon={tab.icon} className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>

          <div className="p-5 md:p-8">
            {activeTab === "description" && (
              <div className="prose max-w-none">
                <p className="text-gray-700 leading-relaxed text-sm">
                  <span className="font-semibold text-gray-900">{productName}</span>{" "}
                  {productDetail?.generic_name ? (
                    <>
                      contains <span className="font-medium">{String(productDetail.generic_name)}</span> as
                      its active ingredient.{" "}
                    </>
                  ) : null}
                  Order authentic {productName} online from OusadBazar at the best price in Bangladesh.
                  We ensure 100% genuine products with fast and reliable delivery across Aftab Nagar.
                </p>
                <p className="text-gray-700 leading-relaxed text-sm mt-3">
                  Always consult your physician before starting any medication. Store in a cool, dry place
                  away from direct sunlight and out of reach of children.
                </p>
              </div>
            )}

            {activeTab === "details" && (
              <div className="divide-y divide-gray-100">
                {[
                  { label: "Product Name", value: productName },
                  { label: "Generic Name", value: productDetail?.generic_name },
                  { label: "Category", value: productDetail?.category_name },
                  { label: "Manufacturer", value: productDetail?.company_name },
                  { label: "Pack Size", value: productDetail?.packsize },
                  { label: "Unit Price", value: `৳${sellingPrice.toFixed(2)}` },
                  { label: "SKU", value: productDetail?.sku || productDetail?.id },
                ]
                  .filter((row) => row.value)
                  .map((row, i) => (
                    <div
                      key={i}
                      className="grid grid-cols-[140px_1fr] md:grid-cols-[200px_1fr] gap-4 py-3 text-sm"
                    >
                      <span className="text-gray-500 font-medium">{row.label}</span>
                      <span className="text-gray-900">{String(row.value)}</span>
                    </div>
                  ))}
              </div>
            )}

            {activeTab === "faq" && (
              <div className="divide-y divide-gray-100">
                {faqItems.map((faq, i) => (
                  <details key={i} className="group py-1">
                    <summary className="flex items-center justify-between cursor-pointer py-3 hover:text-[#012068] transition-colors list-none">
                      <span className="font-medium text-gray-900 text-sm pr-4 group-hover:text-[#012068]">
                        {faq.question}
                      </span>
                      <Icon
                        icon="mdi:plus"
                        className="w-5 h-5 text-gray-400 shrink-0 transition-transform group-open:rotate-45 group-hover:text-[#012068]"
                      />
                    </summary>
                    <p className="pb-4 pt-1 text-sm text-gray-600 leading-relaxed">{faq.answer}</p>
                  </details>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Zoom Modal */}
      {zoomed && (
        <div
          className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
          onClick={() => setZoomed(false)}
        >
          <button
            className="absolute top-4 right-4 w-10 h-10 bg-white/10 hover:bg-white/20 backdrop-blur rounded-full flex items-center justify-center text-white"
            aria-label="Close"
          >
            <Icon icon="mdi:close" className="w-6 h-6" />
          </button>
          <img
            src={imageSrc}
            alt={productName}
            className="max-w-full max-h-[90vh] object-contain"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}

      {/* Product JSON-LD Structured Data */}
      {productJsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }}
        />
      )}

      {/* FAQ JSON-LD Structured Data */}
      {faqJsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
        />
      )}
    </div>
  );
}
