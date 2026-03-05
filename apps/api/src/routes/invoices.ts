import { Hono } from 'hono';
import { createClient } from '@supabase/supabase-js';
import {
  createInvoiceSchema,
  updateInvoiceSchema,
  calculateInvoiceTotal,
  generateInvoiceNumber,
} from '@nexa-pay/shared';
import type { AuthVariables } from '../middleware/auth';
import { invalidateCache } from '../services/cache';
import { sendInvoiceEmail } from '../services/email';
import { createInvoiceCheckoutSession } from '../services/stripe';

export const invoicesRoutes = new Hono<{ Variables: AuthVariables }>();

function getSupabase(authHeader: string) {
  return createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_ANON_KEY!,
    { global: { headers: { Authorization: authHeader } } }
  );
}

// List invoices with optional status filter + pagination
invoicesRoutes.get('/', async (c) => {
  const supabase = getSupabase(c.req.header('Authorization') || '');
  const userId = c.get('userId');
  const status = c.req.query('status');
  const page = parseInt(c.req.query('page') || '1', 10);
  const limit = parseInt(c.req.query('limit') || '20', 10);
  const offset = (page - 1) * limit;

  let query = supabase
    .from('invoices')
    .select('*, clients(name, email)', { count: 'exact' })
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (status) {
    query = query.eq('status', status);
  }

  const { data, error, count } = await query;

  if (error) return c.json({ error: error.message }, 500);
  return c.json({ data, total: count || 0, page, limit });
});

// Get invoice by ID with items + client
invoicesRoutes.get('/:id', async (c) => {
  const supabase = getSupabase(c.req.header('Authorization') || '');
  const userId = c.get('userId');
  const id = c.req.param('id');

  const { data: invoice, error } = await supabase
    .from('invoices')
    .select('*, clients(*), invoice_items(*)')
    .eq('id', id)
    .eq('user_id', userId)
    .single();

  if (error || !invoice) return c.json({ error: 'Invoice not found' }, 404);
  return c.json(invoice);
});

// Create invoice with line items
invoicesRoutes.post('/', async (c) => {
  const supabase = getSupabase(c.req.header('Authorization') || '');
  const userId = c.get('userId');
  const body = await c.req.json();

  const parsed = createInvoiceSchema.safeParse(body);
  if (!parsed.success) {
    return c.json({ error: 'Validation failed', details: parsed.error.flatten() }, 400);
  }

  const { items, ...invoiceData } = parsed.data;
  const totals = calculateInvoiceTotal(items, invoiceData.tax_rate, invoiceData.discount_amount);

  const { data: invoice, error: invoiceError } = await supabase
    .from('invoices')
    .insert({
      ...invoiceData,
      user_id: userId,
      invoice_number: generateInvoiceNumber(),
      subtotal: totals.subtotal,
      tax_amount: totals.tax_amount,
      total: totals.total,
    })
    .select()
    .single();

  if (invoiceError || !invoice) {
    return c.json({ error: invoiceError?.message || 'Failed to create invoice' }, 500);
  }

  const invoiceItems = items.map((item, index) => ({
    invoice_id: (invoice as Record<string, unknown>).id as string,
    description: item.description,
    quantity: item.quantity,
    unit_price: item.unit_price,
    amount: Math.round(item.quantity * item.unit_price),
    sort_order: index,
  }));

  const { error: itemsError } = await supabase.from('invoice_items').insert(invoiceItems);

  if (itemsError) {
    return c.json({ error: itemsError.message }, 500);
  }

  await invalidateCache(`dashboard:${userId}*`);
  return c.json(invoice, 201);
});

