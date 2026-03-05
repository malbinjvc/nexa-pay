export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          full_name: string;
          company_name: string | null;
          email: string;
          avatar_url: string | null;
          stripe_customer_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          full_name: string;
          company_name?: string | null;
          email: string;
          avatar_url?: string | null;
          stripe_customer_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          full_name?: string;
          company_name?: string | null;
          email?: string;
          avatar_url?: string | null;
          stripe_customer_id?: string | null;
          updated_at?: string;
        };
      };
      subscriptions: {
        Row: {
          id: string;
          user_id: string;
          stripe_subscription_id: string | null;
          plan: 'free' | 'pro' | 'enterprise';
          status: 'active' | 'canceled' | 'past_due' | 'trialing';
          current_period_start: string | null;
          current_period_end: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          stripe_subscription_id?: string | null;
          plan?: 'free' | 'pro' | 'enterprise';
          status?: 'active' | 'canceled' | 'past_due' | 'trialing';
          current_period_start?: string | null;
          current_period_end?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          user_id?: string;
          stripe_subscription_id?: string | null;
          plan?: 'free' | 'pro' | 'enterprise';
          status?: 'active' | 'canceled' | 'past_due' | 'trialing';
          current_period_start?: string | null;
          current_period_end?: string | null;
          updated_at?: string;
        };
      };
      clients: {
        Row: {
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
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          email: string;
          company?: string | null;
          phone?: string | null;
          address?: string | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          name?: string;
          email?: string;
          company?: string | null;
          phone?: string | null;
          address?: string | null;
          notes?: string | null;
          updated_at?: string;
        };
      };
      invoices: {
        Row: {
          id: string;
          user_id: string;
          client_id: string;
          invoice_number: string;
          status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
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
        };
        Insert: {
          id?: string;
          user_id: string;
          client_id: string;
          invoice_number: string;
          status?: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
          issue_date: string;
          due_date: string;
          subtotal: number;
          tax_rate?: number;
          tax_amount?: number;
          discount_amount?: number;
          total: number;
          notes?: string | null;
          stripe_payment_intent_id?: string | null;
          stripe_checkout_session_id?: string | null;
          paid_at?: string | null;
          sent_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          client_id?: string;
          invoice_number?: string;
          status?: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
          issue_date?: string;
          due_date?: string;
          subtotal?: number;
          tax_rate?: number;
          tax_amount?: number;
          discount_amount?: number;
          total?: number;
          notes?: string | null;
          stripe_payment_intent_id?: string | null;
          stripe_checkout_session_id?: string | null;
          paid_at?: string | null;
          sent_at?: string | null;
          updated_at?: string;
        };
      };
      invoice_items: {
        Row: {
          id: string;
          invoice_id: string;
          description: string;
          quantity: number;
          unit_price: number;
          amount: number;
          sort_order: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          invoice_id: string;
          description: string;
          quantity: number;
          unit_price: number;
          amount: number;
          sort_order?: number;
          created_at?: string;
        };
        Update: {
          description?: string;
          quantity?: number;
          unit_price?: number;
          amount?: number;
          sort_order?: number;
        };
      };
      payments: {
        Row: {
          id: string;
          user_id: string;
          invoice_id: string;
          stripe_payment_intent_id: string;
          amount: number;
          currency: string;
          status: 'succeeded' | 'pending' | 'failed';
          paid_at: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          invoice_id: string;
          stripe_payment_intent_id: string;
          amount: number;
          currency?: string;
          status?: 'succeeded' | 'pending' | 'failed';
          paid_at: string;
          created_at?: string;
        };
        Update: {
          status?: 'succeeded' | 'pending' | 'failed';
        };
      };
    };
  };
}
