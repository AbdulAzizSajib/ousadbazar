"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { apiBasePharma } from "@/lib/config";
import type { Order } from "@/types";

export default function OrderHistoryPage() {
  const [phone, setPhone] = useState(() => typeof window !== "undefined" ? localStorage.getItem("mobile")?.replace(/^88/, "") || "" : "");
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [searched, setSearched] = useState(false);

  const fetchHistory = async () => {
    if (!phone.trim()) return;
    try {
      setErrorMsg(""); setIsLoading(true); setSearched(true);
      const fullPhone = phone.startsWith("88") ? phone.trim() : `88${phone.trim()}`;
      const res = await axios.get(`${apiBasePharma}/order/history?phone=${fullPhone}`);
      setOrders(Array.isArray(res.data) ? res.data : []);
    } catch { setOrders([]); setErrorMsg("Something went wrong. Please try again."); }
    finally { setIsLoading(false); }
  };

  const formatDate = (dateString: string) => new Date(dateString).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });

  useEffect(() => { if (phone) fetchHistory(); }, []);

  return (
    <section className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-2xl">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#388072]/10 mb-4">
            <svg className="w-8 h-8 text-[#388072]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-800 mb-1">Order History</h1>
          <p className="text-sm text-gray-500">Enter your phone number to view your past orders</p>
        </div>

        <form onSubmit={(e) => { e.preventDefault(); fetchHistory(); }} className="flex gap-3 mb-8">
          <input type="tel" className="flex-1 px-4 py-3 bg-white text-gray-900 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-[#388072] transition-colors placeholder-gray-400" placeholder="e.g. 01XXXXXXXXX" value={phone} onChange={(e) => setPhone(e.target.value)} required />
          <button type="submit" disabled={isLoading} className="bg-[#388072] hover:bg-[#2d6960] text-white font-semibold px-6 py-3 rounded-xl transition-colors disabled:opacity-50 flex items-center gap-2 whitespace-nowrap">
            {isLoading && <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" /></svg>}
            <span>{isLoading ? "Loading..." : "Search"}</span>
          </button>
        </form>

        {searched && !isLoading && orders.length === 0 && !errorMsg && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center animate-fade-in">
            <h3 className="text-lg font-bold text-gray-800 mb-2">No Orders Found</h3>
            <p className="text-sm text-gray-500">We couldn&apos;t find any orders for this phone number.</p>
          </div>
        )}

        {errorMsg && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center animate-fade-in">
            <h3 className="text-lg font-bold text-gray-800 mb-2">Something Went Wrong</h3>
            <p className="text-sm text-gray-500 mb-5">{errorMsg}</p>
            <button onClick={() => setErrorMsg("")} className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#388072] text-white text-sm font-semibold rounded-xl hover:bg-[#2d6960] transition-colors">Try Again</button>
          </div>
        )}

        {!isLoading && orders.length > 0 && (
          <div className="space-y-4 animate-fade-in">
            {orders.map((order) => (
              <div key={order.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="bg-[#388072] px-5 py-3 flex items-center justify-between">
                  <div><p className="text-white/70 text-xs font-medium uppercase tracking-wider">Order Code</p><p className="text-white text-lg font-bold">#{order.sale_code}</p></div>
                  <div className="text-right"><p className="text-white/70 text-xs font-medium uppercase tracking-wider">Order Date</p><p className="text-white text-sm font-semibold">{formatDate(order.created_at || order.sale_date)}</p></div>
                </div>
                <div className="divide-y divide-gray-50">
                  {order.products?.map((product, i) => (
                    <div key={i} className="px-5 py-3 flex items-center justify-between">
                      <div className="flex-1 min-w-0 mr-3"><p className="text-sm font-medium text-gray-800 truncate">{product.name || product.product_name}</p><p className="text-xs text-gray-400 mt-0.5">Qty: {product.quantity} × ৳{Number(product.price).toFixed(2)}</p></div>
                      <p className="text-sm font-semibold text-gray-800 whitespace-nowrap">৳ {Number(product.total).toFixed(2)}</p>
                    </div>
                  ))}
                </div>
                <div className="px-5 py-3 bg-[#388072]/5 flex items-center justify-between border-t border-gray-100">
                  <span className="text-sm font-bold text-gray-700">Total</span>
                  <span className="text-lg font-bold text-[#388072]">৳ {Number(order.total).toFixed(2)}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
