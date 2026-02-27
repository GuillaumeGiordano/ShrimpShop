<script lang="ts">
  import { onMount } from 'svelte';
  import { cartStore } from '$lib/stores/cart.svelte';

  onMount(() => {
    cartStore.clear();
  });
</script>

<svelte:head>
  <title>Commande confirmée — ShrimpShop</title>
</svelte:head>

<div class="mx-auto max-w-lg px-4 py-20 text-center">
  <div class="mb-6 text-7xl">✅</div>
  <h1 class="font-display mb-3 text-2xl font-bold text-green-700 dark:text-green-400">
    Commande confirmée !
  </h1>
  <p class="mb-8 text-muted-foreground">
    Merci pour votre achat. Vous recevrez un email de confirmation. Vos crevettes arrivent bientôt !
  </p>
  <div class="flex flex-col gap-3 sm:flex-row sm:justify-center">
    <a
      href="/shop"
      class="rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
    >
      Continuer les achats
    </a>
    <a
      href="/"
      class="rounded-xl border border-border px-6 py-3 text-sm font-medium hover:bg-muted"
    >
      Retour à l'accueil
    </a>
  </div>
</div>
