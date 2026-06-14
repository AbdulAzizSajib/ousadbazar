"use client";

import { useState } from "react";
import Link from "next/link";
import { Icon } from "@iconify/react";
import { useOrderHistory } from "@/lib/hooks/useOrders";

export default function OrderHistoryPage() {
  const [phone, setPhone] = useState(() =>
    typeof window !== "undefined"
      ? localStorage.getItem("mobile")?.replace(/^88/, "") || ""
      : ""
  );
  const [submittedPhone, setSubmittedPhone] = useState(() =>
    typeof window !== "undefined"
      ? localStorage.getItem("mobile")?.replace(/^88/, "") || ""
      : ""
  );
  const [expanded, setExpanded] = useState<Record<string | number, boolean>>({});

  const {
    data: orders = [],
    isLoading,
    isError,
    refetch,
  } = useOrderHistory(submittedPhone, !!submittedPhone);

  const errorMsg = isError ? "Something went wrong. Please try again." : "";
  const searched = !!submittedPhone;

  const fetchHistory = () => {
    if (!phone.trim()) return;
    setSubmittedPhone(phone.trim());
  };

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });

  const toggleExpand = (id: string | number) =>
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));

  const totalSpent = orders.reduce((sum, o) => sum + Number(o.total || 0), 0);

  return (
    <section className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50 py-8 md:py-12 relative overflow-hidden">


      <div className="container mx-auto px-4 max-w-3xl relative">
        {/* Header */}
        <div className="text-center mb-8 md:mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-gradient-to-br from-[#012068] to-[#5360A7] mb-4 shadow-lg shadow-[#012068]/25 rotate-3 hover:rotate-0 transition-transform duration-300">
            <Icon
              icon="mdi:clipboard-text-clock-outline"
              className="w-9 h-9 md:w-10 md:h-10 text-white"
            />
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
            Order History
          </h1>
          <p className="text-sm md:text-base text-gray-500 max-w-md mx-auto">
            Enter your phone number to view all your past orders
          </p>
        </div>

        {/* Search form */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            fetchHistory();
          }}
          className="relative bg-white rounded-2xl shadow-lg shadow-gray-200/50 border border-gray-100 p-2 mb-6 md:mb-8 flex items-center gap-2"
        >
          <div className="relative flex-1">
            <Icon
              icon="mdi:phone-outline"
              className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none"
            />
            <input
              type="tel"
              className="w-full pl-11 pr-4 py-3 bg-transparent text-gray-900 focus:outline-none placeholder-gray-400 text-sm md:text-base"
              placeholder="e.g. 01XXXXXXXXX"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
            />
          </div>
          <button
            type="submit"
            disabled={isLoading || !phone.trim()}
            className="group bg-gradient-to-br from-[#012068] to-[#5360A7] hover:shadow-lg hover:shadow-[#012068]/30 text-white font-semibold px-5 md:px-6 py-3 rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 whitespace-nowrap active:scale-95"
          >
            {isLoading ? (
              <Icon icon="svg-spinners:ring-resize" className="w-5 h-5" />
            ) : (
              <Icon icon="mdi:magnify" className="w-5 h-5" />
            )}
            <span className="text-sm md:text-base">
              {isLoading ? "Loading..." : "Search"}
            </span>
          </button>
        </form>

        {/* Stats summary */}
        {!isLoading && orders.length > 0 && (
          <div className="grid grid-cols-2 gap-3 md:gap-4 mb-5 animate-fade-in">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 md:p-5 flex items-center gap-3">
              <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-gradient-to-br from-[#012068]/10 to-[#5360A7]/10 flex items-center justify-center flex-shrink-0">
                <Icon
                  icon="mdi:package-variant"
                  className="w-5 h-5 md:w-6 md:h-6 text-[#012068]"
                />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] md:text-xs text-gray-500 font-semibold uppercase tracking-wider">
                  Total Orders
                </p>
                <p className="text-lg md:text-2xl font-bold text-gray-900 tabular-nums">
                  {orders.length}
                </p>
              </div>
            </div>
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 md:p-5 flex items-center gap-3">
              <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-gradient-to-br from-[#13a89e]/10 to-[#012068]/10 flex items-center justify-center flex-shrink-0">
                <Icon
                  icon="mdi:cash-multiple"
                  className="w-5 h-5 md:w-6 md:h-6 text-[#13a89e]"
                />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] md:text-xs text-gray-500 font-semibold uppercase tracking-wider">
                  Total Spent
                </p>
                <p className="text-lg md:text-2xl font-bold text-gray-900 tabular-nums truncate">
                  ৳ {totalSpent.toFixed(2)}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Loading skeleton */}
        {isLoading && orders.length === 0 && (
          <div className="space-y-4 animate-pulse">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="bg-white rounded-2xl h-44 border border-gray-100"
              />
            ))}
          </div>
        )}

        {/* Empty state */}
        {searched && !isLoading && orders.length === 0 && !errorMsg && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 md:p-10 text-center animate-fade-in">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-gray-50 to-gray-100 mb-4">
              <Icon
                icon="mdi:package-variant-closed-remove"
                className="w-8 h-8 text-gray-400"
              />
            </div>
            <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-2">
              No Orders Found
            </h3>
            <p className="text-sm text-gray-500 mb-6 max-w-sm mx-auto">
              We couldn&apos;t find any orders for this phone number. Try a different
              one or start shopping now.
            </p>
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#012068] text-white text-sm font-semibold rounded-xl hover:bg-[#012068]/90 shadow-md shadow-[#012068]/20 active:scale-95 transition-all"
            >
              <Icon icon="mdi:shopping-outline" className="w-4 h-4" />
              Start Shopping
            </Link>
          </div>
        )}

        {/* Error state */}
        {errorMsg && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 md:p-10 text-center animate-fade-in">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-50 mb-4">
              <Icon
                icon="mdi:alert-circle-outline"
                className="w-8 h-8 text-red-500"
              />
            </div>
            <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-2">
              Something Went Wrong
            </h3>
            <p className="text-sm text-gray-500 mb-6 max-w-sm mx-auto">{errorMsg}</p>
            <button
              onClick={() => refetch()}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#012068] text-white text-sm font-semibold rounded-xl hover:bg-[#012068]/90 shadow-md shadow-[#012068]/20 active:scale-95 transition-all"
            >
              <Icon icon="mdi:refresh" className="w-4 h-4" />
              Try Again
            </button>
          </div>
        )}

        {/* Orders list */}
        {!isLoading && orders.length > 0 && (
          <div className="space-y-4 animate-fade-in">
            {orders.map((order) => {
              const isOpen = expanded[order.id] ?? false;
              const itemCount = order.products?.length ?? 0;
              return (
                <div
                  key={order.id}
                  className="bg-white rounded-2xl shadow-sm hover:shadow-md border border-gray-100 overflow-hidden transition-all duration-200"
                >
                  {/* Gradient header */}
                  <div className="relative bg-gradient-to-br from-[#012068] via-[#1a3585] to-[#5360A7] px-5 md:px-6 py-4 overflow-hidden">
                    <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/5 rounded-full blur-2xl" />
                    <div className="absolute bottom-0 left-0 w-24 h-24 bg-[#13a89e]/10 rounded-full blur-2xl" />
                    <div className="relative flex items-center justify-between flex-wrap gap-3">
                      <div>
                        <p className="text-white/60 text-[10px] font-semibold uppercase tracking-widest mb-0.5">
                          Order Code
                        </p>
                        <p className="text-white text-lg md:text-xl font-bold tracking-tight">
                          #{order.sale_code}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-white/60 text-[10px] font-semibold uppercase tracking-widest mb-0.5">
                          Order Date
                        </p>
                        <p className="text-white text-sm md:text-base font-semibold">
                          {formatDate(order.created_at || order.sale_date)}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Meta row */}
                  <button
                    type="button"
                    onClick={() => toggleExpand(order.id)}
                    className="w-full px-5 md:px-6 py-3 flex items-center justify-between gap-3 text-left hover:bg-gray-50/60 transition-colors"
                  >
                    <span className="inline-flex items-center gap-2 text-sm text-gray-600">
                      <Icon
                        icon="mdi:package-variant-closed"
                        className="w-4 h-4 text-[#012068]"
                      />
                      <span className="font-semibold text-gray-800">
                        {itemCount}
                      </span>
                      <span className="text-gray-500">
                        {itemCount === 1 ? "item" : "items"}
                      </span>
                    </span>
                    <span className="inline-flex items-center gap-1.5 text-xs md:text-sm font-semibold text-[#012068]">
                      {isOpen ? "Hide Details" : "View Details"}
                      <Icon
                        icon="mdi:chevron-down"
                        className={`w-4 h-4 transition-transform duration-200 ${
                          isOpen ? "rotate-180" : ""
                        }`}
                      />
                    </span>
                  </button>

                  {/* Products (collapsible) */}
                  {isOpen && (
                    <ul className="divide-y divide-gray-50 border-t border-gray-100">
                      {order.products?.map((product, i) => (
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
                                {product.name || product.product_name}
                              </p>
                              <p className="text-xs text-gray-500 mt-0.5">
                                Qty: {product.quantity} × ৳
                                {Number(product.price).toFixed(2)}
                              </p>
                            </div>
                          </div>
                          <p className="text-sm font-bold text-gray-900 whitespace-nowrap tabular-nums">
                            ৳ {Number(product.total).toFixed(2)}
                          </p>
                        </li>
                      ))}
                    </ul>
                  )}

                  {/* Footer */}
                  <div className="px-5 md:px-6 py-3.5 bg-gradient-to-r from-[#012068]/5 via-[#13a89e]/5 to-transparent flex items-center justify-between border-t border-gray-100">
                    <span className="text-sm font-bold text-gray-900">Total</span>
                    <div className="flex items-center gap-3">
                      <span className="text-lg md:text-xl font-bold text-[#012068] tabular-nums">
                        ৳ {Number(order.total).toFixed(2)}
                      </span>
                      <Link
                        href={`/order-tracking?sale_code=${order.sale_code}`}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white border border-gray-200 text-xs font-semibold text-[#012068] hover:bg-[#012068] hover:text-white hover:border-[#012068] active:scale-95 transition-all"
                      >
                        <Icon icon="mdi:crosshairs-gps" className="w-3.5 h-3.5" />
                        Track
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
