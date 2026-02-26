<script lang="ts">
  import { enhance } from '$app/forms';
  import { toast } from 'svelte-sonner';
  import ArticleCard from '$lib/components/ArticleCard.svelte';
  import type { PageData, ActionData } from './$types';

  let { data, form }: { data: PageData; form: ActionData } = $props();

  let contactLoading = $state(false);

  $effect(() => {
    if (form?.success) toast.success('Message envoyé ! Nous vous répondrons rapidement.');
  });

  // Pricing plans
  const plans = [
    {
      name: 'Starter',
      emoji: '🌿',
      badge: 'Particulier',
      price: '19',
      description: 'Idéal pour débuter en aquariophilie',
      features: [
        '5 crevettes garanties vivantes',
        'Neocaridina mixte',
        'Guide de démarrage',
        'Support email 48h',
        'Livraison express'
      ],
      cta: 'Commencer',
      highlighted: false
    },
    {
      name: 'Pro',
      emoji: '⚗️',
      badge: 'Éleveur',
      price: '49',
      description: 'Pour les aquariophiles passionnés',
      features: [
        '15 crevettes + 2 bonus',
        'Espèces au choix',
        'Fiche paramètres eau',
        'Support prioritaire 24h',
        'Emballage premium',
        'Garantie 7 jours'
      ],
      cta: 'Choisir Pro',
      highlighted: true
    },
    {
      name: 'Premium',
      emoji: '💎',
      badge: 'Rare',
      price: '99',
      description: 'Variétés rares sélectionnées',
      features: [
        '10 spécimens rares',
        'Taiwan Bee / Crystal Red',
        'Certificat d\'origine',
        'Support dédié',
        'Suivi livraison temps réel',
        'Accès collection exclusive'
      ],
      cta: 'Collection rare',
      highlighted: false
    }
  ];
</script>

<svelte:head>
  <title>{data.meta.title}</title>
  <meta name="description" content={data.meta.description} />
  <meta property="og:title" content={data.meta.title} />
  <meta property="og:description" content={data.meta.description} />
  <meta property="og:type" content="website" />
</svelte:head>

<!-- ============================================================
     HERO SECTION
     ============================================================ -->
<section
  class="relative flex min-h-[90vh] items-center justify-center overflow-hidden bg-gradient-to-br from-slate-900 via-aqua-900 to-slate-900"
