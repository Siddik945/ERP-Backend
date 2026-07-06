import { ApiError } from '../../utils/ApiError';
import { QueryBuilder } from '../../utils/queryBuilder';
import { IProduct } from './product.interface';
import { Product } from './product.model';

const createProduct = async (payload: Partial<IProduct>, imagePath?: string) => {
  if (!imagePath) {
    throw new ApiError(400, 'Product image is required while creating a product');
  }
  return Product.create({ ...payload, productImage: imagePath });
};

const getProducts = async (query: Record<string, unknown>) => {
  return new QueryBuilder(Product, query, ['productName', 'sku', 'category'])
    .search()
    .filterBy(['category'])
    .sort()
    .paginate()
    .execute();
};

const getProductById = async (id: string) => {
  const product = await Product.findById(id);
  if (!product) throw new ApiError(404, 'Product not found');
  return product;
};

const updateProduct = async (id: string, payload: Partial<IProduct>, imagePath?: string) => {
  const updatePayload = imagePath ? { ...payload, productImage: imagePath } : payload;
  const product = await Product.findByIdAndUpdate(id, updatePayload, { new: true, runValidators: true });
  if (!product) throw new ApiError(404, 'Product not found');
  return product;
};

const deleteProduct = async (id: string) => {
  const product = await Product.findByIdAndDelete(id);
  if (!product) throw new ApiError(404, 'Product not found');
  return product;
};

export const ProductService = { createProduct, getProducts, getProductById, updateProduct, deleteProduct };
