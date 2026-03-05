<template>
  <div>
    <AppHeader />
    <main class="max-w-6xl mx-auto px-6 py-16">
      <div class="text-center mb-12">
        <h1 class="text-4xl font-bold text-gray-900 mb-4">Simple, Transparent Pricing</h1>
        <p class="text-xl text-gray-600">Choose the plan that fits your business</p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div
          v-for="plan in plans"
          :key="plan.id"
          class="bg-white rounded-xl border-2 p-8 flex flex-col"
          :class="plan.featured ? 'border-indigo-500 shadow-lg' : 'border-gray-200'"
        >
          <div v-if="plan.featured" class="text-sm font-semibold text-indigo-600 mb-2">Most Popular</div>
          <h2 class="text-2xl font-bold text-gray-900">{{ plan.name }}</h2>
          <div class="mt-4 mb-6">
            <span class="text-4xl font-bold text-gray-900">${{ plan.price }}</span>
            <span class="text-gray-500">/month</span>
          </div>
          <ul class="space-y-3 flex-1">
            <li v-for="feature in plan.features" :key="feature" class="flex items-start gap-2">
              <span class="text-green-500 mt-0.5">&#10003;</span>
              <span class="text-gray-600">{{ feature }}</span>
            </li>
          </ul>
          <button
            @click="handlePlanSelect(plan.id)"
            :disabled="subscribing"
            class="mt-8 w-full py-3 px-4 rounded-lg font-semibold transition-colors"
            :class="plan.featured
              ? 'bg-indigo-600 text-white hover:bg-indigo-700'
              : 'border-2 border-gray-300 text-gray-700 hover:bg-gray-50'"
          >
            {{ plan.id === 'free' ? 'Get Started' : (subscribing ? 'Processing...' : `Upgrade to ${plan.name}`) }}
          </button>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
const { user } = useAuth();
const { post } = useApi();
const subscribing = ref(false);

const plans = [
  {
    id: 'free',
    name: 'Free',
    price: 0,
    featured: false,
    features: [
      'Up to 5 clients',
      '10 invoices per month',
      'Email invoices',
      'Stripe payments',
      'Revenue dashboard',
    ],
  },
  {
    id: 'pro',
    name: 'Pro',
    price: 19,
    featured: true,
    features: [
      'Up to 50 clients',
      '100 invoices per month',
      'Email invoices',
      'Stripe payments',
      'Revenue dashboard',
      'AI financial insights',
      'AI invoice drafting',
      'Priority support',
    ],
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: 49,
    featured: false,
    features: [
      'Unlimited clients',
      'Unlimited invoices',
      'Email invoices',
      'Stripe payments',
      'Revenue dashboard',
      'AI financial insights',
      'AI invoice drafting',
      'Dedicated support',
      'Custom integrations',
    ],
  },
];

async function handlePlanSelect(planId: string) {
  if (planId === 'free') {
    navigateTo(user.value ? '/dashboard' : '/login');
    return;
  }

  if (!user.value) {
    navigateTo('/login');
    return;
  }

  subscribing.value = true;
  try {
    const { url } = await post<{ url: string }>('/api/stripe/checkout', { plan: planId });
    window.location.href = url;
  } catch (e) {
    alert(e instanceof Error ? e.message : 'Failed to start checkout');
  } finally {
    subscribing.value = false;
  }
}
</script>
