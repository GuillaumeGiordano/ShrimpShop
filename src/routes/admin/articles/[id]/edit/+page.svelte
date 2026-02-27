<script lang="ts">
  import { enhance } from '$app/forms';
  import { toast } from 'svelte-sonner';
  import ArticleForm from '$lib/components/admin/ArticleForm.svelte';
  import type { PageData, ActionData } from './$types';

  let { data, form }: { data: PageData; form: ActionData } = $props();
  let loading = $state(false);

  $effect(() => {
    if (data.created) toast.success('Article créé avec succès !');
    if (form?.success) toast.success('Article mis à jour !');
    if (form?.errors) toast.error('Erreur dans le formulaire');
  });
</script>

<svelte:head>
  <title>Éditer : {data.article.title} | Admin</title>
</svelte:head>

<div class="mb-6 flex items-center gap-3">
  <a href="/admin/articles" class="text-muted-foreground hover:text-foreground">← Articles</a>
  <span class="text-muted-foreground">/</span>
  <h1 class="font-display text-2xl font-bold">Éditer l'article</h1>
</div>

<form
  method="POST"
  use:enhance={() => {
    loading = true;
    return async ({ update }) => {
      loading = false;
      await update({ reset: false });
    };
  }}
>
  <ArticleForm article={data.article} errors={form?.errors} {loading} categories={data.categories} />
</form>
