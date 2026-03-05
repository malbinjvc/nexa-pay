<template>
  <span
    class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
    :class="statusClasses"
  >
    {{ status }}
  </span>
</template>

<script setup lang="ts">
const props = defineProps<{ status: string }>();

const statusClasses = computed(() => {
  const map: Record<string, string> = {
    draft: 'bg-gray-100 text-gray-800',
    sent: 'bg-blue-100 text-blue-800',
    paid: 'bg-green-100 text-green-800',
    overdue: 'bg-red-100 text-red-800',
    cancelled: 'bg-yellow-100 text-yellow-800',
  };
  return map[props.status] || 'bg-gray-100 text-gray-800';
});
</script>
