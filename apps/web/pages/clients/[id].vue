<template>
  <div>
    <AppHeader />
    <div class="flex">
      <AppSidebar />
      <main class="flex-1 p-8">
        <div v-if="loading" class="text-gray-500">Loading client...</div>

        <template v-else-if="client">
          <div class="flex items-center justify-between mb-6">
            <div>
              <NuxtLink to="/clients" class="text-sm text-gray-500 hover:text-gray-700">&larr; Back to Clients</NuxtLink>
              <h1 class="text-2xl font-bold text-gray-900 mt-1">{{ client.name }}</h1>
            </div>
            <div class="flex gap-3">
              <button
                @click="editing = !editing"
                class="text-sm border border-gray-300 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors"
              >
                {{ editing ? 'Cancel Edit' : 'Edit' }}
              </button>
              <button
                @click="handleDelete"
                class="text-sm text-red-600 border border-red-300 px-4 py-2 rounded-lg hover:bg-red-50 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>

          <div v-if="editing" class="bg-white rounded-xl border border-gray-200 p-6 mb-6">
            <ClientForm :initial-data="client as Record<string, unknown>" :is-edit="true" @submit="updateClient" @cancel="editing = false" />
          </div>

          <div v-else class="bg-white rounded-xl border border-gray-200 p-6">
            <div class="grid grid-cols-2 gap-4">
              <div>
                <p class="text-sm text-gray-500">Email</p>
                <p class="font-medium">{{ client.email }}</p>
              </div>
              <div>
                <p class="text-sm text-gray-500">Company</p>
                <p class="font-medium">{{ client.company || '-' }}</p>
              </div>
              <div>
                <p class="text-sm text-gray-500">Phone</p>
                <p class="font-medium">{{ client.phone || '-' }}</p>
              </div>
              <div>
                <p class="text-sm text-gray-500">Invoices</p>
                <p class="font-medium">{{ client.invoice_count }}</p>
              </div>
              <div class="col-span-2">
                <p class="text-sm text-gray-500">Address</p>
                <p class="font-medium">{{ client.address || '-' }}</p>
              </div>
              <div class="col-span-2">
                <p class="text-sm text-gray-500">Notes</p>
                <p class="font-medium">{{ client.notes || '-' }}</p>
              </div>
            </div>
          </div>
        </template>

        <p v-else class="text-red-600">Client not found</p>
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ middleware: 'auth' });

interface ClientDetail {
  id: string;
  name: string;
  email: string;
  company: string | null;
  phone: string | null;
  address: string | null;
  notes: string | null;
  invoice_count: number;
}

const route = useRoute();
const { get, put, del } = useApi();

const client = ref<ClientDetail | null>(null);
const loading = ref(true);
const editing = ref(false);

onMounted(async () => {
  try {
    client.value = await get<ClientDetail>(`/api/clients/${route.params.id}`);
  } catch {
    // handle error
  } finally {
    loading.value = false;
  }
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function updateClient(data: any) {
  try {
    client.value = await put<ClientDetail>(`/api/clients/${route.params.id}`, data);
    editing.value = false;
  } catch (e) {
    alert(e instanceof Error ? e.message : 'Failed to update client');
  }
}

async function handleDelete() {
  if (!confirm('Are you sure you want to delete this client?')) return;
  try {
    await del(`/api/clients/${route.params.id}`);
    navigateTo('/clients');
  } catch (e) {
    alert(e instanceof Error ? e.message : 'Failed to delete client');
  }
}
</script>
