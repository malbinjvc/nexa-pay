import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { secureHeaders } from 'hono/secure-headers';
import { logger } from 'hono/logger';
import { authMiddleware } from './middleware/auth';
import { rateLimitMiddleware } from './middleware/rate-limit';
import { clientsRoutes } from './routes/clients';
import { invoicesRoutes } from './routes/invoices';
import { dashboardRoutes } from './routes/dashboard';
import { aiRoutes } from './routes/ai';
import { stripeRoutes } from './routes/stripe';
import { webhooksRoutes } from './routes/webhooks';

const app = new Hono();

// Global middleware
app.use('*', logger());
app.use('*', secureHeaders());
app.use(
  '*',
  cors({
    origin: process.env.WEB_URL || 'http://localhost:3000',
    credentials: true,
  })
);

// Health check
app.get('/health', (c) => c.json({ status: 'ok', timestamp: new Date().toISOString() }));

// Stripe webhooks (raw body needed, no auth)
app.route('/api/stripe/webhooks', webhooksRoutes);

// Rate limiting + auth for all API routes
app.use('/api/*', rateLimitMiddleware);
app.use('/api/*', authMiddleware);

// API routes
app.route('/api/clients', clientsRoutes);
app.route('/api/invoices', invoicesRoutes);
app.route('/api/dashboard', dashboardRoutes);
app.route('/api/ai', aiRoutes);
app.route('/api/stripe', stripeRoutes);

const port = parseInt(process.env.PORT || '8787', 10);

console.log(`NexaPay API running on port ${port}`);

serve({ fetch: app.fetch, port });

export default app;
