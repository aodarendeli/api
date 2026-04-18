import { PrismaClient } from '@prisma/client';
import { env } from './env';
import { logger } from '../utils/logger';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createPrismaClient(): PrismaClient {
  return new PrismaClient({
    log: env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
  });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (env.NODE_ENV === 'development') {
  globalForPrisma.prisma = prisma;
  logger.debug('Using global Prisma instance (development mode)');
}

export async function connectDatabase(): Promise<void> {
  console.log('Connecting to database...', env);

  await prisma.$connect();
  logger.info('Database connected successfully');
}

export async function disconnectDatabase(): Promise<void> {
  await prisma.$disconnect();
  logger.info('Database disconnected');
}
