import { create } from 'zustand';
import type { Product } from '../data/catalog';
import { getProductById } from '../data/catalog';

const CART_STORAGE_KEY = 'pcbuilder-cart';

interface CartItem {
  product: Product;
  quantity: number;
}

interface StoredCartItem {
  productId: string;
  quantity: number;
}

const readCart = (): CartItem[] => {
  if (typeof window === 'undefined') {
    return [];
  }

  try {
    const raw = window.localStorage.getItem(CART_STORAGE_KEY);
    if (!raw) {
      return [];
    }

    const parsed = JSON.parse(raw) as StoredCartItem[];
    return parsed
      .map(({ productId, quantity }) => {
        const product = getProductById(productId);
        if (!product) {
          return null;
        }

        return {
          product,
          quantity,
        };
      })
      .filter((item): item is CartItem => item !== null);
  } catch (error) {
    console.error('Error reading cart from storage:', error);
    return [];
  }
};

const persistCart = (items: CartItem[]) => {
  if (typeof window === 'undefined') {
    return;
  }

  const payload: StoredCartItem[] = items.map((item) => ({
    productId: item.product.id,
    quantity: item.quantity,
  }));

  window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(payload));
};

interface CartState {
  items: CartItem[];
  loading: boolean;
  fetchCart: () => void;
  addToCart: (productId: string, quantity?: number) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  getTotalPrice: () => number;
  getTotalItems: () => number;
}

export const useCartStore = create<CartState>((set, get) => ({
  items: [],
  loading: false,

  fetchCart: () => {
    const hydrated = readCart();
    set({ items: hydrated });
  },

  addToCart: (productId, quantity = 1) => {
    const product = getProductById(productId);
    if (!product) {
      console.warn('Product not found for cart:', productId);
      return;
    }

    set((state) => {
      const existing = state.items.find((item) => item.product.id === productId);
      const nextItems = existing
        ? state.items.map((item) =>
            item.product.id === productId
              ? { ...item, quantity: item.quantity + quantity }
              : item
          )
        : [...state.items, { product, quantity }];

      persistCart(nextItems);
      return { items: nextItems };
    });
  },

  removeFromCart: (productId) => {
    set((state) => {
      const nextItems = state.items.filter((item) => item.product.id !== productId);
      persistCart(nextItems);
      return { items: nextItems };
    });
  },

  updateQuantity: (productId, quantity) => {
    if (quantity <= 0) {
      get().removeFromCart(productId);
      return;
    }

    set((state) => {
      const nextItems = state.items.map((item) =>
        item.product.id === productId ? { ...item, quantity } : item
      );
      persistCart(nextItems);
      return { items: nextItems };
    });
  },

  clearCart: () => {
    persistCart([]);
    set({ items: [] });
  },

  getTotalPrice: () => {
    return get().items.reduce((total, item) => total + item.product.price * item.quantity, 0);
  },

  getTotalItems: () => {
    return get().items.reduce((total, item) => total + item.quantity, 0);
  },
}));