import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { cartApi } from './api';

interface CartItem {
  id: number;
  product_id: number;
  name: string;
  slug: string;
  sku: string;
  price: number;
  sale_price?: number;
  qty: number;
  subtotal: number;
  image?: string;
  stock: number;
}

interface CartStore {
  items: CartItem[];
  sessionToken: string | null;
  subtotal: number;
  deliveryFee: number;
  discount: number;
  total: number;
  vatAmount: number;
  coupon: any | null;
  isOpen: boolean;
  isLoading: boolean;
  fetchCart: () => Promise<void>;
  addItem: (productId: number, qty: number) => Promise<void>;
  updateItem: (id: number, qty: number) => Promise<void>;
  removeItem: (id: number) => Promise<void>;
  applyCoupon: (code: string) => Promise<void>;
  removeCoupon: () => Promise<void>;
  openCart: () => void;
  closeCart: () => void;
  clearLocalCart: () => void;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      sessionToken: null,
      subtotal: 0,
      deliveryFee: 0,
      discount: 0,
      total: 0,
      vatAmount: 0,
      coupon: null,
      isOpen: false,
      isLoading: false,

      fetchCart: async () => {
        try {
          set({ isLoading: true });
          const res = await cartApi.getCart();
          const { items, subtotal, delivery_fee, discount, total, vat_amount, coupon, session_token } = res.data.data;
          set({
            items,
            subtotal,
            deliveryFee: delivery_fee,
            discount,
            total,
            vatAmount: vat_amount,
            coupon,
            sessionToken: session_token,
            isLoading: false,
          });
          if (session_token) localStorage.setItem('cart_session_token', session_token);
        } catch {
          set({ isLoading: false });
        }
      },

      addItem: async (productId, qty) => {
        await cartApi.addItem(productId, qty);
        await get().fetchCart();
        set({ isOpen: true });
      },

      updateItem: async (id, qty) => {
        await cartApi.updateItem(id, qty);
        await get().fetchCart();
      },

      removeItem: async (id) => {
        await cartApi.removeItem(id);
        await get().fetchCart();
      },

      applyCoupon: async (code) => {
        await cartApi.applyCoupon(code);
        await get().fetchCart();
      },

      removeCoupon: async () => {
        await cartApi.removeCoupon();
        await get().fetchCart();
      },

      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),
      clearLocalCart: () => set({ items: [], subtotal: 0, total: 0, coupon: null }),
    }),
    { name: 'techno-cart', partialize: (state) => ({ sessionToken: state.sessionToken }) }
  )
);
