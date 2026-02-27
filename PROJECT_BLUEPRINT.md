# Blueprint Projet — ShrimpShop

> **Usage :** Ce document sert de prompt de référence pour générer un nouveau projet similaire.
> Modifie les sections marquées `[À ADAPTER]` pour décrire ton nouveau projet.
> Conserve les sections architecture/conventions telles quelles sauf besoin contraire.

---

## 1. Contexte du projet `[À ADAPTER]`

**Nom du projet :** ShrimpShop
**Description :** Site e-commerce vitrine dédié à la vente de crevettes d'aquarium.
**Langue :** Français (code, labels, commentaires, contenu).
**Déploiement cible :** Vercel (adapter-vercel, runtime nodejs20.x).

---

## 2. Stack technique (à conserver telle quelle)

| Couche | Technologie | Version |
|---|---|---|
| Framework | SvelteKit 5 | ^2.8 |
| UI | Svelte 5 (runes) | ^5.0 |
| Langage | TypeScript | ^5.7 |
| Styles | Tailwind CSS 3 | ^3.4 |
| ORM | Prisma | ^5.22 |
| Base de données | PostgreSQL (Supabase) | — |
| Auth | Supabase Auth (email + Google OAuth) | ^2.46 |
| Storage | Supabase Storage | — |
| Validation | Zod | ^3.23 |
| Paiement | Stripe | ^20.4 |
| WYSIWYG | TipTap (import dynamique SSR-safe) | ^3.20 |
| Graphiques | Chart.js (import dynamique SSR-safe) | ^4.5 |
| Toasts | svelte-sonner | ^0.3 |
| Tables admin | @tanstack/svelte-table | ^8.21 |
| Upload images | sharp (conversion webp, resize) | ^0.34 |
| Sanitisation HTML | isomorphic-dompurify | ^2.16 |
| Gestionnaire de paquets | pnpm | — |
| Runner TS (seed) | tsx | ^4.19 |

**Syntaxe Svelte 5 obligatoire :** `$state`, `$derived`, `$effect`, `$props`. Pas de syntaxe Svelte 4 (`export let`, `$:`).

---

## 3. Variables d'environnement `[À ADAPTER si nouveaux services]`

```env
# Supabase
PUBLIC_SUPABASE_URL=
PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Prisma / PostgreSQL
DATABASE_URL=          # pooled (PgBouncer port 6543, ?pgbouncer=true)
DIRECT_URL=            # direct (port 5432, pour migrations)

# Auth
AUTH_SECRET=           # 32 caractères aléatoires

# Google OAuth
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=

# Stripe
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
PUBLIC_STRIPE_PUBLISHABLE_KEY=

# App
PUBLIC_APP_URL=        # ex: https://monsite.fr
PUBLIC_APP_NAME=       # ex: ShrimpShop
PUBLIC_APP_DESCRIPTION=
```

---

## 4. Alias TypeScript (svelte.config.js)

| Alias | Chemin |
|---|---|
| `$lib` | `src/lib` |
| `$components` | `src/lib/components` |
| `$server` | `src/lib/server` |
| `$types` | `src/lib/types` |
| `$schemas` | `src/lib/schemas` |
| `$services` | `src/lib/services` |
| `$utils` | `src/lib/utils` |

---

## 5. Schéma Prisma `[À ADAPTER]`

> Décris ici tes modèles. Règles à respecter :
> - Noms de colonnes en `snake_case` via `@map`, propriétés TypeScript en `camelCase`
> - Toujours `@id @default(cuid())` pour les PK
> - Toujours `createdAt DateTime @default(now()) @map("created_at")`
> - `updatedAt DateTime @updatedAt @map("updated_at")` si nécessaire
> - Après toute modification : `pnpm db:generate` puis `pnpm db:migrate`

### Modèles actuels

