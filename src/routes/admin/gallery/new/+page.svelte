<script lang="ts">
  import { enhance } from '$app/forms';
  import type { PageData, ActionData } from './$types';

  let { data, form }: { data: PageData; form: ActionData } = $props();
  let loading = $state(false);
  let uploading = $state(false);
  let imageUrl = $state('');

  async function handleUpload(e: Event) {
    const input = e.target as HTMLInputElement;
    if (!input.files?.[0]) return;
    uploading = true;
    const fd = new FormData();
    fd.append('file', input.files[0]);
    fd.append('bucket', 'gallery');
    try {
      const res = await fetch('/api/upload', { method: 'POST', body: fd });
      const result = await res.json();
      if (result.url) imageUrl = result.url;
    } finally {
      uploading = false;
    }
  }
</script>

<svelte:head>
  <title>Nouvelle photo | Admin</title>
</svelte:head>

<div class="mb-6 flex items-center gap-3">
  <a href="/admin/gallery" class="text-sm text-muted-foreground hover:text-foreground">← Galerie</a>
  <span class="text-muted-foreground">/</span>
  <h1 class="font-display text-2xl font-bold">Nouvelle photo</h1>
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
      <!-- Image upload -->
      <div>
        <label class="mb-1.5 block text-sm font-medium">Image *</label>
        {#if imageUrl}
          <div class="mb-3 overflow-hidden rounded-xl">
            <img src={imageUrl} alt="Prévisualisation" class="h-48 w-full object-cover" />
          </div>
          <button
            type="button"
            onclick={() => (imageUrl = '')}
            class="mb-3 text-xs text-destructive hover:underline"
          >
            ✕ Supprimer l'image
          </button>
        {/if}
        <label
          class="block cursor-pointer rounded-xl border-2 border-dashed border-border p-8 text-center transition hover:border-primary
            {uploading ? 'opacity-60 cursor-wait' : ''}"
        >
          <div class="text-3xl mb-2">{uploading ? '⏳' : '📎'}</div>
          <p class="text-sm font-medium">{uploading ? 'Upload en cours...' : 'Cliquer pour choisir une image'}</p>
          <p class="mt-1 text-xs text-muted-foreground">JPEG, PNG, WebP, AVIF — max 5 Mo</p>
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp,image/avif"
            class="hidden"
            onchange={handleUpload}
            disabled={uploading}
          />
        </label>
        <input type="hidden" name="imageUrl" bind:value={imageUrl} />
        {#if form?.errors?.imageUrl}
          <p class="mt-1 text-xs text-destructive">{form.errors.imageUrl[0]}</p>
        {/if}
      </div>

      <!-- Titre -->
      <div>
        <label class="mb-1.5 block text-sm font-medium" for="title">Titre *</label>
        <input
          id="title"
          name="title"
          type="text"
          required
          value={form?.values?.title ?? ''}
          placeholder="Ex: Crystal Red SSS"
          class="w-full rounded-xl border border-input bg-background px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ring"
          class:border-destructive={form?.errors?.title}
        />
        {#if form?.errors?.title}
          <p class="mt-1 text-xs text-destructive">{form.errors.title[0]}</p>
        {/if}
      </div>

      <!-- Description -->
      <div>
        <label class="mb-1.5 block text-sm font-medium" for="description">Description</label>
        <input
          id="description"
          name="description"
          type="text"
          value={form?.values?.description ?? ''}
          placeholder="Ex: Caridina cantonensis grade SSS"
          class="w-full rounded-xl border border-input bg-background px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ring"
        />
      </div>

      <!-- Catégorie + Alt text + Ordre -->
      <div class="grid gap-4 sm:grid-cols-2">
        <div>
          <label class="mb-1.5 block text-sm font-medium" for="categoryId">Catégorie</label>
          <select
            id="categoryId"
            name="categoryId"
            class="w-full rounded-xl border border-input bg-background px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="">Aucune catégorie</option>
            {#each data.categories as cat}
              <option value={cat.id}>{cat.name}</option>
            {/each}
          </select>
        </div>
        <div>
          <label class="mb-1.5 block text-sm font-medium" for="altText">Texte alternatif</label>
          <input
            id="altText"
            name="altText"
            type="text"
            value={form?.values?.altText ?? ''}
            placeholder="Description pour l'accessibilité"
            class="w-full rounded-xl border border-input bg-background px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
      </div>

      <!-- Ordre -->
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

      <!-- Actions -->
      <div class="flex gap-3 pt-2">
        <button
          type="submit"
          disabled={loading || uploading || !imageUrl}
          class="rounded-xl bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-60"
        >
          {loading ? 'Création...' : 'Ajouter la photo'}
        </button>
        <a
          href="/admin/gallery"
          class="rounded-xl border border-border px-6 py-2.5 text-sm font-medium hover:bg-muted"
        >
          Annuler
        </a>
      </div>
    </form>
  </div>
</div>
