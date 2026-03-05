import { Hono } from 'hono';
import { createClient } from '@supabase/supabase-js';
import { aiInsightsRequestSchema, aiDraftRequestSchema } from '@nexa-pay/shared';
import type { AuthVariables } from '../middleware/auth';
import type { DashboardStats } from '@nexa-pay/shared';
import { generateFinancialInsights, draftInvoiceDescription } from '../services/ai';

export const aiRoutes = new Hono<{ Variables: AuthVariables }>();

function getSupabase(authHeader: string) {
  return createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_ANON_KEY!,
    { global: { headers: { Authorization: authHeader } } }
  );
}

interface InvoiceRow {
  status: string;
  total: number;
  paid_at: string | null;
  created_at: string;
}

aiRoutes.post('/insights', async (c) => {
  const userId = c.get('userId');
  const body = await c.req.json();

  const parsed = aiInsightsRequestSchema.safeParse(body);
  if (!parsed.success) {
    return c.json({ error: 'Validation failed', details: parsed.error.flatten() }, 400);
  }

  const supabase = getSupabase(c.req.header('Authorization') || '');
  const { data: subscription } = await supabase
    .from('subscriptions')
    .select('plan')
    .eq('user_id', userId)
    .single();

  const sub = subscription as Record<string, unknown> | null;
  if (!sub || sub.plan === 'free') {
    return c.json({ error: 'AI insights require Pro or Enterprise plan' }, 403);
  }

  const { data: rawInvoices } = await supabase
    .from('invoices')
    .select('status, total, paid_at, created_at')
    .eq('user_id', userId);

  const invoices = (rawInvoices || []) as InvoiceRow[];
  if (invoices.length === 0) {
    return c.json({ error: 'Not enough data for AI analysis' }, 400);
  }

  const total_revenue = invoices.filter((i) => i.status === 'paid').reduce((s, i) => s + i.total, 0);
  const outstanding_amount = invoices.filter((i) => i.status === 'sent').reduce((s, i) => s + i.total, 0);
  const overdue_amount = invoices.filter((i) => i.status === 'overdue').reduce((s, i) => s + i.total, 0);

  const monthlyMap = new Map<string, number>();
  const now = new Date();
  for (let i = 11; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    monthlyMap.set(key, 0);
  }
  invoices
    .filter((i) => i.status === 'paid' && i.paid_at)
    .forEach((i) => {
      const d = new Date(i.paid_at!);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      if (monthlyMap.has(key)) monthlyMap.set(key, (monthlyMap.get(key) || 0) + i.total);
    });

  const stats: DashboardStats = {
    total_revenue,
    outstanding_amount,
    overdue_amount,
    total_invoices: invoices.length,
    paid_invoices: invoices.filter((i) => i.status === 'paid').length,
    pending_invoices: invoices.filter((i) => i.status === 'sent').length,
    overdue_invoices: invoices.filter((i) => i.status === 'overdue').length,
    monthly_revenue: Array.from(monthlyMap.entries()).map(([month, amount]) => ({ month, amount })),
  };

  const insights = await generateFinancialInsights(stats);
  return c.json(insights);
});

aiRoutes.post('/draft-description', async (c) => {
  const userId = c.get('userId');
  const body = await c.req.json();

  const parsed = aiDraftRequestSchema.safeParse(body);
  if (!parsed.success) {
    return c.json({ error: 'Validation failed', details: parsed.error.flatten() }, 400);
  }

  const supabase = getSupabase(c.req.header('Authorization') || '');
  const { data: subscription } = await supabase
    .from('subscriptions')
    .select('plan')
    .eq('user_id', userId)
    .single();

  const sub = subscription as Record<string, unknown> | null;
  if (!sub || sub.plan === 'free') {
    return c.json({ error: 'AI drafting requires Pro or Enterprise plan' }, 403);
  }

  const result = await draftInvoiceDescription(parsed.data.brief, parsed.data.context);
  return c.json(result);
});
