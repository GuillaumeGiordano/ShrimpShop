<script lang="ts">
  import { page } from '$app/stores';
  import type { Session } from '@supabase/supabase-js';
  import type { Role } from '@prisma/client';

  let {
    session,
    userRole
  }: {
    session: Session | null;
    userRole: Role | null;
  } = $props();

  let menuOpen = $state(false);

  const navLinks = [
    { href: '/', label: 'Accueil' },
    { href: '/#pricing', label: 'Formules' },
    { href: '/#contact', label: 'Contact' }
  ];

  const privateLinks = [
    { href: '/articles', label: 'Articles' },
    { href: '/faq', label: 'FAQ' }
  ];

  function isActive(href: string) {
    return $page.url.pathname === href;
  }
</script>

<header
  class="sticky top-0 z-50 border-b border-white/10 bg-white/80 backdrop-blur-xl dark:bg-slate-900/80"
>
  <div class="container mx-auto flex h-16 items-center justify-between px-4">
    <!-- Logo -->
    <a href="/" class="flex items-center gap-2 font-display text-xl font-bold text-primary">
      <span class="text-2xl">🦐</span>
      <span class="hidden sm:block">ShrimpShop</span>
    </a>

    <!-- Nav desktop -->
    <nav class="hidden items-center gap-1 md:flex">
      {#each navLinks as link}
        <a
          href={link.href}
          class="rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-aqua-50 hover:text-aqua-700 dark:hover:bg-aqua-900/30 dark:hover:text-aqua-300"
          class:text-aqua-600={isActive(link.href)}
        >
          {link.label}
        </a>
      {/each}
      {#if session}
        {#each privateLinks as link}
          <a
            href={link.href}
            class="rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-aqua-50 hover:text-aqua-700 dark:hover:bg-aqua-900/30 dark:hover:text-aqua-300"
            class:text-aqua-600={isActive(link.href)}
          >
            {link.label}
          </a>
        {/each}
        {#if userRole === 'ADMIN'}
          <a
            href="/admin"
            class="rounded-lg bg-amber-100 px-3 py-2 text-sm font-medium text-amber-800 transition-colors hover:bg-amber-200 dark:bg-amber-900/30 dark:text-amber-300"
          >
            Admin
          </a>
        {/if}
      {/if}
    </nav>

    <!-- Auth buttons -->
    <div class="flex items-center gap-2">
      {#if session}
        <form method="POST" action="/auth/logout">
          <button
            class="rounded-lg border border-border px-4 py-2 text-sm font-medium transition-colors hover:bg-muted"
          >
            Déconnexion
          </button>
        </form>
      {:else}
        <a
          href="/login"
          class="rounded-lg border border-border px-4 py-2 text-sm font-medium transition-colors hover:bg-muted"
        >
          Connexion
        </a>
        <a
          href="/register"
          class="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
        >
          S'inscrire
        </a>
      {/if}

      <!-- Burger -->
      <button
        onclick={() => (menuOpen = !menuOpen)}
        class="rounded-lg p-2 hover:bg-muted md:hidden"
        aria-label="Menu"
      >
        <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          {#if menuOpen}
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M6 18L18 6M6 6l12 12"
            />
          {:else}
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M4 6h16M4 12h16M4 18h16"
            />
          {/if}
        </svg>
      </button>
    </div>
  </div>

  <!-- Mobile menu -->
  {#if menuOpen}
    <div class="border-t border-border bg-background px-4 py-3 md:hidden">
      <nav class="flex flex-col gap-1">
        {#each navLinks as link}
          <a
            href={link.href}
            class="rounded-lg px-3 py-2 text-sm font-medium hover:bg-muted"
            onclick={() => (menuOpen = false)}
          >
            {link.label}
          </a>
        {/each}
        {#if session}
          {#each privateLinks as link}
            <a
              href={link.href}
              class="rounded-lg px-3 py-2 text-sm font-medium hover:bg-muted"
              onclick={() => (menuOpen = false)}
            >
              {link.label}
            </a>
          {/each}
        {/if}
      </nav>
    </div>
  {/if}
</header>