>
  <!-- Animated background -->
  <div class="absolute inset-0 overflow-hidden">
    <div
      class="absolute -left-20 top-20 h-72 w-72 rounded-full bg-aqua-500/20 blur-3xl animate-pulse"
    ></div>
    <div
      class="absolute -right-20 bottom-20 h-96 w-96 rounded-full bg-aqua-400/10 blur-3xl animate-pulse"
      style="animation-delay: 1s"
    ></div>
    <div
      class="absolute left-1/2 top-1/2 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full bg-cyan-500/10 blur-3xl"
    ></div>
  </div>

  <!-- Floating shrimps decoration -->
  <div class="pointer-events-none absolute inset-0">
    {#each ['top-1/4 left-1/6', 'top-1/3 right-1/5', 'bottom-1/3 left-1/4', 'bottom-1/4 right-1/6'] as pos, i}
      <span
        class="absolute text-3xl opacity-20 animate-float"
        style="top: {20 + i * 15}%; left: {10 + i * 20}%; animation-delay: {i * 0.7}s"
      >🦐</span>
    {/each}
  </div>

  <div class="relative z-10 mx-auto max-w-4xl px-4 text-center text-white">
    <div
      class="mb-6 inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm backdrop-blur-sm"
    >
      <span class="h-2 w-2 rounded-full bg-green-400 animate-pulse"></span>
      Livraison express — 24h chrono
    </div>

    <h1 class="mb-6 font-display text-5xl font-bold leading-tight md:text-7xl">
      Des crevettes<br />
      <span
        class="bg-gradient-to-r from-aqua-300 via-cyan-300 to-aqua-200 bg-clip-text text-transparent"
      >
        d'exception
      </span>
    </h1>

    <p class="mx-auto mb-10 max-w-2xl text-lg text-slate-300 md:text-xl">
      Spécialiste des crevettes d'aquarium depuis 2015. Neocaridina, Caridina et variétés rares
      sélectionnées avec passion. Transport sécurisé garanti.
    </p>

    <div class="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
      <a
        href="/#pricing"
        class="rounded-2xl bg-gradient-to-r from-aqua-500 to-cyan-500 px-8 py-4 text-lg font-semibold text-white shadow-lg shadow-aqua-500/30 transition-all hover:scale-105 hover:shadow-xl"
      >
        Voir le catalogue
      </a>
      <a
        href="/#about"
        class="rounded-2xl border border-white/20 bg-white/10 px-8 py-4 text-lg font-semibold backdrop-blur-sm transition-all hover:bg-white/20"
      >
        Notre histoire
      </a>
    </div>
  </div>

  <!-- Scroll indicator -->
  <div class="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce text-white/50">
    <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
    </svg>
  </div>
</section>

<!-- ============================================================
     À PROPOS
     ============================================================ -->
<section id="about" class="py-24">
  <div class="container mx-auto max-w-5xl px-4">
    <div class="grid items-center gap-16 md:grid-cols-2">
      <div>
        <span class="mb-4 inline-block rounded-full bg-aqua-100 px-4 py-1.5 text-sm font-semibold text-aqua-700 dark:bg-aqua-900/30 dark:text-aqua-300">
          Notre histoire
        </span>
        <h2 class="mb-6 font-display text-4xl font-bold leading-tight">
          Passion aquariophile<br />
          <span class="text-gradient">depuis 2015</span>
        </h2>
        <p class="mb-4 leading-relaxed text-muted-foreground">
          ShrimpShop est né d'une passion dévorante pour les crevettes d'aquarium. Ce qui a commencé
          comme un élevage amateur est devenu une référence en France et en Europe.
        </p>
        <p class="mb-6 leading-relaxed text-muted-foreground">
          Nous sélectionnons chaque spécimen avec soin, en garantissant des paramètres d'eau
          optimaux et un transport sécurisé pour que vos crevettes arrivent en parfaite santé.
        </p>
        <div class="grid grid-cols-3 gap-4 text-center">
          {#each [{ value: '500+', label: 'Clients satisfaits' }, { value: '50+', label: 'Espèces disponibles' }, { value: '99%', label: 'Taux de survie' }] as stat}
            <div class="rounded-xl bg-aqua-50 p-4 dark:bg-aqua-900/20">
              <div class="font-display text-2xl font-bold text-aqua-600">{stat.value}</div>
              <div class="text-xs text-muted-foreground">{stat.label}</div>
            </div>
          {/each}
        </div>
      </div>

      <div class="space-y-4">
        {#each [
          { icon: '🔬', title: 'Sélection rigoureuse', desc: 'Chaque crevette est inspectée individuellement avant expédition.' },
          { icon: '📦', title: 'Transport sécurisé', desc: 'Emballage isolé, packs chauds en hiver, oxygène 48h.' },
          { icon: '💧', title: 'Qualité de l\'eau', desc: 'Paramètres contrôlés quotidiennement dans nos bassins d\'élevage.' }
        ] as value}
          <div class="flex gap-4 rounded-2xl border border-border bg-card p-5">
            <div class="text-3xl">{value.icon}</div>
            <div>
              <h3 class="font-semibold">{value.title}</h3>
              <p class="text-sm text-muted-foreground">{value.desc}</p>
            </div>
          </div>
        {/each}
      </div>
    </div>
  </div>
</section>

<!-- ============================================================
     GALERIE PHOTOS
     ============================================================ -->
{#if data.photos.length > 0}
  <section class="bg-slate-50 py-24 dark:bg-slate-900/50">
    <div class="container mx-auto max-w-6xl px-4">
      <div class="mb-12 text-center">
        <span class="mb-4 inline-block rounded-full bg-aqua-100 px-4 py-1.5 text-sm font-semibold text-aqua-700 dark:bg-aqua-900/30 dark:text-aqua-300">
          Galerie
        </span>
        <h2 class="font-display text-4xl font-bold">Nos plus beaux spécimens</h2>
      </div>
      <div class="grid gap-4 md:grid-cols-3">
        {#each data.photos as photo}
          <div
            class="group relative aspect-square overflow-hidden rounded-2xl bg-muted cursor-pointer"
          >
            <img
              src={photo.imageUrl}
              alt={photo.altText ?? photo.title}
              loading="lazy"
              class="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
            />
            <div
              class="absolute inset-0 flex items-end bg-gradient-to-t from-black/60 to-transparent p-4 opacity-0 transition-opacity group-hover:opacity-100"
            >
              <div class="text-white">
                <p class="font-semibold">{photo.title}</p>
                {#if photo.description}
                  <p class="text-sm text-white/80">{photo.description}</p>
                {/if}
              </div>
            </div>
          </div>
        {/each}
      </div>
    </div>
  </section>
{/if}

<!-- ============================================================
     FORMULES / PRICING
     ============================================================ -->
<section id="pricing" class="py-24">
  <div class="container mx-auto max-w-6xl px-4">
    <div class="mb-12 text-center">
      <span class="mb-4 inline-block rounded-full bg-aqua-100 px-4 py-1.5 text-sm font-semibold text-aqua-700 dark:bg-aqua-900/30 dark:text-aqua-300">
        Nos formules
      </span>
      <h2 class="font-display text-4xl font-bold">Un pack pour chaque passionné</h2>
      <p class="mt-4 text-muted-foreground">
        Choisissez la formule adaptée à votre niveau et vos objectifs
      </p>
    </div>

    <div class="grid gap-6 md:grid-cols-3">
      {#each plans as plan}
        <div
          class="relative flex flex-col rounded-3xl border p-8 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl
            {plan.highlighted
            ? 'border-aqua-400 bg-gradient-to-br from-aqua-900 to-slate-900 text-white shadow-lg shadow-aqua-500/20 dark:from-aqua-800'
            : 'border-border bg-card hover:shadow-aqua-500/10'}"
        >
          {#if plan.highlighted}
            <div
              class="absolute -top-4 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-aqua-400 to-cyan-400 px-6 py-1.5 text-xs font-bold text-white shadow-md"
            >
              ⭐ Populaire
            </div>
          {/if}

          <div class="mb-2 text-4xl">{plan.emoji}</div>
          <div
            class="mb-1 w-fit rounded-full px-3 py-1 text-xs font-semibold
              {plan.highlighted ? 'bg-aqua-700/50 text-aqua-200' : 'bg-aqua-100 text-aqua-700 dark:bg-aqua-900/30 dark:text-aqua-300'}"
          >
            {plan.badge}
          </div>
          <h3 class="mt-3 font-display text-2xl font-bold">{plan.name}</h3>
          <p
            class="mt-1 text-sm {plan.highlighted ? 'text-aqua-200' : 'text-muted-foreground'}"
          >
            {plan.description}
          </p>

          <div class="my-6">
            <span class="font-display text-5xl font-bold">{plan.price}€</span>
            <span class="text-sm {plan.highlighted ? 'text-aqua-200' : 'text-muted-foreground'}">
              /commande
            </span>
          </div>

          <ul class="mb-8 flex-1 space-y-3">
            {#each plan.features as feature}
              <li class="flex items-center gap-2 text-sm">
                <svg
                  class="h-4 w-4 shrink-0 {plan.highlighted ? 'text-aqua-300' : 'text-aqua-600'}"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                {feature}
              </li>
            {/each}
          </ul>

          <a
            href="/#contact"
            class="rounded-2xl py-3 text-center font-semibold transition-all
              {plan.highlighted
              ? 'bg-white text-aqua-900 hover:bg-aqua-50'
              : 'bg-primary text-primary-foreground hover:bg-primary/90'}"
          >
            {plan.cta}
          </a>
        </div>
      {/each}
    </div>
  </div>
</section>

<!-- ============================================================
     ARTICLES RÉCENTS
     ============================================================ -->
{#if data.articles.length > 0}
  <section class="bg-slate-50 py-24 dark:bg-slate-900/50">
    <div class="container mx-auto max-w-6xl px-4">
      <div class="mb-12 flex items-end justify-between">
        <div>
          <span class="mb-4 inline-block rounded-full bg-aqua-100 px-4 py-1.5 text-sm font-semibold text-aqua-700 dark:bg-aqua-900/30 dark:text-aqua-300">
            Blog & Guides
          </span>
          <h2 class="font-display text-4xl font-bold">Derniers articles</h2>
        </div>
        <a
          href="/articles"
          class="hidden rounded-xl border border-border px-5 py-2.5 text-sm font-medium transition-colors hover:bg-muted md:block"
        >
          Tous les articles →
        </a>
      </div>

      <div class="grid gap-6 md:grid-cols-3">
        {#each data.articles as article}
          <ArticleCard {article} />
        {/each}
      </div>
    </div>
  </section>
{/if}

<!-- ============================================================
     CONTACT
     ============================================================ -->
<section id="contact" class="py-24">
  <div class="container mx-auto max-w-5xl px-4">
    <div class="grid gap-12 md:grid-cols-2">
      <!-- Infos contact -->
      <div>
        <span class="mb-4 inline-block rounded-full bg-aqua-100 px-4 py-1.5 text-sm font-semibold text-aqua-700 dark:bg-aqua-900/30 dark:text-aqua-300">
          Nous contacter
        </span>
        <h2 class="mb-6 font-display text-4xl font-bold">
          Une question ?<br />Parlons-en !
        </h2>
        <p class="mb-8 text-muted-foreground">
          Notre équipe répond sous 24h. N'hésitez pas à nous contacter pour toute question sur nos
          crevettes ou votre commande.
        </p>

        <div class="space-y-4">
          {#each [
            { icon: '📧', label: 'Email', value: 'contact@shrimpshop.fr' },
            { icon: '📞', label: 'Téléphone', value: '+33 1 23 45 67 89' },
            { icon: '🕐', label: 'Horaires', value: 'Lun–Ven 9h–18h' }
          ] as info}
            <div class="flex items-center gap-3">
              <div
                class="flex h-10 w-10 items-center justify-center rounded-xl bg-aqua-50 text-lg dark:bg-aqua-900/30"
              >
                {info.icon}
              </div>
              <div>
                <p class="text-xs text-muted-foreground">{info.label}</p>
                <p class="font-medium">{info.value}</p>
              </div>
            </div>
          {/each}
        </div>

        <!-- Google Maps embed placeholder -->
        <div
          class="mt-8 overflow-hidden rounded-2xl border border-border bg-muted"
          style="height: 200px"
        >
          <iframe
            src="https://maps.google.com/maps?q=Paris,France&z=12&output=embed"
            width="100%"
            height="200"
            style="border:0"
            loading="lazy"
            title="Notre localisation"
          ></iframe>
        </div>
      </div>

      <!-- Formulaire -->
      <div class="rounded-3xl border border-border bg-card p-8">
        <h3 class="mb-6 font-display text-xl font-bold">Envoyer un message</h3>
        <form
          method="POST"
          action="?/contact"
          use:enhance={() => {
            contactLoading = true;
            return async ({ update }) => {
              contactLoading = false;
              await update();
            };
          }}
          class="space-y-4"
        >
          <div class="grid gap-4 sm:grid-cols-2">
            <div>
              <label class="mb-1.5 block text-sm font-medium" for="name">Nom</label>
              <input
                id="name"
                name="name"
                type="text"
                required
                placeholder="Jean Dupont"
                class="w-full rounded-xl border border-input bg-background px-4 py-2.5 text-sm outline-none ring-offset-background transition focus:ring-2 focus:ring-ring"
              />
              {#if form?.errors?.name}
                <p class="mt-1 text-xs text-destructive">{form.errors.name[0]}</p>
              {/if}
            </div>
            <div>
              <label class="mb-1.5 block text-sm font-medium" for="email">Email</label>
              <input
                id="email"
                name="email"
                type="email"
                required
                placeholder="jean@email.com"
                class="w-full rounded-xl border border-input bg-background px-4 py-2.5 text-sm outline-none ring-offset-background transition focus:ring-2 focus:ring-ring"
              />
              {#if form?.errors?.email}
                <p class="mt-1 text-xs text-destructive">{form.errors.email[0]}</p>
              {/if}
            </div>
          </div>

          <div>
            <label class="mb-1.5 block text-sm font-medium" for="subject">Sujet</label>
            <input
              id="subject"
              name="subject"
              type="text"
              required
              placeholder="Question sur ma commande"
              class="w-full rounded-xl border border-input bg-background px-4 py-2.5 text-sm outline-none ring-offset-background transition focus:ring-2 focus:ring-ring"
            />
          </div>

          <div>
            <label class="mb-1.5 block text-sm font-medium" for="message">Message</label>
            <textarea
              id="message"
              name="message"
              rows="5"
              required
              placeholder="Votre message..."
              class="w-full resize-none rounded-xl border border-input bg-background px-4 py-2.5 text-sm outline-none ring-offset-background transition focus:ring-2 focus:ring-ring"
            ></textarea>
            {#if form?.errors?.message}
              <p class="mt-1 text-xs text-destructive">{form.errors.message[0]}</p>
            {/if}
          </div>

          <button
            type="submit"
            disabled={contactLoading}
            class="w-full rounded-2xl bg-primary py-3 font-semibold text-primary-foreground transition-all hover:bg-primary/90 disabled:opacity-60"
          >
            {contactLoading ? 'Envoi en cours...' : 'Envoyer le message'}
          </button>
        </form>
      </div>
    </div>
  </div>
</section>
