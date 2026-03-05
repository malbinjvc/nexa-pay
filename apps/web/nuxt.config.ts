export default defineNuxtConfig({
  compatibilityDate: '2025-01-01',
  devtools: { enabled: true },

  modules: ['@nuxtjs/tailwindcss'],

  runtimeConfig: {
    public: {
      supabaseUrl: process.env.SUPABASE_URL || '',
      supabaseAnonKey: process.env.SUPABASE_ANON_KEY || '',
      apiUrl: process.env.API_URL || 'http://localhost:8787',
    },
  },

  app: {
    head: {
      title: 'NexaPay - AI-Powered Invoice & Payment Platform',
      meta: [
        { name: 'description', content: 'Create, send, and manage invoices with AI-powered insights and Stripe payments.' },
      ],
      link: [
        { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' },
      ],
    },
  },

  typescript: {
    strict: true,
  },
});
