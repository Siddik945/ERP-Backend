import { Schema, model } from "mongoose";
import { IProduct } from "./product.interface";

const productSchema = new Schema<IProduct>(
  {
    productName: { type: String, required: true, trim: true },
    sku: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true,
    },
    category: { type: String, required: true, trim: true },
    purchasePrice: { type: Number, required: true, min: 0 },
    sellingPrice: { type: Number, required: true, min: 0 },
    stockQuantity: { type: Number, required: true, min: 0 },
    productImage: { type: String, required: true },
    productImagePublicId: { type: String },
  },
  { timestamps: true },
);

export const Product = model<IProduct>("Product", productSchema);
