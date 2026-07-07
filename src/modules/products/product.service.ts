import path from "path";
import { cloudinary } from "../../config/cloudinary";
import { ApiError } from "../../utils/ApiError";
import { QueryBuilder } from "../../utils/queryBuilder";
import { IProduct } from "./product.interface";
import { Product } from "./product.model";

type CloudinaryUploadResult = {
  url: string;
  publicId: string;
};

const sanitizeFileName = (fileName: string) => {
  const ext = path.extname(fileName);
  const base = path.basename(fileName, ext);

  return base.replace(/[^a-zA-Z0-9-_]/g, "-").toLowerCase();
};

const uploadProductImageToCloudinary = async (
  file: Express.Multer.File,
): Promise<CloudinaryUploadResult> => {
  const base64Image = file.buffer.toString("base64");
  const dataUri = `data:${file.mimetype};base64,${base64Image}`;

  const result = await cloudinary.uploader.upload(dataUri, {
    folder: "mini-erp/products",
    public_id: `${Date.now()}-${sanitizeFileName(file.originalname)}`,
    resource_type: "image",
    transformation: [
      { width: 1000, height: 1000, crop: "limit" },
      { quality: "auto", fetch_format: "auto" },
    ],
  });

  return {
    url: result.secure_url,
    publicId: result.public_id,
  };
};

const deleteCloudinaryImage = async (publicId?: string) => {
  if (!publicId) return;

  try {
    await cloudinary.uploader.destroy(publicId);
  } catch {
    // Do not fail product update/delete only because old image deletion failed.
  }
};

const createProduct = async (
  payload: Partial<IProduct>,
  imageFile?: Express.Multer.File,
) => {
  if (!imageFile) {
    throw new ApiError(
      400,
      "Product image is required while creating a product",
    );
  }

  const uploadedImage = await uploadProductImageToCloudinary(imageFile);

  return Product.create({
    ...payload,
    productImage: uploadedImage.url,
    productImagePublicId: uploadedImage.publicId,
  });
};

const getProducts = async (query: Record<string, unknown>) => {
  return new QueryBuilder(Product, query, ["productName", "sku", "category"])
    .search()
    .filterBy(["category"])
    .sort()
    .paginate()
    .execute();
};

const getProductById = async (id: string) => {
  const product = await Product.findById(id);

  if (!product) {
    throw new ApiError(404, "Product not found");
  }

  return product;
};

const updateProduct = async (
  id: string,
  payload: Partial<IProduct>,
  imageFile?: Express.Multer.File,
) => {
  const existingProduct = await Product.findById(id);

  if (!existingProduct) {
    throw new ApiError(404, "Product not found");
  }

  const updatePayload: Partial<IProduct> = { ...payload };

  if (imageFile) {
    const uploadedImage = await uploadProductImageToCloudinary(imageFile);

    updatePayload.productImage = uploadedImage.url;
    updatePayload.productImagePublicId = uploadedImage.publicId;
  }

  const updatedProduct = await Product.findByIdAndUpdate(id, updatePayload, {
    new: true,
    runValidators: true,
  });

  if (!updatedProduct) {
    throw new ApiError(404, "Product not found");
  }

  if (imageFile && existingProduct.productImagePublicId) {
    await deleteCloudinaryImage(existingProduct.productImagePublicId);
  }

  return updatedProduct;
};

const deleteProduct = async (id: string) => {
  const product = await Product.findByIdAndDelete(id);

  if (!product) {
    throw new ApiError(404, "Product not found");
  }

  await deleteCloudinaryImage(product.productImagePublicId);

  return product;
};

export const ProductService = {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
};
