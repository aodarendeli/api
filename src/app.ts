import express, { Application, Request, Response } from 'express';
import swaggerUi from 'swagger-ui-express';
import { loggerMiddleware } from './middlewares/logger.middleware';
import { requestIdMiddleware } from './middlewares/requestId.middleware';
import { rateLimiter } from './middlewares/rateLimiter.middleware';
import { errorMiddleware } from './middlewares/error.middleware';
import { swaggerSpec } from './config/swagger';
import { ApiResponse } from './core/response/ApiResponse';
import routes from './routes';
export function createApp(): Application {
  const app = express();

  app.disable('x-powered-by');
  app.set('trust proxy', 1);

  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  app.use(requestIdMiddleware);
  app.use(loggerMiddleware);
  app.use(rateLimiter);

  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
    customSiteTitle: 'Enterprise Backend API',
    swaggerOptions: { persistAuthorization: true },
  }));

  app.get('/api-docs.json', (_req: Request, res: Response) => {
    res.setHeader('Content-Type', 'application/json');
    res.json(swaggerSpec);
  });

  app.use(routes);

  app.use((_req: Request, res: Response) => {
    ApiResponse.error(res, 'Route not found', 404);
  });

  app.use(errorMiddleware);

  return app;
}
