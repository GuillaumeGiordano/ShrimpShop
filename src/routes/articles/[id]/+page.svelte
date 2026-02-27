<script lang="ts">
  import ArticleCard from '$lib/components/ArticleCard.svelte';
  import { formatDate } from '$lib/utils/format';
  import type { PageData } from './$types';

  let { data }: { data: PageData } = $props();

  const { article, similar, meta } = data;
</script>

<svelte:head>
  <title>{meta.title} | ShrimpShop</title>
  <meta name="description" content={meta.description} />
  {#if meta.image}
    <meta property="og:image" content={meta.image} />
  {/if}
  <meta property="og:title" content={meta.title} />
  <meta property="og:type" content="article" />
  <meta name="robots" content="noindex" />
</svelte:head>

<article class="mx-auto max-w-3xl px-4 py-12">
  <!-- Back -->
  <a
    href="/articles"
    class="mb-8 inline-flex items-center gap-2 text-sm text-muted-foreground transition hover:text-foreground"
  >
    <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
    </svg>
    Retour aux articles
  </a>

  <!-- Header -->
  <header class="mb-8">
    <div class="mb-4 flex items-center gap-3">
      {#if article.category}
        <span
          class="rounded-full bg-aqua-100 px-3 py-1 text-xs font-semibold text-aqua-700 dark:bg-aqua-900/30 dark:text-aqua-300"
        >
          {article.category.name}
        </span>
      {/if}
      <time class="text-sm text-muted-foreground">
        {formatDate(article.publishedAt ?? article.createdAt)}
      </time>
    </div>
    <h1 class="font-display text-4xl font-bold leading-tight md:text-5xl">
      {article.title}
    </h1>
    <p class="mt-4 text-lg text-muted-foreground">{article.excerpt}</p>
  </header>

  <!-- Image hero -->
  {#if article.imageUrl}
    <div class="mb-10 overflow-hidden rounded-3xl">
      <img
        src={article.imageUrl}
        alt={article.title}
        class="h-64 w-full object-cover md:h-96"
        loading="eager"
      />
    </div>
  {/if}

  <!-- Content WYSIWYG -->
  <div class="tiptap-content prose prose-slate max-w-none dark:prose-invert">
    {@html article.content}
  </div>
</article>

<!-- Articles similaires -->
{#if similar.length > 0}
  <section class="border-t border-border bg-muted/30 py-16">
    <div class="container mx-auto max-w-6xl px-4">
      <h2 class="mb-8 font-display text-2xl font-bold">Articles similaires</h2>
      <div class="grid gap-6 md:grid-cols-3">
        {#each similar as art (art.id)}
          <ArticleCard article={art} />
        {/each}
      </div>
    </div>
  </section>
{/if}
