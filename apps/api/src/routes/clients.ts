import { Hono } from 'hono';
import { createClient } from '@supabase/supabase-js';
import { createClientSchema, updateClientSchema } from '@nexa-pay/shared';
import type { Client } from '@nexa-pay/shared';
import type { AuthVariables } from '../middleware/auth';
import { invalidateCache } from '../services/cache';

export const clientsRoutes = new Hono<{ Variables: AuthVariables }>();

function getSupabase(authHeader: string) {
  return createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_ANON_KEY!,
    { global: { headers: { Authorization: authHeader } } }
  );
}

// List clients
clientsRoutes.get('/', async (c) => {
  const supabase = getSupabase(c.req.header('Authorization') || '');
  const userId = c.get('userId');

  const { data, error } = await supabase
    .from('clients')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) { console.error('DB error:', error.message); return c.json({ error: 'An internal error occurred' }, 500); }
  return c.json(data as Client[]);
});

// Get client by ID
clientsRoutes.get('/:id', async (c) => {
  const supabase = getSupabase(c.req.header('Authorization') || '');
  const userId = c.get('userId');
  const id = c.req.param('id');

  const { data: client, error } = await supabase
    .from('clients')
    .select('*')
    .eq('id', id)
    .eq('user_id', userId)
    .single();

  if (error || !client) return c.json({ error: 'Client not found' }, 404);

  const { count } = await supabase
    .from('invoices')
    .select('*', { count: 'exact', head: true })
    .eq('client_id', id);

  return c.json({ ...client, invoice_count: count || 0 });
});

// Create client
clientsRoutes.post('/', async (c) => {
  const supabase = getSupabase(c.req.header('Authorization') || '');
  const userId = c.get('userId');
  const body = await c.req.json();

  const parsed = createClientSchema.safeParse(body);
  if (!parsed.success) {
    return c.json({ error: 'Validation failed', details: parsed.error.flatten() }, 400);
  }

  const { data, error } = await supabase
    .from('clients')
    .insert({ ...parsed.data, user_id: userId })
    .select()
    .single();

  if (error) { console.error('DB error:', error.message); return c.json({ error: 'An internal error occurred' }, 500); }

  await invalidateCache(`clients:${userId}*`);
  return c.json(data, 201);
});

// Update client
clientsRoutes.put('/:id', async (c) => {
  const supabase = getSupabase(c.req.header('Authorization') || '');
  const userId = c.get('userId');
  const id = c.req.param('id');
  const body = await c.req.json();

  const parsed = updateClientSchema.safeParse(body);
  if (!parsed.success) {
    return c.json({ error: 'Validation failed', details: parsed.error.flatten() }, 400);
  }

  const { data, error } = await supabase
    .from('clients')
    .update(parsed.data)
    .eq('id', id)
    .eq('user_id', userId)
    .select()
    .single();

  if (error) { console.error('DB error:', error.message); return c.json({ error: 'An internal error occurred' }, 500); }
  if (!data) return c.json({ error: 'Client not found' }, 404);

  await invalidateCache(`clients:${userId}*`);
  return c.json(data);
});

// Delete client
clientsRoutes.delete('/:id', async (c) => {
  const supabase = getSupabase(c.req.header('Authorization') || '');
  const userId = c.get('userId');
  const id = c.req.param('id');

  const { count } = await supabase
    .from('invoices')
    .select('*', { count: 'exact', head: true })
    .eq('client_id', id);

  if (count && count > 0) {
    return c.json({ error: 'Cannot delete client with existing invoices' }, 400);
  }

  const { error } = await supabase
    .from('clients')
    .delete()
    .eq('id', id)
    .eq('user_id', userId);

  if (error) { console.error('DB error:', error.message); return c.json({ error: 'An internal error occurred' }, 500); }

  await invalidateCache(`clients:${userId}*`);
  return c.json({ success: true });
});
