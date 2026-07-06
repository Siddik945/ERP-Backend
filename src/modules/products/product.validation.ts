import { z } from 'zod';

const toNumber = z.preprocess((value) => {
  if (typeof value === 'string' && value.trim() !== '') return Number(value);
  return value;
}, z.number().nonnegative());

export const createProductValidation = z.object({
  body: z.object({
    productName: z.string().min(2),
    sku: z.string().min(2),
    category: z.string().min(2),
    purchasePrice: toNumber,
    sellingPrice: toNumber,
    stockQuantity: z.preprocess((value) => {
      if (typeof value === 'string' && value.trim() !== '') return Number(value);
      return value;
    }, z.number().int().nonnegative())
  })
});

export const updateProductValidation = z.object({
  body: z.object({
    productName: z.string().min(2).optional(),
    sku: z.string().min(2).optional(),
    category: z.string().min(2).optional(),
    purchasePrice: toNumber.optional(),
    sellingPrice: toNumber.optional(),
    stockQuantity: z.preprocess((value) => {
      if (typeof value === 'string' && value.trim() !== '') return Number(value);
      return value;
    }, z.number().int().nonnegative()).optional()
  })
});
