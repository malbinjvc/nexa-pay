<template>
  <div>
    <AppHeader />
    <div class="flex">
      <AppSidebar />
      <main class="flex-1 p-8">
        <div class="flex items-center justify-between mb-6">
          <h1 class="text-2xl font-bold text-gray-900">Clients</h1>
          <button
            @click="showForm = true"
            class="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Add Client
          </button>
        </div>

        <div v-if="showForm" class="bg-white rounded-xl border border-gray-200 p-6 mb-6">
          <h2 class="text-lg font-semibold mb-4">New Client</h2>
          <ClientForm @submit="createClient" @cancel="showForm = false" />
        </div>

        <div v-if="loading" class="text-gray-500">Loading clients...</div>

        <div v-else-if="clients.length" class="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table class="w-full">
            <thead class="bg-gray-50">
              <tr>
                <th class="text-left px-6 py-3 text-sm font-medium text-gray-500">Name</th>
                <th class="text-left px-6 py-3 text-sm font-medium text-gray-500">Email</th>
                <th class="text-left px-6 py-3 text-sm font-medium text-gray-500">Company</th>
                <th class="text-left px-6 py-3 text-sm font-medium text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-200">
              <tr v-for="client in clients" :key="client.id" class="hover:bg-gray-50">
                <td class="px-6 py-4">
                  <NuxtLink :to="`/clients/${client.id}`" class="text-indigo-600 hover:text-indigo-700 font-medium">
                    {{ client.name }}
                  </NuxtLink>
                </td>
                <td class="px-6 py-4 text-gray-600">{{ client.email }}</td>
                <td class="px-6 py-4 text-gray-600">{{ client.company || '-' }}</td>
                <td class="px-6 py-4">
                  <NuxtLink :to="`/clients/${client.id}`" class="text-sm text-indigo-600 hover:text-indigo-700">
                    View
                  </NuxtLink>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <p v-else class="text-gray-500">No clients yet. Create your first client to get started.</p>
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ middleware: 'auth' });

interface Client {
  id: string;
  name: string;
  email: string;
  company: string | null;
}

const { get, post } = useApi();
const clients = ref<Client[]>([]);
const loading = ref(true);
const showForm = ref(false);

onMounted(async () => {
  try {
    clients.value = await get<Client[]>('/api/clients');
  } catch {
    // handle error silently
  } finally {
    loading.value = false;
  }
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function createClient(data: any) {
  try {
    const client = await post<Client>('/api/clients', data);
    clients.value.unshift(client);
    showForm.value = false;
  } catch (e) {
    alert(e instanceof Error ? e.message : 'Failed to create client');
  }
}
</script>
