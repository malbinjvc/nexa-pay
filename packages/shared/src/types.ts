export interface Profile {
  id: string;
  full_name: string;
  company_name: string | null;
  email: string;
  avatar_url: string | null;
  stripe_customer_id: string | null;
  created_at: string;
  updated_at: string;
}

export type PlanTier = 'free' | 'pro' | 'enterprise';
export type SubscriptionStatus = 'active' | 'canceled' | 'past_due' | 'trialing';

export interface Subscription {
  id: string;
  user_id: string;
  stripe_subscription_id: string | null;
  plan: PlanTier;
  status: SubscriptionStatus;
  current_period_start: string | null;
  current_period_end: string | null;
  created_at: string;
  updated_at: string;
}

export interface Client {
  id: string;
  user_id: string;
  name: string;
  email: string;
  company: string | null;
  phone: string | null;
  address: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export type InvoiceStatus = 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';

export interface Invoice {
  id: string;
  user_id: string;
  client_id: string;
  invoice_number: string;
  status: InvoiceStatus;
  issue_date: string;
  due_date: string;
  subtotal: number;
  tax_rate: number;
  tax_amount: number;
  discount_amount: number;
  total: number;
  notes: string | null;
  stripe_payment_intent_id: string | null;
  stripe_checkout_session_id: string | null;
  paid_at: string | null;
  sent_at: string | null;
  created_at: string;
  updated_at: string;
  client?: Client;
  items?: InvoiceItem[];
}

export interface InvoiceItem {
  id: string;
  invoice_id: string;
  description: string;
  quantity: number;
  unit_price: number;
  amount: number;
  sort_order: number;
  created_at: string;
}

export type PaymentStatus = 'succeeded' | 'pending' | 'failed';

export interface Payment {
  id: string;
  user_id: string;
  invoice_id: string;
  stripe_payment_intent_id: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  paid_at: string;
  created_at: string;
}

export interface DashboardStats {
  total_revenue: number;
  outstanding_amount: number;
  overdue_amount: number;
  total_invoices: number;
  paid_invoices: number;
  pending_invoices: number;
  overdue_invoices: number;
  monthly_revenue: { month: string; amount: number }[];
}

export interface AIInsight {
  cash_flow_score: number;
  summary: string;
  predictions: string[];
  recommendations: string[];
}

export interface AIDraftResponse {
  description: string;
}
