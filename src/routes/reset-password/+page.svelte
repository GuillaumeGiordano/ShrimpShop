<script lang="ts">
  import { enhance } from '$app/forms';
  import type { ActionData } from './$types';

  let { form }: { form: ActionData } = $props();
  let loading = $state(false);
  let showPassword = $state(false);
  let showConfirm = $state(false);
</script>

<svelte:head>
  <title>Nouveau mot de passe | ShrimpShop</title>
</svelte:head>

<div class="flex min-h-[80vh] items-center justify-center px-4 py-16">
  <div class="w-full max-w-md">
    <div class="rounded-3xl border border-border bg-card p-8 shadow-xl shadow-aqua-500/5">
      <div class="mb-8 text-center">
        <div class="mb-3 text-5xl">🔐</div>
        <h1 class="font-display text-2xl font-bold">Nouveau mot de passe</h1>
        <p class="mt-1 text-sm text-muted-foreground">Choisissez un nouveau mot de passe sécurisé</p>
      </div>

      {#if form?.error}
        <div class="mb-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700 dark:bg-red-900/20 dark:text-red-400">
          {form.error}
        </div>
      {/if}

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
          <label class="mb-1.5 block text-sm font-medium" for="password">Nouveau mot de passe</label>
          <div class="relative">
            <input
              id="password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              required
              autocomplete="new-password"
              placeholder="••••••••"
              class="w-full rounded-xl border border-input bg-background px-4 py-2.5 pr-10 text-sm outline-none transition focus:ring-2 focus:ring-ring"
              class:border-destructive={form?.errors?.password}
            />
            <button
              type="button"
              onclick={() => (showPassword = !showPassword)}
              class="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              aria-label={showPassword ? 'Masquer' : 'Afficher'}
            >
              {#if showPassword}
                <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                </svg>
              {:else}
                <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              {/if}
            </button>
          </div>
          {#if form?.errors?.password}
            <p class="mt-1 text-xs text-destructive">{form.errors.password[0]}</p>
          {/if}
        </div>

        <div>
          <label class="mb-1.5 block text-sm font-medium" for="confirmPassword">
            Confirmer le mot de passe
          </label>
          <div class="relative">
            <input
              id="confirmPassword"
              name="confirmPassword"
              type={showConfirm ? 'text' : 'password'}
              required
              autocomplete="new-password"
              placeholder="••••••••"
              class="w-full rounded-xl border border-input bg-background px-4 py-2.5 pr-10 text-sm outline-none transition focus:ring-2 focus:ring-ring"
              class:border-destructive={form?.errors?.confirmPassword}
            />
            <button
              type="button"
              onclick={() => (showConfirm = !showConfirm)}
              class="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              aria-label={showConfirm ? 'Masquer' : 'Afficher'}
            >
              {#if showConfirm}
                <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                </svg>
              {:else}
                <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              {/if}
            </button>
          </div>
          {#if form?.errors?.confirmPassword}
            <p class="mt-1 text-xs text-destructive">{form.errors.confirmPassword[0]}</p>
          {/if}
        </div>

        <button
          type="submit"
          disabled={loading}
          class="w-full rounded-2xl bg-primary py-3 font-semibold text-primary-foreground transition-all hover:bg-primary/90 disabled:opacity-60"
        >
          {loading ? 'Enregistrement...' : 'Enregistrer le mot de passe'}
        </button>
      </form>
    </div>
  </div>
</div>
