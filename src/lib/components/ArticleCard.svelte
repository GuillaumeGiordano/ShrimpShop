<script lang="ts">
  import { formatDate } from '$lib/utils/format';
  import type { ArticleCardDTO } from '$types';

  let { article }: { article: ArticleCardDTO } = $props();

  const badgeClass = 'bg-aqua-100 text-aqua-700 dark:bg-aqua-900/30 dark:text-aqua-300';
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
    {#if article.category}
      <span
        class="absolute left-3 top-3 rounded-full px-3 py-1 text-xs font-semibold {badgeClass}"
      >
        {article.category.name}
      </span>
    {/if}
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
