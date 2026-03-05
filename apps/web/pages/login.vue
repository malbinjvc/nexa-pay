<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50 px-4">
    <div class="max-w-md w-full">
      <div class="text-center mb-8">
        <NuxtLink to="/" class="text-3xl font-bold text-indigo-600">NexaPay</NuxtLink>
        <p class="mt-2 text-gray-600">Sign in to manage your invoices</p>
      </div>

      <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
        <!-- Magic Link -->
        <form @submit.prevent="handleMagicLink" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700">Email address</label>
            <input
              v-model="email"
              type="email"
              required
              placeholder="you@example.com"
              class="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 px-3 py-2 border"
            />
          </div>
          <button
            type="submit"
            :disabled="loading"
            class="w-full bg-indigo-600 text-white py-2 px-4 rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors font-medium"
          >
            {{ loading ? 'Sending...' : 'Send Magic Link' }}
          </button>
        </form>

        <p v-if="message" class="mt-4 text-center text-sm text-green-600">{{ message }}</p>
        <p v-if="error" class="mt-4 text-center text-sm text-red-600">{{ error }}</p>

        <!-- Divider -->
        <div class="relative my-6">
          <div class="absolute inset-0 flex items-center">
            <div class="w-full border-t border-gray-200"></div>
          </div>
          <div class="relative flex justify-center text-sm">
            <span class="px-2 bg-white text-gray-500">Or continue with</span>
          </div>
        </div>

        <!-- OAuth -->
        <div class="space-y-3">
          <button
            @click="handleOAuth('google')"
            class="w-full flex items-center justify-center gap-2 border border-gray-300 rounded-lg py-2 px-4 hover:bg-gray-50 transition-colors"
          >
            <span>Google</span>
          </button>
          <button
            @click="handleOAuth('github')"
            class="w-full flex items-center justify-center gap-2 border border-gray-300 rounded-lg py-2 px-4 hover:bg-gray-50 transition-colors"
          >
            <span>GitHub</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const { signInWithMagicLink, signInWithOAuth } = useAuth();

const email = ref('');
const loading = ref(false);
const message = ref('');
const error = ref('');

async function handleMagicLink() {
  loading.value = true;
  error.value = '';
  message.value = '';
  try {
    await signInWithMagicLink(email.value);
    message.value = 'Check your email for the magic link!';
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'Failed to send magic link';
  } finally {
    loading.value = false;
  }
}

async function handleOAuth(provider: 'google' | 'github') {
  try {
    await signInWithOAuth(provider);
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'OAuth sign-in failed';
  }
}
</script>
