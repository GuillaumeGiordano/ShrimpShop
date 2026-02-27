<script lang="ts">
  import { enhance } from '$app/forms';
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';
  import { toast } from 'svelte-sonner';
  import { formatPrice, formatDate } from '$lib/utils/format';
  import type { PageData, ActionData } from './$types';

  let { data, form }: { data: PageData; form: ActionData } = $props();

  $effect(() => {
    if (form?.success) toast.success('Produit supprimé');
    if (form?.error) toast.error(form.error);
  });

  function setPage(p: number) {
    const params = new URLSearchParams($page.url.searchParams);
    params.set('page', String(p));
    goto(`?${params.toString()}`);
  }

  let deletingId = $state<string | null>(null);
</script>

<div class="mb-6 flex items-center justify-between">
  <div>
    <h1 class="font-display text-2xl font-bold">Produits</h1>
    <p class="text-sm text-muted-foreground">{data.total} produit{data.total > 1 ? 's' : ''}</p>
  </div>
  <a
    href="/admin/shop/products/new"
    class="rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
  >
    + Nouveau produit
  </a>
</div>

<div class="overflow-hidden rounded-2xl border border-border bg-white dark:bg-slate-900">
  <div class="overflow-x-auto">
    <table class="w-full text-sm">
      <thead>
        <tr class="border-b border-border bg-muted/50">
          <th class="px-4 py-3 text-left font-semibold">Produit</th>
          <th class="px-4 py-3 text-left font-semibold">Catégorie</th>
          <th class="px-4 py-3 text-left font-semibold">Prix</th>
          <th class="px-4 py-3 text-left font-semibold">Stock</th>
          <th class="px-4 py-3 text-left font-semibold">Statut</th>
          <th class="px-4 py-3 text-right font-semibold">Actions</th>
        </tr>
      </thead>
      <tbody class="divide-y divide-border">
        {#each data.data as product (product.id)}
          <tr class="hover:bg-muted/30">
            <td class="px-4 py-3">
              <div class="flex items-center gap-3">
                {#if product.image}
                  <img src={product.image} alt="" class="h-9 w-9 rounded-lg object-cover" loading="lazy" />
                {:else}
                  <div class="flex h-9 w-9 items-center justify-center rounded-lg bg-muted text-lg">🦐</div>
                {/if}
                <span class="font-medium line-clamp-1 max-w-xs">{product.name}</span>
              </div>
            </td>
            <td class="px-4 py-3 text-muted-foreground">
              {product.category?.name ?? '—'}
            </td>
            <td class="px-4 py-3 font-semibold">{formatPrice(product.price)}</td>
            <td class="px-4 py-3">
              <span class={product.stock === 0 ? 'text-destructive font-semibold' : product.stock <= 5 ? 'text-amber-600' : ''}>
                {product.stock}
              </span>
            </td>
            <td class="px-4 py-3">
              <span class="rounded-full px-2.5 py-1 text-xs font-semibold
                {product.isActive
                  ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                  : 'bg-muted text-muted-foreground'}">
                {product.isActive ? 'Actif' : 'Inactif'}
              </span>
            </td>
            <td class="px-4 py-3">
              <div class="flex items-center justify-end gap-2">
                <a
                  href="/admin/shop/products/{product.id}/edit"
                  class="rounded-lg border border-border px-3 py-1.5 text-xs font-medium hover:bg-muted"
                >
                  Éditer
                </a>
                <form
                  method="POST"
                  action="?/delete"
                  use:enhance={() => {
                    deletingId = product.id;
                    return async ({ update }) => {
                      deletingId = null;
                      await update({ reset: false });
                    };
                  }}
                >
                  <input type="hidden" name="id" value={product.id} />
                  <button
                    type="submit"
                    onclick={(e) => {
                      if (!confirm(`Supprimer "${product.name}" ?`)) e.preventDefault();
                    }}
                    disabled={deletingId === product.id}
                    class="rounded-lg border border-destructive/30 px-3 py-1.5 text-xs font-medium text-destructive hover:bg-destructive/10 disabled:opacity-50"
                  >
                    {deletingId === product.id ? '...' : 'Supprimer'}
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
      <p class="text-4xl">📦</p>
      <p class="mt-2">Aucun produit pour l'instant</p>
      <a href="/admin/shop/products/new" class="mt-3 inline-block text-sm font-semibold text-primary hover:underline">
        Créer le premier produit →
      </a>
    </div>
  {/if}
</div>

{#if data.totalPages > 1}
  <div class="mt-6 flex items-center justify-center gap-2">
    <button onclick={() => setPage(data.page - 1)} disabled={data.page <= 1}
      class="rounded-xl border border-border px-4 py-2 text-sm font-medium hover:bg-muted disabled:opacity-40">← Préc.</button>
    {#each Array.from({ length: data.totalPages }, (_, i) => i + 1) as p}
      <button onclick={() => setPage(p)}
        class="rounded-xl px-4 py-2 text-sm font-medium {p === data.page ? 'bg-primary text-primary-foreground' : 'border border-border hover:bg-muted'}">
        {p}
      </button>
    {/each}
    <button onclick={() => setPage(data.page + 1)} disabled={data.page >= data.totalPages}
      class="rounded-xl border border-border px-4 py-2 text-sm font-medium hover:bg-muted disabled:opacity-40">Suiv. →</button>
  </div>
{/if}
