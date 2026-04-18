import { z } from 'zod';

export const createProductSchema = z.object({
  name: z
    .string({ required_error: 'Name is required' })
    .min(2, 'Name must be at least 2 characters')
    .max(200, 'Name must not exceed 200 characters')
    .trim(),
  price: z
    .number({ required_error: 'Price is required', invalid_type_error: 'Price must be a number' })
    .positive('Price must be a positive number')
    .multipleOf(0.01, 'Price can have at most 2 decimal places'),
  categoryId: z.string({ required_error: 'Category ID is required' }).min(1, 'Category ID is required'),
});

export const productQuerySchema = z.object({
  page: z.string().optional().default('1'),
  limit: z.string().optional().default('10'),
  categoryId: z.string().optional(),
});

export const productIdParamSchema = z.object({
  id: z.string().min(1, 'Product ID is required'),
});

export type CreateProductInput = z.infer<typeof createProductSchema>;
export type ProductQuery = z.infer<typeof productQuerySchema>;
export type ProductIdParam = z.infer<typeof productIdParamSchema>;
