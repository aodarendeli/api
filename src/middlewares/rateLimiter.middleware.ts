import rateLimit from 'express-rate-limit';
import { RedisStore } from 'rate-limit-redis';
import { redisClient } from '../config/redis';
import { env } from '../config/env';

export const rateLimiter = rateLimit({
  windowMs: env.RATE_LIMIT_WINDOW_MS,
  max: env.RATE_LIMIT_MAX,
  standardHeaders: true,
  legacyHeaders: false,
  store: new RedisStore({
    // ioredis uses `.call()` to send raw Redis commands
    sendCommand: (...args: string[]) => {
      const [command, ...rest] = args;
      return redisClient.call(
        command as string,
        ...(rest as (string | Buffer | number)[]),
      ) as Promise<number>;
    },
  }),
  keyGenerator: (req) => {
    return req.ip ?? req.headers['x-forwarded-for']?.toString() ?? 'unknown';
  },
  handler(_req, res) {
    res.status(429).json({
      success: false,
      message: 'Too many requests. Please try again later.',
    });
  },
});