```prisma
// ── ENUMS ──────────────────────────────────────────────────────

enum Role { USER  ADMIN }
enum ArticleStatus { DRAFT  PUBLISHED }
enum OrderStatus { PENDING  PAID  CANCELLED }

// ── MODÈLES ────────────────────────────────────────────────────

model User {
  id         String   @id @default(cuid())
  supabaseId String   @unique @map("supabase_id")
  name       String
  email      String   @unique
  role       Role     @default(USER)
  enabled    Boolean  @default(true)
  avatarUrl  String?  @map("avatar_url")
  createdAt  DateTime @default(now()) @map("created_at")
  updatedAt  DateTime @updatedAt @map("updated_at")
  @@map("users")
}

model ProductCategory {
  id        String    @id @default(cuid())
  name      String
  slug      String    @unique
  order     Int       @default(0)
  products  Product[]
  articles  Article[]
  faqs      Faq[]
  photos    Photo[]
  createdAt DateTime  @default(now()) @map("created_at")
  updatedAt DateTime  @updatedAt @map("updated_at")
  @@map("product_categories")
}

model Article {
  id          String           @id @default(cuid())
  title       String
  excerpt     String
  content     String           @db.Text
  categoryId  String?          @map("category_id")
  category    ProductCategory? @relation(fields: [categoryId], references: [id], onDelete: SetNull)
  imageUrl    String?          @map("image_url")
  status      ArticleStatus    @default(DRAFT)
  published   Boolean          @default(false)
  publishedAt DateTime?        @map("published_at")
  createdAt   DateTime         @default(now()) @map("created_at")
  updatedAt   DateTime         @updatedAt @map("updated_at")
  @@map("articles")
}

model Photo {
  id          String           @id @default(cuid())
  title       String
  description String?
  imageUrl    String           @map("image_url")
  altText     String?          @map("alt_text")
  order       Int              @default(0)
  categoryId  String?          @map("category_id")
  category    ProductCategory? @relation(fields: [categoryId], references: [id], onDelete: SetNull)
  createdAt   DateTime         @default(now()) @map("created_at")
  updatedAt   DateTime         @updatedAt @map("updated_at")
  @@map("photos")
}

model Faq {
  id         String           @id @default(cuid())
  categoryId String?          @map("category_id")
  category   ProductCategory? @relation(fields: [categoryId], references: [id], onDelete: SetNull)
  question   String
  answer     String           @db.Text
  order      Int              @default(0)
  createdAt  DateTime         @default(now()) @map("created_at")
  updatedAt  DateTime         @updatedAt @map("updated_at")
  @@map("faqs")
}

model ContactMessage {
  id        String   @id @default(cuid())
  name      String
  email     String
  subject   String
  message   String   @db.Text
  read      Boolean  @default(false)
  createdAt DateTime @default(now()) @map("created_at")
  @@map("contact_messages")
}

model Product {
  id          String           @id @default(cuid())
  name        String
  slug        String           @unique
  description String           @db.Text
  price       Float
  stock       Int              @default(0)
  image       String?
  isActive    Boolean          @default(true) @map("is_active")
  categoryId  String?          @map("category_id")
  category    ProductCategory? @relation(fields: [categoryId], references: [id], onDelete: SetNull)
  cartItems   CartItem[]
  orderItems  OrderItem[]
  createdAt   DateTime         @default(now()) @map("created_at")
  updatedAt   DateTime         @updatedAt @map("updated_at")
  @@map("products")
}

model Cart {
  id        String     @id @default(cuid())
  userId    String     @unique @map("user_id")
  items     CartItem[]
  createdAt DateTime   @default(now()) @map("created_at")
  updatedAt DateTime   @updatedAt @map("updated_at")
  @@map("carts")
}

model CartItem {
  id        String  @id @default(cuid())
  cartId    String  @map("cart_id")
  productId String  @map("product_id")
  quantity  Int
  cart      Cart    @relation(fields: [cartId], references: [id], onDelete: Cascade)
  product   Product @relation(fields: [productId], references: [id])
  @@unique([cartId, productId])
  @@map("cart_items")
}

model Order {
  id        String      @id @default(cuid())
  userId    String?     @map("user_id")
  email     String
  total     Float
  status    OrderStatus @default(PENDING)
  stripeId  String?     @map("stripe_id")
  items     OrderItem[]
  createdAt DateTime    @default(now()) @map("created_at")
  updatedAt DateTime    @updatedAt @map("updated_at")
  @@map("orders")
}

model OrderItem {
  id        String  @id @default(cuid())
  orderId   String  @map("order_id")
  productId String  @map("product_id")
  quantity  Int
  price     Float
  order     Order   @relation(fields: [orderId], references: [id])
  product   Product @relation(fields: [productId], references: [id])
  @@map("order_items")
}
```

