# ShrimpShop — Guide de démarrage

## Prérequis

- Node.js >= 20
- pnpm (recommandé) ou npm
- Compte Supabase
- Compte Google Cloud (pour OAuth)

---

## 1. Installer les dépendances

```bash
pnpm install
# ou
npm install
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
| `DATABASE_URL` | Supabase → Settings → Database → Connection string (pooling) |
| `DIRECT_URL` | Supabase → Settings → Database → Connection string (direct) |
| `AUTH_SECRET` | `openssl rand -base64 32` |
| `GOOGLE_CLIENT_ID` | Google Cloud Console → OAuth 2.0 |
| `GOOGLE_CLIENT_SECRET` | Google Cloud Console → OAuth 2.0 |

---

## 3. Configurer Supabase

### 3.1 Auth — Google OAuth

1. Supabase → Authentication → Providers → Google
2. Activer Google
3. Entrer `Client ID` et `Client Secret` depuis Google Cloud Console
4. Ajouter l'URL de callback : `https://[votre-projet].supabase.co/auth/v1/callback`

### 3.2 Storage Buckets

Créer deux buckets publics dans Supabase → Storage :
- `articles` (public)
- `gallery` (public)

Politiques RLS pour les buckets :
```sql
-- Lecture publique
CREATE POLICY "Public read" ON storage.objects
  FOR SELECT USING (bucket_id IN ('articles', 'gallery'));

-- Upload authentifié uniquement
CREATE POLICY "Auth upload" ON storage.objects
  FOR INSERT WITH CHECK (auth.role() = 'authenticated' AND bucket_id IN ('articles', 'gallery'));

-- Suppression admin uniquement (optionnel)
CREATE POLICY "Service delete" ON storage.objects
  FOR DELETE USING (auth.role() = 'service_role');
```

---

## 4. Initialiser la base de données

```bash
# Générer le client Prisma
pnpm db:generate

# Créer les tables (migration)
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
2. Dans Supabase → Database → users, trouver votre compte
3. Changer `role` de `USER` à `ADMIN`

Ou via Prisma Studio :
```bash
pnpm db:studio
```

---

## 7. Build production

```bash
pnpm build
pnpm preview
```

---

## Structure du projet

```
src/
├── hooks.server.ts          # Auth + RBAC middleware
├── app.d.ts                 # Types globaux
├── app.html                 # Template HTML
├── app.css                  # Styles globaux Tailwind
├── lib/
│   ├── server/
│   │   ├── db.ts            # Client Prisma singleton
│   │   ├── supabase.ts      # Clients Supabase (SSR + admin)
│   │   ├── storage.ts       # Upload images Supabase
│   │   └── errors.ts        # Gestion d'erreurs centralisée
│   ├── services/
│   │   ├── article.service.ts
│   │   ├── faq.service.ts
│   │   ├── photo.service.ts
│   │   └── user.service.ts
│   ├── schemas/index.ts     # Validations Zod
│   ├── types/index.ts       # Types TypeScript
│   ├── utils/
│   │   ├── seo.ts
│   │   ├── sanitize.ts      # DOMPurify pour WYSIWYG
│   │   └── format.ts
│   └── components/
│       ├── Navbar.svelte
│       ├── Footer.svelte
│       ├── ArticleCard.svelte
│       └── admin/
│           └── ArticleForm.svelte (TipTap WYSIWYG)
└── routes/
    ├── +layout.svelte       # Layout global
    ├── +page.svelte         # Landing page
    ├── login/               # Page connexion
    ├── register/            # Page inscription
    ├── auth/
    │   ├── callback/        # OAuth callback
    │   └── logout/          # Déconnexion
    ├── articles/            # Liste articles (USER)
    │   └── [id]/            # Article détail (USER)
    ├── faq/                 # FAQ (USER)
    ├── admin/               # Backoffice (ADMIN)
    │   ├── articles/        # CRUD articles
    │   ├── gallery/         # CRUD galerie
    │   ├── faq/             # CRUD FAQ
    │   └── users/           # Gestion utilisateurs
    ├── api/
    │   └── upload/          # Endpoint upload Supabase
    └── sitemap.xml/         # SEO sitemap
```

---

## Recommandations techniques

### Performance
- **Images** : Utiliser Supabase Image Transformations (`?width=800&quality=75`)
- **Cache** : Ajouter des headers `Cache-Control` sur les pages publiques statiques
- **Lazy loading** : Déjà implémenté sur toutes les images

### Scalabilité
- **Edge functions** : Déployer sur Vercel Edge pour un TTI minimal
- **Cache Redis** : Upstash Redis pour mettre en cache les articles populaires
- **CDN** : Cloudflare devant Supabase Storage pour les assets

### Sécurité
- **RLS Supabase** : Activer Row Level Security sur toutes les tables
- **Rate limiting** : Ajouter sur les endpoints auth et contact
- **CSP Headers** : Configurer Content Security Policy dans `hooks.server.ts`

### Monitoring
- **Sentry** : Intégrer `@sentry/sveltekit` pour les erreurs
- **Posthog** : Analytics privacy-first
- **Supabase Dashboard** : Monitoring DB et Auth intégré

### CI/CD
```yaml
# .github/workflows/deploy.yml
name: Deploy
on: [push]
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

### Optimisation images Supabase
```typescript
// Ajouter des transformations Supabase dynamiquement
function getOptimizedUrl(url: string, width: number): string {
  return `${url}?width=${width}&quality=75&format=webp`;
}
```
