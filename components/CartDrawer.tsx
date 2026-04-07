"use client";

import { Drawer, Select, Popconfirm } from "antd";
import { Icon } from "@iconify/react";
import { useCartStore } from "@/stores/cartStore";
import { formatNumber, imgBasePharma } from "@/lib/config";
import { calculateStock } from "@/lib/stockUtils";
import { showNotification } from "@/lib/notification";
import { useRouter, usePathname } from "next/navigation";
import type { CartProduct } from "@/types";

interface CartDrawerProps {
  visible: boolean;
  onClose: () => void;
}

export default function CartDrawer({ visible, onClose }: CartDrawerProps) {
  const router = useRouter();
  const pathname = usePathname();
  const cartProduct = useCartStore((s) => s.cartProduct);
  const totalPrice = useCartStore((s) => s.totalPrice);
  const removeProductFromCart = useCartStore((s) => s.removeProductFromCart);
  const calculateTotal = useCartStore((s) => s.calculateTotal);

  const handleGoHome = () => {
    if (pathname === "/") {
      onClose();
    } else {
      router.push("/");
    }
  };

  const handleQuantityChange = (product: CartProduct, selectedQuantity: number, index: number) => {
    const stock = calculateStock(product);
    if (selectedQuantity > stock) {
      showNotification("error", `Only ${stock} items available in stock.`);
      return;
    }
    const packQuantity = product?.product_prices?.pack_quantity || 1;
    const singleQty = selectedQuantity / packQuantity;
    const updatedCart = [...cartProduct];
    updatedCart[index] = {
      ...updatedCart[index],
      total_price: Number(selectedQuantity) * Number(product?.product_prices?.ecom_final_selling_price || 0),
      quantity: Number(selectedQuantity),
      total_quantity: Number(selectedQuantity),
      singleQty,
      selectedQuantity,
    };
    useCartStore.setState({ cartProduct: updatedCart });
    calculateTotal();
  };

  const checkoutHandler = () => {
    if (totalPrice <= 0) {
      showNotification("error", "Your cart is empty. Please add items to proceed to checkout.");
      return;
    }
    onClose();
    router.push("/checkout");
  };

  return (
    <Drawer
      title={`Your Cart (${cartProduct.length})`}
      placement="right"
      closable
      open={visible}
      onClose={onClose}
      width={typeof window !== "undefined" && window.innerWidth < 768 ? "100%" : 400}
    >
      {cartProduct.length === 0 ? (
        <div className="p-6 sm:p-12 text-center">
          <div className="flex flex-col items-center space-y-4">
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gray-100 rounded-full flex items-center justify-center">
              <Icon icon="mdi:cart-outline" className="w-8 h-8 sm:w-10 sm:h-10 text-gray-400" />
            </div>
            <div>
              <h3 className="text-lg sm:text-xl font-medium text-gray-900">Your cart is empty</h3>
              <p className="text-sm sm:text-base text-gray-500 mt-2">Add some products to get started</p>
            </div>
            <button onClick={handleGoHome} className="inline-flex items-center px-3 py-2 sm:px-4 bg-[#388072] text-white rounded-lg hover:bg-[#2d6a5a] transition-colors text-sm sm:text-base">
              <Icon icon="mdi:arrow-left" className="w-4 h-4 mr-2" /> Continue Shopping
            </button>
          </div>
        </div>
      ) : (
        <div className="flex flex-col h-full">
          <div className="flex-1 overflow-y-auto">
            <ul className="space-y-3 pb-4">
              {cartProduct.map((product, index) => (
                <li key={index} className="bg-gray-50 rounded-lg p-3">
                  <div className="flex gap-3">
                    <div className="flex-shrink-0">
                      {product?.product_images && product.product_images.length > 0 ? (
                        <img
                          width={80} height={80}
                          className="object-cover rounded-md"
                          src={`${imgBasePharma}/${product.product_images[0]?.path}`}
                          alt={product.name}
                          onError={(e) => { (e.target as HTMLImageElement).src = "/ousadbazar/images/default.jpg"; }}
                        />
                      ) : (
                        <div className="w-20 h-20 bg-gray-200 rounded-md" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between gap-2 mb-2">
                        <div className="flex-1 min-w-0">
                          <h3 className="text-sm sm:text-base font-medium text-gray-900 truncate" title={product?.name}>{product?.name}</h3>
                          <p className="text-xs text-gray-500 mt-2">Stock: {calculateStock(product)}</p>
                          <p className="text-base sm:text-lg font-semibold text-[#388072]">৳{formatNumber(product?.total_price)}</p>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <Popconfirm title="Remove from cart?" okText="Yes" cancelText="No" placement="topRight" onConfirm={() => removeProductFromCart(index)}>
                            <button type="button" className="p-2 rounded-md hover:bg-red-50 text-red-600 transition-colors">
                              <Icon className="w-5 h-5" icon="mdi:delete-outline" />
                            </button>
                          </Popconfirm>
                        </div>
                      </div>
                      <Select
                        className="w-full"
                        value={product.selectedQuantity}
                        placeholder="Select Quantity"
                        size="small"
                        onChange={(val) => handleQuantityChange(product, val, index)}
                      >
                        {Array.from({ length: Math.floor(calculateStock(product) / (product?.product_prices?.pack_quantity || 1)) }, (_, i) => i + 1).map((i) => (
                          <Select.Option key={i} value={i * (product?.product_prices?.pack_quantity || 1)}>
                            ({i}{product?.product_prices?.ecom_pack_name?.name || " X"}) {product?.category?.name} - {Number(i * Number(product?.product_prices?.ecom_final_selling_price || 0) * Number(product?.product_prices?.pack_quantity || 1)).toFixed(2)} ৳
                          </Select.Option>
                        ))}
                      </Select>
                      <div className="mt-2 text-xs text-gray-600 sm:hidden">Total: {product.quantity} items</div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
          <div className="border-t bg-white pt-4 mt-auto">
            <div className="mb-4 px-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Total Price</span>
                <span className="text-xl font-bold text-gray-900">৳{formatNumber(totalPrice || 0)}</span>
              </div>
            </div>
            <div className="space-y-2 px-3 pb-3">
              <button onClick={checkoutHandler} className="w-full flex items-center justify-center py-3 bg-[#388072] text-white rounded-lg hover:bg-[#2d6a5a] transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed" disabled={cartProduct.length === 0}>
                <Icon icon="mdi:cart-check" className="w-5 h-5 mr-2" /> Proceed to Checkout
              </button>
              <button onClick={handleGoHome} className="w-full py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-gray-700 font-medium">
                Continue Shopping
              </button>
            </div>
          </div>
        </div>
      )}
    </Drawer>
  );
}