---

## 6. Architecture serveur

### hooks.server.ts — 3 hooks en séquence

```
supabaseHook → authHook → routeGuardHook
```

| Hook | Rôle |
|---|---|
| `supabaseHook` | Crée le client Supabase SSR depuis les cookies. Expose `locals.safeGetSession()` (valide le JWT via `getUser()`). |
| `authHook` | Appelle `safeGetSession()`, charge le rôle Prisma dans `locals.userRole`. Déconnecte les users désactivés. |
| `routeGuardHook` | RBAC : `/admin/*` → ADMIN requis, `PRIVATE_ROUTES` → auth requise, routes auth → redirige si connecté. |

**Routes protégées :**
```typescript
const PRIVATE_ROUTES = ['/articles', '/faq', '/profile'];
const ADMIN_ROUTES   = ['/admin'];
const AUTH_ROUTES    = ['/login', '/register'];
```

### src/lib/server/

| Fichier | Rôle |
|---|---|
| `db.ts` | Singleton Prisma (`globalThis.__prisma` pour survivre au hot-reload) |
| `supabase.ts` | `createSupabaseServerClient(cookies)` pour SSR + `supabaseAdmin` (service-role) |
| `storage.ts` | `uploadImage(bucket, file, folder?)` — resize → webp via sharp, sanitise le nom de fichier. `deleteImage()`, `extractStoragePath()`. |
| `errors.ts` | Classes typées : `NotFoundError`, `UnauthorizedError`, `ForbiddenError`, `ValidationError`. `throwKitError()` pour SvelteKit, `formatApiError()` pour JSON. |
| `stripe.ts` | Client Stripe (import `$env/dynamic/private`) |

### src/lib/services/ — couche métier

Chaque service wrape Prisma, retourne des DTOs (dates en ISO string via `toDTO()`).

| Service | Fonctions principales |
|---|---|
| `user.service.ts` | `getUsers`, `getUserById`, `getUserBySupabaseId`, `getUserRoleBySupabaseId`, `upsertUser`, `updateUserName`, `updateUserAvatar`, `updateUserRole`, `updateUserEnabled`, `deleteUser`, `createContactMessage` |
| `article.service.ts` | `getArticles`, `getArticleById`, `createArticle`, `updateArticle`, `deleteArticle` |
| `faq.service.ts` | `getFaqs`, `getFaqById`, `createFaq`, `updateFaq`, `deleteFaq` |
| `photo.service.ts` | `getPhotos`, `getPhotoById`, `createPhoto`, `updatePhoto`, `deletePhoto` |
| `product.service.ts` | `getProducts`, `getAllProducts`, `getProductById`, `getProductBySlug`, `createProduct`, `updateProduct`, `deleteProduct`, `decrementStock` |
| `product-category.service.ts` | `getProductCategories`, `getProductCategoryBySlug`, `createProductCategory`, `updateProductCategory`, `deleteProductCategory` |
| `cart.service.ts` | `getCartByUserId`, `upsertCartItem`, `removeCartItem`, `clearCart`, `mergeGuestCart` |
| `order.service.ts` | `createOrder`, `getOrders`, `getOrderById`, `getOrdersByUserId`, `updateOrderStatus` |

### src/lib/schemas/index.ts — Zod

