# 🦐 ShrimpShop

Site e-commerce vitrine pour la vente de crevettes d'aquarium. Construit avec SvelteKit 5, Prisma, Supabase et Stripe.

---

## Fonctionnalités

### Boutique publique
- Catalogue produits avec filtres par catégorie et recherche
- Pages produit détaillées avec éditeur WYSIWYG
- Panier persistant (localStorage + synchronisation DB si connecté)
- Checkout sécurisé via Stripe (redirection Stripe Checkout)
- Pages de confirmation et d'annulation de commande

### Espace membres
- Inscription / Connexion email + Google OAuth (Supabase Auth)
- Accès aux articles et à la FAQ

### Backoffice admin
- Gestion des produits (CRUD complet, upload image, éditeur TipTap)
- Gestion des catégories de produits
- Suivi des commandes avec changement de statut
- Gestion des articles (WYSIWYG, publication)
- Galerie photos, FAQ, utilisateurs

---

## Stack technique

| Couche | Technologie |
|---|---|
| Framework | SvelteKit 5 (Svelte 5 runes) |
| Langage | TypeScript |
| Base de données | PostgreSQL via Supabase (Prisma 5) |
| Auth | Supabase Auth (email + Google OAuth) |
| Storage | Supabase Storage |
| Paiement | Stripe Checkout |
| Style | Tailwind CSS 3 |
| Validation | Zod |
| Éditeur | TipTap WYSIWYG |
| Toasts | svelte-sonner |

---

## Démarrage rapide

```bash
# Cloner le projet
git clone <repo-url>
cd shrimp-shop

# Installer les dépendances
pnpm install

# Configurer l'environnement
cp .env.example .env
# → Remplir .env avec vos clés (Supabase, Stripe, Google OAuth)

# Initialiser la base de données
pnpm db:migrate

# Lancer en développement
pnpm dev
```

Voir [GETTING_STARTED.md](./GETTING_STARTED.md) pour le guide de configuration complet.

---

## Commandes utiles

```bash
pnpm dev              # Serveur de développement
pnpm build            # Build production
pnpm check            # TypeScript + svelte-check
pnpm lint             # Prettier + ESLint
pnpm format           # Formatage automatique

pnpm db:generate      # Regénérer le client Prisma
pnpm db:migrate       # Créer et appliquer une migration
pnpm db:studio        # Ouvrir Prisma Studio
pnpm db:seed          # Peupler la base avec des données de démo
```

---

## Structure principale

```
src/
├── lib/
│   ├── server/          # Prisma, Supabase, Stripe, erreurs
│   ├── services/        # Logique métier (produits, panier, commandes…)
│   ├── stores/          # Store panier Svelte 5 runes
│   ├── components/      # Composants UI (shop, admin)
│   ├── schemas/         # Validation Zod
│   ├── types/           # Types TypeScript + DTOs
│   └── utils/           # Format, sanitize, cart localStorage
└── routes/
    ├── shop/            # Boutique publique
    ├── checkout/        # Panier + paiement Stripe
    ├── admin/shop/      # Backoffice produits, catégories, commandes
    ├── api/             # cart, checkout, webhooks/stripe, upload
    └── admin/           # Backoffice articles, galerie, FAQ, users
```

---

## Variables d'environnement

Voir `.env.example` pour la liste complète. Les variables requises :

- **Supabase** : `PUBLIC_SUPABASE_URL`, `PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`
- **Base de données** : `DATABASE_URL` (pooling), `DIRECT_URL` (migrations)
- **Auth** : `AUTH_SECRET`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`
- **Stripe** : `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `PUBLIC_STRIPE_PUBLISHABLE_KEY`

---

## Licence

Usage privé — tous droits réservés.
