import type { LocalCartItem } from '$types';
import {
  getLocalCart,
  setLocalCart,
  addToLocalCart,
  removeFromLocalCart,
  updateLocalCartQuantity,
  clearLocalCart
} from '$utils/cart';

// ============================================================
// État global du panier (Svelte 5 runes)
// ============================================================

let items = $state<LocalCartItem[]>([]);
let isOpen = $state(false);
let initialized = $state(false);

export const cartStore = {
  get items() {
    return items;
  },
  get isOpen() {
    return isOpen;
  },
  get initialized() {
    return initialized;
  },
  get count() {
    return items.reduce((sum, i) => sum + i.quantity, 0);
  },
  get total() {
    return items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  },

  init() {
    items = getLocalCart();
    initialized = true;
  },

  open() {
    isOpen = true;
  },
  close() {
    isOpen = false;
  },
  toggle() {
    isOpen = !isOpen;
  },

  addItem(item: LocalCartItem) {
    items = addToLocalCart(item);
    isOpen = true;
  },

  removeItem(productId: string) {
    items = removeFromLocalCart(productId);
  },

  updateQuantity(productId: string, quantity: number) {
    if (quantity <= 0) {
      items = removeFromLocalCart(productId);
    } else {
      items = updateLocalCartQuantity(productId, quantity);
    }
  },

  clear() {
    clearLocalCart();
    items = [];
  },

  // Appelé après login : merge localStorage avec DB
  async syncWithDb() {
    try {
      const localItems = getLocalCart();
      if (localItems.length > 0) {
        await fetch('/api/cart/merge', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ items: localItems })
        });
        clearLocalCart();
      }
      // Charger le panier DB
      const res = await fetch('/api/cart');
      if (res.ok) {
        const json = await res.json();
        const dbItems = json.data?.items ?? [];
        items = dbItems.map(
          (i: {
            productId: string;
            quantity: number;
            product: { name: string; price: number; image: string | null; slug: string };
          }) => ({
            productId: i.productId,
            quantity: i.quantity,
            name: i.product.name,
            price: i.product.price,
            image: i.product.image,
            slug: i.product.slug
          })
        );
        setLocalCart(items);
      }
    } catch {
      // Silencieux — le localStorage reste la source de vérité
    }
  }
};