Tous les schemas de validation + types inférés exportés.
Schemas présents : `login`, `register`, `contact`, `createArticle`, `updateArticle`, `articleFilters`, `createPhoto`, `updatePhoto`, `createFaq`, `updateFaq`, `faqFilters`, `updateUserRole`, `updateUserEnabled`, `userFilters`, `upload`, `createProductCategory`, `updateProductCategory`, `createProduct`, `updateProduct`, `cartItem`, `checkout`, `updateName`, `updatePassword`, `forgotPassword`, `pagination`.

### src/lib/types/index.ts — DTOs

DTOs : `UserDTO`, `ArticleDTO`, `ArticleCardDTO`, `PhotoDTO`, `FaqDTO`, `ContactMessageDTO`, `ProductCategoryDTO`, `ProductDTO`, `ProductCardDTO`, `CartItemDTO`, `CartDTO`, `OrderItemDTO`, `OrderDTO`, `LocalCartItem`.
Génériques : `PaginatedResponse<T>`, `ApiResponse<T>`, `ApiSuccess<T>`, `ApiError`.
Filtres : `ArticleFilters`, `FaqFilters`, `UserFilters`, `ProductFilters`, `OrderFilters`.

---

## 7. Supabase Storage — Buckets

| Bucket | Usage | Public |
|---|---|---|
| `articles` | Images des articles | Oui |
| `gallery` | Photos galerie | Oui |
| `products` | Images produits | Oui |
| `avatars` | Photos de profil | Oui |

**Règles de sécurité (policies) :** lecture publique, écriture authentifiée.
Upload via `POST /api/upload` (endpoint commun) ou directement depuis une action serveur (ex: avatar).
Toute image est convertie en `.webp`, redimensionnée max 1200px, nom de fichier sanitisé.

---

## 8. Toutes les routes `[À ADAPTER]`

### Publiques

| Route | Fichiers | Description |
|---|---|---|
| `/` | `+page.server.ts` + `+page.svelte` | Page d'accueil (hero, features, pricing, contact form) |
| `/shop` | idem | Liste des produits actifs avec filtres catégorie |
| `/shop/[slug]` | idem | Fiche produit détaillée |
| `/checkout` | `+page.svelte` | Page de paiement Stripe (redirect vers Stripe Checkout) |
| `/checkout/success` | `+page.svelte` | Confirmation commande |
| `/checkout/cancel` | `+page.svelte` | Annulation commande |
| `/robots.txt` | `+server.ts` | Génère robots.txt |
| `/sitemap.xml` | `+server.ts` | Génère sitemap.xml dynamique |

### Auth

| Route | Description |
|---|---|
| `/login` | Email/password + Google OAuth. Lien "mot de passe oublié". |
| `/register` | Inscription email/password |
| `/forgot-password` | Envoi email reset (Supabase `resetPasswordForEmail`) |
| `/reset-password` | Formulaire nouveau mot de passe (guard session) |
| `/auth/callback` | Échange code OAuth → session. Param `next` pour redirect post-reset. Sync user Prisma via `upsertUser()`. |
| `/auth/logout` | `POST` → `supabase.auth.signOut()` |

### Privées (USER requis)

| Route | Description |
|---|---|
| `/articles` | Liste articles publiés (filtre catégorie, pagination) |
| `/articles/[id]` | Article détaillé (HTML sanitisé avec DOMPurify) |
| `/faq` | Liste FAQs par catégorie |
| `/profile` | Profil utilisateur : modifier nom, avatar (upload Supabase), mot de passe, historique commandes |

### Admin (ADMIN requis)

| Route | Description |
|---|---|
| `/admin` | Dashboard : stats, 2 graphiques Chart.js (revenus 7j, statuts commandes) |
| `/admin/articles` | Liste articles avec filtres + pagination |
| `/admin/articles/new` | Créer article (TipTap WYSIWYG, upload image) |
| `/admin/articles/[id]/edit` | Modifier article |
| `/admin/gallery` | Liste photos |
| `/admin/gallery/new` | Ajouter photo (upload Supabase) |
| `/admin/gallery/[id]/edit` | Modifier photo |
| `/admin/faq` | Liste FAQs |
| `/admin/faq/new` | Créer FAQ |
| `/admin/faq/[id]/edit` | Modifier FAQ |
| `/admin/users` | Liste utilisateurs, changer rôle/activer/désactiver |
| `/admin/shop/products` | Liste produits |
| `/admin/shop/products/new` | Créer produit |
| `/admin/shop/products/[id]/edit` | Modifier produit |
| `/admin/shop/categories` | Gérer catégories partagées |
| `/admin/shop/orders` | Liste commandes avec filtres |
| `/admin/shop/orders/[id]` | Détail commande + changer statut |

