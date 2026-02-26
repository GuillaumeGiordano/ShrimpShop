<script lang="ts">
  import { enhance } from '$app/forms';
  import type { PageData, ActionData } from './$types';

  let { data, form }: { data: PageData; form: ActionData } = $props();
  let loading = $state(false);
</script>

<svelte:head>
  <title>Connexion | ShrimpShop</title>
</svelte:head>

<div class="flex min-h-[80vh] items-center justify-center px-4 py-16">
  <div class="w-full max-w-md">
    <!-- Card -->
    <div class="rounded-3xl border border-border bg-card p-8 shadow-xl shadow-aqua-500/5">
      <div class="mb-8 text-center">
        <div class="mb-3 text-5xl">🦐</div>
        <h1 class="font-display text-2xl font-bold">Bon retour !</h1>
        <p class="mt-1 text-sm text-muted-foreground">Connectez-vous à votre espace ShrimpShop</p>
      </div>

      <!-- Google OAuth -->
      <form method="POST" action="?/googleLogin">
        <input type="hidden" name="redirectTo" value={data.redirectTo} />
        <button
          type="submit"
          class="flex w-full items-center justify-center gap-3 rounded-2xl border border-border bg-background py-3 font-medium transition-all hover:bg-muted"
        >
          <svg class="h-5 w-5" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
          Continuer avec Google
        </button>
      </form>

      <div class="my-6 flex items-center gap-3">
        <div class="h-px flex-1 bg-border"></div>
        <span class="text-xs text-muted-foreground">ou par email</span>
        <div class="h-px flex-1 bg-border"></div>
      </div>

      <!-- Email/Password -->
      <form
        method="POST"
        action="?/login"
        use:enhance={() => {
          loading = true;
          return async ({ update }) => {
            loading = false;
            await update();
          };
        }}
        class="space-y-4"
      >
        <input type="hidden" name="redirectTo" value={data.redirectTo} />

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

        <div>
          <div class="mb-1.5 flex items-center justify-between">
            <label class="text-sm font-medium" for="password">Mot de passe</label>
          </div>
          <input
            id="password"
            name="password"
            type="password"
            required
            autocomplete="current-password"
            placeholder="••••••••"
            class="w-full rounded-xl border border-input bg-background px-4 py-2.5 text-sm outline-none transition focus:ring-2 focus:ring-ring"
            class:border-destructive={form?.errors?.email}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          class="w-full rounded-2xl bg-primary py-3 font-semibold text-primary-foreground transition-all hover:bg-primary/90 disabled:opacity-60"
        >
          {loading ? 'Connexion...' : 'Se connecter'}
        </button>
      </form>

      <p class="mt-6 text-center text-sm text-muted-foreground">
        Pas encore de compte ?
        <a href="/register" class="font-semibold text-primary hover:underline">S'inscrire</a>
      </p>
    </div>
  </div>
</div>
