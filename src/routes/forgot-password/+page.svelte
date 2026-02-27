<script lang="ts">
  import { enhance } from '$app/forms';
  import type { ActionData } from './$types';

  let { form }: { form: ActionData } = $props();
  let loading = $state(false);
</script>

<svelte:head>
  <title>Mot de passe oublié | ShrimpShop</title>
</svelte:head>

<div class="flex min-h-[80vh] items-center justify-center px-4 py-16">
  <div class="w-full max-w-md">
    <div class="rounded-3xl border border-border bg-card p-8 shadow-xl shadow-aqua-500/5">
      <div class="mb-8 text-center">
        <div class="mb-3 text-5xl">🔑</div>
        <h1 class="font-display text-2xl font-bold">Mot de passe oublié</h1>
        <p class="mt-1 text-sm text-muted-foreground">
          Entrez votre email pour recevoir un lien de réinitialisation
        </p>
      </div>

      {#if form?.sent}
        <div class="rounded-2xl bg-green-50 p-6 text-center dark:bg-green-900/20">
          <div class="mb-2 text-3xl">📧</div>
          <p class="font-semibold text-green-700 dark:text-green-400">Vérifiez vos emails</p>
          <p class="mt-1 text-sm text-green-600 dark:text-green-500">
            Si un compte existe avec cette adresse, vous recevrez un lien de réinitialisation sous
            peu.
          </p>
        </div>
        <p class="mt-6 text-center text-sm text-muted-foreground">
          <a href="/login" class="font-semibold text-primary hover:underline">← Retour connexion</a>
        </p>
      {:else}
        <form
          method="POST"
          use:enhance={() => {
            loading = true;
            return async ({ update }) => {
              loading = false;
              await update();
            };
          }}
          class="space-y-4"
        >
          <div>
            <label class="mb-1.5 block text-sm font-medium" for="email">Email</label>
            <input
              id="email"
              name="email"
              type="email"
              required
              autocomplete="email"
              placeholder="votre@email.com"
              class="w-full rounded-xl border border-input bg-background px-4 py-2.5 text-sm outline-none transition focus:ring-2 focus:ring-ring"
              class:border-destructive={form?.errors?.email}
            />
            {#if form?.errors?.email}
              <p class="mt-1 text-xs text-destructive">{form.errors.email[0]}</p>
            {/if}
          </div>

          <button
            type="submit"
            disabled={loading}
            class="w-full rounded-2xl bg-primary py-3 font-semibold text-primary-foreground transition-all hover:bg-primary/90 disabled:opacity-60"
          >
            {loading ? 'Envoi...' : 'Envoyer le lien'}
          </button>
        </form>

        <p class="mt-6 text-center text-sm text-muted-foreground">
          <a href="/login" class="font-semibold text-primary hover:underline">← Retour connexion</a>
        </p>
      {/if}
    </div>
  </div>
</div>
