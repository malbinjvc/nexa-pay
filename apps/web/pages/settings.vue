<template>
  <div>
    <AppHeader />
    <div class="flex">
      <AppSidebar />
      <main class="flex-1 p-8">
        <h1 class="text-2xl font-bold text-gray-900 mb-6">Settings</h1>

        <!-- Profile -->
        <div class="bg-white rounded-xl border border-gray-200 p-6 mb-6">
          <h2 class="text-lg font-semibold mb-4">Profile</h2>
          <div class="space-y-3">
            <div>
              <p class="text-sm text-gray-500">Email</p>
              <p class="font-medium">{{ user?.email || '-' }}</p>
            </div>
            <div>
              <p class="text-sm text-gray-500">User ID</p>
              <p class="font-mono text-sm text-gray-600">{{ user?.id || '-' }}</p>
            </div>
          </div>
        </div>

        <!-- Subscription -->
        <div class="bg-white rounded-xl border border-gray-200 p-6 mb-6">
          <h2 class="text-lg font-semibold mb-4">Subscription</h2>
          <div v-if="subscription" class="space-y-3">
            <div>
              <p class="text-sm text-gray-500">Current Plan</p>
              <p class="font-medium capitalize">{{ subscription.plan }}</p>
            </div>
            <div>
              <p class="text-sm text-gray-500">Status</p>
              <p class="font-medium capitalize">{{ subscription.status }}</p>
            </div>
            <div class="flex gap-3 pt-2">
              <NuxtLink
                v-if="subscription.plan === 'free'"
                to="/pricing"
                class="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
              >
                Upgrade Plan
              </NuxtLink>
              <button
                v-else
                @click="openBillingPortal"
                class="border border-gray-300 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Manage Billing
              </button>
            </div>
          </div>
          <p v-else class="text-gray-500">Loading subscription...</p>
        </div>

        <!-- Sign Out -->
        <button
          @click="signOut"
          class="text-red-600 border border-red-300 px-4 py-2 rounded-lg hover:bg-red-50 transition-colors"
        >
          Sign Out
        </button>
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ middleware: 'auth' });

interface Subscription {
  plan: string;
  status: string;
}

const { user, signOut, getSupabase } = useAuth();
const { post } = useApi();
const subscription = ref<Subscription | null>(null);

onMounted(async () => {
  try {
    const sb = getSupabase();
    const { data } = await sb
      .from('subscriptions')
      .select('plan, status')
      .eq('user_id', user.value?.id ?? '')
      .single();
    subscription.value = data;
  } catch {
    // handle error
  }
});

async function openBillingPortal() {
  try {
    const { url } = await post<{ url: string }>('/api/stripe/portal');
    window.location.href = url;
  } catch (e) {
    alert(e instanceof Error ? e.message : 'Failed to open billing portal');
  }
}
</script>
