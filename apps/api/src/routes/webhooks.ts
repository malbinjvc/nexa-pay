import { Hono } from 'hono';
import { createClient } from '@supabase/supabase-js';
import { constructWebhookEvent } from '../services/stripe';
import { sendPaymentConfirmationEmail } from '../services/email';

export const webhooksRoutes = new Hono();

function getSupabaseAdmin() {
  return createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}

webhooksRoutes.post('/', async (c) => {
  const signature = c.req.header('stripe-signature');
  if (!signature) return c.json({ error: 'Missing signature' }, 400);

  const rawBody = await c.req.text();

  let event;
  try {
    event = constructWebhookEvent(rawBody, signature);
  } catch {
    return c.json({ error: 'Invalid signature' }, 400);
  }

  const supabase = getSupabaseAdmin();

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as unknown as Record<string, unknown>;

      // Handle invoice payment
      if (session.mode === 'payment' && session.metadata) {
        const metadata = session.metadata as Record<string, string>;
        const invoiceId = metadata.invoice_id;
        if (invoiceId) {
          const { data: rawInvoice } = await supabase
            .from('invoices')
            .select('*, clients(name, email)')
            .eq('id', invoiceId)
            .single();

          const invoice = rawInvoice as Record<string, unknown> | null;

          if (invoice) {
            await supabase
              .from('invoices')
              .update({
                status: 'paid',
                paid_at: new Date().toISOString(),
                stripe_payment_intent_id: session.payment_intent as string,
              })
              .eq('id', invoiceId);

            await supabase.from('payments').insert({
              user_id: invoice.user_id as string,
              invoice_id: invoiceId,
              stripe_payment_intent_id: (session.payment_intent as string) || '',
              amount: invoice.total as number,
              currency: 'usd',
              status: 'succeeded',
              paid_at: new Date().toISOString(),
            });

            const client = invoice.clients as { name: string; email: string } | null;
            if (client?.email) {
              await sendPaymentConfirmationEmail(
                client.email,
                client.name,
                invoice.invoice_number as string,
                invoice.total as number
              );
            }
          }
        }
      }

      // Handle subscription checkout
      if (session.mode === 'subscription') {
        const customerId = session.customer as string;

        const { data: rawProfile } = await supabase
          .from('profiles')
          .select('id')
          .eq('stripe_customer_id', customerId)
          .single();

        const profile = rawProfile as Record<string, unknown> | null;

        if (profile) {
          const subscriptionId = session.subscription as string;
          await supabase
            .from('subscriptions')
            .update({
              stripe_subscription_id: subscriptionId,
              status: 'active',
            })
            .eq('user_id', profile.id as string);
        }
      }
      break;
    }

    case 'customer.subscription.updated': {
      const subscription = event.data.object as unknown as Record<string, unknown>;
      const items = subscription.items as { data: Array<{ price: { id: string } }> };
      const priceId = items?.data?.[0]?.price?.id;

      let plan = 'free';
      if (priceId === process.env.STRIPE_PRO_PRICE_ID) plan = 'pro';
      if (priceId === process.env.STRIPE_ENTERPRISE_PRICE_ID) plan = 'enterprise';

      await supabase
        .from('subscriptions')
        .update({
          plan,
          status: subscription.status as string,
          current_period_start: new Date(
            (subscription.current_period_start as number) * 1000
          ).toISOString(),
          current_period_end: new Date(
            (subscription.current_period_end as number) * 1000
          ).toISOString(),
        })
        .eq('stripe_subscription_id', subscription.id as string);
      break;
    }

    case 'customer.subscription.deleted': {
      const subscription = event.data.object as unknown as Record<string, unknown>;
      await supabase
        .from('subscriptions')
        .update({ plan: 'free', status: 'canceled', stripe_subscription_id: null })
        .eq('stripe_subscription_id', subscription.id as string);
      break;
    }
  }

  return c.json({ received: true });
});
