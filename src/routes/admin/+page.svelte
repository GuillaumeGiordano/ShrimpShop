<script lang="ts">
  import type { PageData } from './$types';
  let { data }: { data: PageData } = $props();
  const { stats } = data;
</script>

<svelte:head>
  <title>Dashboard Admin | ShrimpShop</title>
</svelte:head>

<div class="mb-8">
  <h1 class="font-display text-3xl font-bold">Dashboard</h1>
  <p class="mt-1 text-muted-foreground">Vue d'ensemble de votre boutique</p>
</div>

<!-- Stats cards -->
<div class="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
  {#each [
    { label: 'Utilisateurs', value: stats.totalUsers, icon: '👤', href: '/admin/users', color: 'text-blue-600 bg-blue-50 dark:bg-blue-900/20' },
    { label: 'Articles', value: stats.totalArticles, icon: '📰', href: '/admin/articles', color: 'text-green-600 bg-green-50 dark:bg-green-900/20' },
    { label: 'Photos galerie', value: stats.totalPhotos, icon: '🖼', href: '/admin/gallery', color: 'text-purple-600 bg-purple-50 dark:bg-purple-900/20' },
    { label: 'FAQs', value: stats.totalFaqs, icon: '❓', href: '/admin/faq', color: 'text-amber-600 bg-amber-50 dark:bg-amber-900/20' }
  ] as stat}
    <a
      href={stat.href}
      class="flex items-center gap-4 rounded-2xl border border-border bg-white p-5 shadow-sm transition hover:shadow-md dark:bg-slate-900"
    >
      <div class="flex h-12 w-12 items-center justify-center rounded-xl text-2xl {stat.color}">
        {stat.icon}
      </div>
      <div>
        <p class="text-2xl font-bold">{stat.value}</p>
        <p class="text-sm text-muted-foreground">{stat.label}</p>
      </div>
    </a>
  {/each}
</div>

<!-- Articles status -->
<div class="mt-8 grid gap-4 md:grid-cols-2">
  <div class="rounded-2xl border border-border bg-white p-6 dark:bg-slate-900">
    <h2 class="mb-4 font-semibold">Statut des articles</h2>
    <div class="space-y-3">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-2">
          <span class="h-2.5 w-2.5 rounded-full bg-green-500"></span>
          <span class="text-sm">Publiés</span>
        </div>
        <span class="font-semibold">{stats.publishedArticles}</span>
      </div>
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-2">
          <span class="h-2.5 w-2.5 rounded-full bg-amber-500"></span>
          <span class="text-sm">Brouillons</span>
        </div>
        <span class="font-semibold">{stats.draftArticles}</span>
      </div>
    </div>
  </div>

  <div class="rounded-2xl border border-border bg-white p-6 dark:bg-slate-900">
    <h2 class="mb-4 font-semibold">Actions rapides</h2>
    <div class="space-y-2">
      {#each [
        { href: '/admin/articles/new', label: '+ Nouvel article', color: 'text-primary' },
        { href: '/admin/gallery/new', label: '+ Ajouter une photo', color: 'text-purple-600' },
        { href: '/admin/faq/new', label: '+ Nouvelle FAQ', color: 'text-amber-600' }
      ] as action}
        <a
          href={action.href}
          class="block rounded-xl border border-border p-3 text-sm font-medium {action.color} transition hover:bg-muted"
        >
          {action.label}
        </a>
      {/each}
    </div>
  </div>
</div>
