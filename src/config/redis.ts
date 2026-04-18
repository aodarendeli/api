import IORedis from 'ioredis';
import { env } from './env';
import { logger } from '../utils/logger';

export const redisClient = new IORedis(env.REDIS_URL, {
  maxRetriesPerRequest: 3,
  lazyConnect: true,
  retryStrategy(times) {
    if (times > 5) {
      logger.error('Redis max reconnection attempts reached');
      return null;
    }
    return Math.min(times * 100, 2000);
  },
  reconnectOnError(err) {
    const targetErrors = ['READONLY', 'ECONNRESET'];
    return targetErrors.some((target) => err.message.includes(target));
  },
});

redisClient.on('connect', () => {
  logger.info('Redis connected successfully');
});

redisClient.on('ready', () => {
  logger.debug('Redis client ready');
});

redisClient.on('error', (error: Error) => {
  logger.error({ error: error.message }, 'Redis connection error');
});

redisClient.on('close', () => {
  logger.warn('Redis connection closed');
});

redisClient.on('reconnecting', () => {
  logger.info('Redis reconnecting...');
});

export async function connectRedis(): Promise<void> {
  if (redisClient.status === 'wait') {
    await redisClient.connect();
  }
}

export async function disconnectRedis(): Promise<void> {
  await redisClient.quit();
  logger.info('Redis disconnected');
}
