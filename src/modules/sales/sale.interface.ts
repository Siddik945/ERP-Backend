import { Document, Types } from "mongoose";

export type ISaleItem = {
  product: Types.ObjectId;
  productName: string;
  sku: string;
  sellingPrice: number;
  quantity: number;
  lineTotal: number;
};

export interface ISale extends Document {
  customer: Types.ObjectId;
  items: ISaleItem[];
  grandTotal: number;
  createdBy: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}
