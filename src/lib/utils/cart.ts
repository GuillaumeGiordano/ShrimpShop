import type { LocalCartItem } from '$types';

const CART_KEY = 'shrimp_cart';

export function getLocalCart(): LocalCartItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(CART_KEY);
    return raw ? (JSON.parse(raw) as LocalCartItem[]) : [];
  } catch {
    return [];
  }
}

export function setLocalCart(items: LocalCartItem[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(CART_KEY, JSON.stringify(items));
}

export function addToLocalCart(item: LocalCartItem): LocalCartItem[] {
  const items = getLocalCart();
  const existing = items.find((i) => i.productId === item.productId);
  if (existing) {
    existing.quantity += item.quantity;
  } else {
    items.push(item);
  }
  setLocalCart(items);
  return items;
}

export function removeFromLocalCart(productId: string): LocalCartItem[] {
  const items = getLocalCart().filter((i) => i.productId !== productId);
  setLocalCart(items);
  return items;
}

export function updateLocalCartQuantity(productId: string, quantity: number): LocalCartItem[] {
  const items = getLocalCart().map((i) =>
    i.productId === productId ? { ...i, quantity } : i
  );
  setLocalCart(items);
  return items;
}

export function clearLocalCart(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(CART_KEY);
}
