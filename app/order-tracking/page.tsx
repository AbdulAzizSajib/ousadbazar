"use client";

import { Suspense, useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Icon } from "@iconify/react";
import axios from "axios";
import { apiBasePharma } from "@/lib/config";
import type { Order } from "@/types";

export default function OrderTrackingPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50">
          <div className="flex items-center gap-3 text-gray-500">
            <Icon icon="svg-spinners:ring-resize" className="w-6 h-6 text-[#012068]" />
            <span className="text-sm font-medium">Loading...</span>
          </div>
        </div>
      }
    >
      <OrderTrackingContent />
    </Suspense>
  );
}

function OrderTrackingContent() {
  const searchParams = useSearchParams();
  const [saleCode, setSaleCode] = useState(searchParams.get("sale_code") || "");
  const [orderStatus, setOrderStatus] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const steps = [
    { label: "Order Placed", icon: "mdi:receipt-text-outline" },
    { label: "Store Arrived", icon: "mdi:storefront-outline" },
    { label: "On The Way", icon: "mdi:truck-fast-outline" },
    { label: "Delivered", icon: "mdi:home-check-outline" },
  ];

  const trackOrder = async () => {
    if (!saleCode.trim()) return;
    try {
      setErrorMsg("");
      setIsLoading(true);
      const res = await axios.get(
        `${apiBasePharma}/order/order-tracking?sale_code=${saleCode.trim()}`
      );
      if (res.data?.status === "error") {
        setOrderStatus(null);
        setErrorMsg(res.data?.message || "Order not found.");
      } else {
        setOrderStatus(res.data);
      }
    } catch {
      setOrderStatus(null);
      setErrorMsg("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });

  const getStatusText = (status: number | null) =>
    (
      {
        null: "Processing",
        1: "Store Arrived",
        2: "On The Way",
        3: "Delivered",
        4: "Not Reachable",
        5: "Not Received",
      } as Record<string, string>
    )[String(status)] || "Processing";

  const getStatusBadgeClass = (status: number | null) =>
    (
      {
        null: "bg-blue-50 text-blue-700 ring-blue-200",
        1: "bg-amber-50 text-amber-700 ring-amber-200",
        2: "bg-orange-50 text-orange-700 ring-orange-200",
        3: "bg-emerald-50 text-emerald-700 ring-emerald-200",
        4: "bg-red-50 text-red-700 ring-red-200",
        5: "bg-red-50 text-red-700 ring-red-200",
      } as Record<string, string>
    )[String(status)] || "bg-blue-50 text-blue-700 ring-blue-200";

  const getStatusIcon = (status: number | null) =>
    (
      {
        null: "mdi:clock-outline",
        1: "mdi:storefront-outline",
        2: "mdi:truck-fast-outline",
        3: "mdi:check-circle",
        4: "mdi:phone-off-outline",
        5: "mdi:alert-circle-outline",
      } as Record<string, string>
    )[String(status)] || "mdi:clock-outline";

  const getCurrentStep = () =>
    ({ null: 0, 1: 1, 2: 2, 3: 3, 4: 2, 5: 2 } as Record<string, number>)[
      String(orderStatus?.delivery_status)
    ] ?? 0;

  useEffect(() => {
    if (saleCode) trackOrder();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const currentStep = getCurrentStep();

  return (
    <section className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50 py-8 md:py-12 relative overflow-hidden">
    

      <div className="container mx-auto px-4 max-w-3xl relative">
        {/* Header */}
        <div className="text-center mb-8 md:mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-gradient-to-br from-[#012068] to-[#5360A7] mb-4 shadow-lg shadow-[#012068]/25 rotate-3 hover:rotate-0 transition-transform duration-300">
            <Icon
              icon="mdi:package-variant-closed"
              className="w-9 h-9 md:w-10 md:h-10 text-white"
            />
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
            Track Your Order
          </h1>
          <p className="text-sm md:text-base text-gray-500 max-w-md mx-auto">
            Enter your order code below to see real-time delivery updates
          </p>
        </div>

        {/* Search form */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            trackOrder();
          }}
          className="relative bg-white rounded-2xl shadow-lg shadow-gray-200/50 border border-gray-100 p-2 mb-6 md:mb-8 flex items-center gap-2"
        >
          <div className="relative flex-1">
            <Icon
              icon="mdi:magnify"
              className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none"
            />
            <input
              type="text"
              className="w-full pl-11 pr-4 py-3 bg-transparent text-gray-900 focus:outline-none placeholder-gray-400 text-sm md:text-base"
              placeholder="e.g. 2602224134"
              value={saleCode}
              onChange={(e) => setSaleCode(e.target.value)}
              required
            />
          </div>
          <button
            type="submit"
            disabled={isLoading || !saleCode.trim()}
            className="group bg-gradient-to-br from-[#012068] to-[#5360A7] hover:shadow-lg hover:shadow-[#012068]/30 text-white font-semibold px-5 md:px-6 py-3 rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 whitespace-nowrap active:scale-95"
          >
            {isLoading ? (
              <Icon icon="svg-spinners:ring-resize" className="w-5 h-5" />
            ) : (
              <Icon
                icon="mdi:crosshairs-gps"
                className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300"
              />
            )}
            <span className="text-sm md:text-base">
              {isLoading ? "Tracking..." : "Track"}
            </span>
          </button>
        </form>

        {/* Loading skeleton */}
        {isLoading && !orderStatus && (
          <div className="space-y-5 animate-pulse">
            <div className="bg-white rounded-2xl h-32 border border-gray-100" />
            <div className="bg-white rounded-2xl h-40 border border-gray-100" />
            <div className="bg-white rounded-2xl h-48 border border-gray-100" />
          </div>
        )}

        {/* Error state */}
        {errorMsg && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 md:p-10 text-center animate-fade-in">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-50 mb-4">
              <Icon
                icon="mdi:package-variant-remove"
                className="w-8 h-8 text-red-500"
              />
            </div>
            <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-2">
              Order Not Found
            </h3>
            <p className="text-sm text-gray-500 mb-6 max-w-sm mx-auto">
              {errorMsg}
            </p>
            <button
              onClick={() => {
                setSaleCode("");
                setErrorMsg("");
              }}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#012068] text-white text-sm font-semibold rounded-xl hover:bg-[#012068]/90 shadow-md shadow-[#012068]/20 active:scale-95 transition-all"
            >
              <Icon icon="mdi:refresh" className="w-4 h-4" />
              Try Again
            </button>
          </div>
        )}

        {/* Order details */}
        {!isLoading && orderStatus && (
          <div className="space-y-5 animate-fade-in">
            {/* Order Summary Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="relative bg-gradient-to-br from-[#012068] via-[#1a3585] to-[#5360A7] px-5 md:px-6 py-5 overflow-hidden">
                <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/5 rounded-full blur-2xl" />
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-[#13a89e]/10 rounded-full blur-2xl" />
                <div className="relative flex items-center justify-between flex-wrap gap-4">
                  <div>
                    <p className="text-white/60 text-[10px] md:text-xs font-semibold uppercase tracking-widest mb-1">
                      Order Code
                    </p>
                    <p className="text-white text-xl md:text-2xl font-bold tracking-tight">
                      #{orderStatus.sale_code}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-white/60 text-[10px] md:text-xs font-semibold uppercase tracking-widest mb-1">
                      Order Date
                    </p>
                    <p className="text-white text-sm md:text-base font-semibold">
                      {formatDate(orderStatus.sale_date)}
                    </p>
                  </div>
                </div>
              </div>

              <div className="divide-y divide-gray-100">
                <div className="px-5 md:px-6 py-4 flex items-center justify-between">
                  <span className="flex items-center gap-2 text-sm text-gray-500">
                    <Icon icon="mdi:information-outline" className="w-4 h-4" />
                    Current Status
                  </span>
                  <span
                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ring-1 ring-inset ${getStatusBadgeClass(
                      orderStatus.delivery_status
                    )}`}
                  >
                    <Icon
                      icon={getStatusIcon(orderStatus.delivery_status)}
                      className="w-3.5 h-3.5"
                    />
                    {getStatusText(orderStatus.delivery_status)}
                  </span>
                </div>
                <div className="px-5 md:px-6 py-4 flex items-center justify-between">
                  <span className="flex items-center gap-2 text-sm text-gray-500">
                    <Icon icon="mdi:credit-card-outline" className="w-4 h-4" />
                    Payment
                  </span>
                  <span className="text-sm font-semibold text-gray-800">
                    {orderStatus.payment_method?.name}
                  </span>
                </div>
                <div className="px-5 md:px-6 py-4 flex items-center justify-between bg-gradient-to-r from-[#012068]/5 to-transparent">
                  <span className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                    <Icon icon="mdi:cash-multiple" className="w-4 h-4" />
                    Total Amount
                  </span>
                  <span className="text-lg md:text-xl font-bold text-[#012068] tabular-nums">
                    ৳ {Number(orderStatus.total).toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

            {/* Progress Timeline */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 md:p-6">
              <div className="flex items-center gap-2 mb-6">
                <span className="block w-1 h-5 rounded-full bg-gradient-to-b from-[#5360A7] to-[#012068]" />
                <h3 className="text-sm md:text-base font-bold text-gray-900">
                  Delivery Progress
                </h3>
              </div>

              <div className="relative">
                {/* Background track */}
                <div className="absolute top-5 md:top-6 left-0 right-0 h-1 bg-gray-100 rounded-full mx-6" />
                {/* Progress fill */}
                <div
                  className="absolute top-5 md:top-6 left-0 h-1 bg-gradient-to-r from-[#012068] to-[#13a89e] rounded-full transition-all duration-700 ease-out mx-6"
                  style={{
                    width:
                      currentStep === 0
                        ? "0%"
                        : `calc(${(currentStep / (steps.length - 1)) * 100}% - ${
                            (currentStep / (steps.length - 1)) * 48
                          }px)`,
                  }}
                />

                <div className="relative flex items-start justify-between">
                  {steps.map((step, index) => {
                    const isDone = index < currentStep;
                    const isActive = index === currentStep;
                    const isReached = index <= currentStep;
                    return (
                      <div
                        key={index}
                        className="flex flex-col items-center flex-1 min-w-0"
                      >
                        <div
                          className={`relative w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center transition-all duration-300 ${
                            isReached
                              ? "bg-gradient-to-br from-[#012068] to-[#5360A7] text-white shadow-lg shadow-[#012068]/30"
                              : "bg-white text-gray-400 ring-2 ring-gray-200"
                          }`}
                        >
                          {isActive && (
                            <span className="absolute inset-0 rounded-full bg-[#012068]/30 animate-ping" />
                          )}
                          {isDone ? (
                            <Icon icon="mdi:check-bold" className="w-5 h-5" />
                          ) : (
                            <Icon
                              icon={step.icon}
                              className="w-4 h-4 md:w-5 md:h-5"
                            />
                          )}
                        </div>
                        <p
                          className={`mt-2 text-[10px] md:text-xs font-semibold text-center leading-tight px-1 ${
                            isReached ? "text-[#012068]" : "text-gray-400"
                          }`}
                        >
                          {step.label}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Products */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="px-5 md:px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="block w-1 h-5 rounded-full bg-gradient-to-b from-[#5360A7] to-[#012068]" />
                  <h3 className="text-sm md:text-base font-bold text-gray-900">
                    Ordered Items
                  </h3>
                </div>
                <span className="inline-flex items-center justify-center min-w-[24px] h-6 px-2 rounded-full bg-[#012068]/10 text-[#012068] text-xs font-bold">
                  {orderStatus.sale_products?.length}
                </span>
              </div>
              <ul className="divide-y divide-gray-50">
                {orderStatus.sale_products?.map((product, i) => (
                  <li
                    key={i}
                    className="px-5 md:px-6 py-3.5 flex items-center justify-between gap-3 hover:bg-gray-50/50 transition-colors"
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center ring-1 ring-gray-100">
                        <Icon
                          icon="mdi:pill"
                          className="w-5 h-5 text-[#012068]/60"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-900 truncate">
                          {product.product_name}
                        </p>
                        <p className="text-xs text-gray-500 mt-0.5">
                          Qty: {product.total_quantity} · ৳
                          {Number(product.ecom_final_selling_price || 0).toFixed(2)}
                          /unit
                        </p>
                      </div>
                    </div>
                    <p className="text-sm font-bold text-gray-900 whitespace-nowrap tabular-nums">
                      ৳ {Number(product.total).toFixed(2)}
                    </p>
                  </li>
                ))}
              </ul>
              <div className="px-5 md:px-6 py-4 bg-gradient-to-r from-[#012068]/5 via-[#13a89e]/5 to-transparent flex items-center justify-between border-t border-gray-100">
                <span className="text-sm font-bold text-gray-900">Total</span>
                <span className="text-lg md:text-xl font-bold text-[#012068] tabular-nums">
                  ৳ {Number(orderStatus.total).toFixed(2)}
                </span>
              </div>
            </div>

            {/* Shipping address */}
            {orderStatus.billing_address && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 md:p-6">
                <div className="flex items-center gap-2 mb-4">
                  <span className="block w-1 h-5 rounded-full bg-gradient-to-b from-[#5360A7] to-[#012068]" />
                  <h3 className="text-sm md:text-base font-bold text-gray-900">
                    Shipping Address
                  </h3>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#012068]/10 to-[#13a89e]/10 flex items-center justify-center flex-shrink-0">
                    <Icon
                      icon="mdi:map-marker-outline"
                      className="w-5 h-5 text-[#012068]"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm md:text-base font-semibold text-gray-900">
                      {orderStatus.billing_address.full_name}
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                      {orderStatus.billing_address.address}
                    </p>
                    <p className="inline-flex items-center gap-1.5 text-sm text-gray-600 mt-1.5">
                      <Icon icon="mdi:phone" className="w-3.5 h-3.5" />
                      {orderStatus.billing_address.mobile}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
