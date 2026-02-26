import { z } from 'zod';

// ============================================================
// Shared
// ============================================================

export const paginationSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  perPage: z.coerce.number().int().positive().max(100).default(10)
});

// ============================================================
// Auth Schemas
// ============================================================

export const loginSchema = z.object({
  email: z.string().email('Email invalide'),
  password: z.string().min(6, 'Mot de passe trop court (min 6 caractères)')
});

export const registerSchema = z
  .object({
    name: z.string().min(2, 'Nom trop court (min 2 caractères)').max(100),
    email: z.string().email('Email invalide'),
    password: z
      .string()
      .min(8, 'Mot de passe trop court (min 8 caractères)')
      .regex(/[A-Z]/, 'Doit contenir au moins une majuscule')
      .regex(/[0-9]/, 'Doit contenir au moins un chiffre'),
    confirmPassword: z.string()
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Les mots de passe ne correspondent pas',
    path: ['confirmPassword']
  });

// ============================================================
// Contact Schema
// ============================================================

export const contactSchema = z.object({
  name: z.string().min(2, 'Nom requis').max(100),
  email: z.string().email('Email invalide'),
  subject: z.string().min(3, 'Sujet requis').max(200),
  message: z.string().min(20, 'Message trop court (min 20 caractères)').max(5000)
});

// ============================================================
// Article Schemas
// ============================================================

const articleCategories = [
  'NEOCARIDINA',
  'CARIDINA',
  'BREEDING',
  'WATER_QUALITY',
  'DISEASES',
  'EQUIPMENT',
  'FEEDING',
  'GENERAL'
] as const;

export const articleCategoryEnum = z.enum(articleCategories);

export const createArticleSchema = z.object({
  title: z.string().min(3, 'Titre requis').max(200),
  excerpt: z.string().min(10, 'Résumé requis').max(500),
  content: z.string().min(10, 'Contenu requis'),
  category: articleCategoryEnum,
  imageUrl: z.string().url('URL invalide').optional().or(z.literal('')),
  status: z.enum(['DRAFT', 'PUBLISHED']).default('DRAFT'),
  published: z.coerce.boolean().default(false)
});

export const updateArticleSchema = createArticleSchema.partial();

export const articleFiltersSchema = z.object({
  category: articleCategoryEnum.optional(),
  search: z.string().optional(),
  published: z.coerce.boolean().optional(),
  ...paginationSchema.shape
});

// ============================================================
// Photo Schemas
// ============================================================

export const createPhotoSchema = z.object({
  title: z.string().min(2, 'Titre requis').max(200),
  description: z.string().max(500).optional().or(z.literal('')),
  imageUrl: z.string().url('URL image invalide'),
  altText: z.string().max(200).optional().or(z.literal('')),
  order: z.coerce.number().int().nonnegative().default(0)
});

export const updatePhotoSchema = createPhotoSchema.partial();

// ============================================================
// FAQ Schemas
// ============================================================

const faqCategories = [
  'GENERAL',
  'SHIPPING',
  'CARE',
  'WATER_PARAMETERS',
  'COMPATIBILITY',
  'PAYMENT'
] as const;

export const faqCategoryEnum = z.enum(faqCategories);

export const createFaqSchema = z.object({
  category: faqCategoryEnum,
  question: z.string().min(5, 'Question requise').max(500),
  answer: z.string().min(10, 'Réponse requise').max(5000),
  order: z.coerce.number().int().nonnegative().default(0)
});

export const updateFaqSchema = createFaqSchema.partial();

export const faqFiltersSchema = z.object({
  category: faqCategoryEnum.optional(),
  search: z.string().optional(),
  ...paginationSchema.shape
});

// ============================================================
// User Schemas
// ============================================================

export const updateUserRoleSchema = z.object({
  role: z.enum(['USER', 'ADMIN'])
});

export const userFiltersSchema = z.object({
  search: z.string().optional(),
  role: z.enum(['USER', 'ADMIN']).optional(),
  ...paginationSchema.shape
});

// ============================================================
// Upload Schema
// ============================================================

export const uploadSchema = z.object({
  bucket: z.enum(['articles', 'gallery']),
  file: z.instanceof(File).refine((f) => f.size <= 5 * 1024 * 1024, 'Fichier trop lourd (max 5Mo)').refine(
    (f) => ['image/jpeg', 'image/png', 'image/webp', 'image/avif'].includes(f.type),
    'Format invalide (jpeg, png, webp, avif uniquement)'
  )
});

// ============================================================
// Inferred types
// ============================================================

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type ContactInput = z.infer<typeof contactSchema>;
export type CreateArticleInput = z.infer<typeof createArticleSchema>;
export type UpdateArticleInput = z.infer<typeof updateArticleSchema>;
export type ArticleFiltersInput = z.infer<typeof articleFiltersSchema>;
export type CreatePhotoInput = z.infer<typeof createPhotoSchema>;
export type UpdatePhotoInput = z.infer<typeof updatePhotoSchema>;
export type CreateFaqInput = z.infer<typeof createFaqSchema>;
export type UpdateFaqInput = z.infer<typeof updateFaqSchema>;
export type FaqFiltersInput = z.infer<typeof faqFiltersSchema>;
export type UpdateUserRoleInput = z.infer<typeof updateUserRoleSchema>;
export type UserFiltersInput = z.infer<typeof userFiltersSchema>;
