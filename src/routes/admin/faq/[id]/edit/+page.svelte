<script lang="ts">
  import { enhance } from '$app/forms';
  import { toast } from 'svelte-sonner';
  import type { PageData, ActionData } from './$types';

  let { data, form }: { data: PageData; form: ActionData } = $props();
  let loading = $state(false);

  type FormErrors = Record<string, string[] | undefined> | undefined;

  $effect(() => {
    if (form?.success) toast.success('FAQ mise à jour !');
    if (form?.errors) toast.error('Erreur dans le formulaire');
  });
</script>

<svelte:head>
  <title>Éditer FAQ | Admin</title>
</svelte:head>

<div class="mb-6 flex items-center gap-3">
  <a href="/admin/faq" class="text-sm text-muted-foreground hover:text-foreground">← FAQ</a>
  <span class="text-muted-foreground">/</span>
  <h1 class="font-display text-2xl font-bold">Éditer la question</h1>
</div>

<div class="mx-auto max-w-2xl space-y-4">
  <!-- Formulaire édition -->
  <div class="rounded-2xl border border-border bg-white p-8 dark:bg-slate-900">
    <form
      method="POST"
      action="?/update"
      use:enhance={() => {
        loading = true;
        return async ({ update }) => {
          loading = false;
          await update({ reset: false });
        };
      }}
      class="space-y-5"
    >
      <!-- Catégorie + Ordre -->
      <div class="grid gap-4 sm:grid-cols-2">
        <div>
          <label class="mb-1.5 block text-sm font-medium" for="categoryId">Catégorie</label>
          <select
            id="categoryId"
            name="categoryId"
            class="w-full rounded-xl border border-input bg-background px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="" selected={!data.faq.categoryId}>Aucune catégorie</option>
            {#each data.categories as cat}
              <option value={cat.id} selected={data.faq.categoryId === cat.id}>{cat.name}</option>
            {/each}
          </select>
        </div>

        <div>
          <label class="mb-1.5 block text-sm font-medium" for="order">Ordre d'affichage</label>
          <input
            id="order"
            name="order"
            type="number"
            min="0"
            value={data.faq.order}
            class="w-full rounded-xl border border-input bg-background px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
      </div>

      <!-- Question -->
      <div>
        <label class="mb-1.5 block text-sm font-medium" for="question">Question *</label>
        <input
          id="question"
          name="question"
          type="text"
          required
          value={data.faq.question}
          class="w-full rounded-xl border border-input bg-background px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ring"
          class:border-destructive={form?.errors?.question}
        />
        {#if form?.errors?.question}
          <p class="mt-1 text-xs text-destructive">{form.errors.question[0]}</p>
        {/if}
      </div>

      <!-- Réponse -->
      <div>
        <label class="mb-1.5 block text-sm font-medium" for="answer">Réponse *</label>
        <textarea
          id="answer"
          name="answer"
          rows="6"
          required
          class="w-full resize-none rounded-xl border border-input bg-background px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ring"
          class:border-destructive={form?.errors?.answer}
        >{data.faq.answer}</textarea>
        {#if form?.errors?.answer}
          <p class="mt-1 text-xs text-destructive">{form?.errors?.answer?.[0]}</p>
        {/if}
      </div>

      <!-- Actions -->
      <div class="flex gap-3 pt-2">
        <button
          type="submit"
          disabled={loading}
          class="rounded-xl bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-60"
        >
          {loading ? 'Sauvegarde...' : 'Mettre à jour'}
        </button>
        <a
          href="/admin/faq"
          class="rounded-xl border border-border px-6 py-2.5 text-sm font-medium hover:bg-muted"
        >
          Annuler
        </a>
      </div>
    </form>
  </div>

  <!-- Zone danger -->
  <div class="rounded-2xl border border-destructive/30 bg-white p-6 dark:bg-slate-900">
    <h2 class="mb-1 font-semibold text-destructive">Zone de danger</h2>
    <p class="mb-4 text-sm text-muted-foreground">
      La suppression est irréversible.
    </p>
    <form
      method="POST"
      action="?/delete"
      use:enhance
    >
      <button
        type="submit"
        onclick={(e) => {
          if (!confirm('Supprimer définitivement cette FAQ ?')) e.preventDefault();
        }}
        class="rounded-xl border border-destructive/50 px-5 py-2 text-sm font-medium text-destructive hover:bg-destructive/10"
      >
        Supprimer cette FAQ
      </button>
    </form>
  </div>
</div>
