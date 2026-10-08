import { z } from 'zod';

export const signupSchema = z
  .object({
    full_name: z.string().min(2, 'Full name must be at least 2 characters').max(100),
    student_id: z.string().min(2, 'Student ID is required').max(50),
    email: z.string().email('Invalid email address'),
    department: z.string().min(1, 'Department is required'),
    batch: z.string().min(1, 'Batch is required'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    confirm_password: z.string().min(6, 'Confirm password is required'),
  })
  .refine((data) => data.password === data.confirm_password, {
    message: 'Passwords do not match',
    path: ['confirm_password'],
  });

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export type SignupInput = z.infer<typeof signupSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
