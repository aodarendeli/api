import { Product, Prisma } from '@prisma/client';
import { prisma } from '../../config/database';
import { IRepository, FindManyOptions } from '../../core/base/BaseRepository';
import { CreateProductInput } from './product.schema';

type UpdateProductInput = Partial<CreateProductInput>;

export type ProductWithCategory = Prisma.ProductGetPayload<{
  include: { category: true };
}>;

export class ProductRepository
  implements IRepository<Product, CreateProductInput, UpdateProductInput>
{
  async findMany(options?: FindManyOptions): Promise<Product[]> {
    return prisma.product.findMany({
      skip: options?.skip,
      take: options?.take,
      where: options?.where as Prisma.ProductWhereInput,
      orderBy: options?.orderBy as Prisma.ProductOrderByWithRelationInput,
    });
  }

  async findManyWithCategory(options?: FindManyOptions): Promise<ProductWithCategory[]> {
    return prisma.product.findMany({
      skip: options?.skip,
      take: options?.take,
      where: options?.where as Prisma.ProductWhereInput,
      orderBy: options?.orderBy as Prisma.ProductOrderByWithRelationInput,
      include: { category: true },
    });
  }

  async findById(id: string): Promise<Product | null> {
    return prisma.product.findUnique({ where: { id } });
  }

  async findByIdWithCategory(id: string): Promise<ProductWithCategory | null> {
    return prisma.product.findUnique({
      where: { id },
      include: { category: true },
    });
  }

  async create(data: CreateProductInput): Promise<Product> {
    return prisma.product.create({
      data: {
        name: data.name,
        price: data.price,
        categoryId: data.categoryId,
      },
    });
  }

  async update(id: string, data: UpdateProductInput): Promise<Product> {
    return prisma.product.update({ where: { id }, data });
  }

  async delete(id: string): Promise<Product> {
    return prisma.product.delete({ where: { id } });
  }

  async count(where?: Record<string, unknown>): Promise<number> {
    return prisma.product.count({
      where: where as Prisma.ProductWhereInput,
    });
  }
}

export const productRepository = new ProductRepository();
