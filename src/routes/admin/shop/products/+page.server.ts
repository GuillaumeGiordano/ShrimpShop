import type { PageServerLoad, Actions } from './$types';
import { getAllProducts, deleteProduct } from '$services/product.service';
import { fail } from '@sveltejs/kit';
import { throwKitError } from '$server/errors';

export const load: PageServerLoad = async ({ url }) => {
  const page = Number(url.searchParams.get('page') ?? '1');
  const search = url.searchParams.get('q') ?? undefined;

  try {
    const products = await getAllProducts({ page, perPage: 15, search });
    return products;
  } catch (err) {
    throwKitError(err);
  }
};

export const actions: Actions = {
  delete: async ({ request }) => {
    const data = await request.formData();
    const id = data.get('id') as string;
    if (!id) return fail(400, { error: 'ID manquant' });

    try {
      await deleteProduct(id);
      return { success: true };
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Erreur';
      return fail(500, { error: msg });
    }
  }
};
