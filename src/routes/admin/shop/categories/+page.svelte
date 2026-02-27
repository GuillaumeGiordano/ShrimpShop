<script lang="ts">
  import { enhance } from '$app/forms';
  import { toast } from 'svelte-sonner';
  import type { PageData, ActionData } from './$types';

  let { data, form }: { data: PageData; form: ActionData } = $props();

  $effect(() => {
    if (form?.success) toast.success('Opération réussie');
    if (form?.error) toast.error(form.error);
  });

  let showCreate = $state(false);
  let editingId = $state<string | null>(null);
  let deletingId = $state<string | null>(null);
</script>

<div class="mb-6 flex items-center justify-between">
  <div>
    <h1 class="font-display text-2xl font-bold">Catégories de produits</h1>
    <p class="text-sm text-muted-foreground">{data.categories.length} catégorie{data.categories.length > 1 ? 's' : ''}</p>
  </div>
  <button
    onclick={() => (showCreate = !showCreate)}
    class="rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
  >
    + Nouvelle catégorie
  </button>
</div>

<!-- Formulaire création -->
{#if showCreate}
  <div class="mb-6 rounded-2xl border border-border bg-white p-5 dark:bg-slate-900">
    <h3 class="mb-4 font-semibold">Nouvelle catégorie</h3>
    <form
      method="POST"
      action="?/create"
      use:enhance={() => {
        return async ({ update }) => {
          showCreate = false;
          await update({ reset: true });
        };
      }}
      class="grid gap-4 sm:grid-cols-3"
    >
      <div>
        <label class="mb-1 block text-xs font-medium" for="name">Nom *</label>
        <input
          id="name" name="name" type="text" required
          placeholder="Ex: Neocaridina"
          class="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
        />
      </div>
      <div>
        <label class="mb-1 block text-xs font-medium" for="slug">Slug *</label>
        <input
          id="slug" name="slug" type="text" required
          placeholder="Ex: neocaridina"
          class="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm font-mono outline-none focus:ring-2 focus:ring-ring"
        />
      </div>
      <div>
        <label class="mb-1 block text-xs font-medium" for="order">Ordre</label>
        <input
          id="order" name="order" type="number" value="0"
          class="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
        />
      </div>
      <div class="flex gap-2 sm:col-span-3">
        <button type="submit" class="rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90">
          Créer
        </button>
        <button type="button" onclick={() => (showCreate = false)} class="rounded-xl border border-border px-4 py-2 text-sm font-medium hover:bg-muted">
          Annuler
        </button>
      </div>
    </form>
  </div>
{/if}

<!-- Liste -->
<div class="overflow-hidden rounded-2xl border border-border bg-white dark:bg-slate-900">
  <table class="w-full text-sm">
    <thead>
      <tr class="border-b border-border bg-muted/50">
        <th class="px-4 py-3 text-left font-semibold">Nom</th>
        <th class="px-4 py-3 text-left font-semibold">Slug</th>
        <th class="px-4 py-3 text-left font-semibold">Ordre</th>
        <th class="px-4 py-3 text-right font-semibold">Actions</th>
      </tr>
    </thead>
    <tbody class="divide-y divide-border">
      {#each data.categories as cat (cat.id)}
        <tr class="hover:bg-muted/30">
          {#if editingId === cat.id}
            <td colspan="3" class="px-4 py-3">
              <form
                method="POST"
                action="?/update"
                use:enhance={() => {
                  return async ({ update }) => {
                    editingId = null;
                    await update({ reset: false });
                  };
                }}
                class="grid gap-3 sm:grid-cols-3"
              >
                <input type="hidden" name="id" value={cat.id} />
                <input name="name" value={cat.name} required class="rounded-xl border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring" />
                <input name="slug" value={cat.slug} required class="rounded-xl border border-input bg-background px-3 py-2 text-sm font-mono outline-none focus:ring-2 focus:ring-ring" />
                <input name="order" type="number" value={cat.order} class="rounded-xl border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring" />
                <div class="flex gap-2 sm:col-span-3">
                  <button type="submit" class="rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground">Enregistrer</button>
                  <button type="button" onclick={() => (editingId = null)} class="rounded-lg border border-border px-3 py-1.5 text-xs font-medium hover:bg-muted">Annuler</button>
                </div>
              </form>
            </td>
          {:else}
            <td class="px-4 py-3 font-medium">{cat.name}</td>
            <td class="px-4 py-3 font-mono text-muted-foreground">{cat.slug}</td>
            <td class="px-4 py-3 text-muted-foreground">{cat.order}</td>
          {/if}
          <td class="px-4 py-3">
            <div class="flex items-center justify-end gap-2">
              {#if editingId !== cat.id}
                <button
                  onclick={() => (editingId = cat.id)}
                  class="rounded-lg border border-border px-3 py-1.5 text-xs font-medium hover:bg-muted"
                >
                  Éditer
                </button>
              {/if}
              <form
                method="POST"
                action="?/delete"
                use:enhance={() => {
                  deletingId = cat.id;
                  return async ({ update }) => {
                    deletingId = null;
                    await update({ reset: false });
                  };
                }}
              >
                <input type="hidden" name="id" value={cat.id} />
                <button
                  type="submit"
                  onclick={(e) => { if (!confirm(`Supprimer "${cat.name}" ?`)) e.preventDefault(); }}
                  disabled={deletingId === cat.id}
                  class="rounded-lg border border-destructive/30 px-3 py-1.5 text-xs font-medium text-destructive hover:bg-destructive/10 disabled:opacity-50"
                >
                  {deletingId === cat.id ? '...' : 'Supprimer'}
                </button>
              </form>
            </div>
          </td>
        </tr>
      {/each}
    </tbody>
  </table>

  {#if data.categories.length === 0}
    <div class="py-12 text-center text-muted-foreground">
      <p class="text-4xl">🏷️</p>
      <p class="mt-2">Aucune catégorie pour l'instant</p>
    </div>
  {/if}
</div>
