import type { PageServerLoad, Actions } from './$types';
import { getProductCategories } from '$services/product-category.service';
import { createProduct } from '$services/product.service';
import { createProductSchema } from '$schemas';
import { sanitizeHtml } from '$utils/sanitize';
import { fail, redirect } from '@sveltejs/kit';
import { ZodError } from 'zod';

export const load: PageServerLoad = async () => {
  const categories = await getProductCategories();
  return { categories };
};

export const actions: Actions = {
  default: async ({ request }) => {
    const formData = await request.formData();
    const raw = Object.fromEntries(formData);

    try {
      const parsed = createProductSchema.parse(raw);
      const product = await createProduct({
        ...parsed,
        description: sanitizeHtml(parsed.description),
        image: parsed.image || undefined,
        categoryId: parsed.categoryId || undefined
      });
      throw redirect(303, `/admin/shop/products/${product.id}/edit`);
    } catch (err) {
      if (err instanceof Response) throw err; // redirect
      if (err instanceof ZodError) {
        return fail(422, {
          error: 'Données invalides',
          errors: err.flatten().fieldErrors,
          values: raw
        });
      }
      const msg = err instanceof Error ? err.message : 'Erreur';
      return fail(500, { error: msg, values: raw });
    }
  }
};
