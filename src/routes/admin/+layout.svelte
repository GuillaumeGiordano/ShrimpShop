<script lang="ts">
  import { page } from '$app/stores';
  import type { Snippet } from 'svelte';
  import type { LayoutData } from './$types';

  let { data, children }: { data: LayoutData; children: Snippet } = $props();

  const navItems = [
    { href: '/admin', label: 'Dashboard', icon: '📊' },
    { href: '/admin/articles', label: 'Articles', icon: '📰' },
    { href: '/admin/gallery', label: 'Galerie', icon: '🖼' },
    { href: '/admin/faq', label: 'FAQ', icon: '❓' },
    { href: '/admin/users', label: 'Utilisateurs', icon: '👤' },
    { href: '/admin/shop/products', label: 'Produits', icon: '🛒' },
    { href: '/admin/shop/categories', label: 'Catégories shop', icon: '🏷️' },
    { href: '/admin/shop/orders', label: 'Commandes', icon: '📋' }
  ];

  let sidebarOpen = $state(false);

  function isActive(href: string) {
    if (href === '/admin') return $page.url.pathname === '/admin';
    return $page.url.pathname.startsWith(href);
  }
</script>

<div class="flex min-h-screen bg-slate-50 dark:bg-slate-950">
  <!-- Sidebar -->
  <aside
    class="fixed inset-y-0 left-0 z-40 w-64 transform border-r border-border bg-white shadow-xl transition-transform duration-300 dark:bg-slate-900
      {sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}"
  >
    <div class="flex h-16 items-center gap-2 border-b border-border px-6">
      <span class="text-2xl">🦐</span>
      <div>
        <p class="font-display font-bold text-primary">ShrimpShop</p>
        <p class="text-xs text-muted-foreground">Administration</p>
      </div>
    </div>

    <nav class="p-4">
      {#each navItems as item}
        <a
          href={item.href}
          class="mb-1 flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium transition-all
            {isActive(item.href)
            ? 'bg-primary text-primary-foreground shadow-sm'
            : 'text-muted-foreground hover:bg-muted hover:text-foreground'}"
        >
          <span>{item.icon}</span>
          {item.label}
        </a>
      {/each}
    </nav>

    <div class="absolute bottom-0 w-full border-t border-border p-4">
      <div class="mb-3 flex items-center gap-2 rounded-xl bg-muted p-3">
        <div class="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
          A
        </div>
        <div class="min-w-0">
          <p class="truncate text-xs font-medium">{data.adminUser.email}</p>
          <p class="text-xs text-muted-foreground">ADMIN</p>
        </div>
      </div>
      <a href="/" class="block text-center text-xs text-muted-foreground hover:text-foreground">
        ← Retour au site
      </a>
    </div>
  </aside>

  <!-- Mobile overlay -->
  {#if sidebarOpen}
    <div
      class="fixed inset-0 z-30 bg-black/50 lg:hidden"
      onclick={() => (sidebarOpen = false)}
    ></div>
  {/if}

  <!-- Main -->
  <div class="flex-1 lg:ml-64">
    <!-- Top bar mobile -->
    <div class="sticky top-0 z-20 flex h-16 items-center border-b border-border bg-white px-4 dark:bg-slate-900 lg:hidden">
      <button
        onclick={() => (sidebarOpen = !sidebarOpen)}
        class="rounded-lg p-2 hover:bg-muted"
        aria-label="Menu"
      >
        <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>
      <span class="ml-3 font-semibold">Administration</span>
    </div>

    <!-- Page content -->
    <div class="p-6">
      {@render children()}
    </div>
  </div>
</div>
