import { db } from '$server/db';
import { NotFoundError } from '$server/errors';
import { decrementStock } from './product.service';
import type { OrderDTO, PaginatedResponse, OrderFilters } from '$types';
import type { OrderStatus, Prisma } from '@prisma/client';

function toDTO(order: {
  id: string;
  userId: string | null;
  email: string;
  total: number;
  status: OrderStatus;
  stripeId: string | null;
  createdAt: Date;
  updatedAt: Date;
  items: Array<{
    id: string;
    productId: string;
    quantity: number;
    price: number;
    product: { name: string };
  }>;
}): OrderDTO {
  return {
    ...order,
    createdAt: order.createdAt.toISOString(),
    updatedAt: order.updatedAt.toISOString()
  };
}

const orderInclude = {
  items: { include: { product: { select: { name: true } } } }
} satisfies Prisma.OrderInclude;

export async function createOrder(data: {
  userId?: string | null;
  email: string;
  items: Array<{ productId: string; quantity: number; price: number }>;
  stripeId?: string | null;
  total: number;
}): Promise<OrderDTO> {
  const order = await db.$transaction(async (tx) => {
    for (const item of data.items) {
      await decrementStock(item.productId, item.quantity, tx);
    }

    return tx.order.create({
      data: {
        userId: data.userId ?? null,
        email: data.email,
        total: data.total,
        stripeId: data.stripeId ?? null,
        items: {
          create: data.items.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
            price: item.price
          }))
        }
      },
      include: orderInclude
    });
  });

  return toDTO(order);
}

export async function getOrders(
  filters: OrderFilters = {}
): Promise<PaginatedResponse<OrderDTO>> {
  const { page = 1, perPage = 20, status, search } = filters;
  const skip = (page - 1) * perPage;

  const where: Prisma.OrderWhereInput = {
    ...(status && { status }),
    ...(search && {
      OR: [
        { email: { contains: search, mode: 'insensitive' } },
        { id: { contains: search, mode: 'insensitive' } }
      ]
    })
  };

  const [total, items] = await Promise.all([
    db.order.count({ where }),
    db.order.findMany({
      where,
      include: orderInclude,
      orderBy: { createdAt: 'desc' },
      skip,
      take: perPage
    })
  ]);

  return {
    data: items.map(toDTO),
    total,
    page,
    perPage,
    totalPages: Math.ceil(total / perPage)
  };
}

export async function getOrderById(id: string): Promise<OrderDTO> {
  const order = await db.order.findUnique({ where: { id }, include: orderInclude });
  if (!order) throw new NotFoundError('Commande');
  return toDTO(order);
}

export async function getOrdersByUserId(userId: string): Promise<OrderDTO[]> {
  const orders = await db.order.findMany({
    where: { userId },
    include: orderInclude,
    orderBy: { createdAt: 'desc' }
  });
  return orders.map(toDTO);
}

export async function updateOrderStatus(id: string, status: OrderStatus): Promise<OrderDTO> {
  const existing = await db.order.findUnique({ where: { id } });
  if (!existing) throw new NotFoundError('Commande');
  const order = await db.order.update({ where: { id }, data: { status }, include: orderInclude });
  return toDTO(order);
}
