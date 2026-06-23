"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Icon } from "@iconify/react";
import { useOrderTracking, useCancelOrder } from "@/lib/hooks/useOrders";
import { Popconfirm } from "antd";
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
  const initialId = searchParams.get("id") || "";
  const [orderId, setOrderId] = useState(initialId);
  const [submittedId, setSubmittedId] = useState(initialId);

  const {
    data: orderStatus,
    isLoading,
    error,
  } = useOrderTracking(submittedId, !!submittedId);
  const errorMsg = error ? error.message : "";
  const { mutate: cancelOrder } = useCancelOrder();

  const steps = [
    { label: "Order Placed", icon: "mdi:receipt-text-outline" },
    { label: "Store Arrived", icon: "mdi:storefront-outline" },
    { label: "On The Way", icon: "mdi:truck-fast-outline" },
    { label: "Delivered", icon: "mdi:home-check-outline" },
  ];

  const trackOrder = () => {
    if (!orderId.trim()) return;
    setSubmittedId(orderId.trim());
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

  const currentStep = getCurrentStep();

  const printInvoice = (order: Order) => {
    const mrpTotal = (order.sale_products || []).reduce((s, p) => s + Number(p.total || 0), 0);
    const discountTotal = (order.sale_products || []).reduce((s, p) => s + Number(p.discount_amount || 0), 0);
    const finalTotal = Number(order.total || 0);
    const address = order.billing_address;

    const rows = (order.sale_products || []).map((p, i) => `
      <tr>
        <td>${i + 1}</td>
        <td>${p.product_name}</td>
        <td>${p.total_quantity || p.quantity || 1}</td>
        <td>৳ ${Number(p.total || 0).toFixed(2)}</td>
        <td>৳ ${Number(p.discount_amount || 0).toFixed(2)}</td>
        <td>৳ ${(Number(p.total || 0) - Number(p.discount_amount || 0)).toFixed(2)}</td>
      </tr>`).join('');

    const html = `<!DOCTYPE html><html><head><meta charset="utf-8"/><title>Invoice #${order.sale_code}</title>
    <style>
      * { margin: 0; padding: 0; box-sizing: border-box; }
      body { font-family: Arial, sans-serif; font-size: 13px; color: #222; padding: 32px; }
      .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 24px; }
      .logo-area { display: flex; flex-direction: column; gap: 6px; }
      .logo-area img, .logo-area svg { width: 180px; height: auto; }
      .logo-tag { font-size: 11px; color: #13a89e; font-weight: 600; letter-spacing: 0.3px; }
      .invoice-title { text-align: right; }
      .invoice-title h1 { font-size: 26px; font-weight: 800; color: #012068; letter-spacing: 1px; }
      .invoice-title p { font-size: 12px; color: #555; }
      .divider { border: none; border-top: 2px solid #012068; margin: 16px 0; }
      .meta { display: flex; gap: 32px; margin-bottom: 20px; font-size: 12px; color: #444; }
      .meta span { font-weight: 600; color: #222; }
      .addresses { display: flex; gap: 24px; margin-bottom: 24px; }
      .address-box { flex: 1; background: #f8faff; border: 1px solid #e0e7ff; border-radius: 8px; padding: 14px; }
      .address-box h4 { font-size: 11px; font-weight: 700; color: #012068; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 6px; }
      .address-box p { font-size: 12px; color: #444; line-height: 1.6; }
      table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
      thead tr { background: #012068; color: white; }
      thead th { padding: 9px 10px; text-align: left; font-size: 12px; font-weight: 600; }
      tbody tr:nth-child(even) { background: #f8faff; }
      tbody td { padding: 8px 10px; font-size: 12px; border-bottom: 1px solid #e8edf5; }
      .summary { margin-left: auto; width: 280px; }
      .summary-row { display: flex; justify-content: space-between; padding: 5px 0; font-size: 13px; border-bottom: 1px solid #eee; }
      .summary-row.discount { color: #e53e3e; }
      .summary-row.total { font-size: 15px; font-weight: 800; color: #012068; border-top: 2px solid #012068; border-bottom: none; padding-top: 8px; margin-top: 4px; }
      .footer { margin-top: 32px; text-align: center; font-size: 11px; color: #888; border-top: 1px solid #eee; padding-top: 16px; }
    </style></head><body>
    <div class="header">
      <div class="logo-area">
        <svg viewBox="0 0 622 135" xmlns="http://www.w3.org/2000/svg" style="width:200px;height:auto"><style>.st0{fill:#2B388F}.st1{fill:#F05E63}.st2{fill:#FFD007}.st3{fill:#50A6DC}.st4{fill:#A6A8AB}</style><g><g><path class="st0" d="M148.24,77.8c-14.98,0-27.23-11.25-27.23-27.23c0-15.89,12.24-27.15,27.23-27.15c15.13,0,27.15,11.26,27.15,27.15C175.39,66.55,163.3,77.8,148.24,77.8z M148.24,68.3c9.58,0,16.2-6.92,16.2-17.72s-6.62-17.57-16.2-17.57c-9.66,0-16.27,6.77-16.27,17.57S138.58,68.3,148.24,68.3z"/><path class="st0" d="M223.07,77.27h-10.72v-5.32c-2.66,3.57-7.3,5.86-12.55,5.86c-9.81,0-16.88-6.39-16.88-17.95V35.14h10.65v23.2c0,6.77,3.73,10.42,9.35,10.42c5.78,0,9.43-3.65,9.43-10.42v-23.2h10.72V77.27z"/><path class="st0" d="M249.69,77.95c-10.57,0-17.95-6.16-18.4-13.99h10.72c0.38,3.19,3.35,5.63,7.6,5.63c4.18,0,6.46-1.9,6.46-4.33c0-7.53-23.8-2.74-23.8-18.18c0-7,6.24-12.62,16.65-12.62c10.19,0,16.35,5.55,16.96,13.92H255.7c-0.3-3.27-2.89-5.48-7.07-5.48c-3.95,0-6.01,1.6-6.01,4.03c0,7.68,23.35,2.89,23.65,18.33C266.27,72.48,259.96,77.95,249.69,77.95z"/><path class="st0" d="M291.51,34.45c6.77,0,11.41,3.19,13.92,6.69v-6.01h10.72v42.13h-10.72v-6.16c-2.51,3.65-7.3,6.84-13.99,6.84c-10.65,0-19.16-8.75-19.16-21.9C272.27,42.89,280.79,34.45,291.51,34.45z M294.25,43.81c-5.7,0-11.1,4.26-11.1,12.24s5.4,12.55,11.1,12.55c5.86,0,11.18-4.41,11.18-12.4S300.11,43.81,294.25,43.81z"/><path class="st0" d="M343.15,34.45c5.55,0,10.88,2.59,13.76,6.54v-20h10.8v56.28h-10.8v-6.24c-2.51,3.88-7.22,6.92-13.84,6.92c-10.72,0-19.24-8.75-19.24-21.9C323.83,42.89,332.35,34.45,343.15,34.45z M345.81,43.81c-5.7,0-11.1,4.26-11.1,12.24s5.4,12.55,11.1,12.55c5.86,0,11.18-4.41,11.18-12.4S351.67,43.81,345.81,43.81z"/></g></g><g><path class="st0" d="M73.26,73.46c-0.02,3.56-0.17,7.12,0,10.67c0.12,2.39-0.67,4.02-2.63,5.33c-2.7,1.8-5.31,3.76-7.95,5.66c-1.05,0.76-2.15,0.72-3.2,0.1c-4.39-2.6-8.62-5.44-12.51-8.74C38.98,79.71,32.24,71.85,26.67,63c-4.51-7.16-7.65-14.9-9.61-23.13c-0.79-3.31-1.36-6.66-1.7-10.05c-0.32-3.13-0.22-6.26-0.3-9.39c-0.04-1.41,0.57-2.3,1.74-3.01c6.13-3.73,12.59-6.69,19.47-8.77c4.94-1.49,9.98-2.42,15.09-3.08c6.59-0.85,13.2-0.97,19.83-0.71c1.3,0.05,2.01,0.67,2.02,1.91c0.02,5.08-0.01,10.17-0.02,15.25c0,0.06-0.04,0.12-0.06,0.18l0.01-0.01c-5.3-0.01-10.61-0.02-15.91-0.03c-1.8,0-2.18,0.36-2.18,2.16c-0.01,4.57-0.02,9.15,0.02,13.72c0.01,0.76-0.2,0.93-0.94,0.93c-5.11-0.03-10.23-0.02-15.34-0.02c-1.41,0-1.87,0.46-1.87,1.88c0,4.54,0,9.08,0,13.63c0,1.51,0.41,1.92,1.91,1.92c5.02,0,10.04,0.02,15.05-0.02c0.91-0.01,1.22,0.14,1.2,1.16c-0.07,4.73-0.04,9.46-0.03,14.2c0,1.35,0.49,1.83,1.83,1.84c2.99,0.01,5.97,0,8.96-0.01c2.44-0.01,4.89-0.04,7.33-0.06l0.04-0.04L73.26,73.46z"/><path class="st1" d="M89.9,56.52c-0.01,5.05-0.06,10.1-0.02,15.14c0.01,1.39-0.63,1.82-1.77,1.81c-4.95-0.05-9.91-0.02-14.86-0.02c0,0-0.05-0.03-0.05-0.03l-0.04,0.04c0.01-0.28,0.03-0.57,0.03-0.85c0-5.11,0-10.22,0-15.33c0-0.46-0.07-0.82,0.64-0.81c5.36,0.05,10.73,0.05,16.09,0.06L89.9,56.52z"/><path class="st0" d="M73.13,22.21c5.36-0.01,10.73,0,16.09-0.05c0.77-0.01,0.7,0.38,0.7,0.87c-0.01,4.79,0,9.59,0,14.38c0,0.48,0.02,0.95,0.04,1.43c0,0.05-0.01,0.08-0.05,0.11c-5.26,0-10.53-0.03-15.79,0.01c-0.78,0.01-0.99-0.18-0.99-0.98c0.03-5.26,0.01-10.53,0.01-15.79L73.13,22.21z"/><path class="st2" d="M89.9,38.95c0.03-0.03,0.05-0.07,0.05-0.11c5.01-0.01,10.03,0,15.04-0.04c0.66-0.01,0.77,0.22,0.76,0.8c-0.02,5.33-0.02,10.66,0,15.99c0,0.66-0.16,0.85-0.83,0.84c-4.57-0.03-9.14-0.02-13.71-0.01c-0.44,0-0.89-0.09-1.31,0.09c0,0,0.02,0.01,0.02,0.01C89.92,50.68,89.91,44.81,89.9,38.95z"/><path class="st2" d="M102.26,18.45c1.59,0,3.18,0.02,4.76-0.01c0.51-0.01,0.64,0.14,0.64,0.63c-0.02,3.11-0.02,6.22,0,9.34c0,0.5-0.14,0.63-0.64,0.63c-3.18-0.02-6.35-0.02-9.53,0c-0.49,0-0.66-0.13-0.66-0.64c0.02-3.11,0.02-6.22-0.01-9.34c-0.01-0.56,0.23-0.61,0.68-0.6C99.08,18.47,100.67,18.46,102.26,18.45z"/><path class="st1" d="M100.44,70.4c-0.98,0-1.97-0.03-2.95,0.01c-0.47,0.02-0.6-0.14-0.59-0.59c0.02-2,0.01-4-0.01-6c-0.01-0.46,0.14-0.59,0.6-0.59c2.03,0.02,4.06,0.02,6.09,0c0.44,0,0.6,0.11,0.6,0.58c-0.02,2-0.02,4,0,6c0.01,0.46-0.14,0.6-0.59,0.59C102.54,70.37,101.49,70.39,100.44,70.4z"/><path class="st3" d="M93.06,12.12c-0.98,0-1.97-0.03-2.95,0.01c-0.53,0.02-0.62-0.17-0.62-0.65c0.02-1.94,0.03-3.87-0.01-5.81c-0.01-0.51,0.14-0.65,0.63-0.64c1.97,0.03,3.94,0.02,5.91,0c0.47-0.01,0.59,0.16,0.59,0.6c-0.02,1.97-0.02,3.94,0,5.91c0,0.45-0.13,0.6-0.59,0.58C95.03,12.09,94.05,12.11,93.06,12.12z"/></g><g><path class="st0" d="M422.67,77.95h-22.89V24.87h21.9c11.1,0,17.26,5.78,17.26,13.69c0,6.46-3.88,10.49-9.05,12.17c6.01,1.06,10.27,6.62,10.27,12.85C440.16,72.02,433.69,77.95,422.67,77.95z M420.16,33.46h-9.73v13.31h9.73c5.02,0,7.91-2.28,7.91-6.62C428.07,35.9,425.18,33.46,420.16,33.46z M420.92,54.99h-10.5v14.3h10.72c5.17,0,8.21-2.51,8.21-7C429.36,57.72,426.09,54.99,420.92,54.99z"/><path class="st0" d="M465.18,35.14c6.77,0,11.41,3.19,13.92,6.69v-6.01h10.72v42.13h-10.72v-6.16c-2.51,3.65-7.3,6.84-13.99,6.84c-10.65,0-19.16-8.75-19.16-21.9S454.45,35.14,465.18,35.14z M467.91,44.49c-5.7,0-11.1,4.26-11.1,12.24s5.4,12.55,11.1,12.55c5.86,0,11.18-4.41,11.18-12.4C479.09,48.9,473.77,44.49,467.91,44.49z"/><path class="st0" d="M528.52,44.42l-18.56,24.79h18.78v8.75h-30.88v-8.59l18.4-24.79h-18.33v-8.75h30.57V44.42z"/><path class="st0" d="M553.46,35.14c6.77,0,11.41,3.19,13.92,6.69v-6.01h10.72v42.13h-10.72v-6.16c-2.51,3.65-7.3,6.84-13.99,6.84c-10.65,0-19.16-8.75-19.16-21.9S542.74,35.14,553.46,35.14z M556.2,44.49c-5.7,0-11.1,4.26-11.1,12.24s5.4,12.55,11.1,12.55c5.86,0,11.18-4.41,11.18-12.4C567.38,48.9,562.06,44.49,556.2,44.49z"/><path class="st0" d="M599.17,77.95h-10.65V35.82h10.65v6.54c2.66-4.33,7.07-7.15,12.93-7.15v11.18h-2.81c-6.31,0-10.12,2.43-10.12,10.57V77.95z"/></g></svg>
        <div class="logo-tag">Your trusted medicine shop</div>
      </div>
      <div class="invoice-title">
        <h1>TAX INVOICE</h1>
        <p>Invoice No: ${order.sale_code}</p>
        <p>Date: ${new Date(order.sale_date).toLocaleDateString('en-GB')}</p>
      </div>
    </div>
    <hr class="divider"/>
    <div class="addresses">
      <div class="address-box">
        <h4>Bill From</h4>
        <p><strong>OusadBazar</strong><br/>ACI Centre, Tejgaon Industrial Area<br/>Dhaka 1208, Bangladesh</p>
      </div>
      <div class="address-box">
        <h4>Billed To</h4>
        <p><strong>${address?.full_name || ''}</strong><br/>${address?.address || ''}<br/>${address?.mobile || ''}</p>
      </div>
    </div>
    <table>
      <thead><tr><th>#</th><th>Product</th><th>Qty</th><th>MRP</th><th>Discount</th><th>Amount</th></tr></thead>
      <tbody>${rows}</tbody>
    </table>
    <div class="summary">
      <div class="summary-row"><span>Subtotal (MRP)</span><span>৳ ${mrpTotal.toFixed(2)}</span></div>
      ${discountTotal > 0 ? `<div class="summary-row discount"><span>Discount applied</span><span>-৳ ${discountTotal.toFixed(2)}</span></div>` : ''}
      <div class="summary-row total"><span>Amount Payable</span><span>৳ ${finalTotal.toFixed(2)}</span></div>
    </div>
    <div class="footer">Thank you for shopping with OusadBazar &bull; Order Code: #${order.sale_code}</div>
    </body></html>`;

    const win = window.open('', '_blank');
    if (!win) return;
    win.document.write(html);
    win.document.close();
    win.onload = () => { win.print(); };
  };

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
          className="relative hidden bg-white rounded-2xl shadow-lg shadow-gray-200/50 border border-gray-100 p-2 mb-6 md:mb-8 items-center gap-2"
        >
          <div className="relative flex-1">
            <Icon
              icon="mdi:magnify"
              className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none"
            />
            <input
              type="text"
              className="w-full pl-11 pr-4 py-3 bg-transparent text-gray-900 focus:outline-none placeholder-gray-400 text-sm md:text-base"
              placeholder="e.g. 191"
              value={orderId}
              onChange={(e) => setOrderId(e.target.value)}
              required
            />
          </div>
          <button
            type="submit"
            disabled={isLoading || !orderId.trim()}
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
                setOrderId("");
                setSubmittedId("");
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
                  {orderStatus.suspend_request ? (
                    <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-amber-100 text-xs font-semibold text-amber-700 border border-amber-200">
                      <Icon icon="mdi:clock-outline" className="w-3.5 h-3.5" />
                      Order Cancel
                    </span>
                  ) : orderStatus.verify_status === 0 ? (
                    <Popconfirm
                      title="Cancel this order?"
                      description="Are you sure you want to cancel this order? This action cannot be undone."
                      okText="Yes, Cancel"
                      cancelText="No"
                      okButtonProps={{ danger: true }}
                      placement="bottomRight"
                      onConfirm={() => cancelOrder(orderStatus.id)}
                    >
                      <button
                        type="button"
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-red-50 border border-red-300 text-xs font-semibold text-red-600 hover:bg-red-100 active:scale-95 transition-all"
                      >
                        <Icon icon="mdi:close-circle-outline" className="w-3.5 h-3.5" />
                        Cancel Order
                      </button>
                    </Popconfirm>
                  ) : null}
                </div>
              </div>

              <div className="divide-y divide-gray-100">
                <div className="px-5 md:px-6 py-4 flex items-center justify-between">
                  <span className="flex items-center gap-2 text-sm text-gray-500">
                    <Icon icon="mdi:information-outline" className="w-4 h-4" />
                    Current Status
                  </span>
                  {orderStatus.suspend_request ? (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ring-1 ring-inset bg-red-50 text-red-700 ring-red-200">
                      <Icon icon="mdi:close-circle-outline" className="w-3.5 h-3.5" />
                      Cancelled
                    </span>
                  ) : (
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
                  )}
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
            {!orderStatus.suspend_request && <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 md:p-6">
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
            </div>}

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
                {orderStatus.sale_products?.map((product, i) => {
                  const qty = product.total_quantity || product.quantity || 1;
                  const mrpTotal = Number(product.total || 0);
                  const discountAmt = Number(product.discount_amount || 0);
                  const discountedTotal = mrpTotal - discountAmt;
                  const hasDiscount = discountAmt > 0.01;
                  return (
                    <li
                      key={i}
                      className="px-5 md:px-6 py-3.5 flex items-center justify-between gap-3 hover:bg-gray-50/50 transition-colors"
                    >
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center ring-1 ring-gray-100">
                          <Icon icon="mdi:pill" className="w-5 h-5 text-[#012068]/60" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-gray-900 truncate">
                            {product.product_name}
                          </p>
                          <p className="text-xs text-gray-500 mt-0.5">
                            Qty: {qty}
                          </p>
                        </div>
                      </div>
                      <div className="text-right whitespace-nowrap tabular-nums">
                        {hasDiscount && (
                          <p className="text-xs text-gray-400 line-through">৳ {mrpTotal.toFixed(2)}</p>
                        )}
                        <p className="text-sm font-bold text-gray-900">৳ {discountedTotal.toFixed(2)}</p>
                      </div>
                    </li>
                  );
                })}
              </ul>
              <div className="px-5 md:px-6 py-4 bg-gradient-to-r from-[#012068]/5 via-[#13a89e]/5 to-transparent border-t border-gray-100">
                {(() => {
                  const mrpTotal = (orderStatus.sale_products || []).reduce((s, p) => s + Number(p.total || 0), 0);
                  const discountTotal = (orderStatus.sale_products || []).reduce((s, p) => s + Number(p.discount_amount || 0), 0);
                  const hasDiscount = discountTotal > 0.01;
                  return (
                    <div className="space-y-1 mb-2">
                      <div className="flex justify-between text-xs text-gray-500">
                        <span>Subtotal (MRP)</span>
                        <span className="tabular-nums">৳ {mrpTotal.toFixed(2)}</span>
                      </div>
                      {hasDiscount && (
                        <div className="flex justify-between text-xs text-red-500">
                          <span>Discount applied</span>
                          <span className="tabular-nums">-৳ {discountTotal.toFixed(2)}</span>
                        </div>
                      )}
                    </div>
                  );
                })()}
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-gray-900">Total</span>
                  <span className="text-lg md:text-xl font-bold text-[#012068] tabular-nums">
                    ৳ {Number(orderStatus.total).toFixed(2)}
                  </span>
                </div>
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
            {/* Download Invoice */}
            {!orderStatus.suspend_request && (
              <button
                type="button"
                onClick={() => printInvoice(orderStatus)}
                className="w-full flex items-center justify-center gap-2 py-3.5 bg-[#012068] text-white font-semibold rounded-2xl hover:bg-[#012068]/90 active:scale-[0.98] shadow-lg shadow-[#012068]/20 transition-all"
              >
                <Icon icon="mdi:file-download-outline" className="w-5 h-5" />
                Download Invoice
              </button>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