### API (endpoints JSON)

| Route | Méthode | Description |
|---|---|---|
| `/api/upload` | `POST` | Upload image vers Supabase Storage. Auth requise. Body: `multipart/form-data` avec `file` + `bucket`. |
| `/api/cart` | `GET` | Récupère le panier de l'utilisateur connecté |
| `/api/cart` | `POST` | Ajoute/met à jour un item (`{ productId, quantity }`) |
| `/api/cart` | `DELETE` | Supprime un item (`?productId=`) |
| `/api/cart/merge` | `POST` | Fusionne panier invité → panier connecté (appelé après login) |
| `/api/checkout` | `POST` | Crée une session Stripe Checkout. Prix lus depuis DB (jamais du client). |
| `/api/webhooks/stripe` | `POST` | Webhook Stripe. Corps lu en texte brut (`request.text()`). Met à jour le statut de commande sur `payment_intent.succeeded`. |

---

## 9. Composants `[À ADAPTER]`

### src/lib/components/

| Composant | Description |
|---|---|
| `Navbar.svelte` | Sticky, liens publics + privés (selon session), panier (badge count), burger mobile |
| `Footer.svelte` | Footer global |
| `ArticleCard.svelte` | Card article pour la liste |

### src/lib/components/admin/

| Composant | Description |
|---|---|
| `ArticleForm.svelte` | Formulaire article avec TipTap (import dynamique `onMount`), upload image via `/api/upload` |
| `ProductForm.svelte` | Formulaire produit avec upload image |
| `RevenueChart.svelte` | Bar chart Chart.js (revenus 7 derniers jours). Import dynamique `onMount`. |
| `OrderStatusChart.svelte` | Doughnut Chart.js (répartition PENDING/PAID/CANCELLED). Import dynamique `onMount`. |

### src/lib/components/shop/

| Composant | Description |
|---|---|
| `CartDrawer.svelte` | Drawer panier latéral (overlay) |
| `ProductCard.svelte` | Card produit pour la boutique |
| `QuantitySelector.svelte` | Sélecteur de quantité +/- |

---

## 10. Stores

| Store | Fichier | Description |
|---|---|---|
| `cartStore` | `src/lib/stores/cart.svelte.ts` | Pattern objet Svelte 5 avec getters (`count`, `total`, `items`). Méthodes : `init()`, `toggle()`, `add()`, `remove()`, `clear()`. Persistance `localStorage` pour invités, sync API pour connectés. |

---

## 11. Utils

| Fichier | Exports |
|---|---|
| `format.ts` | `formatDate`, `formatDateShort`, `formatPrice`, `truncate`, `ROLE_LABELS`, `ORDER_STATUS_LABELS` |
| `sanitize.ts` | `sanitizeHtml(html)` via isomorphic-dompurify. Autorise seulement les iframes YouTube/YouTube-nocookie. |
| `seo.ts` | Helpers pour les balises meta SEO |
| `cart.ts` | Helpers calcul panier côté client |

---

## 12. Layout global

### `src/routes/+layout.server.ts`
Charge `session`, `userRole` depuis `locals` et les passe à tous les layouts enfants.

### `src/routes/+layout.svelte`
- Inclut `Navbar`, `Footer`, `CartDrawer`
- Inclut `<Toaster>` (svelte-sonner)
- Passe `session` et `userRole` à la Navbar

### `src/routes/admin/+layout.svelte`
- Sidebar avec liens : Dashboard, Articles, Galerie, FAQ, Utilisateurs, Produits, Catégories shop, Commandes
- Responsive (menu burger mobile)
- Affiche email + badge ADMIN en bas

