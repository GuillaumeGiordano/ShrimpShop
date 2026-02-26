import { supabaseAdmin } from './supabase';
import type { UploadResult } from '$types';

const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/avif'];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

export class StorageError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'StorageError';
  }
}

/**
 * Upload un fichier dans Supabase Storage
 */
export async function uploadImage(
  bucket: string,
  file: File,
  folder?: string
): Promise<UploadResult> {
  // Validation type MIME
  if (!ALLOWED_MIME_TYPES.includes(file.type)) {
    throw new StorageError(`Type de fichier non autorisé: ${file.type}`);
  }

  // Validation taille
  if (file.size > MAX_FILE_SIZE) {
    throw new StorageError(`Fichier trop lourd: ${(file.size / 1024 / 1024).toFixed(2)}Mo (max 5Mo)`);
  }

  // Génération d'un nom unique
  const ext = file.name.split('.').pop() ?? 'jpg';
  const uniqueName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
  const path = folder ? `${folder}/${uniqueName}` : uniqueName;

  const arrayBuffer = await file.arrayBuffer();
  const buffer = new Uint8Array(arrayBuffer);

  const { error } = await supabaseAdmin.storage.from(bucket).upload(path, buffer, {
    contentType: file.type,
    cacheControl: '3600',
    upsert: false
  });

  if (error) {
    throw new StorageError(`Erreur upload: ${error.message}`);
  }

  const {
    data: { publicUrl }
  } = supabaseAdmin.storage.from(bucket).getPublicUrl(path);

  return {
    url: publicUrl,
    path,
    bucket
  };
}

/**
 * Supprime un fichier de Supabase Storage
 */
export async function deleteImage(bucket: string, path: string): Promise<void> {
  const { error } = await supabaseAdmin.storage.from(bucket).remove([path]);
  if (error) {
    throw new StorageError(`Erreur suppression: ${error.message}`);
  }
}

/**
 * Extrait le path depuis une URL publique Supabase
 */
export function extractStoragePath(publicUrl: string, bucket: string): string {
  const urlParts = publicUrl.split(`/storage/v1/object/public/${bucket}/`);
  return urlParts[1] ?? '';
}
