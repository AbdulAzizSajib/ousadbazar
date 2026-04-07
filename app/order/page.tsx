"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Pagination, Popconfirm } from "antd";
import { Icon } from "@iconify/react";
import axios from "axios";
import { apiBasePharma, getTokenConfig } from "@/lib/config";
import { showNotification } from "@/lib/notification";
import type { Order } from "@/types";

export default function OrderPage() {
  const [loading, setLoading] = useState(false);
  const [orderData, setOrderData] = useState<Order[]>([]);
  const [backupData, setBackupData] = useState<{ total?: number } | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(15);

  const getOrderInfo = async (page = currentPage) => {
    try {
      setLoading(true);
      const res = await axios.get(`${apiBasePharma}/all-order-list-paginated?page=${page}&search=&paginate=${pageSize}`, getTokenConfig());
      setOrderData(res?.data?.data || []);
      setBackupData(res.data);
    } catch (error) { console.error(error); }
    finally { setLoading(false); }
  };

  const handleCancel = async (id: number) => {
    try {
      const res = await axios.post(`${apiBasePharma}/sale/request-to-suspend/${id}`);
      if (res.data) { showNotification("success", res.data.message); getOrderInfo(); }
    } catch (error) { console.error(error); }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return `${("0" + date.getDate()).slice(-2)}-${("0" + (date.getMonth() + 1)).slice(-2)}-${date.getFullYear()}`;
  };

  useEffect(() => { getOrderInfo(); }, []);

  const statusLabel = (s: number | null) => s === 0 || s === null ? "Order Pending" : s === 1 ? "Order Confirmed" : "Order Cancelled";
  const statusClass = (s: number | null) => s === 0 || s === null ? "bg-yellow-50 text-yellow-700 border-yellow-200" : s === 1 ? "bg-green-50 text-green-700 border-green-200 cursor-not-allowed" : "bg-red-50 text-red-700 border-red-200 cursor-not-allowed";

  if (loading) return <section className="p-4 min-h-screen"><div className="bg-white rounded-lg p-8 text-center"><div className="text-gray-500 flex items-center gap-4 justify-center"><Icon icon="mdi-light:loading" className="w-4 h-4 animate-spin" /><p>Loading your orders...</p></div></div></section>;

  if (orderData.length === 0) return (
    <section className="p-4 min-h-screen"><div className="text-center py-8"><div className="bg-white rounded-lg p-8"><h3 className="text-lg font-medium text-gray-600 mb-1">No Orders Yet</h3><p className="text-sm text-gray-500 mb-4">You haven&apos;t placed any orders</p><Link href="/" className="inline-block bg-blue-600 text-white px-4 py-2 rounded text-sm hover:bg-blue-700 transition-colors">Start Shopping</Link></div></div></section>
  );

  return (
    <section className="p-4 min-h-screen">
      <div className="container mx-auto space-y-3">
        {/* Mobile view */}
        <div className="md:hidden space-y-3 mt-10">
          {orderData.map((item) => (
            <div key={item.id} className="bg-white rounded-lg border p-4">
              <div className="flex justify-between items-start mb-2">
                <Link href={{ pathname: "/order-tracking", query: { sale_code: item.sale_code } }} className="text-blue-600 font-medium text-sm">#{item.sale_code}</Link>
                <span className="text-xs text-gray-500">{formatDate(item.sale_date)}</span>
              </div>
              <div className="space-y-2 text-sm">
                <div><span className="text-gray-600">Products:</span><div className="text-xs text-gray-700 mt-1">{item.sale_products?.map((p, i) => <span key={i} className="block">• {p.product_name}</span>)}</div></div>
                <div className="flex justify-between"><span className="text-gray-600">Total:</span><span className="font-medium">{Math.round(item.total)} ৳</span></div>
                <div className="flex justify-between items-center pt-2 border-t">
                  <span className="text-xs text-gray-600">{item.payment_method?.name}</span>
                  <Popconfirm title="Cancel this order?" disabled={item.verify_status === 1 || item.verify_status === 2} onConfirm={() => handleCancel(item.id)} placement="top">
                    <button disabled={item.verify_status === 1 || item.verify_status === 2} className={`px-3 py-1 rounded text-xs border transition-colors flex items-center gap-1 ${statusClass(item.verify_status)}`}>
                      {statusLabel(item.verify_status)}
                      {(item.verify_status === 0 || item.verify_status === null) && <Icon className="w-3 h-3" icon="hugeicons:cancel-01" />}
                    </button>
                  </Popconfirm>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Desktop table */}
        <div className="hidden md:block bg-white rounded-lg border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50"><tr>
              <th className="text-left p-3 font-medium text-gray-700">Track Order ID</th>
              <th className="text-left p-3 font-medium text-gray-700">Date</th>
              <th className="text-left p-3 font-medium text-gray-700">Products</th>
              <th className="text-left p-3 font-medium text-gray-700">Total Amount</th>
              <th className="text-left p-3 font-medium text-gray-700">Payment Method</th>
              <th className="text-left p-3 font-medium text-gray-700">Status</th>
              <th className="text-left p-3 font-medium text-gray-700">Action</th>
            </tr></thead>
            <tbody>
              {orderData.map((item) => (
                <tr key={item.id} className="border-t hover:bg-gray-50">
                  <td className="p-3"><Link href={{ pathname: "/order-tracking", query: { sale_code: item.sale_code } }} className="text-blue-600 font-medium hover:underline">#{item.sale_code}</Link></td>
                  <td className="p-3 text-gray-600">{formatDate(item.sale_date)}</td>
                  <td className="p-3"><div className="text-xs text-gray-700 space-y-1 max-w-xs">{item.sale_products?.slice(0, 3).map((p, i) => <div key={i}>{p.product_name}</div>)}{item.sale_products?.length > 3 && <div className="text-gray-500">+{item.sale_products.length - 3} more...</div>}</div></td>
                  <td className="p-3 font-medium">{Math.round(item.total)} ৳</td>
                  <td className="p-3 text-xs text-gray-600">{item.payment_method?.name}</td>
                  <td className="p-3"><span className={`text-xs px-2 py-1 rounded ${item.paid_amount === "0.0" ? "text-red-600 bg-red-50" : "text-green-600 bg-green-50"}`}>{item.paid_amount === "0.0" ? "UnPaid" : "Paid"}</span></td>
                  <td className="p-3">
                    <Popconfirm title="Cancel this order?" disabled={item.verify_status === 1 || item.verify_status === 2} onConfirm={() => handleCancel(item.id)} placement="top">
                      <button disabled={item.verify_status === 1 || item.verify_status === 2} className={`px-3 py-1 rounded text-xs border transition-colors flex items-center gap-1 ${statusClass(item.verify_status)}`}>
                        {statusLabel(item.verify_status)}
                        {(item.verify_status === 0 || item.verify_status === null) && <Icon className="w-3 h-3" icon="hugeicons:cancel-01" />}
                      </button>
                    </Popconfirm>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex justify-start pt-4">
          <Pagination current={currentPage} total={backupData?.total} showSizeChanger={false} pageSize={pageSize} onChange={(page) => { setCurrentPage(page); getOrderInfo(page); }} size="small" />
        </div>
      </div>
    </section>
  );
}
