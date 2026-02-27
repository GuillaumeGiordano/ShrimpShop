import type { PageServerLoad, Actions } from './$types';
import {
  getProductCategories,
  createProductCategory,
  updateProductCategory,
  deleteProductCategory
} from '$services/product-category.service';
import { createProductCategorySchema, updateProductCategorySchema } from '$schemas';
import { fail } from '@sveltejs/kit';
import { ZodError } from 'zod';

export const load: PageServerLoad = async () => {
  const categories = await getProductCategories();
  return { categories };
};

export const actions: Actions = {
  create: async ({ request }) => {
    const formData = await request.formData();
    const raw = Object.fromEntries(formData);

    try {
      const parsed = createProductCategorySchema.parse(raw);
      await createProductCategory(parsed);
      return { success: true };
    } catch (err) {
      if (err instanceof ZodError) {
        return fail(422, { action: 'create', error: 'Données invalides', errors: err.flatten().fieldErrors });
      }
      const msg = err instanceof Error ? err.message : 'Erreur';
      return fail(500, { action: 'create', error: msg });
    }
  },

  update: async ({ request }) => {
    const formData = await request.formData();
    const id = formData.get('id') as string;
    const raw = Object.fromEntries(formData);

    try {
      const parsed = updateProductCategorySchema.parse(raw);
      await updateProductCategory(id, parsed);
      return { success: true };
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Erreur';
      return fail(500, { action: 'update', error: msg });
    }
  },

  delete: async ({ request }) => {
    const formData = await request.formData();
    const id = formData.get('id') as string;
    if (!id) return fail(400, { action: 'delete', error: 'ID manquant' });

    try {
      await deleteProductCategory(id);
      return { success: true };
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Erreur';
      return fail(500, { action: 'delete', error: msg });
    }
  }
};
