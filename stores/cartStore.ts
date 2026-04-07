import { create } from "zustand";
import { persist } from "zustand/middleware";
import { showNotification } from "@/lib/notification";
import type { CartProduct, Product } from "@/types";

interface CartState {
  isLoading: boolean;
  cartProduct: CartProduct[];
  cuPon: number;
  isOrderDone: boolean;
  totalPrice: number;
  calculatePreviousTotal: (actual_price: number, quantity: number) => number;
  calculateTotal: () => void;
  getCart: (product: Product, quantity: number, singleQty: number) => boolean;
  removeProductFromCart: (index: number) => void;
  resetCart: () => void;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      isLoading: false,
      cartProduct: [],
      cuPon: 0,
      isOrderDone: false,
      totalPrice: 0,

      calculatePreviousTotal: (actual_price: number, quantity: number) => {
        return actual_price * quantity;
      },

      calculateTotal: () => {
        const { cartProduct } = get();
        const totalPrice = cartProduct.reduce((sum, product) => {
          return sum + (product?.total_price || 0);
        }, 0);
        set({ totalPrice });
      },

      getCart: (product: Product, quantity: number, singleQty: number) => {
        const token =
          typeof window !== "undefined"
            ? localStorage.getItem("token")
            : null;
        if (!token) {
          showNotification(
            "warning",
            "Please login first to add items to cart"
          );
          return false;
        }

        const { cartProduct, calculateTotal } = get();

        let normalizedProduct = { ...product };
        if (
          (!normalizedProduct?.product_images ||
            normalizedProduct.product_images.length === 0) &&
          normalizedProduct?.path
        ) {
          normalizedProduct = {
            ...normalizedProduct,
            product_images: [{ path: normalizedProduct.path }],
          };
        }

        const price = Number(
          normalizedProduct?.product_prices?.ecom_final_selling_price || 0
        );
        const actual_price = Number(
          normalizedProduct?.product_prices?.selling_price || 0
        );
        const total_previous_price = actual_price * quantity;

        const index = cartProduct.findIndex(
          (item) => item?.id == normalizedProduct?.id
        );

        if (index !== -1) {
          showNotification(
            "info",
            `${normalizedProduct?.name} updated to cart!`
          );
          const updatedCart = [...cartProduct];
          updatedCart[index] = {
            ...updatedCart[index],
            quantity,
            singleQty,
            total_quantity: quantity,
            price,
            total_price: price * quantity,
            total_previous_price,
            selectedQuantity: quantity,
          };
          set({ cartProduct: updatedCart });
        } else {
          const newItem: CartProduct = {
            ...normalizedProduct,
            quantity,
            singleQty,
            total_quantity: quantity,
            price,
            total_price: price * quantity,
            total_previous_price,
            selectedQuantity: quantity,
          } as CartProduct;
          set({ cartProduct: [newItem, ...cartProduct] });
          showNotification(
            "success",
            `${normalizedProduct?.name} added to cart!`
          );
        }

        calculateTotal();
        return true;
      },

      removeProductFromCart: (index: number) => {
        const { cartProduct, calculateTotal } = get();
        const updatedCart = cartProduct.filter((_, i) => i !== index);
        set({ cartProduct: updatedCart });
        calculateTotal();
        showNotification("success", "Item removed from cart!");
      },

      resetCart: () => {
        set({
          cartProduct: [],
          totalPrice: 0,
          isOrderDone: false,
          cuPon: 0,
        });
      },
    }),
    {
      name: "cart-storage",
    }
  )
);
