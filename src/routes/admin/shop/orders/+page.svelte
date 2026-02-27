<script lang="ts">
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';
  import { formatDate, formatPrice, ORDER_STATUS_LABELS } from '$lib/utils/format';
  import type { PageData } from './$types';

  let { data }: { data: PageData } = $props();

  const statusOptions = [
    { value: '', label: 'Tous' },
    { value: 'PENDING', label: 'En attente' },
    { value: 'PAID', label: 'Payé' },
    { value: 'CANCELLED', label: 'Annulé' }
  ];

  function setFilter(key: string, value: string) {
    const params = new URLSearchParams($page.url.searchParams);
    if (value) params.set(key, value); else params.delete(key);
    params.delete('page');
    goto(`?${params.toString()}`);
  }

  function setPage(p: number) {
    const params = new URLSearchParams($page.url.searchParams);
    params.set('page', String(p));
    goto(`?${params.toString()}`);
  }

  const currentStatus = $page.url.searchParams.get('status') ?? '';
</script>

<div class="mb-6 flex items-center justify-between">
  <div>
    <h1 class="font-display text-2xl font-bold">Commandes</h1>
    <p class="text-sm text-muted-foreground">{data.total} commande{data.total > 1 ? 's' : ''}</p>
  </div>
</div>

<!-- Filtres statut -->
<div class="mb-6 flex flex-wrap gap-2">
  {#each statusOptions as opt}
    <button
      onclick={() => setFilter('status', opt.value)}
      class="rounded-full border px-4 py-1.5 text-sm font-medium transition-all
        {currentStatus === opt.value ? 'border-primary bg-primary text-primary-foreground' : 'border-border hover:bg-muted'}"
    >
      {opt.label}
    </button>
  {/each}
</div>

<div class="overflow-hidden rounded-2xl border border-border bg-white dark:bg-slate-900">
  <div class="overflow-x-auto">
    <table class="w-full text-sm">
      <thead>
        <tr class="border-b border-border bg-muted/50">
          <th class="px-4 py-3 text-left font-semibold">ID</th>
          <th class="px-4 py-3 text-left font-semibold">Email</th>
          <th class="px-4 py-3 text-left font-semibold">Total</th>
          <th class="px-4 py-3 text-left font-semibold">Statut</th>
          <th class="px-4 py-3 text-left font-semibold">Date</th>
          <th class="px-4 py-3 text-right font-semibold">Actions</th>
        </tr>
      </thead>
      <tbody class="divide-y divide-border">
        {#each data.data as order (order.id)}
          <tr class="hover:bg-muted/30">
            <td class="px-4 py-3 font-mono text-xs text-muted-foreground">{order.id.slice(0, 8)}…</td>
            <td class="px-4 py-3">{order.email}</td>
            <td class="px-4 py-3 font-semibold">{formatPrice(order.total)}</td>
            <td class="px-4 py-3">
              <span class="rounded-full px-2.5 py-1 text-xs font-semibold
                {order.status === 'PAID' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                  : order.status === 'CANCELLED' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                  : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'}">
                {ORDER_STATUS_LABELS[order.status]}
              </span>
            </td>
            <td class="px-4 py-3 text-muted-foreground">{formatDate(order.createdAt)}</td>
            <td class="px-4 py-3 text-right">
              <a href="/admin/shop/orders/{order.id}"
                class="rounded-lg border border-border px-3 py-1.5 text-xs font-medium hover:bg-muted">
                Voir
              </a>
            </td>
          </tr>
        {/each}
      </tbody>
    </table>
  </div>

  {#if data.data.length === 0}
    <div class="py-12 text-center text-muted-foreground">
      <p class="text-4xl">📋</p>
      <p class="mt-2">Aucune commande</p>
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
