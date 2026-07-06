import { FilterQuery, Model, Query } from 'mongoose';

type QueryParams = Record<string, unknown>;

type PaginatedResult<T> = {
  data: T[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};

export class QueryBuilder<T> {
  private model: Model<T>;
  private query: QueryParams;
  private searchFields: string[];
  private filter: FilterQuery<T> = {};
  private mongooseQuery: Query<T[], T>;

  constructor(model: Model<T>, query: QueryParams, searchFields: string[] = []) {
    this.model = model;
    this.query = query;
    this.searchFields = searchFields;
    this.mongooseQuery = this.model.find(this.filter);
  }

  search() {
    const searchTerm = typeof this.query.search === 'string' ? this.query.search.trim() : '';
    if (searchTerm && this.searchFields.length) {
      this.filter.$or = this.searchFields.map((field) => ({
        [field]: { $regex: searchTerm, $options: 'i' }
      })) as FilterQuery<T>[];
    }
    this.mongooseQuery = this.model.find(this.filter);
    return this;
  }

  filterBy(allowedFields: string[] = []) {
    const filters: Record<string, unknown> = {};
    for (const key of allowedFields) {
      const value = this.query[key];
      if (value !== undefined && value !== '') filters[key] = value;
    }
    this.filter = { ...this.filter, ...filters };
    this.mongooseQuery = this.model.find(this.filter);
    return this;
  }

  sort() {
    const sortBy = typeof this.query.sortBy === 'string' ? this.query.sortBy : 'createdAt';
    const sortOrder = this.query.sortOrder === 'asc' ? '' : '-';
    this.mongooseQuery = this.mongooseQuery.sort(`${sortOrder}${sortBy}`);
    return this;
  }

  paginate() {
    const page = Math.max(Number(this.query.page || 1), 1);
    const limit = Math.min(Math.max(Number(this.query.limit || 10), 1), 100);
    const skip = (page - 1) * limit;
    this.mongooseQuery = this.mongooseQuery.skip(skip).limit(limit);
    return this;
  }

  async execute(): Promise<PaginatedResult<T>> {
    const page = Math.max(Number(this.query.page || 1), 1);
    const limit = Math.min(Math.max(Number(this.query.limit || 10), 1), 100);
    const [data, total] = await Promise.all([
      this.mongooseQuery.exec(),
      this.model.countDocuments(this.filter)
    ]);
    return {
      data,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit) || 1
      }
    };
  }
}
