"use client";

import { useState } from "react";
import Link from "next/link";
import { Icon } from "@iconify/react";
import { Popconfirm } from "antd";
import { useOrderHistory, useCancelOrder } from "@/lib/hooks/useOrders";

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

  const totalSpent = orders.reduce((sum, o) => sum + Number(o.total || 0), 0);
  const { mutate: cancelOrder } = useCancelOrder();

  return (
    <section className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50 py-8 md:py-12 relative overflow-hidden">


      <div className="container mx-auto px-4  relative">
        {/* Header */}
        <div className="text-center mb-8 md:mb-10">
         
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
            Order History
          </h1>
         
        </div>

        {/* Search form */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            fetchHistory();
          }}
          className="relative hidden bg-white rounded-2xl shadow-lg shadow-gray-200/50 border border-gray-100 p-2 mb-6 md:mb-8 flex items-center gap-2"
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
              const items = order.sale_products ?? order.products ?? [];
              const itemCount = items.length;
              return (
                <div
                  key={order.id}
                  className="group bg-white rounded-2xl shadow-sm hover:shadow-lg hover:shadow-gray-200/60 border border-gray-100 overflow-hidden transition-all duration-300"
                >
                  {/* Top row: order id + status */}
                  <div className="flex items-start justify-between gap-3 px-5 md:px-6 pt-5 pb-4">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#012068] to-[#5360A7] flex items-center justify-center flex-shrink-0 shadow-md shadow-[#012068]/20">
                        <Icon icon="mdi:package-variant-closed" className="w-5 h-5 text-white" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400">
                          Order #{order.id}
                        </p>
                        <p className="text-sm font-semibold text-gray-900 flex items-center gap-1.5">
                          <Icon icon="mdi:calendar-blank-outline" className="w-3.5 h-3.5 text-gray-400" />
                          {formatDate(order.created_at || order.sale_date)}
                          <span className="text-gray-300">·</span>
                          <span className="text-gray-500 font-medium">
                            {itemCount} {itemCount === 1 ? "item" : "items"}
                          </span>
                        </p>
                      </div>
                    </div>
                    {order.suspend_request ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold ring-1 ring-inset bg-red-50 text-red-700 ring-red-200 flex-shrink-0">
                        <Icon icon="mdi:close-circle-outline" className="w-3 h-3" />
                        Cancelled
                      </span>
                    ) : (
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold ring-1 ring-inset flex-shrink-0 ${getStatusBadgeClass(
                          order.delivery_status
                        )}`}
                      >
                        <Icon icon={getStatusIcon(order.delivery_status)} className="w-3 h-3" />
                        {getStatusText(order.delivery_status)}
                      </span>
                    )}
                  </div>

                  {/* Shipping address */}
                  {order.billing_address && (
                    <div className="mx-5 md:mx-6 mb-4 rounded-xl bg-gray-50/80 border border-gray-100 px-3.5 py-3 flex items-start gap-2.5">
                      <Icon icon="mdi:map-marker-outline" className="w-4 h-4 text-[#012068] mt-0.5 flex-shrink-0" />
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-gray-800">{order.billing_address.full_name}</p>
                        <p className="text-xs text-gray-500 leading-relaxed">{order.billing_address.address}</p>
                        <p className="inline-flex items-center gap-1 text-xs text-gray-500 mt-0.5">
                          <Icon icon="mdi:phone-outline" className="w-3 h-3" />
                          {order.billing_address.mobile}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Price breakdown */}
                  <div className="px-5 md:px-6 pb-4">
                    {(() => {
                      const mrpTotal = items.reduce((s, p) => s + Number(p.total || 0), 0);
                      const discountTotal = items.reduce((s, p) => s + Number(p.discount_amount || 0), 0);
                      const hasDiscount = discountTotal > 0.01;
                      return (
                        <div className="space-y-1.5">
                          <div className="flex justify-between text-xs text-gray-500">
                            <span>Subtotal (MRP)</span>
                            <span className="tabular-nums">৳ {mrpTotal.toFixed(2)}</span>
                          </div>
                          {hasDiscount && (
                            <div className="flex justify-between text-xs text-emerald-600 font-medium">
                              <span>Discount</span>
                              <span className="tabular-nums">-৳ {discountTotal.toFixed(2)}</span>
                            </div>
                          )}
                          <div className="flex items-center justify-between pt-2 mt-1 border-t border-dashed border-gray-200">
                            <span className="text-sm font-bold text-gray-900">Total</span>
                            <span className="text-lg md:text-xl font-bold text-[#012068] tabular-nums">
                              ৳ {Number(order.total).toFixed(2)}
                            </span>
                          </div>
                        </div>
                      );
                    })()}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 px-5 md:px-6 py-3 border-t border-gray-100 bg-gray-50/40">
                    <Link
                      href={`/order-tracking?id=${order.id}`}
                      className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-[#012068] text-white text-xs font-semibold hover:bg-[#012068]/90 active:scale-95 shadow-sm shadow-[#012068]/20 transition-all"
                    >
                      <Icon icon="mdi:crosshairs-gps" className="w-4 h-4" />
                      Track Order
                    </Link>
                    {order.suspend_request ? (
                      <span className="inline-flex items-center gap-1 px-3 py-2 rounded-lg bg-amber-50 text-xs font-semibold text-amber-700 border border-amber-200">
                        <Icon icon="mdi:clock-outline" className="w-3.5 h-3.5" />
                        Cancel Requested
                      </span>
                    ) : order.verify_status === 0 ? (
                      <Popconfirm
                        title="Cancel this order?"
                        description="Are you sure you want to cancel this order? This action cannot be undone."
                        okText="Yes, Cancel"
                        cancelText="No"
                        okButtonProps={{ danger: true }}
                        placement="topRight"
                        onConfirm={() => cancelOrder(order.id)}
                      >
                        <button
                          type="button"
                          className="inline-flex items-center gap-1 px-3 py-2 rounded-lg bg-white border border-red-300 text-xs font-semibold text-red-600 hover:bg-red-50 active:scale-95 transition-all"
                        >
                          <Icon icon="mdi:close-circle-outline" className="w-3.5 h-3.5" />
                          Cancel
                        </button>
                      </Popconfirm>
                    ) : null}
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
