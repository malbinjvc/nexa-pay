<template>
  <div>
    <AppHeader />
    <div class="flex">
      <AppSidebar />
      <main class="flex-1 p-8">
        <NuxtLink to="/invoices" class="text-sm text-gray-500 hover:text-gray-700">&larr; Back to Invoices</NuxtLink>
        <h1 class="text-2xl font-bold text-gray-900 mt-1 mb-6">New Invoice</h1>

        <div v-if="loadingClients" class="text-gray-500">Loading clients...</div>

        <div v-else-if="clients.length" class="bg-white rounded-xl border border-gray-200 p-6">
          <InvoiceForm :clients="clients" @submit="createInvoice" @cancel="navigateTo('/invoices')" />
        </div>

        <div v-else class="text-center py-12">
          <p class="text-gray-500 mb-4">You need at least one client to create an invoice.</p>
          <NuxtLink to="/clients" class="text-indigo-600 hover:text-indigo-700 font-medium">
            Create a Client First
          </NuxtLink>
        </div>
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ middleware: 'auth' });

interface Client {
  id: string;
  name: string;
}

const { get, post } = useApi();
const clients = ref<Client[]>([]);
const loadingClients = ref(true);

onMounted(async () => {
  try {
    clients.value = await get<Client[]>('/api/clients');
  } catch {
    // handle error
  } finally {
    loadingClients.value = false;
  }
});

async function createInvoice(data: Record<string, unknown>) {
  try {
    const invoice = await post<{ id: string }>('/api/invoices', data);
    navigateTo(`/invoices/${invoice.id}`);
  } catch (e) {
    alert(e instanceof Error ? e.message : 'Failed to create invoice');
  }
}
</script>
