<script lang="ts">
  import { page } from '$app/stores';
</script>

<div class="flex min-h-[70vh] flex-col items-center justify-center px-4 text-center">
  <div class="mb-6 text-8xl">
    {#if $page.status === 404}🔍{:else if $page.status === 403}🚫{:else if $page.status === 401}🔐{:else}⚠️{/if}
  </div>

  <h1 class="font-display text-6xl font-bold text-primary">{$page.status}</h1>

  <p class="mt-4 text-xl font-semibold">
    {#if $page.status === 404}
      Page introuvable
    {:else if $page.status === 403}
      Accès refusé
    {:else if $page.status === 401}
      Authentification requise
    {:else}
      Une erreur est survenue
    {/if}
  </p>

  <p class="mt-2 max-w-md text-muted-foreground">
    {$page.error?.message ?? 'Quelque chose s\'est mal passé.'}
  </p>

  <div class="mt-8 flex gap-3">
    <a
      href="/"
      class="rounded-2xl bg-primary px-6 py-3 font-semibold text-primary-foreground transition hover:bg-primary/90"
    >
      ← Retour à l'accueil
    </a>
    {#if $page.status === 401}
      <a
        href="/login"
        class="rounded-2xl border border-border px-6 py-3 font-semibold transition hover:bg-muted"
      >
        Se connecter
      </a>
    {/if}
  </div>
</div>
