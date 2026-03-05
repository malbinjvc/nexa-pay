<template>
  <div class="bg-white rounded-xl border border-gray-200 p-6">
    <p class="text-sm font-medium text-gray-500">{{ label }}</p>
    <p class="mt-2 text-3xl font-bold text-gray-900">{{ displayValue }}</p>
    <p v-if="subtitle" class="mt-1 text-sm text-gray-500">{{ subtitle }}</p>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  label: string;
  value: string | number;
  subtitle?: string;
  isCurrency?: boolean;
}>();

const displayValue = computed(() => {
  if (props.isCurrency && typeof props.value === 'number') {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(props.value / 100);
  }
  return props.value;
});
</script>
