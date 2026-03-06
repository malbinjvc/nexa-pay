<template>
  <form @submit.prevent="handleSubmit" class="space-y-4">
    <div>
      <label class="block text-sm font-medium text-gray-700">Name *</label>
      <input
        v-model="form.name"
        type="text"
        required
        class="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 px-3 py-2 border"
      />
    </div>
    <div>
      <label class="block text-sm font-medium text-gray-700">Email *</label>
      <input
        v-model="form.email"
        type="email"
        required
        class="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 px-3 py-2 border"
      />
    </div>
    <div>
      <label class="block text-sm font-medium text-gray-700">Company</label>
      <input
        v-model="form.company"
        type="text"
        class="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 px-3 py-2 border"
      />
    </div>
    <div>
      <label class="block text-sm font-medium text-gray-700">Phone</label>
      <input
        v-model="form.phone"
        type="text"
        class="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 px-3 py-2 border"
      />
    </div>
    <div>
      <label class="block text-sm font-medium text-gray-700">Address</label>
      <textarea
        v-model="form.address"
        rows="2"
        class="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 px-3 py-2 border"
      />
    </div>
    <div>
      <label class="block text-sm font-medium text-gray-700">Notes</label>
      <textarea
        v-model="form.notes"
        rows="2"
        class="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 px-3 py-2 border"
      />
    </div>
    <div class="flex gap-3 pt-2">
      <button
        type="submit"
        :disabled="submitting"
        class="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors"
      >
        {{ submitting ? 'Saving...' : (isEdit ? 'Update Client' : 'Create Client') }}
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
interface ClientData {
  name: string;
  email: string;
  company: string;
  phone: string;
  address: string;
  notes: string;
  [key: string]: unknown;
}

const props = defineProps<{
  initialData?: Record<string, unknown>;
  isEdit?: boolean;
}>();

const emit = defineEmits<{
  submit: [data: ClientData];
  cancel: [];
}>();

const submitting = ref(false);

const form = reactive<ClientData>({
  name: (props.initialData?.name as string) || '',
  email: (props.initialData?.email as string) || '',
  company: (props.initialData?.company as string) || '',
  phone: (props.initialData?.phone as string) || '',
  address: (props.initialData?.address as string) || '',
  notes: (props.initialData?.notes as string) || '',
});

async function handleSubmit() {
  submitting.value = true;
  try {
    emit('submit', { ...form });
  } finally {
    submitting.value = false;
  }
}
</script>
