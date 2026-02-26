<script lang="ts">
  import { formatDate, ARTICLE_CATEGORY_LABELS } from '$lib/utils/format';
  import type { ArticleCardDTO } from '$types';

  let { article }: { article: ArticleCardDTO } = $props();

  const categoryColors: Record<string, string> = {
    NEOCARIDINA: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
    CARIDINA: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
    BREEDING: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
    WATER_QUALITY: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-300',
    DISEASES: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300',
    EQUIPMENT: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
    FEEDING: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
    GENERAL: 'bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-300'
  };

  const categoryLabel = $derived(ARTICLE_CATEGORY_LABELS[article.category] ?? article.category);
  const badge = $derived(categoryColors[article.category] ?? categoryColors['GENERAL']);
</script>

<article
  class="group flex flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-aqua-500/10"
>
  <!-- Image -->
  <div class="relative aspect-video overflow-hidden bg-muted">
    {#if article.imageUrl}
      <img
        src={article.imageUrl}
        alt={article.title}
        loading="lazy"
        class="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
      />
    {:else}
      <div class="flex h-full items-center justify-center text-5xl text-muted-foreground/30">
        🦐
      </div>
    {/if}

    <!-- Badge catégorie -->
    <span
      class="absolute left-3 top-3 rounded-full px-3 py-1 text-xs font-semibold {badge}"
    >
      {categoryLabel}
    </span>
  </div>

  <!-- Content -->
  <div class="flex flex-1 flex-col p-5">
    <p class="mb-1 text-xs text-muted-foreground">{formatDate(article.publishedAt ?? article.createdAt)}</p>
    <h3 class="mb-2 font-display text-lg font-semibold leading-snug text-foreground line-clamp-2">
      {article.title}
    </h3>
    <p class="mb-4 flex-1 text-sm text-muted-foreground line-clamp-3">
      {article.excerpt}
    </p>
    <a
      href="/articles/{article.id}"
      class="mt-auto inline-flex items-center gap-1.5 text-sm font-semibold text-primary transition-colors hover:text-primary/80"
    >
      Voir l'article
      <svg
        class="h-4 w-4 transition-transform group-hover:translate-x-1"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M9 5l7 7-7 7"
        />
      </svg>
    </a>
  </div>
</article>
