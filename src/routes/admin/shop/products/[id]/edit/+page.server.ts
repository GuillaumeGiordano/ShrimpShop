import type { PageServerLoad, Actions } from './$types';
import { getProductById, updateProduct } from '$services/product.service';
import { getProductCategories } from '$services/product-category.service';
import { updateProductSchema } from '$schemas';
import { sanitizeHtml } from '$utils/sanitize';
import { throwKitError } from '$server/errors';
import { fail } from '@sveltejs/kit';
import { ZodError } from 'zod';

export const load: PageServerLoad = async ({ params }) => {
  try {
    const [product, categories] = await Promise.all([
      getProductById(params.id),
      getProductCategories()
    ]);
    return { product, categories };
  } catch (err) {
    throwKitError(err);
  }
};

export const actions: Actions = {
  default: async ({ request, params }) => {
    const formData = await request.formData();
    const raw = Object.fromEntries(formData);

    try {
      const parsed = updateProductSchema.parse(raw);
      await updateProduct(params.id, {
        ...parsed,
        description: parsed.description ? sanitizeHtml(parsed.description) : undefined,
        image: parsed.image === '' ? undefined : parsed.image,
        categoryId: parsed.categoryId === '' ? undefined : parsed.categoryId
      });
      return { success: true };
    } catch (err) {
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
