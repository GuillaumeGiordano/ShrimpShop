import type { PageServerLoad } from './$types';
import { getOrders } from '$services/order.service';
import { throwKitError } from '$server/errors';
import type { OrderStatus } from '@prisma/client';

export const load: PageServerLoad = async ({ url }) => {
  const page = Number(url.searchParams.get('page') ?? '1');
  const status = (url.searchParams.get('status') as OrderStatus) || undefined;
  const search = url.searchParams.get('q') ?? undefined;

  try {
    const orders = await getOrders({ page, perPage: 20, status, search });
    return orders;
  } catch (err) {
    throwKitError(err);
  }
};
