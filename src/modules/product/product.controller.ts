import { Request, Response, NextFunction } from 'express';
import { ApiResponse } from '../../core/response/ApiResponse';
import { productService } from './product.service';
import { CreateProductInput, ProductQuery } from './product.schema';
import { getPaginationMeta } from '../../utils/pagination';

export class ProductController {
  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const input = req.body as CreateProductInput;
      const product = await productService.create(input);
      ApiResponse.created(res, product, 'Product created successfully');
    } catch (error) {
      next(error);
    }
  }

  async getAll(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const query = req.query as unknown as ProductQuery;
      const result = await productService.getAll(query);
      const { data, total, page, limit } = result;

      ApiResponse.success(
        res,
        data,
        'Products retrieved successfully',
        200,
        getPaginationMeta(total, page, limit),
      );
    } catch (error) {
      next(error);
    }
  }
}

export const productController = new ProductController();
