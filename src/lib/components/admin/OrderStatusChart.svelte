<script lang="ts">
  import { onMount } from 'svelte';

  let { data }: { data: { PENDING: number; PAID: number; CANCELLED: number } } = $props();

  let canvas: HTMLCanvasElement;

  onMount(async () => {
    const { Chart, registerables } = await import('chart.js');
    Chart.register(...registerables);

    const chart = new Chart(canvas, {
      type: 'doughnut',
      data: {
        labels: ['En attente', 'Payées', 'Annulées'],
        datasets: [
          {
            data: [data.PENDING, data.PAID, data.CANCELLED],
            backgroundColor: ['#f59e0b', '#22c55e', '#ef4444'],
            borderWidth: 0,
            hoverOffset: 6
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom',
            labels: { padding: 16, usePointStyle: true }
          },
          tooltip: {
            callbacks: {
              label: (ctx) => ` ${ctx.label} : ${ctx.parsed}`
            }
          }
        },
        cutout: '68%'
      }
    });

    return () => chart.destroy();
  });
</script>

<div class="relative h-48">
  <canvas bind:this={canvas}></canvas>
</div>
