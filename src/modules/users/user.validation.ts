import { z } from 'zod';
import { UserRole } from '../../constants/roles';

export const createUserValidation = z.object({
  body: z.object({
    name: z.string().min(2),
    email: z.string().email(),
    password: z.string().min(8),
    role: z.nativeEnum(UserRole)
  })
});

export const updateUserValidation = z.object({
  body: z.object({
    name: z.string().min(2).optional(),
    role: z.nativeEnum(UserRole).optional(),
    isActive: z.boolean().optional()
  })
});
