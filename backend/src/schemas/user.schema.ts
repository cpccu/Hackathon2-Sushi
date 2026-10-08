import { z } from 'zod';

export const updateProfileSchema = z.object({
  full_name: z.string().min(2, 'Full name must be at least 2 characters').max(100).optional(),
  email: z.string().email('Invalid email address').optional(),
  department: z.string().min(1, 'Department cannot be empty').optional(),
  batch: z.string().min(1, 'Batch cannot be empty').optional(),
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
