import { Request, Response, NextFunction } from 'express';
import { ApiResponse } from '../../core/response/ApiResponse';
import { categoryService } from './category.service';
import { CreateCategoryInput, CategoryQuery } from './category.schema';
import { getPaginationMeta } from '../../utils/pagination';

export class CategoryController {
  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const input = req.body as CreateCategoryInput;
      const category = await categoryService.create(input);
      ApiResponse.created(res, category, 'Category created successfully');
    } catch (error) {
      next(error);
    }
  }

  async getAll(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const query = req.query as unknown as CategoryQuery;
      const result = await categoryService.getAll(query);
      const { data, total, page, limit } = result;

      ApiResponse.success(
        res,
        data,
        'Categories retrieved successfully',
        200,
        getPaginationMeta(total, page, limit),
      );
    } catch (error) {
      next(error);
    }
  }
}

export const categoryController = new CategoryController();
