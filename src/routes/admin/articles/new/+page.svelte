<script lang="ts">
  import { enhance } from '$app/forms';
  import ArticleForm from '$lib/components/admin/ArticleForm.svelte';
  import type { PageData, ActionData } from './$types';

  let { data, form }: { data: PageData; form: ActionData } = $props();
  let loading = $state(false);
</script>

<svelte:head>
  <title>Nouvel article | Admin</title>
</svelte:head>

<div class="mb-6 flex items-center gap-3">
  <a href="/admin/articles" class="text-muted-foreground hover:text-foreground">← Articles</a>
  <span class="text-muted-foreground">/</span>
  <h1 class="font-display text-2xl font-bold">Nouvel article</h1>
</div>

<form
  method="POST"
  use:enhance={() => {
    loading = true;
    return async ({ update }) => {
      loading = false;
      await update();
    };
  }}
>
  <ArticleForm errors={form?.errors} values={form?.values} {loading} categories={data.categories} />
</form>
