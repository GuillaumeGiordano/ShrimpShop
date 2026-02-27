<script lang="ts">
  import { enhance } from '$app/forms';
  import type { ActionData } from './$types';

  let { form }: { form: ActionData } = $props();
  let loading = $state(false);

  // Helper pour accéder aux erreurs sans erreurs TypeScript dues au type union
  function fieldError(field: string): string | undefined {
    if (!form || !('errors' in form) || !form.errors) return undefined;
    const errs = form.errors as Record<string, string[] | undefined>;
    return errs[field]?.[0];
  }
</script>

<svelte:head>
  <title>Inscription | ShrimpShop</title>
</svelte:head>

<div class="flex min-h-[80vh] items-center justify-center px-4 py-16">
  <div class="w-full max-w-md">
    <div class="rounded-3xl border border-border bg-card p-8 shadow-xl shadow-aqua-500/5">
      <div class="mb-8 text-center">
        <div class="mb-3 text-5xl">🦐</div>
        <h1 class="font-display text-2xl font-bold">Créer un compte</h1>
        <p class="mt-1 text-sm text-muted-foreground">Rejoignez la communauté ShrimpShop</p>
      </div>

      {#if form?.success}
        <div class="rounded-2xl bg-green-50 p-4 text-center dark:bg-green-900/20">
          <p class="font-semibold text-green-700 dark:text-green-400">✅ Inscription réussie !</p>
          <p class="mt-1 text-sm text-green-600 dark:text-green-500">{form.message}</p>
          <a href="/login" class="mt-3 inline-block text-sm font-semibold text-primary hover:underline">
            Se connecter →
          </a>
        </div>
      {:else}
        <!-- Google OAuth -->
        <form method="POST" action="?/googleRegister">
          <button
            type="submit"
            class="flex w-full items-center justify-center gap-3 rounded-2xl border border-border bg-background py-3 font-medium transition-all hover:bg-muted"
          >
            <svg class="h-5 w-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            Continuer avec Google
          </button>
        </form>

        <div class="my-6 flex items-center gap-3">
          <div class="h-px flex-1 bg-border"></div>
          <span class="text-xs text-muted-foreground">ou par email</span>
          <div class="h-px flex-1 bg-border"></div>
        </div>

        <form
          method="POST"
          action="?/register"
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
            <label class="mb-1.5 block text-sm font-medium" for="name">Nom complet</label>
            <input
              id="name"
              name="name"
              type="text"
              required
              placeholder="Jean Dupont"
              class="w-full rounded-xl border border-input bg-background px-4 py-2.5 text-sm outline-none transition focus:ring-2 focus:ring-ring"
              class:border-destructive={fieldError('name')}
            />
            {#if fieldError('name')}
              <p class="mt-1 text-xs text-destructive">{fieldError('name')}</p>
            {/if}
          </div>

          <div>
            <label class="mb-1.5 block text-sm font-medium" for="email">Email</label>
            <input
              id="email"
              name="email"
              type="email"
              required
              placeholder="votre@email.com"
              class="w-full rounded-xl border border-input bg-background px-4 py-2.5 text-sm outline-none transition focus:ring-2 focus:ring-ring"
              class:border-destructive={fieldError('email')}
            />
            {#if fieldError('email')}
              <p class="mt-1 text-xs text-destructive">{fieldError('email')}</p>
            {/if}
          </div>

          <div>
            <label class="mb-1.5 block text-sm font-medium" for="password">Mot de passe</label>
            <input
              id="password"
              name="password"
              type="password"
              required
              placeholder="Min. 8 caract. avec maj. et chiffre"
              class="w-full rounded-xl border border-input bg-background px-4 py-2.5 text-sm outline-none transition focus:ring-2 focus:ring-ring"
              class:border-destructive={fieldError('password')}
            />
            {#if fieldError('password')}
              <p class="mt-1 text-xs text-destructive">{fieldError('password')}</p>
            {/if}
          </div>

          <div>
            <label class="mb-1.5 block text-sm font-medium" for="confirmPassword">
              Confirmer le mot de passe
            </label>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              required
              placeholder="••••••••"
              class="w-full rounded-xl border border-input bg-background px-4 py-2.5 text-sm outline-none transition focus:ring-2 focus:ring-ring"
              class:border-destructive={fieldError('confirmPassword')}
            />
            {#if fieldError('confirmPassword')}
              <p class="mt-1 text-xs text-destructive">{fieldError('confirmPassword')}</p>
            {/if}
          </div>

          <button
            type="submit"
            disabled={loading}
            class="w-full rounded-2xl bg-primary py-3 font-semibold text-primary-foreground transition-all hover:bg-primary/90 disabled:opacity-60"
          >
            {loading ? 'Inscription...' : 'Créer mon compte'}
          </button>
        </form>
      {/if}

      <p class="mt-6 text-center text-sm text-muted-foreground">
        Déjà un compte ?
        <a href="/login" class="font-semibold text-primary hover:underline">Se connecter</a>
      </p>
    </div>
  </div>
</div>
