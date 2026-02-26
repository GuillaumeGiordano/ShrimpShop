<script lang="ts">
  import { enhance } from '$app/forms';
  import { page } from '$app/stores';
  import { toast } from 'svelte-sonner';
  import type { PageData, ActionData } from './$types';

  let { data, form }: { data: PageData; form: ActionData } = $props();

  $effect(() => {
    if ($page.url.searchParams.get('created') === 'true') toast.success('Photo ajoutée !');
    if ($page.url.searchParams.get('deleted') === 'true') toast.success('Photo supprimée !');
    if (form?.success && form.action === 'delete') toast.success('Photo supprimée');
    if (form?.error) toast.error(form.error);
  });
</script>

<div class="mb-6 flex items-center justify-between">
  <div>
    <h1 class="font-display text-2xl font-bold">Galerie photos</h1>
    <p class="text-sm text-muted-foreground">
      {data.photos.length} photo{data.photos.length > 1 ? 's' : ''}
    </p>
  </div>
  <a
    href="/admin/gallery/new"
    class="rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
  >
    + Ajouter une photo
  </a>
</div>

{#if data.photos.length === 0}
  <div class="py-20 text-center text-muted-foreground">
    <p class="text-6xl">🖼</p>
    <p class="mt-3 font-medium">Aucune photo pour l'instant</p>
    <a
      href="/admin/gallery/new"
      class="mt-3 inline-block text-sm font-semibold text-primary hover:underline"
    >
      Ajouter la première photo →
    </a>
  </div>
{:else}
  <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
    {#each data.photos as photo (photo.id)}
      <div
        class="group relative overflow-hidden rounded-2xl border border-border bg-white dark:bg-slate-900"
      >
        <!-- Image -->
        <div class="aspect-square overflow-hidden">
          <img
            src={photo.imageUrl}
            alt={photo.altText ?? photo.title}
            class="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
          />
        </div>

        <!-- Infos -->
        <div class="p-3">
          <p class="truncate text-sm font-medium">{photo.title}</p>
          {#if photo.description}
            <p class="truncate text-xs text-muted-foreground">{photo.description}</p>
          {/if}
          <p class="mt-1 text-xs text-muted-foreground">Ordre : {photo.order}</p>
        </div>

        <!-- Actions au survol -->
        <div
          class="absolute inset-0 flex items-center justify-center gap-2 bg-black/40 opacity-0 transition-opacity group-hover:opacity-100"
        >
          <a
            href="/admin/gallery/{photo.id}/edit"
            class="rounded-lg bg-white px-3 py-1.5 text-xs font-semibold text-slate-800 shadow hover:bg-slate-100"
          >
            ✏️ Éditer
          </a>
          <form method="POST" action="?/delete" use:enhance>
            <input type="hidden" name="id" value={photo.id} />
            <button
              type="submit"
              onclick={(e) => {
                if (!confirm('Supprimer cette photo ?')) e.preventDefault();
              }}
              class="rounded-lg bg-destructive px-3 py-1.5 text-xs font-semibold text-white shadow hover:bg-destructive/90"
            >
              🗑 Supprimer
            </button>
          </form>
        </div>
      </div>
    {/each}
  </div>
{/if}
