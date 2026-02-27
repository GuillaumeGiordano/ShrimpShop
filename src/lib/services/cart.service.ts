import { db } from '$server/db';
import type { CartDTO, LocalCartItem } from '$types';

const cartInclude = {
  items: {
    include: {
      product: {
        select: { name: true, price: true, image: true, slug: true, stock: true }
      }
    }
  }
} as const;

function toDTO(cart: {
  id: string;
  userId: string;
  updatedAt: Date;
  items: Array<{
    id: string;
    productId: string;
    quantity: number;
    product: { name: string; price: number; image: string | null; slug: string; stock: number };
  }>;
}): CartDTO {
  return {
    id: cart.id,
    userId: cart.userId,
    updatedAt: cart.updatedAt.toISOString(),
    items: cart.items.map((item) => ({
      id: item.id,
      productId: item.productId,
      quantity: item.quantity,
      product: item.product
    }))
  };
}

export async function getCart(userId: string): Promise<CartDTO | null> {
  const cart = await db.cart.findUnique({
    where: { userId },
    include: cartInclude
  });
  return cart ? toDTO(cart) : null;
}

export async function upsertCartItem(
  userId: string,
  productId: string,
  quantity: number
): Promise<CartDTO> {
  const cart = await db.cart.upsert({
    where: { userId },
    create: {
      userId,
      items: { create: { productId, quantity } }
    },
    update: {},
    include: cartInclude
  });

  const existingItem = cart.items.find((i) => i.productId === productId);
  if (existingItem) {
    await db.cartItem.update({
      where: { id: existingItem.id },
      data: { quantity }
    });
  } else {
    await db.cartItem.create({
      data: { cartId: cart.id, productId, quantity }
    });
  }

  const updated = await db.cart.findUnique({
    where: { userId },
    include: cartInclude
  });
  return toDTO(updated!);
}

export async function removeCartItem(userId: string, productId: string): Promise<CartDTO> {
  const cart = await db.cart.findUnique({ where: { userId }, include: cartInclude });
  if (cart) {
    const item = cart.items.find((i) => i.productId === productId);
    if (item) {
      await db.cartItem.delete({ where: { id: item.id } });
    }
  }
  const updated = await db.cart.findUnique({ where: { userId }, include: cartInclude });
  if (!updated) {
    return { id: '', userId, items: [], updatedAt: new Date().toISOString() };
  }
  return toDTO(updated);
}

export async function clearCart(userId: string): Promise<void> {
  const cart = await db.cart.findUnique({ where: { userId } });
  if (cart) {
    await db.cartItem.deleteMany({ where: { cartId: cart.id } });
  }
}

export async function mergeLocalCart(
  userId: string,
  localItems: LocalCartItem[]
): Promise<CartDTO> {
  let cart = await db.cart.upsert({
    where: { userId },
    create: { userId },
    update: {},
    include: cartInclude
  });

  for (const localItem of localItems) {
    const existing = cart.items.find((i) => i.productId === localItem.productId);
    if (existing) {
      await db.cartItem.update({
        where: { id: existing.id },
        data: { quantity: existing.quantity + localItem.quantity }
      });
    } else {
      await db.cartItem.create({
        data: { cartId: cart.id, productId: localItem.productId, quantity: localItem.quantity }
      });
    }
  }

  const updated = await db.cart.findUnique({ where: { userId }, include: cartInclude });
  return toDTO(updated!);
}
