import type { PageServerLoad } from './$types';
import { getProductBySlug } from '$services/product.service';
import { throwKitError } from '$server/errors';

export const load: PageServerLoad = async ({ params }) => {
  try {
    const product = await getProductBySlug(params.slug);
    return { product };
  } catch (err) {
    throwKitError(err);
  }
};
