"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Select, Popconfirm } from "antd";
import { Icon } from "@iconify/react";
import { useCartStore } from "@/stores/cartStore";
import { formatNumber, imgBasePharma } from "@/lib/config";
import { calculateStock } from "@/lib/stockUtils";
import { showNotification } from "@/lib/notification";
import type { CartProduct } from "@/types";

export default function CartPage() {
  const router = useRouter();
  const cartProduct = useCartStore((s) => s.cartProduct);
  const totalPrice = useCartStore((s) => s.totalPrice);
  const removeProductFromCart = useCartStore((s) => s.removeProductFromCart);
  const calculateTotal = useCartStore((s) => s.calculateTotal);

  const handleQuantityChange = (product: CartProduct, selectedQuantity: number, index: number) => {
    const stock = calculateStock(product);
    if (selectedQuantity > stock) { showNotification("error", `Only ${stock} items available in stock.`); return; }
    const updatedCart = [...cartProduct];
    updatedCart[index] = { ...updatedCart[index], total_price: Number(selectedQuantity) * Number(product?.price || 0), quantity: Number(selectedQuantity), total_quantity: Number(selectedQuantity), selectedQuantity };
    useCartStore.setState({ cartProduct: updatedCart });
    calculateTotal();
  };

  const checkoutHandler = (e: React.MouseEvent) => {
    if (totalPrice <= 0) { e.preventDefault(); showNotification("error", "Your cart is empty."); }
  };

  return (
    <div className="min-h-screen">
      <div className="bg-white dark:bg-gray-900"><div className="container mx-auto">
        <nav className="flex items-center space-x-2 text-sm">
          <Link href="/" className="flex items-center text-gray-500 hover:text-blue-600 transition-colors"><Icon className="w-4 h-4 mr-2" icon="mdi:home" /> Home</Link>
          <Icon icon="mdi:chevron-right" className="w-4 h-4 text-gray-400" />
          <span className="text-gray-800 font-medium">Shopping Cart</span>
        </nav>
      </div></div>

      <div className="mx-auto my-4 container px-3 md:px-0">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-3">
            <div className="bg-white dark:bg-gray-800 overflow-hidden">
              <div className="px-6 py-2 border-b border-gray-200 bg-[#388072] rounded">
                <h2 className="text-lg font-semibold text-white flex items-center">
                  <Icon icon="mdi:format-list-bulleted" className="w-5 h-5 mr-2 text-white" /> Cart Items ({cartProduct.length})
                </h2>
              </div>

              {cartProduct.length === 0 ? (
                <div className="p-12 text-center">
                  <div className="flex flex-col items-center space-y-4">
                    <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center"><Icon icon="mdi:cart-outline" className="w-10 h-10 text-gray-400" /></div>
                    <div><h3 className="text-xl font-medium text-gray-900">Your cart is empty</h3><p className="text-gray-500 mt-2">Add some products to get started</p></div>
                    <Link href="/" className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"><Icon icon="mdi:arrow-left" className="w-4 h-4 mr-2" /> Continue Shopping</Link>
                  </div>
                </div>
              ) : (
                <div className="divide-y divide-gray-200 dark:divide-gray-700">
                  {cartProduct.map((product, index) => (
                    <div key={index} className="py-2 transition-colors">
                      <div className="flex items-start space-x-4">
                        <div className="flex-shrink-0">
                          <div className="w-20 h-20 bg-gray-100 rounded-lg border border-gray-200 overflow-hidden">
                            {product?.product_images && product.product_images.length > 0 ? (
                              <img width={80} height={80} className="w-full h-full object-cover" src={`${imgBasePharma}/${product.product_images[0]?.path}`} alt={product.name} onError={(e) => { (e.target as HTMLImageElement).src = "/ousadbazar/images/default.jpg"; }} />
                            ) : product?.path ? (
                              <img width={80} height={80} className="w-full h-full object-cover" src={`${imgBasePharma}/${product.path}`} alt={product.name} onError={(e) => { (e.target as HTMLImageElement).src = "/ousadbazar/images/default.jpg"; }} />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center"><Icon icon="mdi:image-off" className="w-8 h-8 text-gray-400" /></div>
                            )}
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                            <div className="md:col-span-2">
                              <h3 className="text-lg font-semibold text-gray-900 mb-1 truncate" title={product?.name}>{product?.name && product.name.length > 30 ? product.name.slice(0, 30) + "..." : product?.name}</h3>
                              <p className="text-sm text-gray-500">Available Qty: {product?.stock_batches?.[0]?.balanced_quantity || 0}</p>
                              <div className="flex items-center space-x-2"><Icon icon="mdi:currency-bdt" className="w-4 h-4 text-gray-500" /><span className="text-lg font-semibold text-blue-600">{Number(product?.product_prices?.ecom_final_selling_price).toFixed(2)}</span><span className="text-sm text-gray-500">per unit</span></div>
                            </div>
                            <div className="flex flex-col space-y-2">
                              <label className="text-sm font-medium text-gray-700">Strip</label>
                              <Select className="w-[180px] md:w-[200px]" value={product.selectedQuantity} placeholder="Select Quantity" onChange={(val) => handleQuantityChange(product, val, index)}>
                                {Array.from({ length: Math.floor(calculateStock(product) / (product?.product_prices?.pack_quantity || 1)) }, (_, i) => i + 1).map((i) => (
                                  <Select.Option key={i} value={i * (product?.product_prices?.pack_quantity || 1)}>
                                    {i} x {Number(product?.product_prices?.pack_quantity)} {product?.category?.name} - ৳{Number(i * Number(product?.product_prices?.ecom_final_selling_price) * Number(product?.product_prices?.pack_quantity)).toFixed(0)}
                                  </Select.Option>
                                ))}
                              </Select>
                            </div>
                            <div className="flex flex-col justify-between space-y-4">
                              <div className="text-right"><div className="text-sm text-gray-500 mb-1">Total Qty: {product.quantity}</div><div className="text-xl font-bold text-gray-900">৳{formatNumber(product?.total_price)}</div></div>
                            </div>
                          </div>
                        </div>
                        <div className="flex justify-end mt-2">
                          <Popconfirm title="Remove this item from cart?" okText="Yes" cancelText="No" onConfirm={() => removeProductFromCart(index)}>
                            <button className="inline-flex items-center px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"><Icon icon="mdi:delete" className="w-4 h-4 mr-1" /> Remove</button>
                          </Popconfirm>
                        </div>
                      </div>
                    </div>
                  ))}
                  <div className="p-4">
                    <div className="space-y-4 mb-6">
                      <div className="flex justify-end items-center gap-4">
                        <span className="text-lg font-semibold text-gray-900">Total:</span>
                        <span className="text-2xl font-semibold">৳{formatNumber(totalPrice || 0)}</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-end gap-2">
                      <Link href="/"><button className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2"><Icon icon="mdi:arrow-left" className="w-4 h-4" /><span>Continue Shopping</span></button></Link>
                      <Link href="/checkout"><button onClick={checkoutHandler} className={`flex items-center justify-center space-x-2 py-2 px-4 bg-[#388072] text-white rounded-lg ${cartProduct.length === 0 ? "opacity-50 cursor-not-allowed" : ""}`} disabled={cartProduct.length === 0}><Icon icon="mdi:arrow-right" className="w-4 h-4" /><span>Proceed to Checkout</span></button></Link>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
