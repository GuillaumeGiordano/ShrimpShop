# ShrimpShop — Guide de démarrage

## Prérequis

- Node.js >= 20
- pnpm (recommandé) ou npm
- Compte Supabase
- Compte Google Cloud (pour OAuth)
- Compte Stripe (pour le paiement)

---

## 1. Installer les dépendances

```bash
pnpm install
```

---

## 2. Configurer les variables d'environnement

```bash
cp .env.example .env
```

Remplissez le fichier `.env` avec :

| Variable | Source |
|---|---|
| `PUBLIC_SUPABASE_URL` | Supabase → Settings → API |
| `PUBLIC_SUPABASE_ANON_KEY` | Supabase → Settings → API |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase → Settings → API |
| `DATABASE_URL` | Supabase → Settings → Database → Connection string (pooling, port 6543) |
| `DIRECT_URL` | Supabase → Settings → Database → Connection string (direct, port 5432) |
| `AUTH_SECRET` | `openssl rand -base64 32` |
| `GOOGLE_CLIENT_ID` | Google Cloud Console → OAuth 2.0 |
| `GOOGLE_CLIENT_SECRET` | Google Cloud Console → OAuth 2.0 |
| `STRIPE_SECRET_KEY` | Stripe Dashboard → Developers → API keys |
| `STRIPE_WEBHOOK_SECRET` | Stripe Dashboard → Developers → Webhooks |
| `PUBLIC_STRIPE_PUBLISHABLE_KEY` | Stripe Dashboard → Developers → API keys |

---

## 3. Configurer Supabase

### 3.1 Auth — Google OAuth

1. Supabase → Authentication → Providers → Google
2. Activer Google
3. Entrer `Client ID` et `Client Secret` depuis Google Cloud Console
4. Ajouter l'URL de callback : `https://[votre-projet].supabase.co/auth/v1/callback`

### 3.2 Storage Buckets

Créer trois buckets **publics** dans Supabase → Storage :

- `articles`
- `gallery`
- `products`

Politiques RLS pour les buckets :

```sql
-- Lecture publique
CREATE POLICY "Public read" ON storage.objects
  FOR SELECT USING (bucket_id IN ('articles', 'gallery', 'products'));

-- Upload authentifié uniquement
CREATE POLICY "Auth upload" ON storage.objects
  FOR INSERT WITH CHECK (
    auth.role() = 'authenticated'
    AND bucket_id IN ('articles', 'gallery', 'products')
  );

-- Suppression via service role (admin)
CREATE POLICY "Service delete" ON storage.objects
  FOR DELETE USING (auth.role() = 'service_role');
```

---

## 4. Initialiser la base de données

```bash
# Générer le client Prisma
pnpm db:generate

# Créer et appliquer toutes les migrations
pnpm db:migrate

# (Optionnel) Peupler avec des données de démonstration
pnpm db:seed
```

---

## 5. Lancer en développement

```bash
pnpm dev
```

Ouvrir : http://localhost:5173

---

## 6. Créer le premier admin

1. S'inscrire sur le site avec votre email
2. Dans Supabase → Database → Table Editor → `users`, trouver votre compte
3. Changer `role` de `USER` à `ADMIN`

Ou via Prisma Studio :

```bash
pnpm db:studio
```

---

## 7. Configurer Stripe

### 7.1 Clés API

