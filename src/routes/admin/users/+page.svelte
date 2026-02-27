<script lang="ts">
  import { enhance } from '$app/forms';
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';
  import { toast } from 'svelte-sonner';
  import { formatDate, ROLE_LABELS } from '$lib/utils/format';
  import type { PageData, ActionData } from './$types';

  let { data, form }: { data: PageData; form: ActionData } = $props();

  $effect(() => {
    if (form?.success) toast.success('Mise à jour effectuée');
    if (form?.error) toast.error(form.error);
  });

  let search = $state(data.filters.search ?? '');
  let searchTimeout: ReturnType<typeof setTimeout>;

  function onSearch() {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
      const params = new URLSearchParams($page.url.searchParams);
      if (search) params.set('search', search);
      else params.delete('search');
      params.delete('page');
      goto(`?${params.toString()}`);
    }, 400);
  }

  function setPage(p: number) {
    const params = new URLSearchParams($page.url.searchParams);
    params.set('page', String(p));
    goto(`?${params.toString()}`);
  }
</script>

<div class="mb-6 flex items-center justify-between">
  <div>
    <h1 class="font-display text-2xl font-bold">Utilisateurs</h1>
    <p class="text-sm text-muted-foreground">{data.total} utilisateur{data.total > 1 ? 's' : ''}</p>
  </div>
  <div class="relative">
    <svg class="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
    <input
      type="search"
      placeholder="Rechercher..."
      bind:value={search}
      oninput={onSearch}
      class="rounded-xl border border-input bg-background py-2 pl-9 pr-4 text-sm outline-none focus:ring-2 focus:ring-ring"
    />
  </div>
</div>

<div class="overflow-hidden rounded-2xl border border-border bg-white dark:bg-slate-900">
  <div class="overflow-x-auto">
    <table class="w-full text-sm">
      <thead>
        <tr class="border-b border-border bg-muted/50">
          <th class="px-4 py-3 text-left font-semibold">Utilisateur</th>
          <th class="px-4 py-3 text-left font-semibold">Rôle</th>
          <th class="px-4 py-3 text-left font-semibold">Accès</th>
          <th class="px-4 py-3 text-left font-semibold">Inscrit le</th>
          <th class="px-4 py-3 text-right font-semibold">Actions</th>
        </tr>
      </thead>
      <tbody class="divide-y divide-border">
        {#each data.data as user (user.id)}
          <tr class="hover:bg-muted/30">
            <td class="px-4 py-3">
              <div class="flex items-center gap-3">
                <div class="flex h-8 w-8 items-center justify-center rounded-full bg-aqua-100 font-semibold text-aqua-700 dark:bg-aqua-900/30 dark:text-aqua-300">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p class="font-medium">{user.name}</p>
                  <p class="text-xs text-muted-foreground">{user.email}</p>
                </div>
              </div>
            </td>
            <td class="px-4 py-3">
              <form method="POST" action="?/updateRole" use:enhance>
                <input type="hidden" name="id" value={user.id} />
                <select
                  name="role"
                  value={user.role}
                  onchange={(e) => (e.target as HTMLSelectElement).form?.requestSubmit()}
                  class="rounded-lg border border-input bg-background px-2 py-1 text-xs font-semibold outline-none focus:ring-2 focus:ring-ring
                    {user.role === 'ADMIN' ? 'text-amber-700 bg-amber-50 dark:bg-amber-900/20' : 'text-blue-700 bg-blue-50 dark:bg-blue-900/20'}"
                >
                  <option value="USER">Utilisateur</option>
                  <option value="ADMIN">Admin</option>
                </select>
              </form>
            </td>
            <td class="px-4 py-3">
              <form method="POST" action="?/updateEnabled" use:enhance>
                <input type="hidden" name="id" value={user.id} />
                <input type="hidden" name="enabled" value={user.enabled ? 'false' : 'true'} />
                <button
                  type="submit"
                  title={user.enabled ? 'Désactiver' : 'Activer'}
                  class="relative inline-flex h-5 w-9 items-center rounded-full transition-colors
                    {user.enabled ? 'bg-green-500' : 'bg-slate-300 dark:bg-slate-600'}"
                >
                  <span class="inline-block h-4 w-4 rounded-full bg-white shadow transition-transform
                    {user.enabled ? 'translate-x-4' : 'translate-x-0.5'}"
                  ></span>
                </button>
              </form>
            </td>
            <td class="px-4 py-3 text-muted-foreground">
              {formatDate(user.createdAt)}
            </td>
            <td class="px-4 py-3">
              <div class="flex justify-end">
                <form method="POST" action="?/delete" use:enhance>
                  <input type="hidden" name="id" value={user.id} />
                  <button
                    type="submit"
                    onclick={(e) => {
                      if (!confirm(`Supprimer ${user.name} ?`)) e.preventDefault();
                    }}
                    class="rounded-lg border border-destructive/30 px-3 py-1.5 text-xs font-medium text-destructive hover:bg-destructive/10"
                  >
                    Supprimer
                  </button>
                </form>
              </div>
            </td>
          </tr>
        {/each}
      </tbody>
    </table>
  </div>

  {#if data.data.length === 0}
    <div class="py-12 text-center text-muted-foreground">
      <p class="text-4xl">👤</p>
      <p class="mt-2">Aucun utilisateur trouvé</p>
    </div>
  {/if}
</div>

{#if data.totalPages > 1}
  <div class="mt-6 flex items-center justify-center gap-2">
    <button onclick={() => setPage(data.page - 1)} disabled={data.page <= 1} class="rounded-xl border border-border px-4 py-2 text-sm font-medium hover:bg-muted disabled:opacity-40">← Préc.</button>
    {#each Array.from({ length: data.totalPages }, (_, i) => i + 1) as p}
      <button onclick={() => setPage(p)} class="rounded-xl px-4 py-2 text-sm font-medium {p === data.page ? 'bg-primary text-primary-foreground' : 'border border-border hover:bg-muted'}">{p}</button>
    {/each}
    <button onclick={() => setPage(data.page + 1)} disabled={data.page >= data.totalPages} class="rounded-xl border border-border px-4 py-2 text-sm font-medium hover:bg-muted disabled:opacity-40">Suiv. →</button>
  </div>
{/if}
