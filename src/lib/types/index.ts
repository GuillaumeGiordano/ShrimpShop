import type {
  User as PrismaUser,
  Article as PrismaArticle,
  Photo as PrismaPhoto,
  Faq as PrismaFaq,
  ContactMessage as PrismaContactMessage,
  ArticleCategory,
  FaqCategory,
  ArticleStatus,
  Role
} from '@prisma/client';

// ============================================================
// Re-exports Prisma types
// ============================================================
export type { ArticleCategory, FaqCategory, ArticleStatus, Role };

// ============================================================
// Domain types
// ============================================================

export type User = PrismaUser;
export type Article = PrismaArticle;
export type Photo = PrismaPhoto;
export type Faq = PrismaFaq;
export type ContactMessage = PrismaContactMessage;

// ============================================================
// DTO types (for API responses)
// ============================================================

export type UserDTO = {
  id: string;
  name: string;
  email: string;
  role: Role;
  avatarUrl: string | null;
  createdAt: string;
};

export type ArticleDTO = {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  category: ArticleCategory;
  imageUrl: string | null;
  status: ArticleStatus;
  published: boolean;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type ArticleCardDTO = Omit<ArticleDTO, 'content'>;

export type PhotoDTO = {
  id: string;
  title: string;
  description: string | null;
  imageUrl: string;
  altText: string | null;
  order: number;
  createdAt: string;
};

export type FaqDTO = {
  id: string;
  category: FaqCategory;
  question: string;
  answer: string;
  order: number;
  createdAt: string;
};

export type ContactMessageDTO = {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  read: boolean;
  createdAt: string;
};

// ============================================================
// Pagination
// ============================================================

export type PaginatedResponse<T> = {
  data: T[];
  total: number;
  page: number;
  perPage: number;
  totalPages: number;
};

export type PaginationParams = {
  page?: number;
  perPage?: number;
};

// ============================================================
// API Response
// ============================================================

export type ApiSuccess<T> = {
  success: true;
  data: T;
  message?: string;
};

export type ApiError = {
  success: false;
  error: string;
  code?: string;
  details?: unknown;
};

export type ApiResponse<T> = ApiSuccess<T> | ApiError;

// ============================================================
// Auth
// ============================================================

export type AuthUser = {
  id: string;
  email: string;
  name: string;
  role: Role;
  avatarUrl: string | null;
};

// ============================================================
// Upload
// ============================================================

export type UploadResult = {
  url: string;
  path: string;
  bucket: string;
};

// ============================================================
// SEO
// ============================================================

export type SEOMeta = {
  title: string;
  description: string;
  image?: string;
  url?: string;
  type?: 'website' | 'article';
  noindex?: boolean;
};

// ============================================================
// Filters
// ============================================================

export type ArticleFilters = {
  category?: ArticleCategory;
  search?: string;
  published?: boolean;
} & PaginationParams;

export type FaqFilters = {
  category?: FaqCategory;
  search?: string;
} & PaginationParams;

export type UserFilters = {
  search?: string;
  role?: Role;
} & PaginationParams;
