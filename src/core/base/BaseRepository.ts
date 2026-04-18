export interface FindManyOptions {
  skip?: number;
  take?: number;
  where?: Record<string, unknown>;
  orderBy?: Record<string, unknown>;
  include?: Record<string, unknown>;
}

export interface IRepository<T, CreateInput, UpdateInput> {
  findMany(options?: FindManyOptions): Promise<T[]>;
  findById(id: string, include?: Record<string, unknown>): Promise<T | null>;
  create(data: CreateInput): Promise<T>;
  update(id: string, data: UpdateInput): Promise<T>;
  delete(id: string): Promise<T>;
  count(where?: Record<string, unknown>): Promise<number>;
}
