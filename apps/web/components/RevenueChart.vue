<template>
  <div class="bg-white rounded-xl border border-gray-200 p-6">
    <h3 class="text-lg font-semibold text-gray-900 mb-4">Monthly Revenue</h3>
    <Bar v-if="chartData" :data="chartData" :options="chartOptions" />
    <p v-else class="text-gray-500 text-center py-8">No revenue data available</p>
  </div>
</template>

<script setup lang="ts">
import { Bar } from 'vue-chartjs';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const props = defineProps<{
  data: { month: string; amount: number }[];
}>();

const chartData = computed(() => {
  if (!props.data?.length) return null;
  return {
    labels: props.data.map((d) => d.month),
    datasets: [
      {
        label: 'Revenue',
        data: props.data.map((d) => d.amount / 100),
        backgroundColor: '#6366f1',
        borderRadius: 6,
      },
    ],
  };
});

const chartOptions = {
  responsive: true,
  plugins: {
    legend: { display: false },
    tooltip: {
      callbacks: {
        label: (ctx: { parsed: { y: number } }) =>
          `$${ctx.parsed.y.toLocaleString('en-US', { minimumFractionDigits: 2 })}`,
      },
    },
  },
  scales: {
    y: {
      beginAtZero: true,
      ticks: {
        callback: (value: string | number) => `$${value}`,
      },
    },
  },
};
</script>