---

## 13. Flux auth complet

```
1. /login → action googleLogin → Supabase OAuth → redirect /auth/callback?code=...
2. /auth/callback → exchangeCodeForSession → upsertUser (sync Prisma) → redirect /articles (ou next=)
3. hooks.server.ts → safeGetSession() → getUserRoleBySupabaseId() → locals.session / locals.user / locals.userRole
4. routeGuardHook → protège les routes selon rôle
5. /forgot-password → resetPasswordForEmail → email avec lien /auth/callback?next=/reset-password
6. /reset-password → updateUser({ password }) → redirect /profile
```

---

## 14. Flux e-commerce Stripe

```
1. Boutique /shop → ajouter au panier → cartStore (localStorage si invité, API si connecté)
2. /checkout → POST /api/checkout → crée session Stripe (prix depuis DB) → redirect Stripe
3. Stripe → paiement → POST /api/webhooks/stripe → payment_intent.succeeded → createOrder + clearCart
4. Stripe → redirect /checkout/success ou /checkout/cancel
5. Panier invité → connecté : POST /api/cart/merge
```

---

## 15. Conventions de code (à respecter impérativement)

- **Langue :** tout en français (labels, messages, commentaires, noms de variables métier)
- **DTO pattern :** chaque service expose une fonction `toDTO()` qui convertit les `Date` en `string` ISO
- **Zod partout :** toute donnée entrante (form, API) est validée avec un schema Zod avant traitement
- **Erreurs typées :** utiliser les classes de `$server/errors.ts`, jamais de `throw new Error()` directement dans les services
- **Actions SvelteKit :** utiliser `fail(status, data)` pour les erreurs de formulaire, `redirect(303, path)` pour les redirections
- **`use:enhance`** sur tous les formulaires pour un comportement progressif sans rechargement complet
- **Toast pattern :** `$effect(() => { if (form?.success) toast.success(...) })` dans les composants Svelte
- **Images :** toujours passer par `uploadImage()` (storage.ts) qui sanitise, resize et convertit en webp
- **Seed idempotent :** toujours utiliser `upsert` avec des IDs fixes préfixés `seed-`
- **Chart.js :** toujours importer dynamiquement dans `onMount` pour éviter les erreurs SSR

---

## 16. Scripts disponibles

```bash
pnpm dev                  # Serveur de développement
pnpm build                # Build production (inclut prisma generate)
pnpm check                # svelte-check + tsc
pnpm lint                 # prettier + eslint
pnpm format               # prettier --write

pnpm db:generate          # Regénère le client Prisma après modif schema
pnpm db:migrate           # Crée et applique une migration de dev
pnpm db:migrate:deploy    # Applique les migrations en production
pnpm db:studio            # Ouvre Prisma Studio
pnpm db:seed              # Exécute prisma/seed.ts (tsx)
```

---

## 17. Ce qu'il faut me donner pour un nouveau projet `[INSTRUCTIONS]`

Pour adapter ce blueprint à un nouveau projet, fournis-moi :

### A. Contexte général
```
Nom du projet : ...
Description courte : ...
Langue : ...
Modules à conserver : Auth / Shop Stripe / Blog/Articles / FAQ / Galerie / Profile / [autre]
Modules à retirer : ...
Modules à ajouter : ...
```

### B. Schéma de base de données
```
Décris tes modèles avec :
- Nom du modèle
- Champs (nom, type, obligatoire/optionnel, valeur par défaut)
- Relations entre modèles (1-N, N-N, etc.)
- Enums nécessaires
```

### C. Pages souhaitées
```
Pour chaque page :
- URL
- Accès : public / connecté / admin
- Contenu / fonctionnalités attendues
```

### D. Modifications spécifiques
```
- Champs à ajouter/retirer sur les formulaires existants
- Nouvelles règles métier
- Comportements spécifiques à implémenter
```

### E. Données de seed
```
Pour chaque table : donne des exemples de données réalistes à insérer
(5-10 entrées par table principale)
```
