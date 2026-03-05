<template>
  <form @submit.prevent="handleSubmit" class="space-y-6">
    <div class="grid grid-cols-2 gap-4">
      <div>
        <label class="block text-sm font-medium text-gray-700">Client *</label>
        <select
          v-model="form.client_id"
          required
          class="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 px-3 py-2 border"
        >
          <option value="">Select a client</option>
          <option v-for="client in clients" :key="client.id" :value="client.id">
            {{ client.name }}
          </option>
        </select>
      </div>
      <div></div>
      <div>
        <label class="block text-sm font-medium text-gray-700">Issue Date *</label>
        <input
          v-model="form.issue_date"
          type="date"
          required
          class="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 px-3 py-2 border"
        />
      </div>
      <div>
        <label class="block text-sm font-medium text-gray-700">Due Date *</label>
        <input
          v-model="form.due_date"
          type="date"
          required
          class="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 px-3 py-2 border"
        />
      </div>
    </div>

    <div>
      <div class="flex items-center justify-between mb-2">
        <label class="block text-sm font-medium text-gray-700">Line Items</label>
        <button
          type="button"
          @click="addItem"
          class="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
        >
          + Add Item
        </button>
      </div>
      <div class="space-y-3">
        <div
          v-for="(item, index) in form.items"
          :key="index"
          class="flex gap-3 items-start"
        >
          <input
            v-model="item.description"
            placeholder="Description"
            required
            class="flex-1 rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 px-3 py-2 border"
          />
          <input
            v-model.number="item.quantity"
            type="number"
            min="1"
            step="1"
            placeholder="Qty"
            required
            class="w-20 rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 px-3 py-2 border"
          />
          <input
            v-model.number="item.unit_price_display"
            type="number"
            min="0"
            step="0.01"
            placeholder="Price"
            required
            class="w-28 rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 px-3 py-2 border"
          />
          <button
            v-if="form.items.length > 1"
            type="button"
            @click="removeItem(index)"
            class="text-red-500 hover:text-red-700 px-2 py-2"
          >
            X
          </button>
        </div>
      </div>
    </div>

    <div class="grid grid-cols-3 gap-4">
      <div>
        <label class="block text-sm font-medium text-gray-700">Tax Rate (%)</label>
        <input
          v-model.number="form.tax_rate"
          type="number"
          min="0"
          max="100"
          step="0.01"
          class="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 px-3 py-2 border"
        />
      </div>
      <div>
        <label class="block text-sm font-medium text-gray-700">Discount ($)</label>
        <input
          v-model.number="form.discount_display"
          type="number"
          min="0"
          step="0.01"
          class="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 px-3 py-2 border"
        />
      </div>
      <div class="flex flex-col justify-end">
        <p class="text-sm text-gray-500">Subtotal: ${{ (subtotal / 100).toFixed(2) }}</p>
        <p class="text-sm text-gray-500">Tax: ${{ (taxAmount / 100).toFixed(2) }}</p>
        <p class="text-lg font-bold text-gray-900">Total: ${{ (total / 100).toFixed(2) }}</p>
      </div>
    </div>

    <div>
      <label class="block text-sm font-medium text-gray-700">Notes</label>
      <textarea
        v-model="form.notes"
        rows="3"
        class="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 px-3 py-2 border"
      />
    </div>

    <div class="flex gap-3 pt-2">
      <button
        type="submit"
        :disabled="submitting"
        class="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors"
      >
        {{ submitting ? 'Saving...' : 'Create Invoice' }}
      </button>
      <button
        type="button"
        @click="$emit('cancel')"
        class="text-gray-600 px-4 py-2 rounded-lg border hover:bg-gray-50 transition-colors"
      >
        Cancel
      </button>
    </div>
  </form>
</template>

<script setup lang="ts">
interface LineItem {
  description: string;
  quantity: number;
  unit_price_display: number;
}

interface Client {
  id: string;
  name: string;
}

const props = defineProps<{
  clients: Client[];
}>();

const emit = defineEmits<{
  submit: [data: Record<string, unknown>];
  cancel: [];
}>();

const submitting = ref(false);

const form = reactive({
  client_id: '',
  issue_date: new Date().toISOString().split('T')[0],
  due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  tax_rate: 0,
  discount_display: 0,
  notes: '',
  items: [{ description: '', quantity: 1, unit_price_display: 0 }] as LineItem[],
});

const subtotal = computed(() =>
  form.items.reduce((sum, item) => sum + Math.round(item.quantity * item.unit_price_display * 100), 0)
);

const taxAmount = computed(() => Math.round(subtotal.value * (form.tax_rate / 100)));
const total = computed(() => Math.max(0, subtotal.value + taxAmount.value - Math.round(form.discount_display * 100)));

function addItem() {
  form.items.push({ description: '', quantity: 1, unit_price_display: 0 });
}

function removeItem(index: number) {
  form.items.splice(index, 1);
}

async function handleSubmit() {
  submitting.value = true;
  try {
    emit('submit', {
      client_id: form.client_id,
      issue_date: form.issue_date,
      due_date: form.due_date,
      tax_rate: form.tax_rate,
      discount_amount: Math.round(form.discount_display * 100),
      notes: form.notes || null,
      items: form.items.map((item) => ({
        description: item.description,
        quantity: item.quantity,
        unit_price: Math.round(item.unit_price_display * 100),
      })),
    });
  } finally {
    submitting.value = false;
  }
}
</script>
