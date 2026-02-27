<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import type { ProductDTO, ProductCategoryDTO } from '$types';

  let {
    product,
    categories,
    errors,
    values,
    loading = false
  }: {
    product?: ProductDTO;
    categories: ProductCategoryDTO[];
    errors?: Record<string, string[]>;
    values?: Record<string, unknown>;
    loading?: boolean;
  } = $props();

  // ── Editor TipTap ─────────────────────────────────────────
  let editorEl: HTMLDivElement;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let editor: any = null;
  let descriptionHtml = $state(product?.description ?? (values?.description as string) ?? '');

  let activeStates = $state<Record<string, boolean>>({});

  function updateActiveStates() {
    if (!editor) return;
    activeStates = {
      bold: editor.isActive('bold'),
      italic: editor.isActive('italic'),
      bulletList: editor.isActive('bulletList'),
      orderedList: editor.isActive('orderedList'),
      h2: editor.isActive('heading', { level: 2 }),
      h3: editor.isActive('heading', { level: 3 })
    };
  }

  onMount(async () => {
    const { Editor } = await import('@tiptap/core');
    const { default: StarterKit } = await import('@tiptap/starter-kit');
    const { default: Placeholder } = await import('@tiptap/extension-placeholder');
    const { default: Underline } = await import('@tiptap/extension-underline');

    editor = new Editor({
      element: editorEl,
      extensions: [
        StarterKit,
        Underline,
        Placeholder.configure({ placeholder: 'Décrivez votre produit...' })
      ],
      content: descriptionHtml,
      onUpdate: ({ editor: e }) => {
        descriptionHtml = e.getHTML();
        updateActiveStates();
      },
      onSelectionUpdate: () => updateActiveStates(),
      onTransaction: () => updateActiveStates()
    });

    updateActiveStates();
  });

  onDestroy(() => {
    editor?.destroy();
  });

  function cmd(fn: (e: typeof editor) => void) {
    if (!editor) return;
    fn(editor);
  }

  function tbClass(active: boolean) {
    return `flex h-8 w-8 items-center justify-center rounded-lg text-sm transition-all
      ${active
        ? 'bg-primary text-primary-foreground shadow-sm'
        : 'hover:bg-muted text-foreground'}`;
  }

  // ── Image produit ─────────────────────────────────────────
  let imageUrl = $state(product?.image ?? '');
  let imageUploading = $state(false);

  async function handleImageUpload(e: Event) {
    const input = e.target as HTMLInputElement;
    if (!input.files?.[0]) return;
    imageUploading = true;
    const fd = new FormData();
    fd.append('file', input.files[0]);
    fd.append('bucket', 'products');
    try {
      const res = await fetch('/api/upload', { method: 'POST', body: fd });
      const result = await res.json();
      if (result.url) imageUrl = result.url;
    } finally {
      imageUploading = false;
      input.value = '';
    }
  }

  // ── États locaux ──────────────────────────────────────────
  let isActive = $state(product?.isActive ?? true);
  let selectedCategory = $state(product?.categoryId ?? '');
</script>

