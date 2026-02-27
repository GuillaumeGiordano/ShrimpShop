<script lang="ts">
  import { enhance } from '$app/forms';
  import { toast } from 'svelte-sonner';
  import { formatDate, formatPrice, ORDER_STATUS_LABELS, ROLE_LABELS } from '$lib/utils/format';
  import type { PageData, ActionData } from './$types';

  let { data, form }: { data: PageData; form: ActionData } = $props();

  let loadingName = $state(false);
  let loadingPassword = $state(false);
  let loadingAvatar = $state(false);
  let showPassword = $state(false);
  let showConfirm = $state(false);
  let avatarPreview = $state<string | null>(null);

  $effect(() => {
    if (form?.success === 'avatar') { toast.success('Photo de profil mise à jour'); avatarPreview = null; }
    if (form?.success === 'name') toast.success('Nom mis à jour');
    if (form?.success === 'password') toast.success('Mot de passe mis à jour');
    if (form?.error && !form?.errors) toast.error(form.error);
  });

  function onAvatarChange(e: Event) {
    const file = (e.target as HTMLInputElement).files?.[0];
    if (file) avatarPreview = URL.createObjectURL(file);
  }

  function initials(name: string): string {
    return name
      .split(' ')
      .map((w) => w[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  }

  const statusColors: Record<string, string> = {
    PENDING: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300',
    PAID: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
    CANCELLED: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
  };
</script>

<svelte:head>
  <title>Mon profil | ShrimpShop</title>
</svelte:head>

<div class="container mx-auto max-w-3xl px-4 py-10">
  <h1 class="mb-8 font-display text-3xl font-bold">Mon profil</h1>

  <!-- Section 1 : Informations -->
  <section class="mb-6 rounded-2xl border border-border bg-card p-6">
    <h2 class="mb-5 text-lg font-semibold">Informations</h2>

    <div class="mb-6 flex items-start gap-5">
      <!-- Avatar + upload -->
      <form
        method="POST"
        action="?/updateAvatar"
        enctype="multipart/form-data"
        use:enhance={() => {
          loadingAvatar = true;
          return async ({ update }) => {
            loadingAvatar = false;
            await update();
          };
        }}
        class="flex flex-col items-center gap-2"
      >
        <label class="group relative cursor-pointer" for="avatar-input">
          <div class="relative h-20 w-20 overflow-hidden rounded-full">
            {#if avatarPreview ?? data.user.avatarUrl}
              <img
                src={avatarPreview ?? data.user.avatarUrl}
                alt={data.user.name}
                class="h-full w-full object-cover"
              />
            {:else}
              <div class="flex h-full w-full items-center justify-center bg-primary text-xl font-bold text-primary-foreground">
                {initials(data.user.name)}
              </div>
            {/if}
            <!-- Overlay appareil photo -->
            <div class="absolute inset-0 flex items-center justify-center rounded-full bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
              <svg class="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
          </div>
        </label>
        <input
          id="avatar-input"
          name="avatar"
          type="file"
          accept="image/jpeg,image/png,image/webp,image/avif"
          class="sr-only"
          onchange={onAvatarChange}
        />
        {#if avatarPreview}
          <button
            type="submit"
            disabled={loadingAvatar}
            class="rounded-lg bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground transition hover:bg-primary/90 disabled:opacity-60"
          >
            {loadingAvatar ? '...' : 'Enregistrer'}
          </button>
        {:else}
          <span class="text-xs text-muted-foreground">Modifier</span>
        {/if}
        {#if form?.action === 'avatar' && form?.error}
          <p class="text-xs text-destructive">{form.error}</p>
        {/if}
      </form>

      <div class="pt-1">
        <p class="font-semibold">{data.user.name}</p>
        <p class="text-sm text-muted-foreground">{data.user.email}</p>
        <span
          class="mt-1 inline-block rounded-full px-2.5 py-0.5 text-xs font-medium"
          class:bg-amber-100={data.user.role === 'ADMIN'}
          class:text-amber-800={data.user.role === 'ADMIN'}
          class:bg-aqua-100={data.user.role === 'USER'}
          class:text-aqua-800={data.user.role === 'USER'}
        >
          {ROLE_LABELS[data.user.role]}
        </span>
      </div>
    </div>

    <form
      method="POST"
      action="?/updateName"
      use:enhance={() => {
        loadingName = true;
        return async ({ update }) => {
          loadingName = false;
          await update({ reset: false });
        };
      }}
      class="flex gap-3"
    >
      <div class="flex-1">
        <label class="mb-1.5 block text-sm font-medium" for="name">Nom affiché</label>
        <input
          id="name"
          name="name"
          type="text"
          value={data.user.name}
          required
          class="w-full rounded-xl border border-input bg-background px-4 py-2.5 text-sm outline-none transition focus:ring-2 focus:ring-ring"
          class:border-destructive={form?.action === 'name' && form?.errors?.name}
        />
        {#if form?.action === 'name' && form?.errors?.name}
          <p class="mt-1 text-xs text-destructive">{form.errors.name[0]}</p>
        {/if}
      </div>
      <div class="flex items-end">
        <button
          type="submit"
          disabled={loadingName}
          class="rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90 disabled:opacity-60"
        >
          {loadingName ? '...' : 'Enregistrer'}
        </button>
      </div>
    </form>
  </section>

  <!-- Section 2 : Sécurité -->
  <section class="mb-6 rounded-2xl border border-border bg-card p-6">
    <h2 class="mb-5 text-lg font-semibold">Sécurité</h2>

    {#if data.isOAuth}
      <div class="flex items-start gap-3 rounded-xl bg-muted px-4 py-3 text-sm text-muted-foreground">
        <svg class="mt-0.5 h-4 w-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span>
          Votre compte est connecté via Google. Gérez votre mot de passe directement depuis votre
          compte Google.
        </span>
      </div>
    {:else}
      <form
        method="POST"
        action="?/updatePassword"
        use:enhance={() => {
          loadingPassword = true;
          return async ({ update }) => {
            loadingPassword = false;
            await update({ reset: true });
          };
        }}
        class="space-y-4"
      >
        {#if form?.action === 'password' && form?.error}
          <div class="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700 dark:bg-red-900/20 dark:text-red-400">
            {form.error}
          </div>
        {/if}

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
              class:border-destructive={form?.action === 'password' && form?.errors?.password}
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
          {#if form?.action === 'password' && form?.errors?.password}
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
              class:border-destructive={form?.action === 'password' && form?.errors?.confirmPassword}
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
          {#if form?.action === 'password' && form?.errors?.confirmPassword}
            <p class="mt-1 text-xs text-destructive">{form.errors.confirmPassword[0]}</p>
          {/if}
        </div>

        <button
          type="submit"
          disabled={loadingPassword}
          class="rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90 disabled:opacity-60"
        >
          {loadingPassword ? 'Enregistrement...' : 'Modifier le mot de passe'}
        </button>
      </form>
    {/if}
  </section>

  <!-- Section 3 : Commandes -->
  <section class="rounded-2xl border border-border bg-card p-6">
    <h2 class="mb-5 text-lg font-semibold">Mes commandes</h2>

    {#if data.orders.length === 0}
      <div class="py-12 text-center">
        <div class="mb-3 text-5xl">🛒</div>
        <p class="font-medium text-muted-foreground">Aucune commande pour le moment</p>
        <a
          href="/shop"
          class="mt-4 inline-block rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90"
        >
          Découvrir la boutique
        </a>
      </div>
    {:else}
      <div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead>
            <tr class="border-b border-border text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">
              <th class="pb-3 pr-4">N° commande</th>
              <th class="pb-3 pr-4">Date</th>
              <th class="pb-3 pr-4">Produits</th>
              <th class="pb-3 pr-4">Total</th>
              <th class="pb-3">Statut</th>
            </tr>
          </thead>
          <tbody>
            {#each data.orders as order}
              <tr class="border-b border-border/50 last:border-0">
                <td class="py-3 pr-4 font-mono text-xs text-muted-foreground">
                  #{order.id.slice(0, 6).toUpperCase()}
                </td>
                <td class="py-3 pr-4 text-muted-foreground">
                  {formatDate(order.createdAt)}
                </td>
                <td class="py-3 pr-4">
                  {order.items.map((i) => i.product.name).join(', ')}
                </td>
                <td class="py-3 pr-4 font-semibold">
                  {formatPrice(order.total)}
                </td>
                <td class="py-3">
                  <span
                    class="rounded-full px-2.5 py-0.5 text-xs font-medium {statusColors[order.status] ?? ''}"
                  >
                    {ORDER_STATUS_LABELS[order.status] ?? order.status}
                  </span>
                </td>
              </tr>
            {/each}
          </tbody>
        </table>
      </div>
    {/if}
  </section>
</div>
