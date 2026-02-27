import { db } from '$server/db';
import { NotFoundError, ValidationError } from '$server/errors';
import { deleteImage, extractStoragePath } from '$server/storage';
import type { ProductDTO, ProductCardDTO, PaginatedResponse, ProductFilters } from '$types';
import type { Prisma } from '@prisma/client';

const productCardSelect = {
  id: true,
  name: true,
  slug: true,
  price: true,
  stock: true,
  image: true,
  isActive: true,
  categoryId: true,
  category: { select: { id: true, name: true, slug: true, order: true, createdAt: true } },
  createdAt: true,
  updatedAt: true
} satisfies Prisma.ProductSelect;

function toCardDTO(p: {
  id: string;
  name: string;
  slug: string;
  price: number;
  stock: number;
  image: string | null;
  isActive: boolean;
  categoryId: string | null;
  category: { id: string; name: string; slug: string; order: number; createdAt: Date } | null;
  createdAt: Date;
  updatedAt: Date;
}): ProductCardDTO {
  return {
    ...p,
    category: p.category ? { ...p.category, createdAt: p.category.createdAt.toISOString() } : null,
    createdAt: p.createdAt.toISOString(),
    updatedAt: p.updatedAt.toISOString()
  };
}

function toDTO(p: {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  stock: number;
  image: string | null;
  isActive: boolean;
  categoryId: string | null;
  category: { id: string; name: string; slug: string; order: number; createdAt: Date } | null;
  createdAt: Date;
  updatedAt: Date;
}): ProductDTO {
  return {
    ...p,
    category: p.category ? { ...p.category, createdAt: p.category.createdAt.toISOString() } : null,
    createdAt: p.createdAt.toISOString(),
    updatedAt: p.updatedAt.toISOString()
  };
}

// ============================================================
// Public queries (isActive = true par défaut)
// ============================================================

export async function getProducts(
  filters: ProductFilters = {}
): Promise<PaginatedResponse<ProductCardDTO>> {
  const { page = 1, perPage = 12, categoryId, search, isActive = true } = filters;
  const skip = (page - 1) * perPage;

  const where: Prisma.ProductWhereInput = {
    isActive,
    ...(categoryId && { categoryId }),
    ...(search && {
      OR: [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ]
    })
  };

  const [total, items] = await Promise.all([
    db.product.count({ where }),
    db.product.findMany({
      where,
      select: productCardSelect,
      orderBy: { createdAt: 'desc' },
      skip,
      take: perPage
    })
  ]);

  return {
    data: items.map(toCardDTO),
    total,
    page,
    perPage,
    totalPages: Math.ceil(total / perPage)
  };
}

export async function getProductBySlug(slug: string): Promise<ProductDTO> {
  const p = await db.product.findFirst({
    where: { slug, isActive: true },
    include: { category: true }
  });
  if (!p) throw new NotFoundError('Produit');
  return toDTO(p);
}

// ============================================================
// Admin queries
// ============================================================

export async function getAllProducts(
  filters: ProductFilters = {}
): Promise<PaginatedResponse<ProductCardDTO>> {
  const { page = 1, perPage = 10, categoryId, search, isActive } = filters;
  const skip = (page - 1) * perPage;

  const where: Prisma.ProductWhereInput = {
    ...(isActive !== undefined && { isActive }),
    ...(categoryId && { categoryId }),
    ...(search && {
      OR: [{ name: { contains: search, mode: 'insensitive' } }]
    })
  };

  const [total, items] = await Promise.all([
    db.product.count({ where }),
    db.product.findMany({
      where,
      select: productCardSelect,
      orderBy: { createdAt: 'desc' },
      skip,
      take: perPage
    })
  ]);

  return {
    data: items.map(toCardDTO),
    total,
    page,
    perPage,
    totalPages: Math.ceil(total / perPage)
  };
}

export async function getProductById(id: string): Promise<ProductDTO> {
  const p = await db.product.findUnique({ where: { id }, include: { category: true } });
  if (!p) throw new NotFoundError('Produit');
  return toDTO(p);
}

export async function createProduct(data: {
  name: string;
  slug: string;
  description: string;
  price: number;
  stock: number;
  image?: string;
  isActive?: boolean;
  categoryId?: string;
}): Promise<ProductDTO> {
  const p = await db.product.create({
    data: {
      ...data,
      categoryId: data.categoryId || null,
      image: data.image || null
    },
    include: { category: true }
  });
  return toDTO(p);
}

export async function updateProduct(
  id: string,
  data: Partial<{
    name: string;
    slug: string;
    description: string;
    price: number;
    stock: number;
    image: string;
    isActive: boolean;
    categoryId: string;
  }>
): Promise<ProductDTO> {
  const existing = await db.product.findUnique({ where: { id } });
  if (!existing) throw new NotFoundError('Produit');
  const p = await db.product.update({
    where: { id },
    data: {
      ...data,
      categoryId: data.categoryId === '' ? null : data.categoryId,
      image: data.image === '' ? null : data.image
    },
    include: { category: true }
  });

  // Suppression de l'ancienne image si remplacée
  if (data.image && data.image !== '' && existing.image && data.image !== existing.image) {
    try {
      await deleteImage('products', extractStoragePath(existing.image, 'products'));
    } catch {
      // Nettoyage non bloquant
    }
  }

  return toDTO(p);
}

export async function deleteProduct(id: string): Promise<void> {
  const existing = await db.product.findUnique({ where: { id } });
  if (!existing) throw new NotFoundError('Produit');
  await db.product.delete({ where: { id } });

  // Suppression de l'image associée
  if (existing.image) {
    try {
      await deleteImage('products', extractStoragePath(existing.image, 'products'));
    } catch {
      // Nettoyage non bloquant
    }
  }
}

export async function decrementStock(
  productId: string,
  quantity: number,
  tx?: Prisma.TransactionClient
): Promise<void> {
  const client = tx ?? db;
  const product = await client.product.findUnique({ where: { id: productId } });
  if (!product) throw new NotFoundError('Produit');
  if (product.stock < quantity) {
    throw new ValidationError(`Stock insuffisant pour "${product.name}"`);
  }
  await client.product.update({
    where: { id: productId },
    data: { stock: { decrement: quantity } }
  });
}
