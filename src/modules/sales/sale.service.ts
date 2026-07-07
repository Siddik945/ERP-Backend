import { Types } from "mongoose";

import { publishSaleRealtimeEvents } from "../../realtime/publishSaleEvents";
import { ApiError } from "../../utils/ApiError";
import { Customer } from "../customers/customer.model";
import { Product } from "../products/product.model";
import { Sale } from "./sale.model";

type CreateSalePayload = {
  customer: string;
  products: {
    product: string;
    quantity: number;
  }[];
};

type DecrementedStockItem = {
  product: Types.ObjectId;
  quantity: number;
};

/**
 * Restores product stock when sale creation fails.
 *
 * This is used because local/standalone MongoDB does not support
 * transactions unless it is configured as a replica set.
 */
const restoreProductStock = async (
  items: DecrementedStockItem[],
): Promise<void> => {
  if (!items.length) return;

  try {
    await Product.bulkWrite(
      items.map((item) => ({
        updateOne: {
          filter: {
            _id: item.product,
          },
          update: {
            $inc: {
              stockQuantity: item.quantity,
            },
          },
        },
      })),
    );
  } catch (rollbackError) {
    console.error("Failed to restore product stock:", rollbackError);
  }
};

const createSale = async (payload: CreateSalePayload, createdBy: string) => {
  if (!Types.ObjectId.isValid(payload.customer)) {
    throw new ApiError(400, "Invalid customer ID");
  }

  if (!Types.ObjectId.isValid(createdBy)) {
    throw new ApiError(400, "Invalid user ID");
  }

  if (!Array.isArray(payload.products) || payload.products.length === 0) {
    throw new ApiError(400, "At least one product is required");
  }

  /*
   * Merge duplicate products.
   *
   * Example:
   * Product A quantity 2
   * Product A quantity 3
   *
   * Final quantity becomes 5.
   */
  const mergedProducts = payload.products.reduce<Record<string, number>>(
    (result, item) => {
      if (!Types.ObjectId.isValid(item.product)) {
        throw new ApiError(400, `Invalid product ID: ${item.product}`);
      }

      if (!Number.isInteger(item.quantity) || item.quantity <= 0) {
        throw new ApiError(400, "Product quantity must be a positive integer");
      }

      result[item.product] = (result[item.product] || 0) + item.quantity;

      return result;
    },
    {},
  );

  const customer = await Customer.findById(payload.customer);

  if (!customer) {
    throw new ApiError(404, "Customer not found");
  }

  const productIds = Object.keys(mergedProducts);

  const products = await Product.find({
    _id: {
      $in: productIds,
    },
  });

  if (products.length !== productIds.length) {
    throw new ApiError(404, "One or more products were not found");
  }

  const items = products.map((product) => {
    const quantity = mergedProducts[product._id.toString()];

    if (product.stockQuantity < quantity) {
      throw new ApiError(
        400,
        `Insufficient stock for ${product.productName}. ` +
          `Available: ${product.stockQuantity}, requested: ${quantity}`,
      );
    }

    return {
      product: product._id,
      productName: product.productName,
      sku: product.sku,
      sellingPrice: product.sellingPrice,
      quantity,
      lineTotal: product.sellingPrice * quantity,
    };
  });

  const grandTotal = items.reduce((total, item) => total + item.lineTotal, 0);

  /*
   * Products whose stock has successfully been reduced.
   * If something fails before creating the sale, these quantities
   * will be restored.
   */
  const decrementedItems: DecrementedStockItem[] = [];

  try {
    /*
     * Reduce stock one product at a time.
     *
     * findOneAndUpdate with $gte prevents negative stock when
     * multiple users create sales at the same time.
     */
    for (const item of items) {
      const updatedProduct = await Product.findOneAndUpdate(
        {
          _id: item.product,
          stockQuantity: {
            $gte: item.quantity,
          },
        },
        {
          $inc: {
            stockQuantity: -item.quantity,
          },
        },
        {
          new: true,
        },
      );

      if (!updatedProduct) {
        throw new ApiError(
          409,
          `Stock for ${item.productName} changed while creating the sale. Please try again.`,
        );
      }

      decrementedItems.push({
        product: item.product,
        quantity: item.quantity,
      });
    }
  } catch (error) {
    await restoreProductStock(decrementedItems);
    throw error;
  }

  let createdSale;

  try {
    createdSale = await Sale.create({
      customer: new Types.ObjectId(payload.customer),
      items,
      grandTotal,
      createdBy: new Types.ObjectId(createdBy),
    });
  } catch (error) {
    /*
     * Sale was not created, so restore all reduced stock.
     */
    await restoreProductStock(decrementedItems);
    throw error;
  }

  /*
   * Socket notification is not part of the database operation.
   * If Socket.IO fails, the sale should still remain successful.
   */
  try {
    await publishSaleRealtimeEvents({
      saleId: createdSale._id.toString(),
      customerId: createdSale.customer.toString(),
      grandTotal: createdSale.grandTotal,
      productIds: createdSale.items.map((item) => item.product.toString()),
      createdAt: createdSale.createdAt,
    });
  } catch (socketError) {
    console.error("Failed to publish real-time sale events:", socketError);
  }

  await createdSale.populate([
    {
      path: "customer",
    },
    {
      path: "createdBy",
      select: "name email role",
    },
    {
      path: "items.product",
      select:
        "productName sku category sellingPrice stockQuantity productImage",
    },
  ]);

  return createdSale;
};

const getSales = async (query: Record<string, unknown>) => {
  const page = Math.max(Number(query.page || 1), 1);

  const limit = Math.min(Math.max(Number(query.limit || 10), 1), 100);

  const skip = (page - 1) * limit;

  const [data, total] = await Promise.all([
    Sale.find()
      .populate("customer")
      .populate("createdBy", "name email role")
      .populate(
        "items.product",
        "productName sku category sellingPrice stockQuantity productImage",
      )
      .sort({
        createdAt: -1,
      })
      .skip(skip)
      .limit(limit),

    Sale.countDocuments(),
  ]);

  return {
    data,
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit) || 1,
    },
  };
};

export const SaleService = {
  createSale,
  getSales,
};
