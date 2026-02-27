<svelte:head>
  <title>Paiement annulé — ShrimpShop</title>
</svelte:head>

<div class="mx-auto max-w-lg px-4 py-20 text-center">
  <div class="mb-6 text-7xl">❌</div>
  <h1 class="font-display mb-3 text-2xl font-bold">Paiement annulé</h1>
  <p class="mb-8 text-muted-foreground">
    Votre paiement a été annulé. Votre panier est toujours disponible.
  </p>
  <div class="flex flex-col gap-3 sm:flex-row sm:justify-center">
    <a
      href="/checkout"
      class="rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
    >
      Retourner au panier
    </a>
    <a
      href="/shop"
      class="rounded-xl border border-border px-6 py-3 text-sm font-medium hover:bg-muted"
    >
      Continuer les achats
    </a>
  </div>
</div>
