import { db } from '$server/db';
import { NotFoundError } from '$server/errors';
import type { FaqDTO, PaginatedResponse, FaqFilters } from '$types';
import type { FaqCategory } from '@prisma/client';

function toDTO(faq: {
  id: string;
  category: FaqCategory;
  question: string;
  answer: string;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}): FaqDTO {
  return {
    ...faq,
    createdAt: faq.createdAt.toISOString()
  };
}

export async function getFaqs(filters: FaqFilters = {}): Promise<PaginatedResponse<FaqDTO>> {
  const { page = 1, perPage = 20, category, search } = filters;
  const skip = (page - 1) * perPage;

  const where = {
    ...(category && { category }),
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
      orderBy: [{ category: 'asc' }, { order: 'asc' }],
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
  const faq = await db.faq.findUnique({ where: { id } });
  if (!faq) throw new NotFoundError('FAQ');
  return toDTO(faq);
}

export async function createFaq(data: {
  category: FaqCategory;
  question: string;
  answer: string;
  order?: number;
}): Promise<FaqDTO> {
  const faq = await db.faq.create({ data });
  return toDTO(faq);
}

export async function updateFaq(
  id: string,
  data: Partial<{
    category: FaqCategory;
    question: string;
    answer: string;
    order: number;
  }>
): Promise<FaqDTO> {
  const existing = await db.faq.findUnique({ where: { id } });
  if (!existing) throw new NotFoundError('FAQ');
  const faq = await db.faq.update({ where: { id }, data });
  return toDTO(faq);
}

export async function deleteFaq(id: string): Promise<void> {
  const existing = await db.faq.findUnique({ where: { id } });
  if (!existing) throw new NotFoundError('FAQ');
  await db.faq.delete({ where: { id } });
}
