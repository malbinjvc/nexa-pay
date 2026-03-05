import { Resend } from 'resend';
import { formatCurrency, formatDate } from '@nexa-pay/shared';

const resend = new Resend(process.env.RESEND_API_KEY || '');
const fromEmail = process.env.RESEND_FROM_EMAIL || 'invoices@nexapay.com';

interface SendInvoiceEmailParams {
  to: string;
  clientName: string;
  invoiceNumber: string;
  total: number;
  dueDate: string;
  paymentUrl: string;
  senderName: string;
}

export async function sendInvoiceEmail(params: SendInvoiceEmailParams): Promise<void> {
  const { to, clientName, invoiceNumber, total, dueDate, paymentUrl, senderName } = params;

  await resend.emails.send({
    from: fromEmail,
    to,
    subject: `Invoice ${invoiceNumber} from ${senderName}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #1a1a1a;">New Invoice from ${senderName}</h2>
        <p>Hi ${clientName},</p>
        <p>You have a new invoice waiting for payment.</p>
        <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p style="margin: 4px 0;"><strong>Invoice:</strong> ${invoiceNumber}</p>
          <p style="margin: 4px 0;"><strong>Amount:</strong> ${formatCurrency(total)}</p>
          <p style="margin: 4px 0;"><strong>Due Date:</strong> ${formatDate(dueDate)}</p>
        </div>
        <a href="${paymentUrl}"
           style="display: inline-block; background: #6366f1; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">
          Pay Now
        </a>
        <p style="color: #666; margin-top: 24px; font-size: 14px;">
          Powered by NexaPay
        </p>
      </div>
    `,
  });
}

export async function sendPaymentConfirmationEmail(
  to: string,
  clientName: string,
  invoiceNumber: string,
  amount: number
): Promise<void> {
  await resend.emails.send({
    from: fromEmail,
    to,
    subject: `Payment received for ${invoiceNumber}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #1a1a1a;">Payment Confirmed</h2>
        <p>Hi ${clientName},</p>
        <p>We've received your payment of <strong>${formatCurrency(amount)}</strong> for invoice <strong>${invoiceNumber}</strong>.</p>
        <p>Thank you for your prompt payment!</p>
        <p style="color: #666; margin-top: 24px; font-size: 14px;">
          Powered by NexaPay
        </p>
      </div>
    `,
  });
}
