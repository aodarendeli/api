import swaggerJsdoc from 'swagger-jsdoc';
import { env } from './env';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Enterprise Backend API',
      version: '1.0.0',
      description: 'Production-ready Enterprise Backend API Documentation',
      contact: {
        name: 'API Support',
        email: 'support@enterprise.com',
      },
    },
    servers: [
      {
        url: `http://localhost:${env.PORT}`,
        description: 'Development server',
      },
    ],
    components: {
      schemas: {
        ApiResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            message: { type: 'string', example: 'Success' },
            data: { type: 'object' },
            meta: { $ref: '#/components/schemas/PaginationMeta' },
          },
        },
        PaginationMeta: {
          type: 'object',
          properties: {
            total: { type: 'integer', example: 100 },
            page: { type: 'integer', example: 1 },
            limit: { type: 'integer', example: 10 },
            totalPages: { type: 'integer', example: 10 },
          },
        },
        Category: {
          type: 'object',
          properties: {
            id: { type: 'string', example: 'clfq2m9xs0000ld08d8z5j0z2' },
            name: { type: 'string', example: 'Electronics' },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },
        Product: {
          type: 'object',
          properties: {
            id: { type: 'string', example: 'clfq2m9xs0001ld08d8z5j0z3' },
            name: { type: 'string', example: 'Laptop Pro' },
            price: { type: 'number', format: 'float', example: 999.99 },
            categoryId: { type: 'string', example: 'clfq2m9xs0000ld08d8z5j0z2' },
            category: { $ref: '#/components/schemas/Category' },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },
        CreateCategoryInput: {
          type: 'object',
          required: ['name'],
          properties: {
            name: {
              type: 'string',
              minLength: 2,
              maxLength: 100,
              example: 'Electronics',
            },
          },
        },
        CreateProductInput: {
          type: 'object',
          required: ['name', 'price', 'categoryId'],
          properties: {
            name: {
              type: 'string',
              minLength: 2,
              maxLength: 200,
              example: 'Laptop Pro 16"',
            },
            price: {
              type: 'number',
              minimum: 0,
              example: 999.99,
            },
            categoryId: {
              type: 'string',
              example: 'clfq2m9xs0000ld08d8z5j0z2',
            },
          },
        },
        ErrorResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            message: { type: 'string', example: 'Validation failed' },
            errors: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  field: { type: 'string', example: 'name' },
                  message: { type: 'string', example: 'Name is required' },
                },
              },
            },
          },
        },
      },
    },
    tags: [
      { name: 'Health', description: 'Health check endpoints' },
      { name: 'Categories', description: 'Category management' },
      { name: 'Products', description: 'Product management' },
    ],
  },
  apis: [
    './src/modules/**/*.routes.ts',
    './src/modules/health/*.ts',
  ],
};

export const swaggerSpec = swaggerJsdoc(options);
