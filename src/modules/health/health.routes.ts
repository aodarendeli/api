import { Router, Request, Response } from 'express';
import { prisma } from '../../config/database';
import { redisClient } from '../../config/redis';
import { ApiResponse } from '../../core/response/ApiResponse';

const router: Router = Router();

/**
 * @swagger
 * /health:
 *   get:
 *     summary: Service health check
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: Service is healthy
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: object
 *                       properties:
 *                         uptime:
 *                           type: number
 *                         timestamp:
 *                           type: string
 *                         responseTime:
 *                           type: number
 *                         services:
 *                           type: object
 *       503:
 *         description: Service is degraded
 */
router.get('/', async (_req: Request, res: Response) => {
  const startTime = Date.now();

  const [dbStatus, redisStatus] = await Promise.allSettled([
    prisma.$queryRaw`SELECT 1`,
    redisClient.ping(),
  ]);

  const health = {
    uptime: Math.floor(process.uptime()),
    timestamp: new Date().toISOString(),
    responseTimeMs: Date.now() - startTime,
    services: {
      database: {
        status: dbStatus.status === 'fulfilled' ? 'healthy' : 'unhealthy',
        ...(dbStatus.status === 'rejected' && {
          error: (dbStatus.reason as Error).message,
        }),
      },
      redis: {
        status: redisStatus.status === 'fulfilled' ? 'healthy' : 'unhealthy',
        ...(redisStatus.status === 'rejected' && {
          error: (redisStatus.reason as Error).message,
        }),
      },
    },
  };

  const isHealthy = Object.values(health.services).every((s) => s.status === 'healthy');
  const statusCode = isHealthy ? 200 : 503;
  const message = isHealthy ? 'Service is healthy' : 'Service is degraded';

  ApiResponse.success(res, health, message, statusCode);
});

export default router;
