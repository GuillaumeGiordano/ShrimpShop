<script lang="ts">
  import { cartStore } from '$lib/stores/cart.svelte';
  import { formatPrice } from '$utils/format';
</script>

<!-- Overlay -->
{#if cartStore.isOpen}
  <div
    class="fixed inset-0 z-40 bg-black/50"
    onclick={() => cartStore.close()}
    role="button"
    tabindex="-1"
    aria-label="Fermer le panier"
    onkeydown={(e) => e.key === 'Escape' && cartStore.close()}
  ></div>
{/if}

<!-- Drawer -->
<div
  class="fixed inset-y-0 right-0 z-50 flex w-full max-w-sm flex-col bg-white shadow-2xl transition-transform duration-300 dark:bg-slate-900
    {cartStore.isOpen ? 'translate-x-0' : 'translate-x-full'}"
>
  <!-- En-tête -->
  <div class="flex items-center justify-between border-b border-border px-5 py-4">
    <h2 class="text-lg font-bold">
      Panier
      {#if cartStore.count > 0}
        <span class="ml-1.5 rounded-full bg-primary px-2 py-0.5 text-xs text-primary-foreground">
          {cartStore.count}
        </span>
      {/if}
    </h2>
    <button
      onclick={() => cartStore.close()}
      class="rounded-lg p-1.5 hover:bg-muted"
      aria-label="Fermer"
    >
      <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
      </svg>
    </button>
  </div>

  <!-- Items -->
  <div class="flex-1 overflow-y-auto px-5 py-4">
    {#if cartStore.items.length === 0}
      <div class="flex flex-col items-center justify-center py-16 text-center text-muted-foreground">
        <div class="mb-3 text-5xl">🛒</div>
        <p class="font-medium">Votre panier est vide</p>
        <a
          href="/shop"
          onclick={() => cartStore.close()}
          class="mt-4 text-sm font-semibold text-primary hover:underline"
        >
          Découvrir la boutique →
        </a>
      </div>
    {:else}
      <ul class="space-y-4">
        {#each cartStore.items as item (item.productId)}
          <li class="flex gap-3">
            <!-- Image -->
            <a href="/shop/{item.slug}" onclick={() => cartStore.close()}>
              <div class="h-16 w-16 flex-shrink-0 overflow-hidden rounded-xl bg-muted">
                {#if item.image}
                  <img src={item.image} alt={item.name} class="h-full w-full object-cover" />
                {:else}
                  <div class="flex h-full w-full items-center justify-center text-2xl">🦐</div>
                {/if}
              </div>
            </a>

            <!-- Infos -->
            <div class="flex flex-1 flex-col gap-1 min-w-0">
              <a
                href="/shop/{item.slug}"
                onclick={() => cartStore.close()}
                class="text-sm font-medium leading-snug line-clamp-2 hover:text-primary"
              >
                {item.name}
              </a>
              <span class="text-sm font-bold text-primary">{formatPrice(item.price)}</span>
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-1">
                  <button
                    type="button"
                    onclick={() => cartStore.updateQuantity(item.productId, item.quantity - 1)}
                    disabled={item.quantity <= 1}
                    class="flex h-7 w-7 items-center justify-center rounded-lg border border-border text-sm font-bold hover:bg-muted disabled:opacity-40"
                  >−</button>
                  <span class="min-w-[1.5rem] text-center text-sm font-semibold">{item.quantity}</span>
                  <button
                    type="button"
                    onclick={() => cartStore.updateQuantity(item.productId, item.quantity + 1)}
                    class="flex h-7 w-7 items-center justify-center rounded-lg border border-border text-sm font-bold hover:bg-muted"
                  >+</button>
                </div>
                <button
                  onclick={() => cartStore.removeItem(item.productId)}
                  class="text-xs text-muted-foreground hover:text-destructive"
                  aria-label="Supprimer"
                >
                  ✕
                </button>
              </div>
            </div>
          </li>
        {/each}
      </ul>
    {/if}
  </div>

  <!-- Footer -->
  {#if cartStore.items.length > 0}
    <div class="border-t border-border px-5 py-4 space-y-3">
      <div class="flex items-center justify-between text-base font-bold">
        <span>Total</span>
        <span class="text-primary">{formatPrice(cartStore.total)}</span>
      </div>
      <a
        href="/checkout"
        onclick={() => cartStore.close()}
        class="block w-full rounded-xl bg-primary py-3 text-center text-sm font-semibold text-primary-foreground hover:bg-primary/90"
      >
        Commander
      </a>
      <button
        onclick={() => cartStore.close()}
        class="block w-full text-center text-sm text-muted-foreground hover:text-foreground"
      >
        Continuer les achats
      </button>
    </div>
  {/if}
</div>
