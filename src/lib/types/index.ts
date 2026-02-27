import type {
  User as PrismaUser,
  Article as PrismaArticle,
  Photo as PrismaPhoto,
  Faq as PrismaFaq,
  ContactMessage as PrismaContactMessage,
  ArticleCategory,
  FaqCategory,
  ArticleStatus,
  OrderStatus,
  Role
} from '@prisma/client';

// ============================================================
// Re-exports Prisma types
// ============================================================
export type { ArticleCategory, FaqCategory, ArticleStatus, OrderStatus, Role };

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

// ============================================================
// Shop DTOs
// ============================================================

export type ProductCategoryDTO = {
  id: string;
  name: string;
  slug: string;
  order: number;
  createdAt: string;
};

export type ProductDTO = {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  stock: number;
  image: string | null;
  isActive: boolean;
  categoryId: string | null;
  category: ProductCategoryDTO | null;
  createdAt: string;
  updatedAt: string;
};

export type ProductCardDTO = Omit<ProductDTO, 'description'>;

export type CartItemDTO = {
  id: string;
  productId: string;
  quantity: number;
  product: {
    name: string;
    price: number;
    image: string | null;
    slug: string;
    stock: number;
  };
};

export type CartDTO = {
  id: string;
  userId: string;
  items: CartItemDTO[];
  updatedAt: string;
};

export type OrderItemDTO = {
  id: string;
  productId: string;
  quantity: number;
  price: number;
  product: { name: string };
};

export type OrderDTO = {
  id: string;
  userId: string | null;
  email: string;
  total: number;
  status: OrderStatus;
  stripeId: string | null;
  items: OrderItemDTO[];
  createdAt: string;
  updatedAt: string;
};

export type LocalCartItem = {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  image: string | null;
  slug: string;
};

export type ProductFilters = {
  categoryId?: string;
  search?: string;
  isActive?: boolean;
} & PaginationParams;

export type OrderFilters = {
  status?: OrderStatus;
  search?: string;
} & PaginationParams;
