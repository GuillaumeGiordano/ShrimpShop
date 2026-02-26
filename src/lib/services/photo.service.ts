import { db } from '$server/db';
import { NotFoundError } from '$server/errors';
import type { PhotoDTO } from '$types';

function toDTO(photo: {
  id: string;
  title: string;
  description: string | null;
  imageUrl: string;
  altText: string | null;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}): PhotoDTO {
  return {
    ...photo,
    createdAt: photo.createdAt.toISOString()
  };
}

export async function getPhotos(): Promise<PhotoDTO[]> {
  const photos = await db.photo.findMany({ orderBy: { order: 'asc' } });
  return photos.map(toDTO);
}

export async function getPhotoById(id: string): Promise<PhotoDTO> {
  const photo = await db.photo.findUnique({ where: { id } });
  if (!photo) throw new NotFoundError('Photo');
  return toDTO(photo);
}

export async function createPhoto(data: {
  title: string;
  description?: string;
  imageUrl: string;
  altText?: string;
  order?: number;
}): Promise<PhotoDTO> {
  const photo = await db.photo.create({ data });
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
  }>
): Promise<PhotoDTO> {
  const existing = await db.photo.findUnique({ where: { id } });
  if (!existing) throw new NotFoundError('Photo');
  const photo = await db.photo.update({ where: { id }, data });
  return toDTO(photo);
}

export async function deletePhoto(id: string): Promise<void> {
  const existing = await db.photo.findUnique({ where: { id } });
  if (!existing) throw new NotFoundError('Photo');
  await db.photo.delete({ where: { id } });
}