<div class="grid gap-6 lg:grid-cols-3">

  <!-- Colonne principale -->
  <div class="space-y-5 lg:col-span-2">

    <!-- Nom -->
    <div>
      <label class="mb-1.5 block text-sm font-medium" for="name">Nom du produit *</label>
      <input
        id="name" name="name" type="text" required
        value={product?.name ?? (values?.name as string) ?? ''}
        placeholder="Ex: Neocaridina Red Cherry"
        class="w-full rounded-xl border border-input bg-background px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ring"
        class:border-destructive={errors?.name}
      />
      {#if errors?.name}<p class="mt-1 text-xs text-destructive">{errors.name[0]}</p>{/if}
    </div>

    <!-- Slug -->
    <div>
      <label class="mb-1.5 block text-sm font-medium" for="slug">Slug (URL) *</label>
      <input
        id="slug" name="slug" type="text" required
        value={product?.slug ?? (values?.slug as string) ?? ''}
        placeholder="Ex: neocaridina-red-cherry"
        class="w-full rounded-xl border border-input bg-background px-4 py-2.5 text-sm font-mono outline-none focus:ring-2 focus:ring-ring"
        class:border-destructive={errors?.slug}
      />
      {#if errors?.slug}<p class="mt-1 text-xs text-destructive">{errors.slug[0]}</p>{/if}
    </div>

    <!-- Description TipTap -->
    <div>
      <label class="mb-1.5 block text-sm font-medium">Description *</label>

      <!-- Toolbar -->
      <div class="rounded-t-xl border border-b-0 border-input bg-muted/40 px-2 py-1.5">
        <div class="flex flex-wrap items-center gap-0.5">
          <button type="button" title="Annuler" onclick={() => cmd((e) => e.chain().focus().undo().run())} class={tbClass(false)}>
            <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6"/></svg>
          </button>
          <button type="button" title="Rétablir" onclick={() => cmd((e) => e.chain().focus().redo().run())} class={tbClass(false)}>
            <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 10H11a8 8 0 00-8 8v2m18-10l-6 6m6-6l-6-6"/></svg>
          </button>
          <div class="mx-1 h-5 w-px bg-border"></div>
          <button type="button" title="Titre 2" onclick={() => cmd((e) => e.chain().focus().toggleHeading({ level: 2 }).run())} class={tbClass(activeStates.h2)}>
            <span class="text-xs font-bold">H2</span>
          </button>
          <button type="button" title="Titre 3" onclick={() => cmd((e) => e.chain().focus().toggleHeading({ level: 3 }).run())} class={tbClass(activeStates.h3)}>
            <span class="text-xs font-bold">H3</span>
          </button>
          <div class="mx-1 h-5 w-px bg-border"></div>
          <button type="button" title="Gras" onclick={() => cmd((e) => e.chain().focus().toggleBold().run())} class={tbClass(activeStates.bold)}>
            <span class="text-sm font-black">B</span>
          </button>
          <button type="button" title="Italique" onclick={() => cmd((e) => e.chain().focus().toggleItalic().run())} class={tbClass(activeStates.italic)}>
            <span class="text-sm italic font-semibold">I</span>
          </button>
          <div class="mx-1 h-5 w-px bg-border"></div>
          <button type="button" title="Liste à puces" onclick={() => cmd((e) => e.chain().focus().toggleBulletList().run())} class={tbClass(activeStates.bulletList)}>
            <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"/></svg>
          </button>
          <button type="button" title="Liste numérotée" onclick={() => cmd((e) => e.chain().focus().toggleOrderedList().run())} class={tbClass(activeStates.orderedList)}>
            <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6h11M10 12h11M10 18h11M4 6h.01M4 12h.01M4 18h.01"/></svg>
          </button>
        </div>
      </div>

      <!-- Zone d'édition -->
      <div
        bind:this={editorEl}
        class="tiptap-content min-h-[200px] rounded-b-xl border border-input bg-background p-4 outline-none focus-within:ring-2 focus-within:ring-ring"
        class:border-destructive={errors?.description}
      ></div>

      <input type="hidden" name="description" bind:value={descriptionHtml} />
      {#if errors?.description}<p class="mt-1 text-xs text-destructive">{errors.description[0]}</p>{/if}
    </div>
  </div>

  <!-- Sidebar -->
  <div class="space-y-4">

    <!-- Actions -->
    <div class="rounded-2xl border border-border bg-white p-5 dark:bg-slate-900">
      <h3 class="mb-4 font-semibold">Actions</h3>

      <div class="mb-4 flex items-center justify-between">
        <span class="text-sm font-medium">Actif</span>
        <input type="hidden" name="isActive" value={isActive ? 'true' : 'false'} />
        <button
          type="button"
          onclick={() => (isActive = !isActive)}
          class="relative h-6 w-11 rounded-full transition-colors {isActive ? 'bg-primary' : 'bg-muted border border-input'}"
          aria-label="Toggle activation"
        >
          <span class="absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform {isActive ? 'translate-x-5' : 'translate-x-0.5'}"></span>
        </button>
      </div>

      <button
        type="submit"
        disabled={loading || imageUploading}
        class="w-full rounded-xl bg-primary py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-60"
      >
        {loading ? 'Sauvegarde...' : product ? 'Mettre à jour' : 'Créer le produit'}
      </button>
    </div>

    <!-- Prix et stock -->
    <div class="rounded-2xl border border-border bg-white p-5 dark:bg-slate-900">
      <h3 class="mb-4 font-semibold">Prix & Stock</h3>

      <div class="mb-3">
        <label class="mb-1.5 block text-sm font-medium" for="price">Prix (€) *</label>
        <input
          id="price" name="price" type="number" step="0.01" min="0" required
          value={product?.price ?? (values?.price as number) ?? ''}
          placeholder="12.90"
          class="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
          class:border-destructive={errors?.price}
        />
        {#if errors?.price}<p class="mt-1 text-xs text-destructive">{errors.price[0]}</p>{/if}
      </div>

      <div>
        <label class="mb-1.5 block text-sm font-medium" for="stock">Stock *</label>
        <input
          id="stock" name="stock" type="number" min="0" required
          value={product?.stock ?? (values?.stock as number) ?? 0}
          placeholder="0"
          class="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
          class:border-destructive={errors?.stock}
        />
        {#if errors?.stock}<p class="mt-1 text-xs text-destructive">{errors.stock[0]}</p>{/if}
      </div>
    </div>

    <!-- Catégorie -->
    <div class="rounded-2xl border border-border bg-white p-5 dark:bg-slate-900">
      <h3 class="mb-4 font-semibold">Catégorie</h3>
      <select
        name="categoryId"
        bind:value={selectedCategory}
        class="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
      >
        <option value="">Aucune catégorie</option>
        {#each categories as cat}
          <option value={cat.id}>{cat.name}</option>
        {/each}
      </select>
    </div>

    <!-- Image -->
    <div class="rounded-2xl border border-border bg-white p-5 dark:bg-slate-900">
      <h3 class="mb-4 font-semibold">Image produit</h3>

      {#if imageUrl}
        <div class="relative mb-3">
          <img src={imageUrl} alt="Produit" class="h-32 w-full rounded-xl object-cover" />
          <button
            type="button"
            onclick={() => (imageUrl = '')}
            class="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-destructive text-xs text-white hover:bg-destructive/90"
          >
            ✕
          </button>
        </div>
      {/if}

      <label
        class="mb-2 block cursor-pointer rounded-xl border-2 border-dashed border-border p-4 text-center text-sm text-muted-foreground transition hover:border-primary {imageUploading ? 'opacity-60' : ''}"
      >
        <div class="mb-1 text-2xl">{imageUploading ? '⏳' : '📎'}</div>
        {imageUploading ? 'Upload...' : 'Choisir une image'}
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp,image/avif"
          class="hidden"
          disabled={imageUploading}
          onchange={handleImageUpload}
        />
      </label>

      <input type="hidden" name="image" bind:value={imageUrl} />

      {#if !imageUrl}
        <input
          type="url"
          placeholder="Ou coller une URL"
          bind:value={imageUrl}
          class="mt-2 w-full rounded-xl border border-input bg-background px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-ring"
        />
      {/if}
    </div>

  </div>
</div>

<style>
  :global(.tiptap p.is-editor-empty:first-child::before) {
    content: attr(data-placeholder);
    color: hsl(var(--muted-foreground));
    pointer-events: none;
    float: left;
    height: 0;
  }
</style>
