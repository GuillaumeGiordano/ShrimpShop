<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import type { ArticleDTO, ProductCategoryDTO } from '$types';

  let {
    article,
    errors,
    values,
    loading = false,
    categories = []
  }: {
    article?: ArticleDTO;
    errors?: Record<string, string[]>;
    values?: Record<string, unknown>;
    loading?: boolean;
    categories?: ProductCategoryDTO[];
  } = $props();

  // ── Editor ────────────────────────────────────────────────
  let editorEl: HTMLDivElement;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let editor: any = null;
  let contentHtml = $state(article?.content ?? (values?.content as string) ?? '');

  // État actif des boutons (mis à jour à chaque sélection)
  let activeStates = $state<Record<string, boolean>>({});

  function updateActiveStates() {
    if (!editor) return;
    activeStates = {
      bold: editor.isActive('bold'),
      italic: editor.isActive('italic'),
      underline: editor.isActive('underline'),
      strike: editor.isActive('strike'),
      code: editor.isActive('code'),
      h1: editor.isActive('heading', { level: 1 }),
      h2: editor.isActive('heading', { level: 2 }),
      h3: editor.isActive('heading', { level: 3 }),
      bulletList: editor.isActive('bulletList'),
      orderedList: editor.isActive('orderedList'),
      blockquote: editor.isActive('blockquote'),
      codeBlock: editor.isActive('codeBlock'),
      alignLeft: editor.isActive({ textAlign: 'left' }),
      alignCenter: editor.isActive({ textAlign: 'center' }),
      alignRight: editor.isActive({ textAlign: 'right' })
    };
  }

  onMount(async () => {
    const { Editor } = await import('@tiptap/core');
    const { default: StarterKit } = await import('@tiptap/starter-kit');
    const { default: Image } = await import('@tiptap/extension-image');
    const { default: Link } = await import('@tiptap/extension-link');
    const { default: Placeholder } = await import('@tiptap/extension-placeholder');
    const { default: Underline } = await import('@tiptap/extension-underline');
    const { default: TextAlign } = await import('@tiptap/extension-text-align');
    const { default: TextStyle } = await import('@tiptap/extension-text-style');
    const { default: Youtube } = await import('@tiptap/extension-youtube');

    editor = new Editor({
      element: editorEl,
      extensions: [
        StarterKit,
        Underline,
        TextStyle,
        TextAlign.configure({ types: ['heading', 'paragraph'] }),
        Image.configure({ inline: false, allowBase64: false }),
        Link.configure({ openOnClick: false, HTMLAttributes: { rel: 'noopener noreferrer', target: '_blank' } }),
        Placeholder.configure({ placeholder: 'Rédigez votre article ici...' }),
        Youtube.configure({ width: 640, height: 360, nocookie: true })
      ],
      content: contentHtml,
      onUpdate: ({ editor: e }) => {
        contentHtml = e.getHTML();
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

  // ── Helpers toolbar ───────────────────────────────────────
  function cmd(fn: (e: typeof editor) => void) {
    if (!editor) return;
    fn(editor);
  }

  // ── Modals ────────────────────────────────────────────────
  let showLinkModal = $state(false);
  let linkUrl = $state('');
  let linkText = $state('');

  function openLinkModal() {
    const selection = editor?.state?.selection;
    const hasSelection = selection && !selection.empty;
    linkText = hasSelection ? editor.state.doc.textBetween(selection.from, selection.to) : '';
    linkUrl = editor?.getAttributes('link')?.href ?? '';
    showLinkModal = true;
  }

  function insertLink() {
    if (!linkUrl) return;
    cmd((e) =>
      e.chain().focus().extendMarkRange('link').setLink({ href: linkUrl }).run()
    );
    showLinkModal = false;
    linkUrl = '';
    linkText = '';
  }

  function removeLink() {
    cmd((e) => e.chain().focus().unsetLink().run());
    showLinkModal = false;
  }

  let showYoutubeModal = $state(false);
  let youtubeUrl = $state('');

  function insertYoutube() {
    if (!youtubeUrl) return;
    cmd((e) => e.commands.setYoutubeVideo({ src: youtubeUrl }));
    showYoutubeModal = false;
    youtubeUrl = '';
  }

  // ── Upload image dans éditeur ──────────────────────────────
  let uploadLoading = $state(false);

  async function handleEditorImageUpload(e: Event) {
    const input = e.target as HTMLInputElement;
    if (!input.files?.[0]) return;
    uploadLoading = true;
    const fd = new FormData();
    fd.append('file', input.files[0]);
    fd.append('bucket', 'articles');
    try {
      const res = await fetch('/api/upload', { method: 'POST', body: fd });
      const result = await res.json();
      if (result.url) {
        cmd((e) => e.chain().focus().setImage({ src: result.url }).run());
      }
    } finally {
      uploadLoading = false;
      input.value = '';
    }
  }

  // ── Image de couverture ───────────────────────────────────
  let coverImageUrl = $state(article?.imageUrl ?? '');
  let coverUploading = $state(false);

  async function handleCoverUpload(e: Event) {
    const input = e.target as HTMLInputElement;
    if (!input.files?.[0]) return;
    coverUploading = true;
    const fd = new FormData();
    fd.append('file', input.files[0]);
    fd.append('bucket', 'articles');
    try {
      const res = await fetch('/api/upload', { method: 'POST', body: fd });
      const result = await res.json();
      if (result.url) coverImageUrl = result.url;
    } finally {
      coverUploading = false;
    }
  }

  // ── Publication toggle ────────────────────────────────────
  let published = $state(article?.published ?? false);

  // ── Toolbar button helper ─────────────────────────────────
  function tbClass(active: boolean) {
    return `flex h-8 w-8 items-center justify-center rounded-lg text-sm transition-all
      ${active
        ? 'bg-primary text-primary-foreground shadow-sm'
        : 'hover:bg-muted text-foreground'}`;
  }
</script>

<!-- ── MODALS ─────────────────────────────────────────────── -->

<!-- Modal Lien -->
{#if showLinkModal}
  <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
    <div class="w-full max-w-sm rounded-2xl border border-border bg-white p-6 shadow-xl dark:bg-slate-900">
      <h3 class="mb-4 font-semibold">Insérer un lien</h3>
      <div class="space-y-3">
        <div>
          <label class="mb-1 block text-xs font-medium text-muted-foreground">URL *</label>
          <input
            type="url"
            bind:value={linkUrl}
            placeholder="https://exemple.com"
            class="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
            onkeydown={(e) => e.key === 'Enter' && insertLink()}
            autofocus
          />
        </div>
      </div>
      <div class="mt-4 flex gap-2">
        <button
          onclick={insertLink}
          disabled={!linkUrl}
          class="flex-1 rounded-xl bg-primary py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
        >
          Insérer
        </button>
        {#if editor?.isActive('link')}
          <button
            onclick={removeLink}
            class="rounded-xl border border-destructive/50 px-4 py-2 text-sm font-medium text-destructive hover:bg-destructive/10"
          >
            Supprimer
          </button>
        {/if}
        <button
          onclick={() => (showLinkModal = false)}
          class="rounded-xl border border-border px-4 py-2 text-sm font-medium hover:bg-muted"
        >
          Annuler
        </button>
      </div>
    </div>
  </div>
{/if}

<!-- Modal YouTube -->
{#if showYoutubeModal}
  <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
    <div class="w-full max-w-sm rounded-2xl border border-border bg-white p-6 shadow-xl dark:bg-slate-900">
      <div class="mb-4 flex items-center gap-2">
        <span class="text-2xl">▶️</span>
        <h3 class="font-semibold">Intégrer une vidéo YouTube</h3>
      </div>
      <div class="mb-1 text-xs text-muted-foreground">
        Colle l'URL de la vidéo ou l'URL d'intégration
      </div>
      <input
        type="url"
        bind:value={youtubeUrl}
        placeholder="https://www.youtube.com/watch?v=..."
        class="mt-2 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
        onkeydown={(e) => e.key === 'Enter' && insertYoutube()}
        autofocus
      />
      <div class="mt-1 text-xs text-muted-foreground">
        Formats acceptés : youtube.com/watch?v=… · youtu.be/… · youtube.com/embed/…
      </div>
      <div class="mt-4 flex gap-2">
        <button
          onclick={insertYoutube}
          disabled={!youtubeUrl}
          class="flex-1 rounded-xl bg-primary py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
        >
          Insérer la vidéo
        </button>
        <button
          onclick={() => { showYoutubeModal = false; youtubeUrl = ''; }}
          class="rounded-xl border border-border px-4 py-2 text-sm font-medium hover:bg-muted"
        >
          Annuler
        </button>
      </div>
    </div>
  </div>
{/if}

<!-- ── LAYOUT ──────────────────────────────────────────────── -->
<div class="grid gap-6 lg:grid-cols-3">

  <!-- Colonne principale -->
  <div class="space-y-5 lg:col-span-2">

    <!-- Titre -->
    <div>
      <label class="mb-1.5 block text-sm font-medium" for="title">Titre *</label>
      <input
        id="title" name="title" type="text" required
        value={article?.title ?? (values?.title as string) ?? ''}
        placeholder="Titre de l'article"
        class="w-full rounded-xl border border-input bg-background px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ring"
        class:border-destructive={errors?.title}
      />
      {#if errors?.title}<p class="mt-1 text-xs text-destructive">{errors.title[0]}</p>{/if}
    </div>

    <!-- Résumé -->
    <div>
      <label class="mb-1.5 block text-sm font-medium" for="excerpt">Résumé *</label>
      <textarea
        id="excerpt" name="excerpt" rows="3" required
        placeholder="Bref résumé affiché dans les cartes"
        class="w-full resize-none rounded-xl border border-input bg-background px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ring"
        class:border-destructive={errors?.excerpt}
      >{article?.excerpt ?? (values?.excerpt as string) ?? ''}</textarea>
      {#if errors?.excerpt}<p class="mt-1 text-xs text-destructive">{errors.excerpt[0]}</p>{/if}
    </div>

    <!-- ── Éditeur TipTap ─────────────────────────────── -->
    <div>
      <label class="mb-1.5 block text-sm font-medium">Contenu *</label>

      <!-- TOOLBAR -->
      <div class="rounded-t-xl border border-b-0 border-input bg-muted/40 px-2 py-1.5">

        <!-- Ligne 1 : Historique + Titres + Alignement -->
        <div class="flex flex-wrap items-center gap-0.5">

          <!-- Historique -->
          <button type="button" title="Annuler (Ctrl+Z)" onclick={() => cmd((e) => e.chain().focus().undo().run())} class={tbClass(false)}>
            <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6"/></svg>
          </button>
          <button type="button" title="Rétablir (Ctrl+Y)" onclick={() => cmd((e) => e.chain().focus().redo().run())} class={tbClass(false)}>
            <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 10H11a8 8 0 00-8 8v2m18-10l-6 6m6-6l-6-6"/></svg>
          </button>

          <div class="mx-1 h-5 w-px bg-border"></div>

          <!-- Titres -->
          <button type="button" title="Titre 1" onclick={() => cmd((e) => e.chain().focus().toggleHeading({ level: 1 }).run())} class={tbClass(activeStates.h1)}>
            <span class="text-xs font-bold">H1</span>
          </button>
          <button type="button" title="Titre 2" onclick={() => cmd((e) => e.chain().focus().toggleHeading({ level: 2 }).run())} class={tbClass(activeStates.h2)}>
            <span class="text-xs font-bold">H2</span>
          </button>
          <button type="button" title="Titre 3" onclick={() => cmd((e) => e.chain().focus().toggleHeading({ level: 3 }).run())} class={tbClass(activeStates.h3)}>
            <span class="text-xs font-bold">H3</span>
          </button>

          <div class="mx-1 h-5 w-px bg-border"></div>

          <!-- Alignement -->
          <button type="button" title="Aligner à gauche" onclick={() => cmd((e) => e.chain().focus().setTextAlign('left').run())} class={tbClass(activeStates.alignLeft)}>
            <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 6h18M3 12h12M3 18h15"/></svg>
          </button>
          <button type="button" title="Centrer" onclick={() => cmd((e) => e.chain().focus().setTextAlign('center').run())} class={tbClass(activeStates.alignCenter)}>
            <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 6h18M6 12h12M4 18h16"/></svg>
          </button>
          <button type="button" title="Aligner à droite" onclick={() => cmd((e) => e.chain().focus().setTextAlign('right').run())} class={tbClass(activeStates.alignRight)}>
            <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 6h18M9 12h12M6 18h15"/></svg>
          </button>

          <div class="mx-1 h-5 w-px bg-border"></div>

          <!-- Formatage texte -->
          <button type="button" title="Gras (Ctrl+B)" onclick={() => cmd((e) => e.chain().focus().toggleBold().run())} class={tbClass(activeStates.bold)}>
            <span class="text-sm font-black">B</span>
          </button>
          <button type="button" title="Italique (Ctrl+I)" onclick={() => cmd((e) => e.chain().focus().toggleItalic().run())} class={tbClass(activeStates.italic)}>
            <span class="text-sm italic font-semibold">I</span>
          </button>
          <button type="button" title="Souligné (Ctrl+U)" onclick={() => cmd((e) => e.chain().focus().toggleUnderline().run())} class={tbClass(activeStates.underline)}>
            <span class="text-sm font-semibold underline">U</span>
          </button>
          <button type="button" title="Barré" onclick={() => cmd((e) => e.chain().focus().toggleStrike().run())} class={tbClass(activeStates.strike)}>
            <span class="text-sm font-semibold line-through">S</span>
          </button>
          <button type="button" title="Code inline" onclick={() => cmd((e) => e.chain().focus().toggleCode().run())} class={tbClass(activeStates.code)}>
            <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"/></svg>
          </button>

          <div class="mx-1 h-5 w-px bg-border"></div>

          <!-- Listes -->
          <button type="button" title="Liste à puces" onclick={() => cmd((e) => e.chain().focus().toggleBulletList().run())} class={tbClass(activeStates.bulletList)}>
            <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"/><circle cx="2" cy="6" r="1" fill="currentColor"/><circle cx="2" cy="12" r="1" fill="currentColor"/><circle cx="2" cy="18" r="1" fill="currentColor"/></svg>
          </button>
          <button type="button" title="Liste numérotée" onclick={() => cmd((e) => e.chain().focus().toggleOrderedList().run())} class={tbClass(activeStates.orderedList)}>
            <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6h11M10 12h11M10 18h11M4 6h.01M4 12h.01M4 18h.01"/></svg>
          </button>
          <button type="button" title="Citation" onclick={() => cmd((e) => e.chain().focus().toggleBlockquote().run())} class={tbClass(activeStates.blockquote)}>
            <svg class="h-4 w-4" fill="currentColor" viewBox="0 0 24 24"><path d="M4.583 17.321C3.553 16.227 3 15 3 13.011c0-3.5 2.457-6.637 6.03-8.188l.893 1.378c-3.335 1.804-3.987 4.145-4.247 5.621.537-.278 1.24-.375 1.929-.311 1.804.167 3.226 1.648 3.226 3.489a3.5 3.5 0 01-3.5 3.5c-1.073 0-2.099-.49-2.748-1.179zm10 0C13.553 16.227 13 15 13 13.011c0-3.5 2.457-6.637 6.03-8.188l.893 1.378c-3.335 1.804-3.987 4.145-4.247 5.621.537-.278 1.24-.375 1.929-.311 1.804.167 3.226 1.648 3.226 3.489a3.5 3.5 0 01-3.5 3.5c-1.073 0-2.099-.49-2.748-1.179z"/></svg>
          </button>
          <button type="button" title="Bloc de code" onclick={() => cmd((e) => e.chain().focus().toggleCodeBlock().run())} class={tbClass(activeStates.codeBlock)}>
            <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2" stroke-width="2"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 9l-3 3 3 3m6-6l3 3-3 3"/></svg>
          </button>
          <button type="button" title="Séparateur horizontal" onclick={() => cmd((e) => e.chain().focus().setHorizontalRule().run())} class={tbClass(false)}>
            <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 12h14"/></svg>
          </button>

          <div class="mx-1 h-5 w-px bg-border"></div>

          <!-- Lien -->
          <button type="button" title="Lien" onclick={openLinkModal} class={tbClass(editor?.isActive('link') ?? false)}>
            <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"/></svg>
          </button>

          <!-- Image dans éditeur -->
          <label class={tbClass(false) + ' cursor-pointer'} title={uploadLoading ? 'Upload...' : 'Insérer une image'}>
            {#if uploadLoading}
              <svg class="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
            {:else}
              <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2" stroke-width="2"/><circle cx="8.5" cy="8.5" r="1.5" fill="currentColor"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 15l-5-5L5 21"/></svg>
            {/if}
            <input type="file" accept="image/jpeg,image/png,image/webp,image/avif" class="hidden" onchange={handleEditorImageUpload} disabled={uploadLoading} />
          </label>

          <!-- YouTube -->
          <button
            type="button"
            title="Insérer une vidéo YouTube"
            onclick={() => (showYoutubeModal = true)}
            class={tbClass(false) + ' gap-0.5'}
          >
            <svg class="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
              <path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
            </svg>
          </button>

        </div>
      </div>

      <!-- Zone d'édition -->
      <div
        bind:this={editorEl}
        class="tiptap-content min-h-[400px] rounded-b-xl border border-input bg-background p-4 outline-none focus-within:ring-2 focus-within:ring-ring"
        class:border-destructive={errors?.content}
      ></div>

      <input type="hidden" name="content" bind:value={contentHtml} />
      {#if errors?.content}<p class="mt-1 text-xs text-destructive">{errors.content[0]}</p>{/if}
    </div>
  </div>

  <!-- ── Sidebar ────────────────────────────────────────── -->
  <div class="space-y-4">

    <!-- Publication -->
    <div class="rounded-2xl border border-border bg-white p-5 dark:bg-slate-900">
      <h3 class="mb-4 font-semibold">Publication</h3>

      <div class="mb-4 flex items-center justify-between">
        <span class="text-sm font-medium">Publié</span>
        <input type="hidden" name="published" value={published ? 'true' : 'false'} />
        <button
          type="button"
          onclick={() => (published = !published)}
          class="relative h-6 w-11 rounded-full transition-colors {published ? 'bg-primary' : 'bg-muted border border-input'}"
          aria-label="Toggle publication"
        >
          <span class="absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform {published ? 'translate-x-5' : 'translate-x-0.5'}"></span>
        </button>
      </div>

      <div class="mb-4">
        <label class="mb-1.5 block text-sm font-medium" for="status">Statut</label>
        <select id="status" name="status" value={article?.status ?? 'DRAFT'}
          class="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring">
          <option value="DRAFT">Brouillon</option>
          <option value="PUBLISHED">Publié</option>
        </select>
      </div>

      <div class="flex gap-2">
        <button
          type="submit"
          disabled={loading || uploadLoading || coverUploading}
          class="flex-1 rounded-xl bg-primary py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-60"
        >
          {loading ? 'Sauvegarde...' : article ? 'Mettre à jour' : 'Créer'}
        </button>
        {#if article}
          <a href="/articles/{article.id}" target="_blank"
            class="rounded-xl border border-border px-3 py-2.5 text-sm font-medium hover:bg-muted" title="Prévisualiser">
            👁
          </a>
        {/if}
      </div>
    </div>

    <!-- Catégorie -->
    <div class="rounded-2xl border border-border bg-white p-5 dark:bg-slate-900">
      <h3 class="mb-4 font-semibold">Catégorie</h3>
      <select name="categoryId" value={article?.categoryId ?? ''}
        class="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
        class:border-destructive={errors?.categoryId}>
        <option value="">Aucune catégorie</option>
        {#each categories as cat}
          <option value={cat.id}>{cat.name}</option>
        {/each}
      </select>
      {#if errors?.categoryId}<p class="mt-1 text-xs text-destructive">{errors.categoryId[0]}</p>{/if}
    </div>

    <!-- Image de couverture -->
    <div class="rounded-2xl border border-border bg-white p-5 dark:bg-slate-900">
      <h3 class="mb-4 font-semibold">Image de couverture</h3>

      {#if coverImageUrl}
        <div class="relative mb-3">
          <img src={coverImageUrl} alt="Couverture" class="h-32 w-full rounded-xl object-cover" />
          <button type="button" onclick={() => (coverImageUrl = '')}
            class="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-destructive text-xs text-white hover:bg-destructive/90">
            ✕
          </button>
        </div>
      {/if}

      <label class="mb-2 block cursor-pointer rounded-xl border-2 border-dashed border-border p-4 text-center text-sm text-muted-foreground transition hover:border-primary {coverUploading ? 'opacity-60' : ''}">
        <div class="text-2xl mb-1">{coverUploading ? '⏳' : '📎'}</div>
        {coverUploading ? 'Upload...' : 'Choisir une image'}
        <input type="file" accept="image/jpeg,image/png,image/webp,image/avif" class="hidden"
          disabled={coverUploading} onchange={handleCoverUpload} />
      </label>

      <input type="hidden" name="imageUrl" bind:value={coverImageUrl} />

      {#if !coverImageUrl}
        <input type="url" placeholder="Ou coller une URL" bind:value={coverImageUrl}
          class="mt-2 w-full rounded-xl border border-input bg-background px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-ring" />
      {/if}
    </div>

  </div>
</div>

<style>
  /* Placeholder TipTap */
  :global(.tiptap p.is-editor-empty:first-child::before) {
    content: attr(data-placeholder);
    color: hsl(var(--muted-foreground));
    pointer-events: none;
    float: left;
    height: 0;
  }
  /* YouTube embed responsive */
  :global(.tiptap-content .youtube-wrapper) {
    position: relative;
    padding-bottom: 56.25%;
    height: 0;
    overflow: hidden;
    border-radius: 0.75rem;
    margin: 1.5rem 0;
  }
  :global(.tiptap-content .youtube-wrapper iframe) {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
  }
  /* Nœud YouTube TipTap sélectionné */
  :global(.tiptap div[data-youtube-video]) {
    border-radius: 0.75rem;
    overflow: hidden;
    margin: 1.5rem 0;
  }
  :global(.tiptap div[data-youtube-video].ProseMirror-selectednode) {
    outline: 3px solid hsl(var(--ring));
  }
</style>
