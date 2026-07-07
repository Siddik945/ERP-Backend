import { Document, Types } from "mongoose";

export interface IProduct extends Document<Types.ObjectId> {
  productName: string;
  sku: string;
  category: string;
  purchasePrice: number;
  sellingPrice: number;
  stockQuantity: number;
  productImage: string;
  productImagePublicId?: string;
}
