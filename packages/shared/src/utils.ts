export function formatCurrency(cents: number, currency = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(cents / 100);
}

export function formatDate(dateString: string): string {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(new Date(dateString));
}

export function calculateInvoiceTotal(
  items: { quantity: number; unit_price: number }[],
  taxRate: number,
  discountAmount: number
): { subtotal: number; tax_amount: number; total: number } {
  const subtotal = items.reduce(
    (sum, item) => sum + Math.round(item.quantity * item.unit_price),
    0
  );
  const tax_amount = Math.round(subtotal * (taxRate / 100));
  const total = subtotal + tax_amount - discountAmount;
  return { subtotal, tax_amount, total: Math.max(0, total) };
}

export function generateInvoiceNumber(): string {
  const now = new Date();
  const year = now.getFullYear().toString().slice(-2);
  const month = (now.getMonth() + 1).toString().padStart(2, '0');
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `INV-${year}${month}-${random}`;
}

export function isOverdue(dueDate: string, status: string): boolean {
  if (status === 'paid' || status === 'cancelled' || status === 'draft') return false;
  return new Date(dueDate) < new Date();
}

export function sanitizeForAI(input: string): string {
  return input
    .replace(/[<>{}]/g, '')
    .replace(/\b(ignore|forget|disregard|override|system|prompt)\b/gi, '')
    .trim()
    .slice(0, 1000);
}