Dans le [Dashboard Stripe](https://dashboard.stripe.com/apikeys), récupérez :
- **Clé publique** (`pk_test_...`) → `PUBLIC_STRIPE_PUBLISHABLE_KEY`
- **Clé secrète** (`sk_test_...`) → `STRIPE_SECRET_KEY`

### 7.2 Webhook local (développement)

Installez la [Stripe CLI](https://stripe.com/docs/stripe-cli) puis :

```bash
stripe login
stripe listen --forward-to localhost:5173/api/webhooks/stripe
```

La CLI affiche le `STRIPE_WEBHOOK_SECRET` (`whsec_...`) à copier dans votre `.env`.

### 7.3 Webhook en production

Dans Stripe Dashboard → Developers → Webhooks :

1. Ajouter un endpoint : `https://votre-domaine.com/api/webhooks/stripe`
2. Événements à écouter : `checkout.session.completed`
3. Copier le signing secret dans `STRIPE_WEBHOOK_SECRET`

---

## 8. Build production

```bash
pnpm build
pnpm preview
```

### Migrations en production

```bash
pnpm db:migrate:deploy
```

---

## Structure du projet

```
src/
├── hooks.server.ts              # Auth Supabase + RBAC (3 hooks en séquence)
├── app.d.ts                     # Types globaux SvelteKit
├── lib/
│   ├── server/
│   │   ├── db.ts                # Client Prisma singleton
│   │   ├── supabase.ts          # Clients Supabase (SSR + admin)
│   │   ├── storage.ts           # Upload images Supabase
│   │   ├── stripe.ts            # Client Stripe
│   │   └── errors.ts            # Classes d'erreurs + helpers
│   ├── services/
│   │   ├── article.service.ts
│   │   ├── faq.service.ts
│   │   ├── photo.service.ts
│   │   ├── user.service.ts
│   │   ├── product-category.service.ts
│   │   ├── product.service.ts
│   │   ├── cart.service.ts
│   │   └── order.service.ts
│   ├── stores/
│   │   └── cart.svelte.ts       # Store panier global (Svelte 5 runes)
│   ├── schemas/index.ts         # Schémas Zod + types inférés
│   ├── types/index.ts           # DTOs et types TypeScript
│   ├── utils/
│   │   ├── cart.ts              # Helpers localStorage panier
│   │   ├── format.ts            # formatDate, formatPrice, labels
│   │   └── sanitize.ts          # DOMPurify pour contenu WYSIWYG
│   └── components/
│       ├── Navbar.svelte
│       ├── Footer.svelte
│       ├── shop/
│       │   ├── ProductCard.svelte
│       │   ├── CartDrawer.svelte
│       │   └── QuantitySelector.svelte
│       └── admin/
│           ├── ArticleForm.svelte   # TipTap WYSIWYG articles
│           └── ProductForm.svelte   # TipTap WYSIWYG produits
└── routes/
    ├── +layout.svelte           # Layout global
    ├── +page.svelte             # Landing page
    ├── login/                   # Connexion
    ├── register/                # Inscription
    ├── auth/
    │   ├── callback/            # OAuth callback (sync user Prisma)
    │   └── logout/
    ├── shop/                    # Boutique (public)
    │   └── [slug]/              # Page produit
    ├── checkout/                # Récapitulatif panier
    │   ├── success/             # Confirmation commande
    │   └── cancel/              # Annulation paiement
    ├── articles/                # Articles (USER)
    │   └── [id]/
    ├── faq/                     # FAQ (USER)
    ├── admin/                   # Backoffice (ADMIN)
    │   ├── articles/
    │   ├── gallery/
    │   ├── faq/
    │   ├── users/
    │   └── shop/
    │       ├── products/        # CRUD produits
    │       ├── categories/      # CRUD catégories
    │       └── orders/          # Suivi commandes
    └── api/
        ├── upload/              # Upload Supabase Storage
        ├── cart/                # Panier DB (GET/POST/DELETE)
        │   └── merge/           # Fusion localStorage → DB au login
        ├── checkout/            # Création session Stripe
        └── webhooks/stripe/     # Réception événements Stripe
```

---

## Flux de paiement

```
Client                    SvelteKit              Stripe
  │                           │                    │
  │── POST /api/checkout ──>  │                    │
  │   { items, email? }       │── create session ─>│
  │                           │<─ { url } ─────────│
  │<── { sessionUrl } ──────  │                    │
  │                           │                    │
  │── redirect ──────────────────────────────────>│
  │                           │                    │ (paiement)
  │<── redirect /checkout/success ────────────────│
  │                           │                    │
  │                           │<─ webhook: checkout.session.completed
  │                           │   createOrder()    │
  │                           │   clearCart()      │
```

---

## Recommandations techniques

### Sécurité
- Les prix sont **toujours lus depuis la base de données** lors du checkout — jamais du client
- Le webhook Stripe vérifie la signature cryptographique avant tout traitement
- **RLS Supabase** : activer Row Level Security sur toutes les tables applicatives
- **Rate limiting** : ajouter sur les endpoints auth, contact et checkout

### Performance
- **Images** : utiliser les transformations Supabase (`?width=800&quality=75`)
- **Lazy loading** : déjà implémenté sur toutes les images
- **Cache** : ajouter des headers `Cache-Control` sur les pages publiques statiques

### Scalabilité
- **Edge functions** : déployer sur Vercel Edge pour un TTI minimal
- **Cache Redis** : Upstash Redis pour les listes de produits populaires
- **CDN** : Cloudflare devant Supabase Storage

### Monitoring
- **Sentry** : intégrer `@sentry/sveltekit` pour la capture d'erreurs
- **Posthog** : analytics privacy-first
- **Supabase Dashboard** : monitoring DB et Auth intégré

### CI/CD

```yaml
# .github/workflows/deploy.yml
name: Deploy
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
      - run: pnpm install && pnpm check && pnpm build
      - run: pnpm db:migrate:deploy
        env:
          DIRECT_URL: ${{ secrets.DIRECT_URL }}
```
