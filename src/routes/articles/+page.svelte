<script lang="ts">
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';
  import ArticleCard from '$lib/components/ArticleCard.svelte';
  import type { PageData } from './$types';

  let { data }: { data: PageData } = $props();

  function setCategory(categoryId: string) {
    const params = new URLSearchParams($page.url.searchParams);
    if (categoryId) params.set('categoryId', categoryId);
    else params.delete('categoryId');
    params.delete('page');
    goto(`?${params.toString()}`);
  }

  function setPage(p: number) {
    const params = new URLSearchParams($page.url.searchParams);
    params.set('page', String(p));
    goto(`?${params.toString()}`);
  }

  let search = $state(data.filters.search ?? '');
  let searchTimeout: ReturnType<typeof setTimeout>;

  function onSearch() {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
      const params = new URLSearchParams($page.url.searchParams);
      if (search) params.set('search', search);
      else params.delete('search');
      params.delete('page');
      goto(`?${params.toString()}`);
    }, 400);
  }
</script>

<svelte:head>
  <title>Articles | ShrimpShop</title>
  <meta name="robots" content="noindex" />
</svelte:head>

<div class="container mx-auto max-w-6xl px-4 py-12">
  <!-- Header -->
  <div class="mb-10">
    <h1 class="font-display text-4xl font-bold">Articles & Guides</h1>
    <p class="mt-2 text-muted-foreground">
      Découvrez nos guides sur l'aquariophilie et les crevettes
    </p>
  </div>

  <!-- Filtres -->
  <div class="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
    <!-- Catégories -->
    <div class="flex flex-wrap gap-2">
      <button
        onclick={() => setCategory('')}
        class="rounded-full px-4 py-1.5 text-sm font-medium transition-all
          {(data.filters.categoryId ?? '') === ''
          ? 'bg-primary text-primary-foreground shadow-sm'
          : 'border border-border bg-background hover:bg-muted'}"
      >
        Toutes catégories
      </button>
      {#each data.categories as cat}
        <button
          onclick={() => setCategory(cat.id)}
          class="rounded-full px-4 py-1.5 text-sm font-medium transition-all
            {data.filters.categoryId === cat.id
            ? 'bg-primary text-primary-foreground shadow-sm'
            : 'border border-border bg-background hover:bg-muted'}"
        >
          {cat.name}
        </button>
      {/each}
    </div>

    <!-- Search -->
    <div class="relative">
      <svg
        class="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
        />
      </svg>
      <input
        type="search"
        placeholder="Rechercher..."
        bind:value={search}
        oninput={onSearch}
        class="rounded-xl border border-input bg-background py-2 pl-9 pr-4 text-sm outline-none focus:ring-2 focus:ring-ring"
      />
    </div>
  </div>

  <!-- Résultats count -->
  <p class="mb-6 text-sm text-muted-foreground">
    {data.total} article{data.total > 1 ? 's' : ''} trouvé{data.total > 1 ? 's' : ''}
  </p>

  <!-- Articles grid -->
  {#if data.data.length === 0}
    <div class="py-20 text-center">
      <div class="mb-4 text-6xl">🔍</div>
      <h2 class="font-display text-xl font-semibold">Aucun article trouvé</h2>
      <p class="mt-2 text-muted-foreground">Essayez une autre catégorie ou un autre mot-clé.</p>
    </div>
  {:else}
    <div class="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {#each data.data as article (article.id)}
        <ArticleCard {article} />
      {/each}
    </div>
  {/if}

  <!-- Pagination -->
  {#if data.totalPages > 1}
    <div class="mt-10 flex items-center justify-center gap-2">
      <button
        onclick={() => setPage(data.page - 1)}
        disabled={data.page <= 1}
        class="rounded-xl border border-border px-4 py-2 text-sm font-medium transition hover:bg-muted disabled:opacity-40"
      >
        ← Précédent
      </button>

      {#each Array.from({ length: data.totalPages }, (_, i) => i + 1) as p}
        <button
          onclick={() => setPage(p)}
          class="rounded-xl px-4 py-2 text-sm font-medium transition
            {p === data.page ? 'bg-primary text-primary-foreground' : 'border border-border hover:bg-muted'}"
        >
          {p}
        </button>
      {/each}

      <button
        onclick={() => setPage(data.page + 1)}
        disabled={data.page >= data.totalPages}
        class="rounded-xl border border-border px-4 py-2 text-sm font-medium transition hover:bg-muted disabled:opacity-40"
      >
        Suivant →
      </button>
    </div>
  {/if}
</div>
