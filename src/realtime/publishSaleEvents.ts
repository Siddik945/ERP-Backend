import { Product } from "../modules/products/product.model";
import { emitLowStock, emitSaleCreated } from "./socket";

type SaleRealtimeInput = {
  saleId: string;
  customerId: string;
  grandTotal: number;
  productIds: string[];
  createdAt?: Date | string;
};

export const publishSaleRealtimeEvents = async ({
  saleId,
  customerId,
  grandTotal,
  productIds,
  createdAt,
}: SaleRealtimeInput): Promise<void> => {
  emitSaleCreated({
    saleId,
    customerId,
    grandTotal,
    createdAt: createdAt
      ? new Date(createdAt).toISOString()
      : new Date().toISOString(),
  });

  const lowStockProducts = await Product.find({
    _id: {
      $in: productIds,
    },
    stockQuantity: {
      $lt: 5,
    },
  })
    .select("_id productName sku stockQuantity")
    .lean();

  emitLowStock({
    products: lowStockProducts.map((product) => ({
      productId: String(product._id),
      productName: product.productName,
      sku: product.sku,
      stockQuantity: product.stockQuantity,
    })),
    createdAt: new Date().toISOString(),
  });
};
