<script lang="ts">
  import { cartStore } from '$lib/stores/cart.svelte';
  import QuantitySelector from '$components/shop/QuantitySelector.svelte';
  import { formatPrice } from '$utils/format';
  import { toast } from 'svelte-sonner';
  import type { PageData } from './$types';

  let { data }: { data: PageData } = $props();

  let quantity = $state(1);

  function addToCart() {
    if (data.product.stock === 0) return;
    cartStore.addItem({
      productId: data.product.id,
      name: data.product.name,
      price: data.product.price,
      quantity,
      image: data.product.image,
      slug: data.product.slug
    });
    toast.success(`${data.product.name} ajouté au panier`);
  }
</script>

<svelte:head>
  <title>{data.product.name} — ShrimpShop</title>
  <meta name="description" content={data.product.description.replace(/<[^>]+>/g, '').slice(0, 150)} />
</svelte:head>

<div class="mx-auto max-w-5xl px-4 py-10">
  <!-- Breadcrumb -->
  <nav class="mb-6 flex items-center gap-2 text-sm text-muted-foreground">
    <a href="/" class="hover:text-foreground">Accueil</a>
    <span>›</span>
    <a href="/shop" class="hover:text-foreground">Boutique</a>
    {#if data.product.category}
      <span>›</span>
      <a href="/shop?category={data.product.categoryId}" class="hover:text-foreground">
        {data.product.category.name}
      </a>
    {/if}
    <span>›</span>
    <span class="text-foreground">{data.product.name}</span>
  </nav>

  <div class="grid gap-8 md:grid-cols-2">
    <!-- Image -->
    <div class="overflow-hidden rounded-2xl bg-muted aspect-square">
      {#if data.product.image}
        <img
          src={data.product.image}
          alt={data.product.name}
          class="h-full w-full object-cover"
        />
      {:else}
        <div class="flex h-full w-full items-center justify-center text-8xl">🦐</div>
      {/if}
    </div>

    <!-- Infos -->
    <div class="flex flex-col">
      {#if data.product.category}
        <span class="mb-2 text-sm font-medium text-primary">{data.product.category.name}</span>
      {/if}

      <h1 class="font-display mb-3 text-2xl font-bold md:text-3xl">{data.product.name}</h1>

      <div class="mb-4 flex items-center gap-4">
        <span class="text-3xl font-bold text-primary">{formatPrice(data.product.price)}</span>
        {#if data.product.stock === 0}
          <span class="rounded-full bg-destructive/10 px-3 py-1 text-sm font-semibold text-destructive">
            Rupture de stock
          </span>
        {:else if data.product.stock <= 5}
          <span class="rounded-full bg-amber-100 px-3 py-1 text-sm font-semibold text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
            Plus que {data.product.stock} disponible{data.product.stock > 1 ? 's' : ''}
          </span>
        {:else}
          <span class="rounded-full bg-green-100 px-3 py-1 text-sm font-semibold text-green-700 dark:bg-green-900/30 dark:text-green-400">
            En stock
          </span>
        {/if}
      </div>

      <!-- Ajouter au panier -->
      {#if data.product.stock > 0}
        <div class="mb-6 flex items-center gap-4">
          <QuantitySelector bind:value={quantity} min={1} max={data.product.stock} />
          <button
            onclick={addToCart}
            class="flex-1 rounded-xl bg-primary py-3 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
          >
            Ajouter au panier
          </button>
        </div>
      {:else}
        <button disabled class="mb-6 w-full rounded-xl bg-muted py-3 text-sm font-semibold text-muted-foreground cursor-not-allowed">
          Indisponible
        </button>
      {/if}

      <!-- Description -->
      {#if data.product.description}
        <div class="prose prose-sm dark:prose-invert max-w-none">
          {@html data.product.description}
        </div>
      {/if}
    </div>
  </div>
</div>
