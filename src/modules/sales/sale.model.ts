import { Schema, model } from 'mongoose';
import { ISale } from './sale.interface';

const saleItemSchema = new Schema(
  {
    product: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
    productName: { type: String, required: true },
    sku: { type: String, required: true },
    sellingPrice: { type: Number, required: true, min: 0 },
    quantity: { type: Number, required: true, min: 1 },
    lineTotal: { type: Number, required: true, min: 0 }
  },
  { _id: false }
);

const saleSchema = new Schema<ISale>(
  {
    customer: { type: Schema.Types.ObjectId, ref: 'Customer', required: true },
    items: { type: [saleItemSchema], required: true },
    grandTotal: { type: Number, required: true, min: 0 },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true }
  },
  { timestamps: true }
);

export const Sale = model<ISale>('Sale', saleSchema);
