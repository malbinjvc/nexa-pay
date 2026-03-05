<template>
  <div>
    <AppHeader />
    <div class="flex">
      <AppSidebar />
      <main class="flex-1 p-8">
        <div class="flex items-center justify-between mb-6">
          <h1 class="text-2xl font-bold text-gray-900">Invoices</h1>
          <NuxtLink
            to="/invoices/new"
            class="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
          >
            New Invoice
          </NuxtLink>
        </div>

        <!-- Filters -->
        <div class="flex gap-2 mb-6">
          <button
            v-for="filter in filters"
            :key="filter.value"
            @click="activeFilter = filter.value"
            class="px-3 py-1 rounded-full text-sm font-medium transition-colors"
            :class="activeFilter === filter.value
              ? 'bg-indigo-100 text-indigo-700'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'"
          >
            {{ filter.label }}
          </button>
        </div>

        <div v-if="loading" class="text-gray-500">Loading invoices...</div>

        <div v-else-if="invoices.length" class="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table class="w-full">
            <thead class="bg-gray-50">
              <tr>
                <th class="text-left px-6 py-3 text-sm font-medium text-gray-500">Invoice</th>
                <th class="text-left px-6 py-3 text-sm font-medium text-gray-500">Client</th>
                <th class="text-left px-6 py-3 text-sm font-medium text-gray-500">Status</th>
                <th class="text-left px-6 py-3 text-sm font-medium text-gray-500">Total</th>
                <th class="text-left px-6 py-3 text-sm font-medium text-gray-500">Due Date</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-200">
              <tr v-for="invoice in invoices" :key="invoice.id" class="hover:bg-gray-50">
                <td class="px-6 py-4">
                  <NuxtLink :to="`/invoices/${invoice.id}`" class="text-indigo-600 hover:text-indigo-700 font-medium">
                    {{ invoice.invoice_number }}
                  </NuxtLink>
                </td>
                <td class="px-6 py-4 text-gray-600">{{ invoice.clients?.name || '-' }}</td>
                <td class="px-6 py-4">
                  <InvoiceStatusBadge :status="invoice.status" />
                </td>
                <td class="px-6 py-4 font-medium">${{ (invoice.total / 100).toFixed(2) }}</td>
                <td class="px-6 py-4 text-gray-600">{{ invoice.due_date }}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <p v-else class="text-gray-500">No invoices found. Create your first invoice.</p>
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ middleware: 'auth' });

interface Invoice {
  id: string;
  invoice_number: string;
  status: string;
  total: number;
  due_date: string;
  clients?: { name: string; email: string };
}

const { get } = useApi();
const invoices = ref<Invoice[]>([]);
const loading = ref(true);
const activeFilter = ref('');

const filters = [
  { label: 'All', value: '' },
  { label: 'Draft', value: 'draft' },
  { label: 'Sent', value: 'sent' },
  { label: 'Paid', value: 'paid' },
  { label: 'Overdue', value: 'overdue' },
];

async function fetchInvoices() {
  loading.value = true;
  try {
    const query = activeFilter.value ? `?status=${activeFilter.value}` : '';
    const response = await get<{ data: Invoice[] }>(`/api/invoices${query}`);
    invoices.value = response.data;
  } catch {
    // handle error
  } finally {
    loading.value = false;
  }
}

watch(activeFilter, fetchInvoices);
onMounted(fetchInvoices);
</script>
