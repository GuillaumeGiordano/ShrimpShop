<script lang="ts">
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';
  import { FAQ_CATEGORY_LABELS } from '$lib/utils/format';
  import type { PageData } from './$types';
  import type { FaqDTO } from '$types';

  let { data }: { data: PageData } = $props();

  const categories = [
    { value: '', label: 'Toutes' },
    ...Object.entries(FAQ_CATEGORY_LABELS).map(([value, label]) => ({ value, label }))
  ];

  let openId = $state<string | null>(null);

  function toggle(id: string) {
    openId = openId === id ? null : id;
  }

  function setCategory(cat: string) {
    const params = new URLSearchParams($page.url.searchParams);
    if (cat) params.set('category', cat);
    else params.delete('category');
    goto(`?${params.toString()}`);
  }

  // Grouper les FAQs par catégorie
  const grouped = $derived(
    data.faqs.reduce(
      (acc, faq) => {
        const key = faq.category;
        if (!acc[key]) acc[key] = [];
        acc[key].push(faq);
        return acc;
      },
      {} as Record<string, FaqDTO[]>
    )
  );
</script>

<svelte:head>
  <title>FAQ | ShrimpShop</title>
  <meta name="robots" content="noindex" />
</svelte:head>

<div class="container mx-auto max-w-3xl px-4 py-12">
  <div class="mb-10 text-center">
    <h1 class="font-display text-4xl font-bold">Questions fréquentes</h1>
    <p class="mt-3 text-muted-foreground">
      Trouvez rapidement des réponses à vos questions sur nos crevettes et services
    </p>
  </div>

  <!-- Filtres catégories -->
  <div class="mb-8 flex flex-wrap justify-center gap-2">
    {#each categories as cat}
      <button
        onclick={() => setCategory(cat.value)}
        class="rounded-full px-4 py-1.5 text-sm font-medium transition-all
          {(data.filters.category ?? '') === cat.value
          ? 'bg-primary text-primary-foreground'
          : 'border border-border bg-background hover:bg-muted'}"
      >
        {cat.label}
      </button>
    {/each}
  </div>

  <!-- FAQs -->
  {#if data.faqs.length === 0}
    <div class="py-20 text-center">
      <div class="mb-4 text-6xl">❓</div>
      <h2 class="font-display text-xl font-semibold">Aucune question trouvée</h2>
    </div>
  {:else}
    <div class="space-y-3">
      {#each data.faqs as faq (faq.id)}
        <div
          class="overflow-hidden rounded-2xl border border-border bg-card transition-all"
        >
          <button
            onclick={() => toggle(faq.id)}
            class="flex w-full items-center justify-between px-6 py-4 text-left"
          >
            <div class="flex items-center gap-3">
              <span
                class="shrink-0 rounded-full bg-aqua-100 px-2.5 py-0.5 text-xs font-semibold text-aqua-700 dark:bg-aqua-900/30 dark:text-aqua-300"
              >
                {FAQ_CATEGORY_LABELS[faq.category] ?? faq.category}
              </span>
              <span class="font-medium">{faq.question}</span>
            </div>
            <svg
              class="h-5 w-5 shrink-0 text-muted-foreground transition-transform duration-200 {openId === faq.id ? 'rotate-180' : ''}"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </button>

          {#if openId === faq.id}
            <div class="border-t border-border bg-muted/30 px-6 py-4">
              <p class="leading-relaxed text-muted-foreground">{faq.answer}</p>
            </div>
          {/if}
        </div>
      {/each}
    </div>
  {/if}

  <!-- CTA contact -->
  <div class="mt-12 rounded-3xl bg-gradient-to-br from-aqua-50 to-cyan-50 p-8 text-center dark:from-aqua-900/20 dark:to-cyan-900/20">
    <h3 class="mb-2 font-display text-xl font-bold">Vous n'avez pas trouvé votre réponse ?</h3>
    <p class="mb-4 text-muted-foreground">Notre équipe répond en moins de 24h</p>
    <a
      href="/#contact"
      class="inline-flex items-center gap-2 rounded-2xl bg-primary px-6 py-3 font-semibold text-primary-foreground transition hover:bg-primary/90"
    >
      Nous contacter →
    </a>
  </div>
</div>
