import Stripe from 'stripe';

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '');

export async function createCustomer(email: string, name: string): Promise<string> {
  const customer = await stripe.customers.create({ email, name });
  return customer.id;
}

export async function createCheckoutSession(
  customerId: string,
  priceId: string,
  successUrl: string,
  cancelUrl: string
): Promise<string> {
  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: 'subscription',
    payment_method_types: ['card'],
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: successUrl,
    cancel_url: cancelUrl,
  });
  return session.url || '';
}

export async function createBillingPortalSession(
  customerId: string,
  returnUrl: string
): Promise<string> {
  const session = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: returnUrl,
  });
  return session.url;
}

export async function createInvoiceCheckoutSession(
  invoiceId: string,
  amount: number,
  currency: string,
  customerEmail: string,
  successUrl: string,
  cancelUrl: string
): Promise<Stripe.Checkout.Session> {
  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    payment_method_types: ['card'],
    customer_email: customerEmail,
    line_items: [
      {
        price_data: {
          currency,
          unit_amount: amount,
          product_data: { name: `Invoice ${invoiceId}` },
        },
        quantity: 1,
      },
    ],
    metadata: { invoice_id: invoiceId },
    success_url: successUrl,
    cancel_url: cancelUrl,
  });
  return session;
}

export function constructWebhookEvent(
  body: string,
  signature: string
): Stripe.Event {
  return stripe.webhooks.constructEvent(
    body,
    signature,
    process.env.STRIPE_WEBHOOK_SECRET || ''
  );
}
