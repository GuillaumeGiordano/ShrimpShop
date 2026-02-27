<script lang="ts">
  let {
    value = $bindable(1),
    min = 1,
    max = 99,
    disabled = false
  }: {
    value?: number;
    min?: number;
    max?: number;
    disabled?: boolean;
  } = $props();

  function decrement() {
    if (value > min) value--;
  }

  function increment() {
    if (value < max) value++;
  }
</script>

<div class="flex items-center gap-1">
  <button
    type="button"
    onclick={decrement}
    disabled={disabled || value <= min}
    class="flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-background text-sm font-bold hover:bg-muted disabled:opacity-40"
    aria-label="Diminuer"
  >
    −
  </button>
  <span class="min-w-[2rem] text-center text-sm font-semibold">{value}</span>
  <button
    type="button"
    onclick={increment}
    disabled={disabled || value >= max}
    class="flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-background text-sm font-bold hover:bg-muted disabled:opacity-40"
    aria-label="Augmenter"
  >
    +
  </button>
</div>