// Update draft invoice
invoicesRoutes.put('/:id', async (c) => {
  const supabase = getSupabase(c.req.header('Authorization') || '');
  const userId = c.get('userId');
  const id = c.req.param('id');
  const body = await c.req.json();

  const { data: existing } = await supabase
    .from('invoices')
    .select('status')
    .eq('id', id)
    .eq('user_id', userId)
    .single();

  if (!existing) return c.json({ error: 'Invoice not found' }, 404);
  if ((existing as Record<string, unknown>).status !== 'draft') {
    return c.json({ error: 'Only draft invoices can be edited' }, 400);
  }

  const parsed = updateInvoiceSchema.safeParse(body);
  if (!parsed.success) {
    return c.json({ error: 'Validation failed', details: parsed.error.flatten() }, 400);
  }

  const { items, ...updateFields } = parsed.data;
  const updateData: Record<string, unknown> = { ...updateFields };

  if (items) {
    const totals = calculateInvoiceTotal(
      items,
      (updateFields.tax_rate as number) ?? 0,
      (updateFields.discount_amount as number) ?? 0
    );
    updateData.subtotal = totals.subtotal;
    updateData.tax_amount = totals.tax_amount;
    updateData.total = totals.total;

    await supabase.from('invoice_items').delete().eq('invoice_id', id);
    const newItems = items.map((item, index) => ({
      invoice_id: id,
      description: item.description,
      quantity: item.quantity,
      unit_price: item.unit_price,
      amount: Math.round(item.quantity * item.unit_price),
      sort_order: index,
    }));
    await supabase.from('invoice_items').insert(newItems);
  }

  const { data, error } = await supabase
    .from('invoices')
    .update(updateData)
    .eq('id', id)
    .eq('user_id', userId)
    .select()
    .single();

  if (error) return c.json({ error: error.message }, 500);

  await invalidateCache(`dashboard:${userId}*`);
  return c.json(data);
});

// Delete draft invoice
invoicesRoutes.delete('/:id', async (c) => {
  const supabase = getSupabase(c.req.header('Authorization') || '');
  const userId = c.get('userId');
  const id = c.req.param('id');

  const { data: existing } = await supabase
    .from('invoices')
    .select('status')
    .eq('id', id)
    .eq('user_id', userId)
    .single();

  if (!existing) return c.json({ error: 'Invoice not found' }, 404);
  if ((existing as Record<string, unknown>).status !== 'draft') {
    return c.json({ error: 'Only draft invoices can be deleted' }, 400);
  }

  const { error } = await supabase.from('invoices').delete().eq('id', id).eq('user_id', userId);
  if (error) return c.json({ error: error.message }, 500);

  await invalidateCache(`dashboard:${userId}*`);
  return c.json({ success: true });
});

// Send invoice via email
invoicesRoutes.post('/:id/send', async (c) => {
  const supabase = getSupabase(c.req.header('Authorization') || '');
  const userId = c.get('userId');
  const id = c.req.param('id');

  const { data: invoice } = await supabase
    .from('invoices')
    .select('*, clients(name, email)')
    .eq('id', id)
    .eq('user_id', userId)
    .single();

  if (!invoice) return c.json({ error: 'Invoice not found' }, 404);

  const inv = invoice as Record<string, unknown>;
  if (inv.status === 'paid' || inv.status === 'cancelled') {
    return c.json({ error: 'Cannot send a paid or cancelled invoice' }, 400);
  }

  const client = inv.clients as { name: string; email: string };

  const session = await createInvoiceCheckoutSession(
    id,
    inv.total as number,
    'usd',
    client.email,
    `${process.env.WEB_URL}/invoices/${id}?payment=success`,
    `${process.env.WEB_URL}/invoices/${id}?payment=cancelled`
  );

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name')
    .eq('id', userId)
    .single();

  await sendInvoiceEmail({
    to: client.email,
    clientName: client.name,
    invoiceNumber: inv.invoice_number as string,
    total: inv.total as number,
    dueDate: inv.due_date as string,
    paymentUrl: session.url || '',
    senderName: (profile as Record<string, unknown>)?.full_name as string || 'NexaPay User',
  });

  await supabase
    .from('invoices')
    .update({
      status: 'sent',
      sent_at: new Date().toISOString(),
      stripe_checkout_session_id: session.id,
    })
    .eq('id', id);

  await invalidateCache(`dashboard:${userId}*`);
  return c.json({ success: true, message: 'Invoice sent' });
});

// Mark invoice as paid manually
invoicesRoutes.post('/:id/mark-paid', async (c) => {
  const supabase = getSupabase(c.req.header('Authorization') || '');
  const userId = c.get('userId');
  const id = c.req.param('id');

  const { data: invoice } = await supabase
    .from('invoices')
    .select('status, total')
    .eq('id', id)
    .eq('user_id', userId)
    .single();

  if (!invoice) return c.json({ error: 'Invoice not found' }, 404);
  const inv = invoice as Record<string, unknown>;
  if (inv.status === 'paid') return c.json({ error: 'Invoice already paid' }, 400);

  const { data, error } = await supabase
    .from('invoices')
    .update({ status: 'paid', paid_at: new Date().toISOString() })
    .eq('id', id)
    .eq('user_id', userId)
    .select()
    .single();

  if (error) return c.json({ error: error.message }, 500);

  await invalidateCache(`dashboard:${userId}*`);
  return c.json(data);
});
