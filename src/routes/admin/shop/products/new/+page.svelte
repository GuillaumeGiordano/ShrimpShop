<script lang="ts">
  import { enhance } from '$app/forms';
  import { toast } from 'svelte-sonner';
  import ProductForm from '$components/admin/ProductForm.svelte';
  import type { PageData, ActionData } from './$types';

  let { data, form }: { data: PageData; form: ActionData } = $props();

  let loading = $state(false);

  $effect(() => {
    if (form?.error) toast.error(form.error);
  });
</script>

<div class="mb-6 flex items-center gap-3">
  <a href="/admin/shop/products" class="rounded-lg border border-border px-3 py-1.5 text-sm font-medium hover:bg-muted">
    ← Retour
  </a>
  <h1 class="font-display text-2xl font-bold">Nouveau produit</h1>
</div>

<form
  method="POST"
  use:enhance={() => {
    loading = true;
    return async ({ update }) => {
      loading = false;
      await update();
    };
  }}
>
  <ProductForm
    categories={data.categories}
    errors={form && 'errors' in form ? (form.errors as Record<string, string[]>) : undefined}
    values={form?.values as Record<string, unknown>}
    {loading}
  />
</form>
