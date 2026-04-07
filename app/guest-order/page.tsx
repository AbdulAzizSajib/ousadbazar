"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Pagination } from "antd";
import { Icon } from "@iconify/react";
import axios from "axios";
import { apiBasePharma, getTokenConfig } from "@/lib/config";
import { showNotification } from "@/lib/notification";
import type { Order } from "@/types";

export default function GuestOrderPage() {
  const [loading, setLoading] = useState(false);
  const [orderData, setOrderData] = useState<Order[]>([]);
  const [backupData, setBackupData] = useState<{ total?: number } | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(15);
  const [mobile, setMobile] = useState("");

  const validateMobile = (value: string) => {
    const v = String(value ?? "").trim();
    if (!v) return "Mobile number is required";
    if (!v.startsWith("01")) return "Mobile number must start with 01";
    if (!/^\d+$/.test(v)) return "Mobile number must contain only digits";
    if (v.length !== 11) return v.length > 11 ? "Cannot exceed 11 digits" : "Must be 11 digits";
    return "";
  };

  const validationError = useMemo(() => validateMobile(mobile), [mobile]);
  const isValidMobile = validationError === "";

  const onlyNumber = (value: string) => {
    let v = value.replace(/\D/g, "");
    if (v.length > 11) v = v.slice(0, 11);
    setMobile(v);
  };

  const getOrderInfo = async (page = currentPage) => {
    if (!isValidMobile) { showNotification("warning", validationError || "Please enter a valid mobile number"); return; }
    try {
      setLoading(true);
      const res = await axios.get(`${apiBasePharma}/all-guest-order-list-paginated?page=${page}&search=&paginate=${pageSize}&mobile=${mobile}`, getTokenConfig());
      setOrderData(res?.data?.data || []);
      setBackupData(res.data);
    } catch (error) { console.error(error); }
    finally { setLoading(false); }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return `${("0" + date.getDate()).slice(-2)}-${("0" + (date.getMonth() + 1)).slice(-2)}-${date.getFullYear()}`;
  };

  const statusLabel = (s: number | null) => s === 0 || s === null ? "Pending" : s === 1 ? "Confirmed" : "Cancelled";
  const statusClass = (s: number | null) => s === 0 || s === null ? "bg-yellow-50 text-yellow-700 border-yellow-200" : s === 1 ? "bg-green-50 text-green-700 border-green-200 cursor-not-allowed" : "bg-red-50 text-red-700 border-red-200 cursor-not-allowed";

  return (
    <section className="p-4 min-h-screen">
      <div className="bg-white rounded-lg p-4 mb-4">
        <h2 className="text-lg font-medium mb-3 text-gray-800">Enter your mobile number to find your orders</h2>
        <div className="flex gap-3">
          <input type="tel" value={mobile} onChange={(e) => onlyNumber(e.target.value)} onKeyDown={(e) => e.key === "Enter" && getOrderInfo()} placeholder="Enter mobile number" className={`w-1/2 px-4 py-1 border border-[#388072] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#388072] transition ${!isValidMobile && mobile ? "border-red-400" : ""}`} />
          <button onClick={() => getOrderInfo()} className={`bg-[#388072] text-white px-4 py-2 rounded text-sm hover:bg-blue-700 transition-colors ${!isValidMobile || loading ? "opacity-50 cursor-not-allowed" : ""}`} disabled={!isValidMobile || loading}>
            {loading && <Icon icon="mdi:loading" className="w-5 h-5 inline mr-2 animate-spin" />}
            <span>{loading ? "Searching..." : "Search"}</span>
          </button>
        </div>
        {!isValidMobile && mobile && <p className="text-red-500 text-xs mt-1">{validationError}</p>}
      </div>

      {orderData.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-lg font-medium text-gray-800">Your Orders</h3>
          {/* Mobile Cards */}
          <div className="md:hidden space-y-3">
            {orderData.map((item) => (
              <div key={item.id} className="bg-white rounded-lg border p-4">
                <div className="flex justify-between items-start mb-2">
                  <Link href={{ pathname: "/order-tracking", query: { sale_code: item.sale_code } }} className="text-blue-600 font-medium text-sm">#{item.sale_code}</Link>
                  <span className="text-xs text-gray-500">{formatDate(item.sale_date)}</span>
                </div>
                <div className="space-y-2 text-sm">
                  <div><span className="text-gray-600">Products:</span><div className="text-xs text-gray-700 mt-1">{item.sale_products?.map((p, i) => <span key={i} className="block">• {p.product_name}</span>)}</div></div>
                  <div className="flex justify-between"><span className="text-gray-600">Total:</span><span className="font-medium">{Math.round(item.total)} BDT</span></div>
                  <div className="flex justify-between items-center pt-2">
                    <span className="text-xs text-gray-600">{item.payment_method?.name}</span>
                    <button disabled className={`px-3 py-1 rounded text-xs border transition-colors ${statusClass(item.verify_status)}`}>{statusLabel(item.verify_status)}</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          {/* Desktop Table */}
          <div className="hidden md:block bg-white rounded-lg border overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50"><tr>
                <th className="text-left p-3 font-medium text-gray-700">Track Order ID</th>
                <th className="text-left p-3 font-medium text-gray-700">Date</th>
                <th className="text-left p-3 font-medium text-gray-700">Products</th>
                <th className="text-left p-3 font-medium text-gray-700">Total</th>
                <th className="text-left p-3 font-medium text-gray-700">Payment</th>
                <th className="text-left p-3 font-medium text-gray-700">Status</th>
              </tr></thead>
              <tbody>
                {orderData.map((item) => (
                  <tr key={item.id} className="border-t hover:bg-gray-50">
                    <td className="p-3"><Link href={{ pathname: "/order-tracking", query: { sale_code: item.sale_code } }} className="text-blue-600 font-medium hover:underline">#{item.sale_code}</Link></td>
                    <td className="p-3 text-gray-600">{formatDate(item.sale_date)}</td>
                    <td className="p-3"><div className="text-xs text-gray-700 space-y-1">{item.sale_products?.map((p, i) => <div key={i}>{p.product_name}</div>)}</div></td>
                    <td className="p-3 font-medium">{Math.round(item.total)} BDT</td>
                    <td className="p-3"><div className="text-xs text-gray-600">{item.payment_method?.name}</div><span className={`text-xs ${item.paid_amount === "0.0" ? "text-red-600" : "text-green-600"}`}>{item.paid_amount === "0.0" ? "UnPaid" : "Paid"}</span></td>
                    <td className="p-3"><button className={`px-3 py-1 rounded text-xs border transition-colors ${statusClass(item.verify_status)}`}>{statusLabel(item.verify_status)}</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex justify-center pt-4">
            <Pagination current={currentPage} total={backupData?.total} showSizeChanger={false} pageSize={pageSize} onChange={(page) => { setCurrentPage(page); getOrderInfo(page); }} size="small" />
          </div>
        </div>
      )}

      {!loading && orderData.length === 0 && (
        <div className="text-center py-8"><div className="bg-white rounded-lg p-8"><h3 className="text-lg font-medium text-gray-600 mb-1">No Orders Found</h3><p className="text-sm text-gray-500">Enter your mobile number to find your orders</p></div></div>
      )}
    </section>
  );
}
