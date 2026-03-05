<template>
  <aside class="w-64 bg-white border-r border-gray-200 min-h-screen p-4">
    <nav class="space-y-1">
      <NuxtLink
        v-for="item in navItems"
        :key="item.to"
        :to="item.to"
        class="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors"
        :class="route.path === item.to || route.path.startsWith(item.to + '/')
          ? 'bg-indigo-50 text-indigo-700'
          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'"
      >
        <span class="text-lg">{{ item.icon }}</span>
        <span>{{ item.label }}</span>
      </NuxtLink>
    </nav>
  </aside>
</template>

<script setup lang="ts">
const route = useRoute();

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: '📊' },
  { to: '/invoices', label: 'Invoices', icon: '📄' },
  { to: '/clients', label: 'Clients', icon: '👥' },
  { to: '/insights', label: 'AI Insights', icon: '🤖' },
  { to: '/settings', label: 'Settings', icon: '⚙️' },
];
</script>
