import { db } from '$server/db';
import { NotFoundError } from '$server/errors';
import type { ProductCategoryDTO } from '$types';

function toDTO(cat: {
  id: string;
  name: string;
  slug: string;
  order: number;
  createdAt: Date;
}): ProductCategoryDTO {
  return {
    ...cat,
    createdAt: cat.createdAt.toISOString()
  };
}

export async function getProductCategories(): Promise<ProductCategoryDTO[]> {
  const items = await db.productCategory.findMany({
    orderBy: [{ order: 'asc' }, { name: 'asc' }]
  });
  return items.map(toDTO);
}

export async function getProductCategoryById(id: string): Promise<ProductCategoryDTO> {
  const cat = await db.productCategory.findUnique({ where: { id } });
  if (!cat) throw new NotFoundError('Catégorie');
  return toDTO(cat);
}

export async function createProductCategory(data: {
  name: string;
  slug: string;
  order?: number;
}): Promise<ProductCategoryDTO> {
  const cat = await db.productCategory.create({ data });
  return toDTO(cat);
}

export async function updateProductCategory(
  id: string,
  data: Partial<{ name: string; slug: string; order: number }>
): Promise<ProductCategoryDTO> {
  const existing = await db.productCategory.findUnique({ where: { id } });
  if (!existing) throw new NotFoundError('Catégorie');
  const cat = await db.productCategory.update({ where: { id }, data });
  return toDTO(cat);
}

export async function deleteProductCategory(id: string): Promise<void> {
  const existing = await db.productCategory.findUnique({ where: { id } });
  if (!existing) throw new NotFoundError('Catégorie');
  await db.productCategory.delete({ where: { id } });
}
