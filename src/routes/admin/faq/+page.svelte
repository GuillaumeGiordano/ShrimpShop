<script lang="ts">
  import { enhance } from '$app/forms';
  import { page } from '$app/stores';
  import { toast } from 'svelte-sonner';
  import { FAQ_CATEGORY_LABELS } from '$lib/utils/format';
  import type { PageData, ActionData } from './$types';

  let { data, form }: { data: PageData; form: ActionData } = $props();

  $effect(() => {
    if ($page.url.searchParams.get('created') === 'true') toast.success('FAQ créée !');
    if ($page.url.searchParams.get('deleted') === 'true') toast.success('FAQ supprimée !');
    if (form?.success && form.action === 'delete') toast.success('FAQ supprimée');
    if (form?.error) toast.error(form.error);
  });
</script>

<div class="mb-6 flex items-center justify-between">
  <div>
    <h1 class="font-display text-2xl font-bold">FAQ</h1>
    <p class="text-sm text-muted-foreground">
      {data.faqs.length} question{data.faqs.length > 1 ? 's' : ''}
    </p>
  </div>
  <a
    href="/admin/faq/new"
    class="rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
  >
    + Nouvelle FAQ
  </a>
</div>

<!-- Liste FAQs -->
<div class="space-y-3">
  {#each data.faqs as faq (faq.id)}
    <div
      class="flex items-start gap-4 rounded-2xl border border-border bg-white p-5 dark:bg-slate-900"
    >
      <div class="flex-1 min-w-0">
        <div class="mb-1.5 flex flex-wrap items-center gap-2">
          <span
            class="rounded-full bg-aqua-100 px-2.5 py-0.5 text-xs font-semibold text-aqua-700 dark:bg-aqua-900/30 dark:text-aqua-300"
          >
            {FAQ_CATEGORY_LABELS[faq.category] ?? faq.category}
          </span>
          <span class="text-xs text-muted-foreground">Ordre : {faq.order}</span>
        </div>
        <p class="font-medium">{faq.question}</p>
        <p class="mt-1 text-sm text-muted-foreground line-clamp-2">{faq.answer}</p>
      </div>

      <div class="flex shrink-0 gap-2">
        <a
          href="/admin/faq/{faq.id}/edit"
          class="rounded-lg border border-border px-3 py-1.5 text-xs font-medium hover:bg-muted"
        >
          Éditer
        </a>
        <form method="POST" action="?/delete" use:enhance>
          <input type="hidden" name="id" value={faq.id} />
          <button
            type="submit"
            onclick={(e) => {
              if (!confirm('Supprimer cette FAQ ?')) e.preventDefault();
            }}
            class="rounded-lg border border-destructive/30 px-3 py-1.5 text-xs font-medium text-destructive hover:bg-destructive/10"
          >
            Supprimer
          </button>
        </form>
      </div>
    </div>
  {/each}
</div>

{#if data.faqs.length === 0}
  <div class="py-20 text-center text-muted-foreground">
    <p class="text-6xl">❓</p>
    <p class="mt-3 font-medium">Aucune FAQ pour l'instant</p>
    <a
      href="/admin/faq/new"
      class="mt-3 inline-block text-sm font-semibold text-primary hover:underline"
    >
      Créer la première FAQ →
    </a>
  </div>
{/if}
