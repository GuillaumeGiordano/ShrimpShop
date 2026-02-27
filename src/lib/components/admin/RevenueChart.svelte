<script lang="ts">
  import { onMount } from 'svelte';

  let { data }: { data: { label: string; revenue: number }[] } = $props();

  let canvas: HTMLCanvasElement;

  onMount(async () => {
    const { Chart, registerables } = await import('chart.js');
    Chart.register(...registerables);

    const chart = new Chart(canvas, {
      type: 'bar',
      data: {
        labels: data.map((d) => d.label),
        datasets: [
          {
            label: 'Revenus (€)',
            data: data.map((d) => d.revenue),
            backgroundColor: 'rgba(14, 165, 233, 0.75)',
            borderColor: 'rgb(14, 165, 233)',
            borderWidth: 1,
            borderRadius: 6
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: (ctx) =>
                ` ${new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(ctx.parsed.y)}`
            }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            grid: { color: 'rgba(0,0,0,0.05)' },
            ticks: {
              callback: (value) =>
                new Intl.NumberFormat('fr-FR', {
                  style: 'currency',
                  currency: 'EUR',
                  maximumFractionDigits: 0
                }).format(Number(value))
            }
          },
          x: {
            grid: { display: false }
          }
        }
      }
    });

    return () => chart.destroy();
  });
</script>

<div class="relative h-48">
  <canvas bind:this={canvas}></canvas>
</div>
