import { Category } from '@prisma/client';
import { BaseService } from '../../core/base/BaseService';
import { CacheService } from '../../utils/cache';
import { buildPaginatedResult, parsePagination, PaginatedResult } from '../../utils/pagination';
import { categoryRepository, CategoryRepository } from './category.repository';
import { CreateCategoryInput, CategoryQuery } from './category.schema';
import { env } from '../../config/env';

export class CategoryService extends BaseService {
  private readonly cache: CacheService;
  private readonly CACHE_ENTITY = 'categories';

  constructor(private readonly repository: CategoryRepository) {
    super();
    this.cache = new CacheService();
  }

  async getAll(query: CategoryQuery): Promise<PaginatedResult<Category>> {
    const { skip, take, page, limit } = parsePagination(query);

    const cacheKey = this.cache.buildKey(this.CACHE_ENTITY, `page:${page}`, `limit:${limit}`);

    return this.cache.getOrSet(
      cacheKey,
      async () => {
        const [data, total] = await Promise.all([
          this.repository.findMany({ skip, take, orderBy: { createdAt: 'desc' } }),
          this.repository.count(),
        ]);
        return buildPaginatedResult(data, total, page, limit);
      },
      env.REDIS_TTL,
    );
  }

  async create(input: CreateCategoryInput): Promise<Category> {
    const existing = await this.repository.findByName(input.name);
    this.ensureUnique(existing !== null, `Category with name "${input.name}" already exists`);

    const category = await this.repository.create(input);

    await this.cache.deleteByPattern(this.cache.buildKey(this.CACHE_ENTITY, '*'));

    return category;
  }
}

export const categoryService = new CategoryService(categoryRepository);
