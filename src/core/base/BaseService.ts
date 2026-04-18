import { NotFoundError, ConflictError } from '../errors';

export abstract class BaseService {
  protected ensureExists<T>(entity: T | null | undefined, entityName: string): T {
    if (entity === null || entity === undefined) {
      throw new NotFoundError(`${entityName} not found`);
    }
    return entity;
  }

  protected ensureUnique(condition: boolean, message: string): void {
    if (condition) {
      throw new ConflictError(message);
    }
  }

  protected ensureNotEmpty<T>(items: T[], entityName: string): T[] {
    if (items.length === 0) {
      throw new NotFoundError(`No ${entityName} found`);
    }
    return items;
  }
}
