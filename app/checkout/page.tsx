"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Modal } from "antd";
import { Icon } from "@iconify/react";
import { imgBasePharma, asset } from "@/lib/config";
import { useCartStore } from "@/stores/cartStore";
import { useBillingAddressByPhone, useCreateOrder } from "@/lib/hooks/useOrders";
import { showNotification } from "@/lib/notification";
import type { User } from "@/types";

export default function CheckoutPage() {
  const router = useRouter();
  const cartProduct = useCartStore((s) => s.cartProduct);
  const totalPrice = useCartStore((s) => s.totalPrice);
  const resetCart = useCartStore((s) => s.resetCart);

  const storedUser: User | null = typeof window !== "undefined" ? JSON.parse(localStorage.getItem("user") || "null") : null;

  const { mutate: createOrder, isPending: isOrderLoading } = useCreateOrder();
  const [shippingCost] = useState(0);
  const [open, setOpen] = useState(false);
  const [saleCode, setSaleCode] = useState("");

  const [address, setAddress] = useState({
    full_name: storedUser?.name || "",
    mobile: (typeof window !== "undefined" ? localStorage.getItem("mobile")?.replace(/^88/, "") : "") || storedUser?.phone || "",
    address: "",
    country_id: 1, city_id: 1, area_id: 1, note: "",
  });

  const [paymentMethodId, setPaymentMethodId] = useState(1);
  const paymentMethods = [{ id: 1, name: "Cash on delivery" }];

  const validateMobile = (value: string) => {
    const v = String(value ?? "").trim();
    if (!v) return "Mobile number is required";
    if (!v.startsWith("01")) return "Mobile number must start with 01";
    if (!/^\d+$/.test(v)) return "Mobile number must contain only digits";
    if (v.length !== 11) return v.length > 11 ? "Cannot exceed 11 digits" : "Must be 11 digits";
    return "";
  };

  const validationError = useMemo(() => validateMobile(address.mobile), [address.mobile]);
  const isValidMobile = validationError === "";
  const isCartEmpty = cartProduct.length === 0;

  const { data: prefillAddress } = useBillingAddressByPhone(
    isValidMobile ? address.mobile : ""
  );

  useEffect(() => {
    if (!prefillAddress) return;
    setAddress((prev) => ({
      ...prev,
      full_name: prev.full_name || prefillAddress.full_name || "",
      address: prev.address || prefillAddress.address || "",
      country_id: Number(prefillAddress.country_id) || prev.country_id,
      city_id: Number(prefillAddress.city_id) || prev.city_id,
      area_id: Number(prefillAddress.area_id) || prev.area_id,
      note: prev.note || prefillAddress.notes || "",
    }));
  }, [prefillAddress]);

  const onlyNumber = (value: string) => {
    let v = value.replace(/\D/g, "");
    if (v.length > 11) v = v.slice(0, 11);
    setAddress((prev) => ({ ...prev, mobile: v }));
  };

  const submitOrder = () => {
    if (!address.full_name) return showNotification("warning", "Name is required");
    if (!address.mobile) return showNotification("warning", "Mobile number is required");
    if (!address.address) return showNotification("warning", "Address is required");

    const payload = {
      sale_products: cartProduct.map((item) => ({
        product_id: item.id || "", product_name: item.name || "",
        price: Number(item?.product_prices?.ecom_final_selling_price || item?.price || 0),
        quantity: item.singleQty || 1,
        pack_size_id: item?.product_prices?.pack_size_id || item?.pack_size?.id || "",
        pack_size_quantity: Number(item?.product_prices?.pack_quantity || item?.pack_size?.quantity || 1),
        total_quantity: Number(item?.quantity || 0), total: Number(item?.total_price || 0),
      })),
      sub_total: Number(totalPrice || 0),
      total: Number(totalPrice || 0) + Number(shippingCost || 0),
      phone: `88${address.mobile}`,
      shipping_cost: Number(shippingCost || 0),
      billing_address: address,
      user: storedUser ? { id: storedUser.id } : { id: 1 },
      payment_method_id: paymentMethodId,
    };

    createOrder(payload, {
      onSuccess: (data) => {
        if (data?.message) {
          setSaleCode(data?.saleCode || data?.sale_code || "");
          resetCart();
          setOpen(true);
        }
      },
      onError: (error) => {
        console.error(error);
      },
    });
  };

  return (
    <>
      <div className="min-h-screen py-6">
        <div className="max-w-2xl mx-auto px-4 md:px-0">
          <section className="mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-5 border-b pb-3">Billing details</h2>
            <div className="space-y-4">
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Your Name <span className="text-red-500">*</span></label>
                <input type="text" className="w-full bg-white text-gray-900 border border-gray-300 rounded px-4 py-3 text-sm focus:ring-2 focus:ring-[#012068] outline-none transition" placeholder="আপনার নাম" value={address.full_name} onChange={(e) => setAddress((p) => ({ ...p, full_name: e.target.value }))} /></div>
                {/* your area */}
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Your Area <span className="text-red-500">*</span></label>
                <select className="w-full bg-white text-gray-900 border border-gray-300 rounded px-4 py-3 text-sm focus:ring-2 focus:ring-[#012068] outline-none transition" value={address.area_id} onChange={(e) => setAddress((p) => ({ ...p, area_id: Number(e.target.value) }))}>
                  <option value={1}>Aftabnagar</option>
                </select></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Your Full Address <span className="text-red-500">*</span></label>
                <input type="text" className="w-full bg-white text-gray-900 border border-gray-300 rounded px-4 py-3 text-sm focus:ring-2 focus:ring-[#012068] outline-none transition" placeholder="আপনার পূর্ণ ঠিকানা" value={address.address} onChange={(e) => setAddress((p) => ({ ...p, address: e.target.value }))} readOnly={!!storedUser} /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Your Phone Number <span className="text-red-500">*</span></label>
                <input type="tel" className={`w-full bg-white text-gray-900 border border-gray-300 rounded px-4 py-3 text-sm focus:ring-2 focus:ring-[#012068] outline-none transition ${!isValidMobile && address.mobile ? "border-red-400" : ""}`} placeholder="আপনার মোবাইল নম্বর" value={address.mobile} onChange={(e) => onlyNumber(e.target.value)} />
                {!isValidMobile && address.mobile && <p className="text-red-500 text-xs mt-1">{validationError}</p>}</div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Notes (Optional)</label>
                <input className="w-full bg-white text-gray-900 border border-gray-300 rounded px-4 py-3 text-sm focus:ring-2 focus:ring-[#012068] outline-none transition" placeholder="অর্ডার নোট..." value={address.note} onChange={(e) => setAddress((p) => ({ ...p, note: e.target.value }))} /></div>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-5 border-b pb-3">Your order</h2>
            <div className="border border-gray-200 rounded overflow-hidden">
              <div className="flex justify-between items-center px-4 py-3 bg-gray-50 border-b border-gray-200"><span className="text-sm font-semibold text-gray-700">Product</span><span className="text-sm font-semibold text-gray-700">Subtotal</span></div>
              {cartProduct.map((item, index) => (
                <div key={index} className="flex items-center justify-between px-4 py-3 border-b border-gray-100 gap-4">
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    <div className="w-16 h-16 flex-shrink-0 bg-gray-50 rounded border border-gray-200 overflow-hidden">
                      {item?.product_images && item.product_images.length > 0 ? (
                        <img width={64} height={64} className="w-full h-full object-cover" src={`${imgBasePharma}/${item.product_images[0]?.path}`} alt={item.name} onError={(e) => { (e.target as HTMLImageElement).src = asset("/images/default.png"); }} />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center"><Icon icon="mdi:image-off" className="w-6 h-6 text-gray-400" /></div>
                      )}
                    </div>
                    <div className="min-w-0"><p className="text-sm text-gray-800 truncate">{item?.name}</p><p className="text-xs text-gray-500 mt-0.5">× {item?.singleQty || 1}</p></div>
                  </div>
                  <div className="text-right whitespace-nowrap">
                    {(item?.total_previous_price || 0) > (item?.total_price || 0) && (
                      <p className="text-xs text-gray-400 line-through">৳ {Number(item?.total_previous_price || 0).toFixed(2)}</p>
                    )}
                    <span className="text-sm font-medium text-gray-900">৳ {Number(item?.total_price || 0).toFixed(2)}</span>
                  </div>
                </div>
              ))}
              {(() => {
                const mrpTotal = cartProduct.reduce((sum, p) => sum + (p?.total_previous_price || p?.total_price || 0), 0);
                const discountTotal = mrpTotal - (totalPrice || 0);
                const hasAnyDiscount = discountTotal > 0.01;
                return (
                  <>
                    <div className="flex justify-between items-center px-4 py-3 border-b border-dashed border-gray-300"><span className="text-sm text-[#012068] font-medium">Subtotal (MRP)</span><span className="text-sm font-semibold text-gray-900">৳ {mrpTotal.toFixed(2)}</span></div>
                    {hasAnyDiscount && (
                      <div className="flex justify-between items-center px-4 py-3 border-b border-dashed border-gray-300"><span className="text-sm text-red-500 font-medium">Discount applied</span><span className="text-sm font-semibold text-red-500">-৳ {discountTotal.toFixed(2)}</span></div>
                    )}
                    <div className="flex justify-between items-center px-4 py-3 bg-gray-50"><span className="text-base font-bold text-gray-900">Total</span><span className="text-lg font-bold text-[#012068]">৳ {Number((Number(totalPrice) || 0) + (Number(shippingCost) || 0)).toFixed(2)}</span></div>
                  </>
                );
              })()}
            </div>
          </section>

          <section className="mb-8">
            {paymentMethods.map((method) => (
              <div key={method.id} className="mb-2" onClick={() => setPaymentMethodId(method.id)}>
                <div className={`flex items-center gap-3 px-4 py-3 border rounded cursor-pointer transition ${paymentMethodId === method.id ? "border-[#012068] bg-[#012068]/5" : "border-gray-200"}`}>
                  <input type="radio" name="payment" checked={paymentMethodId === method.id} onChange={() => setPaymentMethodId(method.id)} className="w-4 h-4 accent-[#012068]" />
                  <span className="text-sm font-medium text-gray-800">{method.name} (Pay with cash upon delivery.)</span>
                </div>
              </div>
            ))}
          </section>

          <button type="button" disabled={isCartEmpty} className={`w-full text-white font-bold py-4 rounded-lg shadow-md transition-all duration-200 flex items-center justify-center gap-2 text-base active:scale-[0.98] ${isCartEmpty ? "bg-gray-400 cursor-not-allowed" : "bg-[#012068] cursor-pointer"}`} onClick={submitOrder}>
            <Icon icon="mdi:lock" className="w-5 h-5" />
            <span>Place Order ৳ {Number((Number(totalPrice) || 0) + (Number(shippingCost) || 0)).toFixed(2)}</span>
            {isOrderLoading && <Icon icon="nonicons:loading-16" className="w-5 h-5 animate-spin" />}
          </button>
        </div>
      </div>

      <Modal open={open} title={null} footer={null} centered width={520} onCancel={() => router.push("/")}
        styles={{ body: { padding: 0 } }}
      >
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#f8fbff] via-white to-[#eef4ff] px-6 py-8 text-center">
         
          <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-[#012068]/10 ring-8 ring-[#012068]/5">
            <Icon icon="material-symbols:check-circle-rounded" className="h-14 w-14 text-[#012068]" />
          </div>
          <span className="inline-flex items-center rounded-full bg-[#012068]/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-[#012068]">
            Order Confirmed
          </span>
          <h1 className="mt-4 text-3xl font-bold text-gray-900">Your order has been placed</h1>
          <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-gray-600">
            We have received your order successfully. Your order information has been sent to your number by SMS.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <button onClick={() => router.push("/order-history")} className="inline-flex items-center justify-center rounded-xl bg-[#012068] px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-[#012068]/20 transition-transform duration-200 hover:-translate-y-0.5">
              Check your order history
            </button>
            <button onClick={() => router.push("/")} className="inline-flex items-center justify-center rounded-xl border border-[#012068]/20 bg-white px-6 py-3 text-sm font-semibold text-[#012068] transition-colors duration-200 hover:bg-[#012068]/5">
              Continue Shopping
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
}
