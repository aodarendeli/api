import { z } from 'zod';

export const createCategorySchema = z.object({
  name: z
    .string({ required_error: 'Name is required' })
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must not exceed 100 characters')
    .trim(),
});

export const categoryIdParamSchema = z.object({
  id: z.string().min(1, 'Category ID is required'),
});

export const categoryQuerySchema = z.object({
  page: z.string().optional().default('1'),
  limit: z.string().optional().default('10'),
});

export type CreateCategoryInput = z.infer<typeof createCategorySchema>;
export type CategoryIdParam = z.infer<typeof categoryIdParamSchema>;
export type CategoryQuery = z.infer<typeof categoryQuerySchema>;
