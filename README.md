# NexaPay - AI-Powered Invoice & Payment Platform

A full-stack SaaS platform for freelancers and small businesses to create, send, and manage invoices with integrated Stripe payments and AI-powered financial insights.

## Tech Stack

- **Monorepo:** Turborepo
- **API:** Hono (TypeScript) with Zod validation
- **Frontend:** Nuxt.js 3 (Vue 3 SSR) + Tailwind CSS
- **Database:** Supabase (PostgreSQL + Row Level Security)
- **Auth:** Supabase Auth (magic link + Google/GitHub OAuth)
- **Payments:** Stripe (subscriptions + checkout + webhooks)
- **Email:** Resend (transactional invoices)
- **Caching:** Upstash Redis (HTTP-based)
- **AI:** Mistral AI (financial insights + invoice drafting)
- **Testing:** Cypress (E2E)
- **CI/CD:** GitHub Actions
- **Containerization:** Docker

## Features

- Magic link and social OAuth authentication
- Stripe-powered subscription plans (Free / Pro / Enterprise)
- Client management with contact details
- Professional invoice creation with line items, taxes, and discounts
- Email invoices with "Pay Now" links via Resend
- Accept online payments through Stripe Checkout
- Revenue dashboard with Chart.js visualizations
- AI-powered cash flow analysis and predictions (Mistral)
- AI-drafted invoice descriptions from brief notes

## Project Structure

```
nexa-pay/
├── packages/
│   ├── shared/          # Types, schemas, utilities
│   └── db/              # Supabase client & migrations
├── apps/
│   ├── api/             # Hono REST API
│   ├── web/             # Nuxt.js 3 frontend
│   └── e2e/             # Cypress tests
```

## Getting Started

### Prerequisites

- Node.js >= 20
- npm >= 10
- Supabase project
- Stripe account
- Resend account
- Upstash Redis instance
- Mistral AI API key

### Setup

```bash
# Install dependencies
npm install

# Copy environment variables
cp .env.example .env
# Fill in your API keys in .env

# Run Supabase migration
# Copy packages/db/src/migrations/001_initial.sql to Supabase SQL editor

# Development
npm run dev

# Build
npm run build

# Type check
npm run typecheck
```

### Docker

```bash
docker compose up --build
```

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | /api/clients | List clients |
| POST | /api/clients | Create client |
| GET | /api/clients/:id | Get client |
| PUT | /api/clients/:id | Update client |
| DELETE | /api/clients/:id | Delete client |
| GET | /api/invoices | List invoices |
| POST | /api/invoices | Create invoice |
| GET | /api/invoices/:id | Get invoice |
| PUT | /api/invoices/:id | Update invoice |
| DELETE | /api/invoices/:id | Delete invoice |
| POST | /api/invoices/:id/send | Send invoice email |
| POST | /api/invoices/:id/mark-paid | Mark as paid |
| GET | /api/dashboard/stats | Dashboard statistics |
| POST | /api/ai/insights | AI financial insights |
| POST | /api/ai/draft-description | AI invoice drafting |
| POST | /api/stripe/checkout | Create checkout session |
| POST | /api/stripe/portal | Billing portal |
| POST | /api/stripe/webhooks | Stripe webhooks |

## Security

- Supabase Row Level Security on all tables
- Stripe webhook signature verification
- Zod input validation on all endpoints
- Upstash Redis rate limiting
- Secure headers + CORS via Hono middleware
- AI prompt injection defense
- Money stored as integers (cents)
- Docker multi-stage builds with non-root users

## License

MIT
