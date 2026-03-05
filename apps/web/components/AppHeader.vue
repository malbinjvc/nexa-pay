<template>
  <header class="bg-white border-b border-gray-200 px-6 py-4">
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-4">
        <NuxtLink to="/" class="text-xl font-bold text-indigo-600">NexaPay</NuxtLink>
      </div>
      <div v-if="user" class="flex items-center gap-4">
        <span class="text-sm text-gray-600">{{ user.email }}</span>
        <button
          @click="signOut"
          class="text-sm text-gray-500 hover:text-gray-700 transition-colors"
        >
          Sign Out
        </button>
      </div>
      <div v-else class="flex items-center gap-4">
        <NuxtLink to="/login" class="text-sm text-indigo-600 hover:text-indigo-700 font-medium">
          Sign In
        </NuxtLink>
        <NuxtLink
          to="/pricing"
          class="text-sm bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
        >
          Get Started
        </NuxtLink>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
const { user, signOut } = useAuth();
</script>
