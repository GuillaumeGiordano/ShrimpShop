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

export const createArticleSchema = z.object({
  title: z.string().min(3, 'Titre requis').max(200),
  excerpt: z.string().min(10, 'Résumé requis').max(500),
  content: z.string().min(10, 'Contenu requis'),
  categoryId: z.string().optional().or(z.literal('')),
  imageUrl: z.string().url('URL invalide').optional().or(z.literal('')),
  status: z.enum(['DRAFT', 'PUBLISHED']).default('DRAFT'),
  published: z.coerce.boolean().default(false)
});

export const updateArticleSchema = createArticleSchema.partial();

export const articleFiltersSchema = z.object({
  categoryId: z.string().optional(),
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
  order: z.coerce.number().int().nonnegative().default(0),
  categoryId: z.string().optional().or(z.literal(''))
});

export const updatePhotoSchema = createPhotoSchema.partial();

// ============================================================
// FAQ Schemas
// ============================================================

export const createFaqSchema = z.object({
  categoryId: z.string().optional().or(z.literal('')),
  question: z.string().min(5, 'Question requise').max(500),
  answer: z.string().min(10, 'Réponse requise').max(5000),
  order: z.coerce.number().int().nonnegative().default(0)
});

export const updateFaqSchema = createFaqSchema.partial();

export const faqFiltersSchema = z.object({
  categoryId: z.string().optional(),
  search: z.string().optional(),
  ...paginationSchema.shape
});

// ============================================================
// User Schemas
// ============================================================

export const updateUserRoleSchema = z.object({
  role: z.enum(['USER', 'ADMIN'])
});

export const updateUserEnabledSchema = z.object({
  enabled: z.enum(['true', 'false']).transform((v) => v === 'true')
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
  bucket: z.enum(['articles', 'gallery', 'products', 'avatars']),
  file: z.instanceof(File).refine((f) => f.size <= 5 * 1024 * 1024, 'Fichier trop lourd (max 5Mo)').refine(
    (f) => ['image/jpeg', 'image/png', 'image/webp', 'image/avif'].includes(f.type),
    'Format invalide (jpeg, png, webp, avif uniquement)'
  )
});

// ============================================================
// Shop Schemas
// ============================================================

export const createProductCategorySchema = z.object({
  name: z.string().min(1, 'Nom requis').max(100),
  slug: z.string().min(1, 'Slug requis').max(100).regex(/^[a-z0-9-]+$/, 'Slug invalide (lettres, chiffres, tirets)'),
  order: z.coerce.number().int().default(0)
});

export const updateProductCategorySchema = createProductCategorySchema.partial();

export const createProductSchema = z.object({
  name: z.string().min(2, 'Nom requis').max(200),
  slug: z.string().min(2, 'Slug requis').max(200).regex(/^[a-z0-9-]+$/, 'Slug invalide (lettres, chiffres, tirets)'),
  description: z.string().min(10, 'Description trop courte'),
  price: z.coerce.number().positive('Prix invalide'),
  stock: z.coerce.number().int().min(0, 'Stock invalide'),
  image: z.string().url('URL invalide').optional().or(z.literal('')),
  isActive: z.coerce.boolean().default(true),
  categoryId: z.string().optional().or(z.literal(''))
});

export const updateProductSchema = createProductSchema.partial();

export const cartItemSchema = z.object({
  productId: z.string(),
  quantity: z.coerce.number().int().positive().max(99)
});

export const checkoutSchema = z.object({
  items: z
    .array(
      z.object({
        productId: z.string(),
        quantity: z.coerce.number().int().positive()
      })
    )
    .min(1, 'Panier vide'),
  email: z.string().email('Email invalide').optional()
});

// ============================================================
// Profile Schemas
// ============================================================

export const updateNameSchema = z.object({
  name: z.string().min(2, 'Nom trop court (min 2 caractères)').max(100)
});

export const updatePasswordSchema = z
  .object({
    password: z
      .string()
      .min(8, 'Min 8 caractères')
      .regex(/[A-Z]/, 'Doit contenir une majuscule')
      .regex(/[0-9]/, 'Doit contenir un chiffre'),
    confirmPassword: z.string()
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: 'Les mots de passe ne correspondent pas',
    path: ['confirmPassword']
  });

export const forgotPasswordSchema = z.object({
  email: z.string().email('Email invalide')
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
export type UpdateUserEnabledInput = z.infer<typeof updateUserEnabledSchema>;
export type UserFiltersInput = z.infer<typeof userFiltersSchema>;
export type CreateProductCategoryInput = z.infer<typeof createProductCategorySchema>;
export type UpdateProductCategoryInput = z.infer<typeof updateProductCategorySchema>;
export type CreateProductInput = z.infer<typeof createProductSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;
export type CartItemInput = z.infer<typeof cartItemSchema>;
export type CheckoutInput = z.infer<typeof checkoutSchema>;
export type UpdateNameInput = z.infer<typeof updateNameSchema>;
export type UpdatePasswordInput = z.infer<typeof updatePasswordSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
