<script lang="ts">
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';
  import ProductCard from '$components/shop/ProductCard.svelte';
  import type { PageData } from './$types';

  let { data }: { data: PageData } = $props();

  let searchInput = $state($page.url.searchParams.get('q') ?? '');
  let selectedCategory = $state($page.url.searchParams.get('category') ?? '');

  function navigate(params: Record<string, string>) {
    const sp = new URLSearchParams($page.url.searchParams);
    for (const [k, v] of Object.entries(params)) {
      if (v) {
        sp.set(k, v);
      } else {
        sp.delete(k);
      }
    }
    sp.delete('page');
    goto(`?${sp.toString()}`);
  }

  function setPage(p: number) {
    const sp = new URLSearchParams($page.url.searchParams);
    sp.set('page', String(p));
    goto(`?${sp.toString()}`);
  }

  function onSearch(e: SubmitEvent) {
    e.preventDefault();
    navigate({ q: searchInput });
  }

  function onCategory(catId: string) {
    selectedCategory = catId;
    navigate({ category: catId });
  }
</script>

<svelte:head>
  <title>Boutique — ShrimpShop</title>
  <meta name="description" content="Découvrez notre sélection de crevettes d'aquarium." />
</svelte:head>

<!-- En-tête -->
<div class="bg-gradient-to-b from-aqua-50 to-white py-12 dark:from-slate-900 dark:to-slate-950">
  <div class="mx-auto max-w-6xl px-4">
    <h1 class="font-display mb-2 text-3xl font-bold text-aqua-900 dark:text-white md:text-4xl">
      🦐 Notre boutique
    </h1>
    <p class="text-muted-foreground">Des crevettes d'aquarium de qualité, livrées chez vous.</p>
  </div>
</div>

<div class="mx-auto max-w-6xl px-4 py-8">
  <!-- Filtres -->
  <div class="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

    <!-- Catégories -->
    <div class="flex flex-wrap gap-2">
      <button
        onclick={() => onCategory('')}
        class="rounded-full border px-4 py-1.5 text-sm font-medium transition-all
          {selectedCategory === '' ? 'border-primary bg-primary text-primary-foreground' : 'border-border hover:bg-muted'}"
      >
        Tout
      </button>
      {#each data.categories as cat}
        <button
          onclick={() => onCategory(cat.id)}
          class="rounded-full border px-4 py-1.5 text-sm font-medium transition-all
            {selectedCategory === cat.id ? 'border-primary bg-primary text-primary-foreground' : 'border-border hover:bg-muted'}"
        >
          {cat.name}
        </button>
      {/each}
    </div>

    <!-- Recherche -->
    <form onsubmit={onSearch} class="flex gap-2">
      <input
        type="search"
        bind:value={searchInput}
        placeholder="Rechercher..."
        class="rounded-xl border border-input bg-background px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-ring w-52"
      />
      <button
        type="submit"
        class="rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
      >
        Chercher
      </button>
    </form>
  </div>

  <!-- Résultats -->
  {#if data.data.length === 0}
    <div class="py-16 text-center text-muted-foreground">
      <p class="text-4xl mb-3">🔍</p>
      <p class="font-medium">Aucun produit trouvé</p>
      <button onclick={() => { searchInput = ''; selectedCategory = ''; navigate({ q: '', category: '' }); }}
        class="mt-3 text-sm text-primary hover:underline">
        Réinitialiser les filtres
      </button>
    </div>
  {:else}
    <div class="mb-4 text-sm text-muted-foreground">
      {data.total} produit{data.total > 1 ? 's' : ''}
    </div>
    <div class="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
      {#each data.data as product (product.id)}
        <ProductCard {product} />
      {/each}
    </div>
  {/if}

  <!-- Pagination -->
  {#if data.totalPages > 1}
    <div class="mt-8 flex items-center justify-center gap-2">
      <button
        onclick={() => setPage(data.page - 1)}
        disabled={data.page <= 1}
        class="rounded-xl border border-border px-4 py-2 text-sm font-medium hover:bg-muted disabled:opacity-40"
      >
        ← Préc.
      </button>
      {#each Array.from({ length: data.totalPages }, (_, i) => i + 1) as p}
        <button
          onclick={() => setPage(p)}
          class="rounded-xl px-4 py-2 text-sm font-medium {p === data.page ? 'bg-primary text-primary-foreground' : 'border border-border hover:bg-muted'}"
        >
          {p}
        </button>
      {/each}
      <button
        onclick={() => setPage(data.page + 1)}
        disabled={data.page >= data.totalPages}
        class="rounded-xl border border-border px-4 py-2 text-sm font-medium hover:bg-muted disabled:opacity-40"
      >
        Suiv. →
      </button>
    </div>
  {/if}
</div>
