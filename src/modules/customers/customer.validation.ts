import { z } from 'zod';

export const createCustomerValidation = z.object({
  body: z.object({
    name: z.string().min(2),
    email: z.string().email().optional().or(z.literal('')),
    phone: z.string().optional(),
    address: z.string().optional()
  })
});

export const updateCustomerValidation = z.object({
  body: z.object({
    name: z.string().min(2).optional(),
    email: z.string().email().optional().or(z.literal('')),
    phone: z.string().optional(),
    address: z.string().optional()
  })
});
