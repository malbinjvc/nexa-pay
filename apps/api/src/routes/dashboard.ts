import { Hono } from 'hono';
import { createClient } from '@supabase/supabase-js';
import type { AuthVariables } from '../middleware/auth';
import type { DashboardStats } from '@nexa-pay/shared';
import { getCached, setCache } from '../services/cache';
import { CACHE_TTL } from '@nexa-pay/shared';

export const dashboardRoutes = new Hono<{ Variables: AuthVariables }>();

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

dashboardRoutes.get('/stats', async (c) => {
  const userId = c.get('userId');
  const cacheKey = `dashboard:${userId}:stats`;

  const cached = await getCached<DashboardStats>(cacheKey);
  if (cached) return c.json(cached);

  const supabase = getSupabase(c.req.header('Authorization') || '');

  const { data: rawInvoices } = await supabase
    .from('invoices')
    .select('status, total, paid_at, created_at')
    .eq('user_id', userId);

  const invoices = (rawInvoices || []) as InvoiceRow[];

  const total_revenue = invoices
    .filter((i) => i.status === 'paid')
    .reduce((sum, i) => sum + i.total, 0);

  const outstanding_amount = invoices
    .filter((i) => i.status === 'sent')
    .reduce((sum, i) => sum + i.total, 0);

  const overdue_amount = invoices
    .filter((i) => i.status === 'overdue')
    .reduce((sum, i) => sum + i.total, 0);

  const total_invoices = invoices.length;
  const paid_invoices = invoices.filter((i) => i.status === 'paid').length;
  const pending_invoices = invoices.filter((i) => i.status === 'sent').length;
  const overdue_invoices = invoices.filter((i) => i.status === 'overdue').length;

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
      if (monthlyMap.has(key)) {
        monthlyMap.set(key, (monthlyMap.get(key) || 0) + i.total);
      }
    });

  const monthly_revenue = Array.from(monthlyMap.entries()).map(([month, amount]) => ({
    month,
    amount,
  }));

  const stats: DashboardStats = {
    total_revenue,
    outstanding_amount,
    overdue_amount,
    total_invoices,
    paid_invoices,
    pending_invoices,
    overdue_invoices,
    monthly_revenue,
  };

  await setCache(cacheKey, stats, CACHE_TTL.dashboard);
  return c.json(stats);
});
