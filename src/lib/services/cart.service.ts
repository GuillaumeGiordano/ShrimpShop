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
    create: { userId },
    update: {}
  });

  await db.cartItem.upsert({
    where: { cartId_productId: { cartId: cart.id, productId } },
    create: { cartId: cart.id, productId, quantity },
    update: { quantity }
  });

  const updated = await db.cart.findUnique({ where: { userId }, include: cartInclude });
  return toDTO(updated!);
}

export async function removeCartItem(userId: string, productId: string): Promise<CartDTO> {
  await db.cartItem.deleteMany({ where: { cart: { userId }, productId } });
  const updated = await db.cart.findUnique({ where: { userId }, include: cartInclude });
  return updated ? toDTO(updated) : { id: '', userId, items: [], updatedAt: new Date().toISOString() };
}

export async function clearCart(userId: string): Promise<void> {
  await db.cartItem.deleteMany({ where: { cart: { userId } } });
}

export async function mergeLocalCart(
  userId: string,
  localItems: LocalCartItem[]
): Promise<CartDTO> {
  const cart = await db.cart.upsert({
    where: { userId },
    create: { userId },
    update: {}
  });

  await Promise.all(
    localItems.map((localItem) =>
      db.cartItem.upsert({
        where: { cartId_productId: { cartId: cart.id, productId: localItem.productId } },
        create: { cartId: cart.id, productId: localItem.productId, quantity: localItem.quantity },
        update: { quantity: { increment: localItem.quantity } }
      })
    )
  );

  const updated = await db.cart.findUnique({ where: { userId }, include: cartInclude });
  return toDTO(updated!);
}
