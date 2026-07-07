import { RequestHandler } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { ProductService } from "./product.service";

const createProduct: RequestHandler = catchAsync(async (req, res) => {
  const result = await ProductService.createProduct(req.body, req.file);

  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: "Product created successfully",
    data: result,
  });
});

const getProducts: RequestHandler = catchAsync(async (req, res) => {
  const result = await ProductService.getProducts(req.query);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Products retrieved successfully",
    data: result.data,
    meta: result.meta,
  });
});

const getProductById: RequestHandler = catchAsync(async (req, res) => {
  const result = await ProductService.getProductById(req.params.id);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Product retrieved successfully",
    data: result,
  });
});

const updateProduct: RequestHandler = catchAsync(async (req, res) => {
  const result = await ProductService.updateProduct(
    req.params.id,
    req.body,
    req.file,
  );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Product updated successfully",
    data: result,
  });
});

const deleteProduct: RequestHandler = catchAsync(async (req, res) => {
  const result = await ProductService.deleteProduct(req.params.id);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Product deleted successfully",
    data: result,
  });
});

export const ProductController = {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
};
