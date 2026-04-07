"use client";

import { Suspense, useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import axios from "axios";
import { apiBasePharma } from "@/lib/config";
import type { Order } from "@/types";

export default function OrderTrackingPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-gray-500">Loading...</div>}>
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

  const steps = ["Order Placed", "Store Arrived", "On The Way", "Delivered"];

  const trackOrder = async () => {
    if (!saleCode.trim()) return;
    try {
      setErrorMsg(""); setIsLoading(true);
      const res = await axios.get(`${apiBasePharma}/order/order-tracking?sale_code=${saleCode.trim()}`);
      if (res.data?.status === "error") { setOrderStatus(null); setErrorMsg(res.data?.message || "Order not found."); }
      else { setOrderStatus(res.data); }
    } catch { setOrderStatus(null); setErrorMsg("Something went wrong. Please try again."); }
    finally { setIsLoading(false); }
  };

  const formatDate = (dateString: string) => new Date(dateString).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
  const getStatusText = (status: number | null) => ({ null: "Processing", 1: "Store Arrived", 2: "On The Way", 3: "Delivered", 4: "Not Reachable", 5: "Not Received" } as Record<string, string>)[String(status)] || "Processing";
  const getStatusBadgeClass = (status: number | null) => ({ null: "bg-blue-50 text-blue-600", 1: "bg-yellow-50 text-yellow-600", 2: "bg-orange-50 text-orange-600", 3: "bg-green-50 text-green-600", 4: "bg-red-50 text-red-600", 5: "bg-red-50 text-red-600" } as Record<string, string>)[String(status)] || "bg-blue-50 text-blue-600";
  const getCurrentStep = () => ({ null: 0, 1: 1, 2: 2, 3: 3, 4: 2, 5: 2 } as Record<string, number>)[String(orderStatus?.delivery_status)] ?? 0;

  useEffect(() => { if (saleCode) trackOrder(); }, []);

  return (
    <section className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-2xl">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#388072]/10 mb-4">
            <svg className="w-8 h-8 text-[#388072]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-800 mb-1">Track Your Order</h1>
          <p className="text-sm text-gray-500">Enter your order code to check the delivery status</p>
        </div>

        <form onSubmit={(e) => { e.preventDefault(); trackOrder(); }} className="flex gap-3 mb-8">
          <input type="text" className="flex-1 px-4 py-3 bg-white text-gray-900 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-[#388072] transition-colors placeholder-gray-400" placeholder="e.g. 2602224134" value={saleCode} onChange={(e) => setSaleCode(e.target.value)} required />
          <button type="submit" disabled={isLoading} className="bg-[#388072] hover:bg-[#2d6960] text-white font-semibold px-6 py-3 rounded-xl transition-colors disabled:opacity-50 flex items-center gap-2 whitespace-nowrap">
            {isLoading && <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" /></svg>}
            <span>{isLoading ? "Tracking..." : "Track"}</span>
          </button>
        </form>

        {errorMsg && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center animate-fade-in">
            <h3 className="text-lg font-bold text-gray-800 mb-2">Order Not Found</h3>
            <p className="text-sm text-gray-500 mb-5">{errorMsg}</p>
            <button onClick={() => { setSaleCode(""); setErrorMsg(""); }} className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#388072] text-white text-sm font-semibold rounded-xl hover:bg-[#2d6960] transition-colors">Try Again</button>
          </div>
        )}

        {!isLoading && orderStatus && (
          <div className="space-y-5 animate-fade-in">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="bg-[#388072] px-5 py-4 flex items-center justify-between">
                <div><p className="text-white/70 text-xs font-medium uppercase tracking-wider">Order Code</p><p className="text-white text-lg font-bold">#{orderStatus.sale_code}</p></div>
                <div className="text-right"><p className="text-white/70 text-xs font-medium uppercase tracking-wider">Order Date</p><p className="text-white text-sm font-semibold">{formatDate(orderStatus.sale_date)}</p></div>
              </div>
              <div className="px-5 py-4 flex items-center justify-between border-b border-gray-100">
                <span className="text-sm text-gray-500">Current Status</span>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusBadgeClass(orderStatus.delivery_status)}`}>{getStatusText(orderStatus.delivery_status)}</span>
              </div>
              <div className="px-5 py-3 flex items-center justify-between border-b border-gray-100"><span className="text-sm text-gray-500">Payment</span><span className="text-sm font-medium text-gray-700">{orderStatus.payment_method?.name}</span></div>
              <div className="px-5 py-3 flex items-center justify-between"><span className="text-sm text-gray-500">Total Amount</span><span className="text-lg font-bold text-[#388072]">৳ {Number(orderStatus.total).toFixed(2)}</span></div>
            </div>

            {/* Progress Timeline */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
              <h3 className="text-sm font-semibold text-gray-700 mb-5 uppercase tracking-wider">Delivery Progress</h3>
              <div className="flex items-center justify-between">
                {steps.map((step, index) => (
                  <div key={index} className="flex items-center flex-1">
                    <div className="flex flex-col items-center" style={{ minWidth: 60 }}>
                      <div className={`w-9 h-9 rounded-full flex items-center justify-center transition-all duration-300 ${index <= getCurrentStep() ? "bg-[#388072] text-white shadow-md shadow-[#388072]/30" : "bg-gray-100 text-gray-400"}`}>
                        {index < getCurrentStep() ? <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg> : <span className="text-xs font-bold">{index + 1}</span>}
                      </div>
                      <p className={`mt-2 text-[10px] font-medium text-center leading-tight ${index <= getCurrentStep() ? "text-[#388072]" : "text-gray-400"}`}>{step}</p>
                    </div>
                    {index < steps.length - 1 && <div className={`flex-1 h-[3px] mx-1 rounded-full transition-all duration-500 ${index < getCurrentStep() ? "bg-[#388072]" : "bg-gray-200"}`} />}
                  </div>
                ))}
              </div>
            </div>

            {/* Products */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-100"><h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider">Ordered Items ({orderStatus.sale_products?.length})</h3></div>
              <div className="divide-y divide-gray-50">
                {orderStatus.sale_products?.map((product, i) => (
                  <div key={i} className="px-5 py-3 flex items-center justify-between">
                    <div className="flex-1 min-w-0 mr-3"><p className="text-sm font-medium text-gray-800 truncate">{product.product_name}</p><p className="text-xs text-gray-400 mt-0.5">Qty: {product.total_quantity} | ৳{Number(product.ecom_final_selling_price || 0).toFixed(2)}/unit</p></div>
                    <p className="text-sm font-semibold text-gray-800 whitespace-nowrap">৳ {Number(product.total).toFixed(2)}</p>
                  </div>
                ))}
              </div>
              <div className="px-5 py-4 bg-[#388072]/5 flex items-center justify-between"><span className="text-sm font-bold text-gray-700">Total</span><span className="text-lg font-bold text-[#388072]">৳ {Number(orderStatus.total).toFixed(2)}</span></div>
            </div>

            {orderStatus.billing_address && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
                <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-3">Shipping Address</h3>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#388072]/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <svg className="w-4 h-4 text-[#388072]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                  </div>
                  <div><p className="text-sm font-semibold text-gray-800">{orderStatus.billing_address.full_name}</p><p className="text-sm text-gray-500">{orderStatus.billing_address.address}</p><p className="text-sm text-gray-500">{orderStatus.billing_address.mobile}</p></div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
