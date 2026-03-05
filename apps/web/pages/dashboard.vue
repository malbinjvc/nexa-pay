<template>
  <div>
    <AppHeader />
    <div class="flex">
      <AppSidebar />
      <main class="flex-1 p-8">
        <h1 class="text-2xl font-bold text-gray-900 mb-6">Dashboard</h1>

        <div v-if="loading" class="text-gray-500">Loading dashboard...</div>

        <template v-else-if="stats">
          <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <StatsCard label="Total Revenue" :value="stats.total_revenue" :is-currency="true" />
            <StatsCard label="Outstanding" :value="stats.outstanding_amount" :is-currency="true" />
            <StatsCard label="Overdue" :value="stats.overdue_amount" :is-currency="true" />
            <StatsCard
              label="Invoices"
              :value="stats.total_invoices"
              :subtitle="`${stats.paid_invoices} paid, ${stats.pending_invoices} pending`"
            />
          </div>
          <RevenueChart :data="stats.monthly_revenue" />
        </template>

        <p v-else class="text-red-600">{{ error }}</p>
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ middleware: 'auth' });

interface DashboardStats {
  total_revenue: number;
  outstanding_amount: number;
  overdue_amount: number;
  total_invoices: number;
  paid_invoices: number;
  pending_invoices: number;
  overdue_invoices: number;
  monthly_revenue: { month: string; amount: number }[];
}

const { get } = useApi();
const stats = ref<DashboardStats | null>(null);
const loading = ref(true);
const error = ref('');

onMounted(async () => {
  try {
    stats.value = await get<DashboardStats>('/api/dashboard/stats');
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'Failed to load dashboard';
  } finally {
    loading.value = false;
  }
});
</script>
