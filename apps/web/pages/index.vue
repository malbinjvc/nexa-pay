<template>
  <div>
    <AppHeader />
    <main>
      <!-- Hero -->
      <section class="bg-gradient-to-br from-indigo-600 to-purple-700 text-white py-24">
        <div class="max-w-4xl mx-auto px-6 text-center">
          <h1 class="text-5xl font-bold mb-6">AI-Powered Invoicing for Modern Freelancers</h1>
          <p class="text-xl text-indigo-100 mb-8 max-w-2xl mx-auto">
            Create professional invoices, accept payments via Stripe, and get AI-driven financial insights. All in one platform.
          </p>
          <div class="flex gap-4 justify-center">
            <NuxtLink
              to="/login"
              class="bg-white text-indigo-600 px-8 py-3 rounded-lg font-semibold hover:bg-indigo-50 transition-colors"
            >
              Start Free
            </NuxtLink>
            <NuxtLink
              to="/pricing"
              class="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white/10 transition-colors"
            >
              View Pricing
            </NuxtLink>
          </div>
        </div>
      </section>

      <!-- Features -->
      <section class="py-20 bg-white">
        <div class="max-w-6xl mx-auto px-6">
          <h2 class="text-3xl font-bold text-center mb-12">Everything You Need to Get Paid</h2>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div v-for="feature in features" :key="feature.title" class="text-center">
              <div class="text-4xl mb-4">{{ feature.icon }}</div>
              <h3 class="text-xl font-semibold mb-2">{{ feature.title }}</h3>
              <p class="text-gray-600">{{ feature.description }}</p>
            </div>
          </div>
        </div>
      </section>

      <!-- CTA -->
      <section class="py-16 bg-gray-50">
        <div class="max-w-4xl mx-auto px-6 text-center">
          <h2 class="text-3xl font-bold mb-4">Ready to Streamline Your Invoicing?</h2>
          <p class="text-gray-600 mb-8">Join freelancers and businesses who trust NexaPay.</p>
          <NuxtLink
            to="/login"
            class="bg-indigo-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-indigo-700 transition-colors"
          >
            Get Started for Free
          </NuxtLink>
        </div>
      </section>
    </main>
  </div>
</template>

<script setup lang="ts">
const features = [
  {
    icon: '📄',
    title: 'Professional Invoices',
    description: 'Create and send beautiful invoices with line items, taxes, and discounts.',
  },
  {
    icon: '💳',
    title: 'Stripe Payments',
    description: 'Accept online payments with one-click "Pay Now" links via Stripe Checkout.',
  },
  {
    icon: '🤖',
    title: 'AI Insights',
    description: 'Get cash flow analysis, predictions, and AI-drafted invoice descriptions.',
  },
  {
    icon: '📧',
    title: 'Email Delivery',
    description: 'Send invoices directly to clients with professional email templates.',
  },
  {
    icon: '📊',
    title: 'Revenue Dashboard',
    description: 'Track revenue, outstanding, and overdue amounts with visual charts.',
  },
  {
    icon: '🔒',
    title: 'Secure by Design',
    description: 'Row-level security, encrypted payments, and enterprise-grade infrastructure.',
  },
];
</script>
