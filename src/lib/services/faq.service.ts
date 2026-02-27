import { db } from '$server/db';
import { NotFoundError } from '$server/errors';
import type { FaqDTO, PaginatedResponse, FaqFilters, ProductCategoryDTO } from '$types';

type CategoryRow = {
  id: string;
  name: string;
  slug: string;
  order: number;
  createdAt: Date;
} | null;

function serializeCategory(cat: CategoryRow): ProductCategoryDTO | null {
  if (!cat) return null;
  return { ...cat, createdAt: cat.createdAt.toISOString() };
}

function toDTO(faq: {
  id: string;
  categoryId: string | null;
  category: CategoryRow;
  question: string;
  answer: string;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}): FaqDTO {
  return {
    ...faq,
    category: serializeCategory(faq.category),
    createdAt: faq.createdAt.toISOString()
  };
}

export async function getFaqs(filters: FaqFilters = {}): Promise<PaginatedResponse<FaqDTO>> {
  const { page = 1, perPage = 20, categoryId, search } = filters;
  const skip = (page - 1) * perPage;

  const where = {
    ...(categoryId && { categoryId }),
    ...(search && {
      OR: [
        { question: { contains: search, mode: 'insensitive' as const } },
        { answer: { contains: search, mode: 'insensitive' as const } }
      ]
    })
  };

  const [total, items] = await Promise.all([
    db.faq.count({ where }),
    db.faq.findMany({
      where,
      include: { category: true },
      orderBy: [{ order: 'asc' }],
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

export async function getFaqById(id: string): Promise<FaqDTO> {
  const faq = await db.faq.findUnique({ where: { id }, include: { category: true } });
  if (!faq) throw new NotFoundError('FAQ');
  return toDTO(faq);
}

export async function createFaq(data: {
  categoryId?: string;
  question: string;
  answer: string;
  order?: number;
}): Promise<FaqDTO> {
  const { categoryId, ...rest } = data;
  const faq = await db.faq.create({
    data: {
      ...rest,
      ...(categoryId ? { categoryId } : {})
    },
    include: { category: true }
  });
  return toDTO(faq);
}

export async function updateFaq(
  id: string,
  data: Partial<{
    categoryId: string;
    question: string;
    answer: string;
    order: number;
  }>
): Promise<FaqDTO> {
  const existing = await db.faq.findUnique({ where: { id } });
  if (!existing) throw new NotFoundError('FAQ');
  const { categoryId, ...rest } = data;
  const faq = await db.faq.update({
    where: { id },
    data: {
      ...rest,
      ...(categoryId !== undefined ? { categoryId: categoryId || null } : {})
    },
    include: { category: true }
  });
  return toDTO(faq);
}

export async function deleteFaq(id: string): Promise<void> {
  const existing = await db.faq.findUnique({ where: { id } });
  if (!existing) throw new NotFoundError('FAQ');
  await db.faq.delete({ where: { id } });
}
