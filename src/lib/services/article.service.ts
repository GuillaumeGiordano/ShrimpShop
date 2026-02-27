import { db } from '$server/db';
import { NotFoundError } from '$server/errors';
import { deleteImage, extractStoragePath } from '$server/storage';
import type {
  ArticleDTO,
  ArticleCardDTO,
  PaginatedResponse,
  ArticleFilters,
  ProductCategoryDTO
} from '$types';

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

function toDTO(article: {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  categoryId: string | null;
  category: CategoryRow;
  imageUrl: string | null;
  status: string;
  published: boolean;
  publishedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}): ArticleDTO {
  return {
    ...article,
    category: serializeCategory(article.category),
    status: article.status as ArticleDTO['status'],
    publishedAt: article.publishedAt?.toISOString() ?? null,
    createdAt: article.createdAt.toISOString(),
    updatedAt: article.updatedAt.toISOString()
  };
}

function toCardDTO(article: Omit<ReturnType<typeof toDTO>, 'content'>): ArticleCardDTO {
  return article;
}

const cardSelect = {
  id: true,
  title: true,
  excerpt: true,
  categoryId: true,
  category: true,
  imageUrl: true,
  status: true,
  published: true,
  publishedAt: true,
  createdAt: true,
  updatedAt: true
} as const;

// ============================================================
// Public queries
// ============================================================

export async function getPublishedArticles(
  filters: ArticleFilters = {}
): Promise<PaginatedResponse<ArticleCardDTO>> {
  const { page = 1, perPage = 9, categoryId, search } = filters;
  const skip = (page - 1) * perPage;

  const where = {
    published: true,
    ...(categoryId && { categoryId }),
    ...(search && {
      OR: [
        { title: { contains: search, mode: 'insensitive' as const } },
        { excerpt: { contains: search, mode: 'insensitive' as const } }
      ]
    })
  };

  const [total, items] = await Promise.all([
    db.article.count({ where }),
    db.article.findMany({
      where,
      select: cardSelect,
      orderBy: { publishedAt: 'desc' },
      skip,
      take: perPage
    })
  ]);

  return {
    data: items.map((a) => toCardDTO(toDTO({ ...a, content: '' }))),
    total,
    page,
    perPage,
    totalPages: Math.ceil(total / perPage)
  };
}

export async function getArticleById(id: string): Promise<ArticleDTO> {
  const article = await db.article.findUnique({
    where: { id },
    include: { category: true }
  });
  if (!article) throw new NotFoundError('Article');
  return toDTO(article);
}

export async function getPublishedArticleById(id: string): Promise<ArticleDTO> {
  const article = await db.article.findFirst({
    where: { id, published: true },
    include: { category: true }
  });
  if (!article) throw new NotFoundError('Article');
  return toDTO(article);
}

export async function getSimilarArticles(
  articleId: string,
  categoryId: string | null,
  limit = 3
): Promise<ArticleCardDTO[]> {
  const items = await db.article.findMany({
    where: {
      published: true,
      id: { not: articleId },
      ...(categoryId && { categoryId })
    },
    select: cardSelect,
    orderBy: { publishedAt: 'desc' },
    take: limit
  });
  return items.map((a) => toCardDTO(toDTO({ ...a, content: '' })));
}

// ============================================================
// Admin CRUD
// ============================================================

export async function getAllArticles(
  filters: ArticleFilters = {}
): Promise<PaginatedResponse<ArticleCardDTO>> {
  const { page = 1, perPage = 10, categoryId, search, published } = filters;
  const skip = (page - 1) * perPage;

  const where = {
    ...(categoryId && { categoryId }),
    ...(published !== undefined && { published }),
    ...(search && {
      OR: [
        { title: { contains: search, mode: 'insensitive' as const } },
        { excerpt: { contains: search, mode: 'insensitive' as const } }
      ]
    })
  };

  const [total, items] = await Promise.all([
    db.article.count({ where }),
    db.article.findMany({
      where,
      select: cardSelect,
      orderBy: { createdAt: 'desc' },
      skip,
      take: perPage
    })
  ]);

  return {
    data: items.map((a) => toCardDTO(toDTO({ ...a, content: '' }))),
    total,
    page,
    perPage,
    totalPages: Math.ceil(total / perPage)
  };
}

export async function createArticle(data: {
  title: string;
  excerpt: string;
  content: string;
  categoryId?: string;
  imageUrl?: string;
  status?: 'DRAFT' | 'PUBLISHED';
  published?: boolean;
}): Promise<ArticleDTO> {
  const { categoryId, ...rest } = data;
  const article = await db.article.create({
    data: {
      ...rest,
      ...(categoryId ? { categoryId } : {}),
      publishedAt: data.published ? new Date() : null
    },
    include: { category: true }
  });
  return toDTO(article);
}

export async function updateArticle(
  id: string,
  data: Partial<{
    title: string;
    excerpt: string;
    content: string;
    categoryId: string;
    imageUrl: string;
    status: 'DRAFT' | 'PUBLISHED';
    published: boolean;
  }>
): Promise<ArticleDTO> {
  const existing = await db.article.findUnique({ where: { id } });
  if (!existing) throw new NotFoundError('Article');

  const { categoryId, ...rest } = data;
  const article = await db.article.update({
    where: { id },
    data: {
      ...rest,
      ...(categoryId !== undefined ? { categoryId: categoryId || null } : {}),
      publishedAt:
        data.published === true && !existing.publishedAt
          ? new Date()
          : data.published === false
            ? null
            : undefined
    },
    include: { category: true }
  });

  // Suppression de l'ancienne image si remplacée
  if (data.imageUrl && existing.imageUrl && data.imageUrl !== existing.imageUrl) {
    try {
      await deleteImage('articles', extractStoragePath(existing.imageUrl, 'articles'));
    } catch {
      // Nettoyage non bloquant
    }
  }

  return toDTO(article);
}

export async function deleteArticle(id: string): Promise<void> {
  const existing = await db.article.findUnique({ where: { id } });
  if (!existing) throw new NotFoundError('Article');
  await db.article.delete({ where: { id } });

  // Suppression de l'image associée
  if (existing.imageUrl) {
    try {
      await deleteImage('articles', extractStoragePath(existing.imageUrl, 'articles'));
    } catch {
      // Nettoyage non bloquant
    }
  }
}
