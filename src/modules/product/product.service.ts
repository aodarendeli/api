import { BaseService } from '../../core/base/BaseService';
import { CacheService } from '../../utils/cache';
import { NotFoundError } from '../../core/errors';
import { buildPaginatedResult, parsePagination, PaginatedResult } from '../../utils/pagination';
import { productRepository, ProductRepository, ProductWithCategory } from './product.repository';
import { categoryRepository } from '../category/category.repository';
import { CreateProductInput, ProductQuery } from './product.schema';
import { env } from '../../config/env';

export class ProductService extends BaseService {
  private readonly cache: CacheService;
  private readonly CACHE_ENTITY = 'products';

  constructor(private readonly repository: ProductRepository) {
    super();
    this.cache = new CacheService();
  }

  async getAll(query: ProductQuery): Promise<PaginatedResult<ProductWithCategory>> {
    const { skip, take, page, limit } = parsePagination(query);

    const where: Record<string, unknown> = {};
    if (query.categoryId) {
      where['categoryId'] = query.categoryId;
    }

    const cacheKeyParts: (string | number)[] = [
      this.CACHE_ENTITY,
      `page:${page}`,
      `limit:${limit}`,
    ];
    if (query.categoryId) cacheKeyParts.push(`category:${query.categoryId}`);

    const cacheKey = this.cache.buildKey(...cacheKeyParts);

    return this.cache.getOrSet(
      cacheKey,
      async () => {
        const [data, total] = await Promise.all([
          this.repository.findManyWithCategory({
            skip,
            take,
            where,
            orderBy: { createdAt: 'desc' },
          }),
          this.repository.count(where),
        ]);
        return buildPaginatedResult(data, total, page, limit);
      },
      env.REDIS_TTL,
      60, // stale-while-revalidate: refresh in background when < 60s remaining
    );
  }

  async create(input: CreateProductInput): Promise<ProductWithCategory> {
    const category = await categoryRepository.findById(input.categoryId);
    if (!category) {
      throw new NotFoundError(`Category with ID "${input.categoryId}" not found`);
    }

    const product = await this.repository.create(input);

    await this.cache.deleteByPattern(this.cache.buildKey(this.CACHE_ENTITY, '*'));

    const productWithCategory = await this.repository.findByIdWithCategory(product.id);
    return this.ensureExists(productWithCategory, 'Product');
  }
}

export const productService = new ProductService(productRepository);
