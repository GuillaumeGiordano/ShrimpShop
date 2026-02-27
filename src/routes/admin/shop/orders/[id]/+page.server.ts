import type { PageServerLoad, Actions } from './$types';
import { getOrderById, updateOrderStatus } from '$services/order.service';
import { throwKitError } from '$server/errors';
import { fail } from '@sveltejs/kit';
import type { OrderStatus } from '@prisma/client';

export const load: PageServerLoad = async ({ params }) => {
  try {
    const order = await getOrderById(params.id);
    return { order };
  } catch (err) {
    throwKitError(err);
  }
};

export const actions: Actions = {
  updateStatus: async ({ request, params }) => {
    const formData = await request.formData();
    const status = formData.get('status') as OrderStatus;

    const validStatuses: OrderStatus[] = ['PENDING', 'PAID', 'CANCELLED'];
    if (!validStatuses.includes(status)) {
      return fail(400, { error: 'Statut invalide' });
    }

    try {
      await updateOrderStatus(params.id, status);
      return { success: true };
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Erreur';
      return fail(500, { error: msg });
    }
  }
};
