<template>
  <div>
    <AppHeader />
    <div class="flex">
      <AppSidebar />
      <main class="flex-1 p-8">
        <div v-if="loading" class="text-gray-500">Loading invoice...</div>

        <template v-else-if="invoice">
          <div class="flex items-center justify-between mb-6">
            <div>
              <NuxtLink to="/invoices" class="text-sm text-gray-500 hover:text-gray-700">&larr; Back to Invoices</NuxtLink>
              <h1 class="text-2xl font-bold text-gray-900 mt-1">{{ invoice.invoice_number }}</h1>
            </div>
            <div class="flex gap-3">
              <button
                v-if="invoice.status === 'draft' || invoice.status === 'sent'"
                @click="sendInvoice"
                :disabled="sending"
                class="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors"
              >
                {{ sending ? 'Sending...' : 'Send Invoice' }}
              </button>
              <button
                v-if="invoice.status !== 'paid' && invoice.status !== 'cancelled'"
                @click="markPaid"
                class="border border-green-300 text-green-700 px-4 py-2 rounded-lg hover:bg-green-50 transition-colors"
              >
                Mark Paid
              </button>
              <button
                v-if="invoice.status === 'draft'"
                @click="deleteInvoice"
                class="border border-red-300 text-red-600 px-4 py-2 rounded-lg hover:bg-red-50 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>

          <div class="bg-white rounded-xl border border-gray-200 p-6">
            <div class="flex items-center justify-between mb-6">
              <div>
                <InvoiceStatusBadge :status="invoice.status" />
                <p class="text-sm text-gray-500 mt-1">Created {{ invoice.created_at?.split('T')[0] }}</p>
              </div>
              <div class="text-right">
                <p class="text-3xl font-bold text-gray-900">${{ (invoice.total / 100).toFixed(2) }}</p>
              </div>
            </div>

            <div class="grid grid-cols-2 gap-6 mb-6">
              <div>
                <p class="text-sm text-gray-500">Client</p>
                <p class="font-medium">{{ invoice.clients?.name || '-' }}</p>
                <p class="text-sm text-gray-600">{{ invoice.clients?.email || '' }}</p>
              </div>
              <div>
                <p class="text-sm text-gray-500">Dates</p>
                <p class="text-sm">Issued: {{ invoice.issue_date }}</p>
                <p class="text-sm">Due: {{ invoice.due_date }}</p>
              </div>
            </div>

            <!-- Line Items -->
            <div class="border-t pt-4">
              <h3 class="font-semibold text-gray-900 mb-3">Line Items</h3>
              <table class="w-full">
                <thead>
                  <tr class="text-sm text-gray-500">
                    <th class="text-left pb-2">Description</th>
                    <th class="text-right pb-2">Qty</th>
                    <th class="text-right pb-2">Price</th>
                    <th class="text-right pb-2">Amount</th>
                  </tr>
                </thead>
                <tbody class="divide-y">
                  <tr v-for="item in invoice.invoice_items" :key="item.id">
                    <td class="py-2">{{ item.description }}</td>
                    <td class="py-2 text-right">{{ item.quantity }}</td>
                    <td class="py-2 text-right">${{ (item.unit_price / 100).toFixed(2) }}</td>
                    <td class="py-2 text-right">${{ (item.amount / 100).toFixed(2) }}</td>
                  </tr>
                </tbody>
              </table>

              <div class="border-t mt-4 pt-4 space-y-1 text-right">
                <p class="text-sm text-gray-500">Subtotal: ${{ (invoice.subtotal / 100).toFixed(2) }}</p>
                <p class="text-sm text-gray-500">Tax ({{ invoice.tax_rate }}%): ${{ (invoice.tax_amount / 100).toFixed(2) }}</p>
                <p v-if="invoice.discount_amount" class="text-sm text-gray-500">
                  Discount: -${{ (invoice.discount_amount / 100).toFixed(2) }}
                </p>
                <p class="text-lg font-bold">Total: ${{ (invoice.total / 100).toFixed(2) }}</p>
              </div>
            </div>

            <div v-if="invoice.notes" class="border-t mt-6 pt-4">
              <p class="text-sm text-gray-500">Notes</p>
              <p class="text-gray-700">{{ invoice.notes }}</p>
            </div>
          </div>
        </template>

        <p v-else class="text-red-600">Invoice not found</p>
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ middleware: 'auth' });

interface InvoiceDetail {
  id: string;
  invoice_number: string;
  status: string;
  issue_date: string;
  due_date: string;
  subtotal: number;
  tax_rate: number;
  tax_amount: number;
  discount_amount: number;
  total: number;
  notes: string | null;
  created_at: string;
  clients?: { name: string; email: string };
  invoice_items?: { id: string; description: string; quantity: number; unit_price: number; amount: number }[];
}

const route = useRoute();
const { get, post, del } = useApi();

const invoice = ref<InvoiceDetail | null>(null);
const loading = ref(true);
const sending = ref(false);

onMounted(async () => {
  try {
    invoice.value = await get<InvoiceDetail>(`/api/invoices/${route.params.id}`);
  } catch {
    // handle error
  } finally {
    loading.value = false;
  }
});

async function sendInvoice() {
  sending.value = true;
  try {
    await post(`/api/invoices/${route.params.id}/send`);
    if (invoice.value) invoice.value.status = 'sent';
  } catch (e) {
    alert(e instanceof Error ? e.message : 'Failed to send invoice');
  } finally {
    sending.value = false;
  }
}

async function markPaid() {
  try {
    const updated = await post<InvoiceDetail>(`/api/invoices/${route.params.id}/mark-paid`);
    invoice.value = updated;
  } catch (e) {
    alert(e instanceof Error ? e.message : 'Failed to mark as paid');
  }
}

async function deleteInvoice() {
  if (!confirm('Delete this draft invoice?')) return;
  try {
    await del(`/api/invoices/${route.params.id}`);
    navigateTo('/invoices');
  } catch (e) {
    alert(e instanceof Error ? e.message : 'Failed to delete invoice');
  }
}
</script>
