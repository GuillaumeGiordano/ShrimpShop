<script lang="ts">
  import { enhance } from '$app/forms';
  import { FAQ_CATEGORY_LABELS } from '$lib/utils/format';
  import type { ActionData } from './$types';

  let { form }: { form: ActionData } = $props();
  let loading = $state(false);

  const categories = Object.entries(FAQ_CATEGORY_LABELS);
</script>

<svelte:head>
  <title>Nouvelle FAQ | Admin</title>
</svelte:head>

<div class="mb-6 flex items-center gap-3">
  <a href="/admin/faq" class="text-sm text-muted-foreground hover:text-foreground">← FAQ</a>
  <span class="text-muted-foreground">/</span>
  <h1 class="font-display text-2xl font-bold">Nouvelle question</h1>
</div>

<div class="mx-auto max-w-2xl">
  <div class="rounded-2xl border border-border bg-white p-8 dark:bg-slate-900">
    <form
      method="POST"
      use:enhance={() => {
        loading = true;
        return async ({ update }) => {
          loading = false;
          await update();
        };
      }}
      class="space-y-5"
    >
      <!-- Catégorie + Ordre -->
      <div class="grid gap-4 sm:grid-cols-2">
        <div>
          <label class="mb-1.5 block text-sm font-medium" for="category">Catégorie *</label>
          <select
            id="category"
            name="category"
            class="w-full rounded-xl border border-input bg-background px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ring"
            class:border-destructive={form?.errors?.category}
          >
            {#each categories as [value, label]}
              <option {value} selected={form?.values?.category === value}>{label}</option>
            {/each}
          </select>
          {#if form?.errors?.category}
            <p class="mt-1 text-xs text-destructive">{form.errors.category[0]}</p>
          {/if}
        </div>

        <div>
          <label class="mb-1.5 block text-sm font-medium" for="order">Ordre d'affichage</label>
          <input
            id="order"
            name="order"
            type="number"
            min="0"
            value={form?.values?.order ?? 0}
            class="w-full rounded-xl border border-input bg-background px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ring"
          />
          <p class="mt-1 text-xs text-muted-foreground">0 = affiché en premier</p>
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
          value={form?.values?.question ?? ''}
          placeholder="Ex: Comment sont expédiées les crevettes ?"
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
          placeholder="Rédigez une réponse claire et détaillée..."
          class="w-full resize-none rounded-xl border border-input bg-background px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ring"
          class:border-destructive={form?.errors?.answer}
        >{form?.values?.answer ?? ''}</textarea>
        {#if form?.errors?.answer}
          <p class="mt-1 text-xs text-destructive">{form.errors.answer[0]}</p>
        {/if}
      </div>

      <!-- Actions -->
      <div class="flex gap-3 pt-2">
        <button
          type="submit"
          disabled={loading}
          class="rounded-xl bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-60"
        >
          {loading ? 'Création...' : 'Créer la FAQ'}
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
</div>
