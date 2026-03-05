import { z } from 'zod';

export const createClientSchema = z.object({
  name: z.string().min(1, 'Name is required').max(255),
  email: z.string().email('Invalid email address'),
  company: z.string().max(255).nullable().optional(),
  phone: z.string().max(50).nullable().optional(),
  address: z.string().max(500).nullable().optional(),
  notes: z.string().max(1000).nullable().optional(),
});

export const updateClientSchema = createClientSchema.partial();

export const invoiceItemSchema = z.object({
  description: z.string().min(1, 'Description is required').max(500),
  quantity: z.number().positive('Quantity must be positive'),
  unit_price: z.number().int().min(0, 'Unit price must be non-negative'),
});

export const createInvoiceSchema = z.object({
  client_id: z.string().uuid('Invalid client ID'),
  issue_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format'),
  due_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format'),
  tax_rate: z.number().min(0).max(100).default(0),
  discount_amount: z.number().int().min(0).default(0),
  notes: z.string().max(2000).nullable().optional(),
  items: z.array(invoiceItemSchema).min(1, 'At least one item is required'),
});

export const updateInvoiceSchema = z.object({
  client_id: z.string().uuid().optional(),
  issue_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  due_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  tax_rate: z.number().min(0).max(100).optional(),
  discount_amount: z.number().int().min(0).optional(),
  notes: z.string().max(2000).nullable().optional(),
  items: z.array(invoiceItemSchema).min(1).optional(),
});

export const aiInsightsRequestSchema = z.object({
  period: z.enum(['30d', '90d', '12m']).default('30d'),
});

export const aiDraftRequestSchema = z.object({
  brief: z.string().min(3, 'Brief must be at least 3 characters').max(500),
  context: z.string().max(1000).optional(),
});

export const aiInsightResponseSchema = z.object({
  cash_flow_score: z.number().min(0).max(100),
  summary: z.string(),
  predictions: z.array(z.string()),
  recommendations: z.array(z.string()),
});

export const aiDraftResponseSchema = z.object({
  description: z.string(),
});

export const checkoutSchema = z.object({
  plan: z.enum(['pro', 'enterprise']),
});

export type CreateClientInput = z.infer<typeof createClientSchema>;
export type UpdateClientInput = z.infer<typeof updateClientSchema>;
export type CreateInvoiceInput = z.infer<typeof createInvoiceSchema>;
export type UpdateInvoiceInput = z.infer<typeof updateInvoiceSchema>;
export type AIInsightsRequest = z.infer<typeof aiInsightsRequestSchema>;
export type AIDraftRequest = z.infer<typeof aiDraftRequestSchema>;
export type CheckoutInput = z.infer<typeof checkoutSchema>;
