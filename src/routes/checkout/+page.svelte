<script lang="ts">
  import { onMount } from 'svelte';
  import { cartStore } from '$lib/stores/cart.svelte';
  import { formatPrice } from '$utils/format';
  import { toast } from 'svelte-sonner';

  let email = $state('');
  let loading = $state(false);

  // S'assurer que le store est initialisé (SSR-safe)
  onMount(() => {
    if (!cartStore.initialized) cartStore.init();
  });

  async function handleCheckout() {
    if (cartStore.items.length === 0) return;
    loading = true;

    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: cartStore.items.map((i) => ({ productId: i.productId, quantity: i.quantity })),
          email: email || undefined
        })
      });

      const json = await res.json();
      if (!res.ok) {
        toast.error(json.error ?? 'Erreur lors du paiement');
        return;
      }

      const { sessionUrl } = json.data;
      if (sessionUrl) {
        window.location.href = sessionUrl;
      }
    } catch {
      toast.error('Erreur réseau. Réessayez.');
    } finally {
      loading = false;
    }
  }
</script>

<svelte:head>
  <title>Panier — ShrimpShop</title>
</svelte:head>

<div class="mx-auto max-w-2xl px-4 py-10">
  <h1 class="font-display mb-8 text-2xl font-bold">Votre panier</h1>

  {#if cartStore.items.length === 0}
    <div class="py-16 text-center text-muted-foreground">
      <p class="mb-3 text-5xl">🛒</p>
      <p class="font-medium">Votre panier est vide</p>
      <a href="/shop" class="mt-4 inline-block text-sm font-semibold text-primary hover:underline">
        Découvrir la boutique →
      </a>
    </div>
  {:else}
    <!-- Liste des articles -->
    <div class="mb-6 space-y-4 rounded-2xl border border-border bg-white p-5 dark:bg-slate-900">
      {#each cartStore.items as item (item.productId)}
        <div class="flex items-center gap-4">
          <div class="h-16 w-16 flex-shrink-0 overflow-hidden rounded-xl bg-muted">
            {#if item.image}
              <img src={item.image} alt={item.name} class="h-full w-full object-cover" />
            {:else}
              <div class="flex h-full w-full items-center justify-center text-2xl">🦐</div>
            {/if}
          </div>
          <div class="flex-1 min-w-0">
            <p class="font-medium line-clamp-1">{item.name}</p>
            <p class="text-sm text-muted-foreground">{formatPrice(item.price)} × {item.quantity}</p>
          </div>
          <span class="font-bold">{formatPrice(item.price * item.quantity)}</span>
          <button
            onclick={() => cartStore.removeItem(item.productId)}
            class="text-muted-foreground hover:text-destructive"
            aria-label="Supprimer"
          >
            ✕
          </button>
        </div>
      {/each}
    </div>

    <!-- Total -->
    <div class="mb-6 rounded-2xl border border-border bg-white p-5 dark:bg-slate-900">
      <div class="flex items-center justify-between text-lg font-bold">
        <span>Total</span>
        <span class="text-primary">{formatPrice(cartStore.total)}</span>
      </div>
    </div>

    <!-- Email invité -->
    <div class="mb-6 rounded-2xl border border-border bg-white p-5 dark:bg-slate-900">
      <label class="mb-2 block text-sm font-medium" for="email">
        Email de confirmation (optionnel si connecté)
      </label>
      <input
        id="email"
        type="email"
        bind:value={email}
        placeholder="votre@email.com"
        class="w-full rounded-xl border border-input bg-background px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ring"
      />
    </div>

    <button
      onclick={handleCheckout}
      disabled={loading}
      class="w-full rounded-xl bg-primary py-4 text-base font-bold text-primary-foreground hover:bg-primary/90 disabled:opacity-60"
    >
      {loading ? 'Redirection vers Stripe...' : 'Payer avec Stripe →'}
    </button>

    <p class="mt-3 text-center text-xs text-muted-foreground">
      Paiement sécurisé par Stripe. Vous serez redirigé vers une page de paiement sécurisée.
    </p>
  {/if}
</div>
