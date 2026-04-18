import { Category, Prisma } from '@prisma/client';
import { prisma } from '../../config/database';
import { IRepository, FindManyOptions } from '../../core/base/BaseRepository';
import { CreateCategoryInput } from './category.schema';

type UpdateCategoryInput = Partial<CreateCategoryInput>;

export class CategoryRepository
  implements IRepository<Category, CreateCategoryInput, UpdateCategoryInput>
{
  async findMany(options?: FindManyOptions): Promise<Category[]> {
    return prisma.category.findMany({
      skip: options?.skip,
      take: options?.take,
      where: options?.where as Prisma.CategoryWhereInput,
      orderBy: options?.orderBy as Prisma.CategoryOrderByWithRelationInput,
    });
  }

  async findById(id: string): Promise<Category | null> {
    return prisma.category.findUnique({ where: { id } });
  }

  async findByName(name: string): Promise<Category | null> {
    return prisma.category.findUnique({ where: { name } });
  }

  async create(data: CreateCategoryInput): Promise<Category> {
    return prisma.category.create({ data });
  }

  async update(id: string, data: UpdateCategoryInput): Promise<Category> {
    return prisma.category.update({ where: { id }, data });
  }

  async delete(id: string): Promise<Category> {
    return prisma.category.delete({ where: { id } });
  }

  async count(where?: Record<string, unknown>): Promise<number> {
    return prisma.category.count({
      where: where as Prisma.CategoryWhereInput,
    });
  }
}

export const categoryRepository = new CategoryRepository();
