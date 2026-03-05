export const INVOICE_STATUSES = ['draft', 'sent', 'paid', 'overdue', 'cancelled'] as const;

export const PLAN_TIERS = ['free', 'pro', 'enterprise'] as const;

export const PLAN_LIMITS = {
  free: {
    max_clients: 5,
    max_invoices_per_month: 10,
    ai_insights: false,
    ai_drafts: false,
  },
  pro: {
    max_clients: 50,
    max_invoices_per_month: 100,
    ai_insights: true,
    ai_drafts: true,
  },
  enterprise: {
    max_clients: -1,
    max_invoices_per_month: -1,
    ai_insights: true,
    ai_drafts: true,
  },
} as const;

export const PLAN_PRICING = {
  free: { monthly: 0, name: 'Free' },
  pro: { monthly: 1900, name: 'Pro' },
  enterprise: { monthly: 4900, name: 'Enterprise' },
} as const;

export const RATE_LIMITS = {
  global: { requests: 100, window: 60 },
  ai: { requests: 20, window: 60 },
  auth: { requests: 10, window: 60 },
} as const;

export const CACHE_TTL = {
  dashboard: 300,
  clients: 60,
} as const;
