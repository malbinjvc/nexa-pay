import { createMiddleware } from 'hono/factory';
import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL || '',
  token: process.env.UPSTASH_REDIS_REST_TOKEN || '',
});

interface RateLimitConfig {
  requests: number;
  window: number;
}

async function checkRateLimit(key: string, config: RateLimitConfig): Promise<boolean> {
  try {
    const current = await redis.incr(key);
    if (current === 1) {
      await redis.expire(key, config.window);
    }
    return current <= config.requests;
  } catch {
    // Fail closed: deny request when rate limiter is unavailable
    console.error('Rate limiter unavailable - denying request');
    return false;
  }
}

export const rateLimitMiddleware = createMiddleware(async (c, next) => {
  const ip = c.req.header('x-forwarded-for') || c.req.header('x-real-ip') || 'unknown';
  const path = c.req.path;

  let config: RateLimitConfig = { requests: 100, window: 60 };
  let keyPrefix = 'rl:global';

  if (path.startsWith('/api/ai')) {
    config = { requests: 20, window: 60 };
    keyPrefix = 'rl:ai';
  } else if (path.includes('/auth') || path.includes('/login')) {
    config = { requests: 10, window: 60 };
    keyPrefix = 'rl:auth';
  }

  const key = `${keyPrefix}:${ip}`;
  const allowed = await checkRateLimit(key, config);

  if (!allowed) {
    return c.json({ error: 'Too many requests. Please try again later.' }, 429);
  }

  await next();
});
