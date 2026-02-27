<script lang="ts">
  import type { ProductCardDTO } from '$types';
  import { formatPrice } from '$utils/format';

  let { product }: { product: ProductCardDTO } = $props();
</script>

<a
  href="/shop/{product.slug}"
  class="group flex flex-col overflow-hidden rounded-2xl border border-border bg-white shadow-sm transition-shadow hover:shadow-md dark:bg-slate-900"
>
  <!-- Image -->
  <div class="relative aspect-square overflow-hidden bg-muted">
    {#if product.image}
      <img
        src={product.image}
        alt={product.name}
        loading="lazy"
        class="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
      />
    {:else}
      <div class="flex h-full w-full items-center justify-center text-5xl">🦐</div>
    {/if}

    {#if product.stock === 0}
      <div class="absolute inset-0 flex items-center justify-center bg-black/50">
        <span class="rounded-full bg-white px-3 py-1 text-xs font-bold text-slate-800">
          Rupture de stock
        </span>
      </div>
    {/if}

    {#if product.category}
      <span
        class="absolute left-2 top-2 rounded-full bg-primary/90 px-2.5 py-0.5 text-xs font-semibold text-primary-foreground"
      >
        {product.category.name}
      </span>
    {/if}
  </div>

  <!-- Infos -->
  <div class="flex flex-1 flex-col p-4">
    <h3 class="mb-1 font-semibold leading-snug line-clamp-2">{product.name}</h3>

    <div class="mt-auto flex items-center justify-between pt-3">
      <span class="text-lg font-bold text-primary">{formatPrice(product.price)}</span>
      {#if product.stock > 0 && product.stock <= 5}
        <span class="text-xs text-amber-600 dark:text-amber-400">
          Plus que {product.stock}
        </span>
      {/if}
    </div>
  </div>
</a>
