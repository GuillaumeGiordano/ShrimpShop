import type { PageServerLoad } from './$types';
import { getProducts } from '$services/product.service';
import { getProductCategories } from '$services/product-category.service';

export const load: PageServerLoad = async ({ url }) => {
  const page = Number(url.searchParams.get('page') ?? '1');
  const categoryId = url.searchParams.get('category') ?? undefined;
  const search = url.searchParams.get('q') ?? undefined;

  const [products, categories] = await Promise.all([
    getProducts({ page, perPage: 12, categoryId, search }),
    getProductCategories()
  ]);

  return { ...products, categories };
};
