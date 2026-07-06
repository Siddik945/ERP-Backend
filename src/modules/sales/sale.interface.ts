import { Document, Types } from 'mongoose';

export interface ISaleItem {
  product: Types.ObjectId;
  productName: string;
  sku: string;
  sellingPrice: number;
  quantity: number;
  lineTotal: number;
}

export interface ISale extends Document<Types.ObjectId> {
  customer: Types.ObjectId;
  items: ISaleItem[];
  grandTotal: number;
  createdBy: Types.ObjectId;
}
