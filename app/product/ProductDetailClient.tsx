"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Icon } from "@iconify/react";
import { imgBasePharma, asset } from "@/lib/config";
import { useCartStore } from "@/stores/cartStore";
import { useProduct, useProductsByGeneric } from "@/lib/hooks/useProducts";
import { getUnitInfo } from "@/lib/unitUtils";
import ProductCard from "@/components/ProductCard";
import type { Product } from "@/types";

interface ProductDetailClientProps {
  id: string;
}

export default function ProductDetailClient({ id }: ProductDetailClientProps) {
  const { data: productDetail, isLoading: loading } = useProduct(id);
  const genericId = productDetail?.generic_id as string | number | undefined;
  const {
    data: alternativesData,
    isLoading: alternativesLoading,
    fetchNextPage: fetchMoreAlternatives,
    hasNextPage: hasMoreAlternatives,
    isFetchingNextPage: loadingMoreAlternatives,
  } = useProductsByGeneric(genericId);
  const alternatives: Product[] = (alternativesData?.pages ?? [])
    .flatMap((p) => (p?.data ?? []) as Product[])
    .filter((p) => String(p?.id) !== String(id));
  const alternativesTotal = alternativesData?.pages?.[0]?.total ?? 0;
  const getCart = useCartStore((s) => s.getCart);
  const [zoomed, setZoomed] = useState(false);
  const [loadingItemId, setLoadingItemId] = useState<string | number | null>(null);
  const [quantity, setQuantity] = useState(0); // 0 = not added yet

  const stockQty = (item: Record<string, unknown> | null | undefined) =>
    parseFloat(String(item?.balanced_quantity || 0));

  const buildNormalizedProduct = (): Product | null => {
    if (!productDetail) return null;
    return {
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
      packsize_quantity: Number(productDetail.quantity || 1),
      stripe_qty: productDetail?.stripe_qty,
      stock_batches: (productDetail.stock_batches as { balanced_quantity: number }[]) || [
        { balanced_quantity: Number(productDetail.balanced_quantity || 0) },
      ],
      product_images:
        (productDetail.product_images as { path: string }[]) ||
        (productDetail.path ? [{ path: productDetail.path as string }] : []),
    };
  };

  const unit = getUnitInfo(buildNormalizedProduct());
  const finalPrice = unit.unitPrice;
  const perUnitSellingPrice = unit.unitSellingPrice;
  const hasDiscount = perUnitSellingPrice > finalPrice;
  const discountPct = hasDiscount
    ? Math.round(((perUnitSellingPrice - finalPrice) / perUnitSellingPrice) * 100)
    : 0;
  const totalPrice = (quantity * finalPrice).toFixed(2);
  const stripLabel = String(productDetail?.category_name || unit.unitLabelPlural);
  const selectedPieces = quantity * unit.piecesPerUnit;
  const stripCountLabel = quantity > 1 ? "strips" : "strip";

  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    const newQty = 1;
    setQuantity(newQty);
    setLoadingItemId(id);
    try {
      const normalizedProduct = buildNormalizedProduct();
      if (normalizedProduct) {
        getCart(normalizedProduct, newQty, newQty * unit.piecesPerUnit);
      }
    } finally {
      setLoadingItemId(null);
    }
  };

  const handleIncrease = (e: React.MouseEvent) => {
    e.preventDefault();
    if (quantity >= unit.unitStock) return;
    const newQty = quantity + 1;
    setQuantity(newQty);
    const normalizedProduct = buildNormalizedProduct();
    if (normalizedProduct) {
      getCart(normalizedProduct, newQty, newQty * unit.piecesPerUnit);
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
    const normalizedProduct = buildNormalizedProduct();
    if (normalizedProduct) {
      getCart(normalizedProduct, newQty, newQty * unit.piecesPerUnit);
    }
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

  const stock = unit.unitStock;
  const imageSrc = productDetail?.path
    ? `${imgBasePharma}/${productDetail.path}`
    : asset("/images/default.jpg");

  const sellingPrice = finalPrice;

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
        <div className="relative bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden mb-6">

          <div className="relative grid md:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)] md:items-stretch ">
            {/* Image Section */}
            <div className="relative p-3 md:p-0 border-b md:border-b-0 md:border-r border-gray-100 flex">
              {/* Image container with gradient background */}
              <div
                className="relative w-full  overflow-hidden cursor-zoom-in group aspect-square md:aspect-auto md:min-h-[320px]"
                onClick={() => setZoomed(true)}
              >
                {/* Grid pattern */}
                <div
                  className="absolute inset-0 opacity-[0.35]"
                  style={{
                    backgroundImage:
                      "radial-gradient(circle, rgba(1,32,104,0.12) 1px, transparent 1px)",
                    backgroundSize: "22px 22px",
                  }}
                />

                <img
                  className="relative z-10 w-full h-full object-contain p-6 md:p-8 transition-transform duration-500 group-hover:scale-105"
                  src={imageSrc}
                  alt={productName}
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = asset("/images/default.jpg");
                  }}
                />
              </div>
            </div>

            {/* Details Section */}
            <div className="relative p-5 md:p-8">
              {/* Category + SKU row */}
              <div className="flex items-center justify-between mb-3">
                {productDetail?.category_name ? (
                  <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#012068] bg-[#012068]/10 px-2.5 py-1 rounded-full">
                    <Icon icon="mdi:medical-bag" className="w-3.5 h-3.5" />
                    {String(productDetail.category_name)}
                  </span>
                ) : <span />}
                {productDetail?.sku || productDetail?.id ? (
                  <span className="text-[10px] text-gray-400 font-mono">
                    SKU: {String(productDetail.sku || productDetail.id)}
                  </span>
                ) : null}
              </div>

              {/* Title */}
              <h1 className="text-xl md:text-2xl lg:text-3xl font-bold text-gray-900 leading-tight mb-3">
                {productName}
              </h1>

              {/* Generic + supplier pills */}
              <div className="flex flex-wrap items-center gap-2 mb-4">
                {productDetail?.generic_name ? (
                  <span className="inline-flex items-center gap-1.5 bg-gradient-to-r from-[#012068]/15 to-[#012068]/5 text-[#012068] text-xs font-semibold px-3 py-1.5 rounded-lg border border-[#012068]/15">
                    <Icon icon="mdi:pill" className="w-3.5 h-3.5" />
                    {String(productDetail.generic_name)}
                  </span>
                ) : null}
                {productDetail?.company_name ? (
                  <span className="inline-flex items-center gap-1.5 bg-gray-50 text-gray-700 text-xs font-medium px-3 py-1.5 rounded-lg border border-gray-200">
                    <Icon icon="mdi:factory" className="w-3.5 h-3.5" />
                    {String(productDetail.company_name)}
                  </span>
                ) : null}
                {productDetail?.packsize ? (
                  <span className="inline-flex items-center gap-1.5 bg-gray-50 text-gray-700 text-xs font-medium px-3 py-1.5 rounded-lg border border-gray-200">
                    <Icon icon="mdi:package-variant-closed" className="w-3.5 h-3.5" />
                    {String(productDetail.packsize)}
                  </span>
                ) : null}
              </div>


              {/* Price card */}
              <div className="relative bg-gradient-to-br from-[#012068]/[0.04] via-white to-emerald-50/40 border border-[#012068]/10 rounded-2xl p-4 md:p-5 mb-5 overflow-hidden">
                <div className="absolute -top-6 -right-6 w-24 h-24 bg-[#012068]/5 rounded-full blur-2xl" />
                <p className="relative text-[11px] font-semibold uppercase tracking-wider text-gray-500 mb-1">
                  প্রতি ইউনিট মূল্য / Price per strip
                </p>
                <div className="relative flex items-baseline flex-wrap gap-3">
                  <span className="text-3xl md:text-4xl font-extrabold text-[#012068] tracking-tight">
                    ৳{sellingPrice.toFixed(2)}
                  </span>
                  {hasDiscount && (
                    <>
                      <span className="text-lg text-gray-400 line-through">৳{perUnitSellingPrice.toFixed(2)}</span>
                      <span className="inline-flex items-center gap-1 bg-gradient-to-r from-red-500 to-rose-500 text-white text-[11px] font-bold px-2.5 py-1 rounded-md shadow-sm">
                        <Icon icon="mdi:trending-down" className="w-3.5 h-3.5" />
                        Save {discountPct}%
                      </span>
                    </>
                  )}
                </div>
                <div className="relative flex items-center gap-3 text-[11px] text-gray-500 mt-2">
                  <span className="inline-flex items-center gap-1">
                    <Icon icon="mdi:shield-check" className="w-3.5 h-3.5 text-emerald-500" />
                    Inclusive of all taxes
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <Icon icon="mdi:tag-outline" className="w-3.5 h-3.5 text-[#012068]" />
                    Best price guaranteed
                  </span>
                </div>
              </div>

              {/* Meta Info cards */}
              <div className="grid grid-cols-2 gap-3 mb-6">
                <div className="relative flex items-center gap-3 p-3 bg-gradient-to-br from-emerald-50 to-white rounded-xl border border-emerald-100 overflow-hidden">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-sm ${
                      stock > 0 ? "bg-emerald-500 text-white" : "bg-red-500 text-white"
                    }`}
                  >
                    <Icon
                      icon={stock > 0 ? "mdi:check-bold" : "mdi:close-thick"}
                      className="w-5 h-5"
                    />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] uppercase tracking-wider text-gray-500 font-semibold">Availability</p>
                    <p className="font-bold text-gray-900 text-sm">
                      {stock} <span className="text-xs font-medium text-gray-500">{unit.unitLabelPlural}</span>
                    </p>
                  </div>
                </div>
                <div className="relative flex items-center gap-3 p-3 bg-gradient-to-br from-blue-50 to-white rounded-xl border border-blue-100 overflow-hidden">
                  <div className="w-10 h-10 bg-blue-500 text-white rounded-xl flex items-center justify-center shrink-0 shadow-sm">
                    <Icon icon="mdi:truck-fast" className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] uppercase tracking-wider text-gray-500 font-semibold">Delivery</p>
                    <p className="font-bold text-gray-900 text-sm truncate">6–12 hrs</p>
                  </div>
                </div>
              </div>

              {/* CTA buttons */}
              <div className="flex gap-3 mb-5">
                {quantity === 0 ? (
                  <button
                    className={`flex-1 bg-gradient-to-r from-[#012068] to-[#012068]/85 hover:from-[#012068]/90 hover:to-[#012068] text-white py-3.5 rounded-xl font-semibold shadow-lg shadow-[#012068]/25 hover:shadow-xl hover:shadow-[#012068]/30 transition-all duration-300 flex items-center justify-center gap-2 text-sm active:scale-[0.98] ${
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
                        <Icon icon="mdi:arrow-right" className="w-4 h-4" />
                      </>
                    )}
                  </button>
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
                      <span className="flex-1 px-1 text-center text-sm font-medium leading-tight text-gray-800">
                        {unit.sellsByStrip
                          ? `${selectedPieces} ${stripLabel} (${quantity} ${stripCountLabel})`
                          : `${quantity} ${unit.unitLabelPlural}`}
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

        {/* Alternative Medicines Section */}
        {(alternativesLoading || alternatives.length > 0) && (
          <section className="mb-6">
            <div className="flex items-end justify-between mb-4 px-1">
              <div>
                <div className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wider text-[#012068] bg-[#012068]/10 px-2.5 py-1 rounded-full mb-2">
                  <Icon icon="mdi:pill-multiple" className="w-3.5 h-3.5" />
                  Same Generic Alternatives
                </div>
                <h2 className="text-lg md:text-2xl font-bold text-gray-900">
                  Alternative Medicines
                </h2>
                <p className="text-xs md:text-sm text-gray-500 mt-1">
                  {productDetail?.generic_name ? (
                    <>
                      Other brands containing{" "}
                      <span className="font-medium text-[#012068]">
                        {String(productDetail.generic_name)}
                      </span>{" "}
                      — compare and choose your best option.
                    </>
                  ) : (
                    "Same active ingredient, different brands — compare and choose your best option."
                  )}
                </p>
              </div>
              {/* {productDetail?.generic_name ? (
                <Link
                  href={`/all-medicines?generic_id=${genericId}`}
                  className="hidden md:inline-flex items-center gap-1 text-sm font-medium text-[#012068] hover:gap-2 transition-all"
                >
                  View all
                  <Icon icon="mdi:arrow-right" className="w-4 h-4" />
                </Link>
              ) : null}  */}
            </div>

            {alternativesLoading ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3 md:gap-4">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div
                    key={i}
                    className="animate-pulse rounded-xl border border-gray-100 bg-white overflow-hidden"
                  >
                    <div className="aspect-square bg-gray-200" />
                    <div className="p-3 space-y-2">
                      <div className="h-3 w-2/3 bg-gray-200 rounded" />
                      <div className="h-3 w-1/2 bg-gray-200 rounded" />
                      <div className="h-8 w-full bg-gray-200 rounded mt-2" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3 md:gap-4">
                  {alternatives.map((alt) => (
                    <ProductCard key={alt.id} item={alt} />
                  ))}
                </div>

                {hasMoreAlternatives && (
                  <div className="mt-5 flex flex-col items-center gap-1">
                    <button
                      onClick={() => fetchMoreAlternatives()}
                      disabled={loadingMoreAlternatives}
                      className="inline-flex items-center gap-2 rounded-xl border border-[#012068]/20 bg-white px-5 py-2.5 text-sm font-semibold text-[#012068] shadow-sm hover:border-[#012068] hover:bg-[#012068] hover:text-white transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      {loadingMoreAlternatives ? (
                        <>
                          <Icon
                            icon="mingcute:loading-line"
                            className="w-4 h-4 animate-spin"
                          />
                          Loading...
                        </>
                      ) : (
                        <>
                          <Icon icon="mdi:plus-circle-outline" className="w-4 h-4" />
                          See More
                          <Icon icon="mdi:chevron-down" className="w-4 h-4" />
                        </>
                      )}
                    </button>
                    {alternativesTotal > 0 && (
                      <p className="text-[11px] text-gray-400">
                        Showing {alternatives.length} of {alternativesTotal - 1}
                      </p>
                    )}
                  </div>
                )}
              </>
            )}
          </section>
        )}

        {/* Description Section */}
        <section className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-6">
          <div className="flex items-center gap-3 px-5 md:px-8 py-4 border-b border-gray-100 bg-gradient-to-r from-[#012068]/5 to-transparent">
            <div className="w-10 h-10 rounded-xl bg-[#012068] text-white flex items-center justify-center">
              <Icon icon="material-symbols-light:description-outline" className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base md:text-lg font-bold text-gray-900">Product Description</h2>
              <p className="text-xs text-gray-500">Everything you need to know about this medicine</p>
            </div>
          </div>
          <div className="p-5 md:p-8">
            <p className="text-gray-700 leading-relaxed text-sm">
              <span className="font-semibold text-gray-900">{productName}</span>{" "}
              {productDetail?.generic_name ? (
                <>
                  contains <span className="font-medium text-[#012068]">{String(productDetail.generic_name)}</span> as
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

            {/* Key highlights */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-5">
              {[
                { icon: "mdi:pill", title: "Active Ingredient", desc: String(productDetail?.generic_name || "—") },
                { icon: "mdi:factory", title: "Manufacturer", desc: String(productDetail?.company_name || "—") },
                { icon: "mdi:package-variant-closed", title: "Pack Size", desc: String(productDetail?.packsize || "—") },
              ].map((it, i) => (
                <div
                  key={i}
                  className="p-4 rounded-xl border border-gray-100 bg-gray-50/50 hover:bg-[#012068]/5 hover:border-[#012068]/20 transition-colors"
                >
                  <Icon icon={it.icon} className="w-5 h-5 text-[#012068] mb-2" />
                  <p className="text-[11px] uppercase tracking-wider text-gray-500 font-semibold">{it.title}</p>
                  <p className="text-sm font-medium text-gray-900 mt-0.5 line-clamp-1">{it.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Specification Section */}
        <section className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-6">
          <div className="flex items-center gap-3 px-5 md:px-8 py-4 border-b border-gray-100 bg-gradient-to-r from-[#012068]/5 to-transparent">
            <div className="w-10 h-10 rounded-xl bg-[#012068] text-white flex items-center justify-center">
              <Icon icon="mdi:clipboard-list-outline" className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base md:text-lg font-bold text-gray-900">Specifications</h2>
              <p className="text-xs text-gray-500">Detailed product information</p>
            </div>
          </div>
          <div className="p-5 md:p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8">
              {[
                { label: "Product Name", value: productName, icon: "mdi:tag-outline" },
                { label: "Generic Name", value: productDetail?.generic_name, icon: "mdi:pill" },
                { label: "Category", value: productDetail?.category_name, icon: "mdi:shape-outline" },
                { label: "Manufacturer", value: productDetail?.company_name, icon: "mdi:factory" },
                { label: "Pack Size", value: productDetail?.packsize, icon: "mdi:package-variant-closed" },
                { label: "Unit Price", value: `৳${sellingPrice.toFixed(2)}`, icon: "mdi:currency-bdt" },
                { label: "SKU", value: productDetail?.sku || productDetail?.id, icon: "mdi:barcode" },
                { label: "Availability", value: stock > 0 ? `${stock} in stock` : "Out of stock", icon: "mdi:check-circle-outline" },
              ]
                .filter((row) => row.value)
                .map((row, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-3 py-3 border-b border-gray-100 last:border-b-0"
                  >
                    <div className="w-9 h-9 shrink-0 rounded-lg bg-[#012068]/5 text-[#012068] flex items-center justify-center">
                      <Icon icon={row.icon} className="w-4 h-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-[11px] text-gray-500 font-medium">{row.label}</p>
                      <p className="text-sm font-semibold text-gray-900 truncate">{String(row.value)}</p>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-6">
          <div className="flex items-center gap-3 px-5 md:px-8 py-4 border-b border-gray-100 bg-gradient-to-r from-[#012068]/5 to-transparent">
            <div className="w-10 h-10 rounded-xl bg-[#012068] text-white flex items-center justify-center">
              <Icon icon="mdi:frequently-asked-questions" className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base md:text-lg font-bold text-gray-900">Frequently Asked Questions</h2>
              <p className="text-xs text-gray-500">Answers to common queries from our customers</p>
            </div>
          </div>
          <div className="p-5 md:p-8 space-y-2">
            {faqItems.map((faq, i) => (
              <details
                key={i}
                className="group rounded-xl border border-gray-100 hover:border-[#012068]/30 transition-colors open:border-[#012068]/30 open:bg-[#012068]/[0.02]"
              >
                <summary className="flex items-center justify-between cursor-pointer px-4 py-3.5 list-none">
                  <span className="flex items-start gap-3 pr-4">
                    <span className="w-7 h-7 shrink-0 rounded-full bg-[#012068]/10 text-[#012068] flex items-center justify-center text-[11px] font-bold">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span className="font-medium text-gray-900 text-sm group-hover:text-[#012068] transition-colors">
                      {faq.question}
                    </span>
                  </span>
                  <Icon
                    icon="mdi:plus"
                    className="w-5 h-5 text-gray-400 shrink-0 transition-transform group-open:rotate-45 group-open:text-[#012068]"
                  />
                </summary>
                <p className="px-4 pb-4 pl-14 text-sm text-gray-600 leading-relaxed">{faq.answer}</p>
              </details>
            ))}
          </div>
        </section>

        {/* CTA Help Section */}
        <section className="bg-gradient-to-br from-[#012068] to-[#012068]/80 rounded-2xl p-6 md:p-8 text-white flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-white/15 backdrop-blur flex items-center justify-center shrink-0">
              <Icon icon="mdi:headset" className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base md:text-lg font-bold">Need help with your order?</h3>
              <p className="text-xs md:text-sm text-white/80 mt-0.5">
                Our pharmacists are available 24/7 to answer your questions.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 w-full md:w-auto">
            <a
              href="tel:+8801700000000"
              className="flex-1 md:flex-none inline-flex items-center justify-center gap-2 bg-white text-[#012068] hover:bg-gray-100 font-semibold text-sm px-5 py-2.5 rounded-xl transition-colors"
            >
              <Icon icon="mdi:phone" className="w-4 h-4" />
              Call Us
            </a>
            <a
              href="https://wa.me/8801700000000"
              target="_blank"
              rel="noreferrer"
              className="flex-1 md:flex-none inline-flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-600 font-semibold text-sm px-5 py-2.5 rounded-xl transition-colors"
            >
              <Icon icon="mdi:whatsapp" className="w-4 h-4" />
              WhatsApp
            </a>
          </div>
        </section>
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
