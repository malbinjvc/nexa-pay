import { Hono } from 'hono';
import { createClient } from '@supabase/supabase-js';
import { checkoutSchema } from '@nexa-pay/shared';
import type { AuthVariables } from '../middleware/auth';
import {
  createCustomer,
  createCheckoutSession,
  createBillingPortalSession,
} from '../services/stripe';

export const stripeRoutes = new Hono<{ Variables: AuthVariables }>();

function getSupabaseAdmin() {
  return createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}

function getSupabase(authHeader: string) {
  return createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_ANON_KEY!,
    { global: { headers: { Authorization: authHeader } } }
  );
}

const PRICE_IDS: Record<string, string> = {
  pro: process.env.STRIPE_PRO_PRICE_ID || '',
  enterprise: process.env.STRIPE_ENTERPRISE_PRICE_ID || '',
};

stripeRoutes.post('/checkout', async (c) => {
  const userId = c.get('userId');
  const userEmail = c.get('userEmail');
  const body = await c.req.json();

  const parsed = checkoutSchema.safeParse(body);
  if (!parsed.success) {
    return c.json({ error: 'Validation failed', details: parsed.error.flatten() }, 400);
  }

  const priceId = PRICE_IDS[parsed.data.plan];
  if (!priceId) return c.json({ error: 'Invalid plan' }, 400);

  const supabase = getSupabase(c.req.header('Authorization') || '');
  const { data: profile } = await supabase
    .from('profiles')
    .select('stripe_customer_id, full_name')
    .eq('id', userId)
    .single();

  const prof = profile as Record<string, unknown> | null;
  let customerId = prof?.stripe_customer_id as string | null;

  if (!customerId) {
    customerId = await createCustomer(userEmail, (prof?.full_name as string) || '');
    const adminSupabase = getSupabaseAdmin();
    await adminSupabase
      .from('profiles')
      .update({ stripe_customer_id: customerId })
      .eq('id', userId);
  }

  const url = await createCheckoutSession(
    customerId,
    priceId,
    `${process.env.WEB_URL}/settings?checkout=success`,
    `${process.env.WEB_URL}/pricing?checkout=cancelled`
  );

  return c.json({ url });
});

stripeRoutes.post('/portal', async (c) => {
  const userId = c.get('userId');
  const supabase = getSupabase(c.req.header('Authorization') || '');

  const { data: profile } = await supabase
    .from('profiles')
    .select('stripe_customer_id')
    .eq('id', userId)
    .single();

  const prof = profile as Record<string, unknown> | null;
  if (!prof?.stripe_customer_id) {
    return c.json({ error: 'No billing account found' }, 400);
  }

  const url = await createBillingPortalSession(
    prof.stripe_customer_id as string,
    `${process.env.WEB_URL}/settings`
  );

  return c.json({ url });
});
