<script lang="ts">
  import { enhance } from '$app/forms';
  import { toast } from 'svelte-sonner';
  import type { PageData, ActionData } from './$types';

  let { data, form }: { data: PageData; form: ActionData } = $props();
  let loading = $state(false);
  let uploading = $state(false);
  let imageUrl = $state(data.photo.imageUrl);

  $effect(() => {
    if (form?.success) toast.success('Photo mise à jour !');
    if (form?.errors) toast.error('Erreur dans le formulaire');
  });

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
  <title>Éditer photo | Admin</title>
</svelte:head>

<div class="mb-6 flex items-center gap-3">
  <a href="/admin/gallery" class="text-sm text-muted-foreground hover:text-foreground">← Galerie</a>
  <span class="text-muted-foreground">/</span>
  <h1 class="font-display text-2xl font-bold">Éditer la photo</h1>
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
      <!-- Image actuelle + remplacement -->
      <div>
        <label class="mb-1.5 block text-sm font-medium">Image</label>
        <div class="mb-3 overflow-hidden rounded-xl">
          <img src={imageUrl} alt={data.photo.altText ?? data.photo.title} class="h-48 w-full object-cover" />
        </div>
        <label
          class="block cursor-pointer rounded-xl border-2 border-dashed border-border p-4 text-center text-sm transition hover:border-primary
            {uploading ? 'opacity-60 cursor-wait' : ''}"
        >
          {uploading ? '⏳ Upload en cours...' : '🔄 Remplacer l\'image'}
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp,image/avif"
            class="hidden"
            onchange={handleUpload}
            disabled={uploading}
          />
        </label>
        <input type="hidden" name="imageUrl" bind:value={imageUrl} />
      </div>

      <!-- Titre -->
      <div>
        <label class="mb-1.5 block text-sm font-medium" for="title">Titre *</label>
        <input
          id="title"
          name="title"
          type="text"
          required
          value={data.photo.title}
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
          value={data.photo.description ?? ''}
          class="w-full rounded-xl border border-input bg-background px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ring"
        />
      </div>

      <!-- Alt text + Ordre -->
      <div class="grid gap-4 sm:grid-cols-2">
        <div>
          <label class="mb-1.5 block text-sm font-medium" for="altText">Texte alternatif</label>
          <input
            id="altText"
            name="altText"
            type="text"
            value={data.photo.altText ?? ''}
            class="w-full rounded-xl border border-input bg-background px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
        <div>
          <label class="mb-1.5 block text-sm font-medium" for="order">Ordre d'affichage</label>
          <input
            id="order"
            name="order"
            type="number"
            min="0"
            value={data.photo.order}
            class="w-full rounded-xl border border-input bg-background px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
      </div>

      <!-- Actions -->
      <div class="flex gap-3 pt-2">
        <button
          type="submit"
          disabled={loading || uploading}
          class="rounded-xl bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-60"
        >
          {loading ? 'Sauvegarde...' : 'Mettre à jour'}
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

  <!-- Zone danger -->
  <div class="rounded-2xl border border-destructive/30 bg-white p-6 dark:bg-slate-900">
    <h2 class="mb-1 font-semibold text-destructive">Zone de danger</h2>
    <p class="mb-4 text-sm text-muted-foreground">La suppression est irréversible.</p>
    <form method="POST" action="?/delete" use:enhance>
      <button
        type="submit"
        onclick={(e) => {
          if (!confirm('Supprimer définitivement cette photo ?')) e.preventDefault();
        }}
        class="rounded-xl border border-destructive/50 px-5 py-2 text-sm font-medium text-destructive hover:bg-destructive/10"
      >
        Supprimer cette photo
      </button>
    </form>
  </div>
</div>
