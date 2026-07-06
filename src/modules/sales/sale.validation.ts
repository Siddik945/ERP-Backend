import { z } from 'zod';

export const createSaleValidation = z.object({
  body: z.object({
    customer: z.string().min(1),
    products: z.array(
      z.object({
        product: z.string().min(1),
        quantity: z.number().int().positive()
      })
    ).min(1)
  })
});
