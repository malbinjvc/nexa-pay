<template>
  <div>
    <AppHeader />
    <div class="flex">
      <AppSidebar />
      <main class="flex-1 p-8">
        <h1 class="text-2xl font-bold text-gray-900 mb-6">AI Financial Insights</h1>

        <div class="mb-6 flex gap-3">
          <select
            v-model="period"
            class="rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 px-3 py-2 border"
          >
            <option value="30d">Last 30 Days</option>
            <option value="90d">Last 90 Days</option>
            <option value="12m">Last 12 Months</option>
          </select>
          <button
            @click="fetchInsights"
            :disabled="loading"
            class="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors"
          >
            {{ loading ? 'Analyzing...' : 'Generate Insights' }}
          </button>
        </div>

        <div v-if="error" class="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <p class="text-red-700">{{ error }}</p>
        </div>

        <template v-if="insights">
          <!-- Cash Flow Score -->
          <div class="bg-white rounded-xl border border-gray-200 p-6 mb-6">
            <h2 class="text-lg font-semibold mb-3">Cash Flow Score</h2>
            <div class="flex items-center gap-4">
              <div
                class="text-4xl font-bold"
                :class="insights.cash_flow_score >= 70 ? 'text-green-600' : insights.cash_flow_score >= 40 ? 'text-yellow-600' : 'text-red-600'"
              >
                {{ insights.cash_flow_score }}/100
              </div>
              <p class="text-gray-600">{{ insights.summary }}</p>
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <!-- Predictions -->
            <div class="bg-white rounded-xl border border-gray-200 p-6">
              <h2 class="text-lg font-semibold mb-3">Predictions</h2>
              <ul class="space-y-2">
                <li v-for="(prediction, i) in insights.predictions" :key="i" class="flex gap-2">
                  <span class="text-indigo-500 mt-1">&#8226;</span>
                  <span class="text-gray-700">{{ prediction }}</span>
                </li>
              </ul>
            </div>

            <!-- Recommendations -->
            <div class="bg-white rounded-xl border border-gray-200 p-6">
              <h2 class="text-lg font-semibold mb-3">Recommendations</h2>
              <ul class="space-y-2">
                <li v-for="(rec, i) in insights.recommendations" :key="i" class="flex gap-2">
                  <span class="text-green-500 mt-1">&#8226;</span>
                  <span class="text-gray-700">{{ rec }}</span>
                </li>
              </ul>
            </div>
          </div>
        </template>

        <!-- AI Draft Section -->
        <div class="mt-8 bg-white rounded-xl border border-gray-200 p-6">
          <h2 class="text-lg font-semibold mb-3">AI Invoice Description Drafter</h2>
          <div class="space-y-3">
            <textarea
              v-model="draftBrief"
              placeholder="Describe the work briefly (e.g., 'website redesign for 3 pages')"
              rows="2"
              class="block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 px-3 py-2 border"
            />
            <button
              @click="generateDraft"
              :disabled="draftLoading || !draftBrief.trim()"
              class="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors"
            >
              {{ draftLoading ? 'Generating...' : 'Generate Description' }}
            </button>
            <div v-if="draftResult" class="bg-gray-50 rounded-lg p-4 mt-3">
              <p class="text-sm text-gray-500 mb-1">Generated Description:</p>
              <p class="text-gray-900">{{ draftResult }}</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ middleware: 'auth' });

interface AIInsight {
  cash_flow_score: number;
  summary: string;
  predictions: string[];
  recommendations: string[];
}

const { post } = useApi();
const period = ref('30d');
const insights = ref<AIInsight | null>(null);
const loading = ref(false);
const error = ref('');

const draftBrief = ref('');
const draftResult = ref('');
const draftLoading = ref(false);

async function fetchInsights() {
  loading.value = true;
  error.value = '';
  try {
    insights.value = await post<AIInsight>('/api/ai/insights', { period: period.value });
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'Failed to generate insights';
  } finally {
    loading.value = false;
  }
}

async function generateDraft() {
  draftLoading.value = true;
  try {
    const result = await post<{ description: string }>('/api/ai/draft-description', {
      brief: draftBrief.value,
    });
    draftResult.value = result.description;
  } catch (e) {
    alert(e instanceof Error ? e.message : 'Failed to generate draft');
  } finally {
    draftLoading.value = false;
  }
}
</script>
