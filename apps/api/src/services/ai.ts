import { Mistral } from '@mistralai/mistralai';
import { sanitizeForAI } from '@nexa-pay/shared';
import { aiInsightResponseSchema, aiDraftResponseSchema } from '@nexa-pay/shared';
import type { AIInsight, AIDraftResponse, DashboardStats } from '@nexa-pay/shared';

const client = new Mistral({ apiKey: process.env.MISTRAL_API_KEY || '' });

export async function generateFinancialInsights(stats: DashboardStats): Promise<AIInsight> {
  const prompt = `You are a financial analyst for a freelancer/small business. Analyze these invoice metrics and return JSON only:

Revenue: ${stats.total_revenue / 100} USD
Outstanding: ${stats.outstanding_amount / 100} USD
Overdue: ${stats.overdue_amount / 100} USD
Total invoices: ${stats.total_invoices}
Paid: ${stats.paid_invoices}
Pending: ${stats.pending_invoices}
Overdue count: ${stats.overdue_invoices}
Monthly revenue trend: ${JSON.stringify(stats.monthly_revenue.map((m) => ({ month: m.month, amount: m.amount / 100 })))}

Return ONLY valid JSON with this exact structure:
{
  "cash_flow_score": <0-100 integer>,
  "summary": "<2-3 sentence analysis>",
  "predictions": ["<prediction 1>", "<prediction 2>", "<prediction 3>"],
  "recommendations": ["<recommendation 1>", "<recommendation 2>", "<recommendation 3>"]
}`;

  const response = await client.chat.complete({
    model: 'mistral-small-latest',
    messages: [
      {
        role: 'system',
        content: 'You are a financial analysis AI. Return ONLY valid JSON. No markdown, no explanation.',
      },
      { role: 'user', content: prompt },
    ],
    temperature: 0.3,
    responseFormat: { type: 'json_object' },
  });

  const content = response.choices?.[0]?.message?.content || '{}';
  const text = typeof content === 'string' ? content : '';

  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    console.error('AI returned invalid JSON:', text.slice(0, 200));
    return {
      cash_flow_score: 50,
      summary: 'Unable to generate detailed analysis. Please check your data.',
      predictions: ['Insufficient data for predictions'],
      recommendations: ['Continue tracking your invoices for better insights'],
    };
  }

  const validated = aiInsightResponseSchema.safeParse(parsed);
  if (validated.success) {
    return validated.data;
  }

  return {
    cash_flow_score: 50,
    summary: 'Unable to generate detailed analysis. Please check your data.',
    predictions: ['Insufficient data for predictions'],
    recommendations: ['Continue tracking your invoices for better insights'],
  };
}

export async function draftInvoiceDescription(brief: string, context?: string): Promise<AIDraftResponse> {
  const sanitizedBrief = sanitizeForAI(brief);
  const sanitizedContext = context ? sanitizeForAI(context) : '';

  const prompt = `Write a professional invoice line item description based on this brief: "${sanitizedBrief}"
${sanitizedContext ? `Additional context: ${sanitizedContext}` : ''}

Return ONLY valid JSON with this exact structure:
{"description": "<professional description, 1-2 sentences>"}`;

  const response = await client.chat.complete({
    model: 'mistral-small-latest',
    messages: [
      {
        role: 'system',
        content: 'You are a professional invoice writer. Return ONLY valid JSON. No markdown.',
      },
      { role: 'user', content: prompt },
    ],
    temperature: 0.5,
    responseFormat: { type: 'json_object' },
  });

  const content = response.choices?.[0]?.message?.content || '{}';
  const text = typeof content === 'string' ? content : '';

  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    console.error('AI returned invalid JSON:', text.slice(0, 200));
    return { description: sanitizedBrief };
  }

  const validated = aiDraftResponseSchema.safeParse(parsed);
  if (validated.success) {
    return validated.data;
  }

  return { description: sanitizedBrief };
}
