import { db } from '$server/db';
import { NotFoundError } from '$server/errors';
import type {
  ArticleDTO,
  ArticleCardDTO,
  PaginatedResponse,
  ArticleFilters
} from '$types';
import type { ArticleCategory } from '@prisma/client';

function toDTO(article: {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  category: ArticleCategory;
  imageUrl: string | null;
  status: string;
  published: boolean;
  publishedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}): ArticleDTO {
  return {
    ...article,
    status: article.status as ArticleDTO['status'],
    publishedAt: article.publishedAt?.toISOString() ?? null,
    createdAt: article.createdAt.toISOString(),
    updatedAt: article.updatedAt.toISOString()
  };
}

function toCardDTO(article: Omit<ReturnType<typeof toDTO>, 'content'>): ArticleCardDTO {
  return article;
}

// ============================================================
// Public queries
// ============================================================

export async function getPublishedArticles(
  filters: ArticleFilters = {}
): Promise<PaginatedResponse<ArticleCardDTO>> {
  const { page = 1, perPage = 9, category, search } = filters;
  const skip = (page - 1) * perPage;

  const where = {
    published: true,
    ...(category && { category }),
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
      select: {
        id: true,
        title: true,
        excerpt: true,
        category: true,
        imageUrl: true,
        status: true,
        published: true,
        publishedAt: true,
        createdAt: true,
        updatedAt: true
      },
      orderBy: { publishedAt: 'desc' },
      skip,
      take: perPage
    })
  ]);

  return {
    data: items.map((a) =>
      toCardDTO(toDTO({ ...a, content: '' }))
    ),
    total,
    page,
    perPage,
    totalPages: Math.ceil(total / perPage)
  };
}

export async function getArticleById(id: string): Promise<ArticleDTO> {
  const article = await db.article.findUnique({ where: { id } });
  if (!article) throw new NotFoundError('Article');
  return toDTO(article);
}

export async function getPublishedArticleById(id: string): Promise<ArticleDTO> {
  const article = await db.article.findFirst({ where: { id, published: true } });
  if (!article) throw new NotFoundError('Article');
  return toDTO(article);
}

export async function getSimilarArticles(
  articleId: string,
  category: ArticleCategory,
  limit = 3
): Promise<ArticleCardDTO[]> {
  const items = await db.article.findMany({
    where: { category, published: true, id: { not: articleId } },
    select: {
      id: true,
      title: true,
      excerpt: true,
      category: true,
      imageUrl: true,
      status: true,
      published: true,
      publishedAt: true,
      createdAt: true,
      updatedAt: true
    },
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
  const { page = 1, perPage = 10, category, search, published } = filters;
  const skip = (page - 1) * perPage;

  const where = {
    ...(category && { category }),
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
      select: {
        id: true,
        title: true,
        excerpt: true,
        category: true,
        imageUrl: true,
        status: true,
        published: true,
        publishedAt: true,
        createdAt: true,
        updatedAt: true
      },
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
  category: ArticleCategory;
  imageUrl?: string;
  status?: 'DRAFT' | 'PUBLISHED';
  published?: boolean;
}): Promise<ArticleDTO> {
  const article = await db.article.create({
    data: {
      ...data,
      publishedAt: data.published ? new Date() : null
    }
  });
  return toDTO(article);
}

export async function updateArticle(
  id: string,
  data: Partial<{
    title: string;
    excerpt: string;
    content: string;
    category: ArticleCategory;
    imageUrl: string;
    status: 'DRAFT' | 'PUBLISHED';
    published: boolean;
  }>
): Promise<ArticleDTO> {
  const existing = await db.article.findUnique({ where: { id } });
  if (!existing) throw new NotFoundError('Article');

  const article = await db.article.update({
    where: { id },
    data: {
      ...data,
      publishedAt:
        data.published === true && !existing.publishedAt
          ? new Date()
          : data.published === false
            ? null
            : undefined
    }
  });
  return toDTO(article);
}

export async function deleteArticle(id: string): Promise<void> {
  const existing = await db.article.findUnique({ where: { id } });
  if (!existing) throw new NotFoundError('Article');
  await db.article.delete({ where: { id } });
}
