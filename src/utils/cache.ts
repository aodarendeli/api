import { redisClient } from '../config/redis';
import { logger } from './logger';
import { env } from '../config/env';

export class CacheService {
  private readonly prefix: string;
  private readonly defaultTTL: number;

  constructor(prefix?: string, ttl?: number) {
    this.prefix = prefix ?? env.APP_CACHE_PREFIX;
    this.defaultTTL = ttl ?? env.REDIS_TTL;
  }

  buildKey(...parts: (string | number)[]): string {
    return [this.prefix, ...parts].join(':');
  }

  async get<T>(key: string): Promise<T | null> {
    try {
      const value = await redisClient.get(key);
      if (value === null) return null;
      return JSON.parse(value) as T;
    } catch (error) {
      logger.warn({ key, error }, 'Cache get failed');
      return null;
    }
  }

  async set(key: string, value: unknown, ttl?: number): Promise<void> {
    try {
      const serialized = JSON.stringify(value);
      const expiry = ttl ?? this.defaultTTL;
      await redisClient.setex(key, expiry, serialized);
    } catch (error) {
      logger.warn({ key, error }, 'Cache set failed');
    }
  }

  async delete(key: string): Promise<void> {
    try {
      await redisClient.del(key);
    } catch (error) {
      logger.warn({ key, error }, 'Cache delete failed');
    }
  }

  async deleteByPattern(pattern: string): Promise<void> {
    try {
      const keys = await this.scanKeys(pattern);
      if (keys.length === 0) return;

      const pipeline = redisClient.pipeline();
      keys.forEach((key) => pipeline.del(key));
      await pipeline.exec();

      logger.debug({ pattern, count: keys.length }, 'Cache keys invalidated by pattern');
    } catch (error) {
      logger.warn({ pattern, error }, 'Cache deleteByPattern failed');
    }
  }

  /**
   * Stale-while-revalidate: returns cached value immediately,
   * revalidates in background when TTL falls below staleThreshold seconds.
   */
  async getOrSet<T>(
    key: string,
    factory: () => Promise<T>,
    ttl?: number,
    staleThreshold?: number,
  ): Promise<T> {
    const cached = await this.get<T>(key);

    if (cached !== null) {
      if (staleThreshold !== undefined) {
        const remainingTTL = await redisClient.ttl(key);
        if (remainingTTL > 0 && remainingTTL < staleThreshold) {
          setImmediate(() => {
            factory()
              .then((data) => this.set(key, data, ttl))
              .catch((err: unknown) =>
                logger.warn({ key, err }, 'Stale-while-revalidate failed'),
              );
          });
        }
      }
      return cached;
    }

    const data = await factory();
    await this.set(key, data, ttl);
    return data;
  }

  async invalidateMany(...keys: string[]): Promise<void> {
    try {
      if (keys.length === 0) return;
      const pipeline = redisClient.pipeline();
      keys.forEach((key) => pipeline.del(key));
      await pipeline.exec();
    } catch (error) {
      logger.warn({ keys, error }, 'Cache invalidateMany failed');
    }
  }

  private async scanKeys(pattern: string): Promise<string[]> {
    const keys: string[] = [];
    let cursor = '0';

    do {
      const [nextCursor, foundKeys] = await redisClient.scan(
        cursor,
        'MATCH',
        pattern,
        'COUNT',
        '100',
      );
      cursor = nextCursor;
      keys.push(...foundKeys);
    } while (cursor !== '0');

    return keys;
  }
}

export const cacheService = new CacheService();
