import { db } from '$server/db';
import { NotFoundError } from '$server/errors';
import { deleteImage, extractStoragePath } from '$server/storage';
import type { PhotoDTO, ProductCategoryDTO } from '$types';

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

function toDTO(photo: {
  id: string;
  title: string;
  description: string | null;
  imageUrl: string;
  altText: string | null;
  order: number;
  categoryId: string | null;
  category: CategoryRow;
  createdAt: Date;
  updatedAt: Date;
}): PhotoDTO {
  return {
    ...photo,
    category: serializeCategory(photo.category),
    createdAt: photo.createdAt.toISOString()
  };
}

export async function getPhotos(limit?: number): Promise<PhotoDTO[]> {
  const photos = await db.photo.findMany({
    include: { category: true },
    orderBy: { order: 'asc' },
    ...(limit ? { take: limit } : {})
  });
  return photos.map(toDTO);
}

export async function getPhotoById(id: string): Promise<PhotoDTO> {
  const photo = await db.photo.findUnique({ where: { id }, include: { category: true } });
  if (!photo) throw new NotFoundError('Photo');
  return toDTO(photo);
}

export async function createPhoto(data: {
  title: string;
  description?: string;
  imageUrl: string;
  altText?: string;
  order?: number;
  categoryId?: string;
}): Promise<PhotoDTO> {
  const { categoryId, ...rest } = data;
  const photo = await db.photo.create({
    data: {
      ...rest,
      ...(categoryId ? { categoryId } : {})
    },
    include: { category: true }
  });
  return toDTO(photo);
}

export async function updatePhoto(
  id: string,
  data: Partial<{
    title: string;
    description: string;
    imageUrl: string;
    altText: string;
    order: number;
    categoryId: string;
  }>
): Promise<PhotoDTO> {
  const existing = await db.photo.findUnique({ where: { id } });
  if (!existing) throw new NotFoundError('Photo');
  const { categoryId, ...rest } = data;
  const photo = await db.photo.update({
    where: { id },
    data: {
      ...rest,
      ...(categoryId !== undefined ? { categoryId: categoryId || null } : {})
    },
    include: { category: true }
  });

  // Suppression de l'ancienne image si remplacée
  if (data.imageUrl && data.imageUrl !== existing.imageUrl) {
    try {
      await deleteImage('gallery', extractStoragePath(existing.imageUrl, 'gallery'));
    } catch {
      // Nettoyage non bloquant
    }
  }

  return toDTO(photo);
}

export async function deletePhoto(id: string): Promise<void> {
  const existing = await db.photo.findUnique({ where: { id } });
  if (!existing) throw new NotFoundError('Photo');
  await db.photo.delete({ where: { id } });

  // Suppression de l'image associée
  try {
    await deleteImage('gallery', extractStoragePath(existing.imageUrl, 'gallery'));
  } catch {
    // Nettoyage non bloquant
  }
}
