'use client';

import { Drawer, Popconfirm } from 'antd';
import { Icon } from '@iconify/react';
import { useCartStore } from '@/stores/cartStore';
import { formatNumber, imgBasePharma, asset } from '@/lib/config';
import { calculateStock } from '@/lib/stockUtils';
import { useRouter, usePathname } from 'next/navigation';
import type { CartProduct } from '@/types';

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
    if (pathname === '/') {
      onClose();
    } else {
      router.push('/');
    }
  };

  const handleIncrease = (product: CartProduct, index: number) => {
    const stock = calculateStock(product);
    const currentQty = product.quantity || 1;
    if (currentQty >= stock) return;

    const newQty = currentQty + 1;
    const packQty = Number(
      product?.packsize_quantity || product?.product_prices?.pack_quantity || 1
    );
    const packPrice = Number(
      product?.product_prices?.ecom_final_selling_price || product?.selling_price || 0
    );
    const perPiecePrice = packPrice / packQty;

    const updatedCart = [...cartProduct];
    updatedCart[index] = {
      ...updatedCart[index],
      quantity: newQty,
      total_quantity: newQty,
      selectedQuantity: newQty,
      price: perPiecePrice,
      total_price: perPiecePrice * newQty,
    };
    useCartStore.setState({ cartProduct: updatedCart });
    calculateTotal();
  };

  const handleDecrease = (product: CartProduct, index: number) => {
    const currentQty = product.quantity || 1;
    if (currentQty <= 1) {
      removeProductFromCart(index);
      return;
    }

    const newQty = currentQty - 1;
    const packQty = Number(
      product?.packsize_quantity || product?.product_prices?.pack_quantity || 1
    );
    const packPrice = Number(
      product?.product_prices?.ecom_final_selling_price || product?.selling_price || 0
    );
    const perPiecePrice = packPrice / packQty;

    const updatedCart = [...cartProduct];
    updatedCart[index] = {
      ...updatedCart[index],
      quantity: newQty,
      total_quantity: newQty,
      selectedQuantity: newQty,
      price: perPiecePrice,
      total_price: perPiecePrice * newQty,
    };
    useCartStore.setState({ cartProduct: updatedCart });
    calculateTotal();
  };

  const checkoutHandler = () => {
    if (totalPrice <= 0) return;
    onClose();
    router.push('/checkout');
  };

  return (
    <Drawer
      title={
        <div className="flex items-center gap-2 ">
          <div className="relative">
            <Icon icon="mdi:cart-outline" className="w-5 h-5 text-[#012068]" />
            {cartProduct.length > 0 && (
              <span className="absolute -top-1.5 -right-1.5 min-w-[16px] h-4 px-1 bg-[#13a89e] text-white text-[9px] font-bold rounded-full flex items-center justify-center ring-2 ring-white">
                {cartProduct.length}
              </span>
            )}
          </div>
          <span className="font-semibold text-gray-900">Your Cart</span>
        </div>
      }
      placement="right"
      closable
      open={visible}
      onClose={onClose}
      width={typeof window !== 'undefined' && window.innerWidth < 768 ? '100%' : 420}
      styles={{
        wrapper: { borderTopLeftRadius: 16, borderBottomLeftRadius: 16, overflow: 'hidden' },
        content: { borderTopLeftRadius: 16, borderBottomLeftRadius: 16 },
        body: { padding: 0 },
        header: { borderBottom: '1px solid #f0f0f0', borderTopLeftRadius: 16 },
      }}
    >
      {cartProduct.length === 0 ? (
        <div className="p-6 sm:p-12 text-center h-full flex items-center justify-center">
          <div className="flex flex-col items-center space-y-4">
            <div className="relative w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br from-gray-50 to-gray-100 rounded-full flex items-center justify-center shadow-inner">
              <Icon icon="mdi:cart-outline" className="w-10 h-10 sm:w-12 sm:h-12 text-gray-400" />
              <span className="absolute -top-1 -right-1 w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center text-xs text-gray-500 font-semibold">
                0
              </span>
            </div>
            <div>
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900">Your cart is empty</h3>
              <p className="text-sm sm:text-base text-gray-500 mt-2">
                Add some products to get started
              </p>
            </div>
            <button
              onClick={handleGoHome}
              className="inline-flex items-center px-4 py-2.5 sm:px-5 bg-[#012068] text-white rounded-xl hover:bg-[#012068]/90 active:scale-95 shadow-md shadow-[#012068]/20 transition-all text-sm sm:text-base font-medium"
            >
              <Icon icon="mdi:arrow-left" className="w-4 h-4 mr-2" />
              Continue Shopping
            </button>
          </div>
        </div>
      ) : (
        <div className="flex flex-col h-full">
          <div className="flex-1 overflow-y-auto px-5 py-4 bg-gradient-to-b from-gray-50/60 to-white">
            <ul className="space-y-3">
              {cartProduct.map((product, index) => {
                const stock = calculateStock(product);
                const qty = product.quantity || 1;
                const packQty = Number(
                  product?.packsize_quantity || product?.product_prices?.pack_quantity || 1
                );
                const packPrice = Number(
                  product?.product_prices?.ecom_final_selling_price || product?.selling_price || 0
                );
                const perPiecePrice = packPrice / packQty;
                const totalItemPrice = perPiecePrice * qty;
                const isLowStock = stock > 0 && stock <= 5;

                return (
                  <li
                    key={index}
                    className="group relative bg-white border border-gray-100 rounded-2xl p-3 shadow-sm hover:shadow-md hover:border-[#012068]/20 transition-all duration-200"
                  >
                    <div className="flex gap-3">
                      {/* Image */}
                      <div className="relative flex-shrink-0">
                        <div className="w-[76px] h-[76px] rounded-xl overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100 ring-1 ring-gray-100">
                          {product?.product_images && product.product_images.length > 0 ? (
                            <img
                              width={76}
                              height={76}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                              src={`${imgBasePharma}/${product.product_images[0]?.path}`}
                              alt={product.name}
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = asset('/images/default.jpg');
                              }}
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Icon
                                icon="mdi:pill"
                                className="w-8 h-8 text-gray-300"
                              />
                            </div>
                          )}
                        </div>
                        {qty > 1 && (
                          <span className="absolute -top-1.5 -right-1.5 min-w-[20px] h-[20px] px-1 rounded-full bg-[#012068] text-white text-[10px] font-bold flex items-center justify-center shadow-md ring-2 ring-white">
                            {qty}
                          </span>
                        )}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0 flex flex-col">
                        <div className="flex justify-between items-start gap-2">
                          <h3
                            className="text-[13px] font-semibold text-gray-900 line-clamp-2 leading-snug pr-1"
                            title={product?.name}
                          >
                            {product?.name}
                          </h3>
                          <Popconfirm
                            title="Remove from cart?"
                            okText="Yes"
                            cancelText="No"
                            placement="topRight"
                            onConfirm={() => removeProductFromCart(index)}
                          >
                            <button
                              type="button"
                              aria-label="Remove item"
                              className="p-1.5 -mt-0.5 -mr-1 rounded-lg hover:bg-red-50 text-gray-300 hover:text-red-500 transition-colors flex-shrink-0"
                            >
                              <Icon className="w-4 h-4" icon="mdi:close" />
                            </button>
                          </Popconfirm>
                        </div>

                        <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                          <span className="text-[11px] text-gray-500 font-medium">
                            ৳{perPiecePrice.toFixed(2)}
                            <span className="text-gray-400 font-normal">/pcs</span>
                          </span>
                          <span className="w-1 h-1 rounded-full bg-gray-300" />
                          {isLowStock ? (
                            <span className="inline-flex items-center gap-1 text-[10px] font-medium text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded-md">
                              <Icon icon="mdi:alert-circle" className="w-3 h-3" />
                              Only {stock} left
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[10px] font-medium text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded-md">
                              <Icon icon="mdi:check-circle" className="w-3 h-3" />
                              In stock
                            </span>
                          )}
                        </div>

                        {/* Counter + Price row */}
                        <div className="flex items-center justify-between mt-auto pt-2.5">
                          {/* Counter */}
                          <div className="inline-flex items-center rounded-full bg-gray-50 border border-gray-150 p-0.5 shadow-inner">
                            <button
                              onClick={() => handleDecrease(product, index)}
                              aria-label={qty <= 1 ? 'Remove item' : 'Decrease quantity'}
                              className="flex h-7 w-7 items-center justify-center rounded-full bg-white text-gray-600 shadow-sm hover:text-red-500 hover:bg-red-50 active:scale-90 transition-all"
                            >
                              <Icon
                                icon={qty <= 1 ? 'mdi:delete-outline' : 'ic:sharp-minus'}
                                className="h-3.5 w-3.5"
                              />
                            </button>
                            <span className="w-9 text-center text-[13px] font-bold text-gray-800 tabular-nums">
                              {qty}
                            </span>
                            <button
                              onClick={() => handleIncrease(product, index)}
                              disabled={qty >= stock}
                              aria-label="Increase quantity"
                              className="flex h-7 w-7 items-center justify-center rounded-full bg-white text-gray-600 shadow-sm hover:text-[#13a89e] hover:bg-[#13a89e]/10 active:scale-90 transition-all disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:text-gray-600"
                            >
                              <Icon icon="mingcute:add-line" className="h-3.5 w-3.5" />
                            </button>
                          </div>

                          {/* Total price */}
                          <div className="text-right">
                            <span className="text-[15px] font-bold text-[#012068] tabular-nums">
                              ৳{totalItemPrice.toFixed(2)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Footer */}
          <div className="border-t border-gray-100 bg-white px-5 pt-4 pb-4 shadow-[0_-4px_12px_-4px_rgba(0,0,0,0.05)]">
            <div className="mb-3 space-y-1.5">
              <div className="flex justify-between items-center text-[13px] text-gray-500">
                <span>Subtotal ({cartProduct.length} items)</span>
                <span className="font-medium text-gray-700 tabular-nums">
                  ৳{formatNumber(totalPrice || 0)}
                </span>
              </div>
              <div className="flex justify-between items-center pt-2 border-t border-dashed border-gray-200">
                <span className="text-gray-900 font-semibold">Total</span>
                <span className="text-xl font-bold text-[#012068] tabular-nums">
                  ৳{formatNumber(totalPrice || 0)}
                </span>
              </div>
            </div>
            <div className="space-y-2">
              <button
                onClick={checkoutHandler}
                disabled={cartProduct.length === 0}
                className="w-full group flex items-center justify-center py-3 bg-[#012068] text-white rounded-xl hover:bg-[#012068]/90 active:scale-[0.98] shadow-lg shadow-[#012068]/20 transition-all font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Icon icon="mdi:cart-check" className="w-5 h-5 mr-2" />
                Proceed to Checkout
                <Icon
                  icon="mdi:arrow-right"
                  className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform"
                />
              </button>
              <button
                onClick={handleGoHome}
                className="w-full py-2.5 border border-gray-200 rounded-xl hover:bg-gray-50 hover:border-gray-300 active:scale-[0.98] transition-all text-gray-600 font-medium text-sm"
              >
                Continue Shopping
              </button>
            </div>
          </div>
        </div>
      )}
    </Drawer>
  );
}
