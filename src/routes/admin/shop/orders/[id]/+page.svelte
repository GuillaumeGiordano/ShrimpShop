<script lang="ts">
  import { enhance } from '$app/forms';
  import { toast } from 'svelte-sonner';
  import { formatDate, formatPrice, ORDER_STATUS_LABELS } from '$lib/utils/format';
  import type { PageData, ActionData } from './$types';

  let { data, form }: { data: PageData; form: ActionData } = $props();

  $effect(() => {
    if (form?.success) toast.success('Statut mis à jour');
    if (form?.error) toast.error(form.error);
  });
</script>

<div class="mb-6 flex items-center gap-3">
  <a href="/admin/shop/orders" class="rounded-lg border border-border px-3 py-1.5 text-sm font-medium hover:bg-muted">
    ← Retour
  </a>
  <h1 class="font-display text-2xl font-bold">Commande</h1>
  <span class="font-mono text-sm text-muted-foreground">{data.order.id}</span>
</div>

<div class="grid gap-6 lg:grid-cols-3">

  <!-- Détails commande -->
  <div class="lg:col-span-2 space-y-6">

    <!-- Articles -->
    <div class="rounded-2xl border border-border bg-white p-5 dark:bg-slate-900">
      <h3 class="mb-4 font-semibold">Articles commandés</h3>
      <table class="w-full text-sm">
        <thead>
          <tr class="border-b border-border">
            <th class="pb-2 text-left font-medium text-muted-foreground">Produit</th>
            <th class="pb-2 text-right font-medium text-muted-foreground">Qté</th>
            <th class="pb-2 text-right font-medium text-muted-foreground">Prix unit.</th>
            <th class="pb-2 text-right font-medium text-muted-foreground">Total</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-border">
          {#each data.order.items as item}
            <tr>
              <td class="py-3">{item.product.name}</td>
              <td class="py-3 text-right">{item.quantity}</td>
              <td class="py-3 text-right">{formatPrice(item.price)}</td>
              <td class="py-3 text-right font-semibold">{formatPrice(item.price * item.quantity)}</td>
            </tr>
          {/each}
        </tbody>
        <tfoot>
          <tr class="border-t border-border">
            <td colspan="3" class="pt-3 font-bold">Total</td>
            <td class="pt-3 text-right text-lg font-bold text-primary">{formatPrice(data.order.total)}</td>
          </tr>
        </tfoot>
      </table>
    </div>

  </div>

  <!-- Sidebar infos -->
  <div class="space-y-4">

    <!-- Infos client -->
    <div class="rounded-2xl border border-border bg-white p-5 dark:bg-slate-900">
      <h3 class="mb-4 font-semibold">Informations</h3>
      <dl class="space-y-2 text-sm">
        <div>
          <dt class="text-muted-foreground">Email</dt>
          <dd class="font-medium">{data.order.email}</dd>
        </div>
        <div>
          <dt class="text-muted-foreground">Date</dt>
          <dd>{formatDate(data.order.createdAt)}</dd>
        </div>
        {#if data.order.stripeId}
          <div>
            <dt class="text-muted-foreground">Stripe ID</dt>
            <dd class="font-mono text-xs break-all">{data.order.stripeId}</dd>
          </div>
        {/if}
      </dl>
    </div>

    <!-- Statut -->
    <div class="rounded-2xl border border-border bg-white p-5 dark:bg-slate-900">
      <h3 class="mb-4 font-semibold">Statut</h3>
      <div class="mb-3">
        <span class="rounded-full px-3 py-1 text-sm font-semibold
          {data.order.status === 'PAID' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
            : data.order.status === 'CANCELLED' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
            : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'}">
          {ORDER_STATUS_LABELS[data.order.status]}
        </span>
      </div>

      <form method="POST" action="?/updateStatus" use:enhance>
        <select name="status" value={data.order.status}
          class="mb-3 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring">
          <option value="PENDING">En attente</option>
          <option value="PAID">Payé</option>
          <option value="CANCELLED">Annulé</option>
        </select>
        <button type="submit"
          class="w-full rounded-xl bg-primary py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90">
          Mettre à jour
        </button>
      </form>
    </div>

  </div>
</div>
