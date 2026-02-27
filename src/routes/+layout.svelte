<script lang="ts">
  import '../app.css';
  import { Toaster } from 'svelte-sonner';
  import { ModeWatcher } from 'mode-watcher';
  import Navbar from '$lib/components/Navbar.svelte';
  import Footer from '$lib/components/Footer.svelte';
  import CartDrawer from '$lib/components/shop/CartDrawer.svelte';
  import type { Snippet } from 'svelte';
  import type { LayoutData } from './$types';

  let { data, children }: { data: LayoutData; children: Snippet } = $props();
</script>

<ModeWatcher defaultMode="light" />
<Toaster richColors position="top-right" />

<CartDrawer />

<div class="flex min-h-screen flex-col">
  <Navbar session={data.session} userRole={data.userRole} />
  <main class="flex-1">
    {@render children()}
  </main>
  <Footer />
</div>
