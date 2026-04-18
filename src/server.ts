// env MUST be the first import to initialize dotenv before all other modules
import { env } from './config/env';
import { createApp } from './app';
import { logger } from './utils/logger';
import { connectDatabase, disconnectDatabase } from './config/database';
import { connectRedis, disconnectRedis } from './config/redis';
import http from 'http';

async function bootstrap(): Promise<void> {
  await connectDatabase();
  await connectRedis();

  const app = createApp();
  const server = http.createServer(app);

  server.listen(env.PORT, () => {
    logger.info(
      {
        port: env.PORT,
        env: env.NODE_ENV,
        docs: `http://localhost:${env.PORT}/api-docs`,
        health: `http://localhost:${env.PORT}/health`,
      },
      `Server running on port ${env.PORT}`,
    );
  });

  const shutdown = (signal: string) => async (): Promise<void> => {
    logger.info({ signal }, 'Shutdown signal received, starting graceful shutdown...');

    server.close(async () => {
      logger.info('HTTP server closed');

      await Promise.allSettled([disconnectDatabase(), disconnectRedis()]);

      logger.info('Graceful shutdown complete');
      process.exit(0);
    });

    setTimeout(() => {
      logger.error('Forced shutdown after timeout');
      process.exit(1);
    }, 10_000).unref();
  };

  process.on('SIGTERM', shutdown('SIGTERM'));
  process.on('SIGINT', shutdown('SIGINT'));

  process.on('uncaughtException', (error) => {
    logger.fatal({ error: error.message, stack: error.stack }, 'Uncaught exception');
    process.exit(1);
  });

  process.on('unhandledRejection', (reason) => {
    logger.fatal({ reason }, 'Unhandled promise rejection');
    process.exit(1);
  });
}

bootstrap().catch((error: unknown) => {
  console.error('Failed to start server:', error);
  process.exit(1);
});
