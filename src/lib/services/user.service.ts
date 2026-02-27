import { db } from '$server/db';
import { supabaseAdmin } from '$server/supabase';
import { NotFoundError, ForbiddenError } from '$server/errors';
import type { UserDTO, PaginatedResponse, UserFilters } from '$types';
import type { Role } from '@prisma/client';

function toDTO(user: {
  id: string;
  name: string;
  email: string;
  role: Role;
  enabled: boolean;
  avatarUrl: string | null;
  createdAt: Date;
}): UserDTO {
  return {
    ...user,
    createdAt: user.createdAt.toISOString()
  };
}

export async function getUsers(filters: UserFilters = {}): Promise<PaginatedResponse<UserDTO>> {
  const { page = 1, perPage = 10, search, role } = filters;
  const skip = (page - 1) * perPage;

  const where = {
    ...(role && { role }),
    ...(search && {
      OR: [
        { name: { contains: search, mode: 'insensitive' as const } },
        { email: { contains: search, mode: 'insensitive' as const } }
      ]
    })
  };

  const [total, items] = await Promise.all([
    db.user.count({ where }),
    db.user.findMany({
      where,
      orderBy: { createdAt: 'desc' },
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

export async function getUserById(id: string): Promise<UserDTO> {
  const user = await db.user.findUnique({ where: { id } });
  if (!user) throw new NotFoundError('Utilisateur');
  return toDTO(user);
}

export async function getUserBySupabaseId(supabaseId: string): Promise<UserDTO | null> {
  const user = await db.user.findUnique({ where: { supabaseId } });
  if (!user) return null;
  return toDTO(user);
}

export async function getUserRoleBySupabaseId(
  supabaseId: string
): Promise<{ role: Role; enabled: boolean } | null> {
  const user = await db.user.findUnique({
    where: { supabaseId },
    select: { role: true, enabled: true }
  });
  return user ?? null;
}

export async function upsertUser(data: {
  supabaseId: string;
  name: string;
  email: string;
  avatarUrl?: string;
}): Promise<UserDTO> {
  const user = await db.user.upsert({
    where: { supabaseId: data.supabaseId },
    update: {
      name: data.name,
      avatarUrl: data.avatarUrl
    },
    create: {
      supabaseId: data.supabaseId,
      name: data.name,
      email: data.email,
      avatarUrl: data.avatarUrl,
      role: 'USER'
    }
  });
  return toDTO(user);
}

export async function updateUserAvatar(id: string, avatarUrl: string): Promise<UserDTO> {
  const existing = await db.user.findUnique({ where: { id } });
  if (!existing) throw new NotFoundError('Utilisateur');
  const user = await db.user.update({ where: { id }, data: { avatarUrl } });
  return toDTO(user);
}

export async function updateUserName(id: string, name: string): Promise<UserDTO> {
  const existing = await db.user.findUnique({ where: { id } });
  if (!existing) throw new NotFoundError('Utilisateur');
  const user = await db.user.update({ where: { id }, data: { name } });
  return toDTO(user);
}

export async function updateUserRole(id: string, role: Role): Promise<UserDTO> {
  const existing = await db.user.findUnique({ where: { id } });
  if (!existing) throw new NotFoundError('Utilisateur');
  const user = await db.user.update({ where: { id }, data: { role } });
  return toDTO(user);
}

export async function updateUserEnabled(id: string, enabled: boolean): Promise<UserDTO> {
  const existing = await db.user.findUnique({ where: { id } });
  if (!existing) throw new NotFoundError('Utilisateur');
  const user = await db.user.update({ where: { id }, data: { enabled } });
  return toDTO(user);
}

export async function deleteUser(id: string): Promise<void> {
  const existing = await db.user.findUnique({ where: { id } });
  if (!existing) throw new NotFoundError('Utilisateur');

  // Supprimer également dans Supabase Auth
  const { error } = await supabaseAdmin.auth.admin.deleteUser(existing.supabaseId);
  if (error) {
    throw new ForbiddenError(`Impossible de supprimer l'utilisateur: ${error.message}`);
  }

  await db.user.delete({ where: { id } });
}

export async function createContactMessage(data: {
  name: string;
  email: string;
  subject: string;
  message: string;
}): Promise<void> {
  await db.contactMessage.create({ data });
}
