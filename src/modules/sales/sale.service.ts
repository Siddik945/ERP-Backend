import mongoose, { Types } from "mongoose";
import { ApiError } from "../../utils/ApiError";
import { Customer } from "../customers/customer.model";
import { Product } from "../products/product.model";
import { Sale } from "./sale.model";

type CreateSalePayload = {
  customer: string;
  products: { product: string; quantity: number }[];
};

const createSale = async (payload: CreateSalePayload, createdBy: string) => {
  // const session = await mongoose.startSession();
  // session.startTransaction();

  try {
    const customer = await Customer.findById(payload.customer);
    if (!customer) throw new ApiError(404, "Customer not found");

    const mergedProducts = payload.products.reduce<Record<string, number>>(
      (acc, item) => {
        acc[item.product] = (acc[item.product] || 0) + item.quantity;
        return acc;
      },
      {},
    );

    const productIds = Object.keys(mergedProducts);
    const products = await Product.find({ _id: { $in: productIds } });

    if (products.length !== productIds.length) {
      throw new ApiError(404, "One or more products were not found");
    }

    const items = products.map((product) => {
      const quantity = mergedProducts[product._id.toString()];
      if (product.stockQuantity < quantity) {
        throw new ApiError(
          400,
          `Insufficient stock for ${product.productName}. Available: ${product.stockQuantity}, requested: ${quantity}`,
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

    const updateResult = await Product.bulkWrite(
      items.map((item) => ({
        updateOne: {
          filter: { _id: item.product, stockQuantity: { $gte: item.quantity } },
          update: { $inc: { stockQuantity: -item.quantity } },
        },
      })),
    );

    if (updateResult.modifiedCount !== items.length) {
      throw new ApiError(
        409,
        "Stock changed while creating sale. Please try again.",
      );
    }

    const grandTotal = items.reduce((sum, item) => sum + item.lineTotal, 0);
    const [sale] = await Sale.create([
      {
        customer: new Types.ObjectId(payload.customer),
        items,
        grandTotal,
        createdBy: new Types.ObjectId(createdBy),
      },
    ]);

    // await session.commitTransaction();
    return sale.populate(["customer", "createdBy"]);
  } catch (error) {
    // await session.abortTransaction();
    throw error;
  } finally {
    // await session.endSession();
  }
};

const getSales = async (query: Record<string, unknown>) => {
  const page = Math.max(Number(query.page || 1), 1);
  const limit = Math.min(Math.max(Number(query.limit || 10), 1), 100);
  const skip = (page - 1) * limit;
  const [data, total] = await Promise.all([
    Sale.find()
      .populate("customer")
      .populate("createdBy", "name email role")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Sale.countDocuments(),
  ]);

  return {
    data,
    meta: { page, limit, total, totalPages: Math.ceil(total / limit) || 1 },
  };
};

export const SaleService = { createSale, getSales };
